# app/crud/crud_permission.py
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import and_, delete
from app.crud.base_crud import CRUDBase
from app.models.auth_models import Permission, RolePermission, UserRoleEnum, UserRoleMapping
from app.schemas.permission_schemas import PermissionCreate, PermissionUpdate
import uuid


class CRUDPermission(CRUDBase[Permission, PermissionCreate, PermissionUpdate]):
    async def get_by_name(self, db: AsyncSession, name: str) -> Optional[Permission]:
        """Get permission by name"""
        result = await db.execute(
            select(Permission).filter(Permission.name == name)
        )
        return result.scalars().first()

    async def get_by_module(self, db: AsyncSession, module_name: str) -> List[Permission]:
        """Get all permissions for a module"""
        result = await db.execute(
            select(Permission).filter(Permission.module_name == module_name)
        )
        return result.scalars().all()

    async def get_by_entity(self, db: AsyncSession, entity_type: str) -> List[Permission]:
        """Get all permissions for an entity type"""
        result = await db.execute(
            select(Permission).filter(Permission.entity_type == entity_type)
        )
        return result.scalars().all()

    async def get_all_grouped(self, db: AsyncSession) -> dict:
        """Get all permissions grouped by module and entity"""
        result = await db.execute(select(Permission))
        permissions = result.scalars().all()
        
        grouped = {}
        for perm in permissions:
            if perm.module_name not in grouped:
                grouped[perm.module_name] = {}
            if perm.entity_type not in grouped[perm.module_name]:
                grouped[perm.module_name][perm.entity_type] = []
            grouped[perm.module_name][perm.entity_type].append(perm)
        
        return grouped

    async def get_permissions_for_role(
        self, db: AsyncSession, role: UserRoleEnum
    ) -> List[Permission]:
        """Get all permissions assigned to a role"""
        result = await db.execute(
            select(Permission)
            .join(RolePermission, Permission.id == RolePermission.permission_id)
            .filter(RolePermission.role == role)
        )
        return result.scalars().all()

    async def get_permissions_for_user(
        self, db: AsyncSession, user_id: uuid.UUID
    ) -> List[Permission]:
        """Get all permissions for a user (through their roles)"""
        result = await db.execute(
            select(Permission)
            .join(RolePermission, Permission.id == RolePermission.permission_id)
            .join(UserRoleMapping, RolePermission.role == UserRoleMapping.role)
            .filter(UserRoleMapping.user_id == user_id)
            .distinct()
        )
        return result.scalars().all()

    async def assign_permission_to_role(
        self, db: AsyncSession, role: UserRoleEnum, permission_id: uuid.UUID
    ) -> RolePermission:
        """Assign a permission to a role"""
        # Check if already exists
        result = await db.execute(
            select(RolePermission).filter(
                and_(
                    RolePermission.role == role,
                    RolePermission.permission_id == permission_id
                )
            )
        )
        existing = result.scalars().first()
        if existing:
            return existing
        
        # Create new assignment
        role_permission = RolePermission(role=role, permission_id=permission_id)
        db.add(role_permission)
        await db.commit()
        await db.refresh(role_permission)
        return role_permission

    async def assign_permissions_to_role_bulk(
        self, db: AsyncSession, role: UserRoleEnum, permission_ids: List[uuid.UUID]
    ) -> List[RolePermission]:
        """Assign multiple permissions to a role"""
        # Get existing assignments
        result = await db.execute(
            select(RolePermission).filter(
                and_(
                    RolePermission.role == role,
                    RolePermission.permission_id.in_(permission_ids)
                )
            )
        )
        existing = result.scalars().all()
        existing_ids = {rp.permission_id for rp in existing}
        
        # Create new assignments for non-existing ones
        new_assignments = []
        for perm_id in permission_ids:
            if perm_id not in existing_ids:
                role_permission = RolePermission(role=role, permission_id=perm_id)
                db.add(role_permission)
                new_assignments.append(role_permission)
        
        if new_assignments:
            await db.commit()
            for rp in new_assignments:
                await db.refresh(rp)
        
        return list(existing) + new_assignments

    async def remove_permission_from_role(
        self, db: AsyncSession, role: UserRoleEnum, permission_id: uuid.UUID
    ) -> bool:
        """Remove a permission from a role"""
        result = await db.execute(
            delete(RolePermission).filter(
                and_(
                    RolePermission.role == role,
                    RolePermission.permission_id == permission_id
                )
            )
        )
        await db.commit()
        return result.rowcount > 0

    async def remove_all_permissions_from_role(
        self, db: AsyncSession, role: UserRoleEnum
    ) -> int:
        """Remove all permissions from a role"""
        result = await db.execute(
            delete(RolePermission).filter(RolePermission.role == role)
        )
        await db.commit()
        return result.rowcount

    async def check_user_has_permission(
        self, db: AsyncSession, user_id: uuid.UUID, permission_name: str
    ) -> bool:
        """Check if a user has a specific permission (through their roles)"""
        result = await db.execute(
            select(Permission.id)
            .join(RolePermission, Permission.id == RolePermission.permission_id)
            .join(UserRoleMapping, RolePermission.role == UserRoleMapping.role)
            .filter(
                and_(
                    UserRoleMapping.user_id == user_id,
                    Permission.name == permission_name
                )
            )
            .limit(1)
        )
        return result.scalars().first() is not None

    async def get_user_permission_names(
        self, db: AsyncSession, user_id: uuid.UUID
    ) -> List[str]:
        """Get list of permission names for a user"""
        result = await db.execute(
            select(Permission.name)
            .join(RolePermission, Permission.id == RolePermission.permission_id)
            .join(UserRoleMapping, RolePermission.role == UserRoleMapping.role)
            .filter(UserRoleMapping.user_id == user_id)
            .distinct()
        )
        return result.scalars().all()


permission_crud = CRUDPermission(Permission)
