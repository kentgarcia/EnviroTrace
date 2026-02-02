"""migrate to supabase auth

Revision ID: migrate_supabase_auth_001
Revises: fix_email_soft_delete_001
Create Date: 2026-02-02

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'migrate_supabase_auth_001'
down_revision = 'fix_email_soft_delete_001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Migrate from custom JWT authentication to Supabase Auth:
    - Add supabase_user_id to track Supabase auth users
    - Add email_confirmed_at for email verification tracking
    - Remove encrypted_password (Supabase handles passwords)
    - Update user_sessions to use supabase_session_id
    - Delete existing test accounts (users must re-register)
    """
    
    # Step 1: Delete existing test account data (fresh start)
    # This cascades to related tables if foreign keys are set up properly
    op.execute("""
        DELETE FROM app_auth.users 
        WHERE email IN (
            'admin@envirotrace.com',
            'airquality@envirotrace.com',
            'treemanagement@envirotrace.com',
            'emission@envirotrace.com',
            'multirole@envirotrace.com'
        )
    """)
    
    # Step 2: Add new columns to users table
    op.add_column(
        'users',
        sa.Column('supabase_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        schema='app_auth'
    )
    
    op.add_column(
        'users',
        sa.Column('email_confirmed_at', sa.DateTime(timezone=True), nullable=True),
        schema='app_auth'
    )
    
    op.add_column(
        'users',
        sa.Column('is_approved', sa.Boolean(), server_default='false', nullable=False),
        schema='app_auth'
    )
    
    # Step 3: Create unique index on supabase_user_id for non-null values
    op.create_index(
        'idx_users_supabase_user_id',
        'users',
        ['supabase_user_id'],
        unique=True,
        schema='app_auth',
        postgresql_where=sa.text('supabase_user_id IS NOT NULL')
    )
    
    # Step 4: Drop encrypted_password column
    # (Keep hashed_password temporarily commented in case rollback needed)
    op.drop_column('users', 'encrypted_password', schema='app_auth')
    
    # Step 5: Update user_sessions table
    # Rename session_token to supabase_session_id
    op.alter_column(
        'user_sessions',
        'session_token',
        new_column_name='supabase_session_id',
        schema='app_auth'
    )
    
    # Update the unique constraint on the renamed column
    op.drop_constraint('user_sessions_session_token_key', 'user_sessions', schema='app_auth', type_='unique')
    op.create_unique_constraint(
        'user_sessions_supabase_session_id_key',
        'user_sessions',
        ['supabase_session_id'],
        schema='app_auth'
    )


def downgrade() -> None:
    """
    Rollback to custom JWT authentication.
    WARNING: This will require recreating test accounts with passwords.
    """
    
    # Step 1: Restore user_sessions column name
    op.drop_constraint('user_sessions_supabase_session_id_key', 'user_sessions', schema='app_auth', type_='unique')
    
    op.alter_column(
        'user_sessions',
        'supabase_session_id',
        new_column_name='session_token',
        schema='app_auth'
    )
    
    op.create_unique_constraint(
        'user_sessions_session_token_key',
        'user_sessions',
        ['session_token'],
        schema='app_auth'
    )
    
    # Step 2: Restore encrypted_password column
    op.add_column(
        'users',
        sa.Column('encrypted_password', sa.String(length=255), nullable=True),
        schema='app_auth'
    )
    
    # Step 3: Drop new columns
    op.drop_index('idx_users_supabase_user_id', table_name='users', schema='app_auth')
    op.drop_column('users', 'is_approved', schema='app_auth')
    op.drop_column('users', 'email_confirmed_at', schema='app_auth')
    op.drop_column('users', 'supabase_user_id', schema='app_auth')
    
    # Note: Test accounts and passwords are NOT restored automatically
    # Manual data restoration required from backup if needed
