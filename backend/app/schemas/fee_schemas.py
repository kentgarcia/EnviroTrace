from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from decimal import Decimal
from uuid import UUID

class AirQualityFeeBase(BaseModel):
    category: str
    rate: int  # stored as cents
    date_effective: date
    level: int

class AirQualityFeeCreate(AirQualityFeeBase):
    fee_id: str

class AirQualityFeeUpdate(BaseModel):
    category: Optional[str] = None
    rate: Optional[int] = None
    date_effective: Optional[date] = None
    level: Optional[int] = None

class AirQualityFeeInDB(AirQualityFeeBase):
    fee_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AirQualityFee(AirQualityFeeInDB):
    pass


# Urban Greening Fee Record Schemas
class UrbanGreeningFeeRecordBase(BaseModel):
    reference_number: str
    type: str  # cutting_permit, pruning_permit, violation_fine
    amount: Decimal
    payer_name: str
    date: date
    due_date: date
    status: str  # paid, pending, overdue, cancelled
    or_number: Optional[str] = None
    payment_date: Optional[date] = None

class UrbanGreeningFeeRecordCreate(UrbanGreeningFeeRecordBase):
    pass

class UrbanGreeningFeeRecordUpdate(BaseModel):
    reference_number: Optional[str] = None
    type: Optional[str] = None
    amount: Optional[Decimal] = None
    payer_name: Optional[str] = None
    date: Optional[date] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    or_number: Optional[str] = None
    payment_date: Optional[date] = None

class UrbanGreeningFeeRecordInDB(UrbanGreeningFeeRecordBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UrbanGreeningFeeRecord(UrbanGreeningFeeRecordInDB):
    pass