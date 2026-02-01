# app/schemas/permission_schemas.py
import uuid
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.auth_models import UserRoleEnum, PermissionActionEnum


class PermissionBase(BaseModel):
    name: str = Field(max_length=100, description="Unique permission name (e.g., 'vehicle.create')")
    description: Optional[str] = None
    module_name: str = Field(max_length=100, description="Module name (e.g., 'emission', 'urban_greening', 'admin')")
    entity_type: str = Field(max_length=100, description="Entity type (e.g., 'vehicle', 'tree_species')")
    action: PermissionActionEnum


class PermissionCreate(PermissionBase):
    pass


class PermissionUpdate(BaseModel):
    description: Optional[str] = None


class PermissionPublic(PermissionBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PermissionGrouped(BaseModel):
    """Grouped permissions by module and entity for cleaner display"""
    module_name: str
    entities: dict[str, List[PermissionPublic]]  # entity_type -> list of permissions


# For RolePermission
class RolePermissionBase(BaseModel):
    role: UserRoleEnum
    permission_id: uuid.UUID


class RolePermissionCreate(RolePermissionBase):
    pass


class RolePermissionBulkAssign(BaseModel):
    """Bulk assign permissions to a role"""
    permission_ids: List[uuid.UUID]


class RolePermissionPublic(RolePermissionBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class RoleWithPermissions(BaseModel):
    """Role with its assigned permissions"""
    role: UserRoleEnum
    permissions: List[PermissionPublic]


class UserPermissionsResponse(BaseModel):
    """Response containing user's permissions (from all their roles)"""
    user_id: uuid.UUID
    roles: List[UserRoleEnum]
    permissions: List[str]  # Just the permission names for efficiency
    is_super_admin: bool
