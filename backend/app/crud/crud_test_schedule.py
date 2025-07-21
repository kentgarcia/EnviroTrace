from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base_crud import CRUDBase
from app.models.emission_models import TestSchedule
from app.schemas.test_schedule_schemas import TestScheduleCreate, TestScheduleUpdate


class CRUDTestSchedule(CRUDBase[TestSchedule, TestScheduleCreate, TestScheduleUpdate]):
    def get_by_year_quarter_sync(
        self, db: Session, *, year: int, quarter: int
    ) -> Optional[TestSchedule]:
        """Get test schedule by year and quarter (synchronous)"""
        return db.query(TestSchedule).filter(
            and_(TestSchedule.year == year, TestSchedule.quarter == quarter)
        ).first()

    def get_by_year_sync(self, db: Session, *, year: int) -> List[TestSchedule]:
        """Get all test schedules for a specific year (synchronous)"""
        return db.query(TestSchedule).filter(TestSchedule.year == year).all()

    def get_multi_by_year_quarters_sync(
        self, db: Session, *, year: int, quarters: List[int]
    ) -> List[TestSchedule]:
        """Get test schedules for specific year and quarters (synchronous)"""
        return db.query(TestSchedule).filter(
            and_(
                TestSchedule.year == year,
                TestSchedule.quarter.in_(quarters)
            )
        ).all()

    def create_sync(self, db: Session, *, obj_in: TestScheduleCreate) -> TestSchedule:
        """Create a new schedule (synchronous)"""
        obj_in_data = obj_in.model_dump()
        db_obj = TestSchedule(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def create_or_update_schedule_sync(
        self, db: Session, *, obj_in: TestScheduleCreate
    ) -> TestSchedule:
        """Create a new schedule or update existing one for the year/quarter (synchronous)"""
        existing = self.get_by_year_quarter_sync(
            db, year=obj_in.year, quarter=obj_in.quarter
        )
        
        if existing:
            # Update existing schedule
            update_data = obj_in.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(existing, field, value)
            db.add(existing)
            db.commit()
            db.refresh(existing)
            return existing
        else:
            # Create new schedule
            return self.create_sync(db=db, obj_in=obj_in)

    def update_sync(
        self, db: Session, *, db_obj: TestSchedule, obj_in: TestScheduleUpdate
    ) -> TestSchedule:
        """Update an existing schedule (synchronous)"""
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove_sync(self, db: Session, *, id: str) -> Optional[TestSchedule]:
        """Remove a schedule (synchronous)"""
        obj = db.query(TestSchedule).filter(TestSchedule.id == id).first()
        if obj:
            db.delete(obj)
            db.commit()
        return obj


crud_test_schedule = CRUDTestSchedule(TestSchedule)
