"""add vehicle identification fields

Revision ID: add_vehicle_identification
Revises: add_session_device_tracking
Create Date: 2025-12-21 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_vehicle_identification'
down_revision = 'add_session_device_tracking'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add chassis_number and registration_number columns to vehicles table
    op.add_column('vehicles', sa.Column('chassis_number', sa.String(length=100), nullable=True), schema='emission')
    op.add_column('vehicles', sa.Column('registration_number', sa.String(length=100), nullable=True), schema='emission')
    
    # Make plate_number nullable since vehicles may use chassis/registration number instead
    op.alter_column('vehicles', 'plate_number', nullable=True, schema='emission')
    
    # Drop unique constraint on plate_number
    op.drop_constraint('vehicles_plate_number_key', 'vehicles', type_='unique', schema='emission')
    
    # Add unique constraint on chassis_number
    op.create_unique_constraint('vehicles_chassis_number_key', 'vehicles', ['chassis_number'], schema='emission')
    
    # Add unique constraint on registration_number
    op.create_unique_constraint('vehicles_registration_number_key', 'vehicles', ['registration_number'], schema='emission')


def downgrade() -> None:
    # Drop unique constraints
    op.drop_constraint('vehicles_registration_number_key', 'vehicles', type_='unique', schema='emission')
    op.drop_constraint('vehicles_chassis_number_key', 'vehicles', type_='unique', schema='emission')
    
    # Restore unique constraint on plate_number
    op.create_unique_constraint('vehicles_plate_number_key', 'vehicles', ['plate_number'], schema='emission')
    
    # Make plate_number required again
    op.alter_column('vehicles', 'plate_number', nullable=False, schema='emission')
    
    # Drop the new columns
    op.drop_column('vehicles', 'registration_number', schema='emission')
    op.drop_column('vehicles', 'chassis_number', schema='emission')
