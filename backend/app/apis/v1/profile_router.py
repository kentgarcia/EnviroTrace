# app/apis/v1/profile_router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.apis.deps import get_current_user_async, get_db_session
from app.models.auth_models import User
from app.schemas.profile_schemas import ProfileUpdate, ProfilePublic
from app.crud.crud_profile import profile as crud_profile

router = APIRouter()

@router.get("/me", response_model=ProfilePublic)
async def get_my_profile(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user_async)
):
    """Get the profile of the current logged-in user"""
    profile = await crud_profile.get_by_user_id(db, user_id=current_user.id)
    if not profile:
        # Auto-create empty profile if it doesn't exist
        from app.schemas.profile_schemas import ProfileCreate
        profile_create = ProfileCreate(user_id=current_user.id)
        profile = await crud_profile.create(db, obj_in=profile_create)
    return profile

@router.put("/me", response_model=ProfilePublic)
async def update_my_profile(
    profile_update: ProfileUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user_async)
):
    """Update the profile of the current logged-in user"""
    profile = await crud_profile.get_by_user_id(db, user_id=current_user.id)
    
    if not profile:
        # If profile doesn't exist, create it
        from app.schemas.profile_schemas import ProfileCreate
        profile_create = ProfileCreate(**profile_update.model_dump(), user_id=current_user.id)
        profile = await crud_profile.create(db, obj_in=profile_create)
    else:
        # Update existing profile
        profile = await crud_profile.update_by_user_id(
            db, user_id=current_user.id, obj_in=profile_update
        )
    
    return profile
