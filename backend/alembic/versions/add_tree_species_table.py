"""Add tree species lookup table

Revision ID: add_tree_species_table
Revises: add_tree_inventory_system
Create Date: 2024-12-23

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_tree_species_table'
down_revision = 'add_tree_inventory_system'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create tree_species table
    op.create_table(
        'tree_species',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('scientific_name', sa.String(150), nullable=False),
        sa.Column('common_name', sa.String(150), nullable=True),
        sa.Column('local_name', sa.String(150), nullable=True),
        sa.Column('family', sa.String(100), nullable=True),
        sa.Column('is_native', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('is_endangered', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        schema='urban_greening'
    )
    
    # Create indexes
    op.create_index('idx_tree_species_scientific', 'tree_species', ['scientific_name'], unique=True, schema='urban_greening')
    op.create_index('idx_tree_species_common', 'tree_species', ['common_name'], schema='urban_greening')
    op.create_index('idx_tree_species_active', 'tree_species', ['is_active'], schema='urban_greening')
    
    # Insert common Philippine tree species
    op.execute("""
        INSERT INTO urban_greening.tree_species (scientific_name, common_name, local_name, family, is_native, is_endangered) VALUES
        ('Pterocarpus indicus', 'Narra', 'Narra', 'Fabaceae', true, true),
        ('Swietenia macrophylla', 'Mahogany', 'Mahogany', 'Meliaceae', false, false),
        ('Vitex parviflora', 'Molave', 'Molave', 'Lamiaceae', true, true),
        ('Acacia mangium', 'Mangium', 'Akasya', 'Fabaceae', false, false),
        ('Gmelina arborea', 'Gmelina', 'Gmelina', 'Lamiaceae', false, false),
        ('Leucaena leucocephala', 'Lead Tree', 'Ipil-ipil', 'Fabaceae', false, false),
        ('Mangifera indica', 'Mango', 'Mangga', 'Anacardiaceae', false, false),
        ('Artocarpus heterophyllus', 'Jackfruit', 'Langka', 'Moraceae', false, false),
        ('Tamarindus indica', 'Tamarind', 'Sampalok', 'Fabaceae', false, false),
        ('Ficus benjamina', 'Weeping Fig', 'Balete', 'Moraceae', true, false),
        ('Terminalia catappa', 'Indian Almond', 'Talisay', 'Combretaceae', true, false),
        ('Samanea saman', 'Rain Tree', 'Akasya', 'Fabaceae', false, false),
        ('Delonix regia', 'Flame Tree', 'Fire Tree', 'Fabaceae', false, false),
        ('Ceiba pentandra', 'Kapok', 'Kapok', 'Malvaceae', false, false),
        ('Cocos nucifera', 'Coconut', 'Niyog', 'Arecaceae', true, false),
        ('Shorea contorta', 'White Lauan', 'Lauan', 'Dipterocarpaceae', true, true),
        ('Dipterocarpus grandiflorus', 'Apitong', 'Apitong', 'Dipterocarpaceae', true, true),
        ('Intsia bijuga', 'Ipil', 'Ipil', 'Fabaceae', true, true),
        ('Afzelia rhomboidea', 'Tindalo', 'Tindalo', 'Fabaceae', true, true),
        ('Dracontomelon dao', 'Dao', 'Dao', 'Anacardiaceae', true, false),
        ('Canarium ovatum', 'Pili Nut', 'Pili', 'Burseraceae', true, false),
        ('Sandoricum koetjape', 'Santol', 'Santol', 'Meliaceae', false, false),
        ('Psidium guajava', 'Guava', 'Bayabas', 'Myrtaceae', false, false),
        ('Syzygium cumini', 'Java Plum', 'Duhat', 'Myrtaceae', false, false),
        ('Averrhoa carambola', 'Star Fruit', 'Balimbing', 'Oxalidaceae', false, false),
        ('Unknown', 'Unknown Species', 'Hindi Alam', NULL, false, false)
    """)


def downgrade() -> None:
    op.drop_index('idx_tree_species_active', table_name='tree_species', schema='urban_greening')
    op.drop_index('idx_tree_species_common', table_name='tree_species', schema='urban_greening')
    op.drop_index('idx_tree_species_scientific', table_name='tree_species', schema='urban_greening')
    op.drop_table('tree_species', schema='urban_greening')
