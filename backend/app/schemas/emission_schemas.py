from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, UUID4

# Office schemas
class OfficeBase(BaseModel):
    name: str
    address: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None

class OfficeCreate(OfficeBase):
    pass

class OfficeUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None

class OfficeInDB(OfficeBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Office(OfficeInDB):
    pass

# Vehicle schemas
class VehicleBase(BaseModel):
    driver_name: str
    contact_number: Optional[str] = None
    engine_type: str
    office_id: UUID4
    plate_number: str
    vehicle_type: str
    wheels: int

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    driver_name: Optional[str] = None
    contact_number: Optional[str] = None
    engine_type: Optional[str] = None
    office_id: Optional[UUID4] = None
    plate_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    wheels: Optional[int] = None

class VehicleInDB(VehicleBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Vehicle(VehicleInDB):
    # Add any computed fields or additional info here
    office: Optional[Office] = None
    latest_test_result: Optional[bool] = None
    latest_test_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Test schemas
class TestBase(BaseModel):
    vehicle_id: UUID4
    test_date: datetime
    quarter: int
    year: int
    result: bool

class TestCreate(TestBase):
    pass

class TestUpdate(BaseModel):
    test_date: Optional[datetime] = None
    quarter: Optional[int] = None
    year: Optional[int] = None
    result: Optional[bool] = None

class TestInDB(TestBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UUID4] = None

    class Config:
        from_attributes = True

class Test(TestInDB):
    pass

# Vehicle Driver History schemas
class VehicleDriverHistoryBase(BaseModel):
    vehicle_id: UUID4
    driver_name: str

class VehicleDriverHistoryCreate(VehicleDriverHistoryBase):
    changed_by: Optional[UUID4] = None

class VehicleDriverHistoryInDB(VehicleDriverHistoryBase):
    id: UUID4
    changed_at: datetime
    changed_by: Optional[UUID4] = None

    class Config:
        from_attributes = True

class VehicleDriverHistory(VehicleDriverHistoryInDB):
    pass

# Test Schedule schemas
class TestScheduleBase(BaseModel):
    assigned_personnel: str
    conducted_on: datetime
    location: str
    quarter: int
    year: int

class TestScheduleCreate(TestScheduleBase):
    pass

class TestScheduleUpdate(BaseModel):
    assigned_personnel: Optional[str] = None
    conducted_on: Optional[datetime] = None
    location: Optional[str] = None
    quarter: Optional[int] = None
    year: Optional[int] = None

class TestScheduleInDB(TestScheduleBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TestSchedule(TestScheduleInDB):
    pass

# Office Compliance schemas
class OfficeComplianceData(BaseModel):
    office_name: str
    total_vehicles: int
    tested_vehicles: int
    compliant_vehicles: int
    non_compliant_vehicles: int
    compliance_rate: float
    last_test_date: Optional[datetime] = None
    
class OfficeComplianceSummary(BaseModel):
    total_offices: int
    total_vehicles: int
    total_compliant: int
    overall_compliance_rate: float

class OfficeComplianceResponse(BaseModel):
    offices: List[OfficeComplianceData]
    summary: OfficeComplianceSummary
    total: int

# Response models
class OfficeListResponse(BaseModel):
    offices: List[Office]
    total: int

class VehicleListResponse(BaseModel):
    vehicles: List[Vehicle]
    total: int
    
class TestListResponse(BaseModel):
    tests: List[Test]
    total: int

class TestScheduleListResponse(BaseModel):
    schedules: List[TestSchedule]
    total: int
    
class VehicleDriverHistoryListResponse(BaseModel):
    history: List[VehicleDriverHistory]
    total: int