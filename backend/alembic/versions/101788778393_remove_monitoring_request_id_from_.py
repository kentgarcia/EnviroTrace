"""Remove monitoring_request_id from sapling_requests only

Revision ID: 101788778393
Revises: f1dcc0ddbb75
Create Date: 2025-08-23 22:24:11.039950

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '101788778393'
down_revision: Union[str, None] = 'f1dcc0ddbb75'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Remove monitoring_request_id column from sapling_requests table."""
    # Remove the monitoring_request_id column from sapling_requests
    op.drop_column('sapling_requests', 'monitoring_request_id', schema='urban_greening')


def downgrade() -> None:
    """Add back monitoring_request_id column to sapling_requests table."""
    # Add back the monitoring_request_id column
    op.add_column('sapling_requests', 
                  sa.Column('monitoring_request_id', sa.String(), nullable=True), 
                  schema='urban_greening')
