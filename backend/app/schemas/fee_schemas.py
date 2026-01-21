from pydantic import BaseModel
from datetime import date as DateType, datetime
from typing import Optional
from decimal import Decimal
from uuid import UUID

# Urban Greening Fee Record Schemas
class UrbanGreeningFeeRecordBase(BaseModel):
    type: str  # cutting_permit, pruning_permit, violation_fine
    amount: Decimal
    payer_name: str
    date: DateType
    status: str  # paid, pending, cancelled
    or_number: Optional[str] = None
    payment_date: Optional[DateType] = None

class UrbanGreeningFeeRecordCreate(UrbanGreeningFeeRecordBase):
    pass

class UrbanGreeningFeeRecordUpdate(BaseModel):
    type: Optional[str] = None
    amount: Optional[Decimal] = None
    payer_name: Optional[str] = None
    date: Optional[DateType] = None
    status: Optional[str] = None
    or_number: Optional[str] = None
    payment_date: Optional[DateType] = None

class UrbanGreeningFeeRecordInDB(BaseModel):
    id: UUID
    reference_number: str
    type: str
    amount: Decimal
    payer_name: str
    date: DateType
    status: str
    or_number: Optional[str] = None
    payment_date: Optional[DateType] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UrbanGreeningFeeRecord(UrbanGreeningFeeRecordInDB):
    pass