from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func, extract
from datetime import date, datetime
import json

from app.crud.base_crud import CRUDBase
from app.models.urban_greening_models import UrbanGreeningProject
from app.schemas.urban_greening_project_schemas import (
    UrbanGreeningProjectCreate,
    UrbanGreeningProjectUpdate,
    ProjectStats
)


class CRUDUrbanGreeningProject(CRUDBase[UrbanGreeningProject, UrbanGreeningProjectCreate, UrbanGreeningProjectUpdate]):
    
    def get(self, db: Session, id: any) -> Optional[UrbanGreeningProject]:
        return db.query(UrbanGreeningProject).filter(UrbanGreeningProject.id == id).first()
    
    def get_multi(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        project_type: Optional[str] = None,
        search: Optional[str] = None,
        year: Optional[int] = None
    ) -> List[UrbanGreeningProject]:
        query = db.query(UrbanGreeningProject)
        
        if status:
            query = query.filter(UrbanGreeningProject.status == status)
        if project_type:
            query = query.filter(UrbanGreeningProject.project_type == project_type)
        if year:
            query = query.filter(extract('year', UrbanGreeningProject.created_at) == year)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    UrbanGreeningProject.project_code.ilike(search_term),
                    UrbanGreeningProject.location.ilike(search_term)
                )
            )
        
        return query.order_by(desc(UrbanGreeningProject.created_at)).offset(skip).limit(limit).all()
    
    def create(self, db: Session, *, obj_in) -> UrbanGreeningProject:
        data = obj_in if isinstance(obj_in, dict) else obj_in.model_dump()
        
        # Remove None/empty optional fields to avoid issues
        if "planting_date" in data and not data["planting_date"]:
            data.pop("planting_date", None)
        if "planned_start_date" in data and not data["planned_start_date"]:
            data.pop("planned_start_date", None)
        if "planned_end_date" in data and not data["planned_end_date"]:
            data.pop("planned_end_date", None)
        if "actual_start_date" in data and not data["actual_start_date"]:
            data.pop("actual_start_date", None)
        if "actual_end_date" in data and not data["actual_end_date"]:
            data.pop("actual_end_date", None)
        
        # Serialize complex fields to JSON
        if "plants" in data and data["plants"] is not None:
            data["plants"] = json.dumps([
                p if isinstance(p, dict) else p.model_dump() for p in data["plants"]
            ])
        
        if "linked_cut_tree_ids" in data and data["linked_cut_tree_ids"] is not None:
            data["linked_cut_tree_ids"] = json.dumps(data["linked_cut_tree_ids"])
        
        if "photos" in data and data["photos"] is not None:
            data["photos"] = json.dumps(data["photos"])
        
        # Calculate total_plants from plants array
        plants_data = json.loads(data.get("plants", "[]")) if isinstance(data.get("plants"), str) else (data.get("plants") or [])
        data["total_plants"] = sum(p.get("quantity", 0) for p in plants_data)
        
        db_obj = UrbanGreeningProject(**data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(self, db: Session, *, db_obj: UrbanGreeningProject, obj_in: UrbanGreeningProjectUpdate) -> UrbanGreeningProject:
        update_data = obj_in if isinstance(obj_in, dict) else obj_in.model_dump(exclude_unset=True)
        
        # Serialize complex fields
        if "plants" in update_data and update_data["plants"] is not None:
            update_data["plants"] = json.dumps([
                p if isinstance(p, dict) else p.model_dump() for p in update_data["plants"]
            ])
            # Recalculate total_plants
            plants_data = json.loads(update_data["plants"])
            update_data["total_plants"] = sum(p.get("quantity", 0) for p in plants_data)
        
        if "linked_cut_tree_ids" in update_data and update_data["linked_cut_tree_ids"] is not None:
            update_data["linked_cut_tree_ids"] = json.dumps(update_data["linked_cut_tree_ids"])
        
        if "photos" in update_data and update_data["photos"] is not None:
            update_data["photos"] = json.dumps(update_data["photos"])
        
        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove(self, db: Session, *, id: any) -> UrbanGreeningProject:
        obj = db.query(UrbanGreeningProject).filter(UrbanGreeningProject.id == id).first()
        if obj:
            db.delete(obj)
            db.commit()
        return obj
    
    def get_stats(self, db: Session) -> ProjectStats:
        # Total counts
        total_projects = db.query(func.count(UrbanGreeningProject.id)).scalar() or 0
        active_projects = db.query(func.count(UrbanGreeningProject.id)).filter(
            UrbanGreeningProject.status.in_(["planning", "procurement", "ready", "in_progress"])
        ).scalar() or 0
        completed_projects = db.query(func.count(UrbanGreeningProject.id)).filter(
            UrbanGreeningProject.status == "completed"
        ).scalar() or 0
        
        # Plant totals
        total_plants_planned = db.query(func.sum(UrbanGreeningProject.total_plants)).scalar() or 0
        total_plants_planted = db.query(func.sum(UrbanGreeningProject.surviving_plants)).scalar() or 0
        
        # Survival rate
        avg_survival_rate = db.query(func.avg(UrbanGreeningProject.survival_rate)).scalar() or 0
        
        # By type
        by_type_query = db.query(
            UrbanGreeningProject.project_type.label("type"),
            func.count(UrbanGreeningProject.id).label("count"),
            func.sum(UrbanGreeningProject.total_plants).label("plants")
        ).group_by(UrbanGreeningProject.project_type).all()
        
        by_type = [{"type": row.type, "count": row.count, "plants": row.plants or 0} for row in by_type_query]
        
        # By status
        by_status_query = db.query(
            UrbanGreeningProject.status.label("status"),
            func.count(UrbanGreeningProject.id).label("count")
        ).group_by(UrbanGreeningProject.status).all()
        
        by_status = [{"status": row.status, "count": row.count} for row in by_status_query]
        
        # Recent plantings (last 30 days)
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_plantings = db.query(func.count(UrbanGreeningProject.id)).filter(
            UrbanGreeningProject.actual_start_date >= thirty_days_ago.date()
        ).scalar() or 0
        
        return ProjectStats(
            total_projects=total_projects,
            active_projects=active_projects,
            completed_projects=completed_projects,
            total_plants_planned=int(total_plants_planned),
            total_plants_planted=int(total_plants_planted),
            survival_rate=float(avg_survival_rate or 0),
            by_type=by_type,
            by_status=by_status,
            recent_plantings=recent_plantings
        )


urban_greening_project_crud = CRUDUrbanGreeningProject(UrbanGreeningProject)
