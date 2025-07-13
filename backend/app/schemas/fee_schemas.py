from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class AirQualityFeeBase(BaseModel):
    category: str
    rate: int
    date_effective: date
    offense_level: int


class AirQualityFeeCreate(AirQualityFeeBase):
    pass


class AirQualityFeeUpdate(BaseModel):
    category: Optional[str] = None
    rate: Optional[int] = None
    date_effective: Optional[date] = None
    offense_level: Optional[int] = None


class AirQualityFeeInDB(AirQualityFeeBase):
    fee_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AirQualityFee(AirQualityFeeInDB):
    pass