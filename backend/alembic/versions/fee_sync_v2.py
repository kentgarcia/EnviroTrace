"""
Revision for air_quality_fees table matching frontend/backend types.
"""
from alembic import op
import sqlalchemy as sa

revision = 'fee_sync_v2'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'air_quality_fees',
        sa.Column('fee_id', sa.String(), primary_key=True, nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('rate', sa.Integer(), nullable=False),  # stored as cents
        sa.Column('date_effective', sa.Date(), nullable=False),
        sa.Column('level', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        schema='emission'
    )
    op.create_index('ix_emission_air_quality_fees_fee_id', 'air_quality_fees', ['fee_id'], unique=True, schema='emission')

def downgrade():
    op.drop_index('ix_emission_air_quality_fees_fee_id', table_name='air_quality_fees', schema='emission')
    op.drop_table('air_quality_fees', schema='emission')
