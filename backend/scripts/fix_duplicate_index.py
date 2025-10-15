"""Fix duplicate index issue by dropping the conflicting index."""
import sys
from pathlib import Path

# Add the parent directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from app.core.config import settings

def main():
    """Drop the duplicate index."""
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Drop the duplicate index if it exists
        result = conn.execute(text(
            "DROP INDEX IF EXISTS urban_greening.idx_urban_greening_sapling_species;"
        ))
        conn.commit()
        print("✓ Duplicate index dropped successfully")
        
        # Check if alembic_version table exists and reset if needed
        try:
            result = conn.execute(text(
                "SELECT 1 FROM information_schema.tables WHERE table_name = 'alembic_version';"
            ))
            if result.fetchone():
                result = conn.execute(text(
                    "DELETE FROM alembic_version WHERE version_num = 'c36d6b2550c2';"
                ))
                conn.commit()
                print("✓ Alembic version reset successfully")
            else:
                print("ℹ Alembic version table doesn't exist yet (first migration)")
        except Exception as e:
            print(f"ℹ Could not reset alembic version: {e}")
        
        print("\nYou can now run: alembic upgrade head")

if __name__ == "__main__":
    main()
