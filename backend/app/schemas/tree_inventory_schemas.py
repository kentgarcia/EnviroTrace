# app/schemas/tree_inventory_schemas.py
"""Tree Inventory System Schemas"""

from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List
from uuid import UUID


# ==================== Tree Species Schemas ====================

class TreeSpeciesBase(BaseModel):
    scientific_name: Optional[str] = None
    common_name: str  # Required - primary identifier
    local_name: Optional[str] = None
    family: Optional[str] = None
    is_native: bool = False
    is_endangered: bool = False
    description: Optional[str] = None


class TreeSpeciesCreate(TreeSpeciesBase):
    pass


class TreeSpeciesUpdate(BaseModel):
    scientific_name: Optional[str] = None
    common_name: Optional[str] = None
    local_name: Optional[str] = None
    family: Optional[str] = None
    is_native: Optional[bool] = None
    is_endangered: Optional[bool] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class TreeSpeciesResponse(TreeSpeciesBase):
    id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Tree Inventory Schemas ====================

class TreeInventoryBase(BaseModel):
    species: Optional[str] = None  # Scientific name (optional)
    common_name: str  # Required - primary identifier
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    barangay: Optional[str] = None
    status: str = 'alive'  # alive, cut, dead, replaced, unknown
    health: str = 'healthy'  # healthy, needs_attention, diseased, dead, unknown
    height_meters: Optional[float] = None
    diameter_cm: Optional[float] = None
    age_years: Optional[int] = None
    planted_date: Optional[date] = None
    cutting_date: Optional[date] = None
    cutting_reason: Optional[str] = None
    death_date: Optional[date] = None
    death_cause: Optional[str] = None
    managed_by: Optional[str] = None
    contact_person: Optional[str] = None
    contact_number: Optional[str] = None
    cutting_request_id: Optional[UUID] = None
    planting_project_id: Optional[UUID] = None
    replacement_tree_id: Optional[UUID] = None
    photos: Optional[List[str]] = None
    notes: Optional[str] = None


class TreeInventoryCreate(BaseModel):
    tree_code: Optional[str] = None  # Auto-generated if not provided
    species: Optional[str] = None  # Scientific name (optional)
    common_name: str  # Required - primary identifier
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    barangay: Optional[str] = None
    status: str = 'alive'
    health: str = 'healthy'
    height_meters: Optional[float] = None
    diameter_cm: Optional[float] = None
    age_years: Optional[int] = None
    planted_date: Optional[date] = None
    managed_by: Optional[str] = None
    contact_person: Optional[str] = None
    contact_number: Optional[str] = None
    planting_project_id: Optional[UUID] = None
    photos: Optional[List[str]] = []
    notes: Optional[str] = None


class TreeInventoryUpdate(BaseModel):
    tree_code: Optional[str] = None
    species: Optional[str] = None
    common_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    barangay: Optional[str] = None
    status: Optional[str] = None
    health: Optional[str] = None
    height_meters: Optional[float] = None
    diameter_cm: Optional[float] = None
    age_years: Optional[int] = None
    planted_date: Optional[date] = None
    cutting_date: Optional[date] = None
    cutting_reason: Optional[str] = None
    death_date: Optional[date] = None
    death_cause: Optional[str] = None
    managed_by: Optional[str] = None
    contact_person: Optional[str] = None
    contact_number: Optional[str] = None
    cutting_request_id: Optional[UUID] = None
    planting_project_id: Optional[UUID] = None
    replacement_tree_id: Optional[UUID] = None
    photos: Optional[List[str]] = None
    notes: Optional[str] = None


class TreeInventoryInDB(TreeInventoryBase):
    id: UUID
    tree_code: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TreeInventoryResponse(TreeInventoryInDB):
    """Response schema with parsed JSON fields"""
    monitoring_logs_count: Optional[int] = 0
    last_inspection_date: Optional[date] = None
    
    @classmethod
    def from_db_model(cls, db_obj, logs_count: int = 0, last_inspection: Optional[date] = None):
        import json
        photos = []
        if db_obj.photos:
            try:
                photos = json.loads(db_obj.photos) if isinstance(db_obj.photos, str) else db_obj.photos
            except:
                photos = []
        
        return cls(
            id=db_obj.id,
            tree_code=db_obj.tree_code,
            species=db_obj.species,
            common_name=db_obj.common_name,
            latitude=db_obj.latitude,
            longitude=db_obj.longitude,
            address=db_obj.address,
            barangay=db_obj.barangay,
            status=db_obj.status,
            health=db_obj.health,
            height_meters=db_obj.height_meters,
            diameter_cm=db_obj.diameter_cm,
            age_years=db_obj.age_years,
            planted_date=db_obj.planted_date,
            cutting_date=db_obj.cutting_date,
            cutting_reason=db_obj.cutting_reason,
            death_date=db_obj.death_date,
            death_cause=db_obj.death_cause,
            managed_by=db_obj.managed_by,
            contact_person=db_obj.contact_person,
            contact_number=db_obj.contact_number,
            cutting_request_id=db_obj.cutting_request_id,
            planting_project_id=db_obj.planting_project_id,
            replacement_tree_id=db_obj.replacement_tree_id,
            photos=photos,
            notes=db_obj.notes,
            created_at=db_obj.created_at,
            updated_at=db_obj.updated_at,
            monitoring_logs_count=logs_count,
            last_inspection_date=last_inspection
        )


