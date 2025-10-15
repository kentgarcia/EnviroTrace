"""
Simple script to create air quality schema
"""
from sqlalchemy import create_engine, text
from app.core.config import settings
from app.models.air_quality_models import *
from app.db.database import Base

def create_schema():
    """Create the air quality schema and tables"""
    # Use the sync engine
    def _to_sync_psycopg(url: str) -> str:
        if "+asyncpg" in url:
            return url.replace("+asyncpg", "+psycopg")
        if "+psycopg" in url:
            return url
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url
    engine = create_engine(_to_sync_psycopg(settings.DATABASE_URL))
    
    try:
        # Create schema first
        with engine.connect() as conn:
            conn.execute(text("CREATE SCHEMA IF NOT EXISTS air_quality"))
            conn.commit()
            print("✅ Created air_quality schema")
        
        # Create all tables
        Base.metadata.create_all(bind=engine, checkfirst=True)
        print("✅ Created all air quality tables")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        engine.dispose()

if __name__ == "__main__":
    create_schema()
