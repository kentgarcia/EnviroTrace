from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc, delete
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from app.apis.deps import get_current_user_async, get_db_session, require_roles, require_super_admin
from app.models.auth_models import User, UserRoleMapping, Profile, Role
from app.schemas.user_schemas import (
    UserCreate, UserUpdate, UserPublic, UserWithProfile, UserWithRoles, 
    UserRoleMappingCreate, UserFullPublic
)
from app.schemas.session_schemas import (
    UserUnsuspendRequest,
    PasswordResetResponse
)
from app.schemas.permission_schemas import (
    PermissionPublic,
    RoleWithPermissions,
    RolePermissionBulkAssign,
    UserPermissionsResponse,
    RolePublic,
    RoleCreate,
    RoleUpdate,
)
from app.services.auth_service import auth_service
from app.services.system_health_service import SystemHealthService
from app.services.permission_service import permission_service
from app.crud.crud_role import role_crud
from app.crud.crud_user import user as crud_user
from app.crud.crud_session import session_crud
from app.core import supabase_client
import secrets
import string

router = APIRouter()

# Admin Dashboard Stats
@router.get("/dashboard/stats")
async def get_admin_dashboard_stats(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"]))
):
    """Get admin dashboard statistics"""
    
    # Get user statistics from the service
    user_stats = await SystemHealthService.get_user_statistics(db)
    
    # Get real system uptime
    system_uptime = SystemHealthService.get_system_uptime()
    
    # Total roles count
    total_roles_result = await db.execute(
        select(func.count(func.distinct(UserRoleMapping.role_id)))
    )
    total_roles = total_roles_result.scalar() or 0
    
    return {
        "totalUsers": user_stats["total_users"],
        "activeUsers": user_stats["active_users"],
        "totalRoles": total_roles,
        "systemUptime": system_uptime,
        "totalSessions": user_stats["active_sessions"],
        "failedLogins": user_stats["failed_logins"]
    }

@router.get("/dashboard/user-activity")
async def get_user_activity_data(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"]))
):
    """Get user activity data for charts"""
    
    # Get real user activity data from the service
    return await SystemHealthService.get_user_activity_data(db)

@router.get("/dashboard/system-health")
async def get_system_health_data(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"]))
):
    """Get system health metrics"""
    
    # Get real system health metrics from the service
    return SystemHealthService.get_system_metrics()


# User Management Endpoints

@router.get("/users", response_model=List[UserFullPublic])
async def get_all_users(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"])),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query("active", regex="^(active|archived|all)$")
):
    """Get all users with their profiles and roles
    
    Args:
        status: Filter by user status - 'active' (default), 'archived', or 'all'
    """
    
    # Build base query based on status filter
    # Always exclude suspended users (they're permanently hidden)
    if status == "active":
        query = select(User).where(and_(User.deleted_at.is_(None), User.is_suspended == False))
    elif status == "archived":
        query = select(User).where(and_(User.deleted_at.is_not(None), User.is_suspended == False))
    else:  # all
        query = select(User).where(User.is_suspended == False)
    
    if search:
        query = query.join(Profile, User.id == Profile.user_id, isouter=True).where(
            User.email.ilike(f"%{search}%") |
            Profile.first_name.ilike(f"%{search}%") |
            Profile.last_name.ilike(f"%{search}%")
        )
    
    query = query.offset(skip).limit(limit).order_by(desc(User.created_at))
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    # Fetch users with their profiles and roles in batch queries (optimized)
    user_ids = [user.id for user in users]
    users_with_details = await auth_service.get_users_with_details(db=db, user_ids=user_ids)
    
    return users_with_details

@router.post("/users", response_model=UserFullPublic, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"]))
):
    """Create a new user (admin only)"""
    
    return await auth_service.register_user(db=db, user_in=user_in)

@router.get("/users/{user_id}", response_model=UserFullPublic)
async def get_user_by_id(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"]))
):
    """Get a specific user by ID"""
    
    user_details = await auth_service.get_user_details(db=db, user_id=user_id)
    if not user_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user_details

