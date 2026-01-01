"""fix tree species schema - make common_name required and scientific_name optional

Revision ID: fix_tree_species_schema
Revises: 
Create Date: 2025-12-26

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fix_tree_species_schema'
down_revision = None  # Update this if you know the previous revision
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Modify tree_species table columns
    op.alter_column('tree_species', 'scientific_name',
                    existing_type=sa.String(150),
                    nullable=True,
                    schema='urban_greening')
    
    op.alter_column('tree_species', 'common_name',
                    existing_type=sa.String(150),
                    nullable=False,
                    schema='urban_greening')
    
    # Drop the unique constraint on scientific_name if it exists
    op.execute("""
        DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 
                FROM pg_constraint 
                WHERE conname = 'tree_species_scientific_name_key'
            ) THEN
                ALTER TABLE urban_greening.tree_species 
                DROP CONSTRAINT tree_species_scientific_name_key;
            END IF;
        END $$;
    """)
    
    # Drop the unique index on scientific_name if it exists
    op.execute("""
        DROP INDEX IF EXISTS urban_greening.idx_tree_species_scientific;
    """)
    
    # Recreate the index without unique constraint
    op.create_index('idx_tree_species_scientific', 'tree_species', ['scientific_name'], 
                    unique=False, schema='urban_greening', postgresql_where=sa.text('scientific_name IS NOT NULL'))


def downgrade() -> None:
    # Reverse changes
    op.alter_column('tree_species', 'scientific_name',
                    existing_type=sa.String(150),
                    nullable=False,
                    schema='urban_greening')
    
    op.alter_column('tree_species', 'common_name',
                    existing_type=sa.String(150),
                    nullable=True,
                    schema='urban_greening')
    
    # Recreate unique constraint
    op.drop_index('idx_tree_species_scientific', table_name='tree_species', schema='urban_greening')
    op.create_index('idx_tree_species_scientific', 'tree_species', ['scientific_name'], 
                    unique=True, schema='urban_greening')
