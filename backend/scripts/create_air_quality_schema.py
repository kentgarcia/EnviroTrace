#!/usr/bin/env python3
"""
Script to create the air_quality schema and tables directly using SQLAlchemy
"""
import sys
import os

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

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

def create_air_quality_schema():
    """Create the air_quality schema and tables"""
    try:
        # Create database engine
        def _to_sync_psycopg(url: str) -> str:
            if "+asyncpg" in url:
                return url.replace("+asyncpg", "+psycopg")
            if "+psycopg" in url:
                return url
            if url.startswith("postgresql://"):
                return url.replace("postgresql://", "postgresql+psycopg://", 1)
            return url
        engine = create_engine(_to_sync_psycopg(settings.DATABASE_URL))
        
        # Create the air_quality schema if it doesn't exist
        with engine.connect() as conn:
            conn.execute(text("CREATE SCHEMA IF NOT EXISTS air_quality;"))
            conn.commit()
            print("✅ Created air_quality schema")
        
        # Create all tables in the air_quality schema
        Base.metadata.create_all(
            bind=engine,
            tables=[
                AirQualityFee.__table__,
                AirQualityDriver.__table__,
                AirQualityRecord.__table__,
                AirQualityViolation.__table__,
                AirQualityRecordHistory.__table__
            ]
        )
        print("✅ Created all air_quality tables")
        
        # Verify tables were created
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'air_quality'
                ORDER BY table_name;
            """))
            tables = [row[0] for row in result]
            print(f"✅ Verified tables created: {', '.join(tables)}")
            
    except Exception as e:
        print(f"❌ Error creating air_quality schema: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Creating air_quality schema and tables...")
    success = create_air_quality_schema()
    if success:
        print("🎉 Air quality schema setup completed successfully!")
    else:
        print("💥 Failed to setup air quality schema")
        sys.exit(1)
