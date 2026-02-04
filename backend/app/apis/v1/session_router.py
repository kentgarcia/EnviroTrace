# app/apis/v1/session_router.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid

from app.apis.deps import get_db_session, require_roles
from app.crud.crud_session import session_crud
from app.crud.crud_user import user as crud_user
from app.core import supabase_client
from app.schemas.session_schemas import (
    SessionPublic,
    SessionWithUser,
    SessionTerminateRequest,
    SessionListFilter,
    UserSuspendRequest,
    UserUnsuspendRequest
)
from app.models.auth_models import User, DeviceTypeEnum
from sqlalchemy import select

router = APIRouter()


@router.get("/sessions", response_model=List[SessionWithUser])
async def get_all_sessions(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"])),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    device_type: Optional[DeviceTypeEnum] = Query(None),
    is_active: Optional[bool] = Query(True, description="Filter by active status. True=active only, False=inactive only, null=all sessions")
):
    """Get all user sessions (admin only). By default, shows only active sessions."""
    sessions = await session_crud.get_all_sessions_with_users(
        db,
        skip=skip,
        limit=limit,
        device_type=device_type,
        is_active=is_active
    )
    
    # Transform to SessionWithUser format
    result = []
    for session in sessions:
        session_data = {
            "id": session.id,
            "user_id": session.user_id,
            "session_token": session.supabase_session_id,  # Use supabase_session_id, not session_token
            "device_type": session.device_type,
            "device_name": session.device_name,
            "ip_address": str(session.ip_address) if session.ip_address else None,
            "user_agent": session.user_agent,
            "is_active": session.is_active,
            "created_at": session.created_at,
            "last_activity_at": session.last_activity_at,
            "expires_at": session.expires_at,
            "ended_at": session.ended_at,
            "termination_reason": session.termination_reason,
            "user_email": session.user.email if session.user else None,
            "user_profile": {
                "first_name": session.user.profile.first_name if session.user and session.user.profile else None,
                "last_name": session.user.profile.last_name if session.user and session.user.profile else None,
            }
        }
        result.append(session_data)
    
    return result


@router.get("/sessions/user/{user_id}", response_model=List[SessionPublic])
async def get_user_sessions(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"])),
    active_only: bool = Query(False),
    device_type: Optional[DeviceTypeEnum] = Query(None)
):
    """Get sessions for a specific user (admin only)"""
    sessions = await session_crud.get_user_sessions(
        db,
        user_id=user_id,
        active_only=active_only,
        device_type=device_type
    )
    return sessions


@router.post("/sessions/terminate")
async def terminate_session_revoke_access(
    terminate_request: SessionTerminateRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"]))
):
    """
    Terminate a specific session and temporarily revoke user access (admin only).
    This will:
    1. Terminate ALL user sessions (not just one)
    2. Suspend the user account temporarily (can be unsuspended)
    3. Delete user from Supabase Auth (invalidates all tokens)
    
    Note: This is for temporary access revocation. For permanent account removal,
    first archive the user, then use the permanent suspension endpoint.
    """
    # Get the session to find the user
    session = await session_crud.get(db, id=terminate_request.session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    user_id = session.user_id
    reason = terminate_request.reason or "Session terminated by admin"
    
    # Get the user to access their supabase_user_id
    user_obj = await crud_user.get(db, id=user_id)
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from suspending themselves
    if user_obj.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot suspend your own account"
        )
    
    # Prevent suspending super admins (unless current user is also super admin)
    if user_obj.is_super_admin and not current_user.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot suspend super admin accounts"
        )
    
    try:
        # 1. Terminate all user sessions
        await session_crud.terminate_all_user_sessions(
            db,
            user_id=user_id,
            reason=f"Account suspended: {reason}"
        )
        
        # 2. Suspend user account in local database
        await crud_user.suspend_user(
            db,
            user_id=user_id,
            suspended_by_user_id=current_user.id,
            reason=reason
        )
        
        # 3. Delete user from Supabase Auth (invalidates all Supabase tokens)
        if user_obj.supabase_user_id:
            await supabase_client.admin_delete_user(str(user_obj.supabase_user_id))
        
        return {
            "message": f"User access temporarily revoked and all sessions terminated",
            "user_id": str(user_id),
            "email": user_obj.email,
            "reason": reason,
            "suspended_at": user_obj.suspended_at,
            "note": "User can be unsuspended by admin to restore access"
        }
        
    except Exception as e:
        # Rollback if anything fails
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to suspend user: {str(e)}"
        )


