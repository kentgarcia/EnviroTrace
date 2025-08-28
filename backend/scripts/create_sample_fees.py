#!/usr/bin/env python3
"""
Create sample air quality fees for testing
"""
import asyncio
import sys
import os

# Add the parent directory to the path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_async_session
from app.models.air_quality_models import AirQualityFee
from app.core.database import get_database

async def create_sample_fees():
    """Create sample fees for air quality violations"""
    
    # Get database session
    database = get_database()
    async with database.get_async_session() as db:
        try:
            # Check if fees already exist
            existing_fees = await db.execute(
                "SELECT COUNT(*) FROM air_quality.fees"
            )
            count = existing_fees.scalar()
            
            if count > 0:
                print(f"Found {count} existing fees in the database")
                return
            
            print("Creating sample air quality fees...")
            
            # Sample fees for different categories and levels
            sample_fees = [
                # Driver penalties by offense level
                {"category": "driver", "level": 1, "amount": 500.00, "description": "Driver - First Offense"},
                {"category": "driver", "level": 2, "amount": 1000.00, "description": "Driver - Second Offense"},
                {"category": "driver", "level": 3, "amount": 2000.00, "description": "Driver - Third Offense"},
                
                # Operator penalties by offense level
                {"category": "operator", "level": 1, "amount": 1000.00, "description": "Operator - First Offense"},
                {"category": "operator", "level": 2, "amount": 2000.00, "description": "Operator - Second Offense"},
                {"category": "operator", "level": 3, "amount": 5000.00, "description": "Operator - Third Offense"},
                
                # Fixed fees
                {"category": "apprehension", "level": 0, "amount": 200.00, "description": "Apprehension Fee"},
                {"category": "voluntary", "level": 0, "amount": 150.00, "description": "Voluntary Fee"},
                {"category": "impound", "level": 0, "amount": 300.00, "description": "Impound Fee"},
                {"category": "testing", "level": 0, "amount": 100.00, "description": "Testing Fee"},
            ]
            
            # Insert fees into database
            for fee_data in sample_fees:
                # Use raw SQL since we don't have SQLAlchemy models set up
                await db.execute(
                    """
                    INSERT INTO air_quality.fees (category, level, amount, description, effective_date, created_at)
                    VALUES (:category, :level, :amount, :description, NOW(), NOW())
                    """,
                    fee_data
                )
            
            await db.commit()
            print(f"Successfully created {len(sample_fees)} sample fees")
            
            # Verify creation
            result = await db.execute("SELECT category, level, amount, description FROM air_quality.fees ORDER BY category, level")
            fees = result.fetchall()
            
            print("\nCreated fees:")
            for fee in fees:
                print(f"  {fee[0]} (Level {fee[1]}): ₱{fee[2]:,.2f} - {fee[3]}")
                
        except Exception as e:
            print(f"Error creating sample fees: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(create_sample_fees())
