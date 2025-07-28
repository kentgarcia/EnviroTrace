from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from app.core.config import settings

from sqlalchemy import create_engine

# Sync engine for Alembic and sync endpoints
sync_engine = create_engine(
    settings.DATABASE_URL.replace('+asyncpg', ''),
    future=True
)

engine = create_async_engine(
    settings.DATABASE_URL,
    future=True
)

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False, future=True
)

SessionLocal = sessionmaker(
    sync_engine, class_=Session, expire_on_commit=False, future=True
)

Base = declarative_base()

# Dependency for getting an async DB session
async def get_db_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session

# Dependency for getting a sync DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
