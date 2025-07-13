from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.apis.deps import get_db
from app.crud.crud_fee import air_quality_fee
from app.schemas.fee_schemas import AirQualityFee, AirQualityFeeCreate, AirQualityFeeUpdate

router = APIRouter()


@router.get("/", response_model=List[AirQualityFee])
def read_air_quality_fees(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve air quality fees.
    """
    try:
        fees = air_quality_fee.get_multi_sync(db, skip=skip, limit=limit)
        return fees
    except Exception as e:
        print(f"Error in read_air_quality_fees: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/", response_model=AirQualityFee)
def create_air_quality_fee(
    *,
    db: Session = Depends(get_db),
    fee_in: AirQualityFeeCreate,
):
    """
    Create new air quality fee.
    """
    fee_obj = air_quality_fee.create_sync(db=db, obj_in=fee_in)
    return fee_obj


@router.put("/{fee_id}", response_model=AirQualityFee)
def update_air_quality_fee(
    *,
    db: Session = Depends(get_db),
    fee_id: int,
    fee_in: AirQualityFeeUpdate,
):
    """
    Update air quality fee.
    """
    fee_obj = air_quality_fee.get_by_fee_id(db, fee_id=fee_id)
    if not fee_obj:
        raise HTTPException(
            status_code=404,
            detail="Fee not found",
        )
    fee_obj = air_quality_fee.update_sync(db=db, db_obj=fee_obj, obj_in=fee_in)
    return fee_obj


@router.get("/{fee_id}", response_model=AirQualityFee)
def read_air_quality_fee(
    *,
    db: Session = Depends(get_db),
    fee_id: int,
):
    """
    Get air quality fee by ID.
    """
    fee_obj = air_quality_fee.get_by_fee_id(db, fee_id=fee_id)
    if not fee_obj:
        raise HTTPException(
            status_code=404,
            detail="Fee not found",
        )
    return fee_obj


@router.delete("/{fee_id}")
def delete_air_quality_fee(
    *,
    db: Session = Depends(get_db),
    fee_id: int,
):
    """
    Delete air quality fee.
    """
    fee_obj = air_quality_fee.get_by_fee_id(db, fee_id=fee_id)
    if not fee_obj:
        raise HTTPException(
            status_code=404,
            detail="Fee not found",
        )
    air_quality_fee.remove_sync(db=db, fee_id=fee_id)
    return {"message": "Fee deleted successfully"}


@router.get("/category/{category}", response_model=List[AirQualityFee])
def read_air_quality_fees_by_category(
    *,
    db: Session = Depends(get_db),
    category: str,
):
    """
    Get air quality fees by category.
    """
    fees = air_quality_fee.get_by_category(db, category=category)
    return fees


@router.get("/offense-level/{offense_level}", response_model=List[AirQualityFee])
def read_air_quality_fees_by_offense_level(
    *,
    db: Session = Depends(get_db),
    offense_level: int,
):
    """
    Get air quality fees by offense level.
    """
    fees = air_quality_fee.get_by_offense_level(db, offense_level=offense_level)
    return fees