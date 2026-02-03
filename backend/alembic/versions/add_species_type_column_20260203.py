"""Add species_type column to replace is_tree boolean

Revision ID: add_species_type_column_20260203
Revises: increase_session_id_length_20260203
Create Date: 2026-02-03

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_species_type_column_20260203'
down_revision = 'increase_session_id_length_20260203'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Add species_type column to replace boolean is_tree field with more granular type classification.
    """
    # Step 1: Add the new species_type column with default value
    op.add_column(
        'tree_species',
        sa.Column('species_type', sa.String(50), nullable=False, server_default='Tree',
                  comment="Type of species: Tree, Ornamental, Seed, Other"),
        schema='urban_greening'
    )
    
    # Step 2: Migrate existing data based on is_tree value
    # Set 'Tree' where is_tree = true
    op.execute("""
        UPDATE urban_greening.tree_species 
        SET species_type = 'Tree' 
        WHERE is_tree = true
    """)
    
    # Set 'Ornamental' where is_tree = false
    op.execute("""
        UPDATE urban_greening.tree_species 
        SET species_type = 'Ornamental' 
        WHERE is_tree = false
    """)
    
    # Step 3: Drop the old is_tree column
    op.drop_column('tree_species', 'is_tree', schema='urban_greening')
    
    # Step 4: Add check constraint to ensure valid species_type values
    op.create_check_constraint(
        'ck_tree_species_type_valid',
        'tree_species',
        "species_type IN ('Tree', 'Ornamental', 'Seed', 'Other')",
        schema='urban_greening'
    )
    
    # Create an index on species_type for better query performance
    op.create_index(
        'idx_tree_species_type',
        'tree_species',
        ['species_type'],
        schema='urban_greening'
    )


def downgrade() -> None:
    """
    Revert back to is_tree boolean column.
    """
    # Drop the index
    op.drop_index('idx_tree_species_type', table_name='tree_species', schema='urban_greening')
    
    # Drop the check constraint
    op.drop_constraint('ck_tree_species_type_valid', 'tree_species', schema='urban_greening')
    
    # Add back the is_tree column
    op.add_column(
        'tree_species',
        sa.Column('is_tree', sa.Boolean(), nullable=False, server_default='true',
                  comment="True if species is a tree, False if ornamental/shrub"),
        schema='urban_greening'
    )
    
    # Migrate data back: Set is_tree = true where species_type is 'Tree'
    op.execute("""
        UPDATE urban_greening.tree_species 
        SET is_tree = true 
        WHERE species_type = 'Tree'
    """)
    
    # Set is_tree = false for all other types (Ornamental, Seed, Other)
    op.execute("""
        UPDATE urban_greening.tree_species 
        SET is_tree = false 
        WHERE species_type IN ('Ornamental', 'Seed', 'Other')
    """)
    
    # Drop the species_type column
    op.drop_column('tree_species', 'species_type', schema='urban_greening')
