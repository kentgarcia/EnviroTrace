"""Administrative endpoints for retrieving audit logs."""

import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.apis.deps import get_db_session, require_permissions
from app.crud.crud_audit_log import audit_log_crud
from app.models.auth_models import User
from app.schemas.audit_schemas import AuditLogFilter, AuditLogListResponse, AuditLogResponse

router = APIRouter(prefix="/audit", tags=["Audit"])


@router.get("/logs", response_model=AuditLogListResponse)
async def list_audit_logs(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_permissions(["audit_log.view"])),
    module_name: Optional[str] = Query(None, description="Filter by module name"),
    user_email: Optional[str] = Query(None, description="Filter by acting user email"),
    event_id: Optional[str] = Query(None, description="Filter by event identifier"),
    status_code: Optional[int] = Query(None, ge=100, le=599),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    search: Optional[str] = Query(None, description="Free-text search across event name, route, and user"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
):
    filters = AuditLogFilter(
        module_name=module_name,
        user_email=user_email,
        event_id=event_id,
        status_code=status_code,
        date_from=date_from,
        date_to=date_to,
        search=search,
        skip=skip,
        limit=limit,
    )

    logs, total = await audit_log_crud.get_logs(db, filters=filters)
    return AuditLogListResponse(items=logs, total=total)


@router.get("/logs/{log_id}", response_model=AuditLogResponse)
async def get_audit_log(
    log_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_permissions(["audit_log.view"])),
):
    log = await audit_log_crud.get(db, id=log_id)
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit log not found")
    return log
