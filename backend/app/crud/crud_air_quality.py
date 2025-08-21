from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from app.crud.base_crud import CRUDBase
from app.models.air_quality_models import (
    AirQualityDriver, 
    AirQualityRecord, 
    AirQualityViolation, 
    AirQualityFee,
    AirQualityRecordHistory
)
from app.schemas.air_quality_schemas import (
    AirQualityDriverCreate, 
    AirQualityDriverUpdate,
    AirQualityRecordCreate, 
    AirQualityRecordUpdate,
    AirQualityViolationCreate, 
    AirQualityViolationUpdate,
    AirQualityFeeCreate, 
    AirQualityFeeUpdate,
    AirQualityRecordHistoryCreate
)


class CRUDAirQualityDriver(CRUDBase[AirQualityDriver, AirQualityDriverCreate, AirQualityDriverUpdate]):
    def get_by_license_number(self, db: Session, *, license_number: str) -> Optional[AirQualityDriver]:
        return db.query(self.model).filter(AirQualityDriver.license_number == license_number).first()

    def search_sync(
        self, 
        db: Session, 
        *, 
        search: Optional[str] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[AirQualityDriver]:
        query = db.query(self.model)
        
        if search:
            search_filter = or_(
                func.concat(
                    AirQualityDriver.first_name, ' ',
                    func.coalesce(AirQualityDriver.middle_name, ''), ' ',
                    AirQualityDriver.last_name
                ).ilike(f"%{search}%"),
                AirQualityDriver.license_number.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        return query.offset(skip).limit(limit).all()

    def validate_license_unique_sync(self, db: Session, *, license_number: str, exclude_id: Optional[str] = None) -> bool:
        query = db.query(self.model).filter(AirQualityDriver.license_number == license_number)
        if exclude_id:
            query = query.filter(AirQualityDriver.id != exclude_id)
        return query.first() is None


class CRUDAirQualityRecord(CRUDBase[AirQualityRecord, AirQualityRecordCreate, AirQualityRecordUpdate]):
    def search_sync(
        self, 
        db: Session, 
        *, 
        plate_number: Optional[str] = None,
        operator_name: Optional[str] = None,
        vehicle_type: Optional[str] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[AirQualityRecord]:
        query = db.query(self.model)
        
        if plate_number:
            query = query.filter(AirQualityRecord.plate_number.ilike(f"%{plate_number}%"))
        
        if operator_name:
            query = query.filter(AirQualityRecord.operator_company_name.ilike(f"%{operator_name}%"))
        
        if vehicle_type:
            query = query.filter(AirQualityRecord.vehicle_type.ilike(f"%{vehicle_type}%"))
        
        return query.order_by(desc(AirQualityRecord.updated_at)).offset(skip).limit(limit).all()

    def get_by_plate_number_sync(self, db: Session, *, plate_number: str) -> Optional[AirQualityRecord]:
        return db.query(self.model).filter(AirQualityRecord.plate_number == plate_number).first()

    def count_search_results_sync(
        self, 
        db: Session, 
        *, 
        plate_number: Optional[str] = None,
        operator_name: Optional[str] = None,
        vehicle_type: Optional[str] = None
    ) -> int:
        query = db.query(self.model)
        
        if plate_number:
            query = query.filter(AirQualityRecord.plate_number.ilike(f"%{plate_number}%"))
        
        if operator_name:
            query = query.filter(AirQualityRecord.operator_company_name.ilike(f"%{operator_name}%"))
        
        if vehicle_type:
            query = query.filter(AirQualityRecord.vehicle_type.ilike(f"%{vehicle_type}%"))
        
        return query.count()


class CRUDAirQualityViolation(CRUDBase[AirQualityViolation, AirQualityViolationCreate, AirQualityViolationUpdate]):
    def get_by_record_id_sync(self, db: Session, *, record_id: int) -> List[AirQualityViolation]:
        return db.query(self.model).filter(
            AirQualityViolation.record_id == record_id
        ).order_by(desc(AirQualityViolation.date_of_apprehension)).all()

    def update_payment_status_sync(
        self, 
        db: Session, 
        *, 
        violation_id: int, 
        paid_driver: bool, 
        paid_operator: bool
    ) -> Optional[AirQualityViolation]:
        violation = db.query(self.model).filter(AirQualityViolation.id == violation_id).first()
        if violation:
            violation.paid_driver = paid_driver
            violation.paid_operator = paid_operator
            db.commit()
            db.refresh(violation)
        return violation

    def get_violations_by_driver_sync(self, db: Session, *, driver_id: str) -> List[AirQualityViolation]:
        return db.query(self.model).filter(
            AirQualityViolation.driver_id == driver_id
        ).order_by(desc(AirQualityViolation.date_of_apprehension)).all()


class CRUDAirQualityFee(CRUDBase[AirQualityFee, AirQualityFeeCreate, AirQualityFeeUpdate]):
    def get_by_category_and_level_sync(
        self, 
        db: Session, 
        *, 
        category: str, 
        level: int
    ) -> Optional[AirQualityFee]:
        return db.query(self.model).filter(
            and_(
                AirQualityFee.category == category,
                AirQualityFee.level == level
            )
        ).order_by(desc(AirQualityFee.effective_date)).first()

    def get_current_fees_sync(self, db: Session) -> List[AirQualityFee]:
        return db.query(self.model).order_by(
            AirQualityFee.category, 
            AirQualityFee.level, 
            desc(AirQualityFee.effective_date)
        ).all()


class CRUDAirQualityRecordHistory(CRUDBase[AirQualityRecordHistory, AirQualityRecordHistoryCreate, None]):
    def get_by_record_id_sync(self, db: Session, *, record_id: int) -> List[AirQualityRecordHistory]:
        return db.query(self.model).filter(
            AirQualityRecordHistory.record_id == record_id
        ).order_by(desc(AirQualityRecordHistory.date)).all()

    def add_history_entry_sync(
        self, 
        db: Session, 
        *, 
        record_id: int, 
        entry_type: str, 
        details: Optional[str] = None,
        or_number: Optional[str] = None,
        status: str = "completed"
    ) -> AirQualityRecordHistory:
        from datetime import date
        
        history_data = AirQualityRecordHistoryCreate(
            record_id=record_id,
            type=entry_type,
            date=date.today(),
            details=details,
            or_number=or_number,
            status=status
        )
        return self.create_sync(db=db, obj_in=history_data)


# Create instances
air_quality_driver = CRUDAirQualityDriver(AirQualityDriver)
air_quality_record = CRUDAirQualityRecord(AirQualityRecord)
air_quality_violation = CRUDAirQualityViolation(AirQualityViolation)
air_quality_fee = CRUDAirQualityFee(AirQualityFee)
air_quality_record_history = CRUDAirQualityRecordHistory(AirQualityRecordHistory)
