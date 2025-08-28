from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, case
from app.crud.base_crud import CRUDBase
from app.models.air_quality_models import (
    AirQualityDriver, 
    AirQualityRecord, 
    AirQualityViolation, 
    AirQualityFee,
    AirQualityRecordHistory,
    AirQualityOrderOfPayment
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
    AirQualityRecordHistoryCreate,
    AirQualityOrderOfPaymentCreate,
    AirQualityOrderOfPaymentUpdate
)


class CRUDAirQualityDriver(CRUDBase[AirQualityDriver, AirQualityDriverCreate, AirQualityDriverUpdate]):
    def get_by_license_number(self, db: Session, *, license_number: str) -> Optional[AirQualityDriver]:
        return db.query(self.model).filter(AirQualityDriver.license_number == license_number).first()

    def get_sync(self, db: Session, *, id: Any) -> Optional[AirQualityDriver]:
        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi_sync(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[AirQualityDriver]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def create_sync(self, db: Session, *, obj_in: AirQualityDriverCreate) -> AirQualityDriver:
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_sync(self, db: Session, *, db_obj: AirQualityDriver, obj_in: AirQualityDriverUpdate) -> AirQualityDriver:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove_sync(self, db: Session, *, id: Any) -> Optional[AirQualityDriver]:
        obj = self.get_sync(db, id=id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

    def count_sync(self, db: Session) -> int:
        return db.query(self.model).count()

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
    def get_sync(self, db: Session, *, id: Any) -> Optional[AirQualityRecord]:
        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi_sync(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[AirQualityRecord]:
        return db.query(self.model).order_by(desc(self.model.updated_at)).offset(skip).limit(limit).all()

    def create_sync(self, db: Session, *, obj_in: AirQualityRecordCreate) -> AirQualityRecord:
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_sync(self, db: Session, *, db_obj: AirQualityRecord, obj_in: AirQualityRecordUpdate) -> AirQualityRecord:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove_sync(self, db: Session, *, id: Any) -> Optional[AirQualityRecord]:
        obj = self.get_sync(db, id=id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

    def count_sync(self, db: Session) -> int:
        return db.query(self.model).count()

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
        
        # Check if we have the same search term in multiple parameters (frontend OR search)
        if plate_number and operator_name and plate_number == operator_name:
            # Same search term - use OR logic to search across fields
            search_filter = or_(
                AirQualityRecord.plate_number.ilike(f"%{plate_number}%"),
                AirQualityRecord.operator_company_name.ilike(f"%{plate_number}%")
            )
            query = query.filter(search_filter)
        elif plate_number and not operator_name and not vehicle_type:
            # Single search term for plate_number - search across plate_number and operator_company_name
            search_filter = or_(
                AirQualityRecord.plate_number.ilike(f"%{plate_number}%"),
                AirQualityRecord.operator_company_name.ilike(f"%{plate_number}%")
            )
            query = query.filter(search_filter)
        else:
            # Multiple specific filters - use AND logic
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
        
        # Check if we have the same search term in multiple parameters (frontend OR search)
        if plate_number and operator_name and plate_number == operator_name:
            # Same search term - use OR logic to search across fields
            search_filter = or_(
                AirQualityRecord.plate_number.ilike(f"%{plate_number}%"),
                AirQualityRecord.operator_company_name.ilike(f"%{plate_number}%")
            )
            query = query.filter(search_filter)
        elif plate_number and not operator_name and not vehicle_type:
            # Single search term for plate_number - search across plate_number and operator_company_name
            search_filter = or_(
                AirQualityRecord.plate_number.ilike(f"%{plate_number}%"),
                AirQualityRecord.operator_company_name.ilike(f"%{plate_number}%")
            )
            query = query.filter(search_filter)
        else:
            # Multiple specific filters - use AND logic
            if plate_number:
                query = query.filter(AirQualityRecord.plate_number.ilike(f"%{plate_number}%"))
            
            if operator_name:
                query = query.filter(AirQualityRecord.operator_company_name.ilike(f"%{operator_name}%"))
            
            if vehicle_type:
                query = query.filter(AirQualityRecord.vehicle_type.ilike(f"%{vehicle_type}%"))
        
        return query.count()

    def get_dashboard_statistics_sync(self, db: Session) -> Dict[str, Any]:
        """Get comprehensive dashboard statistics for air quality data"""
        from datetime import datetime, timedelta
        
        # Basic counts
        total_records = db.query(AirQualityRecord).count()
        total_violations = db.query(AirQualityViolation).count()
        total_drivers = db.query(AirQualityDriver).count()
        total_fees = db.query(AirQualityFee).count()
        
        # Payment statistics
        paid_driver_violations = db.query(AirQualityViolation).filter(AirQualityViolation.paid_driver == True).count()
        paid_operator_violations = db.query(AirQualityViolation).filter(AirQualityViolation.paid_operator == True).count()
        
        # Calculate percentages
        paid_driver_percentage = (paid_driver_violations / total_violations * 100) if total_violations > 0 else 0
        paid_operator_percentage = (paid_operator_violations / total_violations * 100) if total_violations > 0 else 0
        
        # Vehicle type breakdown
        vehicle_type_stats = db.query(
            AirQualityRecord.vehicle_type,
            func.count(AirQualityRecord.id).label('count')
        ).group_by(AirQualityRecord.vehicle_type).all()
        
        vehicle_types = [
            {"vehicle_type": vt[0], "count": vt[1]} 
            for vt in vehicle_type_stats
        ]
        
        # Monthly violation trends (last 6 months)
        six_months_ago = datetime.now() - timedelta(days=180)
        monthly_violations = db.query(
            func.date_trunc('month', AirQualityViolation.date_of_apprehension).label('month'),
            func.count(AirQualityViolation.id).label('violation_count'),
            func.sum(case((AirQualityViolation.paid_driver == True, 1), else_=0)).label('paid_driver_count'),
            func.sum(case((AirQualityViolation.paid_operator == True, 1), else_=0)).label('paid_operator_count')
        ).filter(
            AirQualityViolation.date_of_apprehension >= six_months_ago
        ).group_by(
            func.date_trunc('month', AirQualityViolation.date_of_apprehension)
        ).order_by('month').all()
        
        monthly_trends = []
        for mv in monthly_violations:
            if mv[0]:  # month is not None
                monthly_trends.append({
                    "month": mv[0].strftime("%B"),
                    "year": mv[0].year,
                    "violation_count": mv[1] or 0,
                    "paid_driver_count": mv[2] or 0,
                    "paid_operator_count": mv[3] or 0
                })
        
        # Top violation locations
        location_stats = db.query(
            AirQualityViolation.place_of_apprehension,
            func.count(AirQualityViolation.id).label('count')
        ).filter(
            AirQualityViolation.place_of_apprehension.isnot(None)
        ).group_by(
            AirQualityViolation.place_of_apprehension
        ).order_by(
            func.count(AirQualityViolation.id).desc()
        ).limit(10).all()
        
        top_locations = [
            {"location": loc[0], "count": loc[1]} 
            for loc in location_stats
        ]
        
        # Payment status distribution
        total_paid = db.query(AirQualityViolation).filter(
            and_(AirQualityViolation.paid_driver == True, AirQualityViolation.paid_operator == True)
        ).count()
        
        partial_paid = db.query(AirQualityViolation).filter(
            or_(
                and_(AirQualityViolation.paid_driver == True, AirQualityViolation.paid_operator == False),
                and_(AirQualityViolation.paid_driver == False, AirQualityViolation.paid_operator == True)
            )
        ).count()
        
        unpaid = db.query(AirQualityViolation).filter(
            and_(AirQualityViolation.paid_driver == False, AirQualityViolation.paid_operator == False)
        ).count()
        
        payment_distribution = [
            {
                "status": "Fully Paid",
                "count": total_paid,
                "percentage": (total_paid / total_violations * 100) if total_violations > 0 else 0
            },
            {
                "status": "Partially Paid", 
                "count": partial_paid,
                "percentage": (partial_paid / total_violations * 100) if total_violations > 0 else 0
            },
            {
                "status": "Unpaid",
                "count": unpaid,
                "percentage": (unpaid / total_violations * 100) if total_violations > 0 else 0
            }
        ]
        
        # Recent activity (last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_violations = db.query(AirQualityViolation).filter(
            AirQualityViolation.created_at >= thirty_days_ago
        ).count()
        
        recent_records = db.query(AirQualityRecord).filter(
            AirQualityRecord.created_at >= thirty_days_ago
        ).count()
        
        return {
            "total_records": total_records,
            "total_violations": total_violations,
            "total_drivers": total_drivers,
            "total_fees_configured": total_fees,
            "paid_violations_driver": paid_driver_violations,
            "paid_violations_operator": paid_operator_violations,
            "paid_driver_percentage": round(paid_driver_percentage, 1),
            "paid_operator_percentage": round(paid_operator_percentage, 1),
            "vehicle_types": vehicle_types,
            "monthly_violations": monthly_trends,
            "top_violation_locations": top_locations,
            "payment_status_distribution": payment_distribution,
            "recent_violations_count": recent_violations,
            "recent_records_count": recent_records
        }


class CRUDAirQualityViolation(CRUDBase[AirQualityViolation, AirQualityViolationCreate, AirQualityViolationUpdate]):
    def get_sync(self, db: Session, *, id: Any) -> Optional[AirQualityViolation]:
        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi_sync(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[AirQualityViolation]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def create_sync(self, db: Session, *, obj_in: AirQualityViolationCreate) -> AirQualityViolation:
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_sync(self, db: Session, *, db_obj: AirQualityViolation, obj_in: AirQualityViolationUpdate) -> AirQualityViolation:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove_sync(self, db: Session, *, id: Any) -> Optional[AirQualityViolation]:
        obj = self.get_sync(db, id=id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

    def count_sync(self, db: Session) -> int:
        return db.query(self.model).count()

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
    def get_sync(self, db: Session, *, id: Any) -> Optional[AirQualityFee]:
        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi_sync(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[AirQualityFee]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def create_sync(self, db: Session, *, obj_in: AirQualityFeeCreate) -> AirQualityFee:
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_sync(self, db: Session, *, db_obj: AirQualityFee, obj_in: AirQualityFeeUpdate) -> AirQualityFee:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove_sync(self, db: Session, *, id: Any) -> Optional[AirQualityFee]:
        obj = self.get_sync(db, id=id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

    def count_sync(self, db: Session) -> int:
        return db.query(self.model).count()

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
    def get_sync(self, db: Session, *, id: Any) -> Optional[AirQualityRecordHistory]:
        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi_sync(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[AirQualityRecordHistory]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def create_sync(self, db: Session, *, obj_in: AirQualityRecordHistoryCreate) -> AirQualityRecordHistory:
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove_sync(self, db: Session, *, id: Any) -> Optional[AirQualityRecordHistory]:
        obj = self.get_sync(db, id=id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

    def count_sync(self, db: Session) -> int:
        return db.query(self.model).count()

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


class CRUDAirQualityOrderOfPayment(CRUDBase[AirQualityOrderOfPayment, AirQualityOrderOfPaymentCreate, AirQualityOrderOfPaymentUpdate]):
    def generate_control_number(self, db: Session) -> str:
        """Generate a 6-digit control number in format 03XXXX"""
        # Get the highest existing control number
        latest_order = db.query(self.model)\
            .filter(self.model.oop_control_number.like('03%'))\
            .order_by(desc(self.model.oop_control_number))\
            .first()
        
        if latest_order:
            # Extract the number part and increment
            try:
                current_num = int(latest_order.oop_control_number[2:])
                next_num = current_num + 1
            except (ValueError, IndexError):
                next_num = 1
        else:
            next_num = 1
        
        # Format as 03XXXX (ensuring 4 digits after 03)
        return f"03{next_num:04d}"
    
    def get_by_control_number(self, db: Session, *, control_number: str) -> Optional[AirQualityOrderOfPayment]:
        return db.query(self.model).filter(self.model.oop_control_number == control_number).first()
    
    def search_sync(
        self, 
        db: Session, 
        *, 
        search: Optional[str] = None,
        control_number: Optional[str] = None,
        plate_number: Optional[str] = None,
        status: Optional[str] = None,
        created_date: Optional[str] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[AirQualityOrderOfPayment]:
        query = db.query(self.model)
        
        if search:
            # General search across multiple fields
            search_filter = or_(
                self.model.oop_control_number.ilike(f"%{search}%"),
                self.model.plate_number.ilike(f"%{search}%"),
                self.model.operator_name.ilike(f"%{search}%"),
                self.model.driver_name.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        if control_number:
            query = query.filter(self.model.oop_control_number.ilike(f"%{control_number}%"))
        
        if plate_number:
            query = query.filter(self.model.plate_number.ilike(f"%{plate_number}%"))
        
        if status:
            query = query.filter(self.model.status == status)
        
        if created_date:
            query = query.filter(func.date(self.model.created_at) == created_date)
        
        return query.order_by(desc(self.model.created_at)).offset(skip).limit(limit).all()
    
    def get_sync(self, db: Session, *, id: Any) -> Optional[AirQualityOrderOfPayment]:
        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi_sync(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[AirQualityOrderOfPayment]:
        return db.query(self.model).order_by(desc(self.model.created_at)).offset(skip).limit(limit).all()

    def create_sync(self, db: Session, *, obj_in: AirQualityOrderOfPaymentCreate) -> AirQualityOrderOfPayment:
        # Generate control number
        control_number = self.generate_control_number(db)
        
        obj_in_data = obj_in.model_dump()
        obj_in_data['oop_control_number'] = control_number
        
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_sync(self, db: Session, *, db_obj: AirQualityOrderOfPayment, obj_in: AirQualityOrderOfPaymentUpdate) -> AirQualityOrderOfPayment:
        update_data = obj_in.model_dump(exclude_unset=True)
        
        # Check if status is being updated
        status_changed = 'status' in update_data and update_data['status'] != db_obj.status
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.commit()
        db.refresh(db_obj)
        
        # Sync payment status with violations if status changed
        if status_changed:
            self.sync_payment_status_with_violations(db, db_obj)
        
        return db_obj

    def sync_payment_status_with_violations(self, db: Session, order: AirQualityOrderOfPayment) -> None:
        """Sync Order of Payment status with related violation payment status"""
        if not order.selected_violations:
            return
        
        # Parse violation IDs from comma-separated string
        try:
            violation_ids = [int(vid.strip()) for vid in order.selected_violations.split(',') if vid.strip()]
        except (ValueError, AttributeError):
            return
        
        # Update violation payment status based on order status
        paid_driver = False
        paid_operator = False
        
        if order.status == 'fully_paid':
            paid_driver = True
            paid_operator = True
        elif order.status == 'partially_paid':
            # For partially paid, we'll assume driver is paid (common scenario)
            # This could be made more sophisticated based on business rules
            paid_driver = True
            paid_operator = False
        # unpaid means both remain False
        
        # Update all related violations
        db.query(AirQualityViolation).filter(
            AirQualityViolation.id.in_(violation_ids)
        ).update({
            'paid_driver': paid_driver,
            'paid_operator': paid_operator
        }, synchronize_session=False)
        
        db.commit()

    def count_sync(self, db: Session) -> int:
        return db.query(self.model).count()


# Create instances
air_quality_driver = CRUDAirQualityDriver(AirQualityDriver)
air_quality_record = CRUDAirQualityRecord(AirQualityRecord)
air_quality_violation = CRUDAirQualityViolation(AirQualityViolation)
air_quality_fee = CRUDAirQualityFee(AirQualityFee)
air_quality_record_history = CRUDAirQualityRecordHistory(AirQualityRecordHistory)
air_quality_order_of_payment = CRUDAirQualityOrderOfPayment(AirQualityOrderOfPayment)