@router.put("/users/{user_id}", response_model=UserFullPublic)
async def update_user(
    user_id: uuid.UUID,
    user_update: UserUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"]))
):
    """Update a user (admin only)"""
    
    # Get the user
    result = await db.execute(
        select(User).where(and_(User.id == user_id, User.deleted_at.is_(None)))
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user fields
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Check if email is being changed to one that already exists (including archived users)
    if "email" in update_data and update_data["email"] != user.email:
        existing_user = await db.execute(
            select(User).where(
                and_(
                    User.email == update_data["email"],
                    User.id != user_id
                )
            )
        )
        found_user = existing_user.scalar_one_or_none()
        if found_user:
            if found_user.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="An archived account exists with this email. Please reactivate that account instead."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A user with this email already exists"
                )
    
    if "password" in update_data:
        # Hash the new password
        from app.core.security import get_password_hash
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    # Handle roles separately
    roles_to_assign = update_data.pop("roles", None)
    
    # Update user fields
    for field, value in update_data.items():
        setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    
    # Handle role updates
    if roles_to_assign is not None:
        # Remove existing roles
        await db.execute(
            delete(UserRoleMapping).where(UserRoleMapping.user_id == user_id)
        )
        
        # Add new roles by fetching Role objects first
        if roles_to_assign:
            result = await db.execute(
                select(Role).where(Role.slug.in_(roles_to_assign))
            )
            roles = {role.slug: role for role in result.scalars().all()}
            
            missing = [slug for slug in roles_to_assign if slug not in roles]
            if missing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Roles not found: {', '.join(missing)}"
                )
            
            for role_slug in roles_to_assign:
                role_obj = roles[role_slug]
                user_role_mapping = UserRoleMapping(user_id=user_id, role_id=role_obj.id)
                db.add(user_role_mapping)
    
    await db.commit()
    await db.refresh(user)
    
    return await auth_service.get_user_details(db=db, user_id=user_id)

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"]))
):
    """
    Archive a user (soft delete - admin only).
    User can be reactivated later. For permanent deletion, use suspend endpoint.
    """
    
    # Prevent admin from deleting themselves
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    result = await db.execute(
        select(User).where(and_(User.id == user_id, User.deleted_at.is_(None)))
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Soft delete (archive)
    user.deleted_at = datetime.utcnow()
    await db.commit()

@router.post("/users/{user_id}/reactivate", response_model=UserFullPublic)
async def reactivate_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"]))
):
    """
    Reactivate an archived user account (admin only).
    Only works for archived users - suspended users cannot be reactivated.
    """
    
    # Check if user is suspended (cannot reactivate)
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user_obj = result.scalar_one_or_none()
    
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user_obj.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot reactivate permanently suspended users. This action is irreversible."
        )
    
    return await auth_service.reactivate_user(db=db, user_id=user_id)

@router.post("/users/{user_id}/approve", response_model=UserFullPublic)
async def approve_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"]))
):
    """
    Approve a user account after email verification (admin only).
    Users must verify their email first, then wait for admin approval before they can login.
    """
    
    result = await db.execute(
        select(User).where(and_(User.id == user_id, User.deleted_at.is_(None)))
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Super admin accounts are auto-approved"
        )
    
    if not user.email_confirmed_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must verify their email before approval"
        )
    
    if user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already approved"
        )
    
    # Approve the user
    user.is_approved = True
    user.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(user)
    
    return await auth_service.get_user_details(db=db, user_id=user_id)

@router.post("/users/{user_id}/revoke-approval", response_model=UserFullPublic)
async def revoke_user_approval(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"]))
):
    """
    Revoke approval for a user account (admin only).
    User will no longer be able to login until re-approved.
    """
    
    result = await db.execute(
        select(User).where(and_(User.id == user_id, User.deleted_at.is_(None)))
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot revoke approval for super admin accounts"
        )
    
    if not user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not currently approved"
        )
    
    # Revoke approval
    user.is_approved = False
    user.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(user)
    
    return await auth_service.get_user_details(db=db, user_id=user_id)

