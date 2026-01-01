from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

# Plant Types and Project Types
class ProjectPlant(BaseModel):
    plant_type: str  # tree, ornamental, ornamental_private, seeds, seeds_private, other
    species: Optional[str] = None
    common_name: str
    quantity: int

class UrbanGreeningProjectBase(BaseModel):
    project_type: str = "new_greening"  # replacement, new_greening, reforestation, beautification, other
    status: str = "planning"  # planning, procurement, ready, in_progress, completed, cancelled
    location: str
    barangay: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area_sqm: Optional[float] = None
    planned_start_date: Optional[date] = None
    planned_end_date: Optional[date] = None
    actual_start_date: Optional[date] = None
    actual_end_date: Optional[date] = None
    planting_date: Optional[date] = None  # Legacy field, now optional
    linked_cutting_request_id: Optional[str] = None
    linked_cut_tree_ids: Optional[List[str]] = None
    plants: List[ProjectPlant] = Field(default_factory=list)
    project_lead: Optional[str] = None
    contact_number: Optional[str] = None
    organization: Optional[str] = None
    funding_source: Optional[str] = None
    budget: Optional[float] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    photos: Optional[List[str]] = None

    @field_validator("plants", mode="before")
    @classmethod
    def parse_plants(cls, v):
        if v is None:
            return []
        if isinstance(v, str):
            import json
            try:
                return json.loads(v)
            except Exception:
                return []
        return v

    @field_validator("linked_cut_tree_ids", mode="before")
    @classmethod
    def parse_linked_cut_tree_ids(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            import json
            try:
                return json.loads(v)
            except Exception:
                return None
        return v

    @field_validator("photos", mode="before")
    @classmethod
    def parse_photos(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            import json
            try:
                return json.loads(v)
            except Exception:
                return None
        return v

    @field_validator("planned_start_date", "planned_end_date", "actual_start_date", "actual_end_date", "planting_date", mode="before")
    @classmethod
    def parse_dates(cls, v):
        """Convert empty strings to None for optional date fields"""
        if v == "" or v is None:
            return None
        return v

class UrbanGreeningProjectCreate(UrbanGreeningProjectBase):
    pass

class UrbanGreeningProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    barangay: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area_sqm: Optional[float] = None
    planned_start_date: Optional[date] = None
    planned_end_date: Optional[date] = None
    actual_start_date: Optional[date] = None
    actual_end_date: Optional[date] = None
    planting_date: Optional[date] = None
    plants: Optional[List[ProjectPlant]] = None
    project_lead: Optional[str] = None
    contact_number: Optional[str] = None
    organization: Optional[str] = None
    funding_source: Optional[str] = None
    budget: Optional[float] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    photos: Optional[List[str]] = None

    @field_validator("plants", mode="before")
    @classmethod
    def parse_plants(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            import json
            try:
                return json.loads(v)
            except Exception:
                return None
        return v

    @field_validator("planned_start_date", "planned_end_date", "actual_start_date", "actual_end_date", "planting_date", mode="before")
    @classmethod
    def parse_dates(cls, v):
        """Convert empty strings to None for optional date fields"""
        if v == "" or v is None:
            return None
        return v

class UrbanGreeningProjectInDB(UrbanGreeningProjectBase):
    id: UUID
    project_code: Optional[str] = None
    total_plants: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProjectStats(BaseModel):
    total_projects: int
    active_projects: int
    completed_projects: int
    total_plants_planned: int
    total_plants_planted: int
    survival_rate: float
    by_type: List[dict]
    by_status: List[dict]
    recent_plantings: int