# ==================== Tree Monitoring Log Schemas ====================

class TreeMonitoringLogBase(BaseModel):
    tree_id: UUID
    inspection_date: date
    health_status: str
    height_meters: Optional[float] = None
    diameter_cm: Optional[float] = None
    notes: Optional[str] = None
    inspector_name: str
    photos: Optional[List[str]] = None


class TreeMonitoringLogCreate(BaseModel):
    tree_id: UUID
    inspection_date: date
    health_status: str
    height_meters: Optional[float] = None
    diameter_cm: Optional[float] = None
    notes: Optional[str] = None
    inspector_name: str
    photos: Optional[List[str]] = []


class TreeMonitoringLogInDB(TreeMonitoringLogBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class TreeMonitoringLogResponse(TreeMonitoringLogInDB):
    @classmethod
    def from_db_model(cls, db_obj):
        import json
        photos = []
        if db_obj.photos:
            try:
                photos = json.loads(db_obj.photos) if isinstance(db_obj.photos, str) else db_obj.photos
            except:
                photos = []
        
        return cls(
            id=db_obj.id,
            tree_id=db_obj.tree_id,
            inspection_date=db_obj.inspection_date,
            health_status=db_obj.health_status,
            height_meters=db_obj.height_meters,
            diameter_cm=db_obj.diameter_cm,
            notes=db_obj.notes,
            inspector_name=db_obj.inspector_name,
            photos=photos,
            created_at=db_obj.created_at
        )


# ==================== Planting Project Schemas ====================

class PlantingProjectBase(BaseModel):
    project_name: str
    project_type: str  # replacement, urban_greening, reforestation
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    barangay: Optional[str] = None
    planting_date: Optional[date] = None
    target_trees: Optional[int] = None
    trees_planted: int = 0
    responsible_person: Optional[str] = None
    organization: Optional[str] = None
    contact_number: Optional[str] = None
    status: str = 'planned'
    notes: Optional[str] = None
    photos: Optional[List[str]] = None


class PlantingProjectCreate(BaseModel):
    project_code: Optional[str] = None  # Auto-generated if not provided
    project_name: str
    project_type: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    barangay: Optional[str] = None
    planting_date: Optional[date] = None
    target_trees: Optional[int] = None
    responsible_person: Optional[str] = None
    organization: Optional[str] = None
    contact_number: Optional[str] = None
    status: str = 'planned'
    notes: Optional[str] = None
    photos: Optional[List[str]] = []


class PlantingProjectUpdate(BaseModel):
    project_code: Optional[str] = None
    project_name: Optional[str] = None
    project_type: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    barangay: Optional[str] = None
    planting_date: Optional[date] = None
    target_trees: Optional[int] = None
    trees_planted: Optional[int] = None
    responsible_person: Optional[str] = None
    organization: Optional[str] = None
    contact_number: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    photos: Optional[List[str]] = None


class PlantingProjectInDB(PlantingProjectBase):
    id: UUID
    project_code: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PlantingProjectResponse(PlantingProjectInDB):
    @classmethod
    def from_db_model(cls, db_obj):
        import json
        photos = []
        if db_obj.photos:
            try:
                photos = json.loads(db_obj.photos) if isinstance(db_obj.photos, str) else db_obj.photos
            except:
                photos = []
        
        return cls(
            id=db_obj.id,
            project_code=db_obj.project_code,
            project_name=db_obj.project_name,
            project_type=db_obj.project_type,
            latitude=db_obj.latitude,
            longitude=db_obj.longitude,
            address=db_obj.address,
            barangay=db_obj.barangay,
            planting_date=db_obj.planting_date,
            target_trees=db_obj.target_trees,
            trees_planted=db_obj.trees_planted,
            responsible_person=db_obj.responsible_person,
            organization=db_obj.organization,
            contact_number=db_obj.contact_number,
            status=db_obj.status,
            notes=db_obj.notes,
            photos=photos,
            created_at=db_obj.created_at,
            updated_at=db_obj.updated_at
        )


# ==================== Statistics Schemas ====================

class TreeInventoryStats(BaseModel):
    total_trees: int = 0
    alive_trees: int = 0
    cut_trees: int = 0
    dead_trees: int = 0
    healthy_trees: int = 0
    needs_attention_trees: int = 0
    diseased_trees: int = 0
    trees_planted_this_year: int = 0
    trees_cut_this_year: int = 0
    replacement_ratio: Optional[float] = None
    top_species: Optional[List[dict]] = []
    by_barangay: Optional[List[dict]] = []


class PlantingProjectStats(BaseModel):
    total_projects: int = 0
    planned_projects: int = 0
    ongoing_projects: int = 0
    completed_projects: int = 0
    total_trees_planted: int = 0
    by_type: Optional[List[dict]] = []
