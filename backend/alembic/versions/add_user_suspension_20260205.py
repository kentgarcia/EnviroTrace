"""add user suspension

Revision ID: add_user_suspension_20260205
Revises: increase_session_id_length_20260203
Create Date: 2026-02-05

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'add_user_suspension_20260205'
down_revision = 'increase_session_id_length_20260203'
branch_labels = None
depends_on = None


def upgrade():
    # Add suspension fields to users table
    op.add_column(
        'users',
        sa.Column('is_suspended', sa.Boolean(), nullable=False, server_default=sa.false()),
        schema='app_auth'
    )
    op.add_column(
        'users',
        sa.Column('suspended_at', sa.DateTime(timezone=True), nullable=True),
        schema='app_auth'
    )
    op.add_column(
        'users',
        sa.Column('suspended_by_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        schema='app_auth'
    )
    op.add_column(
        'users',
        sa.Column('suspension_reason', sa.Text(), nullable=True),
        schema='app_auth'
    )
    
    # Add index for quick filtering of suspended users
    op.create_index(
        'idx_users_is_suspended',
        'users',
        ['is_suspended'],
        schema='app_auth'
    )
    
    # Add foreign key for suspended_by_user_id
    op.create_foreign_key(
        'fk_users_suspended_by_user_id',
        'users', 'users',
        ['suspended_by_user_id'], ['id'],
        source_schema='app_auth',
        referent_schema='app_auth',
        ondelete='SET NULL'
    )


def downgrade():
    # Drop foreign key first
    op.drop_constraint(
        'fk_users_suspended_by_user_id',
        'users',
        schema='app_auth',
        type_='foreignkey'
    )
    
    # Drop index
    op.drop_index('idx_users_is_suspended', table_name='users', schema='app_auth')
    
    # Drop columns
    op.drop_column('users', 'suspension_reason', schema='app_auth')
    op.drop_column('users', 'suspended_by_user_id', schema='app_auth')
    op.drop_column('users', 'suspended_at', schema='app_auth')
    op.drop_column('users', 'is_suspended', schema='app_auth')
