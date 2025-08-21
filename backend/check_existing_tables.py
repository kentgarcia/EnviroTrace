#!/usr/bin/env python3

import asyncio
from sqlalchemy import text
from app.db.database import engine


async def check_existing_tables():
    try:
        async with engine.connect() as conn:
            # Check if urban_greening schema exists
            result = await conn.execute(text(
                """
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name = 'urban_greening'
                """
            ))
            schema_exists = result.fetchone()
            print(f"Urban_greening schema exists: {schema_exists is not None}")

            if schema_exists:
                # Get all tables in urban_greening schema
                result = await conn.execute(text(
                    """
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'urban_greening'
                    ORDER BY table_name
                    """
                ))
                tables = result.fetchall()
                print("\nExisting tables in urban_greening schema:")
                for table in tables:
                    print(f"  - {table[0]}")

                # Check specifically for tree_management_requests table and its columns
                result = await conn.execute(text(
                    """
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns 
                    WHERE table_schema = 'urban_greening' 
                    AND table_name = 'tree_management_requests'
                    ORDER BY ordinal_position
                    """
                ))
                columns = result.fetchall()
                if columns:
                    print("\nColumns in tree_management_requests table:")
                    for column in columns:
                        print(f"  - {column[0]} ({column[1]}) - Nullable: {column[2]}")
                else:
                    print("\nTree_management_requests table does not exist yet.")

            # Check if air_quality schema exists and list its tables
            result = await conn.execute(text(
                """
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name = 'air_quality'
                """
            ))
            aq_schema_exists = result.fetchone()
            print(f"\nAir_quality schema exists: {aq_schema_exists is not None}")
            if aq_schema_exists:
                result = await conn.execute(text(
                    """
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'air_quality'
                    ORDER BY table_name
                    """
                ))
                aq_tables = result.fetchall()
                print("\nExisting tables in air_quality schema:")
                for table in aq_tables:
                    print(f"  - {table[0]}")
                # Check for key tables
                for tbl in ['drivers', 'records', 'violations', 'record_history', 'fees']:
                    result = await conn.execute(text(
                        """
                        SELECT 1 FROM information_schema.tables 
                        WHERE table_schema = 'air_quality' AND table_name = :tbl
                        """
                    ), {"tbl": tbl})
                    exists = result.fetchone() is not None
                    print(f"    - {tbl}: {'present' if exists else 'missing'}")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    asyncio.run(check_existing_tables())
