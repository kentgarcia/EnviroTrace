# app/apis/deps.py
from typing import Optional, Generator, List, Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import create_engine, select
import uuid
from datetime import datetime, timedelta

from app.core import supabase_client
from app.core.config import settings
from app.db.database import get_db_session, SessionLocal # Import SessionLocal from database.py
from app.models.auth_models import User, Role # SQLAlchemy model
from app.schemas.token_schemas import TokenPayload # Pydantic schema for token payload
from app.crud.crud_user import user as crud_user # CRUD operations for user
from app.crud.crud_session import session_crud

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login" # Or your actual login path
)

# Synchronous database dependency for backward compatibility with existing CRUD
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Async database dependency
async def get_async_db() -> AsyncSession: # type: ignore
    async for session in get_db_session():
        yield session

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
    """
    Get current user from Supabase JWT token (synchronous version).
    Verifies Supabase JWT and queries user by supabase_user_id.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verify Supabase JWT and extract user ID
    try:
        supabase_user_id = supabase_client.get_user_id_from_token(token)
    except HTTPException:
        raise credentials_exception
    
    try:
        supabase_uuid = uuid.UUID(supabase_user_id)
    except ValueError:
        raise credentials_exception
    
    # Query user by supabase_user_id
    user_obj = crud_user.get_by_supabase_id_sync(db, supabase_user_id=supabase_uuid)
    if not user_obj:
        raise credentials_exception
    
    # Check if account is suspended
    if user_obj.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended by administrator. Contact support for assistance."
        )
    
    return user_obj

# Async version of get_current_user for use with async database sessions
async def get_current_user_async(
    db: AsyncSession = Depends(get_db_session), token: str = Depends(reusable_oauth2)
) -> User:
    """
    Get current user from Supabase JWT token (async version).
    Verifies Supabase JWT, checks session is active, and queries user by supabase_user_id.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verify Supabase JWT and extract user ID
    try:
        supabase_user_id = supabase_client.get_user_id_from_token(token)
    except HTTPException:
        raise credentials_exception
    
    try:
        supabase_uuid = uuid.UUID(supabase_user_id)
    except ValueError:
        raise credentials_exception
    
    # Check if the session exists and is active (optional - can be removed if session tracking not needed)
    session = await session_crud.get_active_session_by_supabase_id(db, supabase_session_id=token)
    if session:
        last_activity = session.last_activity_at
        if last_activity is None:
            await session_crud.update_activity(db, session_id=session.id)
        else:
            try:
                last_activity_naive = last_activity.replace(tzinfo=None)
            except Exception:
                last_activity_naive = None

            now = datetime.utcnow()
            if last_activity_naive is None or (now - last_activity_naive) > timedelta(minutes=5):
                await session_crud.update_activity(db, session_id=session.id)
    # Note: Not raising error if session not found, as Supabase handles session validity
    
    # Query user by supabase_user_id
    user_obj = await crud_user.get_by_supabase_id(db, supabase_user_id=supabase_uuid)
    if not user_obj:
        raise credentials_exception
    
    # Check if account is suspended
    if user_obj.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended by administrator. Contact support for assistance."
        )
    
    return user_obj

def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_super_admin: # type: ignore
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="The user doesn't have enough privileges"
        )
    return current_user

async def get_current_active_superuser_async(
    current_user: User = Depends(get_current_user_async),
) -> User:
    if not current_user.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="The user doesn't have enough privileges"
        )
    return current_user

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get current active user (non-superuser)
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="The user doesn't exist in the system"
        )
    # Add any additional checks for active status if needed
    # if not current_user.is_active:
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user

