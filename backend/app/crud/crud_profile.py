# app/crud/crud_profile.py
from typing import Any, Dict, Optional, Union, List
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

from app.crud.base_crud import CRUDBase
from app.models.auth_models import Profile
from app.schemas.profile_schemas import ProfileCreate, ProfileUpdate

class CRUDProfile(CRUDBase[Profile, ProfileCreate, ProfileUpdate]):
    async def get_by_user_id(self, db: AsyncSession, *, user_id: uuid.UUID) -> Optional[Profile]:
        result = await db.execute(select(self.model).filter(Profile.user_id == user_id))
        return result.scalars().first()

    async def create_with_user_id(self, db: AsyncSession, *, obj_in: ProfileCreate, user_id: uuid.UUID) -> Profile:
        create_data = obj_in.model_dump()
        create_data["user_id"] = user_id
        
        db_obj = Profile(**create_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update_by_user_id(
        self, 
        db: AsyncSession, 
        *, 
        user_id: uuid.UUID, 
        obj_in: Union[ProfileUpdate, Dict[str, Any]]
    ) -> Optional[Profile]:
        profile = await self.get_by_user_id(db, user_id=user_id)
        if not profile:
            return None
            
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(profile, field, value)
            
        await db.commit()
        await db.refresh(profile)
        return profile

    async def delete_by_user_id(self, db: AsyncSession, *, user_id: uuid.UUID) -> bool:
        profile = await self.get_by_user_id(db, user_id=user_id)
        if not profile:
            return False
            
        await db.delete(profile)
        await db.commit()
        return True

profile = CRUDProfile(Profile)