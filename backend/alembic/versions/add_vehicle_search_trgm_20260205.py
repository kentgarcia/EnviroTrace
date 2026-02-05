"""add vehicle search trigram indexes

Revision ID: add_vehicle_search_trgm_20260205
Revises: add_vehicle_keyset_indexes
Create Date: 2026-02-05 00:00:00.000000

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = "add_vehicle_search_trgm_20260205"
down_revision = "add_vehicle_keyset_indexes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    op.create_index(
        "idx_vehicles_driver_name_search",
        "vehicles",
        ["driver_name"],
        schema="emission",
        postgresql_using="gin",
        postgresql_ops={"driver_name": "gin_trgm_ops"},
    )
    op.create_index(
        "idx_offices_name_search",
        "offices",
        ["name"],
        schema="emission",
        postgresql_using="gin",
        postgresql_ops={"name": "gin_trgm_ops"},
    )


def downgrade() -> None:
    op.drop_index("idx_vehicles_driver_name_search", table_name="vehicles", schema="emission")
    op.drop_index("idx_offices_name_search", table_name="offices", schema="emission")
