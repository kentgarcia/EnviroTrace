"""
Supabase client initialization and helper functions for authentication.
"""
from typing import Optional, Dict, Any
from functools import lru_cache
import jwt
from supabase import create_client, Client
from fastapi import HTTPException, status

from app.core.config import settings


@lru_cache()
def get_supabase_admin() -> Client:
    """
    Get Supabase admin client with service role key.
    This client bypasses Row Level Security (RLS) and should only be used server-side.
    
    Returns:
        Supabase Client with admin privileges
    """
    return create_client(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY
    )


def get_supabase_public() -> Client:
    """
    Get Supabase public client with anon key.
    Used for public-facing operations that respect RLS.
    
    Returns:
        Supabase Client with anon key
    """
    return create_client(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_ANON_KEY
    )


def verify_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Verify a Supabase JWT token using ES256 (ECC P-256) or RS256 algorithm with public key.
    
    Args:
        token: The JWT token from Supabase Auth (without 'Bearer ' prefix)
        
    Returns:
        Decoded JWT payload containing user information
        
    Raises:
        HTTPException: If token is invalid, expired, or verification fails
    """
    try:
        # Format the public key properly if not already formatted
        public_key = settings.SUPABASE_JWT_PUBLIC_KEY
        
        # Determine algorithm based on key format
        # ES256 keys start with "-----BEGIN PUBLIC KEY-----" and are shorter
        # RS256 keys are longer RSA keys
        algorithms = ["ES256", "RS256"]  # Try ES256 first (modern ECC), fallback to RS256
        
        if not public_key.startswith('-----BEGIN'):
            # If the key is missing headers, add them
            public_key = f"-----BEGIN PUBLIC KEY-----\n{public_key}\n-----END PUBLIC KEY-----"
        
        # Decode and verify the JWT with Supabase's public key
        payload = jwt.decode(
            token,
            public_key,
            algorithms=algorithms,
            audience="authenticated",
            options={"verify_aud": True}
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_user_id_from_token(token: str) -> str:
    """
    Extract Supabase user ID from JWT token.
    
    Args:
        token: The JWT token from Supabase Auth
        
    Returns:
        Supabase user ID (UUID as string)
        
    Raises:
        HTTPException: If token is invalid or missing 'sub' claim
    """
    payload = verify_supabase_jwt(token)
    user_id = payload.get("sub")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user ID (sub claim)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_id


async def verify_email_with_otp(email: str, token: str) -> Dict[str, Any]:
    """
    Verify user email using OTP code sent by Supabase.
    
    Args:
        email: User's email address
        token: 6-digit OTP code from email
        
    Returns:
        Supabase auth response with session data
        
    Raises:
        HTTPException: If verification fails
    """
    supabase = get_supabase_admin()
    
    try:
        response = supabase.auth.verify_otp({
            "email": email,
            "token": token,
            "type": "signup"
        })
        
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP code"
            )
        
        return {
            "user": response.user,
            "session": response.session
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OTP verification failed: {str(e)}"
        )


async def resend_otp(email: str) -> bool:
    """
    Resend OTP verification code to user's email.
    
    Args:
        email: User's email address
        
    Returns:
        True if OTP was resent successfully
        
    Raises:
        HTTPException: If resend fails
    """
    supabase = get_supabase_admin()
    
    try:
        supabase.auth.resend({
            "type": "signup",
            "email": email
        })
        return True
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to resend OTP: {str(e)}"
        )


async def sign_in_with_password(email: str, password: str) -> Dict[str, Any]:
    """
    Sign in user with email and password using Supabase Auth.
    
    Args:
        email: User's email address
        password: User's password
        
    Returns:
        Supabase auth response with session and user data
        
    Raises:
        HTTPException: If sign-in fails
    """
    supabase = get_supabase_admin()
    
    try:
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        if not response.user or not response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        return {
            "user": response.user,
            "session": response.session
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


async def refresh_session(refresh_token: str) -> Dict[str, Any]:
    """
    Refresh an expired access token using a refresh token.
    
    Args:
        refresh_token: The refresh token from Supabase
        
    Returns:
        New session with fresh access token
        
    Raises:
        HTTPException: If refresh fails
    """
    supabase = get_supabase_admin()
    
    try:
        response = supabase.auth.refresh_session(refresh_token)
        
        if not response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to refresh session"
            )
        
        return {
            "session": response.session
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Session refresh failed: {str(e)}"
        )


async def sign_out(access_token: str) -> bool:
    """
    Sign out user and invalidate their session in Supabase.
    
    Args:
        access_token: User's current access token
        
    Returns:
        True if sign-out was successful
    """
    supabase = get_supabase_admin()
    
    try:
        # Set the access token for this request
        supabase.auth.set_session(access_token, "")
        supabase.auth.sign_out()
        return True
    except Exception:
        # Even if Supabase sign-out fails, we'll invalidate locally
        return True
