from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func, extract
from datetime import date, datetime

from app.crud.base_crud import CRUDBase
from app.models.urban_greening_models import UrbanGreeningPlanting, SaplingCollection, SaplingRequest
from app.schemas.planting_schemas import (
    UrbanGreeningPlantingCreate, UrbanGreeningPlantingUpdate,
    SaplingCollectionCreate, SaplingCollectionUpdate,
    PlantingStatistics, SaplingStatistics,
    SaplingRequestCreate, SaplingRequestUpdate
)


class CRUDUrbanGreeningPlanting(CRUDBase[UrbanGreeningPlanting, UrbanGreeningPlantingCreate, UrbanGreeningPlantingUpdate]):
    
    def get(self, db: Session, id: any) -> Optional[UrbanGreeningPlanting]:
        """Get urban greening planting by ID (sync override)"""
        return db.query(UrbanGreeningPlanting).filter(UrbanGreeningPlanting.id == id).first()
    
    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[UrbanGreeningPlanting]:
        """Get multiple urban greening plantings (sync override)"""
        return db.query(UrbanGreeningPlanting).offset(skip).limit(limit).all()
    
    def create(self, db: Session, *, obj_in) -> UrbanGreeningPlanting:
        """Create urban greening planting (sync override)"""
        if isinstance(obj_in, dict):
            obj_in_data = obj_in
        else:
            obj_in_data = obj_in.model_dump() if hasattr(obj_in, 'model_dump') else obj_in
        # Ensure plants is serialized to text if provided as list
        if isinstance(obj_in_data.get("plants"), list):
            import json
            obj_in_data["plants"] = json.dumps(obj_in_data["plants"]) if obj_in_data["plants"] else None
        db_obj = UrbanGreeningPlanting(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(self, db: Session, *, db_obj: UrbanGreeningPlanting, obj_in: UrbanGreeningPlantingUpdate) -> UrbanGreeningPlanting:
        """Update urban greening planting (sync override)"""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove(self, db: Session, *, id: any) -> UrbanGreeningPlanting:
        """Remove urban greening planting (sync override)"""
        obj = db.query(UrbanGreeningPlanting).filter(UrbanGreeningPlanting.id == id).first()
        if obj:
            db.delete(obj)
            db.commit()
        return obj
    
    def get_by_record_number(self, db: Session, *, record_number: str) -> Optional[UrbanGreeningPlanting]:
        """Get urban greening planting by record number"""
        return db.query(UrbanGreeningPlanting).filter(UrbanGreeningPlanting.record_number == record_number).first()
    
    def get_by_type(self, db: Session, *, planting_type: str, skip: int = 0, limit: int = 100) -> List[UrbanGreeningPlanting]:
        """Get plantings by type"""
        return db.query(UrbanGreeningPlanting).filter(
            UrbanGreeningPlanting.planting_type == planting_type
        ).offset(skip).limit(limit).all()
    
    def get_by_status(self, db: Session, *, status: str, skip: int = 0, limit: int = 100) -> List[UrbanGreeningPlanting]:
        """Get plantings by status"""
        return db.query(UrbanGreeningPlanting).filter(
            UrbanGreeningPlanting.status == status
        ).offset(skip).limit(limit).all()
    
    def get_by_date_range(
        self, 
        db: Session, 
        *, 
        start_date: date, 
        end_date: date, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[UrbanGreeningPlanting]:
        """Get plantings within date range"""
        return db.query(UrbanGreeningPlanting).filter(
            and_(
                UrbanGreeningPlanting.planting_date >= start_date,
                UrbanGreeningPlanting.planting_date <= end_date
            )
        ).offset(skip).limit(limit).all()
    
    def get_by_location(self, db: Session, *, location: str, skip: int = 0, limit: int = 100) -> List[UrbanGreeningPlanting]:
        """Get plantings by location (partial match)"""
        return db.query(UrbanGreeningPlanting).filter(
            UrbanGreeningPlanting.location.ilike(f"%{location}%")
        ).offset(skip).limit(limit).all()
    
    def get_by_monitoring_request(self, db: Session, *, monitoring_request_id: str) -> List[UrbanGreeningPlanting]:
        """Get plantings linked to a specific monitoring request"""
        return db.query(UrbanGreeningPlanting).filter(
            UrbanGreeningPlanting.monitoring_request_id == monitoring_request_id
        ).all()
    
    def get_by_year(self, db: Session, *, year: int, skip: int = 0, limit: int = 100) -> List[UrbanGreeningPlanting]:
        """Get urban greening plantings filtered by year"""
        return (
            db.query(UrbanGreeningPlanting)
            .filter(extract('year', UrbanGreeningPlanting.planting_date) == year)
            .order_by(desc(UrbanGreeningPlanting.planting_date))
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def search(
        self, 
        db: Session, 
        *, 
        search_term: str, 
        planting_type: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[UrbanGreeningPlanting]:
        """Search plantings with filters"""
        query = db.query(UrbanGreeningPlanting)
        
        # Search term filter
        if search_term:
            search_filter = or_(
                UrbanGreeningPlanting.record_number.ilike(f"%{search_term}%"),
                UrbanGreeningPlanting.species_name.ilike(f"%{search_term}%"),
                UrbanGreeningPlanting.location.ilike(f"%{search_term}%"),
                UrbanGreeningPlanting.responsible_person.ilike(f"%{search_term}%"),
                UrbanGreeningPlanting.organization.ilike(f"%{search_term}%")
            )
            query = query.filter(search_filter)
        
        # Type filter
        if planting_type and planting_type != "all":
            query = query.filter(UrbanGreeningPlanting.planting_type == planting_type)
        
        # Status filter
        if status and status != "all":
            query = query.filter(UrbanGreeningPlanting.status == status)
        
        return query.order_by(desc(UrbanGreeningPlanting.planting_date)).offset(skip).limit(limit).all()
    
    def get_statistics(self, db: Session) -> PlantingStatistics:
        """Get planting statistics"""
        # Total counts
        total_plantings = db.query(func.count(UrbanGreeningPlanting.id)).scalar()
        total_quantity = db.query(func.sum(UrbanGreeningPlanting.quantity_planted)).scalar() or 0
        
        # By type
        type_stats = db.query(
            UrbanGreeningPlanting.planting_type,
            func.count(UrbanGreeningPlanting.id),
            func.sum(UrbanGreeningPlanting.quantity_planted)
        ).group_by(UrbanGreeningPlanting.planting_type).all()
        
        by_type = {row[0]: {"count": row[1], "quantity": row[2] or 0} for row in type_stats}
        
        # By status
        status_stats = db.query(
            UrbanGreeningPlanting.status,
            func.count(UrbanGreeningPlanting.id)
        ).group_by(UrbanGreeningPlanting.status).all()
        
        by_status = {row[0]: row[1] for row in status_stats}
        
        # By month (current year)
        current_year = datetime.now().year
        month_stats = db.query(
            extract('month', UrbanGreeningPlanting.planting_date),
            func.count(UrbanGreeningPlanting.id),
            func.sum(UrbanGreeningPlanting.quantity_planted)
        ).filter(
            extract('year', UrbanGreeningPlanting.planting_date) == current_year
        ).group_by(extract('month', UrbanGreeningPlanting.planting_date)).all()
        
        by_month = {int(row[0]): {"count": row[1], "quantity": row[2] or 0} for row in month_stats}
        
        return PlantingStatistics(
            total_plantings=total_plantings,
            total_quantity=total_quantity,
            by_type=by_type,
            by_status=by_status,
            by_month=by_month
        )


class CRUDSaplingCollection(CRUDBase[SaplingCollection, SaplingCollectionCreate, SaplingCollectionUpdate]):
    
    def get(self, db: Session, id: any) -> Optional[SaplingCollection]:
        """Get sapling collection by ID (sync override)"""
        return db.query(SaplingCollection).filter(SaplingCollection.id == id).first()
    
    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[SaplingCollection]:
        """Get multiple sapling collections (sync override)"""
        return db.query(SaplingCollection).offset(skip).limit(limit).all()
    
    def create(self, db: Session, *, obj_in) -> SaplingCollection:
        """Create sapling collection (sync override)"""
        if isinstance(obj_in, dict):
            obj_in_data = obj_in
        else:
            obj_in_data = obj_in.model_dump() if hasattr(obj_in, 'model_dump') else obj_in
        db_obj = SaplingCollection(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(self, db: Session, *, db_obj: SaplingCollection, obj_in: SaplingCollectionUpdate) -> SaplingCollection:
        """Update sapling collection (sync override)"""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove(self, db: Session, *, id: any) -> SaplingCollection:
        """Remove sapling collection (sync override)"""
        obj = db.query(SaplingCollection).filter(SaplingCollection.id == id).first()
        if obj:
            db.delete(obj)
            db.commit()
        return obj
    
    def get_by_collection_number(self, db: Session, *, collection_number: str) -> Optional[SaplingCollection]:
        """Get sapling collection by collection number"""
        return db.query(SaplingCollection).filter(SaplingCollection.collection_number == collection_number).first()
    
    def get_by_species(self, db: Session, *, species_name: str, skip: int = 0, limit: int = 100) -> List[SaplingCollection]:
        """Get collections by species"""
        return db.query(SaplingCollection).filter(
            SaplingCollection.species_name.ilike(f"%{species_name}%")
        ).offset(skip).limit(limit).all()
    
    def get_by_purpose(self, db: Session, *, purpose: str, skip: int = 0, limit: int = 100) -> List[SaplingCollection]:
        """Get collections by purpose"""
        return db.query(SaplingCollection).filter(
            SaplingCollection.purpose == purpose
        ).offset(skip).limit(limit).all()
    
    def get_by_status(self, db: Session, *, status: str, skip: int = 0, limit: int = 100) -> List[SaplingCollection]:
        """Get collections by status"""
        return db.query(SaplingCollection).filter(
            SaplingCollection.status == status
        ).offset(skip).limit(limit).all()
    
    def get_by_date_range(
        self, 
        db: Session, 
        *, 
        start_date: date, 
        end_date: date, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[SaplingCollection]:
        """Get collections within date range"""
        return db.query(SaplingCollection).filter(
            and_(
                SaplingCollection.collection_date >= start_date,
                SaplingCollection.collection_date <= end_date
            )
        ).offset(skip).limit(limit).all()
    
    def search(
        self, 
        db: Session, 
        *, 
        search_term: str,
        purpose: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[SaplingCollection]:
        """Search collections with filters"""
        query = db.query(SaplingCollection)
        
        # Search term filter
        if search_term:
            search_filter = or_(
                SaplingCollection.collection_number.ilike(f"%{search_term}%"),
                SaplingCollection.species_name.ilike(f"%{search_term}%"),
                SaplingCollection.collection_location.ilike(f"%{search_term}%"),
                SaplingCollection.collector_name.ilike(f"%{search_term}%"),
                SaplingCollection.recipient_name.ilike(f"%{search_term}%")
            )
            query = query.filter(search_filter)
        
        # Purpose filter
        if purpose and purpose != "all":
            query = query.filter(SaplingCollection.purpose == purpose)
        
        # Status filter
        if status and status != "all":
            query = query.filter(SaplingCollection.status == status)
        
        return query.order_by(desc(SaplingCollection.collection_date)).offset(skip).limit(limit).all()
    
    def get_statistics(self, db: Session) -> SaplingStatistics:
        """Get sapling collection statistics"""
        # Total counts
        total_collections = db.query(func.count(SaplingCollection.id)).scalar()
        total_quantity = db.query(func.sum(SaplingCollection.quantity_collected)).scalar() or 0
        
        # By species
        species_stats = db.query(
            SaplingCollection.species_name,
            func.count(SaplingCollection.id),
            func.sum(SaplingCollection.quantity_collected)
        ).group_by(SaplingCollection.species_name).all()
        
        by_species = {row[0]: {"count": row[1], "quantity": row[2] or 0} for row in species_stats}
        
        # By purpose
        purpose_stats = db.query(
            SaplingCollection.purpose,
            func.count(SaplingCollection.id),
            func.sum(SaplingCollection.quantity_collected)
        ).group_by(SaplingCollection.purpose).all()
        
        by_purpose = {row[0]: {"count": row[1], "quantity": row[2] or 0} for row in purpose_stats}
        
        # By status
        status_stats = db.query(
            SaplingCollection.status,
            func.count(SaplingCollection.id)
        ).group_by(SaplingCollection.status).all()
        
        by_status = {row[0]: row[1] for row in status_stats}
        
        # Average survival rate
        survival_rate_avg = db.query(func.avg(SaplingCollection.survival_rate)).filter(
            SaplingCollection.survival_rate.isnot(None)
        ).scalar()
        
        return SaplingStatistics(
            total_collections=total_collections,
            total_quantity=total_quantity,
            by_species=by_species,
            by_purpose=by_purpose,
            by_status=by_status,
            survival_rate_avg=float(survival_rate_avg) if survival_rate_avg else None
        )


# Create instances
urban_greening_planting_crud = CRUDUrbanGreeningPlanting(UrbanGreeningPlanting)
sapling_collection_crud = CRUDSaplingCollection(SaplingCollection)


class CRUDSaplingRequest(CRUDBase[SaplingRequest, SaplingRequestCreate, SaplingRequestUpdate]):
    def get(self, db: Session, id: any) -> Optional[SaplingRequest]:
        return db.query(SaplingRequest).filter(SaplingRequest.id == id).first()

    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[SaplingRequest]:
        return db.query(SaplingRequest).order_by(desc(SaplingRequest.date_received)).offset(skip).limit(limit).all()
    
    def get_by_year(self, db: Session, *, year: int, skip: int = 0, limit: int = 100) -> List[SaplingRequest]:
        """Get sapling requests filtered by year"""
        return (
            db.query(SaplingRequest)
            .filter(extract('year', SaplingRequest.date_received) == year)
            .order_by(desc(SaplingRequest.date_received))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, db: Session, *, obj_in) -> SaplingRequest:
        data = obj_in if isinstance(obj_in, dict) else obj_in.model_dump()
        # store saplings as JSON string
        import json
        saplings_text = json.dumps([s if isinstance(s, dict) else s.model_dump() for s in data.get("saplings", [])])
        db_obj = SaplingRequest(
            date_received=data["date_received"],
            requester_name=data["requester_name"],
            address=data["address"],
            saplings=saplings_text,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: SaplingRequest, obj_in: SaplingRequestUpdate) -> SaplingRequest:
        update_data = obj_in if isinstance(obj_in, dict) else obj_in.model_dump(exclude_unset=True)
        if "saplings" in update_data and update_data["saplings"] is not None:
            import json
            update_data["saplings"] = json.dumps([
                s if isinstance(s, dict) else s.model_dump() for s in update_data["saplings"]
            ])
        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: any) -> SaplingRequest:
        obj = db.query(SaplingRequest).filter(SaplingRequest.id == id).first()
        if obj:
            db.delete(obj)
            db.commit()
        return obj


sapling_request_crud = CRUDSaplingRequest(SaplingRequest)
