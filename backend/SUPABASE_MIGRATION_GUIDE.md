# Supabase Migration Guide

This guide will help you migrate your EnviroTrace backend from a local PostgreSQL database to Supabase.

## Prerequisites

- A Supabase project (already set up at: `https://njcduhzwutzmbxjfwcag.supabase.co`)
- Your Supabase database password
- Python 3.8+ installed

## Step 1: Update Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update your `.env` file with Supabase credentials:**

   Replace `YOUR_PASSWORD` in the `DATABASE_URL` with your actual Supabase database password:
   
   ```env
   DATABASE_URL="postgresql+asyncpg://postgres.njcduhzwutzmbxjfwcag:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   
   SECRET_KEY="your-secret-key-here"
   ACCESS_TOKEN_EXPIRE_MINUTES=600
   ALGORITHM="HS256"
   
   SUPABASE_URL="https://njcduhzwutzmbxjfwcag.supabase.co"
   SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qY2R1aHp3dXR6bWJ4amZ3Y2FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTA0NzksImV4cCI6MjA4MDc4NjQ3OX0.NNVsQf8Fo8r1QbrgaWNJfz_guRped9mWwtWD6kZQuOw"
   
   # Optional: For Google Gemini AI features
   # GOOGLE_API_KEY="your-google-api-key"
   ```

   **Finding your Supabase password:**
   - Go to your Supabase project dashboard
   - Navigate to Settings → Database
   - Find the "Connection String" section
   - Your password is the one you set when creating the project (if you forgot it, you can reset it)

## Step 2: Install Dependencies

Install the updated dependencies including Supabase client:

```bash
pip install -r requirements.txt
```

## Step 3: Create Database Schemas

Supabase requires us to create the custom schemas before running migrations. Run this SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom schemas
CREATE SCHEMA IF NOT EXISTS air_quality;
CREATE SCHEMA IF NOT EXISTS emission;
CREATE SCHEMA IF NOT EXISTS urban_greening;

-- Grant permissions
GRANT USAGE ON SCHEMA air_quality TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA air_quality TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA air_quality TO postgres, anon, authenticated, service_role;

GRANT USAGE ON SCHEMA emission TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA emission TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA emission TO postgres, anon, authenticated, service_role;

GRANT USAGE ON SCHEMA urban_greening TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA urban_greening TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA urban_greening TO postgres, anon, authenticated, service_role;

-- Ensure auth schema exists (Supabase provides this)
-- CREATE SCHEMA IF NOT EXISTS auth; -- This should already exist in Supabase
```

**Where to run this:**
1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor" in the left sidebar
3. Paste the above SQL
4. Click "Run" or press Ctrl+Enter

## Step 4: Run Database Migrations

Run the Alembic migrations to create all tables:

```bash
# Make sure you're in the backend directory
cd backend

# Run migrations
alembic upgrade head
```

If you encounter issues, you can check the current migration version:

```bash
alembic current
```

## Step 5: Create Initial Admin User

After migrations are complete, create your first admin user:

**Option A: Using the provided script (Windows):**
```bash
./scripts/setup_admin.bat
```

**Option B: Using the provided script (Linux/Mac):**
```bash
./scripts/setup_admin.sh
```

**Option C: Manual creation using Python:**
```python
# Run this in a Python console or create a script
import asyncio
from app.db.database import engine
from app.models.auth_models import User
from app.core.security import get_password_hash
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
import uuid

async def create_admin():
    AsyncSessionLocal = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with AsyncSessionLocal() as session:
        admin_user = User(
            id=uuid.uuid4(),
            email="admin@envirotrace.com",
            encrypted_password=get_password_hash("admin123"),
            is_super_admin=True
        )
        session.add(admin_user)
        await session.commit()
        print(f"Admin user created: {admin_user.email}")

