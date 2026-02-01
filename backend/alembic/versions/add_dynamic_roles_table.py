"""introduce dynamic roles table

Revision ID: add_dynamic_roles_table
Revises: add_permission_management_20260202
Create Date: 2026-02-02

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.engine.reflection import Inspector


# revision identifiers, used by Alembic.
revision: str = "add_dynamic_roles_table"
down_revision: Union[str, None] = "add_permission_management_20260202"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_unique_constraint(inspector: Inspector, schema: str, table: str, name: str) -> bool:
    return any(uc.get("name") == name for uc in inspector.get_unique_constraints(table, schema=schema))


def _has_foreign_key(inspector: Inspector, schema: str, table: str, name: str) -> bool:
    return any(fk.get("name") == name for fk in inspector.get_foreign_keys(table, schema=schema))


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("roles", schema="app_auth"):
        op.create_table(
            "roles",
            sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), primary_key=True),
            sa.Column("slug", sa.String(length=150), nullable=False, unique=True),
            sa.Column("display_name", sa.String(length=150), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("is_system", sa.Boolean(), nullable=False, server_default=sa.text("false")),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            schema="app_auth",
        )
    if not any(index["name"] == "idx_auth_roles_slug" for index in sa.inspect(bind).get_indexes("roles", schema="app_auth")):
        op.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_roles_slug ON app_auth.roles(slug)")

    op.execute(
        """
        INSERT INTO app_auth.roles (slug, display_name, description, is_system)
        VALUES
            ('admin', 'Administrator', 'Full platform access', true),
            ('urban_greening', 'Urban Greening', 'Manage forestry operations', true),
            ('government_emission', 'Government Emission', 'Oversee emission compliance', true)
        ON CONFLICT (slug) DO UPDATE
        SET display_name = EXCLUDED.display_name,
            description = EXCLUDED.description,
            is_system = true
        """
    )

    inspector = sa.inspect(bind)
    user_roles_columns = {col["name"] for col in inspector.get_columns("user_roles", schema="app_auth")}

    if "role_id" not in user_roles_columns:
        op.add_column("user_roles", sa.Column("role_id", postgresql.UUID(as_uuid=True), nullable=True), schema="app_auth")
        if "role" in user_roles_columns:
            op.execute(
                """
                UPDATE app_auth.user_roles ur
                SET role_id = roles.id
                FROM app_auth.roles roles
                WHERE roles.slug = ur.role::text
                """
            )

    inspector = sa.inspect(bind)
    user_roles_columns = {col["name"] for col in inspector.get_columns("user_roles", schema="app_auth")}

    if "role_id" in user_roles_columns and not _has_foreign_key(inspector, "app_auth", "user_roles", "fk_user_roles_role"):
        op.create_foreign_key(
            "fk_user_roles_role",
            "user_roles",
            "roles",
            ["role_id"],
            ["id"],
            source_schema="app_auth",
            referent_schema="app_auth",
            ondelete="CASCADE",
        )

    if "role_id" in user_roles_columns:
        op.alter_column(
            "user_roles",
            "role_id",
            existing_type=postgresql.UUID(as_uuid=True),
            nullable=False,
            schema="app_auth",
        )

    if _has_unique_constraint(inspector, "app_auth", "user_roles", "uq_user_roles_user_id_role"):
        op.drop_constraint("uq_user_roles_user_id_role", "user_roles", schema="app_auth")

    inspector = sa.inspect(bind)
    if not _has_unique_constraint(inspector, "app_auth", "user_roles", "uq_user_roles_user_id_role_id"):
        op.create_unique_constraint("uq_user_roles_user_id_role_id", "user_roles", ["user_id", "role_id"], schema="app_auth")

    op.execute("CREATE INDEX IF NOT EXISTS idx_auth_user_roles_role_id ON app_auth.user_roles(role_id)")

    inspector = sa.inspect(bind)
    user_roles_columns = {col["name"] for col in inspector.get_columns("user_roles", schema="app_auth")}
    if "role" in user_roles_columns:
        op.execute("DROP INDEX IF EXISTS app_auth.idx_auth_user_roles_role")
        op.drop_column("user_roles", "role", schema="app_auth")

    inspector = sa.inspect(bind)
    role_permissions_columns = {col["name"] for col in inspector.get_columns("role_permissions", schema="app_auth")}

    if "role_id" not in role_permissions_columns:
        op.add_column("role_permissions", sa.Column("role_id", postgresql.UUID(as_uuid=True), nullable=True), schema="app_auth")
        if "role" in role_permissions_columns:
            op.execute(
                """
                UPDATE app_auth.role_permissions rp
                SET role_id = roles.id
                FROM app_auth.roles roles
                WHERE roles.slug = rp.role::text
                """
            )

    inspector = sa.inspect(bind)
    role_permissions_columns = {col["name"] for col in inspector.get_columns("role_permissions", schema="app_auth")}

    if "role_id" in role_permissions_columns and not _has_foreign_key(inspector, "app_auth", "role_permissions", "fk_role_permissions_role"):
        op.create_foreign_key(
            "fk_role_permissions_role",
            "role_permissions",
            "roles",
            ["role_id"],
            ["id"],
            source_schema="app_auth",
            referent_schema="app_auth",
            ondelete="CASCADE",
        )

    if "role_id" in role_permissions_columns:
        op.alter_column(
            "role_permissions",
            "role_id",
            existing_type=postgresql.UUID(as_uuid=True),
            nullable=False,
            schema="app_auth",
        )

    if _has_unique_constraint(inspector, "app_auth", "role_permissions", "uq_role_permissions_role_permission"):
        op.drop_constraint("uq_role_permissions_role_permission", "role_permissions", schema="app_auth")

    inspector = sa.inspect(bind)
    if not _has_unique_constraint(inspector, "app_auth", "role_permissions", "uq_role_permissions_role_id_permission"):
        op.create_unique_constraint(
            "uq_role_permissions_role_id_permission",
            "role_permissions",
            ["role_id", "permission_id"],
            schema="app_auth",
        )

    op.execute("CREATE INDEX IF NOT EXISTS idx_auth_role_permissions_role_id ON app_auth.role_permissions(role_id)")

    inspector = sa.inspect(bind)
    role_permissions_columns = {col["name"] for col in inspector.get_columns("role_permissions", schema="app_auth")}
    if "role" in role_permissions_columns:
        op.execute("DROP INDEX IF EXISTS app_auth.idx_auth_role_permissions_role")
        op.drop_column("role_permissions", "role", schema="app_auth")

    inspector = sa.inspect(bind)
    enum_names = {enum["name"] for enum in inspector.get_enums(schema="app_auth")}
    if "user_role" in enum_names:
        op.execute("DROP TYPE app_auth.user_role")


def downgrade() -> None:
    raise RuntimeError("Downgrading dynamic roles migration is not supported.")
