"""
Revision ID: add_monitoring_requests
Revises: 
Create Date: 2025-07-28
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    op.create_table(
        'monitoring_requests',
        sa.Column('id', sa.String(), primary_key=True, index=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('requester_name', sa.String(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('location', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('address', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
    )

def downgrade():
    op.drop_table('monitoring_requests')
