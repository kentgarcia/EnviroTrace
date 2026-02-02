"""increase session id length

Revision ID: increase_session_id_length_20260203
Revises: add_session_device_tracking
Create Date: 2026-02-03

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'increase_session_id_length_20260203'
down_revision = 'add_session_device_tracking'
branch_labels = None
depends_on = None


def upgrade():
    # Change supabase_session_id from VARCHAR(255) to TEXT to accommodate long JWT tokens
    # JWT tokens can be 800-1200+ characters
    op.alter_column(
        'user_sessions',
        'supabase_session_id',
        type_=sa.Text(),
        existing_type=sa.String(255),
        existing_nullable=False,
        schema='app_auth'
    )


def downgrade():
    # Revert back to VARCHAR(255)
    # WARNING: This will fail if any tokens are longer than 255 chars
    op.alter_column(
        'user_sessions',
        'supabase_session_id',
        type_=sa.String(255),
        existing_type=sa.Text(),
        existing_nullable=False,
        schema='app_auth'
    )
