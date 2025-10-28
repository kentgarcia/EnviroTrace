# app/schemas/session_schemas.py
import uuid
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.auth_models import DeviceTypeEnum

class SessionBase(BaseModel):
    device_type: DeviceTypeEnum = DeviceTypeEnum.unknown
    device_name: Optional[str] = None


class SessionCreate(SessionBase):
    user_id: uuid.UUID
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class SessionUpdate(BaseModel):
    is_active: Optional[bool] = None
    ended_at: Optional[datetime] = None
    termination_reason: Optional[str] = None


class SessionPublic(SessionBase):
    id: uuid.UUID
    user_id: uuid.UUID
    session_token: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    is_active: bool
    created_at: datetime
    last_activity_at: Optional[datetime] = None
    expires_at: datetime
    ended_at: Optional[datetime] = None
    termination_reason: Optional[str] = None
    
    class Config:
        from_attributes = True


class SessionWithUser(SessionPublic):
    user_email: Optional[str] = None
    user_profile: Optional[dict] = None
    
    class Config:
        from_attributes = True


class SessionTerminateRequest(BaseModel):
    session_id: uuid.UUID
    reason: Optional[str] = "Admin terminated"


class SessionListFilter(BaseModel):
    user_id: Optional[uuid.UUID] = None
    device_type: Optional[DeviceTypeEnum] = None
    is_active: Optional[bool] = None
    skip: int = 0
    limit: int = 100
