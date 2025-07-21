"""Add vehicle remarks and enhance test fields

Revision ID: 89eddee0d6c1
Revises: d1ea7c078f89
Create Date: 2025-07-18 01:43:59.434897

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '89eddee0d6c1'
down_revision: Union[str, None] = 'd1ea7c078f89'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create vehicle_remarks table
    op.create_table(
        'vehicle_remarks',
        sa.Column('id', sa.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('vehicle_id', sa.UUID(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('remarks', sa.String(length=1000), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('created_by', sa.UUID(), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['auth.users.id']),
        sa.ForeignKeyConstraint(['vehicle_id'], ['emission.vehicles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        schema='emission'
    )
    
    # Create index for vehicle_remarks
    op.create_index(
        'idx_vehicle_remarks_vehicle_year', 
        'vehicle_remarks', 
        ['vehicle_id', 'year'], 
        unique=False, 
        schema='emission'
    )
    
    # Add new columns to tests table (simplified for pass/fail only)
    op.add_column('tests', sa.Column('remarks', sa.String(length=500), nullable=True), schema='emission')


def downgrade() -> None:
    """Downgrade schema."""
    # Remove columns from tests table
    op.drop_column('tests', 'remarks', schema='emission')
    
    # Drop vehicle_remarks table
    op.drop_index('idx_vehicle_remarks_vehicle_year', table_name='vehicle_remarks', schema='emission')
    op.drop_table('vehicle_remarks', schema='emission')
