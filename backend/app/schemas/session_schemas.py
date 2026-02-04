# app/schemas/session_schemas.py
import uuid
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Union, Any
from datetime import datetime
from ipaddress import IPv4Address, IPv6Address
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

    @field_validator('ip_address', mode='before')
    @classmethod
    def serialize_ip(cls, v: Any) -> Optional[str]:
        if v is None:
            return None
        if isinstance(v, (IPv4Address, IPv6Address)):
            return str(v)
        return str(v)


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


class UserSuspendRequest(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500, description="Reason for suspension")


class UserUnsuspendRequest(BaseModel):
    temporary_password: str = Field(..., min_length=8, description="Temporary password for user to login")


class PasswordResetResponse(BaseModel):
    temporary_password: str
    user_email: str
    message: str = "Password reset successful. Provide this temporary password to the user."
