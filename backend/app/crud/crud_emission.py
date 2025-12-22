from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, or_
from uuid import UUID
import traceback
from app.crud.base_crud import CRUDBase
from app.models.emission_models import Office, Vehicle, Test, TestSchedule, VehicleDriverHistory, VehicleRemarks
from app.schemas.emission_schemas import OfficeCreate, OfficeUpdate, VehicleCreate, VehicleUpdate, TestCreate, TestUpdate, TestScheduleCreate, TestScheduleUpdate, VehicleDriverHistoryCreate, VehicleRemarksCreate, VehicleRemarksUpdate, OfficeComplianceData, OfficeComplianceSummary

class CRUDOffice(CRUDBase[Office, OfficeCreate, OfficeUpdate]):
    def get_sync(self, db: Session, *, id: UUID) -> Optional[Office]:
        """Synchronous version of get for use with sync sessions"""
        return db.query(self.model).filter(self.model.id == id).first()
    
    def get_multi_sync(self, db: Session, *, skip: int = 0, limit: int = 100):
        """Synchronous version of get_multi for use with sync sessions"""
        query = db.query(self.model)
        total = query.count()
        offices = query.offset(skip).limit(limit).all()
        return {"offices": offices, "total": total}
    
    def count_sync(self, db: Session):
        """Synchronous version of count for use with sync sessions"""
        return db.query(self.model).count()
    
    def create_sync(self, db: Session, *, obj_in: OfficeCreate) -> Office:
        """Synchronous version of create for use with sync sessions"""
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update_sync(self, db: Session, *, db_obj: Office, obj_in: OfficeUpdate) -> Office:
        """Synchronous version of update for use with sync sessions"""
        obj_data = obj_in.model_dump(exclude_unset=True)
        for field, value in obj_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove_sync(self, db: Session, *, id: UUID) -> Office:
        """Synchronous version of remove for use with sync sessions"""
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return obj
    
    def get_by_name(self, db: Session, *, name: str) -> Optional[Office]:
        """Get office by name"""
        return db.query(Office).filter(Office.name == name).first()
    
    def search(self, db: Session, *, search_term: str, skip: int = 0, limit: int = 100):
        """Search offices by name"""
        query = db.query(Office).filter(
            Office.name.ilike(f"%{search_term}%")
        )
        total = query.count()
        offices = query.offset(skip).limit(limit).all()
        return {"offices": offices, "total": total}

