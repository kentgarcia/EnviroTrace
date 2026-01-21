"""remove request type constraint

Revision ID: remove_request_type_check
Revises: add_tree_species_carbon_fields
Create Date: 2026-01-22 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'remove_request_type_check'
down_revision = 'add_tree_species_carbon_fields'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop the check constraint on tree_requests request_type column
    # We use raw SQL to drop the specific constraint named in the error
    op.execute("ALTER TABLE urban_greening.tree_requests DROP CONSTRAINT IF EXISTS tree_requests_request_type_check")


def downgrade() -> None:
    # Ideally we would restore the constraint, but we don't know the exact values allowed previously.
    # Since the goal is to allow dynamic values, we leave it removed.
    pass
