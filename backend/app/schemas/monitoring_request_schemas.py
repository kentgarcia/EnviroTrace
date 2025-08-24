from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import date as Date

class Location(BaseModel):
    lat: float
    lng: float

class MonitoringRequestBase(BaseModel):
    # Keep only the essentials required by your intent
    status: str
    location: Location
    # Optional metadata fields for compatibility
    title: Optional[str] = None
    requester_name: Optional[str] = None
    date: Optional[Date] = None
    address: Optional[str] = None
    description: Optional[str] = None
    source_type: Optional[str] = None  # 'urban_greening' or 'tree_management'

class MonitoringRequestCreate(MonitoringRequestBase):
    pass

class MonitoringRequestUpdate(MonitoringRequestBase):
    pass

class MonitoringRequestInDBBase(MonitoringRequestBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class MonitoringRequest(MonitoringRequestInDBBase):
    pass

class MonitoringRequestList(BaseModel):
    requests: List[MonitoringRequest]

class MonitoringRequestListResponse(BaseModel):
    reports: List[MonitoringRequest]
    total: int
