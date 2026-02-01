"""FastAPI middleware that captures API activity for auditing."""

from __future__ import annotations

import json
import time
from typing import Any, Dict, Optional, Tuple

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response, StreamingResponse
from starlette.types import Message

from app.services.audit_service import audit_service, MAX_PAYLOAD_CHARS


class AuditLoggingMiddleware(BaseHTTPMiddleware):
    """Intercepts requests/responses and forwards them to the audit service."""

    async def dispatch(self, request: Request, call_next) -> Response:  # type: ignore[override]
        # Skip logging OPTIONS requests (CORS preflight)
        if request.method.upper() == "OPTIONS":
            return await call_next(request)

        started = time.perf_counter()
        body_bytes = await self._capture_request_body(request)

        try:
            response = await call_next(request)
        except Exception as exc:
            latency_ms = int((time.perf_counter() - started) * 1000)
            await audit_service.write_request_audit(
                request=request,
                request_body=body_bytes,
                response_status=500,
                response_summary="Unhandled server error",
                error={"type": exc.__class__.__name__, "message": str(exc)},
                latency_ms=latency_ms,
            )
            raise

        # Capture response body by reading it
        response_body = b""
        async for chunk in response.body_iterator:
            response_body += chunk

        latency_ms = int((time.perf_counter() - started) * 1000)
        response_payload, response_summary = self._extract_response_payload_from_body(
            response_body, response
        )

        await audit_service.write_request_audit(
            request=request,
            request_body=body_bytes,
            response_status=response.status_code,
            response_payload=response_payload,
            response_summary=response_summary,
            error=None,
            latency_ms=latency_ms,
        )

        # Return a new response with the captured body
        return Response(
            content=response_body,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.media_type,
        )

    async def _capture_request_body(self, request: Request) -> Optional[bytes]:
        if request.method.upper() in {"GET", "DELETE", "OPTIONS"}:
            return None

        try:
            body = await request.body()
        except Exception:
            return None

        async def receive() -> dict:  # type: ignore[override]
            return {"type": "http.request", "body": body, "more_body": False}

        request._receive = receive  # type: ignore[attr-defined]
        return body if body else None

    def _extract_response_payload_from_body(
        self, body: bytes, response: Response
    ) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        if not body:
            return None, self._build_response_summary(response)

        truncated = body[:MAX_PAYLOAD_CHARS]
        if len(truncated) < len(body):
            return None, "Response truncated"

        try:
            payload = json.loads(truncated.decode("utf-8"))
            if isinstance(payload, dict):
                return payload, None
            return {"_raw": payload}, None
        except (ValueError, UnicodeDecodeError):
            snippet = truncated.decode("utf-8", errors="ignore")
            return None, snippet[:512] if snippet else None

    @staticmethod
    def _build_response_summary(response: Response) -> Optional[str]:
        content_type = response.headers.get("content-type")
        if content_type:
            return f"{response.status_code} {content_type}"
        return str(response.status_code)
