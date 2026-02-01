"""add audit logging infrastructure

Revision ID: add_audit_logging_20260201
Revises: fix_email_soft_delete_001
Create Date: 2026-02-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "add_audit_logging_20260201"
down_revision: Union[str, None] = "fix_email_soft_delete_001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create audit log schema and table."""
    op.execute("CREATE SCHEMA IF NOT EXISTS app_audit")

    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), nullable=False),
        sa.Column("event_id", sa.String(length=150), nullable=False),
        sa.Column("event_name", sa.String(length=255), nullable=False),
        sa.Column("module_name", sa.String(length=255), nullable=False),
        sa.Column("http_method", sa.String(length=16), nullable=True),
        sa.Column("route_path", sa.String(length=300), nullable=True),
        sa.Column("query_params", postgresql.JSONB, nullable=True),
        sa.Column("request_payload", postgresql.JSONB, nullable=True),
        sa.Column("response_payload", postgresql.JSONB, nullable=True),
        sa.Column("response_summary", sa.String(length=500), nullable=True),
        sa.Column("status_code", sa.Integer(), nullable=True),
        sa.Column("occurred_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("occurred_at_iso", sa.String(length=64), nullable=False),
        sa.Column("occurred_at_gmt", sa.String(length=64), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("user_email", sa.String(length=255), nullable=True),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("user_session", postgresql.JSONB, nullable=True),
        sa.Column("ip_address", postgresql.INET, nullable=True),
        sa.Column("user_agent", sa.String(length=512), nullable=True),
        sa.Column("latency_ms", sa.Integer(), nullable=True),
        sa.Column("error", postgresql.JSONB, nullable=True),
        sa.Column("extra", postgresql.JSONB, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        schema="app_audit",
    )

    op.create_index("idx_app_audit_event_id", "audit_logs", ["event_id"], schema="app_audit")
    op.create_index("idx_app_audit_module_name", "audit_logs", ["module_name"], schema="app_audit")
    op.create_index("idx_app_audit_occurred_at", "audit_logs", ["occurred_at"], schema="app_audit")
    op.create_index("idx_app_audit_user_id", "audit_logs", ["user_id"], schema="app_audit")
    op.create_index("idx_app_audit_status_code", "audit_logs", ["status_code"], schema="app_audit")


def downgrade() -> None:
    """Drop audit log schema artifacts."""
    op.drop_index("idx_app_audit_status_code", table_name="audit_logs", schema="app_audit")
    op.drop_index("idx_app_audit_user_id", table_name="audit_logs", schema="app_audit")
    op.drop_index("idx_app_audit_occurred_at", table_name="audit_logs", schema="app_audit")
    op.drop_index("idx_app_audit_module_name", table_name="audit_logs", schema="app_audit")
    op.drop_index("idx_app_audit_event_id", table_name="audit_logs", schema="app_audit")
    op.drop_table("audit_logs", schema="app_audit")
    op.execute("DROP SCHEMA IF EXISTS app_audit CASCADE")
