"""fix user email unique constraint for soft deletes

Revision ID: fix_email_soft_delete_001
Revises: add_session_tracking_001
Create Date: 2026-01-24

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fix_email_soft_delete_001'
down_revision = 'add_session_tracking_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Remove the simple unique constraint on email and replace it with
    a partial unique index that only applies to non-deleted users.
    This allows the same email to be reused after soft deletion.
    """
    
    # Drop the existing unique constraint on email
    # The constraint name might vary, try common patterns
    try:
        op.drop_constraint('users_email_key', 'users', schema='app_auth', type_='unique')
    except Exception:
        pass  # Constraint might have different name or not exist
    
    # Drop the old index if it exists
    try:
        op.drop_index('ix_app_auth_users_email', table_name='users', schema='app_auth')
    except Exception:
        pass
    
    # Create a regular index for email lookups
    op.create_index(
        'idx_users_email',
        'users',
        ['email'],
        schema='app_auth'
    )
    
    # Create partial unique index: email is unique only for non-deleted users
    op.execute("""
        CREATE UNIQUE INDEX idx_users_email_unique_active 
        ON app_auth.users(email) 
        WHERE deleted_at IS NULL
    """)


def downgrade() -> None:
    """
    Reverse the changes: remove partial index and restore simple unique constraint
    """
    
    # Drop the partial unique index
    op.drop_index('idx_users_email_unique_active', table_name='users', schema='app_auth')
    
    # Drop the regular index
    op.drop_index('idx_users_email', table_name='users', schema='app_auth')
    
    # Restore the original unique constraint
    op.create_unique_constraint('users_email_key', 'users', ['email'], schema='app_auth')
    
    # Restore the original index
    op.create_index('ix_app_auth_users_email', 'users', ['email'], schema='app_auth')
