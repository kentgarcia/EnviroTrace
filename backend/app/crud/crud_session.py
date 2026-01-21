# app/crud/crud_session.py
from typing import Optional, List
import uuid
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_, desc
from sqlalchemy.orm import selectinload

from app.crud.base_crud import CRUDBase
from app.models.auth_models import UserSession, User, Profile, DeviceTypeEnum
from app.schemas.session_schemas import SessionCreate, SessionUpdate
from app.core.security import create_access_token
from app.core.config import settings


class CRUDSession(CRUDBase[UserSession, SessionCreate, SessionUpdate]):
    async def create_session(
        self,
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        device_type: DeviceTypeEnum = DeviceTypeEnum.unknown,
        device_name: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> UserSession:
        """Create a new user session with token"""
        # Generate JWT token
        access_token = create_access_token(subject=user_id)
        
        # Calculate expiration
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        expires_at = datetime.utcnow() + expires_delta
        
        # Create session object
        db_session = UserSession(
            user_id=user_id,
            session_token=access_token,
            device_type=device_type,
            device_name=device_name,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=expires_at,
            is_active=True
        )
        
        db.add(db_session)
        await db.commit()
        await db.refresh(db_session)
        
        return db_session
    
    async def get_by_token(self, db: AsyncSession, *, token: str) -> Optional[UserSession]:
        """Get session by token"""
        result = await db.execute(
            select(UserSession).where(UserSession.session_token == token)
        )
        return result.scalars().first()
    
    async def get_active_session_by_token(self, db: AsyncSession, *, token: str) -> Optional[UserSession]:
        """Get active session by token"""
        result = await db.execute(
            select(UserSession).where(
                and_(
                    UserSession.session_token == token,
                    UserSession.is_active == True,
                    UserSession.expires_at > datetime.utcnow()
                )
            )
        )
        return result.scalars().first()
    
    async def get_user_sessions(
        self,
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        active_only: bool = False,
        device_type: Optional[DeviceTypeEnum] = None
    ) -> List[UserSession]:
        """Get all sessions for a user"""
        query = select(UserSession).where(UserSession.user_id == user_id)
        
        if active_only:
            query = query.where(
                and_(
                    UserSession.is_active == True,
                    UserSession.expires_at > datetime.utcnow()
                )
            )
        
        if device_type:
            query = query.where(UserSession.device_type == device_type)
        
        query = query.order_by(desc(UserSession.created_at))
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_all_sessions_with_users(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        device_type: Optional[DeviceTypeEnum] = None,
        is_active: Optional[bool] = None
    ) -> List[UserSession]:
        """Get all sessions with user information"""
        query = select(UserSession).options(
            selectinload(UserSession.user).selectinload(User.profile)
        )
        
        if device_type:
            query = query.where(UserSession.device_type == device_type)
        
        if is_active is not None:
            if is_active:
                query = query.where(
                    and_(
                        UserSession.is_active == True,
                        UserSession.expires_at > datetime.utcnow()
                    )
                )
            else:
                query = query.where(
                    or_(
                        UserSession.is_active == False,
                        UserSession.expires_at <= datetime.utcnow()
                    )
                )
        
        query = query.order_by(desc(UserSession.is_active), desc(UserSession.created_at)).offset(skip).limit(limit)
        
        result = await db.execute(query)
        sessions = result.scalars().all()
        
        return sessions
    
    async def terminate_session(
        self,
        db: AsyncSession,
        *,
        session_id: uuid.UUID,
        reason: str = "Session terminated"
    ) -> Optional[UserSession]:
        """Terminate a session"""
        session = await self.get(db, id=session_id)
        if not session:
            return None
        
        session.is_active = False
        session.ended_at = datetime.utcnow()
        session.termination_reason = reason
        
        await db.commit()
        await db.refresh(session)
        
        return session
    
    async def terminate_all_user_sessions(
        self,
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        reason: str = "All sessions terminated",
        exclude_session_id: Optional[uuid.UUID] = None
    ) -> int:
        """Terminate all active sessions for a user"""
        query = select(UserSession).where(
            and_(
                UserSession.user_id == user_id,
                UserSession.is_active == True
            )
        )
        
        if exclude_session_id:
            query = query.where(UserSession.id != exclude_session_id)
        
        result = await db.execute(query)
        sessions = result.scalars().all()
        
        count = 0
        for session in sessions:
            session.is_active = False
            session.ended_at = datetime.utcnow()
            session.termination_reason = reason
            count += 1
        
        await db.commit()
        return count
    
    async def update_activity(
        self,
        db: AsyncSession,
        *,
        session_id: uuid.UUID
    ) -> Optional[UserSession]:
        """Update last activity timestamp"""
        session = await self.get(db, id=session_id)
        if not session:
            return None
        
        session.last_activity_at = datetime.utcnow()
        await db.commit()
        await db.refresh(session)
        
        return session


session_crud = CRUDSession(UserSession)
