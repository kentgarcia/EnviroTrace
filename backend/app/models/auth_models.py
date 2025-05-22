import enum
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum as SAEnum, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
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
    __table_args__ = {"schema": "auth"}

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
        {"schema": "auth"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id", ondelete="CASCADE"), nullable=False)
    role = Column(SAEnum(UserRoleEnum, name="user_role_enum_auth", schema="auth"), nullable=False) # Ensure enum is created in schema
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="roles")


class Profile(Base):
    __tablename__ = "profiles"
    __table_args__ = (
        Index("idx_auth_profiles_user_id", "user_id"),
        {"schema": "auth"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id", ondelete="CASCADE"), unique=True, nullable=False)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    bio = Column(String, nullable=True)
    job_title = Column(String(200), nullable=True)
    department = Column(String(200), nullable=True)
    phone_number = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="profile")