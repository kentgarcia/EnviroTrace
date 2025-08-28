"""update_order_payment_status_only

Revision ID: fc430bd2677b
Revises: 55324ef4d234
Create Date: 2025-08-29 02:31:18.029502

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fc430bd2677b'
down_revision: Union[str, None] = '55324ef4d234'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Update Order of Payment status values from old to new format."""
    connection = op.get_bind()
    connection.execute(sa.text("""
        UPDATE air_quality.order_of_payments 
        SET status = CASE 
            WHEN status = 'pending' THEN 'unpaid'
            WHEN status = 'paid' THEN 'fully_paid'
            WHEN status = 'cancelled' THEN 'unpaid'
            ELSE status 
        END
        WHERE status IN ('pending', 'paid', 'cancelled')
    """))


def downgrade() -> None:
    """Revert Order of Payment status values back to old format."""
    connection = op.get_bind()
    connection.execute(sa.text("""
        UPDATE air_quality.order_of_payments 
        SET status = CASE 
            WHEN status = 'unpaid' THEN 'pending'
            WHEN status = 'fully_paid' THEN 'paid'
            WHEN status = 'partially_paid' THEN 'pending'
            ELSE status 
        END
        WHERE status IN ('unpaid', 'fully_paid', 'partially_paid')
    """))
