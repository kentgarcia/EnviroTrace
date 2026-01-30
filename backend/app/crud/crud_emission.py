import base64
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List, Callable
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, or_, func, and_
from uuid import UUID
import traceback
import re
from app.crud.base_crud import CRUDBase
from app.models.emission_models import Office, Vehicle, Test, TestSchedule, VehicleDriverHistory, VehicleRemarks
from app.schemas.emission_schemas import OfficeCreate, OfficeUpdate, VehicleCreate, VehicleUpdate, TestCreate, TestUpdate, TestScheduleCreate, TestScheduleUpdate, VehicleDriverHistoryCreate, VehicleRemarksCreate, VehicleRemarksUpdate, OfficeComplianceData, OfficeComplianceSummary


def _normalize_identifier(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    normalized = re.sub(r"[^a-z0-9]", "", value.lower())
    return normalized or None

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
    _DEFAULT_LIMIT = 100
    _MAX_LIMIT = 200

    def get_sync(self, db: Session, *, id: UUID) -> Optional[Vehicle]:
        """Synchronous version of get for use with sync sessions"""
        return db.query(self.model).filter(self.model.id == id).first()

    def _sanitize_limit(self, limit: Optional[int]) -> int:
        if limit is None:
            return self._DEFAULT_LIMIT
        try:
            limit_value = int(limit)
        except (TypeError, ValueError):
            limit_value = self._DEFAULT_LIMIT
        return max(1, min(limit_value, self._MAX_LIMIT))

    def _encode_vehicle_cursor(self, vehicle: Vehicle) -> str:
        created_at = vehicle.created_at or datetime.now(timezone.utc)
        payload = f"{created_at.isoformat()}|{vehicle.id}"
        encoded = base64.urlsafe_b64encode(payload.encode("ascii")).decode("ascii")
        return encoded

    def _decode_vehicle_cursor(self, cursor: str) -> tuple[datetime, UUID]:
        try:
            raw = base64.urlsafe_b64decode(cursor.encode("ascii")).decode("ascii")
            created_str, vehicle_id_str = raw.split("|", 1)
            created_at = datetime.fromisoformat(created_str)
            vehicle_id = UUID(vehicle_id_str)
            return created_at, vehicle_id
        except Exception as exc:
            raise ValueError("Invalid pagination cursor") from exc

    def _cursor_from_skip(self, base_query_factory: Callable[[], Any], skip: int) -> Optional[str]:
        if skip <= 0:
            return None

        seed_query = (
            base_query_factory()
            .order_by(Vehicle.created_at.desc(), Vehicle.id.desc())
            .offset(skip - 1)
            .limit(1)
        )
        seed = seed_query.first()
        if not seed:
            return None
        return self._encode_vehicle_cursor(seed)

    def _has_more_older(self, base_query_factory: Callable[[], Any], vehicle: Optional[Vehicle]) -> bool:
        if not vehicle:
            return False

        older_query = base_query_factory().filter(
            or_(
                Vehicle.created_at < vehicle.created_at,
                and_(Vehicle.created_at == vehicle.created_at, Vehicle.id < vehicle.id),
            )
        )
        return older_query.order_by(Vehicle.created_at.desc(), Vehicle.id.desc()).limit(1).first() is not None

    def _paginate_vehicle_query(
        self,
        base_query_factory: Callable[[], Any],
        *,
        limit: int,
        after: Optional[str],
        before: Optional[str],
    ) -> Dict[str, Any]:
        if after and before:
            raise ValueError("Cannot specify both 'after' and 'before' cursors")

        limit_value = self._sanitize_limit(limit)

        if before:
            created_at_val, vehicle_id_val = self._decode_vehicle_cursor(before)
            asc_query = (
                base_query_factory()
                .filter(
                    or_(
                        Vehicle.created_at > created_at_val,
                        and_(Vehicle.created_at == created_at_val, Vehicle.id > vehicle_id_val),
                    )
                )
                .order_by(Vehicle.created_at.asc(), Vehicle.id.asc())
            )

            rows_raw = asc_query.limit(limit_value + 1).all()
            has_more_newer = len(rows_raw) > limit_value
            if has_more_newer:
                rows_raw = rows_raw[:-1]
            vehicles = list(reversed(rows_raw))

            more_older = self._has_more_older(base_query_factory, vehicles[-1] if vehicles else None)
            more_newer = has_more_newer
        else:
            desc_query = base_query_factory().order_by(Vehicle.created_at.desc(), Vehicle.id.desc())

            if after:
                created_at_val, vehicle_id_val = self._decode_vehicle_cursor(after)
                desc_query = desc_query.filter(
                    or_(
                        Vehicle.created_at < created_at_val,
                        and_(Vehicle.created_at == created_at_val, Vehicle.id < vehicle_id_val),
                    )
                )

            rows_raw = desc_query.limit(limit_value + 1).all()
            has_more_older = len(rows_raw) > limit_value
            vehicles = rows_raw[:limit_value] if has_more_older else rows_raw

            more_older = has_more_older
            more_newer = after is not None

        next_cursor = self._encode_vehicle_cursor(vehicles[-1]) if vehicles and more_older else None
        prev_cursor = self._encode_vehicle_cursor(vehicles[0]) if vehicles and more_newer else None

        return {
            "vehicles": vehicles,
            "next_cursor": next_cursor,
            "prev_cursor": prev_cursor,
            "limit": limit_value,
        }

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

    def _base_query(self, db: Session):
        return db.query(Vehicle).options(selectinload(Vehicle.office))

    def _apply_filters(self, query, filters: Optional[Dict[str, Any]]):
        if not filters:
            return query

        plate_number = _normalize_identifier(filters.get("plate_number"))
        if plate_number:
            query = query.filter(Vehicle.plate_number_search.ilike(f"%{plate_number}%"))

        chassis_number = _normalize_identifier(filters.get("chassis_number"))
        if chassis_number:
            query = query.filter(Vehicle.chassis_number_search.ilike(f"%{chassis_number}%"))

        registration_number = _normalize_identifier(filters.get("registration_number"))
        if registration_number:
            query = query.filter(Vehicle.registration_number_search.ilike(f"%{registration_number}%"))

        driver_name = filters.get("driver_name")
        if driver_name:
            query = query.filter(Vehicle.driver_name.ilike(f"%{driver_name}%"))

        office_name = filters.get("office_name")
        if office_name:
            query = query.filter(Vehicle.office.has(Office.name == office_name))

        office_id = filters.get("office_id")
        if office_id:
            query = query.filter(Vehicle.office_id == office_id)

        vehicle_type = filters.get("vehicle_type")
        if vehicle_type:
            query = query.filter(Vehicle.vehicle_type == vehicle_type)

        engine_type = filters.get("engine_type")
        if engine_type:
            query = query.filter(Vehicle.engine_type == engine_type)

        wheels = filters.get("wheels")
        if wheels is not None:
            query = query.filter(Vehicle.wheels == wheels)

        return query

    def _populate_latest_tests(self, db: Session, vehicles: List[Vehicle]) -> None:
        if not vehicles:
            return

        vehicle_ids = [vehicle.id for vehicle in vehicles]
        latest_tests_subquery = (
            db.query(
                Test.vehicle_id.label("vehicle_id"),
                Test.result.label("result"),
                Test.test_date.label("test_date"),
                func.row_number()
                .over(partition_by=Test.vehicle_id, order_by=Test.test_date.desc())
                .label("rn"),
            )
            .filter(Test.vehicle_id.in_(vehicle_ids))
        ).subquery()

        latest_tests = (
            db.query(
                latest_tests_subquery.c.vehicle_id,
                latest_tests_subquery.c.result,
                latest_tests_subquery.c.test_date,
            )
            .filter(latest_tests_subquery.c.rn == 1)
            .all()
        )

        latest_by_vehicle = {
            row.vehicle_id: (row.result, row.test_date) for row in latest_tests
        }

        for vehicle in vehicles:
            result, test_date = latest_by_vehicle.get(vehicle.id, (None, None))
            setattr(vehicle, "latest_test_result", result)
            setattr(vehicle, "latest_test_date", test_date)

    def get_multi_with_test_info(
        self,
        db: Session,
        *,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
        after: Optional[str] = None,
        before: Optional[str] = None,
        skip: int = 0,
    ):
        """Get vehicles with their latest test information using keyset pagination"""
        filters = filters or {}
        limit_value = self._sanitize_limit(limit)
        base_query_factory: Callable[[], Any] = lambda: self._apply_filters(self._base_query(db), filters)

        total = base_query_factory().count()

        if skip and skip > 0 and not after and not before:
            after = self._cursor_from_skip(base_query_factory, skip)

        page = self._paginate_vehicle_query(
            base_query_factory=base_query_factory,
            limit=limit_value,
            after=after,
            before=before,
        )
        vehicles = page["vehicles"]

        self._populate_latest_tests(db, vehicles)

        return {
            "vehicles": vehicles,
            "total": total,
            "next_cursor": page["next_cursor"],
            "prev_cursor": page["prev_cursor"],
            "limit": page["limit"],
        }

    def get_multi_optimized(
        self,
        db: Session,
        *,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
        after: Optional[str] = None,
        before: Optional[str] = None,
        skip: int = 0,
    ):
        """Get vehicles without test information for faster loading using keyset pagination"""
        filters = filters or {}
        limit_value = self._sanitize_limit(limit)
        base_query_factory: Callable[[], Any] = lambda: self._apply_filters(self._base_query(db), filters)

        total = base_query_factory().count()

        if skip and skip > 0 and not after and not before:
            after = self._cursor_from_skip(base_query_factory, skip)

        page = self._paginate_vehicle_query(
            base_query_factory=base_query_factory,
            limit=limit_value,
            after=after,
            before=before,
        )
        vehicles = page["vehicles"]

        for vehicle in vehicles:
            setattr(vehicle, "latest_test_result", None)
            setattr(vehicle, "latest_test_date", None)

        return {
            "vehicles": vehicles,
            "total": total,
            "next_cursor": page["next_cursor"],
            "prev_cursor": page["prev_cursor"],
            "limit": page["limit"],
        }

    def get_with_test_info(self, db: Session, *, id: UUID):
        """Get a specific vehicle with its latest test information"""
        vehicle = self._base_query(db).filter(Vehicle.id == id).first()

        if not vehicle:
            return None

        self._populate_latest_tests(db, [vehicle])

        return vehicle

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
    
    def search(
        self,
        db: Session,
        *,
        search_term: str,
        limit: int = 100,
        after: Optional[str] = None,
        before: Optional[str] = None,
        skip: int = 0,
    ):
        """Search vehicles by plate number, chassis number, registration number, driver name, or office using keyset pagination"""
        normalized_term = _normalize_identifier(search_term)
        conditions = []

        if normalized_term:
            like_normalized = f"%{normalized_term}%"
            conditions.extend(
                [
                    Vehicle.plate_number_search.ilike(like_normalized),
                    Vehicle.chassis_number_search.ilike(like_normalized),
                    Vehicle.registration_number_search.ilike(like_normalized),
                ]
            )

        if search_term:
            like_term = f"%{search_term}%"
            conditions.append(Vehicle.driver_name.ilike(like_term))
            conditions.append(Vehicle.office.has(Office.name.ilike(like_term)))

        if not conditions:
            return {"vehicles": [], "total": 0}

        def base_query_factory() -> Any:
            return self._base_query(db).filter(or_(*conditions))

        limit_value = self._sanitize_limit(limit)
        total = base_query_factory().count()

        if skip and skip > 0 and not after and not before:
            after = self._cursor_from_skip(base_query_factory, skip)

        page = self._paginate_vehicle_query(
            base_query_factory=base_query_factory,
            limit=limit_value,
            after=after,
            before=before,
        )
        vehicles = page["vehicles"]

        for vehicle in vehicles:
            setattr(vehicle, "latest_test_result", None)
            setattr(vehicle, "latest_test_date", None)

        return {
            "vehicles": vehicles,
            "total": total,
            "next_cursor": page["next_cursor"],
            "prev_cursor": page["prev_cursor"],
            "limit": page["limit"],
        }

    def get_by_plate_number(self, db: Session, *, plate_number: str) -> Optional[Vehicle]:
        """Get vehicle by plate number"""
        normalized = _normalize_identifier(plate_number)

        if not normalized:
            return None

        vehicle = (
            self._base_query(db)
            .filter(Vehicle.plate_number_search == normalized)
            .first()
        )

        if not vehicle:
            return None

        self._populate_latest_tests(db, [vehicle])

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
        """Get office compliance data aggregated from vehicles and tests (Optimized)"""
        
        # 1. Get Offices (paginated)
        office_query = db.query(Office)
        if filters and filters.get("search_term"):
             office_query = office_query.filter(Office.name.ilike(f"%{filters['search_term']}%"))
        
        # We need to join with vehicles to ensure we only get offices that have vehicles? 
        # The original code did: db.query(Office).join(Vehicle, Office.id == Vehicle.office_id).distinct()
        office_query = office_query.join(Vehicle, Office.id == Vehicle.office_id).distinct()
        
        total_offices = office_query.count()
        offices = office_query.order_by(Office.name).offset(skip).limit(limit).all()
        
        if not offices:
             return {
                "offices": [], 
                "summary": {
                    "total_offices": 0,
                    "total_vehicles": 0,
                    "total_compliant": 0,
                    "overall_compliance_rate": 0
                }, 
                "total": 0
            }

        office_ids = [o.id for o in offices]

        # 2. Get Vehicles for these offices
        vehicle_query = db.query(Vehicle).filter(Vehicle.office_id.in_(office_ids))
        
        # Apply year/quarter filters to restrict vehicles to those tested in the period
        if filters and (filters.get("year") or filters.get("quarter")):
            test_filter_conditions = []
            if filters.get("year"):
                test_filter_conditions.append(Test.year == filters["year"])
            if filters.get("quarter"):
                test_filter_conditions.append(Test.quarter == filters["quarter"])
            
            # Subquery to find vehicle IDs that have matching tests
            stmt = db.query(Test.vehicle_id).filter(*test_filter_conditions).distinct()
            vehicle_query = vehicle_query.filter(Vehicle.id.in_(stmt))
            
        vehicles = vehicle_query.all()
        
        # Map office_id -> list of vehicles
        vehicle_map = {o_id: [] for o_id in office_ids}
        for v in vehicles:
            if v.office_id in vehicle_map:
                vehicle_map[v.office_id].append(v)
            
        # 3. Get Tests for these vehicles
        vehicle_ids = [v.id for v in vehicles]
        
        if not vehicle_ids:
             # No vehicles found matching criteria
             return {
                "offices": [], 
                "summary": {
                    "total_offices": len(offices),
                    "total_vehicles": 0,
                    "total_compliant": 0,
                    "overall_compliance_rate": 0
                }, 
                "total": total_offices
            }

        test_query = db.query(Test).filter(Test.vehicle_id.in_(vehicle_ids))
        
        if filters:
            if filters.get("year"):
                test_query = test_query.filter(Test.year == filters["year"])
            if filters.get("quarter"):
                test_query = test_query.filter(Test.quarter == filters["quarter"])
        
        tests = test_query.order_by(Test.test_date.desc()).all()
        
        # Map vehicle_id -> latest test
        latest_tests = {}
        for t in tests:
            if t.vehicle_id not in latest_tests:
                latest_tests[t.vehicle_id] = t
        
        # 4. Aggregate Data
        office_compliance_data = []
        total_vehicles_all = 0
        total_compliant_all = 0
        
        for office in offices:
            office_vehicles = vehicle_map.get(office.id, [])
            
            total_vehicles = len(office_vehicles)
            if total_vehicles == 0:
                continue

            tested_vehicles = 0
            compliant_vehicles = 0
            last_test_date = None
            
            for v in office_vehicles:
                test = latest_tests.get(v.id)
                if test:
                    tested_vehicles += 1
                    if test.result:
                        compliant_vehicles += 1
                    
                    if last_test_date is None or test.test_date > last_test_date:
                        last_test_date = test.test_date
            
            # If we filtered vehicles by having tests, tested_vehicles should equal total_vehicles
            # But let's keep the logic generic
            
            non_compliant_vehicles = tested_vehicles - compliant_vehicles
            compliance_rate = (compliant_vehicles / tested_vehicles * 100) if tested_vehicles > 0 else 0
            
            office_data = OfficeComplianceData(
                office_name=office.name,
                total_vehicles=total_vehicles,
                tested_vehicles=tested_vehicles,
                compliant_vehicles=compliant_vehicles,
                non_compliant_vehicles=non_compliant_vehicles,
                compliance_rate=round(compliance_rate, 2),
                last_test_date=last_test_date
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