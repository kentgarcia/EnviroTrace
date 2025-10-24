"""
Migrate Local PostgreSQL Database to Render PostgreSQL using SQLAlchemy

This script migrates data from your local PostgreSQL database to Render PostgreSQL
using pure Python and SQLAlchemy - no pg_dump/psql required!

Prerequisites:
- Python 3.8+
- SQLAlchemy and psycopg installed (from requirements.txt)

Usage:
    python scripts/migrate_local_to_render_sqlalchemy.py

Environment Variables Required:
    LOCAL_DATABASE_URL: Local PostgreSQL connection string
    RENDER_DATABASE_URL: Render PostgreSQL connection string (EXTERNAL URL)
"""

import os
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, MetaData, Table, inspect, text
from sqlalchemy.orm import sessionmaker
from urllib.parse import urlparse
import time
from typing import Dict, List


def normalize_url(url: str) -> str:
    """Normalize PostgreSQL URL to sync psycopg format."""
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    
    # Remove async driver suffixes
    url = url.replace("+asyncpg", "").replace("+psycopg", "")
    
    # Ensure we use psycopg (sync driver)
    if "postgresql://" in url and "+psycopg" not in url:
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    
    return url


def parse_database_url(url: str) -> dict:
    """Parse PostgreSQL connection string into components."""
    url = normalize_url(url)
    parsed = urlparse(url)
    
    return {
        "host": parsed.hostname,
        "port": parsed.port or 5432,
        "database": parsed.path.lstrip("/").split("?")[0],
        "user": parsed.username,
        "password": parsed.password,
        "url": url,
    }


def test_connection(engine, label: str) -> bool:
    """Test database connection."""
    print(f"\nTesting {label} connection...")
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        print(f"✓ Successfully connected to {label}")
        return True
    except Exception as e:
        print(f"✗ Failed to connect to {label}")
        print(f"Error: {e}")
        return False


def get_table_names(engine) -> List[str]:
    """Get all table names from database."""
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    # Get tables from all schemas if needed
    schemas = inspector.get_schema_names()
    all_tables = []
    
    for schema in schemas:
        if schema not in ['information_schema', 'pg_catalog']:
            schema_tables = inspector.get_table_names(schema=schema)
            for table in schema_tables:
                if schema != 'public':
                    all_tables.append(f"{schema}.{table}")
                else:
                    all_tables.append(table)
    
    # Use public schema tables as fallback
    if not all_tables:
        all_tables = tables
    
    return all_tables


def get_table_dependencies(engine) -> Dict[str, List[str]]:
    """Get table dependencies based on foreign keys."""
    inspector = inspect(engine)
    dependencies = {}
    
    tables = get_table_names(engine)
    
    for table_name in tables:
        schema = None
        table = table_name
        
        if '.' in table_name:
            schema, table = table_name.split('.', 1)
        
        fks = inspector.get_foreign_keys(table, schema=schema)
        deps = []
        
        for fk in fks:
            ref_table = fk.get('referred_table')
            ref_schema = fk.get('referred_schema', 'public')
            
            if ref_schema and ref_schema != 'public':
                deps.append(f"{ref_schema}.{ref_table}")
            else:
                deps.append(ref_table)
        
        dependencies[table_name] = deps
    
    return dependencies


def topological_sort(dependencies: Dict[str, List[str]]) -> List[str]:
    """Sort tables in order respecting foreign key dependencies."""
    # Simple topological sort
    sorted_tables = []
    visited = set()
    visiting = set()
    
    def visit(table):
        if table in visited:
            return
        if table in visiting:
            # Circular dependency - we'll handle this by disabling constraints
            return
        
        visiting.add(table)
        
        for dep in dependencies.get(table, []):
            if dep in dependencies:  # Only visit if it's in our table list
                visit(dep)
        
        visiting.remove(table)
        visited.add(table)
        sorted_tables.append(table)
    
    for table in dependencies.keys():
        visit(table)
    
    return sorted_tables


