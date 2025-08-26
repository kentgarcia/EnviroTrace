#!/usr/bin/env python3

import asyncio
from app.db.database import engine
from sqlalchemy import text

async def test_database():
    async with engine.connect() as conn:
        # Ensure schema exists
        await conn.execute(text('CREATE SCHEMA IF NOT EXISTS air_quality'))
        # Check tables
        result = await conn.execute(text("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'air_quality'
            ORDER BY table_name
        """))
        tables = [r[0] for r in result.fetchall()]
        print('air_quality tables:', tables)

        # Try a simple count on records if exists
        if 'records' in tables:
            count_res = await conn.execute(text('SELECT count(*) FROM air_quality.records'))
            print('records count:', count_res.scalar())

if __name__ == "__main__":
    asyncio.run(test_database())
