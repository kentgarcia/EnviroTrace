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
    UserFullPublic, UserRoleMappingCreate
)
from app.services.auth_service import auth_service

router = APIRouter()

# Admin Dashboard Stats
@router.get("/dashboard/stats")
async def get_admin_dashboard_stats(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles([UserRoleEnum.admin]))
):
    """Get admin dashboard statistics"""
    
    # Total users count
    total_users_result = await db.execute(
        select(func.count(User.id)).where(User.deleted_at.is_(None))
    )
    total_users = total_users_result.scalar() or 0
    
    # Active users (signed in within last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_users_result = await db.execute(
        select(func.count(User.id)).where(
            and_(
                User.deleted_at.is_(None),
                User.last_sign_in_at >= thirty_days_ago
            )
        )
    )
    active_users = active_users_result.scalar() or 0
    
    # Total roles count
    total_roles_result = await db.execute(
        select(func.count(func.distinct(UserRoleMapping.role)))
    )
    total_roles = total_roles_result.scalar() or 0
    
    # System uptime (mock for now)
    uptime_days = 15
    uptime_hours = 8
    uptime_minutes = 42
    system_uptime = f"{uptime_days}d {uptime_hours}h {uptime_minutes}m"
    
    # Total sessions (mock - could be implemented with session tracking)
    total_sessions = 234
    
    # Failed logins (mock - could be implemented with failed login tracking)
    failed_logins = 12
    
    return {
        "totalUsers": total_users,
        "activeUsers": active_users,
        "totalRoles": total_roles,
        "systemUptime": system_uptime,
        "totalSessions": total_sessions,
        "failedLogins": failed_logins
    }

@router.get("/dashboard/user-activity")
async def get_user_activity_data(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles([UserRoleEnum.admin]))
):
    """Get user activity data for charts"""
    
    # Mock data for now - in a real implementation, you'd have activity tracking
    activity_data = [
        {"date": "Jan", "logins": 65, "registrations": 12, "activeUsers": 45},
        {"date": "Feb", "logins": 78, "registrations": 18, "activeUsers": 52},
        {"date": "Mar", "logins": 82, "registrations": 15, "activeUsers": 58},
        {"date": "Apr", "logins": 91, "registrations": 22, "activeUsers": 61},
        {"date": "May", "logins": 88, "registrations": 19, "activeUsers": 67},
        {"date": "Jun", "logins": 95, "registrations": 25, "activeUsers": 73},
    ]
    
    return activity_data

@router.get("/dashboard/system-health")
async def get_system_health_data(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles([UserRoleEnum.admin]))
):
    """Get system health metrics"""
    
    # Mock data for now - in a real implementation, you'd have actual system monitoring
    health_data = [
        {"metric": "CPU Usage", "value": 65, "status": "good"},
        {"metric": "Memory Usage", "value": 78, "status": "warning"},
        {"metric": "Disk Space", "value": 45, "status": "good"},
        {"metric": "Network I/O", "value": 89, "status": "critical"},
    ]
    
    return health_data

@router.get("/dashboard/recent-activity")
async def get_recent_activity(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles([UserRoleEnum.admin]))
):
    """Get recent system activity"""
    
    # Mock data for now - in a real implementation, you'd have activity logging
    recent_activity = [
        {
            "id": "1",
            "type": "User Registration",
            "description": "New user registered: john.doe@example.com",
            "timestamp": "2 minutes ago",
            "user": "System"
        },
        {
            "id": "2",
            "type": "Role Assignment",
            "description": "Admin role assigned to user: jane.smith@example.com",
            "timestamp": "15 minutes ago",
            "user": "admin@system.com"
        },
        {
            "id": "3",
            "type": "System Update",
            "description": "Database backup completed successfully",
            "timestamp": "1 hour ago",
            "user": "System"
        },
        {
            "id": "4",
            "type": "Security Alert",
            "description": "Multiple failed login attempts detected",
            "timestamp": "2 hours ago",
            "user": "Security Monitor"
        },
    ]
    
    return recent_activity

# User Management Endpoints

@router.get("/users", response_model=List[UserFullPublic])
async def get_all_users(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_roles([UserRoleEnum.admin])),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None)
):
    """Get all users with their profiles and roles"""
    
    query = select(User).where(User.deleted_at.is_(None))
    
    if search:
        query = query.join(Profile, User.id == Profile.user_id, isouter=True).where(
            User.email.ilike(f"%{search}%") |
            Profile.first_name.ilike(f"%{search}%") |
            Profile.last_name.ilike(f"%{search}%")
        )
    
    query = query.offset(skip).limit(limit).order_by(desc(User.created_at))
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    # Fetch users with their profiles and roles
    users_with_details = []
    for user in users:
        user_details = await auth_service.get_user_details(db=db, user_id=user.id)
        users_with_details.append(user_details)
    
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

@router.post("/users/{user_id}/roles", response_model=UserFullPublic)
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
