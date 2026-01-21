"""
Test database connection using credentials from .env file
"""
import sys
import os
from pathlib import Path

# Add the parent directory to sys.path
script_dir = Path(__file__).resolve().parent
project_root = script_dir.parent
sys.path.insert(0, str(project_root))

import asyncio
from app.db.database import engine
from sqlalchemy import text

async def test_connection():
    """Test the database connection"""
    print("=" * 70)
    print("TESTING SUPABASE DATABASE CONNECTION")
    print("=" * 70)
    print()
    
    try:
        async with engine.connect() as conn:
            print("✅ Connection successful!")
            print()
            
            # Test 1: Check PostgreSQL version
            print("Test 1: PostgreSQL Version")
            print("-" * 70)
            result = await conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"Version: {version}")
            print()
            
            # Test 2: List schemas
            print("Test 2: Available Schemas")
            print("-" * 70)
            result = await conn.execute(text("""
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name IN ('emission', 'urban_greening', 'app_auth')
                ORDER BY schema_name
            """))
            schemas = result.fetchall()
            for schema in schemas:
                print(f"  - {schema[0]}")
            print()
            
            # Test 3: Count tables per schema
            print("Test 3: Tables per Schema")
            print("-" * 70)
            result = await conn.execute(text("""
                SELECT 
                    schemaname,
                    COUNT(*) as table_count
                FROM pg_tables 
                WHERE schemaname IN ('emission', 'urban_greening', 'app_auth')
                GROUP BY schemaname
                ORDER BY schemaname
            """))
            tables = result.fetchall()
            total_tables = 0
            for schema, count in tables:
                print(f"  {schema}: {count} tables")
                total_tables += count
            print(f"\n  Total: {total_tables} tables")
            print()
            
            # Test 4: Check users table
            print("Test 4: Users Table")
            print("-" * 70)
            result = await conn.execute(text("SELECT COUNT(*) FROM app_auth.users"))
            user_count = result.scalar()
            print(f"  Total users: {user_count}")
            
            if user_count > 0:
                result = await conn.execute(text("""
                    SELECT email, is_super_admin, created_at 
                    FROM app_auth.users 
                    ORDER BY created_at 
                    LIMIT 5
                """))
                users = result.fetchall()
                print("\n  Recent users:")
                for email, is_super, created in users:
                    admin_badge = " [SUPER ADMIN]" if is_super else ""
                    print(f"    - {email}{admin_badge}")
            print()
            
            # Test 5: Check database size
            print("Test 5: Database Information")
            print("-" * 70)
            result = await conn.execute(text("""
                SELECT 
                    current_database() as database_name,
                    current_user as connected_as,
                    inet_server_addr() as server_ip,
                    inet_server_port() as server_port
            """))
            db_info = result.fetchone()
            print(f"  Database: {db_info[0]}")
            print(f"  Connected as: {db_info[1]}")
            print(f"  Server IP: {db_info[2]}")
            print(f"  Server Port: {db_info[3]}")
            print()
            
            print("=" * 70)
            print("✅ ALL TESTS PASSED - DATABASE CONNECTION WORKING!")
            print("=" * 70)
            
    except Exception as e:
        print("❌ Connection failed!")
        print()
        print(f"Error: {str(e)}")
        print()
        print("Troubleshooting:")
        print("1. Check DATABASE_URL in .env file")
        print("2. Verify Supabase project is active")
        print("3. Check network connectivity")
        print("4. Verify password is correct")
        print()
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        await engine.dispose()
    
    return True

if __name__ == "__main__":
    success = asyncio.run(test_connection())
    sys.exit(0 if success else 1)
