# app/services/auth_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime, timezone

from app.crud.crud_user import user as crud_user
from app.crud.crud_profile import profile as crud_profile
from app.crud.crud_session import session_crud
from app.schemas.user_schemas import UserCreate, UserPublic, UserWithRoles, UserFullPublic
from app.schemas.profile_schemas import ProfileCreate
from app.schemas.token_schemas import Token
from app.models.auth_models import User, DeviceTypeEnum
from app.core import supabase_client
from app.core.config import settings

class AuthService:
    async def register_user_with_supabase(
        self, 
        db: AsyncSession, 
        *, 
        user_in: UserCreate
    ) -> Dict[str, Any]:
        """
        Register a new user with Supabase Auth.
        Creates user in Supabase and sends OTP verification email.
        Does NOT create internal user record until email is verified.
        """
        # Check for existing active user
        existing_user = await crud_user.get_by_email(db, email=user_in.email, include_deleted=False)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The user with this email already exists in the system.",
            )
        
        # Check for archived user with same email
        archived_user = await crud_user.get_by_email(db, email=user_in.email, include_deleted=True)
        if archived_user and archived_user.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An archived account exists with this email. Please contact an administrator to reactivate the account.",
            )
        
        # Create user in Supabase Auth
        supabase = supabase_client.get_supabase_admin()
        
        try:
            # Sign up with Supabase (automatically sends OTP email)
            auth_response = supabase.auth.sign_up({
                "email": user_in.email,
                "password": user_in.password,
                "options": {
                    "email_redirect_to": None,  # No magic link, only OTP
                    "data": {
                        "first_name": user_in.first_name,
                        "last_name": user_in.last_name
                    }
                }
            })
            
            if not auth_response.user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create user in Supabase Auth"
                )
            
            # Store user registration data in session for later (after OTP verification)
            # For now, just return success without creating internal user record
            return {
                "supabase_user_id": auth_response.user.id,
                "email": user_in.email
            }
            
        except Exception as e:
            error_msg = str(e).lower()
            # If user already exists in Supabase but is unconfirmed, delete them
            if "already registered" in error_msg or "user already exists" in error_msg or "already been registered" in error_msg or "user with this email already registered" in error_msg:
                try:
                    # Delete unconfirmed user to allow fresh signup
                    # CRITICAL: Supabase's resend() doesn't actually send emails for existing unconfirmed users
                    # The only reliable solution is to delete and recreate
                    deleted = await supabase_client.delete_unconfirmed_user(email=user_in.email)
                    
                    if deleted:
                        print(f"Deleted unconfirmed user {user_in.email}, allowing signup retry")
                        # Now try to sign up again immediately
                        try:
                            auth_response = supabase.auth.sign_up({
                                "email": user_in.email,
                                "password": user_in.password,
                                "options": {
                                    "email_redirect_to": None,
                                    "data": {
                                        "first_name": user_in.first_name,
                                        "last_name": user_in.last_name
                                    }
                                }
                            })
                            
                            if auth_response.user:
                                return {
                                    "supabase_user_id": auth_response.user.id,
                                    "email": user_in.email,
                                    "message": "Verification code sent to your email"
                                }
                        except Exception as retry_error:
                            print(f"Signup retry failed for {user_in.email}: {str(retry_error)}")
                            raise HTTPException(
                                status_code=status.HTTP_400_BAD_REQUEST,
                                detail="Registration failed after cleanup. Please try again."
                            )
                    
                    # If deletion failed, tell user to try again
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Unable to complete registration. Please try again."
                    )
                    
                except HTTPException as http_exc:
                    # If deletion fails with "already confirmed", that means user is in our DB
                    if http_exc.status_code == 400 and "already verified" in str(http_exc.detail).lower():
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="An account with this email already exists. Please sign in instead."
                        )
                    # Re-raise other HTTP exceptions
                    raise
                    
                except Exception as delete_error:
                    print(f"Error handling existing user {user_in.email}: {str(delete_error)}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Registration failed. Please try again."
                    )
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Registration failed: {str(e)}"
            )
    
    async def verify_otp_and_create_session(
        self,
        db: AsyncSession,
        *,
        email: str,
        token: str,
        request: Optional[Request] = None,
        device_type: DeviceTypeEnum = DeviceTypeEnum.unknown,
        device_name: Optional[str] = None
    ) -> Token:
        """
        Verify OTP code and create user session.
        Creates internal user record if it doesn't exist.
        """
        # Verify OTP with Supabase
        result = await supabase_client.verify_email_with_otp(email=email, token=token)
        
        supabase_user = result["user"]
        supabase_session = result["session"]
        
        if not supabase_user or not supabase_session:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP verification failed"
            )
        
        # Check if internal user record exists
        supabase_user_id = uuid.UUID(supabase_user.id)
        internal_user = await crud_user.get_by_supabase_id(db, supabase_user_id=supabase_user_id)
        
        if not internal_user:
            # Create internal user record
            # Check if email belongs to super admin
            super_admin_emails = settings.get_super_admin_emails()
            is_super_admin = email.lower() in super_admin_emails
            
            # Create user (super admins are auto-approved, others need admin approval)
            from app.models.auth_models import User as UserModel, Profile
            internal_user = UserModel(
                email=email,
                supabase_user_id=supabase_user_id,
                email_confirmed_at=datetime.now(timezone.utc),
                is_approved=is_super_admin,  # Auto-approve super admins only
                is_super_admin=is_super_admin,
                last_sign_in_at=datetime.now(timezone.utc)
            )
            db.add(internal_user)
            await db.commit()
            await db.refresh(internal_user)
        else:
            # Update email_confirmed_at if not set
            if not internal_user.email_confirmed_at:
                internal_user.email_confirmed_at = datetime.now(timezone.utc)
                internal_user.last_sign_in_at = datetime.now(timezone.utc)
                await db.commit()
                await db.refresh(internal_user)
        
        # Create session tracking
        await self._create_session_tracking(
            db=db,
            user_id=internal_user.id,
            supabase_session=supabase_session,
            request=request,
            device_type=device_type,
            device_name=device_name
        )
        
        # Add approval status to response for super admins
        response_data = {
            "access_token": supabase_session.access_token,
            "token_type": "bearer",
            "refresh_token": supabase_session.refresh_token,
            "expires_in": supabase_session.expires_in,
            "user": supabase_user.model_dump() if hasattr(supabase_user, 'model_dump') else dict(supabase_user)
        }
        
        # Add approval message for non-super-admins
        if not internal_user.is_approved and not internal_user.is_super_admin:
            response_data["message"] = "Email verified. Your account is pending admin approval."
        
        return Token(**response_data)
    
    async def login_with_supabase(
        self,
        db: AsyncSession,
        *,
        email: str,
        password: str,
        request: Optional[Request] = None,
        device_type: DeviceTypeEnum = DeviceTypeEnum.unknown,
        device_name: Optional[str] = None
    ) -> Token:
        """
        Authenticate user with Supabase Auth.
        Verifies email is confirmed before allowing login.
        """
        # Sign in with Supabase
        result = await supabase_client.sign_in_with_password(email=email, password=password)
        
        supabase_user = result["user"]
        supabase_session = result["session"]
        
        if not supabase_user or not supabase_session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Get internal user record
        supabase_user_id = uuid.UUID(supabase_user.id)
        internal_user = await crud_user.get_by_supabase_id(db, supabase_user_id=supabase_user_id)
        
        if not internal_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found. Please complete registration."
            )
        
        # Verify email is confirmed
        if not internal_user.email_confirmed_at:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="EMAIL_NOT_VERIFIED: Email not verified. Please verify your email before logging in."
            )
        
        # Verify account is approved by admin (super admins bypass this check)
        if not internal_user.is_approved and not internal_user.is_super_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="PENDING_APPROVAL: Account pending approval. Please wait for an administrator to approve your account."
            )
        
        # Auto-promote to super admin if email matches
        super_admin_emails = settings.get_super_admin_emails()
        if internal_user.email.lower() in super_admin_emails and not internal_user.is_super_admin:
            internal_user.is_super_admin = True
            await db.commit()
            await db.refresh(internal_user)
        
        # Update last sign in
        internal_user.last_sign_in_at = datetime.now(timezone.utc)
        await db.commit()
        
        # Create session tracking
        await self._create_session_tracking(
            db=db,
            user_id=internal_user.id,
            supabase_session=supabase_session,
            request=request,
            device_type=device_type,
            device_name=device_name
        )
        
        return Token(
            access_token=supabase_session.access_token,
            token_type="bearer",
            refresh_token=supabase_session.refresh_token,
            expires_in=supabase_session.expires_in,
            user=supabase_user.model_dump() if hasattr(supabase_user, 'model_dump') else dict(supabase_user)
        )
    
    async def refresh_session(
        self,
        db: AsyncSession,
        *,
        refresh_token: str
    ) -> Token:
        """
        Refresh access token using refresh token.
        """
        result = await supabase_client.refresh_session(refresh_token=refresh_token)
        
        supabase_session = result["session"]
        
        if not supabase_session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to refresh session"
            )
        
        # Update session tracking if it exists
        session = await session_crud.get_by_supabase_id(
            db, 
            supabase_session_id=supabase_session.access_token
        )
        if session:
            await session_crud.update_activity(db, session_id=session.id)
        
        return Token(
            access_token=supabase_session.access_token,
            token_type="bearer",
            refresh_token=supabase_session.refresh_token,
            expires_in=supabase_session.expires_in
        )
    
    async def logout_user(
        self,
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        access_token: Optional[str] = None
    ) -> bool:
        """
        Log out user and terminate their session.
        """
        # Sign out from Supabase if token provided
        if access_token:
            await supabase_client.sign_out(access_token=access_token)
        
        # Terminate all active sessions for user
        await session_crud.terminate_all_user_sessions(
            db,
            user_id=user_id,
            reason="user_logout"
        )
        
        return True
    
    async def resend_otp_code(self, *, email: str, password: Optional[str] = None) -> dict:
        """
        Handle OTP resend request.
        
        Due to Supabase Auth limitation (resend() doesn't send emails for existing 
        unconfirmed users), we delete the unconfirmed user and retry signup if password provided.
        
        Args:
            email: User email
            password: Optional password to enable automatic signup retry
            
        Returns:
            Dict with success message or error
            
        Raises:
            HTTPException: With appropriate error codes
        """
        supabase = supabase_client.get_supabase_admin()
        
        try:
            # Delete unconfirmed user to allow fresh signup
            deleted = await supabase_client.delete_unconfirmed_user(email=email)
            
            if deleted and password:
                # Password provided - automatically retry signup to send new email
                print(f"Retrying signup for {email} after deleting unconfirmed user")
                try:
                    auth_response = supabase.auth.sign_up({
                        "email": email,
                        "password": password,
                        "options": {
                            "email_redirect_to": None
                        }
                    })
                    
                    if auth_response.user:
                        return {
                            "message": "Verification code has been resent to your email.",
                            "email": email
                        }
                    else:
                        raise Exception("Signup failed to create user")
                        
                except Exception as signup_error:
                    print(f"Signup retry failed for {email}: {str(signup_error)}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Failed to resend code. Please try signing up again."
                    )
            
            elif deleted:
                # User deleted but no password - tell them to signup again
                raise HTTPException(
                    status_code=status.HTTP_410_GONE,
                    detail="Verification session expired. Please sign up again to receive a new code."
                )
            else:
                # Deletion failed
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Unable to resend code. Please try signing up again."
                )
                
        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            print(f"Error in resend_otp_code for {email}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to process request. Please try again."
            )
    
    async def _create_session_tracking(
        self,
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        supabase_session: Any,
        request: Optional[Request] = None,
        device_type: DeviceTypeEnum = DeviceTypeEnum.unknown,
        device_name: Optional[str] = None
    ):
        """
        Create session tracking record for user login.
        """
        # Extract request metadata
        ip_address = None
        user_agent = None
        if request:
            forwarded_for = request.headers.get("X-Forwarded-For")
            if forwarded_for:
                ip_address = forwarded_for.split(",")[0].strip()
            else:
                ip_address = request.client.host if request.client else None
            
            user_agent = request.headers.get("User-Agent")
        
        # Calculate expiration from Supabase session
        expires_at = datetime.now(timezone.utc)
        if hasattr(supabase_session, 'expires_in') and supabase_session.expires_in:
            from datetime import timedelta
            expires_at = expires_at + timedelta(seconds=supabase_session.expires_in)
        
        # Create session with device tracking
        await session_crud.create_session(
            db,
            user_id=user_id,
            supabase_session_id=supabase_session.access_token,
            expires_at=expires_at,
            device_type=device_type,
            device_name=device_name,
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    async def reactivate_user(self, db: AsyncSession, *, user_id: uuid.UUID) -> UserFullPublic:
        """Reactivate an archived user account"""
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if user.deleted_at is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User account is already active"
            )
        
        # Reactivate the user
        user.deleted_at = None
        user.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(user)
        
        return await self.get_user_details(db=db, user_id=user.id)

    async def get_user_details(self, db: AsyncSession, user_id: uuid.UUID) -> UserFullPublic:
        # Get user with profile loaded
        user_model = await crud_user.get_with_profile(db, user_id=user_id)
        if not user_model:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        roles = await crud_user.get_user_roles(db, user_id=user_model.id)
        
        # Get user permissions (empty list for super admins as they have all permissions)
        from app.crud.crud_permission import permission_crud
        permissions = []
        if not user_model.is_super_admin:
            permissions = await permission_crud.get_user_permission_names(db, user_id=user_model.id)
        
        # Get profile data
        profile_data = None
        if user_model.profile:
            profile_data = {
                "id": user_model.profile.id,
                "user_id": user_model.profile.user_id,
                "first_name": user_model.profile.first_name,
                "last_name": user_model.profile.last_name,
                "bio": user_model.profile.bio,
                "job_title": user_model.profile.job_title,
                "department": user_model.profile.department,
                "phone_number": user_model.profile.phone_number,
                "created_at": user_model.profile.created_at,
                "updated_at": user_model.profile.updated_at,
            }
        
        # Create UserFullPublic response (includes profile, roles, and permissions)
        user_data = {
            "id": user_model.id,
            "email": user_model.email,
            "is_super_admin": user_model.is_super_admin,
            "is_approved": user_model.is_approved,
            "email_confirmed_at": user_model.email_confirmed_at,
            "supabase_user_id": user_model.supabase_user_id,
            "last_sign_in_at": user_model.last_sign_in_at,
            "created_at": user_model.created_at,
            "updated_at": user_model.updated_at,
            "deleted_at": user_model.deleted_at,
            "assigned_roles": roles,
            "permissions": permissions,
            "profile": profile_data
        }
        
        return UserFullPublic(**user_data)
    
    async def get_users_with_details(self, db: AsyncSession, user_ids: List[uuid.UUID]) -> List[UserFullPublic]:
        """Efficiently fetch multiple users with their profiles, roles, and permissions in batch queries"""
        from sqlalchemy.orm import selectinload
        from sqlalchemy import select
        from app.models.auth_models import User, UserRoleMapping, Profile, RolePermission, Permission, Role
        
        # Fetch all users with profiles in a single query
        result = await db.execute(
            select(User)
            .options(selectinload(User.profile))
            .where(User.id.in_(user_ids))
        )
        users = result.scalars().all()
        
        # Fetch all role mappings for these users in a single query
        roles_result = await db.execute(
            select(UserRoleMapping.user_id, Role.slug)
            .join(Role, Role.id == UserRoleMapping.role_id)
            .where(UserRoleMapping.user_id.in_(user_ids))
        )
        role_rows = roles_result.fetchall()
        
        # Organize roles by user_id for quick lookup
        user_roles_map = {}
        for user_id, role_slug in role_rows:
            if user_id not in user_roles_map:
                user_roles_map[user_id] = []
            user_roles_map[user_id].append(role_slug)
        
        # Fetch permissions for all users in a single query
        permissions_result = await db.execute(
            select(Permission.name, UserRoleMapping.user_id)
            .join(RolePermission, Permission.id == RolePermission.permission_id)
            .join(UserRoleMapping, RolePermission.role_id == UserRoleMapping.role_id)
            .where(UserRoleMapping.user_id.in_(user_ids))
            .distinct()
        )
        permission_mappings = permissions_result.fetchall()
        
        # Organize permissions by user_id
        user_permissions_map = {}
        for perm_name, user_id in permission_mappings:
            if user_id not in user_permissions_map:
                user_permissions_map[user_id] = []
            user_permissions_map[user_id].append(perm_name)
        
        # Build UserFullPublic objects
        users_with_details = []
        for user_model in users:
            profile_data = None
            if user_model.profile:
                profile_data = {
                    "id": user_model.profile.id,
                    "user_id": user_model.profile.user_id,
                    "first_name": user_model.profile.first_name,
                    "last_name": user_model.profile.last_name,
                    "bio": user_model.profile.bio,
                    "job_title": user_model.profile.job_title,
                    "department": user_model.profile.department,
                    "phone_number": user_model.profile.phone_number,
                    "created_at": user_model.profile.created_at,
                    "updated_at": user_model.profile.updated_at,
                }
            
            # Super admins get empty permissions list as they have all permissions
            permissions = [] if user_model.is_super_admin else user_permissions_map.get(user_model.id, [])
            
            user_data = {
                "id": user_model.id,
                "email": user_model.email,
                "is_super_admin": user_model.is_super_admin,
                "is_approved": user_model.is_approved,
                "email_confirmed_at": user_model.email_confirmed_at,
                "supabase_user_id": user_model.supabase_user_id,
                "last_sign_in_at": user_model.last_sign_in_at,
                "created_at": user_model.created_at,
                "updated_at": user_model.updated_at,
                "deleted_at": user_model.deleted_at,
                "assigned_roles": user_roles_map.get(user_model.id, []),
                "permissions": permissions,
                "profile": profile_data
            }
            users_with_details.append(UserFullPublic(**user_data))
        
        return users_with_details


auth_service = AuthService()