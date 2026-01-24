# Fix for Archived User Email Conflict

## Problem
The database has a simple UNIQUE constraint on the `users.email` column, which prevents creating a new user with the same email as an archived (soft-deleted) user.

## Solution
Replace the simple unique constraint with a **partial unique index** that only enforces uniqueness for non-deleted users (`WHERE deleted_at IS NULL`).

## How to Apply

### Option 1: Using Alembic Migration (Recommended)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Run the migration:**
   ```bash
   alembic upgrade head
   ```

### Option 2: Manual SQL (if Alembic fails)

If the automated migration encounters issues, run this SQL directly:

```sql
-- Drop existing unique constraint
ALTER TABLE app_auth.users DROP CONSTRAINT IF EXISTS users_email_key;

-- Drop old index
DROP INDEX IF EXISTS app_auth.ix_app_auth_users_email;

-- Create regular index for email lookups
CREATE INDEX idx_users_email ON app_auth.users(email);

-- Create partial unique index (only for non-deleted users)
CREATE UNIQUE INDEX idx_users_email_unique_active 
ON app_auth.users(email) 
WHERE deleted_at IS NULL;
```

## What This Fixes

✅ **Email Reuse After Deletion**: You can now create a new user with the same email as an archived account

✅ **Maintains Data Integrity**: Active users still cannot have duplicate emails

✅ **Soft Delete Support**: Properly supports the soft delete pattern with `deleted_at` timestamp

## Testing

After applying the migration, test by:

1. Create a user with email `test@example.com`
2. Delete (archive) that user
3. Create a new user with email `test@example.com` - this should now work!

## Rollback

If you need to revert this change:

```bash
alembic downgrade -1
```

This will restore the original unique constraint (but note: if you have duplicate emails in archived users, the rollback will fail).
