# Database Migration: Local PostgreSQL → Render PostgreSQL

This guide explains how to migrate your local PostgreSQL database to Render PostgreSQL.

## Prerequisites

1. **PostgreSQL Client Tools**: You need `pg_dump` and `psql` installed on your machine.

   - **Windows**: Download from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
   - **macOS**: `brew install postgresql`
   - **Linux**: `sudo apt-get install postgresql-client`

2. **Database Access**:

   - Your local PostgreSQL database must be running and accessible
   - Render PostgreSQL database must be created and accessible
   - You need the EXTERNAL connection URL from Render dashboard

3. **Python Environment**: Python 3.8+ with access to subprocess module (standard library)

## Quick Start

### Option 1: Using the Wrapper Script (Recommended)

**Windows:**

```bash
cd backend
scripts\migrate_to_render.bat
```

**Linux/macOS:**

```bash
cd backend
chmod +x scripts/migrate_to_render.sh
./scripts/migrate_to_render.sh
```

### Option 2: Direct Python Script

```bash
cd backend

# Set environment variables
export LOCAL_DATABASE_URL="postgresql://user:password@localhost:5432/your_local_db"
export RENDER_DATABASE_URL="postgresql://user:password@dpg-xxxxx.render.com:5432/your_render_db"

# Run migration
python scripts/migrate_local_to_render.py
```

## Configuration

### Getting Your Database URLs

#### Local Database URL

Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`

Example:

```
postgresql://postgres:mypassword@localhost:5432/eco_dash_db
```

#### Render Database URL

1. Go to your Render Dashboard
2. Select your PostgreSQL service
3. Copy the **EXTERNAL Connection String**
4. Format: `postgresql://USER:PASSWORD@dpg-xxxxx-xx.region.render.com:5432/DATABASE`

Example:

```
postgresql://eco_user:abc123xyz@dpg-abcd1234-a.oregon-postgres.render.com:5432/eco_dash_db_xyz
```

⚠️ **Important**: Use the EXTERNAL URL (with `.render.com` hostname), not the INTERNAL URL.

### Setting Environment Variables

#### Using .env file (Recommended)

Add these lines to your `backend/.env` file:

```bash
LOCAL_DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
RENDER_DATABASE_URL="postgresql://user:password@host.render.com:5432/dbname"
```

#### Using Command Line

**Windows (Command Prompt):**

```cmd
set LOCAL_DATABASE_URL=postgresql://user:password@localhost:5432/dbname
set RENDER_DATABASE_URL=postgresql://user:password@host.render.com:5432/dbname
```

**Windows (PowerShell):**

```powershell
$env:LOCAL_DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
$env:RENDER_DATABASE_URL="postgresql://user:password@host.render.com:5432/dbname"
```

**Linux/macOS:**

```bash
export LOCAL_DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
export RENDER_DATABASE_URL="postgresql://user:password@host.render.com:5432/dbname"
```

## Migration Options

The script will prompt you to choose between two migration modes:

### 1. Merge Mode (Default)

- Adds data to existing Render database
- Keeps existing objects
- Safe for incremental updates
- May cause conflicts if objects already exist

### 2. Clean Mode (Destructive)

- Drops all existing objects before migration
- Complete fresh start
- ⚠️ **DELETES ALL EXISTING DATA** on Render
- Requires typing "DELETE EVERYTHING" to confirm

## What Gets Migrated

The script migrates:

- ✅ All tables and their data
- ✅ All sequences
- ✅ All indexes
- ✅ All views
- ✅ All functions and procedures
- ✅ All triggers
- ✅ All constraints (foreign keys, unique, check)
- ✅ All custom types and enums

The script does NOT migrate:

- ❌ User roles and permissions (uses `--no-owner --no-acl`)
- ❌ Tablespaces
- ❌ Replication settings

## Migration Process

The script performs these steps:

1. **Validation**

   - Checks if `pg_dump` and `psql` are available
   - Parses both database URLs
   - Tests connections to both databases

