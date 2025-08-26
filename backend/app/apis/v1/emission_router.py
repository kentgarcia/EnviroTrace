from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import UUID
import traceback

from app.apis.deps import get_db, get_current_active_user
from app.crud import crud_emission
from app.models.auth_models import User
from app.models.emission_models import VehicleDriverHistory, Test as TestModel
from app.schemas.emission_schemas import (
    Office, OfficeCreate, OfficeUpdate, OfficeListResponse,
    Vehicle, VehicleCreate, VehicleUpdate, VehicleListResponse,
    Test, TestCreate, TestUpdate, TestListResponse,
    TestSchedule, TestScheduleCreate, TestScheduleUpdate, TestScheduleListResponse,
    VehicleDriverHistoryCreate, VehicleDriverHistoryListResponse,
    VehicleRemarks, VehicleRemarksCreate, VehicleRemarksUpdate,
    OfficeComplianceResponse
)

router = APIRouter()


# Offices endpoints
@router.get("/offices", response_model=OfficeListResponse)
def get_offices(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all offices with optional search.
    """
    if search:
        return crud_emission.office.search(db, search_term=search, skip=skip, limit=limit)
    
    return crud_emission.office.get_multi_sync(db, skip=skip, limit=limit)


@router.post("/offices", response_model=Office, status_code=status.HTTP_201_CREATED)
def create_office(
    *,
    db: Session = Depends(get_db),
    office_in: OfficeCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Create new office.
    """    # Check for duplicate office name
    existing = crud_emission.office.get_by_name(db, name=office_in.name)
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An office with this name already exists"
        )
    office = crud_emission.office.create_sync(db, obj_in=office_in)
    return office


# Office Compliance endpoints
@router.get("/offices/compliance", response_model=OfficeComplianceResponse)
def get_office_compliance(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search_term: Optional[str] = None,
    year: Optional[int] = None,
    quarter: Optional[int] = None,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get office compliance data aggregated from vehicles and tests.
    """
    filters = {}
    if search_term:
        filters["search_term"] = search_term
    if year:
        filters["year"] = year
    if quarter:
        filters["quarter"] = quarter
    
    return crud_emission.office_compliance.get_office_compliance_data(
        db, skip=skip, limit=limit, filters=filters
    )


@router.get("/offices/{office_id}", response_model=Office)
def get_office(
    office_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific office by ID.
    """
    office = crud_emission.office.get_sync(db, id=office_id)
    if not office:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Office not found"
        )
    return office


@router.put("/offices/{office_id}", response_model=Office)
def update_office(
    *,
    office_id: UUID,
    db: Session = Depends(get_db),
    office_in: OfficeUpdate,
    current_user: User = Depends(get_current_active_user)
):    
    """
    Update an office.
    """
    office = crud_emission.office.get_sync(db, id=office_id)
    if not office:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Office not found"
        )
    
    # If name is being updated, check for duplicates
    if office_in.name and office_in.name != office.name:
        existing = crud_emission.office.get_by_name(db, name=office_in.name)
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An office with this name already exists"
            )
    office = crud_emission.office.update_sync(db, db_obj=office, obj_in=office_in)
    return office


