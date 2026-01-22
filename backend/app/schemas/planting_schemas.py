from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

# Urban Greening Planting Schemas
class UrbanGreeningPlantingBase(BaseModel):
    planting_type: str = Field(..., description="Type of planting: ornamental_plants, trees, seeds, seeds_private")
    species_name: str = Field(..., description="Name of the plant/tree species")
    quantity_planted: int = Field(..., gt=0, description="Number of plants/trees planted")
    planting_date: date = Field(..., description="Date when planting occurred")
    location: Optional[str] = Field(None, description="Location where planting took place")
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
    monitoring_request_id: Optional[str] = None
    # Optional structured list of plants; when provided, top-level planting_type/species_name/quantity_planted
    # should mirror the first item for backward compatibility
    plants: Optional[List[dict]] = Field(
        default=None,
        description="List of plants with fields: planting_type, species_name, quantity",
    )

    # Accept both list and JSON string for plants and normalize to list
    @field_validator("plants", mode="before")
    @classmethod
    def parse_plants(cls, v):
        if v is None or isinstance(v, list):
            return v
        if isinstance(v, str):
            import json
            try:
                data = json.loads(v)
                return data if isinstance(data, list) else None
            except Exception:
                return None
        # Any other type -> None
        return None

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
    monitoring_request_id: Optional[str] = None
    plants: Optional[List[dict]] = None

    # Accept both list and JSON string for plants and normalize to list
    @field_validator("plants", mode="before")
    @classmethod
    def parse_plants(cls, v):
        if v is None or isinstance(v, list):
            return v
        if isinstance(v, str):
            import json
            try:
                data = json.loads(v)
                return data if isinstance(data, list) else None
            except Exception:
                return None
        return None

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

# Sapling Request Schemas
class SaplingItem(BaseModel):
    name: str
    qty: int
    plant_type: Optional[str] = None

class SaplingRequestBase(BaseModel):
    date_received: date
    requester_name: str
    address: str
    saplings: list[SaplingItem]
    received_through: Optional[str] = None
    status: Optional[str] = None
    date_donated: Optional[date] = None
    total_qty: Optional[int] = 0

    # Accept both list of objects, list of legacy strings ("Name: N") or JSON string
    @field_validator("saplings", mode="before")
    @classmethod
    def parse_saplings(cls, v):
        # None -> empty list
        if v is None:
            return []
        # Already a list -> normalize items below
        if isinstance(v, list):
            raw_items = v
        elif isinstance(v, str):
            # Try to parse JSON string
            import json
            try:
                parsed = json.loads(v)
                raw_items = parsed if isinstance(parsed, list) else []
            except Exception:
                # Not JSON: treat as single legacy string entry
                raw_items = [v]
        else:
            # Unknown types -> empty
            raw_items = []

        normalized = []
        for it in raw_items:
            if isinstance(it, dict):
                name = it.get("name") or it.get("species") or it.get("species_name") or ""
                qty = it.get("qty") or it.get("quantity") or 1
                try:
                    qty = int(qty)
                except Exception:
                    qty = 1
                normalized.append({"name": name, "qty": qty})
                continue
            if isinstance(it, str):
                import re
                m = re.match(r"^(?P<name>.+?):\s*(?P<qty>\d+)$", it.strip())
                if m:
                    normalized.append({"name": m.group("name").strip(), "qty": int(m.group("qty"))})
                else:
                    normalized.append({"name": it.strip(), "qty": 1})
                continue
            # Fallback
            try:
                normalized.append({"name": str(it), "qty": 1, "plant_type": None})
            except Exception:
                normalized.append({"name": "", "qty": 1, "plant_type": None})

        return normalized

class SaplingRequestCreate(SaplingRequestBase):
    pass

class SaplingRequestUpdate(BaseModel):
    date_received: Optional[date] = None
    requester_name: Optional[str] = None
    address: Optional[str] = None
    saplings: Optional[list[SaplingItem]] = None
    received_through: Optional[str] = None
    status: Optional[str] = None
    date_donated: Optional[date] = None
    total_qty: Optional[int] = None

    @field_validator("saplings", mode="before")
    @classmethod
    def parse_saplings_update(cls, v):
        # Reuse parser from create: accept same formats
        if v is None:
            return None
        # Leverage the create parser logic by instantiating SaplingRequestBase validator
        # Simpler: duplicate minimal parsing
        if isinstance(v, list):
            raw_items = v
        elif isinstance(v, str):
            import json
            try:
                parsed = json.loads(v)
                raw_items = parsed if isinstance(parsed, list) else [v]
            except Exception:
                raw_items = [v]
        else:
            raw_items = []

        normalized = []
        for it in raw_items:
            if isinstance(it, dict):
                name = it.get("name") or it.get("species") or it.get("species_name") or ""
                qty = it.get("qty") or it.get("quantity") or 1
                plant_type = it.get("plant_type")
                # Convert empty string to None for consistency
                if plant_type == "":
                    plant_type = None
                try:
                    qty = int(qty)
                except Exception:
                    qty = 1
                normalized.append({"name": name, "qty": qty, "plant_type": plant_type})
                continue
            if isinstance(it, str):
                import re
                m = re.match(r"^(?P<name>.+?):\s*(?P<qty>\d+)$", it.strip())
                if m:
                    normalized.append({"name": m.group("name").strip(), "qty": int(m.group("qty")), "plant_type": None})
                else:
                    normalized.append({"name": it.strip(), "qty": 1, "plant_type": None})
                continue
            try:
                normalized.append({"name": str(it), "qty": 1, "plant_type": None})
            except Exception:
                normalized.append({"name": "", "qty": 1, "plant_type": None})

        return normalized

class SaplingRequestInDB(SaplingRequestBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