2. **Dump**

   - Creates a compressed dump of your local database
   - Uses PostgreSQL custom format for efficiency
   - Stores in temporary file

3. **Restore**

   - Connects to Render database
   - Restores the dump
   - Handles conflicts based on chosen mode

4. **Cleanup**
   - Removes temporary dump file
   - Displays summary

## Troubleshooting

### "pg_dump: command not found"

**Solution**: Install PostgreSQL client tools (see Prerequisites)

### "Connection refused" to local database

**Solutions**:

- Check if PostgreSQL is running: `pg_isready -h localhost -p 5432`
- Verify your local DATABASE_URL is correct
- Check firewall settings

### "Connection timeout" to Render database

**Solutions**:

- Verify you're using the EXTERNAL URL (not INTERNAL)
- Check your internet connection
- Verify database is running in Render dashboard
- Check if your IP is allowed (Render allows all IPs by default)

### "permission denied" or "must be owner"

**Solutions**:

- Script uses `--no-owner` flag to avoid this
- If it persists, ensure Render database user has sufficient privileges

### "relation already exists" errors

**Solutions**:

- This is normal in Merge mode
- Use Clean mode if you want a fresh start
- Or manually drop conflicting objects first

### SSL/TLS connection errors

**Solutions**:

- Render requires SSL; ensure your URL includes `?sslmode=require`
- Update PostgreSQL client tools to latest version

## Post-Migration Steps

After successful migration:

1. **Verify Data**

   ```bash
   # Connect to Render database
   psql "postgresql://user:password@host.render.com:5432/dbname"

   # Check tables
   \dt

   # Check row counts
   SELECT schemaname, tablename,
          n_tup_ins as "rows"
   FROM pg_stat_user_tables;
   ```

2. **Run Migrations** (if using Alembic)

   ```bash
   # Update to latest schema version
   export DATABASE_URL="$RENDER_DATABASE_URL"
   alembic upgrade head
   ```

3. **Update Application Config**

   - Update your app's DATABASE_URL to point to Render
   - For Render deployments, use the INTERNAL URL in environment variables
   - For local development, use the EXTERNAL URL

4. **Test Application**
   - Start your application
   - Test critical endpoints
   - Verify data integrity

## Alternative: Manual Migration

If the script doesn't work, you can migrate manually:

```bash
# 1. Dump local database
pg_dump -h localhost -p 5432 -U your_user -d your_db -F c -f dump.backup

# 2. Restore to Render
pg_restore -h dpg-xxxxx.render.com -p 5432 -U render_user -d render_db \
           --no-owner --no-acl -v dump.backup

# 3. Or use SQL format
pg_dump -h localhost -p 5432 -U your_user -d your_db -f dump.sql
psql -h dpg-xxxxx.render.com -p 5432 -U render_user -d render_db -f dump.sql
```

## Security Notes

- ⚠️ Never commit database credentials to version control
- ⚠️ Use environment variables or .env files (gitignored)
- ⚠️ The EXTERNAL Render URL should only be used from your local machine
- ⚠️ In production, use INTERNAL Render URLs for app-to-database connections
- ⚠️ Consider using connection pooling (Render provides this built-in)

## Performance Tips

- **Large databases**: Migration may take time; be patient
- **Network speed**: Upload speed affects Render restore time
- **Custom format**: Uses compression, faster than SQL format
- **Parallel restore**: Not used by default; can be added with `-j` flag if needed

## Support

If you encounter issues:

1. Check the error messages carefully
2. Verify all connection strings
3. Test connections independently
4. Check Render service logs
5. Review PostgreSQL client tool versions

## Files Created

- `scripts/migrate_local_to_render.py` - Main migration script
- `scripts/migrate_to_render.sh` - Bash wrapper (Linux/macOS)
- `scripts/migrate_to_render.bat` - Batch wrapper (Windows)
- `scripts/MIGRATION_GUIDE.md` - This documentation
