"""SQLAlchemy models for application-wide audit logging."""

from sqlalchemy import Column, DateTime, Integer, String, Index
from sqlalchemy.dialects import postgresql
from sqlalchemy.sql import func, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("idx_app_audit_event_id", "event_id"),
        Index("idx_app_audit_module_name", "module_name"),
        Index("idx_app_audit_occurred_at", "occurred_at"),
        Index("idx_app_audit_user_id", "user_id"),
        Index("idx_app_audit_status_code", "status_code"),
        {"schema": "app_audit"},
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    event_id = Column(String(150), nullable=False)
    event_name = Column(String(255), nullable=False)
    module_name = Column(String(255), nullable=False)

    http_method = Column(String(16), nullable=True)
    route_path = Column(String(300), nullable=True)
    query_params = Column(postgresql.JSONB, nullable=True)

    request_payload = Column(postgresql.JSONB, nullable=True)
    response_payload = Column(postgresql.JSONB, nullable=True)
    response_summary = Column(String(500), nullable=True)
    status_code = Column(Integer, nullable=True)

    occurred_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    occurred_at_iso = Column(String(64), nullable=False)
    occurred_at_gmt = Column(String(64), nullable=False)

    user_id = Column(UUID(as_uuid=True), nullable=True)
    user_email = Column(String(255), nullable=True)
    session_id = Column(UUID(as_uuid=True), nullable=True)
    user_session = Column(postgresql.JSONB, nullable=True)

    ip_address = Column(postgresql.INET, nullable=True)
    user_agent = Column(String(512), nullable=True)
    latency_ms = Column(Integer, nullable=True)

    error = Column(postgresql.JSONB, nullable=True)
    extra = Column(postgresql.JSONB, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
