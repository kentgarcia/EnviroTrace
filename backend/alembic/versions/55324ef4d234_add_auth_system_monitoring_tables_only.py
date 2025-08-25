"""Add auth system monitoring tables only

Revision ID: 55324ef4d234
Revises: faae6f7a83bc
Create Date: 2025-08-25 19:05:56.399982

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '55324ef4d234'
down_revision: Union[str, None] = 'ee733db54643'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create user_sessions table
    op.create_table('user_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('session_token', sa.String(length=255), nullable=False),
        sa.Column('ip_address', postgresql.INET(), nullable=True),
        sa.Column('user_agent', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['auth.users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('session_token'),
        schema='auth'
    )
    op.create_index('idx_auth_user_sessions_created_at', 'user_sessions', ['created_at'], unique=False, schema='auth')
    op.create_index('idx_auth_user_sessions_user_id', 'user_sessions', ['user_id'], unique=False, schema='auth')

    # Create failed_logins table
    op.create_table('failed_logins',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('ip_address', postgresql.INET(), nullable=True),
        sa.Column('user_agent', sa.String(length=500), nullable=True),
        sa.Column('failure_reason', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        schema='auth'
    )
    op.create_index('idx_auth_failed_logins_created_at', 'failed_logins', ['created_at'], unique=False, schema='auth')
    op.create_index('idx_auth_failed_logins_email', 'failed_logins', ['email'], unique=False, schema='auth')
    op.create_index('idx_auth_failed_logins_ip_address', 'failed_logins', ['ip_address'], unique=False, schema='auth')

    # Create activity_logs table
    op.create_table('activity_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('activity_type', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('extra_data', sa.Text(), nullable=True),
        sa.Column('ip_address', postgresql.INET(), nullable=True),
        sa.Column('user_agent', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['auth.users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        schema='auth'
    )
    op.create_index('idx_auth_activity_logs_activity_type', 'activity_logs', ['activity_type'], unique=False, schema='auth')
    op.create_index('idx_auth_activity_logs_created_at', 'activity_logs', ['created_at'], unique=False, schema='auth')
    op.create_index('idx_auth_activity_logs_user_id', 'activity_logs', ['user_id'], unique=False, schema='auth')


def downgrade() -> None:
    """Downgrade schema."""
    # Drop activity_logs table
    op.drop_index('idx_auth_activity_logs_user_id', table_name='activity_logs', schema='auth')
    op.drop_index('idx_auth_activity_logs_created_at', table_name='activity_logs', schema='auth')
    op.drop_index('idx_auth_activity_logs_activity_type', table_name='activity_logs', schema='auth')
    op.drop_table('activity_logs', schema='auth')

    # Drop failed_logins table
    op.drop_index('idx_auth_failed_logins_ip_address', table_name='failed_logins', schema='auth')
    op.drop_index('idx_auth_failed_logins_email', table_name='failed_logins', schema='auth')
    op.drop_index('idx_auth_failed_logins_created_at', table_name='failed_logins', schema='auth')
    op.drop_table('failed_logins', schema='auth')

    # Drop user_sessions table
    op.drop_index('idx_auth_user_sessions_user_id', table_name='user_sessions', schema='auth')
    op.drop_index('idx_auth_user_sessions_created_at', table_name='user_sessions', schema='auth')
    op.drop_table('user_sessions', schema='auth')
