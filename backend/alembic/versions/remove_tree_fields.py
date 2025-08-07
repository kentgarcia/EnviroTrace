"""remove reason_for_request and attachment_files from tree management

Revision ID: remove_tree_fields
Revises: cleanup_tree_management_table
Create Date: 2025-08-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'remove_tree_fields'
down_revision: Union[str, None] = 'cleanup_tree_management_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Remove reason_for_request and attachment_files columns."""
    
    # Remove the columns
    op.drop_column('tree_management_requests', 'reason_for_request', schema='urban_greening')
    op.drop_column('tree_management_requests', 'attachment_files', schema='urban_greening')


def downgrade() -> None:
    """Restore reason_for_request and attachment_files columns."""
    
    # Add back the columns
    op.add_column('tree_management_requests', 
                  sa.Column('reason_for_request', sa.Text(), nullable=False), 
                  schema='urban_greening')
    
    op.add_column('tree_management_requests', 
                  sa.Column('attachment_files', sa.Text(), nullable=True), 
                  schema='urban_greening')
