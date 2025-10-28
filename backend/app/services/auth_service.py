# app/services/auth_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional, List
import uuid

from app.crud.crud_user import user as crud_user
from app.crud.crud_profile import profile as crud_profile
from app.crud.crud_session import session_crud
from app.schemas.user_schemas import UserCreate, UserPublic, UserWithRoles, UserFullPublic, UserRoleEnum
from app.schemas.profile_schemas import ProfileCreate
from app.schemas.token_schemas import Token
from app.models.auth_models import User, DeviceTypeEnum
from app.core.security import create_access_token, verify_password

class AuthService:
    async def register_user(self, db: AsyncSession, *, user_in: UserCreate) -> UserFullPublic:
        existing_user = await crud_user.get_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The user with this email already exists in the system.",
            )
        
        user = await crud_user.create(db, obj_in=user_in)
        
        # Get user details with profile
        return await self.get_user_details(db=db, user_id=user.id)

    async def login_user(
        self,
        db: AsyncSession,
        *,
        form_data: OAuth2PasswordRequestForm,
        request: Optional[Request] = None,
        device_type: DeviceTypeEnum = DeviceTypeEnum.unknown,
        device_name: Optional[str] = None
    ) -> Token:
        user = await crud_user.get_by_email(db, email=form_data.username) # form_data.username is email
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # if not user.is_active: # Add is_active to User model if needed
        #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
        
        # Extract request metadata
        ip_address = None
        user_agent = None
        if request:
            # Get IP address from X-Forwarded-For header or direct connection
            forwarded_for = request.headers.get("X-Forwarded-For")
            if forwarded_for:
                ip_address = forwarded_for.split(",")[0].strip()
            else:
                ip_address = request.client.host if request.client else None
            
            user_agent = request.headers.get("User-Agent")
        
        # Create session with device tracking
        session = await session_crud.create_session(
            db,
            user_id=user.id,
            device_type=device_type,
            device_name=device_name,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return Token(access_token=session.session_token, token_type="bearer")

    async def get_user_details(self, db: AsyncSession, user_id: uuid.UUID) -> UserFullPublic:
        # Get user with profile loaded
        user_model = await crud_user.get_with_profile(db, user_id=user_id)
        if not user_model:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        roles = await crud_user.get_user_roles(db, user_id=user_model.id)
        
        # Get profile data
        profile_data = None
        if user_model.profile:
            profile_data = {
                "id": user_model.profile.id,
                "user_id": user_model.profile.user_id,
                "first_name": user_model.profile.first_name,
                "last_name": user_model.profile.last_name,
                "bio": user_model.profile.bio,
                "job_title": user_model.profile.job_title,
                "department": user_model.profile.department,
                "phone_number": user_model.profile.phone_number,
                "created_at": user_model.profile.created_at,
                "updated_at": user_model.profile.updated_at,
            }
        
        # Create UserFullPublic response (includes profile and roles)
        user_data = {
            "id": user_model.id,
            "email": user_model.email,
            "is_super_admin": user_model.is_super_admin,
            "last_sign_in_at": user_model.last_sign_in_at,
            "created_at": user_model.created_at,
            "updated_at": user_model.updated_at,
            "deleted_at": user_model.deleted_at,
            "assigned_roles": roles,
            "profile": profile_data
        }
        
        return UserFullPublic(**user_data)
    
    async def get_users_with_details(self, db: AsyncSession, user_ids: List[uuid.UUID]) -> List[UserFullPublic]:
        """Efficiently fetch multiple users with their profiles and roles in batch queries"""
        from sqlalchemy.orm import selectinload
        from sqlalchemy import select
        from app.models.auth_models import User, UserRoleMapping, Profile
        
        # Fetch all users with profiles in a single query
        result = await db.execute(
            select(User)
            .options(selectinload(User.profile))
            .where(User.id.in_(user_ids))
        )
        users = result.scalars().all()
        
        # Fetch all role mappings for these users in a single query
        roles_result = await db.execute(
            select(UserRoleMapping)
            .where(UserRoleMapping.user_id.in_(user_ids))
        )
        role_mappings = roles_result.scalars().all()
        
        # Organize roles by user_id for quick lookup
        user_roles_map = {}
        for mapping in role_mappings:
            if mapping.user_id not in user_roles_map:
                user_roles_map[mapping.user_id] = []
            user_roles_map[mapping.user_id].append(mapping.role)
        
        # Build UserFullPublic objects
        users_with_details = []
        for user_model in users:
            profile_data = None
            if user_model.profile:
                profile_data = {
                    "id": user_model.profile.id,
                    "user_id": user_model.profile.user_id,
                    "first_name": user_model.profile.first_name,
                    "last_name": user_model.profile.last_name,
                    "bio": user_model.profile.bio,
                    "job_title": user_model.profile.job_title,
                    "department": user_model.profile.department,
                    "phone_number": user_model.profile.phone_number,
                    "created_at": user_model.profile.created_at,
                    "updated_at": user_model.profile.updated_at,
                }
            
            user_data = {
                "id": user_model.id,
                "email": user_model.email,
                "is_super_admin": user_model.is_super_admin,
                "last_sign_in_at": user_model.last_sign_in_at,
                "created_at": user_model.created_at,
                "updated_at": user_model.updated_at,
                "deleted_at": user_model.deleted_at,
                "assigned_roles": user_roles_map.get(user_model.id, []),
                "profile": profile_data
            }
            users_with_details.append(UserFullPublic(**user_data))
        
        return users_with_details


auth_service = AuthService()