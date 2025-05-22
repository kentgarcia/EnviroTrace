# app/schemas/user_schemas.py
import uuid
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, ForwardRef, Annotated, TYPE_CHECKING
from datetime import datetime
from app.models.auth_models import UserRoleEnum # Import the enum

# Use TYPE_CHECKING for imports to avoid circular dependencies at runtime
if TYPE_CHECKING:
    from app.schemas.profile_schemas import ProfilePublic

class UserBase(BaseModel):
    email: EmailStr
    is_super_admin: Optional[bool] = False

class UserCreate(UserBase):
    password: str = Field(min_length=8)
    roles: Optional[List[UserRoleEnum]] = None # For assigning roles on creation

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=8)
    is_super_admin: Optional[bool] = None
    is_active: Optional[bool] = None # Assuming you might add is_active to User model
    roles: Optional[List[UserRoleEnum]] = None

class UserInDBBase(UserBase):
    id: uuid.UUID
    # is_active: bool # If you add it
    last_sign_in_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Separate schema for user output, possibly with profile/roles
class UserPublic(UserInDBBase):
    # roles: List[UserRoleEnum] # You'd fetch and populate this
    pass # Add profile or other nested data as needed

class UserWithProfile(UserPublic):
    if TYPE_CHECKING:
        profile: Optional['ProfilePublic'] = None
    else:
        profile: Optional[ForwardRef('ProfilePublic')] = None

    class Config:
        from_attributes = True

class UserWithRoles(UserPublic):
    assigned_roles: List[UserRoleEnum] = []

class UserFullPublic(UserWithProfile, UserWithRoles):
    pass

# For UserRoleMapping
class UserRoleMappingBase(BaseModel):
    role: UserRoleEnum

class UserRoleMappingCreate(UserRoleMappingBase):
    user_id: uuid.UUID

class UserRoleMappingPublic(UserRoleMappingBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    class Config:
        from_attributes = True

# Import ProfilePublic at runtime after classes are defined
# to prevent circular import issues
from app.schemas.profile_schemas import ProfilePublic
UserWithProfile.model_rebuild()
UserFullPublic.model_rebuild()