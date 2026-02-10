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
    plate_number: Optional[str] = None
    chassis_number: Optional[str] = None
    registration_number: Optional[str] = None
    vehicle_type: str
    wheels: int
    description: Optional[str] = None
    year_acquired: Optional[int] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    driver_name: Optional[str] = None
    contact_number: Optional[str] = None
    engine_type: Optional[str] = None
    office_id: Optional[UUID4] = None
    plate_number: Optional[str] = None
    chassis_number: Optional[str] = None
    registration_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    wheels: Optional[int] = None
    description: Optional[str] = None
    year_acquired: Optional[int] = None

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
    remarks: Optional[str] = None
    co_level: Optional[float] = None  # Carbon monoxide level (percentage) - For GASOLINE vehicles
    hc_level: Optional[float] = None  # Hydrocarbon level (ppm) - For GASOLINE vehicles
    opacimeter_result: Optional[float] = None  # Opacimeter test result (smoke opacity %) - For DIESEL vehicles
    technician_name: Optional[str] = None
    testing_center: Optional[str] = None

class TestCreate(TestBase):
    pass

class TestUpdate(BaseModel):
    test_date: Optional[datetime] = None
    quarter: Optional[int] = None
    year: Optional[int] = None
    result: Optional[bool] = None
    remarks: Optional[str] = None
    co_level: Optional[float] = None
    hc_level: Optional[float] = None
    opacimeter_result: Optional[float] = None
    technician_name: Optional[str] = None
    testing_center: Optional[str] = None

class TestInDB(TestBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UUID4] = None

    class Config:
        from_attributes = True

class Test(TestInDB):
    pass

# Vehicle Remarks schemas
class VehicleRemarksBase(BaseModel):
    vehicle_id: UUID4
    year: int
    remarks: Optional[str] = None

class VehicleRemarksCreate(VehicleRemarksBase):
    pass

class VehicleRemarksUpdate(BaseModel):
    remarks: Optional[str] = None

class VehicleRemarksInDB(VehicleRemarksBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UUID4] = None

    class Config:
        from_attributes = True

class VehicleRemarks(VehicleRemarksInDB):
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


class OfficeVehicleCount(BaseModel):
    office_id: UUID4
    office_name: str
    total_vehicles: int


class OfficeVehicleCountsResponse(BaseModel):
    counts: List[OfficeVehicleCount]
    total: int


# Dashboard summary schemas
class EmissionDashboardTopOffice(BaseModel):
    office_name: str
    compliance_rate: float
    passed_count: int
    vehicle_count: int


class EmissionDashboardSummary(BaseModel):
    total_vehicles: int
    total_offices: int
    tested_vehicles: int
    passed_tests: int
    failed_tests: int
    pending_tests: int
    compliance_rate: float
    top_office: Optional[EmissionDashboardTopOffice] = None

# Response models
class OfficeListResponse(BaseModel):
    offices: List[Office]
    total: int

class VehicleListResponse(BaseModel):
    vehicles: List[Vehicle]
    total: Optional[int] = None
    next_cursor: Optional[str] = None
    prev_cursor: Optional[str] = None
    limit: int
    
class TestListResponse(BaseModel):
    tests: List[Test]
    total: int

class TestScheduleListResponse(BaseModel):
    schedules: List[TestSchedule]
    total: int
    
class VehicleDriverHistoryListResponse(BaseModel):
    history: List[VehicleDriverHistory]
    total: int