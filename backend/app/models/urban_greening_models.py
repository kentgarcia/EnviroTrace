# app/models/urban_greening_models.py
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, ForeignKey, Numeric, Text, Index, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func, text
from app.db.database import Base

class InspectionReport(Base):
    __tablename__ = "inspection_reports"
    __table_args__ = (
        Index("idx_urban_greening_inspection_date", "date"),
        Index("idx_urban_greening_inspection_status", "status"),
        Index("idx_urban_greening_inspection_type", "type"),
        {"schema": "urban_greening"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    report_number = Column(String(50), unique=True, nullable=False)
    inspector_name = Column(String(255), nullable=False)
    date = Column(Date, nullable=False)
    location = Column(String(500), nullable=False)
    type = Column(String(50), nullable=False)  # pruning, cutting, violation, maintenance
    status = Column(String(50), nullable=False)  # pending, in-progress, completed, rejected
    findings = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    follow_up_required = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class FeeRecord(Base):
    __tablename__ = "fee_records"
    __table_args__ = (
        Index("idx_urban_greening_fee_date", "date"),
        Index("idx_urban_greening_fee_status", "status"),
        Index("idx_urban_greening_fee_type", "type"),
        {"schema": "urban_greening"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    reference_number = Column(String(50), unique=True, nullable=False)
    type = Column(String(50), nullable=False)  # inspection, cutting_permit, pruning_permit, violation_fine
    amount = Column(Numeric(10, 2), nullable=False)
    payer_name = Column(String(255), nullable=False)
    date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(String(50), nullable=False)  # paid, pending, overdue, cancelled
    or_number = Column(String(50), nullable=True)
    payment_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class TreeRecord(Base):
    __tablename__ = "tree_records"
    __table_args__ = (
        Index("idx_urban_greening_tree_species", "species"),
        Index("idx_urban_greening_tree_condition", "condition"),
        Index("idx_urban_greening_tree_action", "action"),
        {"schema": "urban_greening"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    species = Column(String(100), nullable=False)
    location = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    diameter = Column(Integer, nullable=False)  # in cm
    height = Column(Float, nullable=False)  # in meters
    condition = Column(String(50), nullable=False)  # healthy, diseased, damaged, dead
    action = Column(String(50), nullable=False)  # none, pruning, cutting, treatment
    permit_number = Column(String(50), nullable=True)
    action_date = Column(Date, nullable=True)
    replacement_required = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class SaplingRecord(Base):
    __tablename__ = "sapling_records"
    __table_args__ = (
        Index("idx_urban_greening_sapling_species", "species"),
        Index("idx_urban_greening_sapling_condition", "condition"),
        Index("idx_urban_greening_sapling_source", "source"),
        {"schema": "urban_greening"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    species = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    collection_date = Column(Date, nullable=False)
    source = Column(String(50), nullable=False)  # replacement, donation, purchase, nursery
    condition = Column(String(50), nullable=False)  # excellent, good, fair, poor
    planting_date = Column(Date, nullable=True)
    location = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class UrbanGreeningProject(Base):
    __tablename__ = "urban_greening_projects"
    __table_args__ = (
        Index("idx_urban_greening_project_type", "type"),
        Index("idx_urban_greening_project_status", "status"),
        Index("idx_urban_greening_project_date", "planting_date"),
        {"schema": "urban_greening"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    project_name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # ornamental, trees, seeds, seeds_private
    quantity = Column(Integer, nullable=False)
    species = Column(String(255), nullable=False)
    planting_date = Column(Date, nullable=False)
    location = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String(50), nullable=False)  # planned, planted, maintained, completed
    responsible_person = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