asyncio.run(create_admin())
```

## Step 6: Verify Connection

Test your connection to Supabase:

```bash
python scripts/test_db_connection.py
```

## Step 7: Start Your Application

Start your FastAPI application:

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Your API should now be running and connected to Supabase!

## Important Notes

### Connection Pooling

Supabase uses connection pooling via PgBouncer. The connection string provided uses:
- **Port 6543**: Session mode (recommended for most applications)
- **Port 5432**: Direct connection (use only if needed)

For best performance, stick with port 6543.

### Row Level Security (RLS)

Supabase has Row Level Security enabled by default on the `public` schema. However, your custom schemas (`air_quality`, `emission`, `urban_greening`, `auth`) need RLS policies configured if you want to use the Supabase client libraries directly from frontend applications.

For backend-only access (which is your current setup), you can disable RLS or use the service role key.

### Authentication Schema Conflicts

⚠️ **Important:** Your application uses a custom `auth` schema which may conflict with Supabase's built-in `auth` schema. Consider:

1. **Option A (Recommended):** Use Supabase's built-in authentication
2. **Option B:** Rename your custom auth schema to something else (e.g., `app_auth`)
3. **Option C:** Keep both but ensure they don't conflict

### Environment-Specific Configuration

For different environments:

**Development (Local):**
```env
DATABASE_URL="postgresql+asyncpg://postgres.njcduhzwutzmbxjfwcag:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

**Production:**
Same as development - Supabase handles scaling automatically.

## Troubleshooting

### Connection Errors

If you get connection errors:

1. **Check your password**: Ensure it's correctly URL-encoded if it contains special characters
2. **Verify network**: Ensure you can reach `aws-0-us-east-1.pooler.supabase.com`
3. **Check connection limits**: Supabase free tier has connection limits

### Migration Errors

If migrations fail:

1. **Check schema creation**: Ensure all schemas were created in Step 3
2. **Check permissions**: Verify the postgres user has necessary permissions
3. **Reset if needed**: 
   ```bash
   alembic downgrade base
   alembic upgrade head
   ```

### SSL/TLS Issues

Supabase requires SSL connections. Your connection URL should include SSL parameters:
```
postgresql+asyncpg://...?sslmode=require
```

This is handled automatically by Supabase's connection string.

## Data Migration (Optional)

If you have existing data in a local database that you want to migrate:

1. **Export from local database:**
   ```bash
   pg_dump -h localhost -U your_user -d your_db --schema=air_quality --schema=emission --schema=urban_greening --schema=auth > local_data.sql
   ```

2. **Import to Supabase:**
   - Option A: Use Supabase SQL Editor for smaller datasets
   - Option B: Use `psql` command:
     ```bash
     psql "postgresql://postgres.njcduhzwutzmbxjfwcag:PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres" < local_data.sql
     ```

3. **Or use the migration script:**
   ```bash
   python scripts/migrate_local_to_render.py  # Adapt this for Supabase
   ```

## Monitoring and Maintenance

### View Logs
- Go to Supabase Dashboard → Logs
- Monitor database queries, errors, and performance

### Database Health
- Dashboard → Database → Health tab
- Monitor connection pools, query performance, cache hit rates

### Backups
Supabase automatically backs up your database. To create manual backups:
- Dashboard → Database → Backups

## Next Steps

1. ✅ Configure CORS for your frontend applications
2. ✅ Set up proper RLS policies if using Supabase client from frontend
3. ✅ Configure API keys and secrets
4. ✅ Set up monitoring and alerting
5. ✅ Review and optimize database indexes
6. ✅ Implement proper error handling for connection issues

## Support

- **Supabase Documentation**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **Project Dashboard**: https://app.supabase.com/project/njcduhzwutzmbxjfwcag

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use service role key only in backend** - Never expose to frontend
3. **Rotate secrets regularly**
4. **Enable RLS policies** for tables accessed from frontend
5. **Monitor suspicious activity** in Supabase dashboard
6. **Use connection pooling** (already configured)
7. **Set up API rate limiting** in your FastAPI application

---

**Migration Status:** Ready for testing
**Last Updated:** December 9, 2025
