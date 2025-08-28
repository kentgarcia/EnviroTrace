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
    level: int = Field(..., ge=0)  # Allow level 0 for base fees
    effective_date: date


class AirQualityFeeCreate(AirQualityFeeBase):
    pass


class AirQualityFeeUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, ge=0)
    category: Optional[str] = Field(None, max_length=100)
    level: Optional[int] = Field(None, ge=0)  # Allow level 0 for base fees
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


# Order of Payment Schemas
class AirQualityOrderOfPaymentBase(BaseModel):
    plate_number: str = Field(..., max_length=32)
    operator_name: str = Field(..., max_length=200)
    driver_name: Optional[str] = Field(None, max_length=200)
    selected_violations: str  # Comma-separated violation IDs
    testing_officer: Optional[str] = Field(None, max_length=200)
    test_results: Optional[str] = None
    date_of_testing: Optional[date] = None
    apprehension_fee: Optional[Decimal] = Field(default=0, ge=0)
    voluntary_fee: Optional[Decimal] = Field(default=0, ge=0)
    impound_fee: Optional[Decimal] = Field(default=0, ge=0)
    driver_amount: Optional[Decimal] = Field(default=0, ge=0)
    operator_fee: Optional[Decimal] = Field(default=0, ge=0)
    total_undisclosed_amount: Decimal = Field(..., ge=0)
    grand_total_amount: Decimal = Field(..., ge=0)
    payment_or_number: Optional[str] = Field(None, max_length=64)
    date_of_payment: date
    status: Optional[str] = Field(default="unpaid", max_length=32)


class AirQualityOrderOfPaymentCreate(AirQualityOrderOfPaymentBase):
    pass


class AirQualityOrderOfPaymentUpdate(BaseModel):
    plate_number: Optional[str] = Field(None, max_length=32)
    operator_name: Optional[str] = Field(None, max_length=200)
    driver_name: Optional[str] = Field(None, max_length=200)
    selected_violations: Optional[str] = None
    testing_officer: Optional[str] = Field(None, max_length=200)
    test_results: Optional[str] = None
    date_of_testing: Optional[date] = None
    apprehension_fee: Optional[Decimal] = Field(None, ge=0)
    voluntary_fee: Optional[Decimal] = Field(None, ge=0)
    impound_fee: Optional[Decimal] = Field(None, ge=0)
    driver_amount: Optional[Decimal] = Field(None, ge=0)
    operator_fee: Optional[Decimal] = Field(None, ge=0)
    total_undisclosed_amount: Optional[Decimal] = Field(None, ge=0)
    grand_total_amount: Optional[Decimal] = Field(None, ge=0)
    payment_or_number: Optional[str] = Field(None, max_length=64)
    date_of_payment: Optional[date] = None
    status: Optional[str] = Field(None, max_length=32)


class AirQualityOrderOfPayment(AirQualityOrderOfPaymentBase):
    id: UUID
    oop_control_number: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AirQualityOrderOfPaymentSearchParams(BaseModel):
    search: Optional[str] = None
    control_number: Optional[str] = None
    plate_number: Optional[str] = None
    status: Optional[str] = None
    created_date: Optional[date] = None
    limit: Optional[int] = Field(50, ge=1, le=200)
    offset: Optional[int] = Field(0, ge=0)


class AirQualityOrderOfPaymentListResponse(BaseModel):
    orders: List[AirQualityOrderOfPayment]
    total: int
    limit: int
    offset: int


# Dashboard Statistics Schemas
class VehicleTypeStatistic(BaseModel):
    vehicle_type: str
    count: int


class ViolationTrend(BaseModel):
    month: str
    year: int
    violation_count: int
    paid_driver_count: int
    paid_operator_count: int


class LocationStatistic(BaseModel):
    location: str
    count: int


class PaymentStatusStatistic(BaseModel):
    status: str
    count: int
    percentage: float


class AirQualityDashboardResponse(BaseModel):
    # Summary Statistics
    total_records: int
    total_violations: int
    total_drivers: int
    total_fees_configured: int
    
    # Payment Statistics
    paid_violations_driver: int
    paid_violations_operator: int
    paid_driver_percentage: float
    paid_operator_percentage: float
    
    # Vehicle Type Breakdown
    vehicle_types: List[VehicleTypeStatistic]
    
    # Violation Trends
    monthly_violations: List[ViolationTrend]
    
    # Location Statistics
    top_violation_locations: List[LocationStatistic]
    
    # Payment Status Distribution
    payment_status_distribution: List[PaymentStatusStatistic]
    
    # Recent Activity (last 30 days)
    recent_violations_count: int
    recent_records_count: int
