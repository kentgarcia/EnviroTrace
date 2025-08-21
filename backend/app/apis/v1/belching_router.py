from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.apis.deps import get_db, get_current_user
from app.models.auth_models import User
from app.crud.crud_belching import driver_crud, record_crud, violation_crud, fee_crud
from app.schemas.belching_schemas import (
    Driver, DriverCreate, DriverUpdate, DriverSearchParams, DriverListResponse,
    Record, RecordCreate, RecordUpdate,
    Violation, ViolationCreate, ViolationUpdate,
    Fee, FeeCreate, FeeUpdate
)

router = APIRouter()

# Driver endpoints
@router.get("/drivers/search", response_model=DriverListResponse)
def search_drivers(
    search: Optional[str] = Query(None, description="Search by name or license number"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search drivers by name or license number"""
    drivers = driver_crud.search_drivers(db, search=search, limit=limit, offset=offset)
    total = len(drivers)  # For now, return the count of results
    
    return DriverListResponse(
        drivers=drivers,
        total=total,
        limit=limit,
        offset=offset
    )

@router.get("/drivers", response_model=List[Driver])
def get_all_drivers(
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all drivers with optional search"""
    return driver_crud.search_drivers(db, search=search, limit=limit, offset=offset)

@router.post("/drivers", response_model=Driver)
def create_driver(
    driver_in: DriverCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new driver"""
    # Check if license number already exists
    if driver_crud.check_license_exists(db, driver_in.license_number):
        raise HTTPException(
            status_code=400,
            detail="License number already exists"
        )
    
    return driver_crud.create_sync(db, obj_in=driver_in)

@router.get("/drivers/{driver_id}", response_model=Driver)
def get_driver(
    driver_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get driver by ID"""
    driver = driver_crud.get_sync(db, id=driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

@router.put("/drivers/{driver_id}", response_model=Driver)
def update_driver(
    driver_id: UUID,
    driver_in: DriverUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update driver"""
    driver = driver_crud.get_sync(db, id=driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    # Check if license number already exists (excluding current driver)
    if driver_in.license_number and driver_crud.check_license_exists(db, driver_in.license_number, exclude_id=driver_id):
        raise HTTPException(
            status_code=400,
            detail="License number already exists"
        )
    
    return driver_crud.update_sync(db, db_obj=driver, obj_in=driver_in)

@router.delete("/drivers/{driver_id}")
def delete_driver(
    driver_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete driver"""
    driver = driver_crud.get_sync(db, id=driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    driver_crud.delete_sync(db, id=driver_id)
    return {"message": "Driver deleted successfully"}

# Record endpoints
@router.get("/records", response_model=List[Record])
def get_records(
    plate_number: Optional[str] = Query(None),
    operator_company: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get records with optional search"""
    return record_crud.search_records(
        db, 
        plate_number=plate_number, 
        operator_company=operator_company,
        limit=limit, 
        offset=offset
    )

@router.post("/records", response_model=Record)
def create_record(
    record_in: RecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new record"""
    return record_crud.create(db, obj_in=record_in)

@router.get("/records/{record_id}", response_model=Record)
def get_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get record by ID"""
    record = record_crud.get(db, id=record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record

@router.put("/records/{record_id}", response_model=Record)
def update_record(
    record_id: int,
    record_in: RecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update record"""
    record = record_crud.get(db, id=record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    return record_crud.update(db, db_obj=record, obj_in=record_in)

@router.delete("/records/{record_id}")
def delete_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete record"""
    record = record_crud.get(db, id=record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    record_crud.remove(db, id=record_id)
    return {"message": "Record deleted successfully"}

# Violation endpoints
@router.get("/records/{record_id}/violations", response_model=List[Violation])
def get_record_violations(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all violations for a record"""
    return violation_crud.get_by_record_id(db, record_id=record_id)

@router.post("/violations", response_model=Violation)
def create_violation(
    violation_in: ViolationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new violation"""
    # Verify record exists
    record = record_crud.get(db, id=violation_in.record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    # Verify driver exists if provided
    if violation_in.driver_id:
        driver = driver_crud.get(db, id=violation_in.driver_id)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")
    
    return violation_crud.create(db, obj_in=violation_in)

@router.put("/violations/{violation_id}", response_model=Violation)
def update_violation(
    violation_id: int,
    violation_in: ViolationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update violation"""
    violation = violation_crud.get(db, id=violation_id)
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    # Verify driver exists if provided
    if violation_in.driver_id:
        driver = driver_crud.get(db, id=violation_in.driver_id)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")
    
    return violation_crud.update(db, db_obj=violation, obj_in=violation_in)

@router.patch("/violations/{violation_id}/payment")
def update_violation_payment_status(
    violation_id: int,
    paid_driver: Optional[bool] = None,
    paid_operator: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update payment status for a violation"""
    violation = violation_crud.update_payment_status(
        db, 
        violation_id=violation_id, 
        paid_driver=paid_driver, 
        paid_operator=paid_operator
    )
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    return {"message": "Payment status updated successfully"}

# Fee endpoints
@router.get("/fees", response_model=List[Fee])
def get_fees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all active fees"""
    return fee_crud.get_active_fees(db)

@router.get("/fees/base", response_model=List[Fee])
def get_base_fees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all base fees (level 0)"""
    return fee_crud.get_base_fees(db)

@router.get("/fees/penalties", response_model=List[Fee])
def get_penalty_fees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all penalty fees (level 1+)"""
    return fee_crud.get_penalty_fees(db)

@router.post("/fees", response_model=Fee)
def create_fee(
    fee_in: FeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new fee"""
    # Check if fee with same category and level already exists
    existing_fee = fee_crud.get_by_category_and_level(db, fee_in.category, fee_in.level)
    if existing_fee:
        raise HTTPException(
            status_code=400,
            detail=f"Fee for category '{fee_in.category}' and level {fee_in.level} already exists"
        )
    
    return fee_crud.create(db, obj_in=fee_in)

@router.put("/fees/{fee_id}", response_model=Fee)
def update_fee(
    fee_id: int,
    fee_in: FeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update fee"""
    fee = fee_crud.get(db, id=fee_id)
    if not fee:
        raise HTTPException(status_code=404, detail="Fee not found")
    
    return fee_crud.update(db, db_obj=fee, obj_in=fee_in)

@router.delete("/fees/{fee_id}")
def delete_fee(
    fee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete fee"""
    fee = fee_crud.get(db, id=fee_id)
    if not fee:
        raise HTTPException(status_code=404, detail="Fee not found")
    
    fee_crud.remove(db, id=fee_id)
    return {"message": "Fee deleted successfully"}
