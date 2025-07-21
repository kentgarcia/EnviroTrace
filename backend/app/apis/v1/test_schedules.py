from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.apis.deps import get_db
from app.crud.crud_test_schedule import crud_test_schedule
from app.schemas.test_schedule_schemas import (
    TestScheduleCreate,
    TestScheduleUpdate,
    TestScheduleResponse
)

router = APIRouter()


@router.get("/schedules/{year}", response_model=List[TestScheduleResponse])
def get_schedules_by_year(
    year: int,
    db: Session = Depends(get_db)
):
    """Get all test schedules for a specific year"""
    schedules = crud_test_schedule.get_by_year_sync(db=db, year=year)
    return schedules


@router.get("/schedules/{year}/{quarter}", response_model=TestScheduleResponse)
def get_schedule_by_year_quarter(
    year: int,
    quarter: int,
    db: Session = Depends(get_db)
):
    """Get test schedule for a specific year and quarter"""
    if quarter not in [1, 2, 3, 4]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quarter must be 1, 2, 3, or 4"
        )
    
    schedule = crud_test_schedule.get_by_year_quarter_sync(
        db=db, year=year, quarter=quarter
    )
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No test schedule found for Q{quarter} {year}"
        )
    
    return schedule


@router.post("/schedules", response_model=TestScheduleResponse)
def create_or_update_schedule(
    schedule_in: TestScheduleCreate,
    db: Session = Depends(get_db)
):
    """Create a new test schedule or update existing one"""
    schedule = crud_test_schedule.create_or_update_schedule_sync(
        db=db, obj_in=schedule_in
    )
    return schedule


@router.put("/schedules/{year}/{quarter}", response_model=TestScheduleResponse)
def update_schedule(
    year: int,
    quarter: int,
    schedule_in: TestScheduleUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing test schedule"""
    if quarter not in [1, 2, 3, 4]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quarter must be 1, 2, 3, or 4"
        )
    
    schedule = crud_test_schedule.get_by_year_quarter_sync(
        db=db, year=year, quarter=quarter
    )
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No test schedule found for Q{quarter} {year}"
        )
    
    schedule = crud_test_schedule.update_sync(
        db=db, db_obj=schedule, obj_in=schedule_in
    )
    return schedule


@router.delete("/schedules/{year}/{quarter}")
def delete_schedule(
    year: int,
    quarter: int,
    db: Session = Depends(get_db)
):
    """Delete a test schedule"""
    if quarter not in [1, 2, 3, 4]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quarter must be 1, 2, 3, or 4"
        )
    
    schedule = crud_test_schedule.get_by_year_quarter_sync(
        db=db, year=year, quarter=quarter
    )
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No test schedule found for Q{quarter} {year}"
        )
    
    crud_test_schedule.remove_sync(db=db, id=schedule.id)
    return {"message": f"Test schedule for Q{quarter} {year} deleted successfully"}
