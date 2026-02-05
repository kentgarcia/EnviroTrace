"""remove unused permissions

Revision ID: remove_unused_permissions_20260206
Revises: align_user_account_permissions_20260205
Create Date: 2026-02-06

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "remove_unused_permissions_20260206"
down_revision: Union[str, None] = "align_user_account_permissions_20260205"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Remove unused sapling_request and monitoring_log permissions."""
    op.execute(
        """
        DELETE FROM app_auth.role_permissions rp
        USING app_auth.permissions p
        WHERE rp.permission_id = p.id
          AND p.name IN (
            'sapling_request.create',
            'sapling_request.view',
            'sapling_request.update',
            'sapling_request.delete',
            'monitoring_log.update',
            'monitoring_log.delete'
          );
        """
    )

    op.execute(
        """
        DELETE FROM app_auth.permissions
        WHERE name IN (
          'sapling_request.create',
          'sapling_request.view',
          'sapling_request.update',
          'sapling_request.delete',
          'monitoring_log.update',
          'monitoring_log.delete'
        );
        """
    )


def downgrade() -> None:
    """Restore unused permissions if needed."""
    op.execute(
        """
        INSERT INTO app_auth.permissions (name, description, module_name, entity_type, action)
        SELECT 'sapling_request.create', 'Create sapling requests', 'urban_greening', 'sapling_request', 'create'
        WHERE NOT EXISTS (SELECT 1 FROM app_auth.permissions WHERE name = 'sapling_request.create');

        INSERT INTO app_auth.permissions (name, description, module_name, entity_type, action)
        SELECT 'sapling_request.view', 'View sapling requests', 'urban_greening', 'sapling_request', 'view'
        WHERE NOT EXISTS (SELECT 1 FROM app_auth.permissions WHERE name = 'sapling_request.view');

        INSERT INTO app_auth.permissions (name, description, module_name, entity_type, action)
        SELECT 'sapling_request.update', 'Update sapling requests', 'urban_greening', 'sapling_request', 'update'
        WHERE NOT EXISTS (SELECT 1 FROM app_auth.permissions WHERE name = 'sapling_request.update');

        INSERT INTO app_auth.permissions (name, description, module_name, entity_type, action)
        SELECT 'sapling_request.delete', 'Delete sapling requests', 'urban_greening', 'sapling_request', 'delete'
        WHERE NOT EXISTS (SELECT 1 FROM app_auth.permissions WHERE name = 'sapling_request.delete');

        INSERT INTO app_auth.permissions (name, description, module_name, entity_type, action)
        SELECT 'monitoring_log.update', 'Update tree monitoring logs', 'urban_greening', 'monitoring_log', 'update'
        WHERE NOT EXISTS (SELECT 1 FROM app_auth.permissions WHERE name = 'monitoring_log.update');

        INSERT INTO app_auth.permissions (name, description, module_name, entity_type, action)
        SELECT 'monitoring_log.delete', 'Delete tree monitoring logs', 'urban_greening', 'monitoring_log', 'delete'
        WHERE NOT EXISTS (SELECT 1 FROM app_auth.permissions WHERE name = 'monitoring_log.delete');
        """
    )

    op.execute(
        """
        INSERT INTO app_auth.role_permissions (role, permission_id)
        SELECT 'admin', id
        FROM app_auth.permissions
        WHERE name IN (
          'sapling_request.create',
          'sapling_request.view',
          'sapling_request.update',
          'sapling_request.delete',
          'monitoring_log.update',
          'monitoring_log.delete'
        )
        AND NOT EXISTS (
          SELECT 1 FROM app_auth.role_permissions rp
          WHERE rp.role = 'admin'
            AND rp.permission_id = app_auth.permissions.id
        );

        INSERT INTO app_auth.role_permissions (role, permission_id)
        SELECT 'urban_greening', id
        FROM app_auth.permissions
        WHERE name IN (
          'sapling_request.create',
          'sapling_request.view',
          'sapling_request.update',
          'sapling_request.delete',
          'monitoring_log.update',
          'monitoring_log.delete'
        )
        AND NOT EXISTS (
          SELECT 1 FROM app_auth.role_permissions rp
          WHERE rp.role = 'urban_greening'
            AND rp.permission_id = app_auth.permissions.id
        );
        """
    )
