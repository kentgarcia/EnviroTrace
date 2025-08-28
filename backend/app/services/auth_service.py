# app/services/auth_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional, List
import uuid

from app.crud.crud_user import user as crud_user
from app.crud.crud_profile import profile as crud_profile # Assuming you have this
from app.schemas.user_schemas import UserCreate, UserPublic, UserWithRoles, UserFullPublic, UserRoleEnum
from app.schemas.profile_schemas import ProfileCreate
from app.schemas.token_schemas import Token
from app.models.auth_models import User
from app.core.security import create_access_token, verify_password

class AuthService:
    async def register_user(self, db: AsyncSession, *, user_in: UserCreate) -> UserWithRoles:
        existing_user = await crud_user.get_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The user with this email already exists in the system.",
            )
        
        user = await crud_user.create(db, obj_in=user_in)
        
        # Get user roles
        roles = await crud_user.get_user_roles(db, user_id=user.id)
        
        # Create UserWithRoles response
        user_data = {
            "id": user.id,
            "email": user.email,
            "is_super_admin": user.is_super_admin,
            "last_sign_in_at": user.last_sign_in_at,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "deleted_at": user.deleted_at,
            "assigned_roles": roles
        }
        
        return UserWithRoles(**user_data)

    async def login_user(self, db: AsyncSession, *, form_data: OAuth2PasswordRequestForm) -> Token:
        user = await crud_user.get_by_email(db, email=form_data.username) # form_data.username is email
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # if not user.is_active: # Add is_active to User model if needed
        #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
        
        access_token = create_access_token(subject=user.id)
        return Token(access_token=access_token, token_type="bearer")

    async def get_user_details(self, db: AsyncSession, user_id: uuid.UUID) -> UserWithRoles:
        user_model = await crud_user.get(db, id=user_id)  # Simple get without profile
        if not user_model:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        roles = await crud_user.get_user_roles(db, user_id=user_model.id)
        
        # Create UserWithRoles response
        user_data = {
            "id": user_model.id,
            "email": user_model.email,
            "is_super_admin": user_model.is_super_admin,
            "last_sign_in_at": user_model.last_sign_in_at,
            "created_at": user_model.created_at,
            "updated_at": user_model.updated_at,
            "deleted_at": user_model.deleted_at,
            "assigned_roles": roles
        }
        
        return UserWithRoles(**user_data)


auth_service = AuthService()