from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from app.core.config import settings

from sqlalchemy import create_engine
from typing import AsyncGenerator


def _to_sync_psycopg(url: str) -> str:
    """Convert an app DATABASE_URL to a sync psycopg driver URL for SQLAlchemy/Alembic.
    - postgresql+asyncpg:// -> postgresql+psycopg://
    - postgresql+psycopg:// stays
    - postgresql:// -> postgresql+psycopg://
    """
    if "+asyncpg" in url:
        return url.replace("+asyncpg", "+psycopg")
    if "+psycopg" in url:
        return url
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


# Sync engine for Alembic and sync endpoints
sync_engine = create_engine(
    _to_sync_psycopg(settings.DATABASE_URL),
    future=True,
    pool_size=10,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600,
)

def _to_async_asyncpg(url: str) -> str:
    # Normalize scheme alias
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    # If already asyncpg, keep it
    if "+asyncpg" in url:
        return url
    # Convert psycopg or plain to asyncpg
    if "+psycopg" in url:
        return url.replace("+psycopg", "+asyncpg")
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url

engine = create_async_engine(
    _to_async_asyncpg(settings.DATABASE_URL),
    future=True,
    pool_pre_ping=True,
    pool_recycle=1800,
    pool_size=5,
    max_overflow=0,
    connect_args={
        "statement_cache_size": 0,
    },
)


AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False, future=True
)

SessionLocal = sessionmaker(
    sync_engine, class_=Session, expire_on_commit=False, future=True
)

Base = declarative_base()

# Dependency for getting an async DB session
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

# Dependency for getting a sync DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
