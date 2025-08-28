#!/usr/bin/env python3

import asyncio
import sys
import os

# Add the backend directory to sys.path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import engine
from sqlalchemy import text

async def check_fees():
    async with engine.connect() as conn:
        # Check if fees table exists
        result = await conn.execute(text("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'air_quality' AND table_name = 'fees'
        """))
        table_exists = result.fetchone() is not None
        print(f'Fees table exists: {table_exists}')
        
        if table_exists:
            # Check current fees
            result = await conn.execute(text('SELECT * FROM air_quality.fees ORDER BY id'))
            fees = result.fetchall()
            print(f'Number of fees: {len(fees)}')
            
            if fees:
                print('\nExisting fees:')
                for fee in fees:
                    print(f'ID: {fee[0]}, Fee Type: {fee[1]}, Amount: {fee[2]}')
            else:
                print('\nNo fees found. Creating some test fees...')
                # Create some basic test fees
                await conn.execute(text("""
                    INSERT INTO air_quality.fees (fee_type, amount, description, created_at, updated_at)
                    VALUES 
                    ('SMOKE_BELCHING', 500.00, 'Smoke belching violation fee', NOW(), NOW()),
                    ('SMOKE_BELCHING_REPEAT', 1000.00, 'Repeat smoke belching violation fee', NOW(), NOW()),
                    ('IMPROPER_MAINTENANCE', 300.00, 'Improper vehicle maintenance fee', NOW(), NOW()),
                    ('EXPIRED_EMISSION_TEST', 200.00, 'Expired emission test certificate fee', NOW(), NOW()),
                    ('NO_EMISSION_TEST', 400.00, 'No emission test certificate fee', NOW(), NOW())
                """))
                await conn.commit()
                print('Test fees created successfully!')
        else:
            print('Fees table does not exist. Please run migrations first.')

if __name__ == "__main__":
    asyncio.run(check_fees())
