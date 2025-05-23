from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from uuid import UUID
from app.crud.base_crud import CRUDBase
from app.models.emission_models import Vehicle, Test, TestSchedule, VehicleDriverHistory
from app.schemas.emission_schemas import VehicleCreate, VehicleUpdate, TestCreate, TestUpdate, TestScheduleCreate, TestScheduleUpdate, VehicleDriverHistoryCreate

class CRUDVehicle(CRUDBase[Vehicle, VehicleCreate, VehicleUpdate]):
    def get_multi_with_test_info(
        self, db: Session, *, skip: int = 0, limit: int = 100, filters: Optional[Dict[str, Any]] = None
    ):
        """Get vehicles with their latest test information"""
        query = db.query(Vehicle)
        
        # Apply filters if provided
        if filters:
            if filters.get("plate_number"):
                query = query.filter(Vehicle.plate_number.ilike(f"%{filters['plate_number']}%"))
            if filters.get("driver_name"):
                query = query.filter(Vehicle.driver_name.ilike(f"%{filters['driver_name']}%"))
            if filters.get("office_name"):
                query = query.filter(Vehicle.office_name == filters["office_name"])
            if filters.get("vehicle_type"):
                query = query.filter(Vehicle.vehicle_type == filters["vehicle_type"])
            if filters.get("engine_type"):
                query = query.filter(Vehicle.engine_type == filters["engine_type"])
            if filters.get("wheels"):
                query = query.filter(Vehicle.wheels == filters["wheels"])
                
        total = query.count()
        vehicles = query.offset(skip).limit(limit).all()
        
        # Fetch latest test for each vehicle
        for vehicle in vehicles:
            latest_test = db.query(Test)\
                .filter(Test.vehicle_id == vehicle.id)\
                .order_by(desc(Test.test_date))\
                .first()
                
            if latest_test:
                setattr(vehicle, "latest_test_result", latest_test.result)
                setattr(vehicle, "latest_test_date", latest_test.test_date)
            else:
                setattr(vehicle, "latest_test_result", None)
                setattr(vehicle, "latest_test_date", None)
        
        return {"vehicles": vehicles, "total": total}
    
    def get_with_test_info(self, db: Session, *, id: UUID):
        """Get a specific vehicle with its latest test information"""
        vehicle = db.query(Vehicle).filter(Vehicle.id == id).first()
        if not vehicle:
            return None
            
        latest_test = db.query(Test)\
            .filter(Test.vehicle_id == vehicle.id)\
            .order_by(desc(Test.test_date))\
            .first()
            
        if latest_test:
            setattr(vehicle, "latest_test_result", latest_test.result)
            setattr(vehicle, "latest_test_date", latest_test.test_date)
        else:
            setattr(vehicle, "latest_test_result", None)
            setattr(vehicle, "latest_test_date", None)
            
        return vehicle
    
    def get_unique_values(self, db: Session):
        """Get unique values for filter dropdowns"""
        offices = db.query(Vehicle.office_name).distinct().all()
        vehicle_types = db.query(Vehicle.vehicle_type).distinct().all()
        engine_types = db.query(Vehicle.engine_type).distinct().all()
        wheels = db.query(Vehicle.wheels).distinct().all()
        
        return {
            "offices": [office[0] for office in offices],
            "vehicle_types": [v_type[0] for v_type in vehicle_types],
            "engine_types": [e_type[0] for e_type in engine_types],
            "wheels": [wheel[0] for wheel in wheels]
        }
    
    def search(self, db: Session, *, search_term: str, skip: int = 0, limit: int = 100):
        """Search vehicles by plate number, driver name, or office"""
        query = db.query(Vehicle).filter(
            or_(
                Vehicle.plate_number.ilike(f"%{search_term}%"),
                Vehicle.driver_name.ilike(f"%{search_term}%"),
                Vehicle.office_name.ilike(f"%{search_term}%")
            )
        )
        
        total = query.count()
        vehicles = query.offset(skip).limit(limit).all()
        
        # Fetch latest test for each vehicle
        for vehicle in vehicles:
            latest_test = db.query(Test)\
                .filter(Test.vehicle_id == vehicle.id)\
                .order_by(desc(Test.test_date))\
                .first()
                
            if latest_test:
                setattr(vehicle, "latest_test_result", latest_test.result)
                setattr(vehicle, "latest_test_date", latest_test.test_date)
            else:
                setattr(vehicle, "latest_test_result", None)
                setattr(vehicle, "latest_test_date", None)
        
        return {"vehicles": vehicles, "total": total}


class CRUDTest(CRUDBase[Test, TestCreate, TestUpdate]):
    def get_by_vehicle(self, db: Session, *, vehicle_id: UUID, skip: int = 0, limit: int = 100):
        """Get tests for a specific vehicle"""
        query = db.query(self.model).filter(Test.vehicle_id == vehicle_id)
        total = query.count()
        tests = query.order_by(desc(Test.test_date)).offset(skip).limit(limit).all()
        return {"tests": tests, "total": total}


class CRUDTestSchedule(CRUDBase[TestSchedule, TestScheduleCreate, TestScheduleUpdate]):
    def get_by_year_quarter(self, db: Session, *, year: int, quarter: int):
        """Get test schedules for a specific year and quarter"""
        return db.query(self.model)\
            .filter(TestSchedule.year == year, TestSchedule.quarter == quarter)\
            .all()


class CRUDVehicleDriverHistory(CRUDBase[VehicleDriverHistory, VehicleDriverHistoryCreate, None]):
    def get_by_vehicle(self, db: Session, *, vehicle_id: UUID, skip: int = 0, limit: int = 100):
        """Get driver history for a specific vehicle"""
        query = db.query(self.model).filter(VehicleDriverHistory.vehicle_id == vehicle_id)
        total = query.count()
        history = query.order_by(desc(VehicleDriverHistory.changed_at)).offset(skip).limit(limit).all()
        return {"history": history, "total": total}
        
        
# Create CRUD objects
vehicle = CRUDVehicle(Vehicle)
test = CRUDTest(Test)
test_schedule = CRUDTestSchedule(TestSchedule)
vehicle_driver_history = CRUDVehicleDriverHistory(VehicleDriverHistory)