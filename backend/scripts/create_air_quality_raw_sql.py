#!/usr/bin/env python3

from sqlalchemy import create_engine, text
from app.core.config import settings

def create_air_quality_schema_and_tables():
    # Use sync URL
    db_url = settings.DATABASE_URL.replace('+asyncpg', '')
    engine = create_engine(db_url, future=True)
    
    print(f"Connecting to database: {db_url.replace('admin', '***')}")
    
    with engine.begin() as conn:
        # Create schema
        print("Creating air_quality schema...")
        conn.execute(text('CREATE SCHEMA IF NOT EXISTS air_quality'))
        
        # Create uuid extension if not exists
        print("Creating uuid extension...")
        conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public'))
        
        # Create tables using the exact SQL from the migration
        print("Creating air_quality.drivers table...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS air_quality.drivers (
                id UUID DEFAULT uuid_generate_v4() NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                middle_name VARCHAR(100),
                last_name VARCHAR(100) NOT NULL,
                address VARCHAR NOT NULL,
                license_number VARCHAR(50) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                PRIMARY KEY (id),
                UNIQUE (license_number)
            )
        """))
        
        print("Creating air_quality.records table...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS air_quality.records (
                id SERIAL NOT NULL,
                plate_number VARCHAR(32) NOT NULL,
                vehicle_type VARCHAR(64) NOT NULL,
                transport_group VARCHAR(100),
                operator_company_name VARCHAR(200) NOT NULL,
                operator_address VARCHAR,
                owner_first_name VARCHAR(100),
                owner_middle_name VARCHAR(100),
                owner_last_name VARCHAR(100),
                motor_no VARCHAR(100),
                motor_vehicle_name VARCHAR(200),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                PRIMARY KEY (id)
            )
        """))
        
        print("Creating air_quality.violations table...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS air_quality.violations (
                id SERIAL NOT NULL,
                record_id INTEGER NOT NULL,
                ordinance_infraction_report_no VARCHAR(100),
                smoke_density_test_result_no VARCHAR(100),
                place_of_apprehension VARCHAR(200) NOT NULL,
                date_of_apprehension DATE NOT NULL,
                paid_driver BOOLEAN DEFAULT false,
                paid_operator BOOLEAN DEFAULT false,
                driver_id UUID,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                PRIMARY KEY (id),
                FOREIGN KEY(driver_id) REFERENCES air_quality.drivers (id),
                FOREIGN KEY(record_id) REFERENCES air_quality.records (id) ON DELETE CASCADE
            )
        """))
        
        print("Creating air_quality.fees table...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS air_quality.fees (
                id SERIAL NOT NULL,
                amount NUMERIC(10,2) NOT NULL,
                category VARCHAR(100) NOT NULL,
                level INTEGER DEFAULT 1,
                effective_date DATE DEFAULT CURRENT_DATE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                PRIMARY KEY (id)
            )
        """))
        
        print("Creating air_quality.record_history table...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS air_quality.record_history (
                id SERIAL NOT NULL,
                record_id INTEGER NOT NULL,
                type VARCHAR(64) NOT NULL,
                date DATE NOT NULL,
                details VARCHAR,
                or_number VARCHAR(64),
                status VARCHAR(32) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                PRIMARY KEY (id),
                FOREIGN KEY(record_id) REFERENCES air_quality.records (id) ON DELETE CASCADE
            )
        """))
        
        # Create indexes
        print("Creating indexes...")
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_air_quality_drivers_license ON air_quality.drivers (license_number)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_air_quality_drivers_name ON air_quality.drivers (last_name, first_name)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_air_quality_records_operator ON air_quality.records (operator_company_name)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_air_quality_records_plate ON air_quality.records (plate_number)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_air_quality_violations_date ON air_quality.violations (date_of_apprehension)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_air_quality_violations_record ON air_quality.violations (record_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_air_quality_record_history_date ON air_quality.record_history (date)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_air_quality_record_history_record ON air_quality.record_history (record_id)"))
        
        print("All tables and indexes created successfully!")
        
        # Verify tables were created
        print("\nVerifying tables...")
        result = conn.execute(text("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'air_quality'
            ORDER BY table_name
        """))
        tables = [r[0] for r in result.fetchall()]
        print(f"Tables in air_quality schema: {tables}")
        
        if 'records' in tables:
            count_res = conn.execute(text('SELECT count(*) FROM air_quality.records'))
            print(f"Records table has {count_res.scalar()} rows")

if __name__ == '__main__':
    create_air_quality_schema_and_tables()
