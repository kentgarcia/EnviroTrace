"""update_air_quality_fees_table_structure

Revision ID: 479375b85f03
Revises: c296cb2d0669
Create Date: 2025-06-19 09:02:38.634260

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '479375b85f03'
down_revision: Union[str, None] = 'c296cb2d0669'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create a new table with the updated structure
    op.create_table(
        'air_quality_fees_new',
        sa.Column('fee_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('rate', sa.Integer(), nullable=False),
        sa.Column('date_effective', sa.Date(), nullable=False),
        sa.Column('level', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('fee_id'),
        schema='emission'
    )
    sa.Index('ix_emission_air_quality_fees_new_fee_id', 'fee_id')
    
    # Copy data from old table to new table, converting level to int
    op.execute("""
        INSERT INTO emission.air_quality_fees_new (category, rate, date_effective, level, created_at, updated_at)
        SELECT category, rate, date_effective, 
               CASE 
                   WHEN level ~ '^[0-9]+$' THEN level::integer
                   ELSE 1
               END as level,
               created_at, updated_at
        FROM emission.air_quality_fees
    """)
    
    # Drop the old table
    op.drop_table('air_quality_fees', schema='emission')
    
    # Rename the new table to the original name
    op.execute('ALTER TABLE emission.air_quality_fees_new RENAME TO air_quality_fees')
    
    # Recreate the index with the original name
    op.execute('ALTER INDEX emission.ix_emission_air_quality_fees_new_fee_id RENAME TO ix_emission_air_quality_fees_fee_id')


def downgrade() -> None:
    """Downgrade schema."""
    # Create the old table structure
    op.create_table(
        'air_quality_fees_old',
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
    sa.Index('ix_emission_air_quality_fees_old_fee_id', 'fee_id')
    
    # Copy data back, converting level to string and generating string IDs
    op.execute("""
        INSERT INTO emission.air_quality_fees_old (fee_id, category, level, rate, date_effective, level, created_at, updated_at)
        SELECT 'FEE-' || fee_id::text as fee_id, category, category as level, rate, date_effective, 
               level::text as level,
               created_at, updated_at
        FROM emission.air_quality_fees
    """)
    
    # Drop the current table
    op.drop_table('air_quality_fees', schema='emission')
    
    # Rename the old structure table back
    op.execute('ALTER TABLE emission.air_quality_fees_old RENAME TO air_quality_fees')
    
    # Recreate the index with the original name
    op.execute('ALTER INDEX emission.ix_emission_air_quality_fees_old_fee_id RENAME TO ix_emission_air_quality_fees_fee_id')
