from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base_crud import CRUDBase
from app.models.fee_models import AirQualityFee
from app.models.urban_greening_models import FeeRecord
from app.schemas.fee_schemas import (
    AirQualityFeeCreate, AirQualityFeeUpdate,
    UrbanGreeningFeeRecordCreate, UrbanGreeningFeeRecordUpdate
)


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


class CRUDUrbanGreeningFeeRecord(CRUDBase[FeeRecord, UrbanGreeningFeeRecordCreate, UrbanGreeningFeeRecordUpdate]):
    def get(self, db: Session, *, id: str) -> Optional[FeeRecord]:
        """Synchronous version of get for use with sync sessions"""
        return db.query(FeeRecord).filter(FeeRecord.id == id).first()
    
    def get_by_reference_number(self, db: Session, *, reference_number: str) -> Optional[FeeRecord]:
        return db.query(FeeRecord).filter(FeeRecord.reference_number == reference_number).first()

    def get_by_type(self, db: Session, *, type: str) -> List[FeeRecord]:
        return db.query(FeeRecord).filter(FeeRecord.type == type).all()

    def get_by_status(self, db: Session, *, status: str) -> List[FeeRecord]:
        return db.query(FeeRecord).filter(FeeRecord.status == status).all()

    def get_by_payer(self, db: Session, *, payer_name: str) -> List[FeeRecord]:
        return db.query(FeeRecord).filter(FeeRecord.payer_name.ilike(f"%{payer_name}%")).all()

    def get_overdue_records(self, db: Session) -> List[FeeRecord]:
        from datetime import date
        return db.query(FeeRecord).filter(
            FeeRecord.due_date < date.today(),
            FeeRecord.status.in_(["pending", "overdue"])
        ).all()

    def get_by_year(self, db: Session, *, year: int) -> List[FeeRecord]:
        """Get fee records for a specific year based on the date field"""
        from sqlalchemy import extract
        return db.query(FeeRecord).filter(
            extract('year', FeeRecord.date) == year
        ).all()

    def get_sync(self, db: Session, *, id: str) -> Optional[FeeRecord]:
        """Synchronous version of get for use with sync sessions"""
        return db.query(FeeRecord).filter(FeeRecord.id == id).first()

    def get_multi_sync(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[FeeRecord]:
        """Synchronous version of get_multi for use with sync sessions"""
        return db.query(FeeRecord).offset(skip).limit(limit).all()

    def create_sync(self, db: Session, *, obj_in: UrbanGreeningFeeRecordCreate) -> FeeRecord:
        """Synchronous version of create for use with sync sessions"""
        obj_in_data = obj_in.model_dump()
        db_obj = FeeRecord(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_sync(self, db: Session, *, db_obj: FeeRecord, obj_in: UrbanGreeningFeeRecordUpdate) -> FeeRecord:
        """Synchronous version of update for use with sync sessions"""
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove_sync(self, db: Session, *, id: str) -> Optional[FeeRecord]:
        """Synchronous version of remove for use with sync sessions"""
        obj = db.query(FeeRecord).filter(FeeRecord.id == id).first()
        if obj:
            db.delete(obj)
            db.commit()
        return obj


urban_greening_fee_record = CRUDUrbanGreeningFeeRecord(FeeRecord)