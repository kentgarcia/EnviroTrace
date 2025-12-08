import asyncio
import os
import sys
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add the backend directory to the python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.core.config import settings

async def run_seed():
    print("Connecting to database...")
    # Ensure we are using the async driver
    db_url = str(settings.SQLALCHEMY_DATABASE_URI)
    if not db_url.startswith("postgresql+asyncpg://"):
        # Fallback if the config doesn't have the async driver set
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
    
    engine = create_async_engine(db_url)

    sql_file_path = os.path.join(os.path.dirname(__file__), 'create_test_accounts.sql')
    
    print(f"Reading SQL from {sql_file_path}...")
    with open(sql_file_path, 'r') as f:
        sql_content = f.read()

    print("Executing SQL...")
    async with engine.begin() as conn:
        # Split by semicolon is risky if semicolons are in strings, but the file structure 
        # uses DO $$ ... $$; blocks which are safe to execute as a whole if we don't split them incorrectly.
        # However, SQLAlchemy's execute can handle the whole block if it's valid SQL.
        # The file contains multiple DO blocks separated by semicolons.
        # Let's try executing the whole thing. If that fails, we might need to split.
        # Actually, executing multiple statements in one go might not be supported by all drivers/modes.
        # But DO blocks are distinct.
        
        # A safer approach for this specific file structure (DO blocks) is to execute it as one script
        # or split by the specific delimiter used in the file if possible.
        # The file uses `END $$;` as a terminator.
        
        # Let's try to execute the whole script first.
        try:
            await conn.execute(text(sql_content))
            print("SQL executed successfully.")
        except Exception as e:
            print(f"Error executing SQL as one block: {e}")
            print("Attempting to split by 'END $$;'...")
            
            # Naive splitting for this specific file format
            blocks = sql_content.split('END $$;')
            for block in blocks:
                if block.strip():
                    # Re-add the terminator for valid syntax if needed, 
                    # but DO blocks usually end with END $$;
                    # The split removes it, so we add it back.
                    stmt = block + 'END $$;'
                    # Clean up any leading/trailing whitespace/comments
                    if 'DO $$' in stmt:
                        print("Executing block...")
                        await conn.execute(text(stmt))
    
    await engine.dispose()
    print("Done.")

if __name__ == "__main__":
    # Fix for Windows asyncio loop policy
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        
    asyncio.run(run_seed())
