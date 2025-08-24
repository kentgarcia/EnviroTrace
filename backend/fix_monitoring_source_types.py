#!/usr/bin/env python3
"""
Check and fix existing monitoring requests created from tree management
that may be missing the source_type field.
"""

import asyncio
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings


async def fix_monitoring_source_types():
    """Fix missing source_type in monitoring requests linked to tree management"""
    # Create async engine
    async_engine = create_async_engine(str(settings.DATABASE_URL))
    async_session = sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        print("Checking for monitoring requests linked to tree management without source_type...")
        
        # Find monitoring requests that are linked to tree management requests
        # but don't have source_type set to "tree_management"
        result = await session.execute(text("""
            SELECT mr.id, mr.title, mr.source_type, tmr.request_number, tmr.requester_name
            FROM urban_greening.monitoring_requests mr
            INNER JOIN urban_greening.tree_management_requests tmr 
                ON mr.id::text = tmr.monitoring_request_id
            WHERE mr.source_type != 'tree_management' OR mr.source_type IS NULL
        """))
        
        linked_requests = result.fetchall()
        
        if not linked_requests:
            print("No monitoring requests found that need source_type fixes")
        else:
            print(f"Found {len(linked_requests)} monitoring requests that need source_type updates:")
            for record in linked_requests:
                print(f"  Monitoring ID: {record.id}")
                print(f"    Title: {record.title}")
                print(f"    Current source_type: {record.source_type}")
                print(f"    Linked to Tree Request: {record.request_number} ({record.requester_name})")
        
        # Update the source_type for linked monitoring requests
        if linked_requests:
            print("\nUpdating source_type to 'tree_management'...")
            
            result = await session.execute(text("""
                UPDATE urban_greening.monitoring_requests 
                SET source_type = 'tree_management'
                WHERE id IN (
                    SELECT mr.id
                    FROM urban_greening.monitoring_requests mr
                    INNER JOIN urban_greening.tree_management_requests tmr 
                        ON mr.id::text = tmr.monitoring_request_id
                    WHERE mr.source_type != 'tree_management' OR mr.source_type IS NULL
                )
            """))
            
            await session.commit()
            
            print(f"Updated source_type for {result.rowcount} monitoring requests")
        
        # Verify the fix
        print("\nVerifying fix...")
        
        result = await session.execute(text("""
            SELECT COUNT(*) as count
            FROM urban_greening.monitoring_requests mr
            INNER JOIN urban_greening.tree_management_requests tmr 
                ON mr.id::text = tmr.monitoring_request_id
            WHERE mr.source_type != 'tree_management' OR mr.source_type IS NULL
        """))
        
        remaining_count = result.scalar()
        print(f"Remaining monitoring requests without proper source_type: {remaining_count}")
        
        # Show sample of fixed records
        result = await session.execute(text("""
            SELECT mr.id, mr.title, mr.source_type, tmr.request_number
            FROM urban_greening.monitoring_requests mr
            INNER JOIN urban_greening.tree_management_requests tmr 
                ON mr.id::text = tmr.monitoring_request_id
            LIMIT 3
        """))
        
        sample_records = result.fetchall()
        if sample_records:
            print("\nSample of linked monitoring requests:")
            for record in sample_records:
                print(f"  Monitoring ID: {record.id}")
                print(f"    Title: {record.title}")
                print(f"    Source Type: {record.source_type}")
                print(f"    Tree Request: {record.request_number}")

    await async_engine.dispose()
    print("\nMonitoring request source_type fix completed!")


if __name__ == "__main__":
    asyncio.run(fix_monitoring_source_types())
