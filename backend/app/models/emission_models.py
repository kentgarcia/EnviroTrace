from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Index, Numeric, Computed
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func, text
from app.db.database import Base
# Make sure User is accessible for ForeignKey, or use string reference: "app_auth.users.id"
# from app.models.auth_models import User # This creates a circular dependency if imported directly for type hint
                                     # Use string for ForeignKey and define relationships carefully

class Office(Base):
    __tablename__ = "offices"
    __table_args__ = {"schema": "emission"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    name = Column(String(255), unique=True, nullable=False)
    address = Column(String(500), nullable=True)
    contact_number = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    vehicles = relationship("Vehicle", back_populates="office")

class Vehicle(Base):
    __tablename__ = "vehicles"
    __table_args__ = (
        Index("idx_vehicles_office_id_created_at", "office_id", "created_at"),
        Index("idx_vehicles_vehicle_type", "vehicle_type"),
        Index("idx_vehicles_engine_type", "engine_type"),
        Index("idx_vehicles_wheels", "wheels"),
        Index(
            "idx_vehicles_plate_number_search",
            "plate_number_search",
            postgresql_using="gin",
            postgresql_ops={"plate_number_search": "gin_trgm_ops"},
        ),
        Index(
            "idx_vehicles_chassis_number_search",
            "chassis_number_search",
            postgresql_using="gin",
            postgresql_ops={"chassis_number_search": "gin_trgm_ops"},
        ),
        Index(
            "idx_vehicles_registration_number_search",
            "registration_number_search",
            postgresql_using="gin",
            postgresql_ops={"registration_number_search": "gin_trgm_ops"},
        ),
        {"schema": "emission"},
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    driver_name = Column(String(255), nullable=False)
    contact_number = Column(String(50), nullable=True)
    engine_type = Column(String(100), nullable=False)
    office_id = Column(UUID(as_uuid=True), ForeignKey("emission.offices.id"), nullable=False)
    plate_number = Column(String(50), nullable=True)
    chassis_number = Column(String(100), unique=True, nullable=True)
    registration_number = Column(String(100), unique=True, nullable=True)
    plate_number_search = Column(
        String,
        Computed(
            "lower(regexp_replace(coalesce(plate_number, ''), '[^a-z0-9]', '', 'gi'))",
            persisted=True,
        ),
    )
    chassis_number_search = Column(
        String,
        Computed(
            "lower(regexp_replace(coalesce(chassis_number, ''), '[^a-z0-9]', '', 'gi'))",
            persisted=True,
        ),
    )
    registration_number_search = Column(
        String,
        Computed(
            "lower(regexp_replace(coalesce(registration_number, ''), '[^a-z0-9]', '', 'gi'))",
            persisted=True,
        ),
    )
    vehicle_type = Column(String(100), nullable=False)
    wheels = Column(Integer, nullable=False)
    description = Column(String, nullable=True)
    year_acquired = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    office = relationship("Office", back_populates="vehicles")
    tests = relationship("Test", back_populates="vehicle", cascade="all, delete-orphan")
    driver_history = relationship("VehicleDriverHistory", back_populates="vehicle", cascade="all, delete-orphan")
    remarks = relationship("VehicleRemarks", back_populates="vehicle", cascade="all, delete-orphan")

class VehicleDriverHistory(Base):
    __tablename__ = "vehicle_driver_history"
    __table_args__ = (
        Index("idx_vehicle_driver_history_vehicle_id", "vehicle_id"),
        {"schema": "emission"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("emission.vehicles.id", ondelete="CASCADE"), nullable=False)
    driver_name = Column(String(255), nullable=False)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())
    changed_by_id = Column("changed_by", UUID(as_uuid=True), ForeignKey("app_auth.users.id"), nullable=True) # Mapped from changedBy

    vehicle = relationship("Vehicle", back_populates="driver_history")
    changed_by_user = relationship("User", back_populates="changed_driver_histories", foreign_keys=[changed_by_id])

class VehicleRemarks(Base):
    __tablename__ = "vehicle_remarks"
    __table_args__ = (
        Index("idx_vehicle_remarks_vehicle_year", "vehicle_id", "year"),
        {"schema": "emission"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("emission.vehicles.id", ondelete="CASCADE"), nullable=False)
    year = Column(Integer, nullable=False)
    remarks = Column(String(1000), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by_id = Column("created_by", UUID(as_uuid=True), ForeignKey("app_auth.users.id"), nullable=True)

    vehicle = relationship("Vehicle", back_populates="remarks")

class TestSchedule(Base):
    __tablename__ = "test_schedules"
    __table_args__ = (
        Index("idx_test_schedule_year_quarter", "year", "quarter"),
        {"schema": "emission"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    assigned_personnel = Column(String(255), nullable=False)
    conducted_on = Column(DateTime(timezone=True), nullable=False)
    location = Column(String(255), nullable=False)
    quarter = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Test(Base):
    __tablename__ = "tests"
    __table_args__ = (
        Index("idx_test_vehicle_id", "vehicle_id"),
        Index("idx_test_year_quarter", "year", "quarter"),
        {"schema": "emission"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("emission.vehicles.id", ondelete="CASCADE"), nullable=False)
    test_date = Column(DateTime(timezone=True), nullable=False)
    quarter = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    result = Column(Boolean, nullable=False)  # Simple pass/fail
    remarks = Column(String(500), nullable=True)  # Optional remarks
    co_level = Column(Numeric(5, 2), nullable=True)  # Carbon monoxide level (percentage) - For GASOLINE vehicles
    hc_level = Column(Numeric(10, 2), nullable=True)  # Hydrocarbon level (ppm) - For GASOLINE vehicles
    opacimeter_result = Column(Numeric(5, 2), nullable=True)  # Opacimeter test result (smoke opacity %) - For DIESEL vehicles
    technician_name = Column(String(255), nullable=True)  # Technician who performed the test
    testing_center = Column(String(255), nullable=True)  # Testing center name
    created_by_id = Column("created_by", UUID(as_uuid=True), ForeignKey("app_auth.users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    vehicle = relationship("Vehicle", back_populates="tests")
    created_by_user = relationship("User", back_populates="created_tests", foreign_keys=[created_by_id])