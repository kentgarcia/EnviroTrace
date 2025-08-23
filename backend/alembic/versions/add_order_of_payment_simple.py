from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'add_order_of_payment_simple'
down_revision: Union[str, None] = 'f146fdf390ac'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - Add only order of payment table."""
    # Create the orders_of_payment table
    op.create_table('orders_of_payment',
        sa.Column('id', sa.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('control_number', sa.String(length=50), nullable=False),
        sa.Column('plate_number', sa.String(length=20), nullable=False),
        sa.Column('operator_name', sa.String(length=200), nullable=False),
        sa.Column('driver_name', sa.String(length=200), nullable=True),
        sa.Column('admin_created_by', sa.String(length=200), nullable=False),
        sa.Column('status', sa.String(length=20), server_default='draft', nullable=False),
        sa.Column('oop_control_number', sa.String(length=50), nullable=False),
        sa.Column('testing_officer', sa.String(length=200), nullable=True),
        sa.Column('test_results', sa.String(length=500), nullable=True),
        sa.Column('date_of_testing', sa.Date(), nullable=True),
        sa.Column('selected_violations', sa.String(), nullable=False),
        sa.Column('apprehension_fee', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('voluntary_fee', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('impound_fee', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('driver_amount', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('operator_fee', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('total_undisclosed_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('grand_total_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('date_of_payment', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('control_number'),
        schema='belching'
    )
    
    # Create indexes
    op.create_index('idx_belching_oop_control_number', 'orders_of_payment', ['control_number'], unique=False, schema='belching')
    op.create_index('idx_belching_oop_plate_number', 'orders_of_payment', ['plate_number'], unique=False, schema='belching')
    op.create_index('idx_belching_oop_status', 'orders_of_payment', ['status'], unique=False, schema='belching')
    op.create_index('idx_belching_oop_created_date', 'orders_of_payment', ['created_at'], unique=False, schema='belching')


def downgrade() -> None:
    """Downgrade schema - Remove order of payment table."""
    op.drop_index('idx_belching_oop_created_date', table_name='orders_of_payment', schema='belching')
    op.drop_index('idx_belching_oop_status', table_name='orders_of_payment', schema='belching')
    op.drop_index('idx_belching_oop_plate_number', table_name='orders_of_payment', schema='belching')
    op.drop_index('idx_belching_oop_control_number', table_name='orders_of_payment', schema='belching')
    op.drop_table('orders_of_payment', schema='belching')
