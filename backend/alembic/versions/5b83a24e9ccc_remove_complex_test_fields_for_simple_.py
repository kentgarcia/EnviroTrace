"""Remove complex test fields for simple pass fail

Revision ID: 5b83a24e9ccc
Revises: 89eddee0d6c1
Create Date: 2025-07-18 02:38:07.324064

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5b83a24e9ccc'
down_revision: Union[str, None] = '89eddee0d6c1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Remove complex test fields that were previously added
    # Only keep simple pass/fail result and remarks
    op.execute("ALTER TABLE emission.tests DROP COLUMN IF EXISTS co_level")
    op.execute("ALTER TABLE emission.tests DROP COLUMN IF EXISTS hc_level")
    op.execute("ALTER TABLE emission.tests DROP COLUMN IF EXISTS smoke_opacity")
    op.execute("ALTER TABLE emission.tests DROP COLUMN IF EXISTS technician_name")
    op.execute("ALTER TABLE emission.tests DROP COLUMN IF EXISTS testing_center")


def downgrade() -> None:
    """Downgrade schema."""
    # Re-add the complex test fields
    op.add_column('tests', sa.Column('co_level', sa.Integer(), nullable=True), schema='emission')
    op.add_column('tests', sa.Column('hc_level', sa.Integer(), nullable=True), schema='emission')
    op.add_column('tests', sa.Column('smoke_opacity', sa.Integer(), nullable=True), schema='emission')
    op.add_column('tests', sa.Column('technician_name', sa.String(length=255), nullable=True), schema='emission')
    op.add_column('tests', sa.Column('testing_center', sa.String(length=255), nullable=True), schema='emission')
