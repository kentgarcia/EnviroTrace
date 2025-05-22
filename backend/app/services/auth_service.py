# app/services/auth_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional, List
import uuid

from app.crud.crud_user import user as crud_user
from app.crud.crud_profile import profile as crud_profile # Assuming you have this
from app.schemas.user_schemas import UserCreate, UserPublic, UserFullPublic, UserRoleEnum
from app.schemas.profile_schemas import ProfileCreate
from app.schemas.token_schemas import Token
from app.models.auth_models import User
from app.core.security import create_access_token, verify_password

class AuthService:
    async def register_user(self, db: AsyncSession, *, user_in: UserCreate) -> User:
        existing_user = await crud_user.get_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The user with this email already exists in the system.",
            )
        
        user = await crud_user.create(db, obj_in=user_in)
        
        # Optionally create a default profile
        # profile_in = ProfileCreate(user_id=user.id, first_name="Default", last_name="User")
        # await crud_profile.create(db, obj_in=profile_in)
        
        return user

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

    async def get_user_details(self, db: AsyncSession, user_id: uuid.UUID) -> UserFullPublic:
        user_model = await crud_user.get_with_profile(db, user_id=user_id) # Fetches user with profile
        if not user_model:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        roles = await crud_user.get_user_roles(db, user_id=user_model.id)
        
        # Construct the UserFullPublic schema
        user_public_data = UserFullPublic.model_validate(user_model) # Includes profile if eager loaded
        user_public_data.assigned_roles = roles
        return user_public_data


auth_service = AuthService()