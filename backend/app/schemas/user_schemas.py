# app/schemas/user_schemas.py
import uuid
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, ForwardRef, Annotated, TYPE_CHECKING
from datetime import datetime

# Use TYPE_CHECKING for imports to avoid circular dependencies at runtime
if TYPE_CHECKING:
    from app.schemas.profile_schemas import ProfilePublic

class UserBase(BaseModel):
    email: EmailStr
    is_super_admin: Optional[bool] = False

class UserCreate(UserBase):
    password: str = Field(min_length=8)
    roles: Optional[List[str]] = None # Role slugs to assign on creation
    # Profile fields
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    job_title: Optional[str] = Field(default=None, max_length=200)
    department: Optional[str] = Field(default=None, max_length=200)
    phone_number: Optional[str] = Field(default=None, max_length=50)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=8)
    is_super_admin: Optional[bool] = None
    is_active: Optional[bool] = None # Assuming you might add is_active to User model
    roles: Optional[List[str]] = None
    # Profile fields
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    job_title: Optional[str] = Field(default=None, max_length=200)
    department: Optional[str] = Field(default=None, max_length=200)
    phone_number: Optional[str] = Field(default=None, max_length=50)

class UserInDBBase(UserBase):
    id: uuid.UUID
    supabase_user_id: Optional[uuid.UUID] = None  # Supabase Auth user ID
    email_confirmed_at: Optional[datetime] = None  # Email verification timestamp
    is_approved: bool = False  # Admin approval status
    last_sign_in_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Separate schema for user output, possibly with profile/roles
class UserPublic(UserInDBBase):
    pass # Add profile or other nested data as needed

class UserWithProfile(UserPublic):
    if TYPE_CHECKING:
        profile: Optional['ProfilePublic'] = None
    else:
        profile: Optional[ForwardRef('ProfilePublic')] = None

    class Config:
        from_attributes = True

class UserWithRoles(UserPublic):
    assigned_roles: List[str] = []
    permissions: List[str] = []  # List of permission names (e.g., ['vehicle.create', 'office.view'])

class UserFullPublic(UserWithProfile, UserWithRoles):
    pass

# For UserRoleMapping
class UserRoleMappingBase(BaseModel):
    role_slug: str

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