def get_row_count(engine, table_name: str) -> int:
    """Get row count for a table."""
    try:
        schema = None
        table = table_name
        
        if '.' in table_name:
            schema, table = table_name.split('.', 1)
            query = text(f'SELECT COUNT(*) FROM "{schema}"."{table}"')
        else:
            query = text(f'SELECT COUNT(*) FROM "{table}"')
        
        with engine.connect() as conn:
            result = conn.execute(query)
            count = result.fetchone()[0]
        return count
    except Exception as e:
        print(f"Warning: Could not get count for {table_name}: {e}")
        return 0


def copy_table_data(source_engine, dest_engine, table_name: str, batch_size: int = 1000):
    """Copy data from source table to destination table."""
    print(f"\n  Copying table: {table_name}")
    
    try:
        # Get row count
        row_count = get_row_count(source_engine, table_name)
        print(f"    Rows to copy: {row_count}")
        
        if row_count == 0:
            print(f"    ✓ Table {table_name} is empty, skipping")
            return True
        
        # Read from source
        metadata = MetaData()
        
        schema = None
        table = table_name
        if '.' in table_name:
            schema, table = table_name.split('.', 1)
        
        source_table = Table(table, metadata, autoload_with=source_engine, schema=schema)
        
        # Process in batches
        with source_engine.connect() as source_conn:
            offset = 0
            copied_rows = 0
            
            while offset < row_count:
                # Fetch batch from source
                select_stmt = source_table.select().offset(offset).limit(batch_size)
                batch = source_conn.execute(select_stmt).fetchall()
                
                if not batch:
                    break
                
                # Insert batch into destination
                with dest_engine.begin() as dest_conn:
                    # Convert rows to dicts
                    rows_to_insert = [dict(row._mapping) for row in batch]
                    dest_conn.execute(source_table.insert(), rows_to_insert)
                
                copied_rows += len(batch)
                offset += batch_size
                
                # Progress indicator
                progress = (copied_rows / row_count) * 100
                print(f"    Progress: {copied_rows}/{row_count} ({progress:.1f}%)", end='\r')
        
        print(f"\n    ✓ Copied {copied_rows} rows to {table_name}")
        return True
        
    except Exception as e:
        print(f"\n    ✗ Error copying {table_name}: {e}")
        return False