class CRUDVehicle(CRUDBase[Vehicle, VehicleCreate, VehicleUpdate]):
    def get_sync(self, db: Session, *, id: UUID) -> Optional[Vehicle]:
        """Synchronous version of get for use with sync sessions"""
        return db.query(self.model).filter(self.model.id == id).first()
    def create_sync(self, db: Session, *, obj_in: VehicleCreate) -> Vehicle:
        """Synchronous version of create for use with sync sessions"""
        try:
            obj_in_data = obj_in.model_dump()
            db_obj = self.model(**obj_in_data)
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj
        except Exception as e:
            db.rollback()
            raise RuntimeError(f"Error creating vehicle: {str(e)}")
    
    def update_sync(self, db: Session, *, db_obj: Vehicle, obj_in: VehicleUpdate) -> Vehicle:
        """Synchronous version of update for use with sync sessions"""
        obj_data = obj_in.model_dump(exclude_unset=True)
        for field, value in obj_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove_sync(self, db: Session, *, id: UUID) -> Vehicle:
        """Synchronous version of remove for use with sync sessions"""
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return obj

    def get_multi_with_test_info(
        self, db: Session, *, skip: int = 0, limit: int = 100, filters: Optional[Dict[str, Any]] = None
    ):
        """Get vehicles with their latest test information"""
        query = db.query(Vehicle).join(Office, Vehicle.office_id == Office.id)
        
        # Apply filters if provided
        if filters:
            if filters.get("plate_number"):
                query = query.filter(Vehicle.plate_number.ilike(f"%{filters['plate_number']}%"))
            if filters.get("chassis_number"):
                query = query.filter(Vehicle.chassis_number.ilike(f"%{filters['chassis_number']}%"))
            if filters.get("registration_number"):
                query = query.filter(Vehicle.registration_number.ilike(f"%{filters['registration_number']}%"))
            if filters.get("driver_name"):
                query = query.filter(Vehicle.driver_name.ilike(f"%{filters['driver_name']}%"))
            if filters.get("office_name"):
                query = query.filter(Office.name == filters["office_name"])
            if filters.get("office_id"):
                query = query.filter(Vehicle.office_id == filters["office_id"])
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

    def get_multi_optimized(
        self, db: Session, *, skip: int = 0, limit: int = 100, filters: Optional[Dict[str, Any]] = None
    ):
        """Get vehicles without test information for faster loading"""
        query = db.query(Vehicle).join(Office, Vehicle.office_id == Office.id)
        
        # Apply filters if provided
        if filters:
            if filters.get("plate_number"):
                query = query.filter(Vehicle.plate_number.ilike(f"%{filters['plate_number']}%"))
            if filters.get("chassis_number"):
                query = query.filter(Vehicle.chassis_number.ilike(f"%{filters['chassis_number']}%"))
            if filters.get("registration_number"):
                query = query.filter(Vehicle.registration_number.ilike(f"%{filters['registration_number']}%"))
            if filters.get("driver_name"):
                query = query.filter(Vehicle.driver_name.ilike(f"%{filters['driver_name']}%"))
            if filters.get("office_name"):
                query = query.filter(Office.name == filters["office_name"])
            if filters.get("office_id"):
                query = query.filter(Vehicle.office_id == filters["office_id"])
            if filters.get("vehicle_type"):
                query = query.filter(Vehicle.vehicle_type == filters["vehicle_type"])
            if filters.get("engine_type"):
                query = query.filter(Vehicle.engine_type == filters["engine_type"])
            if filters.get("wheels"):
                query = query.filter(Vehicle.wheels == filters["wheels"])
                
        total = query.count()
        vehicles = query.offset(skip).limit(limit).all()
        
        # Set test fields to None to indicate they weren't fetched
        for vehicle in vehicles:
            setattr(vehicle, "latest_test_result", None)
            setattr(vehicle, "latest_test_date", None)
        
        return {"vehicles": vehicles, "total": total}
    def get_with_test_info(self, db: Session, *, id: UUID):
        """Get a specific vehicle with its latest test information"""
        print("DEBUG: Getting vehicle with ID:", id)
        
        try:
            vehicle = db.query(Vehicle).filter(Vehicle.id == id).first()
            print("DEBUG: Vehicle query result:", vehicle)
            
            if not vehicle:
                print("DEBUG: Vehicle not found")
                return None
                
            print("DEBUG: Getting latest test for vehicle")
            latest_test = db.query(Test)\
                .filter(Test.vehicle_id == vehicle.id)\
                .order_by(desc(Test.test_date))\
                .first()
                
            print("DEBUG: Latest test:", latest_test)
                
            if latest_test:
                print("DEBUG: Setting test result and date attributes")
                setattr(vehicle, "latest_test_result", latest_test.result)
                setattr(vehicle, "latest_test_date", latest_test.test_date)
            else:
                print("DEBUG: No test found, setting null attributes")
                setattr(vehicle, "latest_test_result", None)
                setattr(vehicle, "latest_test_date", None)
                
            print("DEBUG: Returning vehicle")
            return vehicle
            
        except Exception as e:
            print("DEBUG ERROR in get_with_test_info:", str(e))
            import traceback
            traceback.print_exc()
            raise
    
    def get_unique_values(self, db: Session):
        """Get unique values for filter dropdowns"""
        offices = db.query(Office.name).distinct().all()
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
        """Search vehicles by plate number, chassis number, registration number, driver name, or office"""
        query = db.query(Vehicle).join(Office, Vehicle.office_id == Office.id).filter(
            or_(
                Vehicle.plate_number.ilike(f"%{search_term}%"),
                Vehicle.chassis_number.ilike(f"%{search_term}%"),
                Vehicle.registration_number.ilike(f"%{search_term}%"),
                Vehicle.driver_name.ilike(f"%{search_term}%"),
                Office.name.ilike(f"%{search_term}%")
            )
        )
        
        total = query.count()
        vehicles = query.offset(skip).limit(limit).all()
        
        # Set test fields to None to indicate they weren't fetched (for performance)
        for vehicle in vehicles:
            setattr(vehicle, "latest_test_result", None)
            setattr(vehicle, "latest_test_date", None)
        
        return {"vehicles": vehicles, "total": total}
    
    def get_by_plate_number(self, db: Session, *, plate_number: str) -> Optional[Vehicle]:
        """Get vehicle by plate number"""
        vehicle = db.query(Vehicle).filter(Vehicle.plate_number == plate_number).first()
        if not vehicle:
            return None

        # Attach latest test info so callers can safely read these attributes
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

