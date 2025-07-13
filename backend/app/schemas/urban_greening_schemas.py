# app/schemas/urban_greening_schemas.py
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, UUID4

# InspectionReport schemas
class InspectionReportBase(BaseModel):
    report_number: str
    inspector_name: str
    date: date
    location: str
    type: str
    status: str
    findings: Optional[str] = None
    recommendations: Optional[str] = None
    follow_up_required: bool = False

class InspectionReportCreate(InspectionReportBase):
    pass

class InspectionReportUpdate(BaseModel):
    report_number: Optional[str] = None
    inspector_name: Optional[str] = None
    date: Optional[date] = None
    location: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    findings: Optional[str] = None
    recommendations: Optional[str] = None
    follow_up_required: Optional[bool] = None

class InspectionReportInDB(InspectionReportBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InspectionReport(InspectionReportInDB):
    pass

# FeeRecord schemas
class FeeRecordBase(BaseModel):
    reference_number: str
    type: str
    amount: float
    payer_name: str
    date: date
    due_date: date
    status: str
    or_number: Optional[str] = None
    payment_date: Optional[date] = None

class FeeRecordCreate(FeeRecordBase):
    pass

class FeeRecordUpdate(BaseModel):
    reference_number: Optional[str] = None
    type: Optional[str] = None
    amount: Optional[float] = None
    payer_name: Optional[str] = None
    date: Optional[date] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    or_number: Optional[str] = None
    payment_date: Optional[date] = None

class FeeRecordInDB(FeeRecordBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FeeRecord(FeeRecordInDB):
    pass

# TreeRecord schemas
class TreeRecordBase(BaseModel):
    species: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    diameter: int
    height: float
    condition: str
    action: str
    permit_number: Optional[str] = None
    action_date: Optional[date] = None
    replacement_required: bool = False

class TreeRecordCreate(TreeRecordBase):
    pass

class TreeRecordUpdate(BaseModel):
    species: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    diameter: Optional[int] = None
    height: Optional[float] = None
    condition: Optional[str] = None
    action: Optional[str] = None
    permit_number: Optional[str] = None
    action_date: Optional[date] = None
    replacement_required: Optional[bool] = None

class TreeRecordInDB(TreeRecordBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TreeRecord(TreeRecordInDB):
    pass

# SaplingRecord schemas
class SaplingRecordBase(BaseModel):
    species: str
    quantity: int
    collection_date: date
    source: str
    condition: str
    planting_date: Optional[date] = None
    location: Optional[str] = None
    notes: Optional[str] = None

class SaplingRecordCreate(SaplingRecordBase):
    pass

class SaplingRecordUpdate(BaseModel):
    species: Optional[str] = None
    quantity: Optional[int] = None
    collection_date: Optional[date] = None
    source: Optional[str] = None
    condition: Optional[str] = None
    planting_date: Optional[date] = None
    location: Optional[str] = None
    notes: Optional[str] = None

class SaplingRecordInDB(SaplingRecordBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SaplingRecord(SaplingRecordInDB):
    pass

# UrbanGreeningProject schemas
class UrbanGreeningProjectBase(BaseModel):
    project_name: str
    type: str
    quantity: int
    species: str
    planting_date: date
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str
    responsible_person: Optional[str] = None
    notes: Optional[str] = None

class UrbanGreeningProjectCreate(UrbanGreeningProjectBase):
    pass

class UrbanGreeningProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    type: Optional[str] = None
    quantity: Optional[int] = None
    species: Optional[str] = None
    planting_date: Optional[date] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = None
    responsible_person: Optional[str] = None
    notes: Optional[str] = None

class UrbanGreeningProjectInDB(UrbanGreeningProjectBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UrbanGreeningProject(UrbanGreeningProjectInDB):
    pass

# Response models
class InspectionReportListResponse(BaseModel):
    reports: List[InspectionReport]
    total: int

class FeeRecordListResponse(BaseModel):
    records: List[FeeRecord]
    total: int

class TreeRecordListResponse(BaseModel):
    records: List[TreeRecord]
    total: int

class SaplingRecordListResponse(BaseModel):
    records: List[SaplingRecord]
    total: int

class UrbanGreeningProjectListResponse(BaseModel):
    projects: List[UrbanGreeningProject]
    total: int
