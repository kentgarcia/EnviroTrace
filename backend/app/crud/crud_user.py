# app/crud/crud_user.py
from typing import Any, Dict, Optional, Union, List
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete
from sqlalchemy.orm import selectinload

from app.crud.base_crud import CRUDBase
from app.models.auth_models import User, UserRoleMapping, UserRoleEnum
from app.schemas.user_schemas import UserCreate, UserUpdate
from app.core.security import get_password_hash # We'll create this in security.py

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[User]:
        result = await db.execute(select(self.model).filter(User.email == email))
        return result.scalars().first()

    async def create(self, db: AsyncSession, *, obj_in: UserCreate) -> User:
        roles_to_assign = obj_in.roles
        create_data = obj_in.model_dump(exclude={"password", "roles"}) # Exclude roles from direct User creation data
        
        hashed_password = get_password_hash(obj_in.password)
        db_obj = User(**create_data, hashed_password=hashed_password)
        
        db.add(db_obj)
        await db.commit() # Commit to get the user ID
        await db.refresh(db_obj)

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
        update_data = obj_in if isinstance(obj_in, dict) else obj_in.model_dump(exclude_unset=True)

        if "password" in update_data and update_data["password"]:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            db_obj.hashed_password = hashed_password
        
        roles_to_set = update_data.pop("roles", None)

        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj) # Add to session before role manipulation

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
        user = await self.get_by_email(db, email=email)
        if not user:
            return None
        # if not user.is_active: # Add is_active to User model if needed
        #     return None 
        if not verify_password(password, user.hashed_password): # verify_password from security.py
            return None
        return user

    async def get_with_profile(self, db: AsyncSession, *, user_id: uuid.UUID) -> Optional[User]:
        result = await db.execute(
            select(User).options(selectinload(User.profile)).filter(User.id == user_id)
        )
        return result.scalars().first()

    async def get_user_roles(self, db: AsyncSession, *, user_id: uuid.UUID) -> List[UserRoleEnum]:
        result = await db.execute(
            select(UserRoleMapping.role).filter(UserRoleMapping.user_id == user_id)
        )
        return result.scalars().all()


user = CRUDUser(User)