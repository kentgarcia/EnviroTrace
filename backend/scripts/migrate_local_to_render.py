"""
Migrate Local PostgreSQL Database to Render PostgreSQL

This script migrates data from your local PostgreSQL database to Render PostgreSQL.
It uses pg_dump and pg_restore for efficient data transfer.

Prerequisites:
- pg_dump and psql must be installed and available in PATH
- Both local and Render databases must be accessible
- Render database credentials must be available

Usage:
    python scripts/migrate_local_to_render.py

Environment Variables Required:
    LOCAL_DATABASE_URL: Local PostgreSQL connection string
    RENDER_DATABASE_URL: Render PostgreSQL connection string (EXTERNAL URL)
"""

import os
import sys
import subprocess
import tempfile
from pathlib import Path
from urllib.parse import urlparse
import time


def parse_database_url(url: str) -> dict:
    """Parse PostgreSQL connection string into components."""
    # Handle postgres:// vs postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    
    # Remove driver suffixes if present
    url = url.replace("+asyncpg", "").replace("+psycopg", "")
    
    parsed = urlparse(url)
    
    return {
        "host": parsed.hostname,
        "port": parsed.port or 5432,
        "database": parsed.path.lstrip("/").split("?")[0],
        "user": parsed.username,
        "password": parsed.password,
        "query": parsed.query,
    }


def build_pg_connection_string(db_info: dict, include_password: bool = False) -> str:
    """Build PostgreSQL connection string for command-line tools."""
    password = f":{db_info['password']}" if include_password and db_info['password'] else ""
    query = f"?{db_info['query']}" if db_info.get('query') else ""
    
    return (
        f"postgresql://{db_info['user']}{password}@{db_info['host']}:"
        f"{db_info['port']}/{db_info['database']}{query}"
    )


def check_pg_tools():
    """Check if required PostgreSQL tools are available."""
    tools = ["pg_dump", "psql"]
    missing = []
    
    for tool in tools:
        try:
            subprocess.run(
                [tool, "--version"],
                capture_output=True,
                check=True
            )
            print(f"✓ {tool} is available")
        except (subprocess.CalledProcessError, FileNotFoundError):
            missing.append(tool)
            print(f"✗ {tool} is NOT available")
    
    if missing:
        print("\nError: Missing required tools:", ", ".join(missing))
        print("\nPlease install PostgreSQL client tools:")
        print("  Windows: Download from https://www.postgresql.org/download/windows/")
        print("  macOS: brew install postgresql")
        print("  Linux: sudo apt-get install postgresql-client")
        return False
    
    return True


