"""add_inspection_fields_to_tree_management_simple

Revision ID: add_inspection_fields
Revises: remove_tree_fields
Create Date: 2025-08-08 05:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'add_inspection_fields'
down_revision: Union[str, None] = 'remove_tree_fields'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add inspection fields to tree_management_requests table."""
    # Add new inspection columns to tree_management_requests
    op.add_column('tree_management_requests', 
                  sa.Column('inspectors', sa.Text(), nullable=True), 
                  schema='urban_greening')
    op.add_column('tree_management_requests', 
                  sa.Column('trees_and_quantities', sa.Text(), nullable=True), 
                  schema='urban_greening')
    op.add_column('tree_management_requests', 
                  sa.Column('picture_links', sa.Text(), nullable=True), 
                  schema='urban_greening')


def downgrade() -> None:
    """Remove inspection fields from tree_management_requests table."""
    op.drop_column('tree_management_requests', 'picture_links', schema='urban_greening')
    op.drop_column('tree_management_requests', 'trees_and_quantities', schema='urban_greening')
    op.drop_column('tree_management_requests', 'inspectors', schema='urban_greening')
