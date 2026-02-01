# app/crud/crud_role.py
from __future__ import annotations

import re
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.crud.base_crud import CRUDBase
from app.models.auth_models import Role
from app.schemas.permission_schemas import RoleCreate, RoleUpdate


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-")
    return slug.lower()


class CRUDRole(CRUDBase[Role, RoleCreate, RoleUpdate]):
    async def get_by_slug(self, db: AsyncSession, *, slug: str) -> Optional[Role]:
        result = await db.execute(select(Role).where(Role.slug == slug))
        return result.scalars().first()

    async def ensure_unique_slug(self, db: AsyncSession, *, base_slug: str) -> str:
        candidate = base_slug
        suffix = 1
        while True:
            existing = await self.get_by_slug(db, slug=candidate)
            if not existing:
                return candidate
            candidate = f"{base_slug}-{suffix}"
            suffix += 1

    async def create(self, db: AsyncSession, *, obj_in: RoleCreate) -> Role:  # type: ignore[override]
        data = obj_in.model_dump()
        display_name = data.pop("display_name")
        description = data.pop("description", None)
        is_system = data.pop("is_system", False)
        slug = data.pop("slug", None)

        if not slug:
            slug = _slugify(display_name)
        slug = await self.ensure_unique_slug(db, base_slug=slug)

        role = Role(
            slug=slug,
            display_name=display_name,
            description=description,
            is_system=is_system,
        )
        db.add(role)
        await db.commit()
        await db.refresh(role)
        return role

    async def update(self, db: AsyncSession, *, db_obj: Role, obj_in: RoleUpdate) -> Role:  # type: ignore[override]
        update_data = obj_in.model_dump(exclude_unset=True)
        if "display_name" in update_data:
            new_name = update_data["display_name"]
            if new_name and not db_obj.is_system:
                db_obj.display_name = new_name
        if "description" in update_data:
            db_obj.description = update_data["description"]
        await db.commit()
        await db.refresh(db_obj)
        return db_obj


role_crud = CRUDRole(Role)
