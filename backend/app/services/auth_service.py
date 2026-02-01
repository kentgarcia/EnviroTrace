# app/services/auth_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
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
from app.core.config import settings

class AuthService:
    async def register_user(self, db: AsyncSession, *, user_in: UserCreate) -> UserFullPublic:
        # Check for existing active user
        existing_user = await crud_user.get_by_email(db, email=user_in.email, include_deleted=False)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The user with this email already exists in the system.",
            )
        
        # Check for archived user with same email
        archived_user = await crud_user.get_by_email(db, email=user_in.email, include_deleted=True)
        if archived_user and archived_user.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An archived account exists with this email. Please contact an administrator to reactivate the account instead of creating a new one.",
            )
        
        # Check if user email is in super admin list
        super_admin_emails = settings.get_super_admin_emails()
        if user_in.email.lower() in super_admin_emails:
            user_in.is_super_admin = True
        
        user = await crud_user.create(db, obj_in=user_in)
        
        # Get user details with profile
        return await self.get_user_details(db=db, user_id=user.id)

    async def reactivate_user(self, db: AsyncSession, *, user_id: uuid.UUID) -> UserFullPublic:
        """Reactivate an archived user account"""
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if user.deleted_at is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User account is already active"
            )
        
        # Reactivate the user
        user.deleted_at = None
        from datetime import datetime
        user.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(user)
        
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
        user = await crud_user.get_by_email(db, email=form_data.username, include_deleted=False) # form_data.username is email
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # if not user.is_active: # Add is_active to User model if needed
        #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
        
        # Auto-promote to super admin if email matches
        super_admin_emails = settings.get_super_admin_emails()
        if user.email.lower() in super_admin_emails and not user.is_super_admin:
            user.is_super_admin = True
            await db.commit()
            await db.refresh(user)
        
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

        # Update last_sign_in_at
        from datetime import datetime
        user.last_sign_in_at = datetime.utcnow()
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        return Token(access_token=session.session_token, token_type="bearer")

    async def get_user_details(self, db: AsyncSession, user_id: uuid.UUID) -> UserFullPublic:
        # Get user with profile loaded
        user_model = await crud_user.get_with_profile(db, user_id=user_id)
        if not user_model:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        roles = await crud_user.get_user_roles(db, user_id=user_model.id)
        
        # Get user permissions (empty list for super admins as they have all permissions)
        from app.crud.crud_permission import permission_crud
        permissions = []
        if not user_model.is_super_admin:
            permissions = await permission_crud.get_user_permission_names(db, user_id=user_model.id)
        
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
        
        # Create UserFullPublic response (includes profile, roles, and permissions)
        user_data = {
            "id": user_model.id,
            "email": user_model.email,
            "is_super_admin": user_model.is_super_admin,
            "last_sign_in_at": user_model.last_sign_in_at,
            "created_at": user_model.created_at,
            "updated_at": user_model.updated_at,
            "deleted_at": user_model.deleted_at,
            "assigned_roles": roles,
            "permissions": permissions,
            "profile": profile_data
        }
        
        return UserFullPublic(**user_data)
    
    async def get_users_with_details(self, db: AsyncSession, user_ids: List[uuid.UUID]) -> List[UserFullPublic]:
        """Efficiently fetch multiple users with their profiles, roles, and permissions in batch queries"""
        from sqlalchemy.orm import selectinload
        from sqlalchemy import select
        from app.models.auth_models import User, UserRoleMapping, Profile, RolePermission, Permission, Role
        
        # Fetch all users with profiles in a single query
        result = await db.execute(
            select(User)
            .options(selectinload(User.profile))
            .where(User.id.in_(user_ids))
        )
        users = result.scalars().all()
        
        # Fetch all role mappings for these users in a single query
        roles_result = await db.execute(
            select(UserRoleMapping.user_id, Role.slug)
            .join(Role, Role.id == UserRoleMapping.role_id)
            .where(UserRoleMapping.user_id.in_(user_ids))
        )
        role_rows = roles_result.fetchall()
        
        # Organize roles by user_id for quick lookup
        user_roles_map = {}
        for user_id, role_slug in role_rows:
            if user_id not in user_roles_map:
                user_roles_map[user_id] = []
            user_roles_map[user_id].append(role_slug)
        
        # Fetch permissions for all users in a single query
        permissions_result = await db.execute(
            select(Permission.name, UserRoleMapping.user_id)
            .join(RolePermission, Permission.id == RolePermission.permission_id)
            .join(UserRoleMapping, RolePermission.role_id == UserRoleMapping.role_id)
            .where(UserRoleMapping.user_id.in_(user_ids))
            .distinct()
        )
        permission_mappings = permissions_result.fetchall()
        
        # Organize permissions by user_id
        user_permissions_map = {}
        for perm_name, user_id in permission_mappings:
            if user_id not in user_permissions_map:
                user_permissions_map[user_id] = []
            user_permissions_map[user_id].append(perm_name)
        
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
            
            # Super admins get empty permissions list as they have all permissions
            permissions = [] if user_model.is_super_admin else user_permissions_map.get(user_model.id, [])
            
            user_data = {
                "id": user_model.id,
                "email": user_model.email,
                "is_super_admin": user_model.is_super_admin,
                "last_sign_in_at": user_model.last_sign_in_at,
                "created_at": user_model.created_at,
                "updated_at": user_model.updated_at,
                "deleted_at": user_model.deleted_at,
                "assigned_roles": user_roles_map.get(user_model.id, []),
                "permissions": permissions,
                "profile": profile_data
            }
            users_with_details.append(UserFullPublic(**user_data))
        
        return users_with_details


auth_service = AuthService()