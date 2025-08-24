"""Add monitoring_request_id to tree_management_requests

Revision ID: 38bbfc350bd3
Revises: 101788778393
Create Date: 2025-08-24 00:03:44.311475

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '38bbfc350bd3'
down_revision: Union[str, None] = '101788778393'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add monitoring_request_id column to tree_management_requests table."""
    # Add the monitoring_request_id column to tree_management_requests
    op.add_column('tree_management_requests', 
                  sa.Column('monitoring_request_id', sa.String(), nullable=True), 
                  schema='urban_greening')


def downgrade() -> None:
    """Remove monitoring_request_id column from tree_management_requests table."""
    # Remove the monitoring_request_id column
    op.drop_column('tree_management_requests', 'monitoring_request_id', schema='urban_greening')
