#!/usr/bin/env python3
"""
Script to run the Tree Management Requests SQL migration
"""

import psycopg2
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

from app.core.config import settings

def run_migration():
    """Run the tree management requests migration"""
    
    # Read the SQL file
    sql_file_path = Path(__file__).parent / "urban_greening_tree_management_requests.sql"
    
    if not sql_file_path.exists():
        print(f"Error: SQL file not found at {sql_file_path}")
        return False
    
    with open(sql_file_path, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    try:
        # Connect to the database using DATABASE_URL
        print("Connecting to the database...")
        database_url = settings.DATABASE_URL.replace('+asyncpg', '')  # Remove async driver
        connection = psycopg2.connect(database_url)
        
        cursor = connection.cursor()
        
        # Execute the SQL script
        print("Executing tree management requests migration...")
        cursor.execute(sql_content)
        
        # Commit the transaction
        connection.commit()
        print("✅ Migration completed successfully!")
        
        # Get row count
        cursor.execute("SELECT COUNT(*) FROM urban_greening.tree_management_requests;")
        count = cursor.fetchone()[0]
        print(f"✅ {count} tree management requests created")
        
        cursor.close()
        connection.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Error running migration: {e}")
        if 'connection' in locals():
            connection.rollback()
            connection.close()
        return False

if __name__ == "__main__":
    success = run_migration()
    if not success:
        sys.exit(1)
