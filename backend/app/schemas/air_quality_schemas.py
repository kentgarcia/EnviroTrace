from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal


# Driver Schemas
class AirQualityDriverBase(BaseModel):
    first_name: str = Field(..., max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    last_name: str = Field(..., max_length=100)
    address: str
    license_number: str = Field(..., max_length=50)


class AirQualityDriverCreate(AirQualityDriverBase):
    pass


class AirQualityDriverUpdate(BaseModel):
    first_name: Optional[str] = Field(None, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = None
    license_number: Optional[str] = Field(None, max_length=50)


class AirQualityDriver(AirQualityDriverBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AirQualityDriverSearchParams(BaseModel):
    search: Optional[str] = None
    limit: Optional[int] = Field(50, ge=1, le=200)
    offset: Optional[int] = Field(0, ge=0)


# Record Schemas
class AirQualityRecordBase(BaseModel):
    plate_number: str = Field(..., max_length=32)
    vehicle_type: str = Field(..., max_length=64)
    transport_group: Optional[str] = Field(None, max_length=100)
    operator_company_name: str = Field(..., max_length=200)
    operator_address: Optional[str] = None
    owner_first_name: Optional[str] = Field(None, max_length=100)
    owner_middle_name: Optional[str] = Field(None, max_length=100)
    owner_last_name: Optional[str] = Field(None, max_length=100)
    motor_no: Optional[str] = Field(None, max_length=100)
    motor_vehicle_name: Optional[str] = Field(None, max_length=200)


class AirQualityRecordCreate(AirQualityRecordBase):
    pass


class AirQualityRecordUpdate(BaseModel):
    plate_number: Optional[str] = Field(None, max_length=32)
    vehicle_type: Optional[str] = Field(None, max_length=64)
    transport_group: Optional[str] = Field(None, max_length=100)
    operator_company_name: Optional[str] = Field(None, max_length=200)
    operator_address: Optional[str] = None
    owner_first_name: Optional[str] = Field(None, max_length=100)
    owner_middle_name: Optional[str] = Field(None, max_length=100)
    owner_last_name: Optional[str] = Field(None, max_length=100)
    motor_no: Optional[str] = Field(None, max_length=100)
    motor_vehicle_name: Optional[str] = Field(None, max_length=200)


class AirQualityRecord(AirQualityRecordBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AirQualityRecordSearchParams(BaseModel):
    plateNumber: Optional[str] = Field(None, alias="plate_number")
    operatorName: Optional[str] = Field(None, alias="operator_name")
    vehicleType: Optional[str] = Field(None, alias="vehicle_type")
    limit: Optional[int] = Field(50, ge=1, le=200)
    offset: Optional[int] = Field(0, ge=0)


# Violation Schemas
class AirQualityViolationBase(BaseModel):
    ordinance_infraction_report_no: Optional[str] = Field(None, max_length=100)
    smoke_density_test_result_no: Optional[str] = Field(None, max_length=100)
    place_of_apprehension: str = Field(..., max_length=200)
    date_of_apprehension: date
    paid_driver: bool = False
    paid_operator: bool = False
    driver_id: Optional[UUID] = None


class AirQualityViolationCreate(AirQualityViolationBase):
    record_id: int


class AirQualityViolationUpdate(BaseModel):
    ordinance_infraction_report_no: Optional[str] = Field(None, max_length=100)
    smoke_density_test_result_no: Optional[str] = Field(None, max_length=100)
    place_of_apprehension: Optional[str] = Field(None, max_length=200)
    date_of_apprehension: Optional[date] = None
    paid_driver: Optional[bool] = None
    paid_operator: Optional[bool] = None
    driver_id: Optional[UUID] = None


class AirQualityViolation(AirQualityViolationBase):
    id: int
    record_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AirQualityViolationPaymentUpdate(BaseModel):
    paid_driver: bool
    paid_operator: bool


# Fee Schemas
class AirQualityFeeBase(BaseModel):
    amount: Decimal = Field(..., ge=0)
    category: str = Field(..., max_length=100)
    level: int = Field(..., ge=1)
    effective_date: date


class AirQualityFeeCreate(AirQualityFeeBase):
    pass


class AirQualityFeeUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, ge=0)
    category: Optional[str] = Field(None, max_length=100)
    level: Optional[int] = Field(None, ge=1)
    effective_date: Optional[date] = None


class AirQualityFee(AirQualityFeeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Record History Schemas
class AirQualityRecordHistoryBase(BaseModel):
    type: str = Field(..., max_length=64)
    date: date
    details: Optional[str] = None
    or_number: Optional[str] = Field(None, max_length=64)
    status: str = Field(..., max_length=32)


class AirQualityRecordHistoryCreate(AirQualityRecordHistoryBase):
    record_id: int


class AirQualityRecordHistory(AirQualityRecordHistoryBase):
    id: int
    record_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Response Models
class AirQualityRecordListResponse(BaseModel):
    records: List[AirQualityRecord]
    total: int
    limit: int
    offset: int


class AirQualityViolationListResponse(BaseModel):
    violations: List[AirQualityViolation]
    total: int


class AirQualityDriverListResponse(BaseModel):
    drivers: List[AirQualityDriver]
    total: int
    limit: int
    offset: int


class AirQualityFeeListResponse(BaseModel):
    fees: List[AirQualityFee]
    total: int
