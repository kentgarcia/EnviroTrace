"""add vehicle keyset indexes

Revision ID: add_vehicle_keyset_indexes
Revises: add_vehicle_identification
Create Date: 2026-01-31 00:00:00.000000

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'add_vehicle_keyset_indexes'
down_revision = 'add_vehicle_identification'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Replace legacy office_id/created_at index with keyset-friendly variants
    op.execute("DROP INDEX IF EXISTS emission.idx_vehicles_office_id_created_at")

    op.create_index(
        'idx_vehicles_created_at_id',
        'vehicles',
        ['created_at', 'id'],
        schema='emission',
    )
    op.create_index(
        'idx_vehicles_office_id_created_at_id',
        'vehicles',
        ['office_id', 'created_at', 'id'],
        schema='emission',
    )


def downgrade() -> None:
    op.drop_index('idx_vehicles_office_id_created_at_id', table_name='vehicles', schema='emission')
    op.drop_index('idx_vehicles_created_at_id', table_name='vehicles', schema='emission')

    op.create_index(
        'idx_vehicles_office_id_created_at',
        'vehicles',
        ['office_id', 'created_at'],
        schema='emission',
    )
