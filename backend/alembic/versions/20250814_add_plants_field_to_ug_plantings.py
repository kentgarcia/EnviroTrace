"""Add plants field (JSON text) to urban_greening_plantings

Revision ID: 20250814_add_plants
Revises: 20250814_update_ug_plantings_monitoring_and_location
Create Date: 2025-08-14 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250814_add_plants'
down_revision = '20250814_update_ug_plantings'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('urban_greening_plantings', sa.Column('plants', sa.Text(), nullable=True), schema='urban_greening')


def downgrade() -> None:
    op.drop_column('urban_greening_plantings', 'plants', schema='urban_greening')
