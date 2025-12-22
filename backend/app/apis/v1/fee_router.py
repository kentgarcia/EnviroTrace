from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.apis.deps import get_db
from app.crud.crud_fee import urban_greening_fee_record
from app.schemas.fee_schemas import (
    UrbanGreeningFeeRecord, UrbanGreeningFeeRecordCreate, UrbanGreeningFeeRecordUpdate
)

router = APIRouter()

# Urban Greening Fee Records Endpoints (must come before generic /{fee_id} routes)
@router.get("/urban-greening", response_model=List[UrbanGreeningFeeRecord])
def read_urban_greening_fee_records(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    """
    Retrieve urban greening fee records.
    """
    return urban_greening_fee_record.get_multi_sync(db, skip=skip, limit=limit)

@router.get("/urban-greening/search", response_model=List[UrbanGreeningFeeRecord])
def search_urban_greening_fee_records(
    q: str = Query(..., min_length=1, description="Search text for reference number or payer name"),
    db: Session = Depends(get_db),
    limit: int = 25,
):
    """Lightweight search endpoint for fee record linking.
    Performs ILIKE search on reference_number and payer_name. Limited result size to keep UI snappy.
    """
    q_like = f"%{q}%"
    # Inline query to avoid adding a special CRUD method yet; can be refactored later.
    from app.models.urban_greening_models import FeeRecord  # local import to avoid circulars
    query = db.query(FeeRecord).filter(
        (FeeRecord.reference_number.ilike(q_like)) | (FeeRecord.payer_name.ilike(q_like))
    ).order_by(FeeRecord.created_at.desc()).limit(limit)
    return query.all()

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

# Air Quality fee endpoints removed per client request