# app/models/tree_inventory_models.py
"""Tree Inventory System Models - Unified tree lifecycle tracking"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, Float, Text, Index, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func, text
from sqlalchemy.orm import relationship
from app.db.database import Base


class TreeSpecies(Base):
    """Lookup table for tree species"""
    __tablename__ = "tree_species"
    __table_args__ = (
        Index("idx_tree_species_scientific", "scientific_name"),
        Index("idx_tree_species_common", "common_name"),
        Index("idx_tree_species_active", "is_active"),
        Index("idx_tree_species_type", "species_type"),
        {"schema": "urban_greening"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    scientific_name = Column(String(150), nullable=True)  # Optional - not all species have scientific names
    common_name = Column(String(150), nullable=False)  # Required - primary identifier
    local_name = Column(String(150), nullable=True)
    family = Column(String(100), nullable=True)
    species_type = Column(String(50), nullable=False, default='Tree', comment="Type of species: Tree, Ornamental, Seed, Other")
    is_native = Column(Boolean, default=False, nullable=False)
    is_endangered = Column(Boolean, default=False, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Physical / Growth Fields
    wood_density_min = Column(Float, nullable=True, comment="Minimum wood density in g/cm³")
    wood_density_max = Column(Float, nullable=True, comment="Maximum wood density in g/cm³")
    wood_density_avg = Column(Float, nullable=True, comment="Average wood density in g/cm³")
    
    avg_mature_height_min_m = Column(Float, nullable=True, comment="Minimum mature height in meters")
    avg_mature_height_max_m = Column(Float, nullable=True, comment="Maximum mature height in meters")
    avg_mature_height_avg_m = Column(Float, nullable=True, comment="Average mature height in meters")
    
    avg_trunk_diameter_min_cm = Column(Float, nullable=True, comment="Minimum trunk diameter at DBH in cm")
    avg_trunk_diameter_max_cm = Column(Float, nullable=True, comment="Maximum trunk diameter at DBH in cm")
    avg_trunk_diameter_avg_cm = Column(Float, nullable=True, comment="Average trunk diameter at DBH in cm")
    
    growth_rate_m_per_year = Column(Float, nullable=True, comment="Representative growth rate in m/year")
    growth_speed_label = Column(String(50), nullable=True, comment="Slow / Moderate / Fast")
    
    # Carbon / CO2 Fields
    co2_absorbed_kg_per_year = Column(Float, nullable=True, comment="CO2 absorbed per year in kg")
    co2_stored_mature_min_kg = Column(Float, nullable=True, comment="Minimum CO2 stored at maturity in kg")
    co2_stored_mature_max_kg = Column(Float, nullable=True, comment="Maximum CO2 stored at maturity in kg")
    co2_stored_mature_avg_kg = Column(Float, nullable=True, comment="Average CO2 stored at maturity in kg")
    carbon_fraction = Column(Float, nullable=True, comment="Biomass to carbon fraction")
    
    # Removal Impact Factors
    decay_years_min = Column(Integer, nullable=True, comment="Minimum decay years after removal")
    decay_years_max = Column(Integer, nullable=True, comment="Maximum decay years after removal")
    lumber_carbon_retention_pct = Column(Float, nullable=True, comment="Carbon retention as lumber (0-1)")
    burned_carbon_release_pct = Column(Float, nullable=True, comment="Carbon released when burned (0-1)")
    
    notes = Column(Text, nullable=True, comment="Additional notes about this species")


class TreeInventory(Base):
    """Main tree inventory - tracks every tree in the system"""
    __tablename__ = "tree_inventory"
    __table_args__ = (
        Index("idx_tree_inventory_code", "tree_code", unique=True),
        Index("idx_tree_inventory_species", "species"),
        Index("idx_tree_inventory_status", "status"),
        Index("idx_tree_inventory_health", "health"),
        Index("idx_tree_inventory_barangay", "barangay"),
        Index("idx_tree_inventory_location", "latitude", "longitude"),
        Index("idx_tree_inventory_archived", "is_archived"),
        {"schema": "urban_greening"}
    )

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    
    # Identity
    tree_code = Column(String(50), unique=True, nullable=False)  # 2024-0001
    species = Column(String(100), nullable=False)
    common_name = Column(String(100), nullable=True)
    
    # Location
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(Text, nullable=True)
    barangay = Column(String(100), nullable=True)
    
    # Current Status
    status = Column(String(50), nullable=False, default='alive')  # alive, cut, dead, replaced
    health = Column(String(50), nullable=False, default='healthy')  # healthy, needs_attention, diseased, dead
    is_archived = Column(Boolean, nullable=False, default=False, server_default=text("false"))
    archived_at = Column(DateTime(timezone=True), nullable=True)
    
    # Physical Characteristics
    height_meters = Column(Float, nullable=True)
    diameter_cm = Column(Float, nullable=True)
    age_years = Column(Integer, nullable=True)
    
    # Lifecycle
    planted_date = Column(Date, nullable=True)
    cutting_date = Column(Date, nullable=True)
    cutting_reason = Column(String(255), nullable=True)
    death_date = Column(Date, nullable=True)
    death_cause = Column(String(255), nullable=True)
    
    # Management
    managed_by = Column(String(100), nullable=True)  # DENR, Barangay, Private
    contact_person = Column(String(100), nullable=True)
    contact_number = Column(String(50), nullable=True)
    
    # Links
    cutting_request_id = Column(UUID(as_uuid=True), nullable=True)
    planting_project_id = Column(UUID(as_uuid=True), ForeignKey('urban_greening.planting_projects.id'), nullable=True)
    replacement_tree_id = Column(UUID(as_uuid=True), ForeignKey('urban_greening.tree_inventory.id'), nullable=True)
    
    # Photos & Notes
    photos = Column(Text, nullable=True)  # JSON array of URLs
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    monitoring_logs = relationship("TreeMonitoringLog", back_populates="tree", cascade="all, delete-orphan")
    replacement_tree = relationship("TreeInventory", remote_side=[id], foreign_keys=[replacement_tree_id])


class TreeMonitoringLog(Base):
    """Health inspection logs for trees"""
    __tablename__ = "tree_monitoring_logs"
    __table_args__ = (
        Index("idx_tree_monitoring_tree_id", "tree_id"),
        Index("idx_tree_monitoring_date", "inspection_date"),
        {"schema": "urban_greening"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    tree_id = Column(UUID(as_uuid=True), ForeignKey('urban_greening.tree_inventory.id', ondelete='CASCADE'), nullable=False)
    inspection_date = Column(Date, nullable=False)
    health_status = Column(String(50), nullable=False)  # healthy, needs_attention, diseased, dead
    height_meters = Column(Float, nullable=True)
    diameter_cm = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    inspector_name = Column(String(100), nullable=False)
    photos = Column(Text, nullable=True)  # JSON array
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    tree = relationship("TreeInventory", back_populates="monitoring_logs")


class PlantingProject(Base):
    """Planting projects - urban greening, replacement, reforestation"""
    __tablename__ = "planting_projects"
    __table_args__ = (
        Index("idx_planting_project_code", "project_code", unique=True),
        Index("idx_planting_project_type", "project_type"),
        Index("idx_planting_project_status", "status"),
        Index("idx_planting_project_date", "planting_date"),
        {"schema": "urban_greening"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    project_code = Column(String(50), unique=True, nullable=False)  # PRJ-2024-000001
    project_name = Column(String(255), nullable=False)
    project_type = Column(String(50), nullable=False)  # replacement, urban_greening, reforestation
    
    # Location
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(Text, nullable=True)
    barangay = Column(String(100), nullable=True)
    
    # Details
    planting_date = Column(Date, nullable=True)
    target_trees = Column(Integer, nullable=True)
    trees_planted = Column(Integer, default=0, nullable=False)
    
    # Responsible Party
    responsible_person = Column(String(100), nullable=True)
    organization = Column(String(255), nullable=True)
    contact_number = Column(String(50), nullable=True)
    
    # Status
    status = Column(String(50), nullable=False, default='planned')  # planned, ongoing, completed, cancelled
    
    # Notes & Photos
    notes = Column(Text, nullable=True)
    photos = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    trees = relationship("TreeInventory", backref="planting_project", foreign_keys=[TreeInventory.planting_project_id])
