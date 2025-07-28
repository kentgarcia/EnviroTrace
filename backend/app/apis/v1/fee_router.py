from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.apis.deps import get_db
from app.crud.crud_fee import air_quality_fee, urban_greening_fee_record
from app.schemas.fee_schemas import (
    AirQualityFee, AirQualityFeeCreate, AirQualityFeeUpdate,
    UrbanGreeningFeeRecord, UrbanGreeningFeeRecordCreate, UrbanGreeningFeeRecordUpdate
)

router = APIRouter()

@router.get("/", response_model=List[AirQualityFee])
def read_air_quality_fees(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    """
    Retrieve air quality fees.
    """
    return air_quality_fee.get_multi_sync(db, skip=skip, limit=limit)

@router.post("/", response_model=AirQualityFee)
def create_air_quality_fee(fee_in: AirQualityFeeCreate, db: Session = Depends(get_db)):
    """
    Create new air quality fee.
    """
    return air_quality_fee.create_sync(db=db, obj_in=fee_in)

@router.put("/{fee_id}", response_model=AirQualityFee)
def update_air_quality_fee(fee_id: str, fee_in: AirQualityFeeUpdate, db: Session = Depends(get_db)):
    """
    Update air quality fee.
    """
    fee_obj = air_quality_fee.get_by_fee_id(db, fee_id=fee_id)
    if not fee_obj:
        raise HTTPException(status_code=404, detail="Fee not found")
    return air_quality_fee.update_sync(db=db, db_obj=fee_obj, obj_in=fee_in)

@router.get("/{fee_id}", response_model=AirQualityFee)
def read_air_quality_fee(fee_id: str, db: Session = Depends(get_db)):
    """
    Get air quality fee by ID.
    """
    fee_obj = air_quality_fee.get_by_fee_id(db, fee_id=fee_id)
    if not fee_obj:
        raise HTTPException(status_code=404, detail="Fee not found")
    return fee_obj

@router.delete("/{fee_id}")
def delete_air_quality_fee(fee_id: str, db: Session = Depends(get_db)):
    """
    Delete air quality fee.
    """
    fee_obj = air_quality_fee.get_by_fee_id(db, fee_id=fee_id)
    if not fee_obj:
        raise HTTPException(status_code=404, detail="Fee not found")
    air_quality_fee.remove_sync(db=db, fee_id=fee_id)
    return {"message": "Fee deleted successfully"}

@router.get("/category/{category}", response_model=List[AirQualityFee])
def read_air_quality_fees_by_category(category: str, db: Session = Depends(get_db)):
    """
    Get air quality fees by category.
    """
    return air_quality_fee.get_by_category(db, category=category)

@router.get("/offense-level/{level}", response_model=List[AirQualityFee])
def read_air_quality_fees_by_level(level: int, db: Session = Depends(get_db)):
    """
    Get air quality fees by offense level.
    """
    return air_quality_fee.get_by_level(db, level=level)


# Urban Greening Fee Records Endpoints
@router.get("/urban-greening", response_model=List[UrbanGreeningFeeRecord])
def read_urban_greening_fee_records(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    """
    Retrieve urban greening fee records.
    """
    return urban_greening_fee_record.get_multi_sync(db, skip=skip, limit=limit)

@router.post("/urban-greening", response_model=UrbanGreeningFeeRecord)
def create_urban_greening_fee_record(record_in: UrbanGreeningFeeRecordCreate, db: Session = Depends(get_db)):
    """
    Create new urban greening fee record.
    """
    # Check if reference number already exists
    existing = urban_greening_fee_record.get_by_reference_number(db, reference_number=record_in.reference_number)
    if existing:
        raise HTTPException(status_code=400, detail="Reference number already exists")
    
    return urban_greening_fee_record.create_sync(db=db, obj_in=record_in)

@router.get("/urban-greening/{record_id}", response_model=UrbanGreeningFeeRecord)
def read_urban_greening_fee_record(record_id: str, db: Session = Depends(get_db)):
    """
    Get urban greening fee record by ID.
    """
    record = urban_greening_fee_record.get(db, id=record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Fee record not found")
    return record

@router.put("/urban-greening/{record_id}", response_model=UrbanGreeningFeeRecord)
def update_urban_greening_fee_record(record_id: str, record_in: UrbanGreeningFeeRecordUpdate, db: Session = Depends(get_db)):
    """
    Update urban greening fee record.
    """
    record = urban_greening_fee_record.get(db, id=record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Fee record not found")
    return urban_greening_fee_record.update_sync(db=db, db_obj=record, obj_in=record_in)

@router.delete("/urban-greening/{record_id}")
def delete_urban_greening_fee_record(record_id: str, db: Session = Depends(get_db)):
    """
    Delete urban greening fee record.
    """
    record = urban_greening_fee_record.get(db, id=record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Fee record not found")
    urban_greening_fee_record.remove_sync(db=db, id=record_id)
    return {"message": "Fee record deleted successfully"}

@router.get("/urban-greening/reference/{reference_number}", response_model=UrbanGreeningFeeRecord)
def read_urban_greening_fee_record_by_reference(reference_number: str, db: Session = Depends(get_db)):
    """
    Get urban greening fee record by reference number.
    """
    record = urban_greening_fee_record.get_by_reference_number(db, reference_number=reference_number)
    if not record:
        raise HTTPException(status_code=404, detail="Fee record not found")
    return record

@router.get("/urban-greening/type/{fee_type}", response_model=List[UrbanGreeningFeeRecord])
def read_urban_greening_fee_records_by_type(fee_type: str, db: Session = Depends(get_db)):
    """
    Get urban greening fee records by type.
    """
    return urban_greening_fee_record.get_by_type(db, type=fee_type)

@router.get("/urban-greening/status/{status}", response_model=List[UrbanGreeningFeeRecord])
def read_urban_greening_fee_records_by_status(status: str, db: Session = Depends(get_db)):
    """
    Get urban greening fee records by status.
    """
    return urban_greening_fee_record.get_by_status(db, status=status)

@router.get("/urban-greening/payer/{payer_name}", response_model=List[UrbanGreeningFeeRecord])
def read_urban_greening_fee_records_by_payer(payer_name: str, db: Session = Depends(get_db)):
    """
    Get urban greening fee records by payer name.
    """
    return urban_greening_fee_record.get_by_payer(db, payer_name=payer_name)

@router.get("/urban-greening/overdue", response_model=List[UrbanGreeningFeeRecord])
def read_overdue_urban_greening_fee_records(db: Session = Depends(get_db)):
    """
    Get overdue urban greening fee records.
    """
    return urban_greening_fee_record.get_overdue_records(db)