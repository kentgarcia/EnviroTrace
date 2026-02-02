# app/crud/crud_user.py
from typing import Any, Dict, Optional, Union, List
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from sqlalchemy import delete
from sqlalchemy.orm import selectinload
from datetime import datetime

from app.crud.base_crud import CRUDBase
from app.models.auth_models import User, UserRoleMapping, Role, Profile
from app.schemas.user_schemas import UserCreate, UserUpdate

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_sync(self, db: Session, *, id: Any) -> Optional[User]:
        """Synchronous version of get for use with sync sessions"""
        return db.query(self.model).filter(self.model.id == id).first()

    async def get_by_email(self, db: AsyncSession, *, email: str, include_deleted: bool = False) -> Optional[User]:
        """Get user by email, excluding soft-deleted users by default"""
        query = select(self.model).filter(User.email == email)
        if not include_deleted:
            query = query.filter(User.deleted_at.is_(None))
        result = await db.execute(query)
        return result.scalars().first()

    async def get_by_supabase_id(self, db: AsyncSession, *, supabase_user_id: uuid.UUID) -> Optional[User]:
        """Get user by Supabase user ID"""
        query = select(self.model).filter(User.supabase_user_id == supabase_user_id, User.deleted_at.is_(None))
        result = await db.execute(query)
        return result.scalars().first()

    async def create(self, db: AsyncSession, *, obj_in: UserCreate) -> User:
        """
        Create user with Supabase integration.
        Password handling is done by Supabase Auth, so this creates the internal user record.
        """
        roles_to_assign = obj_in.roles if obj_in.roles else []
        
        # Extract profile fields
        profile_fields = {
            "first_name": obj_in.first_name,
            "last_name": obj_in.last_name,
            "job_title": obj_in.job_title,
            "department": obj_in.department,
            "phone_number": obj_in.phone_number,
        }
        
        create_data = obj_in.model_dump(exclude={
            "password", "roles", "first_name", "last_name", 
            "job_title", "department", "phone_number"
        })
        
        # Create user without password (handled by Supabase)
        db_obj = User(**create_data)
        
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)

        # Create profile if any profile field is provided
        if any(value is not None for value in profile_fields.values()):
            profile = Profile(user_id=db_obj.id, **profile_fields)
            db.add(profile)
            await db.commit()

        # Assign roles
        if roles_to_assign:
            result = await db.execute(select(Role).where(Role.slug.in_(roles_to_assign)))
            roles = {role.slug: role for role in result.scalars().all()}

            missing = [slug for slug in roles_to_assign if slug not in roles]
            if missing:
                raise ValueError(f"Roles not found: {', '.join(missing)}")

            for role_slug in roles_to_assign:
                role_obj = roles[role_slug]
                user_role_mapping = UserRoleMapping(user_id=db_obj.id, role_id=role_obj.id)
                db.add(user_role_mapping)
            await db.commit()
            await db.refresh(db_obj)
        
        return db_obj

    async def update(
        self, 
        db: AsyncSession, 
        *, 
        db_obj: User,
        obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        """Update user - password updates should be handled through Supabase Auth, not here"""
        update_data = obj_in if isinstance(obj_in, dict) else obj_in.model_dump(exclude_unset=True)
        
        # Ignore password updates (handled by Supabase Auth)
        if "password" in update_data:
            del update_data["password"]
        
        roles_to_set = update_data.pop("roles", None)
        
        # Extract profile fields
        profile_fields = {}
        for field in ["first_name", "last_name", "job_title", "department", "phone_number"]:
            if field in update_data:
                profile_fields[field] = update_data.pop(field)

        # Update user fields
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj)
        
        # Update or create profile if profile fields are provided
        if profile_fields:
            result = await db.execute(select(Profile).where(Profile.user_id == db_obj.id))
            profile = result.scalar_one_or_none()
            
            if profile:
                # Update existing profile
                for field, value in profile_fields.items():
                    setattr(profile, field, value)
                profile.updated_at = datetime.utcnow()
            else:
                # Create new profile
                profile = Profile(user_id=db_obj.id, **profile_fields)
                db.add(profile)

        # Update roles if provided
        if roles_to_set is not None:
            # Delete existing roles
            await db.execute(delete(UserRoleMapping).where(UserRoleMapping.user_id == db_obj.id))

            if roles_to_set:
                result = await db.execute(select(Role).where(Role.slug.in_(roles_to_set)))
                roles = {role.slug: role for role in result.scalars().all()}
                missing = [slug for slug in roles_to_set if slug not in roles]
                if missing:
                    raise ValueError(f"Roles not found: {', '.join(missing)}")

                for role_slug in roles_to_set:
                    role_obj = roles[role_slug]
                    user_role_mapping = UserRoleMapping(user_id=db_obj.id, role_id=role_obj.id)
                    db.add(user_role_mapping)
        
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def authenticate(self, db: AsyncSession, *, email: str, password: str) -> Optional[User]:
        """
        DEPRECATED: Authentication is now handled by Supabase Auth.
        This method is kept for backward compatibility but should not be used.
        """
        raise NotImplementedError("Authentication is now handled by Supabase Auth. Use supabase_client.sign_in_with_password() instead.")

    async def get_with_profile(self, db: AsyncSession, *, user_id: uuid.UUID) -> Optional[User]:
        """Get user with profile relationship loaded"""
        result = await db.execute(
            select(User)
            .options(selectinload(User.profile))
            .filter(User.id == user_id, User.deleted_at.is_(None))
        )
        return result.scalars().first()

    async def get_user_roles(self, db: AsyncSession, *, user_id: uuid.UUID) -> List[str]:
        """Get list of role slugs for a user"""
        result = await db.execute(
            select(Role.slug)
            .join(UserRoleMapping, UserRoleMapping.role_id == Role.id)
            .filter(UserRoleMapping.user_id == user_id)
        )
        return result.scalars().all()


user = CRUDUser(User)