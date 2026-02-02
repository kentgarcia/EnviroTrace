"""add performance indexes for admin endpoints

Revision ID: add_performance_indexes_20260202
Revises: add_permission_management_20260202
Create Date: 2026-02-02 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_performance_indexes_20260202'
down_revision = 'add_permission_management_20260202'
branch_labels = None
depends_on = None


def upgrade():
    """Add indexes for commonly queried fields to improve performance"""
    
    # Users table indexes
    op.create_index(
        'idx_users_email_not_deleted',
        'users',
        ['email'],
        unique=False,
        postgresql_where=sa.text('deleted_at IS NULL'),
        schema='app_auth'
    )
    op.create_index(
        'idx_users_deleted_at',
        'users',
        ['deleted_at'],
        unique=False,
        schema='app_auth'
    )
    op.create_index(
        'idx_users_created_at_desc',
        'users',
        [sa.text('created_at DESC')],
        unique=False,
        schema='app_auth'
    )
    
    # Profile table indexes for search
    op.create_index(
        'idx_profiles_first_name',
        'profiles',
        ['first_name'],
        unique=False,
        postgresql_using='gin',
        postgresql_ops={'first_name': 'gin_trgm_ops'},
        schema='app_auth'
    )
    op.create_index(
        'idx_profiles_last_name',
        'profiles',
        ['last_name'],
        unique=False,
        postgresql_using='gin',
        postgresql_ops={'last_name': 'gin_trgm_ops'},
        schema='app_auth'
    )
    
    # Sessions table indexes
    op.create_index(
        'idx_sessions_user_id_active',
        'sessions',
        ['user_id', 'is_active'],
        unique=False,
        schema='app_auth'
    )
    op.create_index(
        'idx_sessions_is_active',
        'sessions',
        ['is_active'],
        unique=False,
        schema='app_auth'
    )
    op.create_index(
        'idx_sessions_device_type',
        'sessions',
        ['device_type'],
        unique=False,
        schema='app_auth'
    )
    op.create_index(
        'idx_sessions_last_activity_at_desc',
        'sessions',
        [sa.text('last_activity_at DESC')],
        unique=False,
        schema='app_auth'
    )
    
    # Audit logs table indexes
    op.create_index(
        'idx_audit_logs_module_name',
        'audit_logs',
        ['module_name'],
        unique=False,
        schema='app_auth'
    )
    op.create_index(
        'idx_audit_logs_user_email',
        'audit_logs',
        ['user_email'],
        unique=False,
        schema='app_auth'
    )
    op.create_index(
        'idx_audit_logs_event_id',
        'audit_logs',
        ['event_id'],
        unique=False,
        schema='app_auth'
    )
    op.create_index(
        'idx_audit_logs_status_code',
        'audit_logs',
        ['status_code'],
        unique=False,
        schema='app_auth'
    )
    op.create_index(
        'idx_audit_logs_occurred_at_desc',
        'audit_logs',
        [sa.text('occurred_at DESC')],
        unique=False,
        schema='app_auth'
    )
    
    # Composite index for audit log filtering
    op.create_index(
        'idx_audit_logs_module_status_occurred',
        'audit_logs',
        ['module_name', 'status_code', sa.text('occurred_at DESC')],
        unique=False,
        schema='app_auth'
    )
    
    # User roles mapping indexes
    op.create_index(
        'idx_user_roles_user_id',
        'user_roles',
        ['user_id'],
        unique=False,
        schema='app_auth'
    )
    op.create_index(
        'idx_user_roles_role_id',
        'user_roles',
        ['role_id'],
        unique=False,
        schema='app_auth'
    )
    
    # Role permissions mapping indexes
    op.create_index(
        'idx_role_permissions_role_id',
        'role_permissions',
        ['role_id'],
        unique=False,
        schema='app_auth'
    )
    op.create_index(
        'idx_role_permissions_permission_id',
        'role_permissions',
        ['permission_id'],
        unique=False,
        schema='app_auth'
    )


def downgrade():
    """Remove performance indexes"""
    
    # Role permissions indexes
    op.drop_index('idx_role_permissions_permission_id', table_name='role_permissions', schema='app_auth')
    op.drop_index('idx_role_permissions_role_id', table_name='role_permissions', schema='app_auth')
    
    # User roles indexes
    op.drop_index('idx_user_roles_role_id', table_name='user_roles', schema='app_auth')
    op.drop_index('idx_user_roles_user_id', table_name='user_roles', schema='app_auth')
    
    # Audit logs indexes
    op.drop_index('idx_audit_logs_module_status_occurred', table_name='audit_logs', schema='app_auth')
    op.drop_index('idx_audit_logs_occurred_at_desc', table_name='audit_logs', schema='app_auth')
    op.drop_index('idx_audit_logs_status_code', table_name='audit_logs', schema='app_auth')
    op.drop_index('idx_audit_logs_event_id', table_name='audit_logs', schema='app_auth')
    op.drop_index('idx_audit_logs_user_email', table_name='audit_logs', schema='app_auth')
    op.drop_index('idx_audit_logs_module_name', table_name='audit_logs', schema='app_auth')
    
    # Sessions indexes
    op.drop_index('idx_sessions_last_activity_at_desc', table_name='sessions', schema='app_auth')
    op.drop_index('idx_sessions_device_type', table_name='sessions', schema='app_auth')
    op.drop_index('idx_sessions_is_active', table_name='sessions', schema='app_auth')
    op.drop_index('idx_sessions_user_id_active', table_name='sessions', schema='app_auth')
    
    # Profile indexes
    op.drop_index('idx_profiles_last_name', table_name='profiles', schema='app_auth')
    op.drop_index('idx_profiles_first_name', table_name='profiles', schema='app_auth')
    
    # Users indexes
    op.drop_index('idx_users_created_at_desc', table_name='users', schema='app_auth')
    op.drop_index('idx_users_deleted_at', table_name='users', schema='app_auth')
    op.drop_index('idx_users_email_not_deleted', table_name='users', schema='app_auth')
