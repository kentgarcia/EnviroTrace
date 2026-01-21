# app/apis/v1/session_router.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid

from app.apis.deps import get_db_session, require_roles
from app.crud.crud_session import session_crud
from app.schemas.session_schemas import (
    SessionPublic,
    SessionWithUser,
    SessionTerminateRequest,
    SessionListFilter
)
from app.models.auth_models import User, UserRoleEnum, DeviceTypeEnum

router = APIRouter()


@router.get("/sessions", response_model=List[SessionWithUser])
async def get_all_sessions(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles([UserRoleEnum.admin])),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    device_type: Optional[DeviceTypeEnum] = Query(None),
    is_active: Optional[bool] = Query(None)
):
    """Get all user sessions (admin only)"""
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
            "session_token": session.session_token,
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
    current_user: User = Depends(require_roles([UserRoleEnum.admin])),
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


@router.post("/sessions/terminate", response_model=SessionPublic)
async def terminate_session(
    terminate_request: SessionTerminateRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles([UserRoleEnum.admin]))
):
    """Terminate a specific session (admin only)"""
    session = await session_crud.terminate_session(
        db,
        session_id=terminate_request.session_id,
        reason=terminate_request.reason or "Admin terminated"
    )
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    return session


@router.post("/sessions/terminate-all/{user_id}")
async def terminate_all_user_sessions(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles([UserRoleEnum.admin])),
    reason: str = Query("All sessions terminated by admin")
):
    """Terminate all sessions for a user (admin only)"""
    count = await session_crud.terminate_all_user_sessions(
        db,
        user_id=user_id,
        reason=reason
    )
    
    return {
        "message": f"Terminated {count} session(s)",
        "count": count
    }


@router.get("/sessions/me", response_model=List[SessionPublic])
async def get_my_sessions(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles([UserRoleEnum.admin, UserRoleEnum.urban_greening, UserRoleEnum.government_emission]))
):
    """Get current user's sessions"""
    sessions = await session_crud.get_user_sessions(
        db,
        user_id=current_user.id,
        active_only=False
    )
    return sessions
