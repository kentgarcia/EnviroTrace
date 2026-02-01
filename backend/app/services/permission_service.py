# app/services/permission_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from typing import List, Optional
import uuid

from app.crud.crud_permission import permission_crud
from app.crud.crud_role import role_crud
from app.crud.crud_user import user as crud_user
from app.models.auth_models import User
from app.schemas.permission_schemas import (
    PermissionPublic,
    PermissionCreate,
    RolePublic,
    RoleCreate,
    RoleUpdate,
    RoleWithPermissions,
    UserPermissionsResponse,
    RolePermissionBulkAssign
)


class PermissionService:
    async def get_all_permissions(
        self, db: AsyncSession, grouped: bool = False
    ) -> List[PermissionPublic] | dict:
        """Get all permissions, optionally grouped by module/entity"""
        if grouped:
            return await permission_crud.get_all_grouped(db)
        
        permissions = await permission_crud.get_multi(db, skip=0, limit=1000)
        return permissions

    async def get_permission_by_id(
        self, db: AsyncSession, permission_id: uuid.UUID
    ) -> PermissionPublic:
        """Get a specific permission by ID"""
        permission = await permission_crud.get(db, id=permission_id)
        if not permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Permission with ID {permission_id} not found"
            )
        return permission

    async def get_permission_by_name(
        self, db: AsyncSession, name: str
    ) -> Optional[PermissionPublic]:
        """Get a permission by name"""
        return await permission_crud.get_by_name(db, name=name)

    async def create_permission(
        self, db: AsyncSession, permission_in: PermissionCreate
    ) -> PermissionPublic:
        """Create a new permission"""
        # Check if permission with same name exists
        existing = await permission_crud.get_by_name(db, name=permission_in.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Permission with name '{permission_in.name}' already exists"
            )
        
        return await permission_crud.create(db, obj_in=permission_in)

    async def list_roles(self, db: AsyncSession) -> list[RolePublic]:
        roles = await role_crud.get_multi(db, skip=0, limit=1000)
        return [RolePublic.model_validate(role) for role in roles]

    async def get_role_by_slug(self, db: AsyncSession, slug: str) -> RolePublic:
        role = await role_crud.get_by_slug(db, slug=slug)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Role '{slug}' not found"
            )
        return RolePublic.model_validate(role)

    async def create_role(self, db: AsyncSession, role_in: RoleCreate) -> RolePublic:
        role = await role_crud.create(db, obj_in=role_in)
        return RolePublic.model_validate(role)

    async def update_role(self, db: AsyncSession, slug: str, update: RoleUpdate) -> RolePublic:
        role = await role_crud.get_by_slug(db, slug=slug)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Role '{slug}' not found"
            )
        if role.is_system and update.display_name is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="System roles cannot be renamed"
            )
        updated = await role_crud.update(db, db_obj=role, obj_in=update)
        return RolePublic.model_validate(updated)

    async def delete_role(self, db: AsyncSession, slug: str) -> None:
        role = await role_crud.get_by_slug(db, slug=slug)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Role '{slug}' not found"
            )
        if role.is_system:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="System roles cannot be deleted"
            )
        await role_crud.remove(db, id=role.id)

    async def get_role_permissions(
        self, db: AsyncSession, slug: str
    ) -> RoleWithPermissions:
        """Get all permissions for a specific role"""
        role = await role_crud.get_by_slug(db, slug=slug)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Role '{slug}' not found"
            )
        permissions = await permission_crud.get_permissions_for_role(db, role_id=role.id)
        return RoleWithPermissions(role=RolePublic.model_validate(role), permissions=permissions)

    async def assign_permission_to_role(
        self, db: AsyncSession, slug: str, permission_id: uuid.UUID
    ) -> None:
        """Assign a single permission to a role"""
        role = await role_crud.get_by_slug(db, slug=slug)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Role '{slug}' not found"
            )
        # Verify permission exists
        permission = await permission_crud.get(db, id=permission_id)
        if not permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Permission with ID {permission_id} not found"
            )
        
        await permission_crud.assign_permission_to_role(
            db, role_id=role.id, permission_id=permission_id
        )

    async def assign_permissions_to_role_bulk(
        self, db: AsyncSession, slug: str, bulk_assign: RolePermissionBulkAssign
    ) -> RoleWithPermissions:
        """Assign multiple permissions to a role"""
        role = await role_crud.get_by_slug(db, slug=slug)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Role '{slug}' not found"
            )
        # Verify all permissions exist
        for perm_id in bulk_assign.permission_ids:
            permission = await permission_crud.get(db, id=perm_id)
            if not permission:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Permission with ID {perm_id} not found"
                )
        
        await permission_crud.assign_permissions_to_role_bulk(
            db, role_id=role.id, permission_ids=bulk_assign.permission_ids
        )
        
        return await self.get_role_permissions(db, slug=slug)

    async def remove_permission_from_role(
        self, db: AsyncSession, slug: str, permission_id: uuid.UUID
    ) -> None:
        """Remove a permission from a role"""
        role = await role_crud.get_by_slug(db, slug=slug)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Role '{slug}' not found"
            )
        removed = await permission_crud.remove_permission_from_role(
            db, role_id=role.id, permission_id=permission_id
        )
        if not removed:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Permission assignment not found for role '{slug}' and permission ID {permission_id}"
            )

    async def remove_all_permissions_from_role(
        self, db: AsyncSession, slug: str
    ) -> int:
        """Remove all permissions from a role"""
        role = await role_crud.get_by_slug(db, slug=slug)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Role '{slug}' not found"
            )
        return await permission_crud.remove_all_permissions_from_role(db, role_id=role.id)

    async def check_user_permission(
        self, db: AsyncSession, user_id: uuid.UUID, permission_name: str
    ) -> bool:
        """Check if a user has a specific permission"""
        # Get user to check if super admin
        user = await crud_user.get(db, id=user_id)
        if not user:
            return False
        
        # Super admins bypass all permission checks
        if user.is_super_admin:
            return True
        
        return await permission_crud.check_user_has_permission(
            db, user_id=user_id, permission_name=permission_name
        )

    async def get_user_permissions(
        self, db: AsyncSession, user_id: uuid.UUID
    ) -> UserPermissionsResponse:
        """Get all permissions for a user (from their roles)"""
        user = await crud_user.get(db, id=user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} not found"
            )
        
        # Get user's roles
        roles = await crud_user.get_user_roles(db, user_id=user_id)
        
        # Get permission names
        permission_names = []
        if not user.is_super_admin:
            permission_names = await permission_crud.get_user_permission_names(
                db, user_id=user_id
            )
        
        return UserPermissionsResponse(
            user_id=user_id,
            roles=roles,
            permissions=permission_names if not user.is_super_admin else [],
            is_super_admin=user.is_super_admin
        )

    async def sync_permissions(self, db: AsyncSession) -> dict:
        """
        Sync/seed permissions to database (useful for deployment or updates).
        This is idempotent - won't create duplicates.
        """
        # This would typically read from a config file or hardcoded list
        # For now, return info that migration handles seeding
        return {
            "message": "Permission seeding is handled by Alembic migration",
            "migration": "add_permission_management_20260202"
        }


permission_service = PermissionService()
