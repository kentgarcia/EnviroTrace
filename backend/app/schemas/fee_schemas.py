from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

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