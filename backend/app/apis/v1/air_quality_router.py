from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.apis.deps import get_db, get_current_user
from app.models.auth_models import User
from app.crud.crud_air_quality import (
    air_quality_driver,
    air_quality_record, 
    air_quality_violation,
    air_quality_fee,
    air_quality_record_history,
    air_quality_order_of_payment
)
from app.schemas.air_quality_schemas import (
    AirQualityDriver,
    AirQualityDriverCreate,
    AirQualityDriverUpdate,
    AirQualityDriverSearchParams,
    AirQualityDriverListResponse,
    AirQualityRecord,
    AirQualityRecordCreate,
    AirQualityRecordUpdate,
    AirQualityRecordSearchParams,
    AirQualityRecordListResponse,
    AirQualityViolation,
    AirQualityViolationCreate,
    AirQualityViolationUpdate,
    AirQualityViolationPaymentUpdate,
    AirQualityViolationListResponse,
    AirQualityFee,
    AirQualityFeeCreate,
    AirQualityFeeUpdate,
    AirQualityRecordHistory,
    AirQualityRecordHistoryCreate,
    AirQualityOrderOfPayment,
    AirQualityOrderOfPaymentCreate,
    AirQualityOrderOfPaymentUpdate,
    AirQualityOrderOfPaymentSearchParams,
    AirQualityOrderOfPaymentListResponse,
    AirQualityDashboardResponse
)

router = APIRouter()


# Driver endpoints
@router.get("/drivers", response_model=AirQualityDriverListResponse)
def get_drivers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get all air quality drivers"""
    drivers = air_quality_driver.get_multi_sync(db=db, skip=skip, limit=limit)
    total = air_quality_driver.count_sync(db=db)
    return AirQualityDriverListResponse(
        drivers=drivers,
        total=total,
        limit=limit,
        offset=skip
    )


@router.get("/drivers/search", response_model=AirQualityDriverListResponse)
def search_drivers(
    search: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Search air quality drivers"""
    drivers = air_quality_driver.search_sync(db=db, search=search, skip=skip, limit=limit)
    # For simplicity, return the count of results found
    total = len(drivers) if not search else air_quality_driver.count_sync(db=db)
    return AirQualityDriverListResponse(
        drivers=drivers,
        total=total,
        limit=limit,
        offset=skip
    )


