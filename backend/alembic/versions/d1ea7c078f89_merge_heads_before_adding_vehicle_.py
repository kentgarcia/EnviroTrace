"""Merge heads before adding vehicle remarks

Revision ID: d1ea7c078f89
Revises: 479375b85f03, enhanced_quarterly_testing
Create Date: 2025-07-18 01:32:52.932164

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd1ea7c078f89'
down_revision: Union[str, None] = ('479375b85f03', 'enhanced_quarterly_testing')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
