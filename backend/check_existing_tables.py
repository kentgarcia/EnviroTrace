#!/usr/bin/env python3

import psycopg2
from app.core.config import settings

def check_existing_tables():
    try:
        # Parse DATABASE_URL to get connection string for psycopg2
        database_url = settings.DATABASE_URL
        # Replace asyncpg with psycopg2 if needed
        if "postgresql+asyncpg://" in database_url:
            database_url = database_url.replace("postgresql+asyncpg://", "postgresql://")
        
        connection = psycopg2.connect(database_url)
        
        cursor = connection.cursor()
        
        # Check if urban_greening schema exists
        cursor.execute("""
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name = 'urban_greening'
        """)
        
        schema_exists = cursor.fetchone()
        print(f"Urban_greening schema exists: {schema_exists is not None}")
        
        if schema_exists:
            # Get all tables in urban_greening schema
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'urban_greening'
                ORDER BY table_name
            """)
            
            tables = cursor.fetchall()
            print("\nExisting tables in urban_greening schema:")
            for table in tables:
                print(f"  - {table[0]}")
                
            # Check specifically for tree_management_requests table and its columns
            cursor.execute("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_schema = 'urban_greening' 
                AND table_name = 'tree_management_requests'
                ORDER BY ordinal_position
            """)
            
            columns = cursor.fetchall()
            if columns:
                print("\nColumns in tree_management_requests table:")
                for column in columns:
                    print(f"  - {column[0]} ({column[1]}) - Nullable: {column[2]}")
            else:
                print("\nTree_management_requests table does not exist yet.")
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_existing_tables()
