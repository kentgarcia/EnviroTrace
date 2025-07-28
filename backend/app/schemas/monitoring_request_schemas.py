from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import date

class Location(BaseModel):
    lat: float
    lng: float

class MonitoringRequestBase(BaseModel):
    title: str
    requester_name: str
    status: str
    date: date
    location: Location
    address: str
    description: Optional[str] = None

class MonitoringRequestCreate(MonitoringRequestBase):
    pass

class MonitoringRequestUpdate(MonitoringRequestBase):
    pass

class MonitoringRequestInDBBase(MonitoringRequestBase):
    id: str
    class Config:
        orm_mode = True

class MonitoringRequest(MonitoringRequestInDBBase):
    pass

class MonitoringRequestList(BaseModel):
    requests: List[MonitoringRequest]
