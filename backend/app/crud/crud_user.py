# app/crud/crud_user.py
from typing import Any, Dict, Optional, Union, List
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from sqlalchemy import delete
from sqlalchemy.orm import selectinload

from app.crud.base_crud import CRUDBase
from app.models.auth_models import User, UserRoleMapping, UserRoleEnum
from app.schemas.user_schemas import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password

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

    async def create(self, db: AsyncSession, *, obj_in: UserCreate) -> User:
        from app.models.auth_models import Profile
        from app.schemas.profile_schemas import ProfileCreate
        
        roles_to_assign = obj_in.roles
        # Extract profile fields
        profile_fields = {
            "first_name": obj_in.first_name,
            "last_name": obj_in.last_name,
            "job_title": obj_in.job_title,
            "department": obj_in.department,
            "phone_number": obj_in.phone_number,
        }
        
        create_data = obj_in.model_dump(exclude={"password", "roles", "first_name", "last_name", "job_title", "department", "phone_number"})
        
        hashed_password = get_password_hash(obj_in.password)
        db_obj = User(**create_data, hashed_password=hashed_password)
        
        db.add(db_obj)
        await db.commit() # Commit to get the user ID
        await db.refresh(db_obj)

        # Create profile if any profile field is provided
        if any(value is not None for value in profile_fields.values()):
            profile = Profile(user_id=db_obj.id, **profile_fields)
            db.add(profile)
            await db.commit()

        if roles_to_assign:
            for role_enum in roles_to_assign:
                user_role_mapping = UserRoleMapping(user_id=db_obj.id, role=role_enum)
                db.add(user_role_mapping)
            await db.commit()
            await db.refresh(db_obj) # Refresh again to load roles if relationship is configured to do so, or query separately
        
        return db_obj


    async def update(
        self, 
        db: AsyncSession, 
        *, 
        db_obj: User, 
        obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        from app.models.auth_models import Profile
        
        update_data = obj_in if isinstance(obj_in, dict) else obj_in.model_dump(exclude_unset=True)

        if "password" in update_data and update_data["password"]:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            db_obj.hashed_password = hashed_password
        
        roles_to_set = update_data.pop("roles", None)
        
        # Extract profile fields
        profile_fields = {}
        for field in ["first_name", "last_name", "job_title", "department", "phone_number"]:
            if field in update_data:
                profile_fields[field] = update_data.pop(field)

        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj) # Add to session before role manipulation
        
        # Update or create profile if profile fields are provided
        if profile_fields:
            # Check if profile exists
            result = await db.execute(select(Profile).where(Profile.user_id == db_obj.id))
            profile = result.scalar_one_or_none()
            
            if profile:
                # Update existing profile
                for field, value in profile_fields.items():
                    setattr(profile, field, value)
                from datetime import datetime
                profile.updated_at = datetime.utcnow()
            else:
                # Create new profile
                profile = Profile(user_id=db_obj.id, **profile_fields)
                db.add(profile)

        if roles_to_set is not None: # If roles list is provided (even if empty)
            # Delete existing roles
            await db.execute(delete(UserRoleMapping).where(UserRoleMapping.user_id == db_obj.id))
            # Add new roles
            for role_enum in roles_to_set:
                user_role_mapping = UserRoleMapping(user_id=db_obj.id, role=role_enum)
                db.add(user_role_mapping)
        
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def authenticate(self, db: AsyncSession, *, email: str, password: str) -> Optional[User]:
        user = await self.get_by_email(db, email=email, include_deleted=False)
        if not user:
            return None
        # if not user.is_active: # Add is_active to User model if needed
        #     return None 
        if not verify_password(password, user.hashed_password): # verify_password from security.py
            return None
        return user

    async def get_with_profile(self, db: AsyncSession, *, user_id: uuid.UUID) -> Optional[User]:
        result = await db.execute(
            select(User)
            .options(selectinload(User.profile))
            .filter(User.id == user_id, User.deleted_at.is_(None))
        )
        return result.scalars().first()

    async def get_user_roles(self, db: AsyncSession, *, user_id: uuid.UUID) -> List[UserRoleEnum]:
        result = await db.execute(
            select(UserRoleMapping.role).filter(UserRoleMapping.user_id == user_id)
        )
        return result.scalars().all()


user = CRUDUser(User)