"""add session device tracking and status

Revision ID: add_session_tracking_001
Revises: c36d6b2550c2
Create Date: 2025-10-28 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_session_tracking_001'
down_revision = 'c36d6b2550c2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create device_type enum
    device_type_enum = postgresql.ENUM('mobile', 'desktop', 'tablet', 'unknown', name='device_type', schema='auth')
    device_type_enum.create(op.get_bind(), checkfirst=True)
    
    # Add new columns to user_sessions table
    op.add_column('user_sessions', sa.Column('device_type', sa.Enum('mobile', 'desktop', 'tablet', 'unknown', name='device_type', schema='auth'), server_default='unknown', nullable=False), schema='auth')
    op.add_column('user_sessions', sa.Column('device_name', sa.String(length=255), nullable=True), schema='auth')
    op.add_column('user_sessions', sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False), schema='auth')
    op.add_column('user_sessions', sa.Column('last_activity_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True), schema='auth')
    op.add_column('user_sessions', sa.Column('termination_reason', sa.String(length=255), nullable=True), schema='auth')
    
    # Create indexes for better query performance
    op.create_index('idx_auth_user_sessions_device_type', 'user_sessions', ['device_type'], unique=False, schema='auth')
    op.create_index('idx_auth_user_sessions_is_active', 'user_sessions', ['is_active'], unique=False, schema='auth')


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_auth_user_sessions_is_active', table_name='user_sessions', schema='auth')
    op.drop_index('idx_auth_user_sessions_device_type', table_name='user_sessions', schema='auth')
    
    # Drop columns
    op.drop_column('user_sessions', 'termination_reason', schema='auth')
    op.drop_column('user_sessions', 'last_activity_at', schema='auth')
    op.drop_column('user_sessions', 'is_active', schema='auth')
    op.drop_column('user_sessions', 'device_name', schema='auth')
    op.drop_column('user_sessions', 'device_type', schema='auth')
    
    # Drop enum type
    device_type_enum = postgresql.ENUM('mobile', 'desktop', 'tablet', 'unknown', name='device_type', schema='auth')
    device_type_enum.drop(op.get_bind(), checkfirst=True)
