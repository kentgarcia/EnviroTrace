"""Merge alembic heads into a single linear history

Revision ID: 20250815_merge_heads
Revises: 20250814_add_plants, c168bee06144
Create Date: 2025-08-15

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250815_merge_heads'
down_revision = ('20250814_add_plants', 'c168bee06144')
branch_labels = None
depends_on = None

def upgrade() -> None:
    # No-op merge migration to unify branches
    pass


def downgrade() -> None:
    # No-op downgrade; cannot unmerge branches
    pass
