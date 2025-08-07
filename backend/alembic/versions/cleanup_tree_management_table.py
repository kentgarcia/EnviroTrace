"""restructure tree management requests table

Revision ID: cleanup_tree_management_table
Revises: add_inspection_reports
Create Date: 2025-08-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'cleanup_tree_management_table'
down_revision: Union[str, None] = 'add_inspection_reports'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Remove unnecessary columns and add new ones for simplified tree management."""
    
    # Add new columns first
    op.add_column('tree_management_requests', 
                  sa.Column('fee_record_id', sa.UUID(), nullable=True), 
                  schema='urban_greening')
    
    op.add_column('tree_management_requests', 
                  sa.Column('inspection_report_id', sa.UUID(), nullable=True), 
                  schema='urban_greening')
    
    op.add_column('tree_management_requests', 
                  sa.Column('notes', sa.Text(), nullable=True), 
                  schema='urban_greening')
    
    # Remove unnecessary columns
    columns_to_remove = [
        'contact_number',
        'email',
        'tree_species',
        'tree_count', 
        'tree_location',
        'urgency_level',
        'scheduled_date',
        'completion_date',
        'assigned_inspector',
        'inspection_notes',
        'fee_amount',
        'fee_status',
        'permit_number'
    ]
    
    for column in columns_to_remove:
        op.drop_column('tree_management_requests', column, schema='urban_greening')


def downgrade() -> None:
    """Restore the old tree management structure."""
    
    # Add back the removed columns
    op.add_column('tree_management_requests', 
                  sa.Column('contact_number', sa.String(50), nullable=True), 
                  schema='urban_greening')
    
    op.add_column('tree_management_requests', 
                  sa.Column('email', sa.String(255), nullable=True), 
                  schema='urban_greening')
    
    op.add_column('tree_management_requests', 
                  sa.Column('tree_species', sa.String(255), nullable=False), 
                  schema='urban_greening')
    
    op.add_column('tree_management_requests', 
                  sa.Column('tree_count', sa.Integer(), nullable=False), 
                  schema='urban_greening')
    
    op.add_column('tree_management_requests', 
                  sa.Column('tree_location', sa.Text(), nullable=False), 
                  schema='urban_greening')
    
    op.add_column('tree_management_requests', 
                  sa.Column('urgency_level', sa.String(50), nullable=False), 
                  schema='urban_greening')
    
    op.add_column('tree_management_requests', 
                  sa.Column('scheduled_date', sa.Date(), nullable=True), 
                  schema='urban_greening')
    
    op.add_column('tree_management_requests', 
                  sa.Column('completion_date', sa.Date(), nullable=True), 
                  schema='urban_greening')
    
    op.add_column('tree_management_requests', 
                  sa.Column('assigned_inspector', sa.String(255), nullable=True), 
                  schema='urban_greening')
    
    op.add_column('tree_management_requests', 
                  sa.Column('inspection_notes', sa.Text(), nullable=True), 
                  schema='urban_greening')
    
    op.add_column('tree_management_requests', 
                  sa.Column('fee_amount', sa.Numeric(10, 2), nullable=True), 
                  schema='urban_greening')
    
    op.add_column('tree_management_requests', 
                  sa.Column('fee_status', sa.String(50), nullable=True), 
                  schema='urban_greening')
    
    op.add_column('tree_management_requests', 
                  sa.Column('permit_number', sa.String(50), nullable=True), 
                  schema='urban_greening')
    
    # Remove the new columns
    op.drop_column('tree_management_requests', 'notes', schema='urban_greening')
    op.drop_column('tree_management_requests', 'inspection_report_id', schema='urban_greening')
    op.drop_column('tree_management_requests', 'fee_record_id', schema='urban_greening')
