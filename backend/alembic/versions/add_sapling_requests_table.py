"""Create sapling_requests table in urban_greening schema

Revision ID: add_sapling_requests_table
Revises: cleanup_tree_management_table
Create Date: 2025-08-14

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'add_sapling_requests_table'

down_revision: Union[str, None] = 'cleanup_tree_management_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'sapling_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('date_received', sa.Date(), nullable=False),
        sa.Column('requester_name', sa.String(length=255), nullable=False),
        sa.Column('address', sa.String(length=500), nullable=False),
        sa.Column('saplings', sa.Text(), nullable=False),  # JSON array string: [{ name, qty }]
        sa.Column('monitoring_request_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        schema='urban_greening'
    )

    op.create_index(
        'idx_urban_greening_sapling_request_date_received',
        'sapling_requests',
        ['date_received'],
        unique=False,
        schema='urban_greening'
    )
    op.create_index(
        'idx_urban_greening_sapling_request_requester',
        'sapling_requests',
        ['requester_name'],
        unique=False,
        schema='urban_greening'
    )


def downgrade() -> None:
    op.drop_index('idx_urban_greening_sapling_request_requester', table_name='sapling_requests', schema='urban_greening')
    op.drop_index('idx_urban_greening_sapling_request_date_received', table_name='sapling_requests', schema='urban_greening')
    op.drop_table('sapling_requests', schema='urban_greening')
