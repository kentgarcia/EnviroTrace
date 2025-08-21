from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from app.crud.base_crud import CRUDBase
from app.models.belching_models import Driver, Record, Violation, Fee
from app.schemas.belching_schemas import (
    DriverCreate, DriverUpdate, DriverSearchParams,
    RecordCreate, RecordUpdate,
    ViolationCreate, ViolationUpdate,
    FeeCreate, FeeUpdate
)
from uuid import UUID

class CRUDDriver(CRUDBase[Driver, DriverCreate, DriverUpdate]):
    def get_sync(self, db: Session, *, id: UUID) -> Optional[Driver]:
        """Synchronous version of get for use with sync sessions"""
        return db.query(self.model).filter(self.model.id == id).first()
    
    def get_multi_sync(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Driver]:
        """Synchronous version of get_multi for use with sync sessions"""
        return db.query(self.model).offset(skip).limit(limit).all()
    
    def create_sync(self, db: Session, *, obj_in: DriverCreate) -> Driver:
        """Synchronous version of create for use with sync sessions"""
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update_sync(self, db: Session, *, db_obj: Driver, obj_in: DriverUpdate) -> Driver:
        """Synchronous version of update for use with sync sessions"""
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def delete_sync(self, db: Session, *, id: UUID) -> Driver:
        """Synchronous version of delete for use with sync sessions"""
        obj = db.query(self.model).filter(self.model.id == id).first()
        if obj:
            db.delete(obj)
            db.commit()
        return obj
    
    def search_drivers(
        self, 
        db: Session, 
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Driver]:
        """Search drivers by name or license number"""
        query = db.query(Driver)
        
        if search:
            search_filter = or_(
                Driver.first_name.ilike(f"%{search}%"),
                Driver.last_name.ilike(f"%{search}%"),
                Driver.license_number.ilike(f"%{search}%"),
                (Driver.first_name + " " + Driver.last_name).ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        return query.order_by(desc(Driver.created_at)).offset(offset).limit(limit).all()
    
    def get_by_license_number(self, db: Session, license_number: str) -> Optional[Driver]:
        """Get driver by license number"""
        return db.query(Driver).filter(Driver.license_number == license_number).first()
    
    def check_license_exists(self, db: Session, license_number: str, exclude_id: Optional[UUID] = None) -> bool:
        """Check if license number already exists"""
        query = db.query(Driver).filter(Driver.license_number == license_number)
        if exclude_id:
            query = query.filter(Driver.id != exclude_id)
        return query.first() is not None

class CRUDRecord(CRUDBase[Record, RecordCreate, RecordUpdate]):
    def get_by_plate_number(self, db: Session, plate_number: str) -> Optional[Record]:
        """Get record by plate number"""
        return db.query(Record).filter(Record.plate_number == plate_number).first()
    
    def search_records(
        self,
        db: Session,
        plate_number: Optional[str] = None,
        operator_company: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Record]:
        """Search records by various criteria"""
        query = db.query(Record)
        
        if plate_number:
            query = query.filter(Record.plate_number.ilike(f"%{plate_number}%"))
        
        if operator_company:
            query = query.filter(Record.operator_company_name.ilike(f"%{operator_company}%"))
        
        return query.order_by(desc(Record.created_at)).offset(offset).limit(limit).all()

class CRUDViolation(CRUDBase[Violation, ViolationCreate, ViolationUpdate]):
    def get_by_record_id(self, db: Session, record_id: int) -> List[Violation]:
        """Get all violations for a specific record"""
        return db.query(Violation).filter(Violation.record_id == record_id).order_by(desc(Violation.date_of_apprehension)).all()
    
    def get_by_driver_id(self, db: Session, driver_id: UUID) -> List[Violation]:
        """Get all violations for a specific driver"""
        return db.query(Violation).filter(Violation.driver_id == driver_id).order_by(desc(Violation.date_of_apprehension)).all()
    
    def update_payment_status(
        self, 
        db: Session, 
        violation_id: int, 
        paid_driver: Optional[bool] = None, 
        paid_operator: Optional[bool] = None
    ) -> Optional[Violation]:
        """Update payment status for a violation"""
        violation = db.query(Violation).filter(Violation.id == violation_id).first()
        if violation:
            if paid_driver is not None:
                violation.paid_driver = paid_driver
            if paid_operator is not None:
                violation.paid_operator = paid_operator
            db.commit()
            db.refresh(violation)
        return violation

class CRUDFee(CRUDBase[Fee, FeeCreate, FeeUpdate]):
    def get_by_category_and_level(self, db: Session, category: str, level: int) -> Optional[Fee]:
        """Get fee by category and level"""
        return db.query(Fee).filter(
            and_(Fee.category == category, Fee.level == level)
        ).first()
    
    def get_active_fees(self, db: Session) -> List[Fee]:
        """Get all active fees ordered by category and level"""
        return db.query(Fee).order_by(Fee.category, Fee.level).all()
    
    def get_base_fees(self, db: Session) -> List[Fee]:
        """Get all level 0 (base) fees"""
        return db.query(Fee).filter(Fee.level == 0).order_by(Fee.category).all()
    
    def get_penalty_fees(self, db: Session) -> List[Fee]:
        """Get all level 1+ (penalty) fees"""
        return db.query(Fee).filter(Fee.level > 0).order_by(Fee.category, Fee.level).all()

# Create instances
driver_crud = CRUDDriver(Driver)
record_crud = CRUDRecord(Record)
violation_crud = CRUDViolation(Violation)
fee_crud = CRUDFee(Fee)
