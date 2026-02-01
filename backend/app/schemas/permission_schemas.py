# app/schemas/permission_schemas.py
import uuid
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.auth_models import PermissionActionEnum


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


class RoleBase(BaseModel):
    display_name: str = Field(max_length=150)
    description: Optional[str] = None


class RoleCreate(RoleBase):
    slug: Optional[str] = Field(default=None, max_length=150)
    is_system: bool = False


class RoleUpdate(BaseModel):
    display_name: Optional[str] = Field(default=None, max_length=150)
    description: Optional[str] = None


class RolePublic(RoleBase):
    id: uuid.UUID
    slug: str
    is_system: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RolePermissionBulkAssign(BaseModel):
    """Bulk assign permissions to a role"""
    permission_ids: List[uuid.UUID]


class RoleWithPermissions(BaseModel):
    """Role with its assigned permissions"""
    role: RolePublic
    permissions: List[PermissionPublic]


class UserPermissionsResponse(BaseModel):
    """Response containing user's permissions (from all their roles)"""
    user_id: uuid.UUID
    roles: List[str]  # role slugs
    permissions: List[str]
    is_super_admin: bool
