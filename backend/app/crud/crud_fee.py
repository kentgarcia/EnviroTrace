from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base_crud import CRUDBase
from app.models.fee_models import AirQualityFee
from app.schemas.fee_schemas import AirQualityFeeCreate, AirQualityFeeUpdate


class CRUDAirQualityFee(CRUDBase[AirQualityFee, AirQualityFeeCreate, AirQualityFeeUpdate]):
    def get_by_fee_id(self, db: Session, *, fee_id: str) -> Optional[AirQualityFee]:
        return db.query(AirQualityFee).filter(AirQualityFee.fee_id == fee_id).first()

    def get_by_category(self, db: Session, *, category: str) -> List[AirQualityFee]:
        return db.query(AirQualityFee).filter(AirQualityFee.category == category).all()

    def get_by_level(self, db: Session, *, level: int) -> List[AirQualityFee]:
        return db.query(AirQualityFee).filter(AirQualityFee.level == level).all()

    def get_multi_sync(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[AirQualityFee]:
        """Synchronous version of get_multi for use with sync sessions"""
        return db.query(AirQualityFee).offset(skip).limit(limit).all()

    def create_sync(self, db: Session, *, obj_in: AirQualityFeeCreate) -> AirQualityFee:
        """Synchronous version of create for use with sync sessions"""
        obj_in_data = obj_in.model_dump()
        db_obj = AirQualityFee(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_sync(self, db: Session, *, db_obj: AirQualityFee, obj_in: AirQualityFeeUpdate) -> AirQualityFee:
        """Synchronous version of update for use with sync sessions"""
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove_sync(self, db: Session, *, fee_id: str) -> Optional[AirQualityFee]:
        """Synchronous version of remove for use with sync sessions"""
        obj = db.query(AirQualityFee).filter(AirQualityFee.fee_id == str(fee_id)).first()
        if obj:
            db.delete(obj)
            db.commit()
        return obj


air_quality_fee = CRUDAirQualityFee(AirQualityFee)