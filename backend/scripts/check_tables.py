#!/usr/bin/env python3

import sys
import os

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app.db.database import SessionLocal
from sqlalchemy import text

def check_tables():
    db = SessionLocal()
    try:
        # Check if air_quality schema exists
        result = db.execute(text("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'air_quality';"))
        schemas = result.fetchall()
        print('Air quality schema exists:', len(schemas) > 0)
        
        # Check if order_of_payments table exists
        result = db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'air_quality' AND table_name = 'order_of_payments';"))
        tables = result.fetchall()
        print('Order of payments table exists:', len(tables) > 0)
        
        # List all tables in air_quality schema
        result = db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'air_quality';"))
        all_tables = result.fetchall()
        print('All air_quality tables:', [t[0] for t in all_tables])
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_tables()