@router.post("/users/{user_id}/reset-password", response_model=PasswordResetResponse)
async def admin_reset_user_password(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"]))
):
    """
    Reset user password (admin only).
    Generates a random temporary password and updates it in Supabase Auth.
    Returns the temporary password to the admin (shown only once).
    """
    
    # Get the user
    user_obj = await crud_user.get(db, id=user_id)
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from resetting their own password this way
    if user_obj.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot reset your own password through admin interface"
        )
    
    # Check if user has Supabase account
    if not user_obj.supabase_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have a Supabase Auth account"
        )
    
    # Generate temporary password (8 characters, mix of letters, numbers, symbols)
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*()"
    temp_password = ''.join(secrets.choice(alphabet) for _ in range(8))
    
    try:
        # Update password in Supabase Auth
        await supabase_client.admin_update_user_password(
            str(user_obj.supabase_user_id),
            temp_password
        )
        
        return PasswordResetResponse(
            temporary_password=temp_password,
            message=f"Password reset successful for {user_obj.email}. Provide this temporary password to the user."
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset password: {str(e)}"
        )

@router.post("/users/{user_id}/suspend-permanently")
async def permanently_suspend_archived_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"]))
):
    """
    Permanently suspend an archived user (admin only).
    This operation is IRREVERSIBLE - the account cannot be reactivated.
    The user will be completely hidden from all views but retained in database for compliance.
    
    Requirements:
    - User must already be archived (soft deleted)
    - This permanently hides the account
    - Deletes user from Supabase Auth
    - Terminates all sessions
    """
    
    # Get the user (including deleted ones)
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user_obj = result.scalar_one_or_none()
    
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is already suspended
    if user_obj.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already permanently suspended"
        )
    
    # Require user to be archived first
    if not user_obj.deleted_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must be archived before permanent suspension. Archive the user first."
        )
    
    # Prevent admin from suspending themselves
    if user_obj.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot suspend your own account"
        )
    
    try:
        # 1. Terminate all sessions
        await session_crud.terminate_all_user_sessions(
            db,
            user_id=user_id,
            reason="Account permanently suspended (archived user deletion)"
        )
        
        # 2. Mark as permanently suspended in database
        await crud_user.suspend_user(
            db,
            user_id=user_id,
            suspended_by_user_id=current_user.id,
            reason="Permanently suspended - irreversible deletion of archived account"
        )
        
        # 3. Delete from Supabase Auth (if exists)
        if user_obj.supabase_user_id:
            await supabase_client.admin_delete_user(str(user_obj.supabase_user_id))
        
        return {
            "message": "User permanently suspended successfully",
            "user_id": str(user_id),
            "email": user_obj.email,
            "warning": "This action is IRREVERSIBLE. The account cannot be reactivated.",
            "suspended_at": user_obj.suspended_at
        }
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to permanently TP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unsuspend user: {str(e)}"
        )

@router.post("/users/{user_id}/roles", response_model=UserWithRoles)
async def assign_role_to_user(
    user_id: uuid.UUID,
    role_data: UserRoleMappingCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"]))
):
    """Assign a role to a user"""

    # Check if user exists
    result = await db.execute(
        select(User).where(and_(User.id == user_id, User.deleted_at.is_(None)))
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    role = await role_crud.get_by_slug(db, slug=role_data.role_slug)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role '{role_data.role_slug}' not found"
        )

    # Check if role mapping already exists
    existing_role = await db.execute(
        select(UserRoleMapping).where(
            and_(
                UserRoleMapping.user_id == user_id,
                UserRoleMapping.role_id == role.id
            )
        )
    )

    if existing_role.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has this role"
        )

    # Create new role mapping
    new_role_mapping = UserRoleMapping(
        user_id=user_id,
        role_id=role.id
    )

    db.add(new_role_mapping)
    await db.commit()

    return await auth_service.get_user_details(db=db, user_id=user_id)

@router.delete("/users/{user_id}/roles/{role_slug}")
async def remove_role_from_user(
    user_id: uuid.UUID,
    role_slug: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"]))
):
    """Remove a role from a user"""

    role = await role_crud.get_by_slug(db, slug=role_slug)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role '{role_slug}' not found"
        )

    # Find the role mapping
    result = await db.execute(
        select(UserRoleMapping).where(
            and_(
                UserRoleMapping.user_id == user_id,
                UserRoleMapping.role_id == role.id
            )
        )
    )
    role_mapping = result.scalar_one_or_none()

    if not role_mapping:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role mapping not found"
        )

    await db.delete(role_mapping)
    await db.commit()

    return {"message": "Role removed successfully"}

