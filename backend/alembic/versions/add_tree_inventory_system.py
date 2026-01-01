"""add tree inventory system

Revision ID: add_tree_inventory_2024
Revises: add_vehicle_identification_fields
Create Date: 2024-12-23

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'add_tree_inventory_2024'
down_revision: Union[str, None] = 'add_vehicle_identification_fields'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - Add Tree Inventory System tables."""
    
    # Create tree_inventory table - the main registry
    op.create_table('tree_inventory',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('tree_code', sa.String(50), unique=True, nullable=False),  # TAG-2024-000001
        sa.Column('species', sa.String(100), nullable=False),
        sa.Column('common_name', sa.String(100), nullable=True),
        
        # Location
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('barangay', sa.String(100), nullable=True),
        
        # Current Status
        sa.Column('status', sa.String(50), nullable=False, server_default='alive'),  # alive, cut, dead, replaced
        sa.Column('health', sa.String(50), nullable=False, server_default='healthy'),  # healthy, needs_attention, diseased, dead
        
        # Physical Characteristics
        sa.Column('height_meters', sa.Float(), nullable=True),
        sa.Column('diameter_cm', sa.Float(), nullable=True),
        sa.Column('age_years', sa.Integer(), nullable=True),
        
        # Lifecycle
        sa.Column('planted_date', sa.Date(), nullable=True),
        sa.Column('cutting_date', sa.Date(), nullable=True),
        sa.Column('cutting_reason', sa.String(255), nullable=True),
        sa.Column('death_date', sa.Date(), nullable=True),
        sa.Column('death_cause', sa.String(255), nullable=True),
        
        # Management
        sa.Column('managed_by', sa.String(100), nullable=True),  # DENR, Barangay, Private
        sa.Column('contact_person', sa.String(100), nullable=True),
        sa.Column('contact_number', sa.String(50), nullable=True),
        
        # Links
        sa.Column('cutting_request_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('planting_project_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('replacement_tree_id', postgresql.UUID(as_uuid=True), nullable=True),
        
        # Photos & Notes
        sa.Column('photos', sa.Text(), nullable=True),  # JSON array
        sa.Column('notes', sa.Text(), nullable=True),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        
        sa.PrimaryKeyConstraint('id'),
        schema='urban_greening'
    )
    
    # Create indexes for tree_inventory
    op.create_index('idx_tree_inventory_code', 'tree_inventory', ['tree_code'], unique=True, schema='urban_greening')
    op.create_index('idx_tree_inventory_species', 'tree_inventory', ['species'], schema='urban_greening')
    op.create_index('idx_tree_inventory_status', 'tree_inventory', ['status'], schema='urban_greening')
    op.create_index('idx_tree_inventory_health', 'tree_inventory', ['health'], schema='urban_greening')
    op.create_index('idx_tree_inventory_barangay', 'tree_inventory', ['barangay'], schema='urban_greening')
    op.create_index('idx_tree_inventory_location', 'tree_inventory', ['latitude', 'longitude'], schema='urban_greening')
    
    # Create tree_monitoring_logs table
    op.create_table('tree_monitoring_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('tree_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('inspection_date', sa.Date(), nullable=False),
        sa.Column('health_status', sa.String(50), nullable=False),
        sa.Column('height_meters', sa.Float(), nullable=True),
        sa.Column('diameter_cm', sa.Float(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('inspector_name', sa.String(100), nullable=False),
        sa.Column('photos', sa.Text(), nullable=True),  # JSON array
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['tree_id'], ['urban_greening.tree_inventory.id'], ondelete='CASCADE'),
        schema='urban_greening'
    )
    
    # Create indexes for tree_monitoring_logs
    op.create_index('idx_tree_monitoring_tree_id', 'tree_monitoring_logs', ['tree_id'], schema='urban_greening')
    op.create_index('idx_tree_monitoring_date', 'tree_monitoring_logs', ['inspection_date'], schema='urban_greening')
    
    # Create planting_projects table (simplified from urban_greening_plantings)
    op.create_table('planting_projects',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('project_code', sa.String(50), unique=True, nullable=False),  # PRJ-2024-000001
        sa.Column('project_name', sa.String(255), nullable=False),
        sa.Column('project_type', sa.String(50), nullable=False),  # replacement, urban_greening, reforestation
        
        # Location
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('barangay', sa.String(100), nullable=True),
        
        # Details
        sa.Column('planting_date', sa.Date(), nullable=True),
        sa.Column('target_trees', sa.Integer(), nullable=True),
        sa.Column('trees_planted', sa.Integer(), server_default='0', nullable=False),
        
        # Responsible Party
        sa.Column('responsible_person', sa.String(100), nullable=True),
        sa.Column('organization', sa.String(255), nullable=True),
        sa.Column('contact_number', sa.String(50), nullable=True),
        
        # Status
        sa.Column('status', sa.String(50), nullable=False, server_default='planned'),  # planned, ongoing, completed, cancelled
        
        # Notes & Photos
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('photos', sa.Text(), nullable=True),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        
        sa.PrimaryKeyConstraint('id'),
        schema='urban_greening'
    )
    
    # Create indexes for planting_projects
    op.create_index('idx_planting_project_code', 'planting_projects', ['project_code'], unique=True, schema='urban_greening')
    op.create_index('idx_planting_project_type', 'planting_projects', ['project_type'], schema='urban_greening')
    op.create_index('idx_planting_project_status', 'planting_projects', ['status'], schema='urban_greening')
    op.create_index('idx_planting_project_date', 'planting_projects', ['planting_date'], schema='urban_greening')


def downgrade() -> None:
    """Downgrade schema - Remove Tree Inventory System tables."""
    op.drop_index('idx_planting_project_date', table_name='planting_projects', schema='urban_greening')
    op.drop_index('idx_planting_project_status', table_name='planting_projects', schema='urban_greening')
    op.drop_index('idx_planting_project_type', table_name='planting_projects', schema='urban_greening')
    op.drop_index('idx_planting_project_code', table_name='planting_projects', schema='urban_greening')
    op.drop_table('planting_projects', schema='urban_greening')
    
    op.drop_index('idx_tree_monitoring_date', table_name='tree_monitoring_logs', schema='urban_greening')
    op.drop_index('idx_tree_monitoring_tree_id', table_name='tree_monitoring_logs', schema='urban_greening')
    op.drop_table('tree_monitoring_logs', schema='urban_greening')
    
    op.drop_index('idx_tree_inventory_location', table_name='tree_inventory', schema='urban_greening')
    op.drop_index('idx_tree_inventory_barangay', table_name='tree_inventory', schema='urban_greening')
    op.drop_index('idx_tree_inventory_health', table_name='tree_inventory', schema='urban_greening')
    op.drop_index('idx_tree_inventory_status', table_name='tree_inventory', schema='urban_greening')
    op.drop_index('idx_tree_inventory_species', table_name='tree_inventory', schema='urban_greening')
    op.drop_index('idx_tree_inventory_code', table_name='tree_inventory', schema='urban_greening')
    op.drop_table('tree_inventory', schema='urban_greening')
