#!/usr/bin/env python3
"""
Fix malformed JSON fields in tree_management_requests table.
Replace empty objects {} with empty arrays [] for JSON fields.
"""

import asyncio
import json
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings


async def fix_json_fields():
    """Fix malformed JSON fields in tree_management_requests"""
    # Create async engine
    async_engine = create_async_engine(str(settings.DATABASE_URL))
    async_session = sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # First, check what malformed data we have
        print("Checking for malformed JSON data...")
        
        result = await session.execute(text("""
            SELECT id, request_number, inspectors, trees_and_quantities, picture_links 
            FROM urban_greening.tree_management_requests
            WHERE inspectors = '{}' OR trees_and_quantities = '{}' OR picture_links = '{}'
        """))
        
        malformed_records = result.fetchall()
        
        if not malformed_records:
            print("No malformed records found with empty objects {}")
        else:
            print(f"Found {len(malformed_records)} records with malformed JSON:")
            for record in malformed_records:
                print(f"  ID: {record.id}, Request: {record.request_number}")
                print(f"    Inspectors: {record.inspectors}")
                print(f"    Trees/Quantities: {record.trees_and_quantities}")
                print(f"    Picture Links: {record.picture_links}")
        
        # Fix the malformed data
        print("\nFixing malformed JSON fields...")
        
        # Update inspectors field
        result1 = await session.execute(text("""
            UPDATE urban_greening.tree_management_requests 
            SET inspectors = '[]' 
            WHERE inspectors = '{}' OR inspectors IS NULL OR inspectors = ''
        """))
        
        # Update trees_and_quantities field
        result2 = await session.execute(text("""
            UPDATE urban_greening.tree_management_requests 
            SET trees_and_quantities = '[]' 
            WHERE trees_and_quantities = '{}' OR trees_and_quantities IS NULL OR trees_and_quantities = ''
        """))
        
        # Update picture_links field
        result3 = await session.execute(text("""
            UPDATE urban_greening.tree_management_requests 
            SET picture_links = '[]' 
            WHERE picture_links = '{}' OR picture_links IS NULL OR picture_links = ''
        """))
        
        await session.commit()
        
        print(f"Updated inspectors for {result1.rowcount} records")
        print(f"Updated trees_and_quantities for {result2.rowcount} records") 
        print(f"Updated picture_links for {result3.rowcount} records")
        
        # Verify the fix
        print("\nVerifying fix...")
        
        result = await session.execute(text("""
            SELECT COUNT(*) as count
            FROM urban_greening.tree_management_requests
            WHERE inspectors = '{}' OR trees_and_quantities = '{}' OR picture_links = '{}'
        """))
        
        remaining_count = result.scalar()
        print(f"Remaining malformed records: {remaining_count}")
        
        # Show sample of fixed records
        result = await session.execute(text("""
            SELECT id, request_number, inspectors, trees_and_quantities, picture_links 
            FROM urban_greening.tree_management_requests
            LIMIT 3
        """))
        
        sample_records = result.fetchall()
        print("\nSample of fixed records:")
        for record in sample_records:
            print(f"  ID: {record.id}, Request: {record.request_number}")
            print(f"    Inspectors: {record.inspectors}")
            print(f"    Trees/Quantities: {record.trees_and_quantities}")
            print(f"    Picture Links: {record.picture_links}")

    await async_engine.dispose()
    print("\nDatabase fix completed!")


if __name__ == "__main__":
    asyncio.run(fix_json_fields())