@router.post("/drivers", response_model=AirQualityDriver)
def create_driver(
    *,
    driver_in: AirQualityDriverCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create new air quality driver"""
    # Check if license number already exists
    if not air_quality_driver.validate_license_unique_sync(db=db, license_number=driver_in.license_number):
        raise HTTPException(
            status_code=400,
            detail="Driver with this license number already exists"
        )
    
    driver = air_quality_driver.create_sync(db=db, obj_in=driver_in)
    return driver


@router.get("/drivers/{driver_id}", response_model=AirQualityDriver)
def get_driver(
    driver_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get air quality driver by ID"""
    driver = air_quality_driver.get_sync(db=db, id=driver_id)
    if not driver:
        raise HTTPException(
            status_code=404,
            detail="Driver not found"
        )
    return driver


@router.put("/drivers/{driver_id}", response_model=AirQualityDriver)
def update_driver(
    *,
    driver_id: str,
    driver_in: AirQualityDriverUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update air quality driver"""
    driver = air_quality_driver.get_sync(db=db, id=driver_id)
    if not driver:
        raise HTTPException(
            status_code=404,
            detail="Driver not found"
        )
    
    # Check license number uniqueness if being updated
    if driver_in.license_number and driver_in.license_number != driver.license_number:
        if not air_quality_driver.validate_license_unique_sync(
            db=db, 
            license_number=driver_in.license_number, 
            exclude_id=driver_id
        ):
            raise HTTPException(
                status_code=400,
                detail="Driver with this license number already exists"
            )
    
    driver = air_quality_driver.update_sync(db=db, db_obj=driver, obj_in=driver_in)
    return driver


@router.delete("/drivers/{driver_id}")
def delete_driver(
    driver_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Delete air quality driver"""
    driver = air_quality_driver.get_sync(db=db, id=driver_id)
    if not driver:
        raise HTTPException(
            status_code=404,
            detail="Driver not found"
        )
    
    air_quality_driver.remove_sync(db=db, id=driver_id)
    return {"message": "Driver deleted successfully"}


# Record endpoints
@router.get("/records", response_model=AirQualityRecordListResponse)
def get_records(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get all air quality records"""
    records = air_quality_record.get_multi_sync(db=db, skip=skip, limit=limit)
    total = air_quality_record.count_sync(db=db)
    return AirQualityRecordListResponse(
        records=records,
        total=total,
        limit=limit,
        offset=skip
    )


@router.get("/records/search", response_model=AirQualityRecordListResponse)
def search_records(
    q: str = None,  # General search term
    plateNumber: str = None,  # Specific plate number search
    operatorName: str = None,  # Specific operator name search
    vehicleType: str = None,  # Specific vehicle type search
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Search air quality records"""
    # If general search term is provided, use it as plate_number for OR logic
    search_plate = q or plateNumber
    
    records = air_quality_record.search_sync(
        db=db,
        plate_number=search_plate,
        operator_name=operatorName,
        vehicle_type=vehicleType,
        skip=skip,
        limit=limit
    )
    total = air_quality_record.count_search_results_sync(
        db=db,
        plate_number=search_plate,
        operator_name=operatorName,
        vehicle_type=vehicleType
    )
    return AirQualityRecordListResponse(
        records=records,
        total=total,
        limit=limit,
        offset=skip
    )


@router.post("/records", response_model=AirQualityRecord)
def create_record(
    *,
    record_in: AirQualityRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create new air quality record"""
    record = air_quality_record.create_sync(db=db, obj_in=record_in)
    
    # Add history entry
    air_quality_record_history.add_history_entry_sync(
        db=db,
        record_id=record.id,
        entry_type="record_created",
        details=f"Vehicle record created for {record.plate_number}",
        status="completed"
    )
    
    return record


@router.get("/records/{record_id}", response_model=AirQualityRecord)
def get_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get air quality record by ID"""
    record = air_quality_record.get_sync(db=db, id=record_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail="Record not found"
        )
    return record


@router.put("/records/{record_id}", response_model=AirQualityRecord)
def update_record(
    *,
    record_id: int,
    record_in: AirQualityRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update air quality record"""
    record = air_quality_record.get_sync(db=db, id=record_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail="Record not found"
        )
    
    record = air_quality_record.update_sync(db=db, db_obj=record, obj_in=record_in)
    
    # Add history entry
    air_quality_record_history.add_history_entry_sync(
        db=db,
        record_id=record.id,
        entry_type="record_updated",
        details=f"Vehicle record updated for {record.plate_number}",
        status="completed"
    )
    
    return record


@router.delete("/records/{record_id}")
def delete_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Delete air quality record"""
    record = air_quality_record.get_sync(db=db, id=record_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail="Record not found"
        )
    
    air_quality_record.remove_sync(db=db, id=record_id)
    return {"message": "Record deleted successfully"}


# Violation endpoints
@router.get("/records/{record_id}/violations", response_model=AirQualityViolationListResponse)
def get_violations_by_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get violations for a specific record"""
    violations = air_quality_violation.get_by_record_id_sync(db=db, record_id=record_id)
    return AirQualityViolationListResponse(
        violations=violations,
        total=len(violations)
    )


@router.post("/violations", response_model=AirQualityViolation)
def create_violation(
    *,
    violation_in: AirQualityViolationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create new air quality violation"""
    # Verify record exists
    record = air_quality_record.get_sync(db=db, id=violation_in.record_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail="Record not found"
        )
    
    violation = air_quality_violation.create_sync(db=db, obj_in=violation_in)
    
    # Add history entry
    air_quality_record_history.add_history_entry_sync(
        db=db,
        record_id=violation.record_id,
        entry_type="violation_created",
        details=f"Violation created at {violation.place_of_apprehension}",
        status="pending"
    )
    
    return violation


@router.put("/violations/{violation_id}", response_model=AirQualityViolation)
def update_violation(
    *,
    violation_id: int,
    violation_in: AirQualityViolationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update air quality violation"""
    violation = air_quality_violation.get_sync(db=db, id=violation_id)
    if not violation:
        raise HTTPException(
            status_code=404,
            detail="Violation not found"
        )
    
    updated_violation = air_quality_violation.update_sync(db=db, db_obj=violation, obj_in=violation_in)
    
    # Add history entry
    air_quality_record_history.add_history_entry_sync(
        db=db,
        record_id=updated_violation.record_id,
        entry_type="violation_updated",
        details="Violation details updated",
        status="completed"
    )
    
    return updated_violation


@router.put("/violations/{violation_id}/payment", response_model=AirQualityViolation)
def update_violation_payment(
    *,
    violation_id: int,
    payment_update: AirQualityViolationPaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update violation payment status"""
    violation = air_quality_violation.update_payment_status_sync(
        db=db,
        violation_id=violation_id,
        paid_driver=payment_update.paid_driver,
        paid_operator=payment_update.paid_operator
    )
    
    if not violation:
        raise HTTPException(
            status_code=404,
            detail="Violation not found"
        )
    
    # Add history entry
    payment_status = "fully_paid" if payment_update.paid_driver and payment_update.paid_operator else "partially_paid"
    air_quality_record_history.add_history_entry_sync(
        db=db,
        record_id=violation.record_id,
        entry_type="payment_update",
        details=f"Payment status updated to {payment_status}",
        status="completed"
    )
    
    return violation


@router.delete("/violations/{violation_id}")
def delete_violation(
    violation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Delete air quality violation"""
    violation = air_quality_violation.get_sync(db=db, id=violation_id)
    if not violation:
        raise HTTPException(
            status_code=404,
            detail="Violation not found"
        )
    
    # Store record_id for history entry
    record_id = violation.record_id
    
    # Delete violation
    air_quality_violation.remove_sync(db=db, id=violation_id)
    
    # Add history entry
    air_quality_record_history.add_history_entry_sync(
        db=db,
        record_id=record_id,
        entry_type="violation_deleted",
        details="Violation deleted",
        status="completed"
    )
    
    return {"message": "Violation deleted successfully"}


@router.get("/violations", response_model=AirQualityViolationListResponse)
def get_all_violations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get all air quality violations"""
    violations = air_quality_violation.get_multi_sync(db=db, skip=skip, limit=limit)
    total_count = air_quality_violation.count_sync(db=db)
    
    return AirQualityViolationListResponse(
        violations=violations,
        total=total_count
    )


# Fee endpoints
@router.get("/fees", response_model=List[AirQualityFee])
def get_fees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get all current air quality fees"""
    return air_quality_fee.get_current_fees_sync(db=db)


@router.post("/fees", response_model=AirQualityFee)
def create_fee(
    *,
    fee_in: AirQualityFeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create new air quality fee"""
    return air_quality_fee.create_sync(db=db, obj_in=fee_in)


# History endpoints
@router.get("/records/{record_id}/history", response_model=List[AirQualityRecordHistory])
def get_record_history(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get history for a specific record"""
    return air_quality_record_history.get_by_record_id_sync(db=db, record_id=record_id)


# Order of Payment endpoints
@router.get("/orders-of-payment", response_model=AirQualityOrderOfPaymentListResponse)
def get_orders_of_payment(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get all orders of payment"""
    orders = air_quality_order_of_payment.get_multi_sync(db=db, skip=skip, limit=limit)
    total = air_quality_order_of_payment.count_sync(db=db)
    return AirQualityOrderOfPaymentListResponse(
        orders=orders,
        total=total,
        limit=limit,
        offset=skip
    )


@router.get("/orders-of-payment/search", response_model=AirQualityOrderOfPaymentListResponse)
def search_orders_of_payment(
    search: str = None,
    control_number: str = None,
    plate_number: str = None,
    status: str = None,
    created_date: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Search orders of payment"""
    orders = air_quality_order_of_payment.search_sync(
        db=db,
        search=search,
        control_number=control_number,
        plate_number=plate_number,
        status=status,
        created_date=created_date,
        skip=skip,
        limit=limit
    )
    # For simplicity, return the count of results found
    total = len(orders) if any([search, control_number, plate_number, status, created_date]) else air_quality_order_of_payment.count_sync(db=db)
    return AirQualityOrderOfPaymentListResponse(
        orders=orders,
        total=total,
        limit=limit,
        offset=skip
    )


@router.post("/orders-of-payment", response_model=AirQualityOrderOfPayment)
def create_order_of_payment(
    *,
    order_in: AirQualityOrderOfPaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create new order of payment"""
    order = air_quality_order_of_payment.create_sync(db=db, obj_in=order_in)
    return order


@router.get("/orders-of-payment/{order_id}", response_model=AirQualityOrderOfPayment)
def get_order_of_payment(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get order of payment by ID"""
    order = air_quality_order_of_payment.get_sync(db=db, id=order_id)
    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order of payment not found"
        )
    return order


@router.put("/orders-of-payment/{order_id}", response_model=AirQualityOrderOfPayment)
def update_order_of_payment(
    *,
    order_id: str,
    order_in: AirQualityOrderOfPaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update order of payment"""
    order = air_quality_order_of_payment.get_sync(db=db, id=order_id)
    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order of payment not found"
        )
    order = air_quality_order_of_payment.update_sync(db=db, db_obj=order, obj_in=order_in)
    return order


@router.delete("/orders-of-payment/{order_id}")
def delete_order_of_payment(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Delete order of payment"""
    order = air_quality_order_of_payment.get_sync(db=db, id=order_id)
    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order of payment not found"
        )
    air_quality_order_of_payment.delete_sync(db=db, id=order_id)
    return {"message": "Order of payment deleted successfully"}


# Dashboard Statistics Endpoint
@router.get("/dashboard", response_model=AirQualityDashboardResponse)
def get_dashboard_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get comprehensive air quality dashboard statistics"""
    
    # Get dashboard statistics using CRUD methods
    dashboard_data = air_quality_record.get_dashboard_statistics_sync(db=db)
    
    return AirQualityDashboardResponse(**dashboard_data)