@router.delete("/offices/{office_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_office(
    office_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete an office.
    """
    office = crud_emission.office.get(db, id=office_id)
    if not office:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Office not found"
        )
    
    # Check if office has vehicles
    vehicles_count = db.query(Vehicle).filter(Vehicle.office_id == office_id).count()
    if vehicles_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete office. It has {vehicles_count} vehicles assigned to it."
        )
    crud_emission.office.remove_sync(db, id=office_id)
    return None


# Vehicles endpoints
@router.get("/vehicles", response_model=VehicleListResponse)
def get_vehicles(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    plate_number: Optional[str] = None,
    driver_name: Optional[str] = None,
    office_name: Optional[str] = None,
    office_id: Optional[UUID] = None,
    vehicle_type: Optional[str] = None,
    engine_type: Optional[str] = None,
    wheels: Optional[int] = None,
    search: Optional[str] = None,
    include_test_data: bool = False,  # New parameter to optionally include test data
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all vehicles with optional filtering.
    By default, excludes test data for better performance.
    Set include_test_data=true to include latest test results.
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
    if office_id:
        filters["office_id"] = office_id
    if vehicle_type:
        filters["vehicle_type"] = vehicle_type
    if engine_type:
        filters["engine_type"] = engine_type
    if wheels:
        filters["wheels"] = wheels
    
    # Choose which method to use based on include_test_data parameter
    if include_test_data:
        return crud_emission.vehicle.get_multi_with_test_info(db, skip=skip, limit=limit, filters=filters)
    else:
        return crud_emission.vehicle.get_multi_optimized(db, skip=skip, limit=limit, filters=filters)


@router.get("/vehicles/search/plate/{plate_number}", response_model=Vehicle)
def get_vehicle_by_plate(
    plate_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get vehicle by exact plate number match.
    """
    vehicle = crud_emission.vehicle.get_by_plate_number(db, plate_number=plate_number)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with plate number '{plate_number}' not found"
        )
    return vehicle


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
    # Check if office exists
    office = crud_emission.office.get_sync(db, id=vehicle_in.office_id)
    if not office:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Office not found"
        )
    
    # Check for duplicate plate number
    existing = crud_emission.vehicle.get_by_plate_number(db, plate_number=vehicle_in.plate_number)
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A vehicle with this plate number already exists"
        )
    try:
        # Create the vehicle using the CRUD method
        print("DEBUG: Creating vehicle")
        vehicle = crud_emission.vehicle.create_sync(db, obj_in=vehicle_in)
        print("DEBUG: Vehicle created with ID:", vehicle.id)
        
        # Create driver history - DIRECTLY using the model to avoid any async/sync confusion
        print("DEBUG: Creating driver history for vehicle ID:", vehicle.id)
        print("DEBUG: Current user ID:", current_user.id)
        # Skip the CRUD layer entirely and create directly with the model
        history = VehicleDriverHistory(
            vehicle_id=vehicle.id,
            driver_name=vehicle.driver_name,
            changed_by_id=current_user.id  # Use column name from model
        )
        print("DEBUG: Adding history to session")
        db.add(history)
        db.commit()
        print("DEBUG: History committed")        # Return the vehicle directly instead of using get_with_test_info
        print("DEBUG: Returning vehicle directly")
        # Set test info directly to avoid any potential async issues
        setattr(vehicle, "latest_test_result", None)
        setattr(vehicle, "latest_test_date", None)
        return vehicle
    except Exception as e:
        db.rollback()
        print(f"DEBUG ERROR in create_vehicle: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating vehicle: {str(e)}"
        )


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
    vehicle = crud_emission.vehicle.get_sync(db, id=vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
      
    # If office is being updated, check if it exists
    if vehicle_in.office_id and vehicle_in.office_id != vehicle.office_id:
        office = crud_emission.office.get_sync(db, id=vehicle_in.office_id)
        if not office:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Office not found"
            )
    
    # If plate number is being updated, check for duplicates
    if vehicle_in.plate_number and vehicle_in.plate_number != vehicle.plate_number:
        existing = crud_emission.vehicle.get_by_plate_number(db, plate_number=vehicle_in.plate_number)
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A vehicle with this plate number already exists"
            )
    try:
        # If driver name is changed, record in history
        if vehicle_in.driver_name and vehicle_in.driver_name != vehicle.driver_name:
            print("DEBUG: Creating driver history for vehicle update")
            print("DEBUG: Current user ID:", current_user.id)
            # Create driver history record directly using the model
            history = VehicleDriverHistory(
                vehicle_id=vehicle.id,
                driver_name=vehicle.driver_name,  # Store the OLD driver name
                changed_by_id=current_user.id
            )
            db.add(history)
            db.commit()
            print("DEBUG: History committed")
        
        # Update the vehicle
        print("DEBUG: Updating vehicle")
        vehicle = crud_emission.vehicle.update_sync(db, db_obj=vehicle, obj_in=vehicle_in)
        print("DEBUG: Vehicle updated")
        
        # Return vehicle with attributes set directly
        print("DEBUG: Setting attributes directly on vehicle")
        # Get latest test
        latest_test = db.query(TestModel)\
            .filter(TestModel.vehicle_id == vehicle.id)\
            .order_by(desc(TestModel.test_date))\
            .first()
            
        if latest_test:
            setattr(vehicle, "latest_test_result", latest_test.result)
            setattr(vehicle, "latest_test_date", latest_test.test_date)
        else:
            setattr(vehicle, "latest_test_result", None)
            setattr(vehicle, "latest_test_date", None)
            
        print("DEBUG: Returning updated vehicle")
        return vehicle
    except Exception as e:
        db.rollback()
        print(f"DEBUG ERROR in update_vehicle: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating vehicle: {str(e)}"
        )


