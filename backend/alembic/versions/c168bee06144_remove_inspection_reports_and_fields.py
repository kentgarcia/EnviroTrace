"""remove_inspection_reports_and_fields

Revision ID: c168bee06144
Revises: add_inspection_fields
Create Date: 2025-08-08 05:40:30.885293

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'c168bee06144'
down_revision: Union[str, None] = 'add_inspection_fields'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Remove inspection reports table and inspection_report_id from tree_management_requests."""
    
    # Drop inspection_report_id column from tree_management_requests
    op.drop_column('tree_management_requests', 'inspection_report_id', schema='urban_greening')
    
    # Drop all indexes related to inspection_reports table
    op.drop_index('idx_urban_greening_inspection_report_number', table_name='inspection_reports', schema='urban_greening')
    op.drop_index('idx_urban_greening_inspection_type', table_name='inspection_reports', schema='urban_greening')
    op.drop_index('idx_urban_greening_inspection_status', table_name='inspection_reports', schema='urban_greening')
    op.drop_index('idx_urban_greening_inspection_date', table_name='inspection_reports', schema='urban_greening')
    
    # Drop inspection_reports table
    op.drop_table('inspection_reports', schema='urban_greening')


def downgrade() -> None:
    """Recreate inspection reports table and inspection_report_id field."""
    
    # Recreate inspection_reports table
    op.create_table('inspection_reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('report_number', sa.VARCHAR(length=50), nullable=False),
        sa.Column('date', sa.DATE(), nullable=False),
        sa.Column('location', sa.VARCHAR(length=500), nullable=False),
        sa.Column('type', sa.VARCHAR(length=50), nullable=False),
        sa.Column('status', sa.VARCHAR(length=50), nullable=False),
        sa.Column('inspectors', sa.TEXT(), nullable=True),
        sa.Column('trees', sa.TEXT(), nullable=True),
        sa.Column('notes', sa.TEXT(), nullable=True),
        sa.Column('pictures', sa.TEXT(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('report_number'),
        schema='urban_greening'
    )
    
    # Recreate indexes
    op.create_index('idx_urban_greening_inspection_date', 'inspection_reports', ['date'], unique=False, schema='urban_greening')
    op.create_index('idx_urban_greening_inspection_status', 'inspection_reports', ['status'], unique=False, schema='urban_greening')
    op.create_index('idx_urban_greening_inspection_type', 'inspection_reports', ['type'], unique=False, schema='urban_greening')
    op.create_index('idx_urban_greening_inspection_report_number', 'inspection_reports', ['report_number'], unique=False, schema='urban_greening')
    
    # Add inspection_report_id column back to tree_management_requests
    op.add_column('tree_management_requests', sa.Column('inspection_report_id', postgresql.UUID(as_uuid=True), nullable=True), schema='urban_greening')