class CRUDTest(CRUDBase[Test, TestCreate, TestUpdate]):
    def get_sync(self, db: Session, *, id: UUID) -> Optional[Test]:
        """Synchronous version of get for use with sync sessions"""
        return db.query(self.model).filter(self.model.id == id).first()
    def create_sync(self, db: Session, *, obj_in: TestCreate) -> Test:
        """Synchronous version of create for use with sync sessions"""
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
        
    def get_multi_sync(self, db: Session, *, skip: int = 0, limit: int = 100):
        """Synchronous version of get_multi for use with sync sessions"""
        query = db.query(self.model)
        total = query.count()
        tests = query.order_by(desc(Test.test_date)).offset(skip).limit(limit).all()
        return {"tests": tests, "total": total}
    
    def count_sync(self, db: Session) -> int:
        """Synchronous version of count for use with sync sessions"""
        return db.query(self.model).count()
    
    def update_sync(self, db: Session, *, db_obj: Test, obj_in: TestUpdate) -> Test:
        """Synchronous version of update for use with sync sessions"""
        obj_data = obj_in.model_dump(exclude_unset=True)
        for field, value in obj_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove_sync(self, db: Session, *, id: UUID) -> Test:
        """Synchronous version of remove for use with sync sessions"""
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return obj
    
    def get_by_vehicle(self, db: Session, *, vehicle_id: UUID, skip: int = 0, limit: int = 100):
        """Get tests for a specific vehicle"""
        query = db.query(self.model).filter(Test.vehicle_id == vehicle_id)
        total = query.count()
        tests = query.order_by(desc(Test.test_date)).offset(skip).limit(limit).all()
        return {"tests": tests, "total": total}
        
    def count(self, db: Session) -> int:
        """Synchronous count method for Test model"""
        return db.query(self.model).count()


