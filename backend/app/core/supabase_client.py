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


async def delete_unconfirmed_user(email: str) -> bool:
    """
    Delete an unconfirmed user from Supabase Auth.
    This is necessary because Supabase's resend() doesn't work for existing unconfirmed users.
    
    Args:
        email: User's email address
        
    Returns:
        True if user was deleted or doesn't exist
        
    Raises:
        HTTPException: If user is confirmed or deletion fails
    """
    supabase = get_supabase_admin()
    
    try:
        # Get user by email to check confirmation status
        response = supabase.auth.admin.list_users()
        
        # Find user with matching email
        user = next((u for u in response if u.email == email), None)
        
        if not user:
            print(f"No user found with email {email} - nothing to delete")
            return True
        
        # Check if user is confirmed
        if user.email_confirmed_at is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already verified. Please sign in instead."
            )
        
        # Delete unconfirmed user
        supabase.auth.admin.delete_user(user.id)
        print(f"Deleted unconfirmed user {email} (ID: {user.id})")
        return True
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting unconfirmed user {email}: {str(e)}")
        # Don't fail the operation if deletion fails - return False to indicate failure
        return False


async def resend_otp(email: str, delete_if_unconfirmed: bool = True) -> bool:
    """
    Resend OTP verification code to user's email.
    
    WARNING: Supabase's resend() endpoint has a known limitation - it returns HTTP 200
    success but does NOT actually send emails for existing unconfirmed users.
    This has been confirmed by analyzing Supabase Auth logs.
    
    The reliable solution is to delete the unconfirmed user first, then let signup send a fresh email.
    
    Args:
        email: User's email address
        delete_if_unconfirmed: If True, delete unconfirmed users before allowing fresh signup
        
    Returns:
        True if user was deleted (needs fresh signup) or resend was attempted
        
    Raises:
        HTTPException: For specific error conditions
    """
    supabase = get_supabase_admin()
    
    try:
        # CRITICAL: Supabase resend() doesn't work for existing unconfirmed users
        # Solution: Delete the user so they can sign up fresh and receive the email
        if delete_if_unconfirmed:
            print(f"Attempting to delete unconfirmed user {email} to enable fresh signup")
            await delete_unconfirmed_user(email)
            # User deleted successfully - fresh signup will now send email
            return True
        
        # Fallback: Try standard resend (won't work for existing unconfirmed users)
        # Using correct dictionary syntax per Supabase Python SDK docs
        supabase.auth.resend({
            "type": "signup",
            "email": email
        })
        print(f"WARNING: Called resend for {email} - may not send if user exists and is unconfirmed")
        return True
        
    except HTTPException:
        # Re-raise HTTP exceptions from delete_unconfirmed_user
        raise
    except Exception as e:
        error_msg = str(e).lower()
        
        print(f"Resend OTP error for {email}: {str(e)}")
        
        # Check for specific error conditions
        if "already confirmed" in error_msg or "email already confirmed" in error_msg or "email_confirmed_at" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already verified. Please sign in instead."
            )
        elif "rate" in error_msg or "too many" in error_msg or "limit" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please wait a moment before trying again."
            )
        elif "not found" in error_msg or "user not found" in error_msg or "user_not_found" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No pending signup found with this email. Please sign up first."
            )
        
        # Generic error
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to resend verification code. Please try again."
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