@router.get("/roles", response_model=List[RolePublic])
async def get_available_roles(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles(["admin"]))
):
    """Get all available roles (system and custom)."""

    return await permission_service.list_roles(db)


@router.post("/roles", response_model=RolePublic, status_code=status.HTTP_201_CREATED)
async def create_role(
    role_in: RoleCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_super_admin())
):
    """Create a new custom role (super admin only)."""

    return await permission_service.create_role(db, role_in)


@router.patch("/roles/{role_slug}", response_model=RolePublic)
async def update_role(
    role_slug: str,
    role_update: RoleUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_super_admin())
):
    """Update role metadata (super admin only)."""

    return await permission_service.update_role(db, slug=role_slug, update=role_update)


@router.delete("/roles/{role_slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(
    role_slug: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_super_admin())
):
    """Delete a custom role (super admin only)."""

    await permission_service.delete_role(db, slug=role_slug)
    return None


# Permission Management Endpoints

@router.get("/permissions")
async def get_all_permissions(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_super_admin()),
    grouped: bool = Query(False, description="Return permissions grouped by module and entity")
):
    """Get all available permissions, optionally grouped (super admin only)"""
    result = await permission_service.get_all_permissions(db, grouped=grouped)
    
    # If grouped, convert Permission objects to dicts for JSON serialization
    if grouped and isinstance(result, dict):
        serialized = {}
        for module_name, entities in result.items():
            serialized[module_name] = {}
            for entity_type, permissions in entities.items():
                serialized[module_name][entity_type] = [
                    PermissionPublic.model_validate(perm).model_dump()
                    for perm in permissions
                ]
        return serialized
    
    # If not grouped, return list (FastAPI will serialize with response_model)
    return [PermissionPublic.model_validate(perm) for perm in result]


@router.get("/roles/{role_slug}/permissions", response_model=RoleWithPermissions)
async def get_role_permissions(
    role_slug: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_super_admin())
):
    """Get all permissions assigned to a specific role (super admin only)"""
    return await permission_service.get_role_permissions(db, slug=role_slug)


@router.post("/roles/{role_slug}/permissions/{permission_id}")
async def assign_permission_to_role(
    role_slug: str,
    permission_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_super_admin())
):
    """Assign a single permission to a role (super admin only)"""
    await permission_service.assign_permission_to_role(db, slug=role_slug, permission_id=permission_id)
    return {"message": f"Permission {permission_id} assigned to role {role_slug}"}


@router.post("/roles/{role_slug}/permissions/bulk", response_model=RoleWithPermissions)
async def assign_permissions_to_role_bulk(
    role_slug: str,
    bulk_assign: RolePermissionBulkAssign,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_super_admin())
):
    """Assign multiple permissions to a role (super admin only)"""
    return await permission_service.assign_permissions_to_role_bulk(db, slug=role_slug, bulk_assign=bulk_assign)


@router.delete("/roles/{role_slug}/permissions/{permission_id}")
async def remove_permission_from_role(
    role_slug: str,
    permission_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_super_admin())
):
    """Remove a permission from a role (super admin only)"""
    await permission_service.remove_permission_from_role(db, slug=role_slug, permission_id=permission_id)
    return {"message": f"Permission {permission_id} removed from role {role_slug}"}


@router.get("/users/{user_id}/permissions", response_model=UserPermissionsResponse)
async def get_user_permissions(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_super_admin())
):
    """Get all permissions for a specific user (super admin only)"""
    return await permission_service.get_user_permissions(db, user_id=user_id)


@router.get("/roles/{role_slug}/users", response_model=List[UserFullPublic])
async def get_users_by_role(
    role_slug: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_super_admin()),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all users with a specific role (super admin only)"""
    role = await role_crud.get_by_slug(db, slug=role_slug)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role '{role_slug}' not found"
        )

    # Get user IDs with this role
    result = await db.execute(
        select(UserRoleMapping.user_id)
        .where(UserRoleMapping.role_id == role.id)
        .distinct()
        .offset(skip)
        .limit(limit)
    )
    user_ids = [row[0] for row in result.fetchall()]
    
    if not user_ids:
        return []
    
    # Get full user details
    users_with_details = await auth_service.get_users_with_details(db=db, user_ids=user_ids)
    return users_with_details
