# app/apis/deps.py
from typing import Optional, Generator, List, Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import create_engine
import uuid

from app.core import security
from app.core.config import settings
from app.db.database import get_db_session # Async session
from app.models.auth_models import User, UserRoleEnum # SQLAlchemy model
from app.schemas.token_schemas import TokenPayload # Pydantic schema for token payload
from app.crud.crud_user import user as crud_user # CRUD operations for user

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login" # Or your actual login path
)

# Create synchronous engine for backward compatibility (psycopg v3)
def _to_sync_psycopg(url: str) -> str:
    if "+asyncpg" in url:
        return url.replace("+asyncpg", "+psycopg")
    if "+psycopg" in url:
        return url
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url

sync_engine = create_engine(_to_sync_psycopg(settings.DATABASE_URL))
SyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

# Synchronous database dependency for backward compatibility with existing CRUD
def get_db() -> Generator[Session, None, None]:
    db = SyncSessionLocal()
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
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = security.decode_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id_str: Optional[str] = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception
    
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise credentials_exception # Invalid UUID format in token

    token_data = TokenPayload(sub=user_id) # Pydantic validation
    
    user_obj = crud_user.get_sync(db, id=token_data.sub) # Use sync version for sync database session
    if not user_obj:
        raise credentials_exception
    # if not user_obj.is_active: # Add is_active to User model if you have it
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return user_obj

# Async version of get_current_user for use with async database sessions
async def get_current_user_async(
    db: AsyncSession = Depends(get_db_session), token: str = Depends(reusable_oauth2)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = security.decode_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id_str: Optional[str] = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception
    
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise credentials_exception # Invalid UUID format in token

    token_data = TokenPayload(sub=user_id) # Pydantic validation
    
    user_obj = await crud_user.get(db, id=token_data.sub) # Use 'sub' as user_id - note the await
    if not user_obj:
        raise credentials_exception
    # if not user_obj.is_active: # Add is_active to User model if you have it
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
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

def require_roles(allowed_roles: List[UserRoleEnum]) -> Callable:
    """
    Dependency to require specific roles for accessing endpoints
    """
    async def role_checker(
        current_user: User = Depends(get_current_user_async),
        db: AsyncSession = Depends(get_db_session)
    ) -> User:
        # Get user roles from UserRoleMapping
        from sqlalchemy import select
        from app.models.auth_models import UserRoleMapping
        
        result = await db.execute(
            select(UserRoleMapping.role).where(UserRoleMapping.user_id == current_user.id)
        )
        user_roles = [row[0] for row in result.fetchall()]
        
        # Check if user has any of the required roles or is super admin
        if current_user.is_super_admin or any(role in user_roles for role in allowed_roles):
            return current_user
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. Required roles: {[role.value for role in allowed_roles]}"
        )
    
    return role_checker