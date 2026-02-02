from fastapi import APIRouter, Depends, status, Request, Header, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.apis.deps import get_current_user_async, get_db_session
from app.services.auth_service import auth_service
from app.schemas.token_schemas import Token, OTPVerify, ResendOTPRequest, RefreshTokenRequest
from app.schemas.user_schemas import UserCreate, UserPublic, UserFullPublic
from app.models.auth_models import User, DeviceTypeEnum

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_new_user(
    user_in: UserCreate, 
    db: AsyncSession = Depends(get_db_session)
):
    """
    Register a new user with Supabase Auth.
    Sends OTP verification code to user's email.
    User must verify email before they can log in.
    """
    result = await auth_service.register_user_with_supabase(db=db, user_in=user_in)
    return {
        "message": "Registration successful. Check your email for verification code.",
        "email": result["email"]
    }

@router.post("/verify-otp", response_model=Token)
async def verify_otp(
    otp_data: OTPVerify,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    x_device_type: Optional[str] = Header(None, alias="X-Device-Type"),
    x_device_name: Optional[str] = Header(None, alias="X-Device-Name")
):
    """
    Verify email with OTP code sent during registration.
    Returns access token and refresh token upon successful verification.
    """
    # Parse device type from header
    device_type = DeviceTypeEnum.unknown
    if x_device_type:
        try:
            device_type = DeviceTypeEnum(x_device_type.lower())
        except ValueError:
            device_type = DeviceTypeEnum.unknown
    
    return await auth_service.verify_otp_and_create_session(
        db=db,
        email=otp_data.email,
        token=otp_data.token,
        request=request,
        device_type=device_type,
        device_name=x_device_name
    )

@router.post("/resend-otp")
async def resend_otp(
    resend_data: ResendOTPRequest
):
    """
    Resend OTP verification code to user's email.
    If password is provided, automatically retries signup after deleting unconfirmed user.
    """
    result = await auth_service.resend_otp_code(
        email=resend_data.email,
        password=resend_data.password
    )
    return result if result else {
        "message": "Verification code has been resent to your email."
    }

@router.post("/login", response_model=Token)
async def login_access_token(
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    form_data: OAuth2PasswordRequestForm = Depends(),
    x_device_type: Optional[str] = Header(None, alias="X-Device-Type"),
    x_device_name: Optional[str] = Header(None, alias="X-Device-Name")
):
    """
    OAuth2 compatible login endpoint using Supabase Auth.
    User must have verified their email before logging in.
    Returns access token and refresh token.
    """
    # Parse device type from header
    device_type = DeviceTypeEnum.unknown
    if x_device_type:
        try:
            device_type = DeviceTypeEnum(x_device_type.lower())
        except ValueError:
            device_type = DeviceTypeEnum.unknown
    
    return await auth_service.login_with_supabase(
        db=db,
        email=form_data.username,  # OAuth2 form uses 'username' field for email
        password=form_data.password,
        request=request,
        device_type=device_type,
        device_name=x_device_name
    )

@router.post("/refresh", response_model=Token)
async def refresh_access_token(
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Refresh an expired access token using a refresh token.
    """
    return await auth_service.refresh_session(
        db=db,
        refresh_token=refresh_data.refresh_token
    )

@router.post("/logout")
async def logout(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user_async)
):
    """
    Log out current user and invalidate their session.
    """
    await auth_service.logout_user(db=db, user_id=current_user.id)
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserFullPublic)
async def read_users_me(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user_async)
):
    """Get current user details including profile and roles"""
    return await auth_service.get_user_details(db=db, user_id=current_user.id)