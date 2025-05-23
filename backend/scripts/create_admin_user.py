#!/usr/bin/env python3
# create_admin_user.py - Script to create an admin user for development
import asyncio
import uuid
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import ProgrammingError
import sys
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add the parent directory to sys.path to access app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.auth_models import User, UserRoleMapping, UserRoleEnum
from app.db.database import Base

async def create_admin_user():
    # Create async engine and session
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with engine.begin() as conn:        # Check if schemas exist, create if needed
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS auth;"))
        
        # Check if UUID extension exists, create if needed
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"))
        
        # Create profile table if it doesn't exist
        try:
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS auth.profiles (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
                    first_name VARCHAR(100),
                    last_name VARCHAR(100),
                    bio TEXT,
                    job_title VARCHAR(200),
                    department VARCHAR(200),
                    phone_number VARCHAR(50),
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
            """))
            logger.info("Ensured auth.profiles table exists")
        except Exception as e:
            logger.warning(f"Could not create profile table yet: {str(e)}")
        
        # Verify tables exist for auth models
        await conn.run_sync(Base.metadata.create_all)
    
    # Admin user details - change these as needed
    admin_email = "admin@ecodash.gov.ph"
    admin_password = "Admin@123"  # This is for development only!
    
    # Create admin user
    admin_id = uuid.uuid4()
    try:
        hashed_password = get_password_hash(admin_password)
        logger.info("Password hashed successfully")
    except Exception as e:
        logger.warning(f"Warning with password hashing: {str(e)}")
        # Fallback to a direct hash if necessary
        import bcrypt
        hashed_password = bcrypt.hashpw(admin_password.encode(), bcrypt.gensalt()).decode()
    
    async with async_session() as session:        # Check if admin user already exists
        query = text("SELECT id FROM auth.users WHERE email = :email")
        result = await session.execute(query, {"email": admin_email})
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            logger.info(f"Admin user with email {admin_email} already exists!")
            admin_id = existing_user
        else:
            # Create user
            query = text("""
                INSERT INTO auth.users 
                (id, email, encrypted_password, is_super_admin, created_at, updated_at)
                VALUES (:id, :email, :password, TRUE, NOW(), NOW())
                RETURNING id
            """)
            result = await session.execute(query, {
                "id": admin_id,
                "email": admin_email,
                "password": hashed_password
            })
            await session.commit()
            logger.info(f"Created admin user with email: {admin_email}")
          # Create profile for admin user
        try:
            query = text("""
                SELECT id FROM auth.profiles WHERE user_id = :user_id
            """)
            result = await session.execute(query, {"user_id": admin_id})
            existing_profile = result.scalar_one_or_none()
            
            if not existing_profile:
                query = text("""
                    INSERT INTO auth.profiles
                    (user_id, first_name, last_name, job_title, department, created_at, updated_at)
                    VALUES (:user_id, :first_name, :last_name, :job_title, :department, NOW(), NOW())
                    RETURNING id
                """)
                await session.execute(query, {
                    "user_id": admin_id,
                    "first_name": "Admin",
                    "last_name": "User",
                    "job_title": "System Administrator",
                    "department": "IT Department"
                })
                await session.commit()
                logger.info("Created admin profile")
        except Exception as e:
            logger.warning(f"Could not create profile: {str(e)}")
            # Continue anyway, profile can be added later
        
        # Assign all roles to admin
        for role in UserRoleEnum:
            try:
                query = text("""
                    SELECT id FROM auth.user_roles
                    WHERE user_id = :user_id AND role = :role
                """)
                result = await session.execute(query, {"user_id": admin_id, "role": role.value})
                existing_role = result.scalar_one_or_none()
                
                if not existing_role:
                    query = text("""
                        INSERT INTO auth.user_roles (user_id, role, created_at)
                        VALUES (:user_id, :role, NOW())
                    """)
                    await session.execute(query, {"user_id": admin_id, "role": role.value})
                    logger.info(f"Assigned role: {role.value}")
            except Exception as e:
                logger.warning(f"Could not assign role {role.value}: {str(e)}")
        
        await session.commit()
    
    logger.info("\nAdmin user setup complete!")
    logger.info(f"Email: {admin_email}")
    logger.info(f"Password: {admin_password}")
    logger.info("You can now login with these credentials.")

if __name__ == "__main__":
    asyncio.run(create_admin_user())
