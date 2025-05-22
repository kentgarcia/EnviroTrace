# app/schemas/profile_schemas.py
import uuid
from pydantic import BaseModel, Field
from typing import Optional, TYPE_CHECKING, Annotated
from datetime import datetime

# Use TYPE_CHECKING for imports to avoid circular dependencies at runtime
if TYPE_CHECKING:
    from app.schemas.user_schemas import UserPublic

class ProfileBase(BaseModel):
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    bio: Optional[str] = None
    job_title: Optional[str] = Field(default=None, max_length=200)
    department: Optional[str] = Field(default=None, max_length=200)
    phone_number: Optional[str] = Field(default=None, max_length=50)

class ProfileCreate(ProfileBase):
    user_id: uuid.UUID # Required on creation if not creating through User

class ProfileUpdate(ProfileBase):
    pass

class ProfilePublic(ProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Remove circular import here as we've moved it to user_schemas.py
# This was causing the circular dependency issue