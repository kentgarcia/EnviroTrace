"""Add offices table and update vehicles foreign key

Revision ID: c8e7b8cf41c2
Revises: 0e08d5e0e7a2
Create Date: 2025-05-25 22:01:02.623718

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'c8e7b8cf41c2'
down_revision: Union[str, None] = '0e08d5e0e7a2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Create the offices table
    op.create_table(
        'offices',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('address', sa.String(500), nullable=True),
        sa.Column('contact_number', sa.String(50), nullable=True),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
        schema='emission'
    )
    
    # 2. Migrate existing office names to the offices table
    # Get unique office names from vehicles table
    connection = op.get_bind()
    result = connection.execute(sa.text("""
        SELECT DISTINCT office_name 
        FROM emission.vehicles 
        WHERE office_name IS NOT NULL 
        ORDER BY office_name
    """))
    
    office_names = [row[0] for row in result.fetchall()]
    
    # Insert offices and get their IDs
    office_mapping = {}
    for office_name in office_names:
        insert_result = connection.execute(sa.text("""
            INSERT INTO emission.offices (name, created_at, updated_at) 
            VALUES (:name, NOW(), NOW()) 
            RETURNING id
        """), {"name": office_name})
        
        office_id = insert_result.fetchone()[0]
        office_mapping[office_name] = office_id
    
    # 3. Add office_id column to vehicles table
    op.add_column('vehicles', sa.Column('office_id', postgresql.UUID(as_uuid=True), nullable=True), schema='emission')
    
    # 4. Update vehicles to set office_id based on office_name
    for office_name, office_id in office_mapping.items():
        connection.execute(sa.text("""
            UPDATE emission.vehicles 
            SET office_id = :office_id 
            WHERE office_name = :office_name
        """), {"office_id": office_id, "office_name": office_name})
    
    # 5. Make office_id NOT NULL and add foreign key constraint
    op.alter_column('vehicles', 'office_id', nullable=False, schema='emission')
    op.create_foreign_key(
        'fk_vehicles_office_id', 
        'vehicles', 
        'offices', 
        ['office_id'], 
        ['id'], 
        source_schema='emission',
        referent_schema='emission'
    )
    
    # 6. Drop the office_name column
    op.drop_column('vehicles', 'office_name', schema='emission')


def downgrade() -> None:
    """Downgrade schema."""
    # 1. Add back office_name column
    op.add_column('vehicles', sa.Column('office_name', sa.String(255), nullable=True), schema='emission')
    
    # 2. Populate office_name from office relationship
    connection = op.get_bind()
    connection.execute(sa.text("""
        UPDATE emission.vehicles 
        SET office_name = o.name 
        FROM emission.offices o 
        WHERE vehicles.office_id = o.id
    """))
    
    # 3. Make office_name NOT NULL
    op.alter_column('vehicles', 'office_name', nullable=False, schema='emission')
    
    # 4. Drop foreign key constraint and office_id column
    op.drop_constraint('fk_vehicles_office_id', 'vehicles', schema='emission', type_='foreignkey')
    op.drop_column('vehicles', 'office_id', schema='emission')
    
    # 5. Drop offices table
    op.drop_table('offices', schema='emission')
