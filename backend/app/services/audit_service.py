"""Service helper that centralises audit log creation."""

from __future__ import annotations

import json
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple

from fastapi import Request
from starlette.datastructures import Headers
from starlette.types import Scope
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import security
from app.db.database import AsyncSessionLocal
from app.crud.crud_audit_log import audit_log_crud
from app.crud.crud_session import session_crud
from app.crud.crud_user import user as crud_user
from app.schemas.audit_schemas import AuditLogCreate

SENSITIVE_FIELD_PATTERN = re.compile("password|token|secret|authorization|api_key", re.IGNORECASE)
MAX_PAYLOAD_CHARS = 65536

MODULE_MAPPINGS: Dict[str, str] = {
    "/api/v1/auth": "Authentication",
    "/api/v1/admin": "Administration",
    "/api/v1/tree-inventory": "Tree Inventory",
    "/api/v1/tree-management": "Tree Management",
    "/api/v1/planting": "Planting Records",
    "/api/v1/urban-greening-projects": "Urban Greening Projects",
    "/api/v1/emission": "Emission",
    "/api/v1/fees": "Fee Management",
    "/api/v1/dashboard": "Dashboard",
    "/api/v1/upload": "File Uploads",
    "/api/v1/test-schedules": "Test Schedules",
    "/api/v1/gemini": "AI Services",
}


class AuditService:
    """Encapsulates the logic needed to persist audit logs."""

    def __init__(self) -> None:
        self._module_mappings = MODULE_MAPPINGS

    async def write_request_audit(
        self,
        *,
        request: Request,
        request_body: Optional[bytes],
        response_status: int,
        response_payload: Optional[Dict[str, Any]] = None,
        response_summary: Optional[str] = None,
        error: Optional[Dict[str, Any]] = None,
        latency_ms: Optional[int] = None,
    ) -> None:
        occurred_at = datetime.now(timezone.utc)
        occurred_at_iso = occurred_at.isoformat()
        occurred_at_gmt = occurred_at.strftime("%a, %d %b %Y %H:%M:%S GMT")

        ip_address = self._resolve_ip(request)
        user_agent_header = request.headers.get("user-agent")

        async with AsyncSessionLocal() as db:
            token = self._extract_bearer_token(request.headers)
            user_id, user_email, session_id, user_session_json = await self._resolve_user_context(
                db, token, ip_address, user_agent_header
            )

            request_payload = self._build_request_payload(request_body)
            event_name, event_id = self._build_event_metadata(request.scope, request.method)
            module_name = self._resolve_module(request.url.path)

            log_entry = AuditLogCreate(
                event_id=event_id,
                event_name=event_name,
                module_name=module_name,
                http_method=request.method,
                route_path=request.url.path,
                query_params=dict(request.query_params) or None,
                request_payload=request_payload,
                response_payload=self._mask_payload(response_payload) if response_payload else None,
                response_summary=response_summary,
                status_code=response_status,
                occurred_at=occurred_at,
                occurred_at_iso=occurred_at_iso,
                occurred_at_gmt=occurred_at_gmt,
                user_id=user_id,
                user_email=user_email,
                session_id=session_id,
                user_session=user_session_json,
                ip_address=ip_address,
                user_agent=user_agent_header,
                latency_ms=latency_ms,
                error=error,
                extra=None,
            )

            try:
                await audit_log_crud.create_log(db, obj_in=log_entry)
            except Exception:
                # Last line of defence: never disrupt user flow because of audit issues.
                await db.rollback()

    @staticmethod
    def _extract_bearer_token(headers: Headers) -> Optional[str]:
        auth_header = headers.get("Authorization")
        if not auth_header:
            return None
        if not auth_header.lower().startswith("bearer "):
            return None
        return auth_header.split(" ", 1)[1].strip() or None

    async def _resolve_user_context(
        self,
        db: AsyncSession,
        token: Optional[str],
        ip_address: Optional[str],
        user_agent: Optional[str],
    ) -> Tuple[Optional[uuid.UUID], Optional[str], Optional[uuid.UUID], Dict[str, Any]]:
        default_session_payload: Dict[str, Any] = {
            "id": None,
            "ip": ip_address,
            "user_agent": user_agent,
        }

        if not token:
            return None, None, None, default_session_payload

        payload = security.decode_token(token)
        if not payload:
            return None, None, None, default_session_payload

        user_id_str = payload.get("sub")
        if not user_id_str:
            return None, None, None, default_session_payload

        try:
            user_uuid = uuid.UUID(user_id_str)
        except ValueError:
            return None, None, None, default_session_payload

        session = await session_crud.get_active_session_by_token(db, token=token)
        session_payload = default_session_payload.copy()
        session_id: Optional[uuid.UUID] = None
        user_email: Optional[str] = None

        if session:
            session_id = session.id
            session_payload["id"] = str(session.id)
            session_payload["ip"] = str(session.ip_address) if session.ip_address else session_payload["ip"]
            session_payload["user_agent"] = session.user_agent or session_payload["user_agent"]
        user = await crud_user.get(db, id=user_uuid)
        if user:
            user_email = user.email
        else:
            # Fallback to email claim if provided
            user_email = payload.get("email")

        return user_uuid, user_email, session_id, session_payload

    def _build_event_metadata(self, scope: Scope, method: str) -> Tuple[str, str]:
        path = scope.get("path", "") or ""
        event_name = f"{method.upper()} {path}"
        slug = re.sub(r"[^a-zA-Z0-9]+", "_", event_name).strip("_")
        event_id = slug.upper()
        return event_name, event_id

    def _resolve_module(self, path: str) -> str:
        for prefix, module in self._module_mappings.items():
            if path.startswith(prefix):
                return module
        return "General"

    @staticmethod
    def _resolve_ip(request: Request) -> Optional[str]:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        client = request.client
        if client and client.host:
            return client.host
        return None

    def _build_request_payload(self, body: Optional[bytes]) -> Optional[Dict[str, Any]]:
        if not body:
            return None

        trimmed_body = body[:MAX_PAYLOAD_CHARS]
        if len(trimmed_body) < len(body):
            return {"_raw": "Payload truncated"}

        try:
            json_payload = json.loads(trimmed_body.decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            text_snippet = trimmed_body.decode("utf-8", errors="ignore")
            return {"_raw": text_snippet}

        return self._mask_payload(json_payload)

    def _mask_payload(self, payload: Any) -> Any:
        if payload is None:
            return None
        if isinstance(payload, dict):
            masked: Dict[str, Any] = {}
            for key, value in payload.items():
                if isinstance(value, (dict, list)):
                    masked[key] = self._mask_payload(value)
                else:
                    masked[key] = self._mask_value(key, value)
            return masked
        if isinstance(payload, list):
            return [self._mask_payload(item) for item in payload]
        return payload

    @staticmethod
    def _mask_value(key: str, value: Any) -> Any:
        if SENSITIVE_FIELD_PATTERN.search(key or ""):
            return "***"
        return value


audit_service = AuditService()
