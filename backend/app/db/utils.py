from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

async def create_extensions(session: AsyncSession):
    """
    Ensures necessary PostgreSQL extensions are created.
    This is an alternative to putting it in the first Alembic migration,
    or can be used as a fallback.
    """
    # Note: Creating extensions often requires superuser privileges.
    # It's generally better to handle this in your initial database setup
    # or the first Alembic migration if permissions allow.
    try:
        await session.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;'))
        await session.commit()
        print("uuid-ossp extension checked/created in public schema.")
    except Exception as e:
        print(f"Could not create uuid-ossp extension: {e}")
        await session.rollback()