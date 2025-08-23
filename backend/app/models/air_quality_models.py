from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, ForeignKey, Numeric, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func, text
from app.db.database import Base


class AirQualityFee(Base):
    __tablename__ = "fees"
    __table_args__ = {"schema": "air_quality"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    amount = Column(Numeric(10, 2), nullable=False)
    category = Column(String(100), nullable=False)  # "apprehension", "voluntary", "impound", "testing"
    level = Column(Integer, default=1, server_default='1')  # offense level (1st, 2nd, 3rd)
    effective_date = Column("effective_date", Date, server_default=text("CURRENT_DATE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AirQualityDriver(Base):
    __tablename__ = "drivers"
    __table_args__ = (
        Index("idx_air_quality_drivers_license", "license_number"),
        Index("idx_air_quality_drivers_name", "last_name", "first_name"),
        {"schema": "air_quality"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    first_name = Column(String(100), nullable=False)
    middle_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=False)
    address = Column(String, nullable=False)
    license_number = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    violations = relationship("AirQualityViolation", back_populates="driver")


class AirQualityRecord(Base):
    __tablename__ = "records"
    __table_args__ = (
        Index("idx_air_quality_records_operator", "operator_company_name"),
        Index("idx_air_quality_records_plate", "plate_number"),
        {"schema": "air_quality"}
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

    violations = relationship("AirQualityViolation", back_populates="record", cascade="all, delete-orphan")
    history_entries = relationship("AirQualityRecordHistory", back_populates="record", cascade="all, delete-orphan")


class AirQualityViolation(Base):
    __tablename__ = "violations"
    __table_args__ = (
        Index("idx_air_quality_violations_date", "date_of_apprehension"),
        Index("idx_air_quality_violations_record", "record_id"),
        {"schema": "air_quality"}
    )
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    record_id = Column(Integer, ForeignKey("air_quality.records.id", ondelete="CASCADE"), nullable=False)
    ordinance_infraction_report_no = Column(String(100), nullable=True)
    smoke_density_test_result_no = Column(String(100), nullable=True)
    place_of_apprehension = Column(String(200), nullable=False)
    date_of_apprehension = Column(Date, nullable=False)
    paid_driver = Column(Boolean, default=False, server_default='false')
    paid_operator = Column(Boolean, default=False, server_default='false')
    driver_id = Column(UUID(as_uuid=True), ForeignKey("air_quality.drivers.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    record = relationship("AirQualityRecord", back_populates="violations")
    driver = relationship("AirQualityDriver", back_populates="violations")


class AirQualityRecordHistory(Base):
    __tablename__ = "record_history"
    __table_args__ = (
        Index("idx_air_quality_record_history_date", "date"),
        Index("idx_air_quality_record_history_record", "record_id"),
        {"schema": "air_quality"}
    )
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    record_id = Column(Integer, ForeignKey("air_quality.records.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(64), nullable=False)  # 'violation', 'payment', 'clearance', etc.
    date = Column(Date, nullable=False)
    details = Column(String, nullable=True)
    or_number = Column(String(64), nullable=True)  # Official Receipt number
    status = Column(String(32), nullable=False)    # 'completed', 'pending', 'cancelled'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    record = relationship("AirQualityRecord", back_populates="history_entries")


class AirQualityOrderOfPayment(Base):
    __tablename__ = "order_of_payments"
    __table_args__ = (
        Index("idx_air_quality_oop_control_number", "oop_control_number"),
        Index("idx_air_quality_oop_plate", "plate_number"),
        Index("idx_air_quality_oop_date", "date_of_payment"),
        {"schema": "air_quality"}
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    oop_control_number = Column(String(6), unique=True, nullable=False)  # 6-digit format: 03XXXX
    plate_number = Column(String(32), nullable=False)
    operator_name = Column(String(200), nullable=False)
    driver_name = Column(String(200), nullable=True)
    
    # Violation IDs stored as comma-separated string
    selected_violations = Column(String, nullable=False)
    
    # Testing information
    testing_officer = Column(String(200), nullable=True)
    test_results = Column(String, nullable=True)
    date_of_testing = Column(Date, nullable=True)
    
    # Payment amounts
    apprehension_fee = Column(Numeric(10, 2), default=0, server_default='0')
    voluntary_fee = Column(Numeric(10, 2), default=0, server_default='0')
    impound_fee = Column(Numeric(10, 2), default=0, server_default='0')
    driver_amount = Column(Numeric(10, 2), default=0, server_default='0')
    operator_fee = Column(Numeric(10, 2), default=0, server_default='0')
    
    # Totals
    total_undisclosed_amount = Column(Numeric(10, 2), nullable=False)
    grand_total_amount = Column(Numeric(10, 2), nullable=False)
    
    # Payment details
    payment_or_number = Column(String(64), nullable=True)
    date_of_payment = Column(Date, nullable=False)
    
    # Status
    status = Column(String(32), default='pending', server_default="'pending'")  # 'pending', 'paid', 'cancelled'
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
