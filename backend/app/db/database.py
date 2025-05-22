from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    # echo=True, # Enable for SQL logging during development
    future=True # Enables 2.0 style execution for aio an dsync engines
)

# Async session
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False, future=True
)

Base = declarative_base()

# Dependency for getting an async DB session
async def get_db_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
