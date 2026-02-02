# app/schemas/token_schemas.py
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import uuid

class Token(BaseModel):
    """Supabase Auth session response"""
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None
    expires_in: Optional[int] = None
    user: Optional[Dict[str, Any]] = None
    message: Optional[str] = None  # For approval status messages

class RefreshTokenRequest(BaseModel):
    """Request schema for token refresh"""
    refresh_token: str = Field(..., description="Refresh token from Supabase Auth")

class TokenPayload(BaseModel):
    sub: Optional[uuid.UUID] = None # Subject (Supabase user_id)

class OTPVerify(BaseModel):
    """Schema for OTP verification during signup"""
    email: str = Field(..., description="User email address")
    token: str = Field(..., min_length=6, max_length=6, description="6-digit OTP code from email")

class ResendOTPRequest(BaseModel):
    """Schema for resending OTP code"""
    email: str = Field(..., description="User email address")