@router.potemporarily_suspend_user_account(
    user_id: uuid.UUID,
    suspend_request: UserSuspendRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"]))
):
    """
    Temporarily suspend user account and terminate all sessions (admin only).
    This is reversible - admin can unsuspend later to restore access.
    
    For permanent account removal: archive user first, then use permanent suspension
    Alternative to terminate_session endpoint when you have user_id directly.
    """
    # Get the user
    user_obj = await crud_user.get(db, id=user_id)
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from suspending themselves
    if user_obj.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot suspend your own account"
        )
    
    # Prevent suspending super admins (unless current user is also super admin)
    if user_obj.is_super_admin and not current_user.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot suspend super admin accounts"
        )
    
    try:
        # 1. Terminate all user sessions
        session_count = await session_crud.terminate_all_user_sessions(
            db,
            user_id=user_id,
            reason=f"Account suspended: {suspend_request.reason}"
        )
        
        # 2. Suspend user account in local database
        await crud_user.suspend_user(
            db,
            user_id=user_id,
            suspended_by_user_id=current_user.id,
            reason=suspend_request.reason
        )
        
        # 3. Delete user from Supabase Auth (invalidates all Supabase tokens)
        if user_obj.supabase_user_id:
            await supabase_client.admin_delete_user(str(user_obj.supabase_user_id))
        
        await db.commit()
        
        return {
            "message": "User temporarily suspended successfully",
            "user_id": str(user_id),
            "email": user_obj.email,
            "sessions_terminated": session_count,
            "reason": suspend_request.reason,
            "suspended_at": user_obj.suspended_at,
            "note": "This is reversible - use unsuspend endpoint to restore access"
        }
        
    except Exception as e:
        # Rollback if anything fails
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to suspend user: {str(e)}"
        )


@router.get("/sessions/me", response_model=List[SessionPublic])
async def get_my_sessions(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin", "urban_greening", "government_emission"]))
):
    """Get current user's sessions"""
    sessions = await session_crud.get_user_sessions(
        db,
        user_id=current_user.id,
        active_only=False
    )
    return sessions


@router.post("/sessions/unsuspend/{user_id}")
async def unsuspend_user_account(
    user_id: uuid.UUID,
    unsuspend_request: UserUnsuspendRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"]))
):
    """
    Unsuspend a temporarily suspended user account (admin only).
    This restores access for users suspended via session termination.
    
    IMPORTANT: This only works for temporarily suspended users.
    Permanently suspended users (archived then deleted) CANNOT be reactivated.
    """
    
    # Get the user (including archived ones to check suspension type)
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user_obj = result.scalar_one_or_none()
    
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is suspended
    if not user_obj.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is not suspended"
        )
    
    # Check if this is a permanent suspension (archived + suspended)
    if user_obj.deleted_at and user_obj.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot unsuspend permanently deleted users. This action is irreversible."
        )
    
    try:
        # 1. Recreate user in Supabase Auth with temporary password
        supabase_response = await supabase_client.admin_create_user(
            email=user_obj.email,
            password=unsuspend_request.temporary_password,
            email_confirmed=True
        )
        
        # Update supabase_user_id if it changed
        new_supabase_id = supabase_response["user"].id
        user_obj.supabase_user_id = uuid.UUID(new_supabase_id)
        
        # 2. Unsuspend user account in local database
        await crud_user.unsuspend_user(db, user_id=user_id)
        
        await db.commit()
        await db.refresh(user_obj)
        
        return {
            "message": "User account unsuspended successfully",
            "user_id": str(user_id),
            "email": user_obj.email,
            "temporary_password": unsuspend_request.temporary_password,
            "note": "Provide the temporary password to the user for login"
        }
        
    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unsuspend user: {str(e)}"
        )