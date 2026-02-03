# app/models/urban_greening_models.py
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, Numeric, Text, Index, Float, Computed
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.dialects import postgresql
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
    status = Column(String(50), nullable=False)  # paid, pending, cancelled
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
        Index("idx_urban_greening_project_type", "project_type"),
        Index("idx_urban_greening_project_status", "status"),
        Index("idx_urban_greening_project_code", "project_code"),
        Index(
            "idx_urban_greening_project_code_search",
            "project_code_search",
            postgresql_using="gin",
            postgresql_ops={"project_code_search": "gin_trgm_ops"},
        ),
        Index(
            "idx_urban_greening_project_location_search",
            "location_search",
            postgresql_using="gin",
            postgresql_ops={"location_search": "gin_trgm_ops"},
        ),
        Index(
            "idx_urban_greening_project_barangay_search",
            "barangay_search",
            postgresql_using="gin",
            postgresql_ops={"barangay_search": "gin_trgm_ops"},
        ),
        {"schema": "urban_greening"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    project_code = Column(String(50), unique=True, nullable=True)  # Auto-generated: U+YYYY-####
    project_type = Column(String(50), nullable=False)  # tree_planting, ornamental_planting, reforestation, urban_forest, roadside_greening
    barangay = Column(String(100), nullable=True)
    location = Column(String(500), nullable=True)
    project_code_search = Column(
        String,
        Computed(
            "lower(regexp_replace(coalesce(project_code, ''), '[^a-z0-9]', '', 'gi'))",
            persisted=True,
        ),
    )
    location_search = Column(
        String,
        Computed(
            "lower(regexp_replace(coalesce(location, ''), '[^a-z0-9 ]', '', 'gi'))",
            persisted=True,
        ),
    )
    barangay_search = Column(
        String,
        Computed(
            "lower(regexp_replace(coalesce(barangay, ''), '[^a-z0-9 ]', '', 'gi'))",
            persisted=True,
        ),
    )
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)
    area_sqm = Column(Numeric(10, 2), nullable=True)
    
    # Date planning
    planting_date = Column(Date, nullable=True)  # Legacy field
    planned_start_date = Column(Date, nullable=True)
    planned_end_date = Column(Date, nullable=True)
    actual_start_date = Column(Date, nullable=True)
    actual_end_date = Column(Date, nullable=True)
    
    # New fields
    date_received_of_request = Column(Date, nullable=True)
    date_sapling_received = Column(Date, nullable=True)
    date_of_inspection = Column(Date, nullable=True)
    
    # Location details
    address = Column(Text, nullable=True)
    
    # Plants - JSON array of {plant_type, species, common_name, quantity, unit_cost, source}
    plants = Column(Text, nullable=True)
    total_plants = Column(Integer, nullable=True)
    surviving_plants = Column(Integer, nullable=True)
    survival_rate = Column(Numeric(5, 2), nullable=True)
    
    # Status: planning, procurement, ready, in_progress, completed, cancelled
    status = Column(String(50), nullable=False, default='planning')
    
    # Responsible parties
    project_lead = Column(String(255), nullable=True)
    contact_number = Column(String(50), nullable=True)
    organization = Column(String(255), nullable=True)
    
    # Funding
    funding_source = Column(String(255), nullable=True)
    budget = Column(Numeric(12, 2), nullable=True)
    
    # Additional info
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    photos = Column(Text, nullable=True)  # JSON array
    
    # Linked resources
    linked_cutting_request_id = Column(UUID(as_uuid=True), nullable=True)  # Link to single tree cutting request
    linked_cut_tree_ids = Column(Text, nullable=True)  # JSON array of tree cutting request IDs
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class TreeManagementRequest(Base):
    """DEPRECATED - Use TreeRequest for new implementations"""
    __tablename__ = "tree_management_requests"
    __table_args__ = (
        Index("idx_urban_greening_tree_request_number", "request_number"),
        Index("idx_urban_greening_tree_request_type", "request_type"),
        Index("idx_urban_greening_tree_request_status", "status"),
        Index("idx_urban_greening_tree_request_date", "request_date"),
        Index("idx_tree_management_requests_barangay", "barangay"),
        Index("idx_tree_management_requests_urgency", "urgency"),
        {"schema": "urban_greening"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    request_number = Column(String(50), unique=True, nullable=False)
    request_type = Column(String(50), nullable=False)  # cutting, pruning, violation
    
    # Requester Information
    requester_name = Column(String(255), nullable=False)
    requester_contact = Column(String(100), nullable=True)
    requester_email = Column(String(255), nullable=True)
    property_address = Column(Text, nullable=False)
    barangay = Column(String(100), nullable=True)
    
    # Request Details
    request_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=True)
    urgency = Column(String(50), nullable=False, default='normal')  # low, normal, high, emergency
    
    # Status
    status = Column(String(50), nullable=False, default='filed')  # filed, on_hold, for_signature, payment_pending
    
    # Tree Links
    linked_tree_ids = Column(Text, nullable=True)  # JSON array of tree inventory IDs
    new_trees = Column(Text, nullable=True)  # JSON array of new tree entries
    
    # Processing Information
    fee_record_id = Column(UUID(as_uuid=True), nullable=True)
    
    # Inspection Information (kept for backward compatibility)
    inspectors = Column(Text, nullable=True)  # JSON array of inspector names
    trees_and_quantities = Column(Text, nullable=True)  # JSON array (deprecated, use linked_tree_ids/new_trees)
    picture_links = Column(Text, nullable=True)  # JSON array of picture URLs
    
    # Notes
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class TreeRequestProcessingStandards(Base):
    """Configurable processing timeframes for each phase of tree requests"""
    __tablename__ = "tree_request_processing_standards"
    __table_args__ = {"schema": "urban_greening"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    request_type = Column(String(50), nullable=False, unique=True)  # cutting, pruning, ball_out
    receiving_standard_days = Column(Integer, nullable=False, default=3)
    inspection_standard_days = Column(Integer, nullable=False, default=7)
    requirements_standard_days = Column(Integer, nullable=False, default=10)
    clearance_standard_days = Column(Integer, nullable=False, default=5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class TreeRequestDropdownOption(Base):
    """Configurable dropdown options for tree request fields"""
    __tablename__ = "tree_request_dropdown_options"
    __table_args__ = (
        Index("idx_dropdown_option_field", "field_name"),
        {"schema": "urban_greening"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    field_name = Column(String(100), nullable=False)  # 'received_through' or 'status'
    option_value = Column(String(255), nullable=False)
    display_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class TreeRequest(Base):
    """New ISO-compliant tree request tracking system with 4 phases"""
    __tablename__ = "tree_requests"
    __table_args__ = (
        Index("idx_tree_request_number", "request_number"),
        Index("idx_tree_request_type", "request_type"),
        Index("idx_tree_request_status", "overall_status"),
        {"schema": "urban_greening"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    request_number = Column(String(50), unique=True, nullable=False)
    request_type = Column(String(50), nullable=False)  # cutting, pruning, ball_out
    overall_status = Column(String(50), nullable=False, default='receiving')  # receiving, inspection, requirements, clearance, completed, cancelled
    is_archived = Column(Boolean, nullable=False, default=False)
    
    # ===== PHASE 1: RECEIVING =====
    receiving_date_received = Column(Date, nullable=True)
    receiving_month = Column(String(20), nullable=True)  # Month name
    receiving_received_through = Column(String(100), nullable=True)  # Dropdown options + "Other"
    receiving_date_received_by_dept_head = Column(Date, nullable=True)
    receiving_name = Column(String(255), nullable=True)
    receiving_address = Column(Text, nullable=True)
    receiving_contact = Column(String(100), nullable=True)  # Contact Number/Email
    receiving_request_status = Column(String(100), nullable=True)
    
    # ===== PHASE 2: INSPECTION =====
    inspection_date_received_by_inspectors = Column(Date, nullable=True)  # Request Letter
    inspection_date_of_inspection = Column(Date, nullable=True)
    inspection_month = Column(String(20), nullable=True)  # Month name
    inspection_proponent_present = Column(String(255), nullable=True)  # Name of Proponent Present
    inspection_date_submitted_to_dept_head = Column(Date, nullable=True)  # Inspection Report
    inspection_date_released_to_inspectors = Column(Date, nullable=True)  # Inspection Report
    inspection_report_control_number = Column(String(50), nullable=True)
    inspection_remarks = Column(Text, nullable=True)  # Inspection Remarks
    
    # ===== PHASE 3: REQUIREMENTS =====
    # JSON array of {requirement_name, is_checked, date_submitted}
    requirements_checklist = Column(Text, nullable=True)  # JSON: [{name: "Application Letter", checked: true, date: "2025-01-01"}, ...]
    requirements_remarks = Column(Text, nullable=True)  # Remarks and Recommendations
    requirements_status = Column(String(100), nullable=True)
    requirements_date_completion = Column(Date, nullable=True)  # Date of Completion Requirements
    
    # ===== PHASE 4: CLEARANCE =====
    clearance_date_issued = Column(Date, nullable=True)
    clearance_date_of_payment = Column(Date, nullable=True)
    clearance_control_number = Column(String(50), nullable=True)
    clearance_or_number = Column(String(50), nullable=True)  # OR Number
    clearance_date_received = Column(Date, nullable=True)
    clearance_status = Column(String(100), nullable=True)
    
    # ===== PHASE 5: DENR (if letter only) =====
    denr_date_received_by_inspectors = Column(Date, nullable=True)
    denr_date_submitted_to_dept_head = Column(Date, nullable=True)
    denr_date_released_to_inspectors = Column(Date, nullable=True)
    denr_date_received = Column(Date, nullable=True)
    denr_status = Column(String(100), nullable=True)
    
    # ===== AUDIT TRACKING =====
    created_by = Column(UUID(as_uuid=True), nullable=True)  # FK to users table
    editors = Column(postgresql.JSONB, nullable=True)  # JSONB array of user IDs who edited the request
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class UrbanGreeningPlanting(Base):
    __tablename__ = "urban_greening_plantings"
    __table_args__ = (
        Index("idx_urban_greening_planting_type", "planting_type"),
        Index("idx_urban_greening_planting_status", "status"),
        Index("idx_urban_greening_planting_date", "planting_date"),
        Index("idx_urban_greening_planting_location", "location"),
        Index(
            "idx_urban_greening_planting_record_search",
            "record_number_search",
            postgresql_using="gin",
            postgresql_ops={"record_number_search": "gin_trgm_ops"},
        ),
        Index(
            "idx_urban_greening_planting_species_search",
            "species_name_search",
            postgresql_using="gin",
            postgresql_ops={"species_name_search": "gin_trgm_ops"},
        ),
        Index(
            "idx_urban_greening_planting_location_search",
            "location_search",
            postgresql_using="gin",
            postgresql_ops={"location_search": "gin_trgm_ops"},
        ),
        Index(
            "idx_urban_greening_planting_responsible_search",
            "responsible_person_search",
            postgresql_using="gin",
            postgresql_ops={"responsible_person_search": "gin_trgm_ops"},
        ),
        Index(
            "idx_urban_greening_planting_organization_search",
            "organization_search",
            postgresql_using="gin",
            postgresql_ops={"organization_search": "gin_trgm_ops"},
        ),
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
    record_number_search = Column(
        String,
        Computed(
            "lower(regexp_replace(coalesce(record_number, ''), '[^a-z0-9]', '', 'gi'))",
            persisted=True,
        ),
    )
    species_name_search = Column(
        String,
        Computed(
            "lower(regexp_replace(coalesce(species_name, ''), '[^a-z0-9 ]', '', 'gi'))",
            persisted=True,
        ),
    )
    location_search = Column(
        String,
        Computed(
            "lower(regexp_replace(coalesce(location, ''), '[^a-z0-9 ]', '', 'gi'))",
            persisted=True,
        ),
    )
    responsible_person_search = Column(
        String,
        Computed(
            "lower(regexp_replace(coalesce(responsible_person, ''), '[^a-z0-9 ]', '', 'gi'))",
            persisted=True,
        ),
    )
    organization_search = Column(
        String,
        Computed(
            "lower(regexp_replace(coalesce(organization, ''), '[^a-z0-9 ]', '', 'gi'))",
            persisted=True,
        ),
    )
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
    requester_name_search = Column(
        String,
        Computed(
            "lower(regexp_replace(coalesce(requester_name, ''), '[^a-z0-9 ]', '', 'gi'))",
            persisted=True,
        ),
    )
    address_search = Column(
        String,
        Computed(
            "lower(regexp_replace(coalesce(address, ''), '[^a-z0-9 ]', '', 'gi'))",
            persisted=True,
        ),
    )
    
    # New fields
    received_through = Column(String(255), nullable=True)
    status = Column(String(50), nullable=True)
    date_donated = Column(Date, nullable=True)
    total_qty = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
