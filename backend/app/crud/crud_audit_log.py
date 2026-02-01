"""CRUD helpers for audit logs."""

from typing import List, Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_

from app.crud.base_crud import CRUDBase
from app.models.audit_models import AuditLog
from app.schemas.audit_schemas import AuditLogCreate, AuditLogFilter


class CRUDAuditLog(CRUDBase[AuditLog, AuditLogCreate, AuditLogCreate]):
    async def create_log(self, db: AsyncSession, *, obj_in: AuditLogCreate) -> AuditLog:
        """Persist a new audit log entry."""
        return await self.create(db, obj_in=obj_in)

    async def get_logs(
        self,
        db: AsyncSession,
        *,
        filters: AuditLogFilter
    ) -> Tuple[List[AuditLog], int]:
        """Retrieve audit logs with optional filtering and pagination."""
        query = select(AuditLog)
        total_query = select(func.count(AuditLog.id))
        conditions = []

        if filters.module_name:
            conditions.append(AuditLog.module_name == filters.module_name)
        if filters.user_email:
            conditions.append(AuditLog.user_email == filters.user_email)
        if filters.event_id:
            conditions.append(AuditLog.event_id == filters.event_id)
        if filters.status_code is not None:
            conditions.append(AuditLog.status_code == filters.status_code)
        if filters.date_from:
            conditions.append(AuditLog.occurred_at >= filters.date_from)
        if filters.date_to:
            conditions.append(AuditLog.occurred_at <= filters.date_to)
        if filters.search:
            search_term = f"%{filters.search}%"
            conditions.append(
                or_(
                    AuditLog.event_name.ilike(search_term),
                    AuditLog.route_path.ilike(search_term),
                    AuditLog.user_email.ilike(search_term),
                    AuditLog.module_name.ilike(search_term),
                )
            )

        if conditions:
            combined = and_(*conditions)
            query = query.where(combined)
            total_query = total_query.where(combined)

        total_result = await db.execute(total_query)
        total = total_result.scalar() or 0

        query = query.order_by(AuditLog.occurred_at.desc()).offset(filters.skip).limit(filters.limit)

        result = await db.execute(query)
        return result.scalars().all(), total


audit_log_crud = CRUDAuditLog(AuditLog)
