import enum
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum as SAEnum, UniqueConstraint, Index, Text, Integer
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func, text # For server_default text
from app.db.database import Base # Use the Base from database.py

class UserRoleEnum(str, enum.Enum):
    admin = "admin"
    air_quality = "air_quality"
    tree_management = "tree_management"
    government_emission = "government_emission"

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "app_auth"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column("encrypted_password", String(255), nullable=False) # Mapped from encryptedPassword
    is_super_admin = Column(Boolean, default=False, server_default='false')
    last_sign_in_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True) # For soft deletes

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    roles = relationship("UserRoleMapping", back_populates="user", cascade="all, delete-orphan")
    
    # Relationships from other schemas/tables pointing to User
    created_tests = relationship("Test", back_populates="created_by_user", foreign_keys="[Test.created_by_id]")
    changed_driver_histories = relationship("VehicleDriverHistory", back_populates="changed_by_user", foreign_keys="[VehicleDriverHistory.changed_by_id]")


class UserRoleMapping(Base):
    __tablename__ = "user_roles"
    __table_args__ = (
        UniqueConstraint("user_id", "role", name="uq_user_roles_user_id_role"),
        Index("idx_auth_user_roles_user_id", "user_id"),
        {"schema": "app_auth"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("app_auth.users.id", ondelete="CASCADE"), nullable=False)
    role = Column(SAEnum(UserRoleEnum, name="user_role", schema="app_auth"), nullable=False) # Use the enum name that exists in DB
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="roles")


class Profile(Base):
    __tablename__ = "profiles"
    __table_args__ = (
        Index("idx_auth_profiles_user_id", "user_id"),
        {"schema": "app_auth"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("app_auth.users.id", ondelete="CASCADE"), unique=True, nullable=False)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    bio = Column(String, nullable=True)
    job_title = Column(String(200), nullable=True)
    department = Column(String(200), nullable=True)
    phone_number = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="profile")


class DeviceTypeEnum(str, enum.Enum):
    mobile = "mobile"
    desktop = "desktop"
    tablet = "tablet"
    unknown = "unknown"


class UserSession(Base):
    __tablename__ = "user_sessions"
    __table_args__ = (
        Index("idx_auth_user_sessions_user_id", "user_id"),
        Index("idx_auth_user_sessions_created_at", "created_at"),
        Index("idx_auth_user_sessions_device_type", "device_type"),
        Index("idx_auth_user_sessions_is_active", "is_active"),
        {"schema": "app_auth"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("app_auth.users.id", ondelete="CASCADE"), nullable=False)
    session_token = Column(String(255), unique=True, nullable=False)
    device_type = Column(SAEnum(DeviceTypeEnum, name="device_type", schema="app_auth"), nullable=False, server_default="unknown")
    device_name = Column(String(255), nullable=True)  # Device model/name
    ip_address = Column(INET, nullable=True)
    user_agent = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, server_default='true', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_activity_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    termination_reason = Column(String(255), nullable=True)  # 'user_logout', 'admin_terminated', 'expired', 'blocked'

    user = relationship("User")


class FailedLogin(Base):
    __tablename__ = "failed_logins"
    __table_args__ = (
        Index("idx_auth_failed_logins_email", "email"),
        Index("idx_auth_failed_logins_created_at", "created_at"),
        Index("idx_auth_failed_logins_ip_address", "ip_address"),
        {"schema": "app_auth"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    email = Column(String(255), nullable=False)
    ip_address = Column(INET, nullable=True)
    user_agent = Column(String(500), nullable=True)
    failure_reason = Column(String(100), nullable=True)  # 'invalid_password', 'user_not_found', 'account_locked', etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ActivityLog(Base):
    __tablename__ = "activity_logs"
    __table_args__ = (
        Index("idx_auth_activity_logs_user_id", "user_id"),
        Index("idx_auth_activity_logs_created_at", "created_at"),
        Index("idx_auth_activity_logs_activity_type", "activity_type"),
        {"schema": "app_auth"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("app_auth.users.id", ondelete="SET NULL"), nullable=True)
    activity_type = Column(String(100), nullable=False)  # 'login', 'logout', 'user_created', 'role_assigned', etc.
    description = Column(Text, nullable=False)
    extra_data = Column(Text, nullable=True)  # JSON string for additional data
    ip_address = Column(INET, nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")