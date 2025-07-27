from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.apis.deps import get_db
from app.crud.crud_fee import air_quality_fee
from app.schemas.fee_schemas import AirQualityFee, AirQualityFeeCreate, AirQualityFeeUpdate

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