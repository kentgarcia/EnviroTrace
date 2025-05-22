import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, ForeignKey, Numeric, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func, text
from app.db.database import Base

class Fee(Base):
    __tablename__ = "fees"
    __table_args__ = {"schema": "belching"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    amount = Column(Numeric(10, 2), nullable=False)
    category = Column(String(100), nullable=False)
    level = Column(Integer, default=1, server_default='1')
    effective_date = Column("effective_date", Date, server_default=text("CURRENT_DATE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Driver(Base):
    __tablename__ = "drivers"
    __table_args__ = (
        Index("idx_belching_drivers_license", "license_number"),
        Index("idx_belching_drivers_name", "last_name", "first_name"),
        {"schema": "belching"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    first_name = Column(String(100), nullable=False)
    middle_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=False)
    address = Column(String, nullable=False)
    license_number = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    violations = relationship("Violation", back_populates="driver")

# ... Define Record, Violation, RecordHistory ...
# Example for Violation's ForeignKeys:
# record_id = Column(Integer, ForeignKey("belching.records.id", ondelete="CASCADE"), nullable=False)
# driver_id = Column(UUID(as_uuid=True), ForeignKey("belching.drivers.id"), nullable=True)

class Record(Base):
    __tablename__ = "records"
    __table_args__ = (
        Index("idx_belching_records_operator", "operator_company_name"),
        Index("idx_belching_records_plate", "plate_number"),
        {"schema": "belching"}
    )
    id = Column(Integer, primary_key=True, autoincrement=True)
    plate_number = Column(String(32), nullable=False)
    vehicle_type = Column(String(64), nullable=False)
    transport_group = Column(String(100), nullable=True)
    operator_company_name = Column(String(200), nullable=False)
    operator_address = Column(String, nullable=True)
    owner_first_name = Column(String(100), nullable=True)
    owner_middle_name = Column(String(100), nullable=True)
    owner_last_name = Column(String(100), nullable=True)
    motor_no = Column(String(100), nullable=True)
    motor_vehicle_name = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    violations = relationship("Violation", back_populates="record", cascade="all, delete-orphan")
    history_entries = relationship("RecordHistory", back_populates="record", cascade="all, delete-orphan")


class Violation(Base):
    __tablename__ = "violations"
    __table_args__ = (
        Index("idx_belching_violations_date", "date_of_apprehension"),
        Index("idx_belching_violations_record", "record_id"),
        {"schema": "belching"}
    )
    id = Column(Integer, primary_key=True, autoincrement=True)
    record_id = Column(Integer, ForeignKey("belching.records.id", ondelete="CASCADE"), nullable=False)
    ordinance_infraction_report_no = Column(String(100), nullable=True)
    smoke_density_test_result_no = Column(String(100), nullable=True)
    place_of_apprehension = Column(String(200), nullable=False)
    date_of_apprehension = Column(Date, nullable=False)
    paid_driver = Column(Boolean, default=False, server_default='false')
    paid_operator = Column(Boolean, default=False, server_default='false')
    driver_id = Column(UUID(as_uuid=True), ForeignKey("belching.drivers.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    driver = relationship("Driver", back_populates="violations")
    record = relationship("Record", back_populates="violations")


class RecordHistory(Base):
    __tablename__ = "record_history"
    __table_args__ = (
        Index("idx_belching_record_history_date", "date"),
        Index("idx_belching_record_history_record", "record_id"),
        {"schema": "belching"}
    )
    id = Column(Integer, primary_key=True, autoincrement=True)
    record_id = Column(Integer, ForeignKey("belching.records.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(64), nullable=False)
    date = Column(Date, nullable=False)
    details = Column(String, nullable=True)
    or_number = Column(String(64), nullable=True)
    status = Column(String(32), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    record = relationship("Record", back_populates="history_entries")