#!/usr/bin/env python3
from sqlalchemy import create_engine, text
from app.core.config import settings


def main():
    # Use sync URL
    db_url = settings.DATABASE_URL.replace('+asyncpg', '')
    engine = create_engine(db_url, future=True)
    with engine.connect() as conn:
        # List tables
        res = conn.execute(text("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'air_quality'
            ORDER BY table_name
        """))
        tables = [r[0] for r in res.fetchall()]
        print('air_quality tables:', tables)
        # Show alembic version
        ver = conn.execute(text("SELECT version_num FROM alembic_version"))
        print('alembic version:', [r[0] for r in ver.fetchall()])

if __name__ == '__main__':
    main()
