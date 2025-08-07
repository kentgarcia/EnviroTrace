#!/usr/bin/env python3

import asyncio
from app.db.database import engine
from sqlalchemy import text

async def test_database():
    async with engine.connect() as conn:
        result = await conn.execute(text('SELECT * FROM urban_greening.tree_management_requests LIMIT 1'))
        print('Database query successful!')
        columns = result.keys()
        print('Columns:', [col for col in columns] if columns else 'No columns')
        rows = result.fetchall()
        print(f'Rows found: {len(rows)}')

if __name__ == "__main__":
    asyncio.run(test_database())