async def get_current_active_user_async(
    current_user: User = Depends(get_current_user_async),
) -> User:
    """
    Get current active user async (non-superuser)
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="The user doesn't exist in the system"
        )
    # Add any additional checks for active status if needed
    # if not current_user.is_active:
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user

def require_roles(allowed_roles: List[str]) -> Callable:
    """
    Dependency to require specific roles for accessing endpoints.
    
    Args:
        allowed_roles: List of role slugs (e.g., ['admin', 'urban_greening'])
    """
    async def role_checker(
        current_user: User = Depends(get_current_user_async),
        db: AsyncSession = Depends(get_db_session)
    ) -> User:
        # Get user roles from UserRoleMapping
        from sqlalchemy import select
        from app.models.auth_models import UserRoleMapping
        
        result = await db.execute(
            select(Role.slug)
            .join(UserRoleMapping, UserRoleMapping.role_id == Role.id)
            .where(UserRoleMapping.user_id == current_user.id)
        )
        user_role_slugs = [row[0] for row in result.fetchall()]

        # Check if user has any of the required roles or is super admin
        if current_user.is_super_admin or any(role in user_role_slugs for role in allowed_roles):
            return current_user
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. Required roles: {allowed_roles}"
        )
    
    return role_checker


def require_permissions(required_permissions: List[str]) -> Callable:
    """
    Dependency to require specific permissions for accessing endpoints.
    User must have at least ONE of the required permissions (OR logic).
    Super admins bypass all permission checks.
    
    Args:
        required_permissions: List of permission names (e.g., ['vehicle.create', 'vehicle.update'])
    
    Returns:
        User object if authorized
        
    Raises:
        403 Forbidden if user lacks required permissions
    """
    async def permission_checker(
        current_user: User = Depends(get_current_user_async),
        db: AsyncSession = Depends(get_db_session)
    ) -> User:
        # Super admins bypass all permission checks
        if current_user.is_super_admin:
            return current_user
        
        # Get user's permissions through their roles
        from sqlalchemy import select
        from app.models.auth_models import UserRoleMapping, RolePermission, Permission
        
        result = await db.execute(
            select(Permission.name)
            .join(RolePermission, Permission.id == RolePermission.permission_id)
            .join(UserRoleMapping, RolePermission.role_id == UserRoleMapping.role_id)
            .where(UserRoleMapping.user_id == current_user.id)
            .distinct()
        )
        user_permissions = [row[0] for row in result.fetchall()]
        
        # Check if user has any of the required permissions
        if any(perm in user_permissions for perm in required_permissions):
            return current_user
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. Required permissions: {required_permissions}"
        )
    
    return permission_checker


def require_permissions_sync(required_permissions: List[str]) -> Callable:
    """
    Synchronous version of require_permissions for sync endpoints.
    User must have at least ONE of the required permissions (OR logic).
    Super admins bypass all permission checks.
    
    Args:
        required_permissions: List of permission names (e.g., ['vehicle.create', 'vehicle.update'])
    
    Returns:
        User object if authorized
        
    Raises:
        403 Forbidden if user lacks required permissions
    """
    def permission_checker(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ) -> User:
        # Super admins bypass all permission checks
        if current_user.is_super_admin:
            return current_user
        
        # Get user's permissions through their roles
        from sqlalchemy import select
        from app.models.auth_models import UserRoleMapping, RolePermission, Permission
        
        result = db.execute(
            select(Permission.name)
            .join(RolePermission, Permission.id == RolePermission.permission_id)
            .join(UserRoleMapping, RolePermission.role_id == UserRoleMapping.role_id)
            .where(UserRoleMapping.user_id == current_user.id)
            .distinct()
        )
        user_permissions = [row[0] for row in result.fetchall()]
        
        # Check if user has any of the required permissions
        if any(perm in user_permissions for perm in required_permissions):
            return current_user
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. Required permissions: {required_permissions}"
        )
    
    return permission_checker


def require_super_admin() -> Callable:
    """
    Dependency to require super admin status for accessing endpoints.
    Only users with is_super_admin=True can access.
    """
    async def super_admin_checker(
        current_user: User = Depends(get_current_user_async)
    ) -> User:
        if not current_user.is_super_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Super admin privileges required."
            )
        return current_user
    
    return super_admin_checker
