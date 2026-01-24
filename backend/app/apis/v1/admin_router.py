from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from app.apis.deps import get_current_user_async, get_db_session, require_roles
from app.models.auth_models import User, UserRoleMapping, Profile, UserRoleEnum
from app.schemas.user_schemas import (
    UserCreate, UserUpdate, UserPublic, UserWithProfile, UserWithRoles, 
    UserRoleMappingCreate, UserFullPublic
)
from app.services.auth_service import auth_service
from app.services.system_health_service import SystemHealthService

router = APIRouter()

# Admin Dashboard Stats
@router.get("/dashboard/stats")
async def get_admin_dashboard_stats(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles([UserRoleEnum.admin]))
):
    """Get admin dashboard statistics"""
    
    # Get user statistics from the service
    user_stats = await SystemHealthService.get_user_statistics(db)
    
    # Get real system uptime
    system_uptime = SystemHealthService.get_system_uptime()
    
    # Total roles count
    total_roles_result = await db.execute(
        select(func.count(func.distinct(UserRoleMapping.role)))
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
    current_user: User = Depends(require_roles([UserRoleEnum.admin]))
):
    """Get user activity data for charts"""
    
    # Get real user activity data from the service
    return await SystemHealthService.get_user_activity_data(db)

@router.get("/dashboard/system-health")
async def get_system_health_data(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles([UserRoleEnum.admin]))
):
    """Get system health metrics"""
    
    # Get real system health metrics from the service
    return SystemHealthService.get_system_metrics()


# User Management Endpoints

@router.get("/users", response_model=List[UserFullPublic])
async def get_all_users(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles([UserRoleEnum.admin])),
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
    if status == "active":
        query = select(User).where(User.deleted_at.is_(None))
    elif status == "archived":
        query = select(User).where(User.deleted_at.is_not(None))
    else:  # all
        query = select(User)
    
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
    current_user: User = Depends(require_roles([UserRoleEnum.admin]))
):
    """Create a new user (admin only)"""
    
    return await auth_service.register_user(db=db, user_in=user_in)

@router.get("/users/{user_id}", response_model=UserFullPublic)
async def get_user_by_id(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles([UserRoleEnum.admin]))
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
    current_user: User = Depends(require_roles([UserRoleEnum.admin]))
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
            select(UserRoleMapping).where(UserRoleMapping.user_id == user_id)
        )
        existing_roles = await db.execute(
            select(UserRoleMapping).where(UserRoleMapping.user_id == user_id)
        )
        for role_mapping in existing_roles.scalars().all():
            await db.delete(role_mapping)
        
        # Add new roles
        for role in roles_to_assign:
            new_role_mapping = UserRoleMapping(user_id=user_id, role=role)
            db.add(new_role_mapping)
    
    await db.commit()
    await db.refresh(user)
    
    return await auth_service.get_user_details(db=db, user_id=user_id)

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles([UserRoleEnum.admin]))
):
    """Soft delete a user (admin only)"""
    
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
    
    # Soft delete
    user.deleted_at = datetime.utcnow()
    await db.commit()

@router.post("/users/{user_id}/reactivate", response_model=UserFullPublic)
async def reactivate_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles([UserRoleEnum.admin]))
):
    """Reactivate an archived user account (admin only)"""
    
    return await auth_service.reactivate_user(db=db, user_id=user_id)

@router.post("/users/{user_id}/roles", response_model=UserWithRoles)
async def assign_role_to_user(
    user_id: uuid.UUID,
    role_data: UserRoleMappingCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles([UserRoleEnum.admin]))
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
    
    # Check if role mapping already exists
    existing_role = await db.execute(
        select(UserRoleMapping).where(
            and_(
                UserRoleMapping.user_id == user_id,
                UserRoleMapping.role == role_data.role
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
        role=role_data.role
    )
    
    db.add(new_role_mapping)
    await db.commit()
    
    return await auth_service.get_user_details(db=db, user_id=user_id)

@router.delete("/users/{user_id}/roles/{role}")
async def remove_role_from_user(
    user_id: uuid.UUID,
    role: UserRoleEnum,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles([UserRoleEnum.admin]))
):
    """Remove a role from a user"""
    
    # Find the role mapping
    result = await db.execute(
        select(UserRoleMapping).where(
            and_(
                UserRoleMapping.user_id == user_id,
                UserRoleMapping.role == role
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

@router.get("/roles")
async def get_available_roles(
    current_user: User = Depends(require_roles([UserRoleEnum.admin]))
):
    """Get all available roles"""
    
    return [{"value": role.value, "label": role.value.replace("_", " ").title()} 
            for role in UserRoleEnum]
