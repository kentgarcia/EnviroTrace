"""add_air_quality_fees_table

Revision ID: c296cb2d0669
Revises: c8e7b8cf41c2
Create Date: 2025-06-19 04:51:44.253952

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'c296cb2d0669'
down_revision: Union[str, None] = 'c8e7b8cf41c2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create air_quality_fees table
    op.create_table('air_quality_fees',
        sa.Column('fee_id', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('level', sa.String(), nullable=False),
        sa.Column('rate', sa.Integer(), nullable=False),
        sa.Column('date_effective', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('fee_id'),
        schema='emission'
    )
    op.create_index(op.f('ix_emission_air_quality_fees_fee_id'), 'air_quality_fees', ['fee_id'], unique=False, schema='emission')


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_emission_air_quality_fees_fee_id'), table_name='air_quality_fees', schema='emission')
    op.drop_table('air_quality_fees', schema='emission') 