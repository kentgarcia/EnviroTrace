"""Add monitoring_request_id to urban_greening_plantings and make location nullable

Revision ID: 20250814_update_ug_plantings
Revises: add_sapling_requests_table
Create Date: 2025-08-14
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20250814_update_ug_plantings'
# Multiple heads exist; choose the sapling_requests branch head as down_revision label used in your repo
down_revision = 'add_sapling_requests_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Make location nullable
    op.alter_column('urban_greening_plantings', 'location',
                    existing_type=sa.String(length=500),
                    nullable=True,
                    schema='urban_greening')
    # Add monitoring_request_id
    op.add_column('urban_greening_plantings', sa.Column('monitoring_request_id', sa.String(), nullable=True), schema='urban_greening')


def downgrade() -> None:
    # Remove monitoring_request_id
    op.drop_column('urban_greening_plantings', 'monitoring_request_id', schema='urban_greening')
    # Revert location to not null
    op.alter_column('urban_greening_plantings', 'location',
                    existing_type=sa.String(length=500),
                    nullable=False,
                    schema='urban_greening')
