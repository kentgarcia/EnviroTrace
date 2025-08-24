# app/models/urban_greening_models.py
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, Numeric, Text, Index, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func, text
from app.db.database import Base

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
    location = Column(String(500), nullable=True)
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
    location = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String(50), nullable=False)  # planned, planted, maintained, completed
    responsible_person = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class TreeManagementRequest(Base):
    __tablename__ = "tree_management_requests"
    __table_args__ = (
        Index("idx_urban_greening_tree_request_number", "request_number"),
        Index("idx_urban_greening_tree_request_type", "request_type"),
        Index("idx_urban_greening_tree_request_status", "status"),
        Index("idx_urban_greening_tree_request_date", "request_date"),
        {"schema": "urban_greening"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    request_number = Column(String(50), unique=True, nullable=False)
    request_type = Column(String(50), nullable=False)  # pruning, cutting, violation_complaint
    
    # Requester Information (simplified)
    requester_name = Column(String(255), nullable=False)
    property_address = Column(Text, nullable=False)
    
    # Status (limited options)
    status = Column(String(50), nullable=False, default='filed')  # filed, on_hold, for_signature, payment_pending
    request_date = Column(Date, nullable=False)
    
    # Processing Information (connected to Fee Records)
    fee_record_id = Column(UUID(as_uuid=True), nullable=True)  # Reference to fee_records table
    
    # Inspection Information (inline instead of separate reports)
    inspectors = Column(Text, nullable=True)  # JSON array of inspector names
    trees_and_quantities = Column(Text, nullable=True)  # JSON array of "Tree Type: Quantity" entries
    picture_links = Column(Text, nullable=True)  # JSON array of picture URLs for future bucket integration
    
    # Optional fields
    notes = Column(Text, nullable=True)  # General notes
    
    # Link to Monitoring Request (string id from monitoring module)
    monitoring_request_id = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class UrbanGreeningPlanting(Base):
    __tablename__ = "urban_greening_plantings"
    __table_args__ = (
        Index("idx_urban_greening_planting_type", "planting_type"),
        Index("idx_urban_greening_planting_status", "status"),
        Index("idx_urban_greening_planting_date", "planting_date"),
        Index("idx_urban_greening_planting_location", "location"),
        {"schema": "urban_greening"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    record_number = Column(String(50), unique=True, nullable=False)
    planting_type = Column(String(50), nullable=False)  # ornamental_plants, trees, seeds, seeds_private
    species_name = Column(String(255), nullable=False)
    quantity_planted = Column(Integer, nullable=False)
    planting_date = Column(Date, nullable=False)
    location = Column(String(500), nullable=False)
    barangay = Column(String(100), nullable=True)
    coordinates = Column(String(100), nullable=True)  # GPS coordinates
    planting_method = Column(String(100), nullable=True)  # direct_seeding, transplanting, etc.
    # List of plants: JSON array string with items { planting_type, species_name, quantity }
    plants = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default='planted')  # planted, growing, mature, died, removed
    survival_rate = Column(Float, nullable=True)  # percentage
    responsible_person = Column(String(255), nullable=False)
    contact_number = Column(String(50), nullable=True)
    organization = Column(String(255), nullable=True)
    project_name = Column(String(255), nullable=True)
    funding_source = Column(String(255), nullable=True)  # government, private, donation
    maintenance_schedule = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    photos = Column(Text, nullable=True)  # JSON array of photo paths
    # Link to Monitoring Request (string id from monitoring module)
    monitoring_request_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class SaplingCollection(Base):
    __tablename__ = "sapling_collections"
    __table_args__ = (
        Index("idx_urban_greening_sapling_species", "species_name"),
        Index("idx_urban_greening_sapling_status", "status"),
        Index("idx_urban_greening_sapling_collection_date", "collection_date"),
        Index("idx_urban_greening_sapling_purpose", "purpose"),
        {"schema": "urban_greening"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    collection_number = Column(String(50), unique=True, nullable=False)
    species_name = Column(String(255), nullable=False)
    quantity_collected = Column(Integer, nullable=False)
    collection_date = Column(Date, nullable=False)
    collection_location = Column(String(500), nullable=False)
    collector_name = Column(String(255), nullable=False)
    collector_contact = Column(String(50), nullable=True)
    purpose = Column(String(100), nullable=False)  # replacement, reforestation, distribution, nursery
    target_planting_date = Column(Date, nullable=True)
    target_location = Column(String(500), nullable=True)
    nursery_location = Column(String(500), nullable=True)
    status = Column(String(50), nullable=False, default='collected')  # collected, nursery, ready_for_planting, planted, distributed
    health_condition = Column(String(50), nullable=True)  # excellent, good, fair, poor
    size_category = Column(String(50), nullable=True)  # seedling, sapling, juvenile, mature
    survival_rate = Column(Float, nullable=True)  # percentage in nursery
    distribution_date = Column(Date, nullable=True)
    recipient_name = Column(String(255), nullable=True)
    recipient_contact = Column(String(50), nullable=True)
    recipient_address = Column(String(500), nullable=True)
    care_instructions = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    photos = Column(Text, nullable=True)  # JSON array of photo paths
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class SaplingRequest(Base):
    __tablename__ = "sapling_requests"
    __table_args__ = (
        Index("idx_urban_greening_sapling_request_date_received", "date_received"),
        Index("idx_urban_greening_sapling_request_requester", "requester_name"),
        {"schema": "urban_greening"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    date_received = Column(Date, nullable=False)
    requester_name = Column(String(255), nullable=False)
    address = Column(String(500), nullable=False)
    saplings = Column(Text, nullable=False)  # JSON array string: [{ name, qty }]
    
    # Link to Monitoring Request
    monitoring_request_id = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
