"""Pydantic schemas for audit logging."""

from __future__ import annotations

import uuid
from datetime import datetime
from ipaddress import IPv4Address, IPv6Address
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


class AuditLogBase(BaseModel):
    event_id: str = Field(..., description="Unique identifier for the audited event")
    event_name: str = Field(..., description="Human readable event name")
    module_name: str = Field(..., description="Module or feature where the event happened")

    http_method: Optional[str] = Field(None, max_length=16)
    route_path: Optional[str] = Field(None, description="Path that triggered the event")
    query_params: Optional[Dict[str, Any]] = None

    request_payload: Optional[Dict[str, Any]] = Field(None, description="Captured request payload with masking applied")
    response_payload: Optional[Dict[str, Any]] = Field(None, description="Captured response payload with masking applied")
    response_summary: Optional[str] = Field(None, description="Text summary when full payload is unavailable")
    status_code: Optional[int] = None

    occurred_at: datetime = Field(..., description="UTC timestamp of the event")
    occurred_at_iso: str = Field(..., description="ISO formatted timestamp")
    occurred_at_gmt: str = Field(..., description="GMT formatted timestamp")

    user_id: Optional[uuid.UUID] = None
    user_email: Optional[str] = None
    session_id: Optional[uuid.UUID] = None
    user_session: Optional[Dict[str, Any]] = Field(None, description="Session context such as IP and user agent")

    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    latency_ms: Optional[int] = Field(None, ge=0)

    error: Optional[Dict[str, Any]] = None
    extra: Optional[Dict[str, Any]] = None


class AuditLogCreate(AuditLogBase):
    pass


class AuditLogResponse(AuditLogBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

    @field_validator("ip_address", mode="before")
    @classmethod
    def serialize_ip(cls, value: Any) -> Optional[str]:
        if value is None:
            return None
        if isinstance(value, (IPv4Address, IPv6Address)):
            return str(value)
        return str(value)


class AuditLogFilter(BaseModel):
    module_name: Optional[str] = None
    user_email: Optional[str] = None
    event_id: Optional[str] = None
    status_code: Optional[int] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    search: Optional[str] = None
    skip: int = Field(0, ge=0)
    limit: int = Field(50, ge=1, le=500)


class AuditLogListResponse(BaseModel):
    items: List[AuditLogResponse]
    total: int