def migrate_database(source_url: str, dest_url: str, clean: bool = False):
    """Migrate entire database from source to destination."""
    print("\n" + "=" * 60)
    print("Starting Database Migration")
    print("=" * 60)
    
    # Normalize URLs
    source_url = normalize_url(source_url)
    dest_url = normalize_url(dest_url)
    
    # Create engines
    print("\nCreating database connections...")
    source_engine = create_engine(source_url, echo=False)
    dest_engine = create_engine(dest_url, echo=False)
    
    # Test connections
    if not test_connection(source_engine, "Source (Local)"):
        return False
    
    if not test_connection(dest_engine, "Destination (Render)"):
        return False
    
    # Get tables
    print("\nDiscovering tables...")
    tables = get_table_names(source_engine)
    print(f"Found {len(tables)} tables to migrate")
    
    if not tables:
        print("No tables found in source database!")
        return False
    
    # Show tables
    print("\nTables to migrate:")
    for table in tables:
        count = get_row_count(source_engine, table)
        print(f"  - {table} ({count} rows)")
    
    # Get dependencies
    print("\nAnalyzing table dependencies...")
    dependencies = get_table_dependencies(source_engine)
    sorted_tables = topological_sort(dependencies)
    
    # Clean destination if requested
    if clean:
        print("\n⚠️  Cleaning destination database...")
        # Truncate tables in reverse dependency order with CASCADE
        for table in reversed(sorted_tables):
            try:
                with dest_engine.begin() as conn:
                    schema = None
                    tbl = table
                    if '.' in table:
                        schema, tbl = table.split('.', 1)
                        conn.execute(text(f'TRUNCATE TABLE "{schema}"."{tbl}" CASCADE'))
                    else:
                        conn.execute(text(f'TRUNCATE TABLE "{tbl}" CASCADE'))
                    print(f"  ✓ Truncated {table}")
            except Exception as e:
                print(f"  ! Could not truncate {table}: {e}")
    
    # Copy data in dependency order (no need to disable FK checks)
    print("\n" + "=" * 60)
    print("Copying Data (in dependency order)")
    print("=" * 60)
    print("\nNote: Tables will be copied in order to respect foreign key constraints.")
    
    successful = 0
    failed = 0
    
    for table in sorted_tables:
        if copy_table_data(source_engine, dest_engine, table):
            successful += 1
        else:
            failed += 1
    
    # Update sequences
    print("\nUpdating sequences...")
    with dest_engine.begin() as conn:
        # Get all sequences
        seq_query = text("""
            SELECT sequence_schema, sequence_name 
            FROM information_schema.sequences 
            WHERE sequence_schema NOT IN ('pg_catalog', 'information_schema')
        """)
        sequences = conn.execute(seq_query).fetchall()
        
        for schema, seq_name in sequences:
            try:
                # Find table and column using this sequence
                table_query = text(f"""
                    SELECT table_name, column_name 
                    FROM information_schema.columns 
                    WHERE column_default LIKE '%{seq_name}%'
                    AND table_schema = :schema
                """)
                result = conn.execute(table_query, {"schema": schema}).fetchone()
                
                if result:
                    table_name, column_name = result
                    # Update sequence to max value
                    update_seq = text(f"""
                        SELECT setval('"{schema}"."{seq_name}"', 
                        (SELECT COALESCE(MAX("{column_name}"), 1) FROM "{schema}"."{table_name}"))
                    """)
                    conn.execute(update_seq)
                    print(f"  ✓ Updated sequence {schema}.{seq_name}")
            except Exception as e:
                print(f"  ! Could not update sequence {schema}.{seq_name}: {e}")
    
    # Summary
    print("\n" + "=" * 60)
    print("Migration Summary")
    print("=" * 60)
    print(f"✓ Successfully migrated: {successful} tables")
    if failed > 0:
        print(f"✗ Failed: {failed} tables")
    
    # Verify row counts
    print("\nVerifying migration...")
    all_verified = True
    for table in tables:
        source_count = get_row_count(source_engine, table)
        dest_count = get_row_count(dest_engine, table)
        
        if source_count == dest_count:
            print(f"  ✓ {table}: {dest_count} rows")
        else:
            print(f"  ✗ {table}: Expected {source_count}, got {dest_count}")
            all_verified = False
    
    # Cleanup
    source_engine.dispose()
    dest_engine.dispose()
    
    if all_verified:
        print("\n✓ All tables verified successfully!")
        return True
    else:
        print("\n⚠️  Some tables have row count mismatches. Please verify manually.")
        return False


def main():
    """Main migration process."""
    print("=" * 60)
    print("PostgreSQL Migration: Local → Render (SQLAlchemy)")
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
    
    print(f"\nSource: {local_db['user']}@{local_db['host']}:{local_db['port']}/{local_db['database']}")
    print(f"Destination: {render_db['user']}@{render_db['host']}:{render_db['port']}/{render_db['database']}")
    
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
    print("  2. Clean: Truncate all tables before migration")
    clean_response = input("\nChoose option (1/2): ").strip() or "1"
    clean = clean_response == "2"
    
    if clean:
        print("\n⚠️  WARNING: This will TRUNCATE all tables in Render database!")
        confirm = input("Type 'DELETE EVERYTHING' to confirm: ").strip()
        if confirm != "DELETE EVERYTHING":
            print("Migration cancelled.")
            return 0
    
    # Perform migration
    start_time = time.time()
    success = migrate_database(local_db['url'], render_db['url'], clean=clean)
    elapsed = time.time() - start_time
    
    if success:
        print("\n" + "=" * 60)
        print(f"✓ Migration completed successfully in {elapsed:.1f} seconds!")
        print("=" * 60)
        print("\nNext steps:")
        print("  1. Verify data in Render dashboard or psql")
        print("  2. Run migrations if needed: alembic upgrade head")
        print("  3. Test your application endpoints")
        print("  4. Update DATABASE_URL in production to use Render")
        return 0
    else:
        print("\n" + "=" * 60)
        print(f"⚠️  Migration completed with warnings in {elapsed:.1f} seconds")
        print("=" * 60)
        print("\nPlease verify the data manually.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
