"""add_source_type_only

Revision ID: ee733db54643
Revises: e91dadf54ab7
Create Date: 2025-08-24 00:55:54.305433

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ee733db54643'
down_revision: Union[str, None] = '38bbfc350bd3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add source_type column to monitoring_requests table
    op.add_column('monitoring_requests', sa.Column('source_type', sa.String(), nullable=True), schema='urban_greening')


def downgrade() -> None:
    """Downgrade schema."""
    # Remove source_type column from monitoring_requests table
    op.drop_column('monitoring_requests', 'source_type', schema='urban_greening')