@router.delete("/vehicles/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):    
    """
    Delete a vehicle.
    """
    vehicle = crud_emission.vehicle.get_sync(db, id=vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    crud_emission.vehicle.remove_sync(db, id=vehicle_id)
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
    
    # Query directly to avoid nested dictionary issues
    query = db.query(TestModel)
    total = query.count()
    tests = query.order_by(desc(TestModel.test_date)).offset(skip).limit(limit).all()
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
    vehicle = crud_emission.vehicle.get_sync(db, id=test_in.vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    test = crud_emission.test.create_sync(db, obj_in=test_in)
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
    test = crud_emission.test.get_sync(db, id=test_id)
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
    test = crud_emission.test.get_sync(db, id=test_id)
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    test = crud_emission.test.update_sync(db, db_obj=test, obj_in=test_in)
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
    test = crud_emission.test.get_sync(db, id=test_id)
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    crud_emission.test.remove_sync(db, id=test_id)
    return None


# Test Schedules endpoints
@router.get("/test-schedules", response_model=TestScheduleListResponse)
def get_test_schedules(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    year: Optional[int] = None,    quarter: Optional[int] = None,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all test schedules or filter by year and quarter.
    """
    if year and quarter:
        schedules = crud_emission.test_schedule.get_by_year_quarter(db, year=year, quarter=quarter)
        return {"schedules": schedules, "total": len(schedules)}
    
    schedules = crud_emission.test_schedule.get_multi_sync(db, skip=skip, limit=limit)
    total = crud_emission.test_schedule.count_sync(db)
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
    schedule = crud_emission.test_schedule.create_sync(db, obj_in=schedule_in)
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
    schedule = crud_emission.test_schedule.get_sync(db, id=schedule_id)
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
    schedule = crud_emission.test_schedule.get_sync(db, id=schedule_id)
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test schedule not found"
        )
    
    schedule = crud_emission.test_schedule.update_sync(db, db_obj=schedule, obj_in=schedule_in)
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
    schedule = crud_emission.test_schedule.get_sync(db, id=schedule_id)
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test schedule not found"
        )
    crud_emission.test_schedule.remove_sync(db, id=schedule_id)
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
    
    history = crud_emission.vehicle_driver_history.get_multi_sync(db, skip=skip, limit=limit)
    total = crud_emission.vehicle_driver_history.count_sync(db)
    return {"history": history, "total": total}

# Vehicle Remarks endpoints
@router.get("/vehicles/{vehicle_id}/remarks/{year}", response_model=VehicleRemarks)
def get_vehicle_remarks(
    vehicle_id: UUID,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get remarks for a specific vehicle and year.
    """
    remarks = crud_emission.vehicle_remarks.get_by_vehicle_and_year(db, vehicle_id=vehicle_id, year=year)
    if not remarks:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Remarks not found for this vehicle and year"
        )
    return remarks

@router.put("/vehicles/{vehicle_id}/remarks/{year}", response_model=VehicleRemarks)
def update_vehicle_remarks(
    vehicle_id: UUID,
    year: int,
    remarks_data: VehicleRemarksUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update or create remarks for a specific vehicle and year.
    """
    # Check if vehicle exists
    vehicle = crud_emission.vehicle.get_sync(db, id=vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    return crud_emission.vehicle_remarks.update_or_create(
        db,
        vehicle_id=vehicle_id,
        year=year,
        remarks=remarks_data.remarks or "",
        created_by=current_user.id
    )


