#!/usr/bin/env python3

from sqlalchemy import create_engine, text
from app.core.config import settings
from app.db.database import Base
from app.models.air_quality_models import (
    AirQualityFee, 
    AirQualityDriver, 
    AirQualityRecord, 
    AirQualityViolation, 
    AirQualityRecordHistory
)

def create_air_quality_tables():
    # Use sync URL
    def _to_sync_psycopg(url: str) -> str:
        if "+asyncpg" in url:
            return url.replace("+asyncpg", "+psycopg")
        if "+psycopg" in url:
            return url
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url
    db_url = _to_sync_psycopg(settings.DATABASE_URL)
    engine = create_engine(db_url, future=True)
    
    print(f"Connecting to database: {db_url}")
    
    with engine.connect() as conn:
        # Create schema
        print("Creating air_quality schema...")
        conn.execute(text('CREATE SCHEMA IF NOT EXISTS air_quality'))
        
        # Create uuid extension if not exists
        print("Creating uuid extension...")
        conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public'))
        
        conn.commit()
        print("Schema and extension created successfully")
    
    # Create all tables
    print("Creating air_quality tables...")
    
    # Filter to only create air_quality tables
    air_quality_tables = [table for table in Base.metadata.tables.values() 
                         if hasattr(table, 'schema') and table.schema == 'air_quality']
    
    if air_quality_tables:
        print(f"Found {len(air_quality_tables)} air_quality tables to create:")
        for table in air_quality_tables:
            print(f"  - {table.schema}.{table.name}")
        
        # Create the air_quality tables specifically
        for table in air_quality_tables:
            table.create(engine, checkfirst=True)
            print(f"Created table: {table.schema}.{table.name}")
    else:
        print("No air_quality tables found in metadata")
    
    # Verify tables were created
    print("\nVerifying tables...")
    with engine.connect() as conn:
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
    create_air_quality_tables()
