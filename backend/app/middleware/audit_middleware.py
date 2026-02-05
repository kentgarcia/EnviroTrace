"""ASGI middleware that captures API activity for auditing.

Implementation notes:
- Avoids BaseHTTPMiddleware (adds overhead and can cause subtle response issues)
- Does not consume and rebuild the response object
- Schedules audit writes in the background so responses are not delayed by DB writes
"""

from __future__ import annotations

import asyncio
import json
import time
from typing import Any, Dict, Optional, Tuple

from fastapi import Request
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.core.config import settings
from app.services.audit_service import MAX_PAYLOAD_CHARS, audit_service


class AuditLoggingMiddleware:
    """Intercepts requests/responses and forwards them to the audit service."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http" or not settings.AUDIT_LOGGING_ENABLED:
            await self.app(scope, receive, send)
            return

        method = (scope.get("method") or "").upper()
        path = scope.get("path") or ""

        # Skip logging OPTIONS (CORS preflight) only
        if method == "OPTIONS":
            await self.app(scope, receive, send)
            return

        # Skip logging GET requests to audit logs endpoint to avoid recursive logging
        if method == "GET" and path == "/api/v1/admin/audit/logs":
            await self.app(scope, receive, send)
            return

        started = time.perf_counter()

        request_body_parts: list[bytes] = []
        request_body_size = 0

        should_capture_request_body = method not in {"GET", "DELETE", "OPTIONS"}

        async def wrapped_receive() -> Message:
            nonlocal request_body_size
            message = await receive()
            if should_capture_request_body and message.get("type") == "http.request":
                body = message.get("body") or b""
                if body and request_body_size < MAX_PAYLOAD_CHARS:
                    remaining = MAX_PAYLOAD_CHARS - request_body_size
                    chunk = body[:remaining]
                    request_body_parts.append(chunk)
                    request_body_size += len(chunk)
            return message

        response_status: int = 500
        response_headers: list[tuple[bytes, bytes]] = []
        response_body_parts: list[bytes] = []
        response_body_size = 0
        response_truncated = False

        async def schedule_audit_log(
            *,
            request_body: Optional[bytes],
            status_code: int,
            response_body: bytes,
            truncated: bool,
            error: Optional[Dict[str, Any]],
            latency_ms: int,
        ) -> None:
            request = Request(scope, receive=receive)

            response_payload: Optional[Dict[str, Any]] = None
            response_summary: Optional[str] = None

            if error is not None:
                response_summary = "Unhandled server error"
            else:
                if truncated:
                    response_summary = "Response truncated"
                elif response_body:
                    try:
                        payload = json.loads(response_body.decode("utf-8"))
                        if isinstance(payload, dict):
                            response_payload = payload
                        else:
                            response_payload = {"_raw": payload}
                    except (ValueError, UnicodeDecodeError):
                        snippet = response_body.decode("utf-8", errors="ignore")
                        response_summary = snippet[:512] if snippet else None
                else:
                    content_type = None
                    for key, value in response_headers:
                        if key.lower() == b"content-type":
                            content_type = value.decode("utf-8", errors="ignore")
                            break
                    response_summary = f"{status_code} {content_type}" if content_type else str(status_code)

            async def _safe_write() -> None:
                try:
                    await audit_service.write_request_audit(
                        request=request,
                        request_body=request_body,
                        response_status=status_code,
                        response_payload=response_payload,
                        response_summary=response_summary,
                        error=error,
                        latency_ms=latency_ms,
                    )
                except Exception:
                    return

            asyncio.create_task(_safe_write())

        async def wrapped_send(message: Message) -> None:
            nonlocal response_status, response_headers, response_body_size, response_truncated

            message_type = message.get("type")
            if message_type == "http.response.start":
                response_status = int(message.get("status") or 500)
                response_headers = list(message.get("headers") or [])

            if message_type == "http.response.body":
                body = message.get("body") or b""
                if body and not response_truncated and response_body_size < MAX_PAYLOAD_CHARS:
                    remaining = MAX_PAYLOAD_CHARS - response_body_size
                    chunk = body[:remaining]
                    response_body_parts.append(chunk)
                    response_body_size += len(chunk)
                    if len(chunk) < len(body):
                        response_truncated = True
                elif body and response_body_size >= MAX_PAYLOAD_CHARS:
                    response_truncated = True

                more_body = bool(message.get("more_body"))
                if not more_body:
                    latency_ms = int((time.perf_counter() - started) * 1000)
                    request_body = b"".join(request_body_parts) if request_body_parts else None
                    response_body = b"".join(response_body_parts)
                    await schedule_audit_log(
                        request_body=request_body,
                        status_code=response_status,
                        response_body=response_body,
                        truncated=response_truncated,
                        error=None,
                        latency_ms=latency_ms,
                    )

            await send(message)

        try:
            await self.app(scope, wrapped_receive, wrapped_send)
        except Exception as exc:
            latency_ms = int((time.perf_counter() - started) * 1000)
            request_body = b"".join(request_body_parts) if request_body_parts else None
            response_body = b"".join(response_body_parts)
            await schedule_audit_log(
                request_body=request_body,
                status_code=500,
                response_body=response_body,
                truncated=response_truncated,
                error={"type": exc.__class__.__name__, "message": str(exc)},
                latency_ms=latency_ms,
            )
            raise
