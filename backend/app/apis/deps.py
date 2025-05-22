# app/apis/deps.py
from typing import AsyncGenerator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.core import security
from app.core.config import settings
from app.db.database import get_db_session # Async session
from app.models.auth_models import User # SQLAlchemy model
from app.schemas.token_schemas import TokenPayload # Pydantic schema for token payload
from app.crud.crud_user import user as crud_user # CRUD operations for user

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"/api/v1/auth/login" # Or your actual login path
)

async def get_current_user(
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
    
    user_obj = await crud_user.get(db, id=token_data.sub) # Use 'sub' as user_id
    if not user_obj:
        raise credentials_exception
    # if not user_obj.is_active: # Add is_active to User model if you have it
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return user_obj

async def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="The user doesn't have enough privileges"
        )
    return current_user