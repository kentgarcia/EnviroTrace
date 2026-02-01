"""add permission management system

Revision ID: add_permission_management_20260202
Revises: add_audit_logging_20260201
Create Date: 2026-02-02

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "add_permission_management_20260202"
down_revision: Union[str, None] = "add_audit_logging_20260201"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create permission tables and seed default permissions."""
    
    # Create permission_action enum
    op.execute("""
        CREATE TYPE app_auth.permission_action AS ENUM ('create', 'view', 'update', 'delete')
    """)
    
    # Create permissions table
    op.create_table(
        "permissions",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("module_name", sa.String(length=100), nullable=False),
        sa.Column("entity_type", sa.String(length=100), nullable=False),
        sa.Column("action", postgresql.ENUM('create', 'view', 'update', 'delete', name='permission_action', schema='app_auth'), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
        schema="app_auth",
    )
    
    op.create_index("idx_auth_permissions_name", "permissions", ["name"], schema="app_auth")
    op.create_index("idx_auth_permissions_module", "permissions", ["module_name"], schema="app_auth")
    op.create_index("idx_auth_permissions_entity", "permissions", ["entity_type"], schema="app_auth")
    
    # Create role_permissions table
    op.create_table(
        "role_permissions",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), nullable=False),
        sa.Column("role", postgresql.ENUM('admin', 'urban_greening', 'government_emission', name='user_role', schema='app_auth'), nullable=False),
        sa.Column("permission_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["permission_id"], ["app_auth.permissions.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("role", "permission_id", name="uq_role_permissions_role_permission"),
        schema="app_auth",
    )
    
    op.create_index("idx_auth_role_permissions_role", "role_permissions", ["role"], schema="app_auth")
    op.create_index("idx_auth_role_permissions_permission_id", "role_permissions", ["permission_id"], schema="app_auth")
    
    # Seed permissions - Admin Module
    op.execute("""
        INSERT INTO app_auth.permissions (name, description, module_name, entity_type, action) VALUES
        ('user.create', 'Create users', 'admin', 'user', 'create'),
        ('user.view', 'View users', 'admin', 'user', 'view'),
        ('user.update', 'Update users', 'admin', 'user', 'update'),
        ('user.delete', 'Delete users', 'admin', 'user', 'delete'),
        ('role.view', 'View roles', 'admin', 'role', 'view'),
        ('role.update', 'Assign/remove roles', 'admin', 'role', 'update'),
        ('permission.view', 'View permissions', 'admin', 'permission', 'view'),
        ('permission.update', 'Manage role permissions', 'admin', 'permission', 'update'),
        ('audit_log.view', 'View audit logs', 'admin', 'audit_log', 'view'),
        ('session.view', 'View sessions', 'admin', 'session', 'view'),
        ('session.delete', 'Terminate sessions', 'admin', 'session', 'delete'),
        ('dashboard.view', 'View admin dashboard', 'admin', 'dashboard', 'view')
    """)
    
    # Seed permissions - Emission Module
    op.execute("""
        INSERT INTO app_auth.permissions (name, description, module_name, entity_type, action) VALUES
        ('office.create', 'Create emission offices', 'emission', 'office', 'create'),
        ('office.view', 'View emission offices', 'emission', 'office', 'view'),
        ('office.update', 'Update emission offices', 'emission', 'office', 'update'),
        ('office.delete', 'Delete emission offices', 'emission', 'office', 'delete'),
        ('vehicle.create', 'Create vehicles', 'emission', 'vehicle', 'create'),
        ('vehicle.view', 'View vehicles', 'emission', 'vehicle', 'view'),
        ('vehicle.update', 'Update vehicles', 'emission', 'vehicle', 'update'),
        ('vehicle.delete', 'Delete vehicles', 'emission', 'vehicle', 'delete'),
        ('test.create', 'Create emission tests', 'emission', 'test', 'create'),
        ('test.view', 'View emission tests', 'emission', 'test', 'view'),
        ('test.update', 'Update emission tests', 'emission', 'test', 'update'),
        ('test.delete', 'Delete emission tests', 'emission', 'test', 'delete'),
        ('schedule.create', 'Create test schedules', 'emission', 'schedule', 'create'),
        ('schedule.view', 'View test schedules', 'emission', 'schedule', 'view'),
        ('schedule.update', 'Update test schedules', 'emission', 'schedule', 'update'),
        ('schedule.delete', 'Delete test schedules', 'emission', 'schedule', 'delete')
    """)
    
    # Seed permissions - Urban Greening Module
    op.execute("""
        INSERT INTO app_auth.permissions (name, description, module_name, entity_type, action) VALUES
        ('tree_species.create', 'Create tree species', 'urban_greening', 'tree_species', 'create'),
        ('tree_species.view', 'View tree species', 'urban_greening', 'tree_species', 'view'),
        ('tree_species.update', 'Update tree species', 'urban_greening', 'tree_species', 'update'),
        ('tree_species.delete', 'Delete tree species', 'urban_greening', 'tree_species', 'delete'),
        ('tree.create', 'Create tree inventory records', 'urban_greening', 'tree', 'create'),
        ('tree.view', 'View tree inventory records', 'urban_greening', 'tree', 'view'),
        ('tree.update', 'Update tree inventory records', 'urban_greening', 'tree', 'update'),
        ('tree.delete', 'Delete tree inventory records', 'urban_greening', 'tree', 'delete'),
        ('tree_project.create', 'Create tree projects', 'urban_greening', 'tree_project', 'create'),
        ('tree_project.view', 'View tree projects', 'urban_greening', 'tree_project', 'view'),
        ('tree_project.update', 'Update tree projects', 'urban_greening', 'tree_project', 'update'),
        ('tree_project.delete', 'Delete tree projects', 'urban_greening', 'tree_project', 'delete'),
        ('tree_request.create', 'Create tree management requests', 'urban_greening', 'tree_request', 'create'),
        ('tree_request.view', 'View tree management requests', 'urban_greening', 'tree_request', 'view'),
        ('tree_request.update', 'Update tree management requests', 'urban_greening', 'tree_request', 'update'),
        ('tree_request.delete', 'Delete tree management requests', 'urban_greening', 'tree_request', 'delete'),
        ('monitoring_log.create', 'Create tree monitoring logs', 'urban_greening', 'monitoring_log', 'create'),
        ('monitoring_log.view', 'View tree monitoring logs', 'urban_greening', 'monitoring_log', 'view'),
        ('monitoring_log.update', 'Update tree monitoring logs', 'urban_greening', 'monitoring_log', 'update'),
        ('monitoring_log.delete', 'Delete tree monitoring logs', 'urban_greening', 'monitoring_log', 'delete'),
        ('urban_project.create', 'Create urban greening projects', 'urban_greening', 'urban_project', 'create'),
        ('urban_project.view', 'View urban greening projects', 'urban_greening', 'urban_project', 'view'),
        ('urban_project.update', 'Update urban greening projects', 'urban_greening', 'urban_project', 'update'),
        ('urban_project.delete', 'Delete urban greening projects', 'urban_greening', 'urban_project', 'delete'),
        ('planting.create', 'Create planting records', 'urban_greening', 'planting', 'create'),
        ('planting.view', 'View planting records', 'urban_greening', 'planting', 'view'),
        ('planting.update', 'Update planting records', 'urban_greening', 'planting', 'update'),
        ('planting.delete', 'Delete planting records', 'urban_greening', 'planting', 'delete'),
        ('sapling_collection.create', 'Create sapling collections', 'urban_greening', 'sapling_collection', 'create'),
        ('sapling_collection.view', 'View sapling collections', 'urban_greening', 'sapling_collection', 'view'),
        ('sapling_collection.update', 'Update sapling collections', 'urban_greening', 'sapling_collection', 'update'),
        ('sapling_collection.delete', 'Delete sapling collections', 'urban_greening', 'sapling_collection', 'delete'),
        ('sapling_request.create', 'Create sapling requests', 'urban_greening', 'sapling_request', 'create'),
        ('sapling_request.view', 'View sapling requests', 'urban_greening', 'sapling_request', 'view'),
        ('sapling_request.update', 'Update sapling requests', 'urban_greening', 'sapling_request', 'update'),
        ('sapling_request.delete', 'Delete sapling requests', 'urban_greening', 'sapling_request', 'delete'),
        ('fee.create', 'Create fee records', 'urban_greening', 'fee', 'create'),
        ('fee.view', 'View fee records', 'urban_greening', 'fee', 'view'),
        ('fee.update', 'Update fee records', 'urban_greening', 'fee', 'update'),
        ('fee.delete', 'Delete fee records', 'urban_greening', 'fee', 'delete'),
        ('processing_standard.create', 'Create processing standards', 'urban_greening', 'processing_standard', 'create'),
        ('processing_standard.view', 'View processing standards', 'urban_greening', 'processing_standard', 'view'),
        ('processing_standard.update', 'Update processing standards', 'urban_greening', 'processing_standard', 'update'),
        ('processing_standard.delete', 'Delete processing standards', 'urban_greening', 'processing_standard', 'delete')
    """)
    
    # Assign all permissions to admin role
    op.execute("""
        INSERT INTO app_auth.role_permissions (role, permission_id)
        SELECT 'admin', id FROM app_auth.permissions
    """)
    
    # Assign urban greening permissions to urban_greening role
    op.execute("""
        INSERT INTO app_auth.role_permissions (role, permission_id)
        SELECT 'urban_greening', id FROM app_auth.permissions
        WHERE module_name = 'urban_greening'
    """)
    
    # Assign emission permissions to government_emission role
    op.execute("""
        INSERT INTO app_auth.role_permissions (role, permission_id)
        SELECT 'government_emission', id FROM app_auth.permissions
        WHERE module_name = 'emission'
    """)


def downgrade() -> None:
    """Drop permission tables and enum."""
    op.drop_index("idx_auth_role_permissions_permission_id", table_name="role_permissions", schema="app_auth")
    op.drop_index("idx_auth_role_permissions_role", table_name="role_permissions", schema="app_auth")
    op.drop_table("role_permissions", schema="app_auth")
    
    op.drop_index("idx_auth_permissions_entity", table_name="permissions", schema="app_auth")
    op.drop_index("idx_auth_permissions_module", table_name="permissions", schema="app_auth")
    op.drop_index("idx_auth_permissions_name", table_name="permissions", schema="app_auth")
    op.drop_table("permissions", schema="app_auth")
    
    op.execute("DROP TYPE app_auth.permission_action")
