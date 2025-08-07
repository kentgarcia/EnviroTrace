from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from uuid import UUID

# Urban Greening Planting Schemas
class UrbanGreeningPlantingBase(BaseModel):
    planting_type: str = Field(..., description="Type of planting: ornamental_plants, trees, seeds, seeds_private")
    species_name: str = Field(..., description="Name of the plant/tree species")
    quantity_planted: int = Field(..., gt=0, description="Number of plants/trees planted")
    planting_date: date = Field(..., description="Date when planting occurred")
    location: str = Field(..., description="Location where planting took place")
    barangay: Optional[str] = Field(None, description="Barangay where planting occurred")
    coordinates: Optional[str] = Field(None, description="GPS coordinates")
    planting_method: Optional[str] = Field(None, description="Method used for planting")
    status: str = Field(default="planted", description="Current status of the plants")
    survival_rate: Optional[float] = Field(None, ge=0, le=100, description="Survival rate percentage")
    responsible_person: str = Field(..., description="Person responsible for the planting")
    contact_number: Optional[str] = Field(None, description="Contact number of responsible person")
    organization: Optional[str] = Field(None, description="Organization involved")
    project_name: Optional[str] = Field(None, description="Name of the planting project")
    funding_source: Optional[str] = Field(None, description="Source of funding")
    maintenance_schedule: Optional[str] = Field(None, description="Maintenance schedule details")
    notes: Optional[str] = Field(None, description="Additional notes")
    photos: Optional[str] = Field(None, description="JSON array of photo paths")

class UrbanGreeningPlantingCreate(UrbanGreeningPlantingBase):
    pass

class UrbanGreeningPlantingUpdate(BaseModel):
    planting_type: Optional[str] = None
    species_name: Optional[str] = None
    quantity_planted: Optional[int] = Field(None, gt=0)
    planting_date: Optional[date] = None
    location: Optional[str] = None
    barangay: Optional[str] = None
    coordinates: Optional[str] = None
    planting_method: Optional[str] = None
    status: Optional[str] = None
    survival_rate: Optional[float] = Field(None, ge=0, le=100)
    responsible_person: Optional[str] = None
    contact_number: Optional[str] = None
    organization: Optional[str] = None
    project_name: Optional[str] = None
    funding_source: Optional[str] = None
    maintenance_schedule: Optional[str] = None
    notes: Optional[str] = None
    photos: Optional[str] = None

class UrbanGreeningPlantingInDB(UrbanGreeningPlantingBase):
    id: UUID
    record_number: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Sapling Collection Schemas
class SaplingCollectionBase(BaseModel):
    species_name: str = Field(..., description="Name of the tree/plant species")
    quantity_collected: int = Field(..., gt=0, description="Number of saplings collected")
    collection_date: date = Field(..., description="Date when collection occurred")
    collection_location: str = Field(..., description="Location where saplings were collected")
    collector_name: str = Field(..., description="Name of the person who collected")
    collector_contact: Optional[str] = Field(None, description="Contact number of collector")
    purpose: str = Field(..., description="Purpose: replacement, reforestation, distribution, nursery")
    target_planting_date: Optional[date] = Field(None, description="Planned planting date")
    target_location: Optional[str] = Field(None, description="Planned planting location")
    nursery_location: Optional[str] = Field(None, description="Nursery location if applicable")
    status: str = Field(default="collected", description="Current status of saplings")
    health_condition: Optional[str] = Field(None, description="Health condition: excellent, good, fair, poor")
    size_category: Optional[str] = Field(None, description="Size: seedling, sapling, juvenile, mature")
    survival_rate: Optional[float] = Field(None, ge=0, le=100, description="Survival rate in nursery")
    distribution_date: Optional[date] = Field(None, description="Date when distributed")
    recipient_name: Optional[str] = Field(None, description="Name of recipient")
    recipient_contact: Optional[str] = Field(None, description="Contact of recipient")
    recipient_address: Optional[str] = Field(None, description="Address of recipient")
    care_instructions: Optional[str] = Field(None, description="Care instructions provided")
    notes: Optional[str] = Field(None, description="Additional notes")
    photos: Optional[str] = Field(None, description="JSON array of photo paths")

class SaplingCollectionCreate(SaplingCollectionBase):
    pass

class SaplingCollectionUpdate(BaseModel):
    species_name: Optional[str] = None
    quantity_collected: Optional[int] = Field(None, gt=0)
    collection_date: Optional[date] = None
    collection_location: Optional[str] = None
    collector_name: Optional[str] = None
    collector_contact: Optional[str] = None
    purpose: Optional[str] = None
    target_planting_date: Optional[date] = None
    target_location: Optional[str] = None
    nursery_location: Optional[str] = None
    status: Optional[str] = None
    health_condition: Optional[str] = None
    size_category: Optional[str] = None
    survival_rate: Optional[float] = Field(None, ge=0, le=100)
    distribution_date: Optional[date] = None
    recipient_name: Optional[str] = None
    recipient_contact: Optional[str] = None
    recipient_address: Optional[str] = None
    care_instructions: Optional[str] = None
    notes: Optional[str] = None
    photos: Optional[str] = None

class SaplingCollectionInDB(SaplingCollectionBase):
    id: UUID
    collection_number: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Statistics and Summary Schemas
class PlantingStatistics(BaseModel):
    total_plantings: int
    total_quantity: int
    by_type: dict
    by_status: dict
    by_month: dict

class SaplingStatistics(BaseModel):
    total_collections: int
    total_quantity: int
    by_species: dict
    by_purpose: dict
    by_status: dict
    survival_rate_avg: Optional[float]