class CRUDTestSchedule(CRUDBase[TestSchedule, TestScheduleCreate, TestScheduleUpdate]):
    def get_sync(self, db: Session, *, id: UUID) -> Optional[TestSchedule]:
        """Synchronous version of get for use with sync sessions"""
        return db.query(self.model).filter(self.model.id == id).first()    
    def create_sync(self, db: Session, *, obj_in: TestScheduleCreate) -> TestSchedule:
        """Synchronous version of create for use with sync sessions"""
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    def get_multi_sync(self, db: Session, *, skip: int = 0, limit: int = 100):
        """Synchronous version of get_multi for use with sync sessions"""
        return db.query(self.model).offset(skip).limit(limit).all()
    
    def count_sync(self, db: Session) -> int:
        """Synchronous count method for TestSchedule model"""
        return db.query(self.model).count()
    
    def update_sync(self, db: Session, *, db_obj: TestSchedule, obj_in: TestScheduleUpdate) -> TestSchedule:
        """Synchronous version of update for use with sync sessions"""
        obj_data = obj_in.model_dump(exclude_unset=True)
        for field, value in obj_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove_sync(self, db: Session, *, id: UUID) -> TestSchedule:
        """Synchronous version of remove for use with sync sessions"""
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return obj
    
    def count_sync(self, db: Session) -> int:
        """Synchronous version of count for use with sync sessions"""
        return db.query(self.model).count()
    
    def get_by_year_quarter(self, db: Session, *, year: int, quarter: int):
        """Get test schedules for a specific year and quarter"""
        return db.query(self.model)\
            .filter(TestSchedule.year == year, TestSchedule.quarter == quarter)\
            .all()


class CRUDVehicleDriverHistory(CRUDBase[VehicleDriverHistory, VehicleDriverHistoryCreate, None]): # type: ignore
    # Explicitly override the async create method to prevent it from being used by mistake
    async def create(self, db: AsyncSession, *, obj_in: VehicleDriverHistoryCreate) -> VehicleDriverHistory:
        """Async version - use create_sync instead for sync sessions"""
        raise RuntimeError("Do not use async create, use create_sync for sync sessions")
        
    def create_sync(self, db: Session, *, obj_in: VehicleDriverHistoryCreate) -> VehicleDriverHistory:
        """Synchronous version of create for use with sync sessions"""
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
        
    def get_by_vehicle(self, db: Session, *, vehicle_id: UUID, skip: int = 0, limit: int = 100):
        """Get driver history for a specific vehicle"""
        query = db.query(self.model).filter(VehicleDriverHistory.vehicle_id == vehicle_id)
        total = query.count()
        history = query.order_by(desc(VehicleDriverHistory.changed_at)).offset(skip).limit(limit).all()
        return {"history": history, "total": total}


class CRUDVehicleRemarks(CRUDBase[VehicleRemarks, VehicleRemarksCreate, VehicleRemarksUpdate]):
    def get_by_vehicle_and_year(self, db: Session, *, vehicle_id: UUID, year: int) -> Optional[VehicleRemarks]:
        """Get remarks for a specific vehicle and year"""
        return db.query(VehicleRemarks).filter(
            VehicleRemarks.vehicle_id == vehicle_id,
            VehicleRemarks.year == year
        ).first()
    
    def update_or_create(self, db: Session, *, vehicle_id: UUID, year: int, remarks: str, created_by: UUID = None) -> VehicleRemarks:
        """Update existing remarks or create new ones for a vehicle and year"""
        existing = self.get_by_vehicle_and_year(db, vehicle_id=vehicle_id, year=year)
        
        if existing:
            # Update existing remarks
            existing.remarks = remarks
            existing.created_by_id = created_by
            db.commit()
            db.refresh(existing)
            return existing
        else:
            # Create new remarks
            remarks_data = VehicleRemarksCreate(
                vehicle_id=vehicle_id,
                year=year,
                remarks=remarks
            )
            new_remarks = VehicleRemarks(
                **remarks_data.dict(),
                created_by_id=created_by
            )
            db.add(new_remarks)
            db.commit()
            db.refresh(new_remarks)
            return new_remarks

