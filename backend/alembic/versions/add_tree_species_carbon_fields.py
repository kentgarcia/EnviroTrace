"""Add carbon and growth fields to tree_species table

Revision ID: add_tree_species_carbon_fields
Revises: fix_tree_species_schema
Create Date: 2026-01-01

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_tree_species_carbon_fields'
down_revision = 'fix_tree_species_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add physical/growth fields
    op.add_column('tree_species', sa.Column('wood_density_min', sa.Float(), nullable=True, comment="Minimum wood density in g/cm³"), schema='urban_greening')
    op.add_column('tree_species', sa.Column('wood_density_max', sa.Float(), nullable=True, comment="Maximum wood density in g/cm³"), schema='urban_greening')
    op.add_column('tree_species', sa.Column('wood_density_avg', sa.Float(), nullable=True, comment="Average wood density in g/cm³"), schema='urban_greening')
    
    op.add_column('tree_species', sa.Column('avg_mature_height_min_m', sa.Float(), nullable=True, comment="Minimum mature height in meters"), schema='urban_greening')
    op.add_column('tree_species', sa.Column('avg_mature_height_max_m', sa.Float(), nullable=True, comment="Maximum mature height in meters"), schema='urban_greening')
    op.add_column('tree_species', sa.Column('avg_mature_height_avg_m', sa.Float(), nullable=True, comment="Average mature height in meters"), schema='urban_greening')
    
    op.add_column('tree_species', sa.Column('avg_trunk_diameter_min_cm', sa.Float(), nullable=True, comment="Minimum trunk diameter at DBH in cm"), schema='urban_greening')
    op.add_column('tree_species', sa.Column('avg_trunk_diameter_max_cm', sa.Float(), nullable=True, comment="Maximum trunk diameter at DBH in cm"), schema='urban_greening')
    op.add_column('tree_species', sa.Column('avg_trunk_diameter_avg_cm', sa.Float(), nullable=True, comment="Average trunk diameter at DBH in cm"), schema='urban_greening')
    
    op.add_column('tree_species', sa.Column('growth_rate_m_per_year', sa.Float(), nullable=True, comment="Representative growth rate in m/year"), schema='urban_greening')
    op.add_column('tree_species', sa.Column('growth_speed_label', sa.String(50), nullable=True, comment="Slow / Moderate / Fast"), schema='urban_greening')
    
    # Add carbon/CO2 fields
    op.add_column('tree_species', sa.Column('co2_absorbed_kg_per_year', sa.Float(), nullable=True, comment="CO2 absorbed per year in kg"), schema='urban_greening')
    op.add_column('tree_species', sa.Column('co2_stored_mature_min_kg', sa.Float(), nullable=True, comment="Minimum CO2 stored at maturity in kg"), schema='urban_greening')
    op.add_column('tree_species', sa.Column('co2_stored_mature_max_kg', sa.Float(), nullable=True, comment="Maximum CO2 stored at maturity in kg"), schema='urban_greening')
    op.add_column('tree_species', sa.Column('co2_stored_mature_avg_kg', sa.Float(), nullable=True, comment="Average CO2 stored at maturity in kg"), schema='urban_greening')
    op.add_column('tree_species', sa.Column('carbon_fraction', sa.Float(), nullable=True, comment="Biomass to carbon fraction"), schema='urban_greening')
    
    # Add removal impact factors
    op.add_column('tree_species', sa.Column('decay_years_min', sa.Integer(), nullable=True, comment="Minimum decay years after removal"), schema='urban_greening')
    op.add_column('tree_species', sa.Column('decay_years_max', sa.Integer(), nullable=True, comment="Maximum decay years after removal"), schema='urban_greening')
    op.add_column('tree_species', sa.Column('lumber_carbon_retention_pct', sa.Float(), nullable=True, comment="Carbon retention as lumber (0-1)"), schema='urban_greening')
    op.add_column('tree_species', sa.Column('burned_carbon_release_pct', sa.Float(), nullable=True, comment="Carbon released when burned (0-1)"), schema='urban_greening')
    
    op.add_column('tree_species', sa.Column('notes', sa.Text(), nullable=True, comment="Additional notes about this species"), schema='urban_greening')
    
    # Update common Philippine species with carbon data
    # Data based on research and forestry studies
    op.execute("""
        UPDATE urban_greening.tree_species SET
            co2_absorbed_kg_per_year = 28.5,
            co2_stored_mature_avg_kg = 750,
            co2_stored_mature_min_kg = 500,
            co2_stored_mature_max_kg = 1000,
            avg_mature_height_avg_m = 33,
            avg_trunk_diameter_avg_cm = 100,
            growth_rate_m_per_year = 0.8,
            growth_speed_label = 'Moderate',
            wood_density_avg = 0.64,
            carbon_fraction = 0.5,
            decay_years_min = 20,
            decay_years_max = 50,
            lumber_carbon_retention_pct = 0.7,
            burned_carbon_release_pct = 1.0
        WHERE common_name = 'Narra';
        
        UPDATE urban_greening.tree_species SET
            co2_absorbed_kg_per_year = 21.8,
            co2_stored_mature_avg_kg = 650,
            co2_stored_mature_min_kg = 450,
            co2_stored_mature_max_kg = 850,
            avg_mature_height_avg_m = 30,
            avg_trunk_diameter_avg_cm = 90,
            growth_rate_m_per_year = 1.2,
            growth_speed_label = 'Fast',
            wood_density_avg = 0.56,
            carbon_fraction = 0.5,
            decay_years_min = 15,
            decay_years_max = 40,
            lumber_carbon_retention_pct = 0.7,
            burned_carbon_release_pct = 1.0
        WHERE common_name = 'Mahogany';
        
        UPDATE urban_greening.tree_species SET
            co2_absorbed_kg_per_year = 24.3,
            co2_stored_mature_avg_kg = 800,
            co2_stored_mature_min_kg = 600,
            co2_stored_mature_max_kg = 1000,
            avg_mature_height_avg_m = 30,
            avg_trunk_diameter_avg_cm = 85,
            growth_rate_m_per_year = 0.6,
            growth_speed_label = 'Slow',
            wood_density_avg = 0.82,
            carbon_fraction = 0.5,
            decay_years_min = 30,
            decay_years_max = 60,
            lumber_carbon_retention_pct = 0.8,
            burned_carbon_release_pct = 1.0
        WHERE common_name = 'Molave';
        
        UPDATE urban_greening.tree_species SET
            co2_absorbed_kg_per_year = 25.6,
            co2_stored_mature_avg_kg = 550,
            co2_stored_mature_min_kg = 400,
            co2_stored_mature_max_kg = 700,
            avg_mature_height_avg_m = 30,
            avg_trunk_diameter_avg_cm = 70,
            growth_rate_m_per_year = 1.5,
            growth_speed_label = 'Fast',
            wood_density_avg = 0.48,
            carbon_fraction = 0.5,
            decay_years_min = 10,
            decay_years_max = 30,
            lumber_carbon_retention_pct = 0.6,
            burned_carbon_release_pct = 1.0
        WHERE common_name = 'Mangium';
        
        UPDATE urban_greening.tree_species SET
            co2_absorbed_kg_per_year = 22.4,
            co2_stored_mature_avg_kg = 520,
            co2_stored_mature_min_kg = 380,
            co2_stored_mature_max_kg = 660,
            avg_mature_height_avg_m = 25,
            avg_trunk_diameter_avg_cm = 65,
            growth_rate_m_per_year = 1.4,
            growth_speed_label = 'Fast',
            wood_density_avg = 0.55,
            carbon_fraction = 0.5,
            decay_years_min = 10,
            decay_years_max = 30,
            lumber_carbon_retention_pct = 0.6,
            burned_carbon_release_pct = 1.0
        WHERE common_name = 'Gmelina';
        
        UPDATE urban_greening.tree_species SET
            co2_absorbed_kg_per_year = 18.5,
            co2_stored_mature_avg_kg = 280,
            co2_stored_mature_min_kg = 200,
            co2_stored_mature_max_kg = 360,
            avg_mature_height_avg_m = 12,
            avg_trunk_diameter_avg_cm = 35,
            growth_rate_m_per_year = 1.8,
            growth_speed_label = 'Fast',
            wood_density_avg = 0.52,
            carbon_fraction = 0.5,
            decay_years_min = 5,
            decay_years_max = 15,
            lumber_carbon_retention_pct = 0.5,
            burned_carbon_release_pct = 1.0
        WHERE common_name = 'Lead Tree';
        
        -- Fruit trees
        UPDATE urban_greening.tree_species SET
            co2_absorbed_kg_per_year = 19.2,
            co2_stored_mature_avg_kg = 450,
            co2_stored_mature_min_kg = 300,
            co2_stored_mature_max_kg = 600,
            avg_mature_height_avg_m = 20,
            avg_trunk_diameter_avg_cm = 60,
            growth_rate_m_per_year = 0.8,
            growth_speed_label = 'Moderate',
            wood_density_avg = 0.60,
            carbon_fraction = 0.5,
            decay_years_min = 12,
            decay_years_max = 30,
            lumber_carbon_retention_pct = 0.5,
            burned_carbon_release_pct = 1.0
        WHERE common_name IN ('Mango', 'Jackfruit', 'Tamarind');
        
        -- Native endangered species
        UPDATE urban_greening.tree_species SET
            co2_absorbed_kg_per_year = 26.8,
            co2_stored_mature_avg_kg = 850,
            co2_stored_mature_min_kg = 650,
            co2_stored_mature_max_kg = 1050,
            avg_mature_height_avg_m = 35,
            avg_trunk_diameter_avg_cm = 110,
            growth_rate_m_per_year = 0.7,
            growth_speed_label = 'Moderate',
            wood_density_avg = 0.72,
            carbon_fraction = 0.5,
            decay_years_min = 25,
            decay_years_max = 55,
            lumber_carbon_retention_pct = 0.75,
            burned_carbon_release_pct = 1.0
        WHERE common_name IN ('White Lauan', 'Apitong', 'Ipil', 'Tindalo');
        
        -- Default for any species without data
        UPDATE urban_greening.tree_species SET
            co2_absorbed_kg_per_year = 22.0,
            co2_stored_mature_avg_kg = 500,
            co2_stored_mature_min_kg = 300,
            co2_stored_mature_max_kg = 700,
            avg_mature_height_avg_m = 20,
            avg_trunk_diameter_avg_cm = 60,
            growth_rate_m_per_year = 1.0,
            growth_speed_label = 'Moderate',
            wood_density_avg = 0.55,
            carbon_fraction = 0.5,
            decay_years_min = 15,
            decay_years_max = 35,
            lumber_carbon_retention_pct = 0.6,
            burned_carbon_release_pct = 1.0
        WHERE co2_absorbed_kg_per_year IS NULL;
    """)


def downgrade() -> None:
    op.drop_column('tree_species', 'notes', schema='urban_greening')
    op.drop_column('tree_species', 'burned_carbon_release_pct', schema='urban_greening')
    op.drop_column('tree_species', 'lumber_carbon_retention_pct', schema='urban_greening')
    op.drop_column('tree_species', 'decay_years_max', schema='urban_greening')
    op.drop_column('tree_species', 'decay_years_min', schema='urban_greening')
    op.drop_column('tree_species', 'carbon_fraction', schema='urban_greening')
    op.drop_column('tree_species', 'co2_stored_mature_avg_kg', schema='urban_greening')
    op.drop_column('tree_species', 'co2_stored_mature_max_kg', schema='urban_greening')
    op.drop_column('tree_species', 'co2_stored_mature_min_kg', schema='urban_greening')
    op.drop_column('tree_species', 'co2_absorbed_kg_per_year', schema='urban_greening')
    op.drop_column('tree_species', 'growth_speed_label', schema='urban_greening')
    op.drop_column('tree_species', 'growth_rate_m_per_year', schema='urban_greening')
    op.drop_column('tree_species', 'avg_trunk_diameter_avg_cm', schema='urban_greening')
    op.drop_column('tree_species', 'avg_trunk_diameter_max_cm', schema='urban_greening')
    op.drop_column('tree_species', 'avg_trunk_diameter_min_cm', schema='urban_greening')
    op.drop_column('tree_species', 'avg_mature_height_avg_m', schema='urban_greening')
    op.drop_column('tree_species', 'avg_mature_height_max_m', schema='urban_greening')
    op.drop_column('tree_species', 'avg_mature_height_min_m', schema='urban_greening')
    op.drop_column('tree_species', 'wood_density_avg', schema='urban_greening')
    op.drop_column('tree_species', 'wood_density_max', schema='urban_greening')
    op.drop_column('tree_species', 'wood_density_min', schema='urban_greening')
