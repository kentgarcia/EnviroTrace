"""Add enhanced quarterly testing features

Revision ID: enhanced_quarterly_testing
Revises: c8e7b8cf41c2
Create Date: 2025-07-18 10:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'enhanced_quarterly_testing'
down_revision = 'c8e7b8cf41c2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to tests table for enhanced test data
    op.add_column('tests', sa.Column('co_level', sa.Integer(), nullable=True), schema='emission')
    op.add_column('tests', sa.Column('hc_level', sa.Integer(), nullable=True), schema='emission')
    op.add_column('tests', sa.Column('smoke_opacity', sa.Integer(), nullable=True), schema='emission')
    op.add_column('tests', sa.Column('remarks', sa.String(length=500), nullable=True), schema='emission')
    op.add_column('tests', sa.Column('technician_name', sa.String(length=255), nullable=True), schema='emission')
    op.add_column('tests', sa.Column('testing_center', sa.String(length=255), nullable=True), schema='emission')

    # Create vehicle_remarks table
    op.create_table('vehicle_remarks',
    sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
    sa.Column('vehicle_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('year', sa.Integer(), nullable=False),
    sa.Column('remarks', sa.String(length=1000), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
    sa.ForeignKeyConstraint(['created_by'], ['auth.users.id'], ),
    sa.ForeignKeyConstraint(['vehicle_id'], ['emission.vehicles.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    schema='emission'
    )
    op.create_index('idx_vehicle_remarks_vehicle_year', 'vehicle_remarks', ['vehicle_id', 'year'], unique=False, schema='emission')


def downgrade() -> None:
    # Drop vehicle_remarks table
    op.drop_index('idx_vehicle_remarks_vehicle_year', table_name='vehicle_remarks', schema='emission')
    op.drop_table('vehicle_remarks', schema='emission')
    
    # Remove new columns from tests table
    op.drop_column('tests', 'testing_center', schema='emission')
    op.drop_column('tests', 'technician_name', schema='emission')
    op.drop_column('tests', 'remarks', schema='emission')
    op.drop_column('tests', 'smoke_opacity', schema='emission')
    op.drop_column('tests', 'hc_level', schema='emission')
    op.drop_column('tests', 'co_level', schema='emission')
