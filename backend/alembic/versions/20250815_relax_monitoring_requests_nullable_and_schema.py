"""Relax monitoring_requests columns and ensure schema is urban_greening

Revision ID: 20250815_relax_monitoring
Revises: 20250815_merge_heads
Create Date: 2025-08-15

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250815_relax_monitoring'
down_revision = '20250815_merge_heads'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # If the table exists without schema, move it; otherwise ensure alterations target the correct schema
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Check if 'monitoring_requests' exists without schema
    has_public_table = 'monitoring_requests' in inspector.get_table_names(schema=None)
    has_ug_table = 'monitoring_requests' in inspector.get_table_names(schema='urban_greening')

    if has_public_table and not has_ug_table:
        # Create table in urban_greening by cloning structure and data, then drop public table
        op.create_table(
            'monitoring_requests',
            sa.Column('id', sa.String(), primary_key=True, index=True),
            sa.Column('title', sa.String(), nullable=True),
            sa.Column('requester_name', sa.String(), nullable=True),
            sa.Column('status', sa.String(), nullable=False),
            sa.Column('date', sa.Date(), nullable=True),
            sa.Column('location', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
            sa.Column('address', sa.String(), nullable=True),
            sa.Column('description', sa.Text(), nullable=True),
            schema='urban_greening'
        )
        # Copy rows
        bind.execute(sa.text(
            'INSERT INTO urban_greening.monitoring_requests (id, title, requester_name, status, date, location, address, description)\n'
            'SELECT id, title, requester_name, status, date, location, address, description FROM monitoring_requests'
        ))
        # Drop old public table
        op.drop_table('monitoring_requests')
    else:
        # Table already present in urban_greening; just ensure nullability
        pass

    # Alter columns to be nullable=True where required, in the urban_greening schema
    op.alter_column('monitoring_requests', 'title', existing_type=sa.String(), nullable=True, schema='urban_greening')
    op.alter_column('monitoring_requests', 'requester_name', existing_type=sa.String(), nullable=True, schema='urban_greening')
    op.alter_column('monitoring_requests', 'date', existing_type=sa.Date(), nullable=True, schema='urban_greening')
    op.alter_column('monitoring_requests', 'address', existing_type=sa.String(), nullable=True, schema='urban_greening')
    # status and location remain NOT NULL


def downgrade() -> None:
    # Revert columns to NOT NULL (best-effort); keep schema as urban_greening
    op.alter_column('monitoring_requests', 'address', existing_type=sa.String(), nullable=False, schema='urban_greening')
    op.alter_column('monitoring_requests', 'date', existing_type=sa.Date(), nullable=False, schema='urban_greening')
    op.alter_column('monitoring_requests', 'requester_name', existing_type=sa.String(), nullable=False, schema='urban_greening')
    op.alter_column('monitoring_requests', 'title', existing_type=sa.String(), nullable=False, schema='urban_greening')
