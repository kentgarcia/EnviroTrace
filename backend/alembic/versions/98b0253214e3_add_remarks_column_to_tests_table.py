"""Add remarks column to tests table

Revision ID: 98b0253214e3
Revises: 5b83a24e9ccc
Create Date: 2025-07-18 02:41:16.433537

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '98b0253214e3'
down_revision: Union[str, None] = '5b83a24e9ccc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('tests', sa.Column('remarks', sa.String(length=500), nullable=True), schema='emission')


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('tests', 'remarks', schema='emission')
