from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.apis.deps import get_current_user, get_current_active_superuser, get_db, get_current_active_user
from app.crud import crud_emission
from app.models.auth_models import User
from app.schemas.emission_schemas import (
    Vehicle, VehicleCreate, VehicleUpdate, VehicleListResponse,
    Test, TestCreate, TestUpdate, TestListResponse,
    TestSchedule, TestScheduleCreate, TestScheduleUpdate, TestScheduleListResponse,
    VehicleDriverHistory, VehicleDriverHistoryCreate, VehicleDriverHistoryListResponse
)

router = APIRouter()


# Vehicles endpoints
@router.get("/vehicles", response_model=VehicleListResponse)
def get_vehicles(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    plate_number: Optional[str] = None,
    driver_name: Optional[str] = None,
    office_name: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    engine_type: Optional[str] = None,
    wheels: Optional[int] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all vehicles with optional filtering.
    """
    if search:
        return crud_emission.vehicle.search(db, search_term=search, skip=skip, limit=limit)
    
    filters = {}
    if plate_number:
        filters["plate_number"] = plate_number
    if driver_name:
        filters["driver_name"] = driver_name
    if office_name:
        filters["office_name"] = office_name
    if vehicle_type:
        filters["vehicle_type"] = vehicle_type
    if engine_type:
        filters["engine_type"] = engine_type
    if wheels:
        filters["wheels"] = wheels
    
    return crud_emission.vehicle.get_multi_with_test_info(db, skip=skip, limit=limit, filters=filters)


@router.post("/vehicles", response_model=Vehicle, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    *,
    db: Session = Depends(get_db),
    vehicle_in: VehicleCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Create new vehicle.
    """
    # Check for duplicate plate number
    existing = db.query(crud_emission.vehicle.model).filter(
        crud_emission.vehicle.model.plate_number == vehicle_in.plate_number
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A vehicle with this plate number already exists"
        )
    
    vehicle = crud_emission.vehicle.create(db, obj_in=vehicle_in)
    return crud_emission.vehicle.get_with_test_info(db, id=vehicle.id)


@router.get("/vehicles/{vehicle_id}", response_model=Vehicle)
def get_vehicle(
    vehicle_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific vehicle by ID.
    """
    vehicle = crud_emission.vehicle.get_with_test_info(db, id=vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    return vehicle


@router.put("/vehicles/{vehicle_id}", response_model=Vehicle)
def update_vehicle(
    *,
    vehicle_id: UUID,
    db: Session = Depends(get_db),
    vehicle_in: VehicleUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a vehicle.
    """
    vehicle = crud_emission.vehicle.get(db, id=vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    # If plate number is being updated, check for duplicates
    if vehicle_in.plate_number and vehicle_in.plate_number != vehicle.plate_number:
        existing = db.query(crud_emission.vehicle.model).filter(
            crud_emission.vehicle.model.plate_number == vehicle_in.plate_number
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A vehicle with this plate number already exists"
            )
    
    # If driver name is changed, record in history
    if vehicle_in.driver_name and vehicle_in.driver_name != vehicle.driver_name:
        # Create driver history record
        history_data = VehicleDriverHistoryCreate(
            vehicle_id=vehicle.id,
            driver_name=vehicle.driver_name
        )
        crud_emission.vehicle_driver_history.create(
            db, 
            obj_in=history_data
        )
    
    vehicle = crud_emission.vehicle.update(db, db_obj=vehicle, obj_in=vehicle_in)
    return crud_emission.vehicle.get_with_test_info(db, id=vehicle.id)


@router.delete("/vehicles/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a vehicle.
    """
    vehicle = crud_emission.vehicle.get(db, id=vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    crud_emission.vehicle.remove(db, id=vehicle_id)
    return None


@router.get("/vehicles/filters/options")
def get_filter_options(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get unique values for filter dropdowns.
    """
    return crud_emission.vehicle.get_unique_values(db)


# Tests endpoints
@router.get("/tests", response_model=TestListResponse)
def get_tests(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    vehicle_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all tests or tests for a specific vehicle.
    """
    if vehicle_id:
        return crud_emission.test.get_by_vehicle(db, vehicle_id=vehicle_id, skip=skip, limit=limit)
    
    tests = crud_emission.test.get_multi(db, skip=skip, limit=limit)
    total = crud_emission.test.count(db)
    return {"tests": tests, "total": total}


@router.post("/tests", response_model=Test, status_code=status.HTTP_201_CREATED)
def create_test(
    *,
    db: Session = Depends(get_db),
    test_in: TestCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new test record.
    """
    # Check if vehicle exists
    vehicle = crud_emission.vehicle.get(db, id=test_in.vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    test = crud_emission.test.create(db, obj_in=test_in)
    return test


@router.get("/tests/{test_id}", response_model=Test)
def get_test(
    test_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific test by ID.
    """
    test = crud_emission.test.get(db, id=test_id)
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    return test


@router.put("/tests/{test_id}", response_model=Test)
def update_test(
    *,
    test_id: UUID,
    db: Session = Depends(get_db),
    test_in: TestUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a test record.
    """
    test = crud_emission.test.get(db, id=test_id)
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    test = crud_emission.test.update(db, db_obj=test, obj_in=test_in)
    return test


@router.delete("/tests/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_test(
    test_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a test record.
    """
    test = crud_emission.test.get(db, id=test_id)
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    crud_emission.test.remove(db, id=test_id)
    return None


# Test Schedules endpoints
@router.get("/test-schedules", response_model=TestScheduleListResponse)
def get_test_schedules(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    year: Optional[int] = None,
    quarter: Optional[int] = None,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all test schedules or filter by year and quarter.
    """
    if year and quarter:
        schedules = crud_emission.test_schedule.get_by_year_quarter(db, year=year, quarter=quarter)
        return {"schedules": schedules, "total": len(schedules)}
    
    schedules = crud_emission.test_schedule.get_multi(db, skip=skip, limit=limit)
    total = crud_emission.test_schedule.count(db)
    return {"schedules": schedules, "total": total}


@router.post("/test-schedules", response_model=TestSchedule, status_code=status.HTTP_201_CREATED)
def create_test_schedule(
    *,
    db: Session = Depends(get_db),
    schedule_in: TestScheduleCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new test schedule.
    """
    schedule = crud_emission.test_schedule.create(db, obj_in=schedule_in)
    return schedule


@router.get("/test-schedules/{schedule_id}", response_model=TestSchedule)
def get_test_schedule(
    schedule_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific test schedule by ID.
    """
    schedule = crud_emission.test_schedule.get(db, id=schedule_id)
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test schedule not found"
        )
    return schedule


@router.put("/test-schedules/{schedule_id}", response_model=TestSchedule)
def update_test_schedule(
    *,
    schedule_id: UUID,
    db: Session = Depends(get_db),
    schedule_in: TestScheduleUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a test schedule.
    """
    schedule = crud_emission.test_schedule.get(db, id=schedule_id)
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test schedule not found"
        )
    
    schedule = crud_emission.test_schedule.update(db, db_obj=schedule, obj_in=schedule_in)
    return schedule


@router.delete("/test-schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_test_schedule(
    schedule_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a test schedule.
    """
    schedule = crud_emission.test_schedule.get(db, id=schedule_id)
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test schedule not found"
        )
    crud_emission.test_schedule.remove(db, id=schedule_id)
    return None


# Vehicle Driver History endpoints
@router.get("/vehicle-driver-history", response_model=VehicleDriverHistoryListResponse)
def get_driver_history(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    vehicle_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get driver history for all vehicles or a specific vehicle.
    """
    if vehicle_id:
        return crud_emission.vehicle_driver_history.get_by_vehicle(db, vehicle_id=vehicle_id, skip=skip, limit=limit)
    
    history = crud_emission.vehicle_driver_history.get_multi(db, skip=skip, limit=limit)
    total = crud_emission.vehicle_driver_history.count(db)
    return {"history": history, "total": total}