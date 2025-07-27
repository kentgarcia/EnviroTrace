"""add urban greening schema and monitoring requests table

Revision ID: add_urban_greening_001
Revises: 
Create Date: 2025-07-28 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision = 'add_urban_greening_001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create urban_greening schema
    op.execute('CREATE SCHEMA IF NOT EXISTS urban_greening')
    
    # Create monitoring_requests table
    op.create_table('monitoring_requests',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('requester_name', sa.String(255), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('address', sa.String(500), nullable=False),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('sapling_count', sa.Integer(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        schema='urban_greening'
    )
    
    # Create indexes
    op.create_index('idx_urban_greening_monitoring_date', 'monitoring_requests', ['date'], schema='urban_greening')
    op.create_index('idx_urban_greening_monitoring_status', 'monitoring_requests', ['status'], schema='urban_greening')
    op.create_index('idx_urban_greening_monitoring_requester', 'monitoring_requests', ['requester_name'], schema='urban_greening')


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_urban_greening_monitoring_requester', table_name='monitoring_requests', schema='urban_greening')
    op.drop_index('idx_urban_greening_monitoring_status', table_name='monitoring_requests', schema='urban_greening')
    op.drop_index('idx_urban_greening_monitoring_date', table_name='monitoring_requests', schema='urban_greening')
    
    # Drop table
    op.drop_table('monitoring_requests', schema='urban_greening')
    
    # Drop schema (only if empty)
    op.execute('DROP SCHEMA IF EXISTS urban_greening CASCADE')