class CRUDOfficeCompliance:
    def get_office_compliance_data(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100, 
        filters: Optional[Dict[str, Any]] = None
    ):
        """Get office compliance data aggregated from vehicles and tests"""
        
        # Base query to get all offices that have vehicles
        office_query = db.query(Office).join(Vehicle, Office.id == Vehicle.office_id).distinct()
        
        # Apply search filter if provided
        if filters and filters.get("search_term"):
            search_term = filters["search_term"]
            office_query = office_query.filter(
                Office.name.ilike(f"%{search_term}%")
            )
        
        all_offices = office_query.all()
        total_offices = len(all_offices)
        
        # Paginate offices
        paginated_offices = all_offices[skip:skip + limit] if limit > 0 else all_offices
        
        office_compliance_data = []
        total_vehicles_all = 0
        total_compliant_all = 0
        
        for office in paginated_offices:
            # Get vehicles for this office
            vehicles_query = db.query(Vehicle).filter(Vehicle.office_id == office.id)
            
            # Apply year/quarter filters if provided
            if filters:
                if filters.get("year") or filters.get("quarter"):
                    # Join with tests to filter by test date
                    test_filter_conditions = []
                    if filters.get("year"):
                        test_filter_conditions.append(Test.year == filters["year"])
                    if filters.get("quarter"):
                        test_filter_conditions.append(Test.quarter == filters["quarter"])
                    
                    # Get vehicles that have tests matching the criteria
                    if test_filter_conditions:
                        vehicle_ids_with_tests = db.query(Test.vehicle_id).filter(*test_filter_conditions).distinct()
                        vehicles_query = vehicles_query.filter(Vehicle.id.in_(vehicle_ids_with_tests))
            
            vehicles = vehicles_query.all()
            total_vehicles = len(vehicles)
            
            if total_vehicles == 0:
                continue
                
            # Count tested and compliant vehicles
            tested_vehicles = 0
            compliant_vehicles = 0
            last_test_date = None
            
            for vehicle in vehicles:
                # Get latest test for this vehicle
                test_query = db.query(Test).filter(Test.vehicle_id == vehicle.id)
                
                # Apply year/quarter filters to tests if provided
                if filters:
                    if filters.get("year"):
                        test_query = test_query.filter(Test.year == filters["year"])
                    if filters.get("quarter"):
                        test_query = test_query.filter(Test.quarter == filters["quarter"])
                
                latest_test = test_query.order_by(desc(Test.test_date)).first()
                
                if latest_test:
                    tested_vehicles += 1
                    if latest_test.result: # type: ignore
                        compliant_vehicles += 1
                    
                    # Track the most recent test date across all vehicles
                    if last_test_date is None or latest_test.test_date > last_test_date: # type: ignore
                        last_test_date = latest_test.test_date
            
            non_compliant_vehicles = tested_vehicles - compliant_vehicles
            compliance_rate = (compliant_vehicles / tested_vehicles * 100) if tested_vehicles > 0 else 0
            office_data = OfficeComplianceData(
                office_name=office.name,
                total_vehicles=total_vehicles,
                tested_vehicles=tested_vehicles,
                compliant_vehicles=compliant_vehicles,
                non_compliant_vehicles=non_compliant_vehicles,
                compliance_rate=round(compliance_rate, 2),
                last_test_date=last_test_date # type: ignore
            )
            
            office_compliance_data.append(office_data)
            total_vehicles_all += total_vehicles
            total_compliant_all += compliant_vehicles
        
        # Calculate overall compliance rate
        overall_compliance_rate = (total_compliant_all / total_vehicles_all * 100) if total_vehicles_all > 0 else 0
        
        summary = OfficeComplianceSummary(
            total_offices=len(office_compliance_data),
            total_vehicles=total_vehicles_all,
            total_compliant=total_compliant_all,
            overall_compliance_rate=round(overall_compliance_rate, 2)
        )
        
        return {
            "offices": office_compliance_data,
            "summary": summary,
            "total": total_offices
        }

# Create CRUD objects
office = CRUDOffice(Office)
vehicle = CRUDVehicle(Vehicle)
test = CRUDTest(Test)
test_schedule = CRUDTestSchedule(TestSchedule)
vehicle_driver_history = CRUDVehicleDriverHistory(VehicleDriverHistory)
vehicle_remarks = CRUDVehicleRemarks(VehicleRemarks)
office_compliance = CRUDOfficeCompliance()