def test_connection(db_info: dict, label: str) -> bool:
    """Test database connection."""
    print(f"\nTesting {label} connection...")
    
    env = os.environ.copy()
    env["PGPASSWORD"] = db_info["password"] or ""
    
    try:
        result = subprocess.run(
            [
                "psql",
                "-h", db_info["host"],
                "-p", str(db_info["port"]),
                "-U", db_info["user"],
                "-d", db_info["database"],
                "-c", "SELECT 1;",
            ],
            env=env,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            print(f"✓ Successfully connected to {label}")
            return True
        else:
            print(f"✗ Failed to connect to {label}")
            print(f"Error: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print(f"✗ Connection to {label} timed out")
        return False
    except Exception as e:
        print(f"✗ Error connecting to {label}: {e}")
        return False


def dump_database(db_info: dict, dump_file: str) -> bool:
    """Dump local database to file."""
    print(f"\nDumping local database to {dump_file}...")
    
    env = os.environ.copy()
    env["PGPASSWORD"] = db_info["password"] or ""
    
    try:
        # Use custom format for better compression and flexibility
        result = subprocess.run(
            [
                "pg_dump",
                "-h", db_info["host"],
                "-p", str(db_info["port"]),
                "-U", db_info["user"],
                "-d", db_info["database"],
                "-F", "c",  # Custom format
                "-f", dump_file,
                "--verbose",
            ],
            env=env,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            size_mb = Path(dump_file).stat().st_size / (1024 * 1024)
            print(f"✓ Database dumped successfully ({size_mb:.2f} MB)")
            return True
        else:
            print(f"✗ Failed to dump database")
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ Error dumping database: {e}")
        return False


def restore_database(db_info: dict, dump_file: str, clean: bool = False) -> bool:
    """Restore database from dump file."""
    print(f"\nRestoring database to Render PostgreSQL...")
    
    env = os.environ.copy()
    env["PGPASSWORD"] = db_info["password"] or ""
    
    try:
        args = [
            "pg_restore",
            "-h", db_info["host"],
            "-p", str(db_info["port"]),
            "-U", db_info["user"],
            "-d", db_info["database"],
            "--verbose",
            "--no-owner",  # Don't restore ownership
            "--no-acl",    # Don't restore access privileges
        ]
        
        if clean:
            args.append("--clean")  # Drop database objects before recreating
        
        args.append(dump_file)
        
        result = subprocess.run(
            args,
            env=env,
            capture_output=True,
            text=True
        )
        
        # pg_restore may return non-zero even on success if some objects already exist
        # Check stderr for actual errors
        if "ERROR" in result.stderr and "already exists" not in result.stderr:
            print(f"✗ Failed to restore database")
            print(f"Error: {result.stderr}")
            return False
        else:
            print(f"✓ Database restored successfully")
            if "WARNING" in result.stderr or "already exists" in result.stderr:
                print("\nWarnings/Info:")
                print(result.stderr)
            return True
    except Exception as e:
        print(f"✗ Error restoring database: {e}")
        return False


def migrate_using_sql(local_db: dict, render_db: dict) -> bool:
    """Alternative migration method using SQL dump (plain text)."""
    print("\nUsing SQL dump method (fallback)...")
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.sql', delete=False) as tmp:
        sql_file = tmp.name
    
    try:
        # Dump as plain SQL
        env = os.environ.copy()
        env["PGPASSWORD"] = local_db["password"] or ""
        
        print(f"Dumping database as SQL to {sql_file}...")
        result = subprocess.run(
            [
                "pg_dump",
                "-h", local_db["host"],
                "-p", str(local_db["port"]),
                "-U", local_db["user"],
                "-d", local_db["database"],
                "-f", sql_file,
                "--verbose",
                "--no-owner",
                "--no-acl",
            ],
            env=env,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"✗ Failed to dump SQL")
            print(result.stderr)
            return False
        
        size_mb = Path(sql_file).stat().st_size / (1024 * 1024)
        print(f"✓ SQL dump created ({size_mb:.2f} MB)")
        
        # Restore SQL
        env["PGPASSWORD"] = render_db["password"] or ""
        
        print("Restoring SQL to Render database...")
        result = subprocess.run(
            [
                "psql",
                "-h", render_db["host"],
                "-p", str(render_db["port"]),
                "-U", render_db["user"],
                "-d", render_db["database"],
                "-f", sql_file,
            ],
            env=env,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0 and "ERROR" in result.stderr:
            print(f"✗ Failed to restore SQL")
            print(result.stderr)
            return False
        
        print("✓ SQL restored successfully")
        return True
        
    finally:
        # Cleanup
        if os.path.exists(sql_file):
            os.unlink(sql_file)


def main():
    """Main migration process."""
    print("=" * 60)
    print("PostgreSQL Migration: Local → Render")
    print("=" * 60)
    
    # Get database URLs from environment
    local_url = os.getenv("LOCAL_DATABASE_URL")
    render_url = os.getenv("RENDER_DATABASE_URL")
    
    if not local_url:
        print("\nError: LOCAL_DATABASE_URL environment variable not set")
        print("\nExample:")
        print('  export LOCAL_DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"')
        return 1
    
    if not render_url:
        print("\nError: RENDER_DATABASE_URL environment variable not set")
        print("\nExample (use EXTERNAL URL from Render dashboard):")
        print('  export RENDER_DATABASE_URL="postgresql://user:pass@host.render.com:5432/dbname"')
        return 1
    
    # Parse database URLs
    local_db = parse_database_url(local_url)
    render_db = parse_database_url(render_url)
    
    print(f"\nLocal Database: {local_db['user']}@{local_db['host']}:{local_db['port']}/{local_db['database']}")
    print(f"Render Database: {render_db['user']}@{render_db['host']}:{render_db['port']}/{render_db['database']}")
    
    # Check required tools
    if not check_pg_tools():
        return 1
    
    # Test connections
    if not test_connection(local_db, "Local Database"):
        return 1
    
    if not test_connection(render_db, "Render Database"):
        return 1
    
    # Confirm migration
    print("\n" + "=" * 60)
    print("⚠️  WARNING: This will migrate data to Render PostgreSQL")
    print("=" * 60)
    response = input("\nDo you want to continue? (yes/no): ").strip().lower()
    
    if response != "yes":
        print("Migration cancelled.")
        return 0
    
    # Ask about cleaning existing data
    print("\nOptions:")
    print("  1. Merge: Add data to existing Render database (default)")
    print("  2. Clean: Drop and recreate all objects (destructive)")
    clean_response = input("\nChoose option (1/2): ").strip() or "1"
    clean = clean_response == "2"
    
    if clean:
        print("\n⚠️  WARNING: This will DROP all existing objects in Render database!")
        confirm = input("Type 'DELETE EVERYTHING' to confirm: ").strip()
        if confirm != "DELETE EVERYTHING":
            print("Migration cancelled.")
            return 0
    
    # Create temporary dump file
    with tempfile.NamedTemporaryFile(suffix='.dump', delete=False) as tmp:
        dump_file = tmp.name
    
    try:
        # Dump local database
        if not dump_database(local_db, dump_file):
            return 1
        
        # Restore to Render
        if not restore_database(render_db, dump_file, clean=clean):
            print("\nAttempting alternative SQL migration method...")
            if not migrate_using_sql(local_db, render_db):
                return 1
        
        print("\n" + "=" * 60)
        print("✓ Migration completed successfully!")
        print("=" * 60)
        print("\nNext steps:")
        print("  1. Verify data in Render dashboard")
        print("  2. Run migrations: alembic upgrade head")
        print("  3. Test your application endpoints")
        
        return 0
        
    finally:
        # Cleanup temporary file
        if os.path.exists(dump_file):
            os.unlink(dump_file)
            print(f"\nCleaned up temporary file: {dump_file}")


if __name__ == "__main__":
    sys.exit(main())
