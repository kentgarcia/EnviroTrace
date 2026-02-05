"""align user_account permission names

Revision ID: align_user_account_permissions_20260205
Revises: add_permission_management_20260202
Create Date: 2026-02-05

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "align_user_account_permissions_20260205"
down_revision: Union[str, None] = "add_permission_management_20260202"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Align user permission names with user_account.*."""
    op.execute(
        """
        UPDATE app_auth.permissions
        SET
            name = REPLACE(name, 'user.', 'user_account.'),
            entity_type = 'user_account'
        WHERE name IN (
            'user.create',
            'user.view',
            'user.update',
            'user.delete'
        );
        """
    )

    op.execute(
        """
        INSERT INTO app_auth.permissions (name, description, module_name, entity_type, action)
        SELECT 'user_account.create', 'Create users', 'admin', 'user_account', 'create'
        WHERE NOT EXISTS (
            SELECT 1 FROM app_auth.permissions WHERE name = 'user_account.create'
        );

        INSERT INTO app_auth.permissions (name, description, module_name, entity_type, action)
        SELECT 'user_account.view', 'View users', 'admin', 'user_account', 'view'
        WHERE NOT EXISTS (
            SELECT 1 FROM app_auth.permissions WHERE name = 'user_account.view'
        );

        INSERT INTO app_auth.permissions (name, description, module_name, entity_type, action)
        SELECT 'user_account.update', 'Update users', 'admin', 'user_account', 'update'
        WHERE NOT EXISTS (
            SELECT 1 FROM app_auth.permissions WHERE name = 'user_account.update'
        );

        INSERT INTO app_auth.permissions (name, description, module_name, entity_type, action)
        SELECT 'user_account.delete', 'Delete users', 'admin', 'user_account', 'delete'
        WHERE NOT EXISTS (
            SELECT 1 FROM app_auth.permissions WHERE name = 'user_account.delete'
        );
        """
    )


def downgrade() -> None:
    """Revert user_account permission names back to user.*."""
    op.execute(
        """
        UPDATE app_auth.permissions
        SET
            name = REPLACE(name, 'user_account.', 'user.'),
            entity_type = 'user'
        WHERE name IN (
            'user_account.create',
            'user_account.view',
            'user_account.update',
            'user_account.delete'
        );
        """
    )
