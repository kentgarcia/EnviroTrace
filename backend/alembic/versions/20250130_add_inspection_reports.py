"""Add inspection reports table

Revision ID: add_inspection_reports
Revises: add_monitoring_requests
Create Date: 2025-01-30

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_inspection_reports'
down_revision = 'add_monitoring_requests'
branch_labels = None
depends_on = None


def upgrade():
    """Create inspection_reports table in urban_greening schema"""
    # Create the table
    op.create_table(
        'inspection_reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, 
                 server_default=sa.text("uuid_generate_v4()")),
        sa.Column('report_number', sa.String(50), unique=True, nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('location', sa.String(500), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('inspectors', sa.Text(), nullable=True),
        sa.Column('trees', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('pictures', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), 
                 server_default=sa.func.now(), onupdate=sa.func.now()),
        schema='urban_greening'
    )
    
    # Create indexes
    op.create_index('idx_urban_greening_inspection_date', 'inspection_reports', 
                   ['date'], schema='urban_greening')
    op.create_index('idx_urban_greening_inspection_status', 'inspection_reports', 
                   ['status'], schema='urban_greening')
    op.create_index('idx_urban_greening_inspection_type', 'inspection_reports', 
                   ['type'], schema='urban_greening')
    op.create_index('idx_urban_greening_inspection_report_number', 'inspection_reports', 
                   ['report_number'], schema='urban_greening')


def downgrade():
    """Drop inspection_reports table"""
    op.drop_table('inspection_reports', schema='urban_greening')
