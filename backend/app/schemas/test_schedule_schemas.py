from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional
from uuid import UUID


class TestScheduleBase(BaseModel):
    year: int
    quarter: int
    assigned_personnel: str
    conducted_on: datetime
    location: str

    @validator('quarter')
    def validate_quarter(cls, v):
        if v not in [1, 2, 3, 4]:
            raise ValueError('Quarter must be 1, 2, 3, or 4')
        return v

    @validator('year')
    def validate_year(cls, v):
        current_year = datetime.now().year
        if v < 2020 or v > current_year + 5:
            raise ValueError(f'Year must be between 2020 and {current_year + 5}')
        return v


class TestScheduleCreate(TestScheduleBase):
    pass


class TestScheduleUpdate(BaseModel):
    assigned_personnel: Optional[str] = None
    conducted_on: Optional[datetime] = None
    location: Optional[str] = None

    @validator('conducted_on', pre=True)
    def parse_conducted_on(cls, v):
        if isinstance(v, str):
            try:
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except ValueError:
                raise ValueError('Invalid datetime format')
        return v


class TestScheduleResponse(TestScheduleBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TestScheduleInDB(TestScheduleResponse):
    pass
