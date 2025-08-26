#!/usr/bin/env python3

import sys
import os

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app.db.database import SessionLocal
from sqlalchemy import text

def create_order_of_payments_table():
    db = SessionLocal()
    try:
        # Create the table with all required fields
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS air_quality.order_of_payments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            oop_control_number VARCHAR(6) UNIQUE NOT NULL,
            plate_number VARCHAR(32) NOT NULL,
            operator_name VARCHAR(200) NOT NULL,
            driver_name VARCHAR(200),
            selected_violations TEXT NOT NULL,
            testing_officer VARCHAR(200),
            test_results TEXT,
            date_of_testing DATE,
            apprehension_fee NUMERIC(10, 2) DEFAULT 0,
            voluntary_fee NUMERIC(10, 2) DEFAULT 0,
            impound_fee NUMERIC(10, 2) DEFAULT 0,
            driver_amount NUMERIC(10, 2) DEFAULT 0,
            operator_fee NUMERIC(10, 2) DEFAULT 0,
            total_undisclosed_amount NUMERIC(10, 2) NOT NULL,
            grand_total_amount NUMERIC(10, 2) NOT NULL,
            payment_or_number VARCHAR(64),
            date_of_payment DATE NOT NULL,
            status VARCHAR(32) DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """
        
        # Create indexes
        create_indexes_sql = [
            "CREATE INDEX IF NOT EXISTS idx_air_quality_oop_control_number ON air_quality.order_of_payments (oop_control_number);",
            "CREATE INDEX IF NOT EXISTS idx_air_quality_oop_plate ON air_quality.order_of_payments (plate_number);",
            "CREATE INDEX IF NOT EXISTS idx_air_quality_oop_date ON air_quality.order_of_payments (date_of_payment);"
        ]
        
        print("Creating order_of_payments table...")
        db.execute(text(create_table_sql))
        
        print("Creating indexes...")
        for index_sql in create_indexes_sql:
            db.execute(text(index_sql))
        
        db.commit()
        print("Table and indexes created successfully!")
        
        # Verify table creation
        result = db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'air_quality' AND table_name = 'order_of_payments';"))
        if result.fetchone():
            print("✓ Table verification successful")
        else:
            print("✗ Table verification failed")
            
    except Exception as e:
        print(f"Error creating table: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_order_of_payments_table()
