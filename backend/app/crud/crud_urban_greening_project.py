from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func, case
from datetime import datetime, timedelta
import json
import re

from app.crud.base_crud import CRUDBase
from app.models.urban_greening_models import UrbanGreeningProject
from app.schemas.urban_greening_project_schemas import (
    UrbanGreeningProjectCreate,
    UrbanGreeningProjectUpdate,
    ProjectStats
)


def _normalize_text(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    normalized = re.sub(r"[^a-z0-9 ]", "", value.lower())
    return normalized or None


class CRUDUrbanGreeningProject(CRUDBase[UrbanGreeningProject, UrbanGreeningProjectCreate, UrbanGreeningProjectUpdate]):
    
    def get(self, db: Session, id: any) -> Optional[UrbanGreeningProject]:
        return db.query(UrbanGreeningProject).filter(UrbanGreeningProject.id == id).first()

    def _base_query(self, db: Session):
        return db.query(UrbanGreeningProject)

    def _apply_filters(
        self,
        query,
        *,
        status: Optional[str] = None,
        project_type: Optional[str] = None,
        search: Optional[str] = None,
        year: Optional[int] = None,
    ):
        if status:
            query = query.filter(UrbanGreeningProject.status == status)

        if project_type:
            query = query.filter(UrbanGreeningProject.project_type == project_type)

        if year:
            start = datetime(year, 1, 1)
            end = datetime(year + 1, 1, 1)
            query = query.filter(
                UrbanGreeningProject.created_at >= start,
                UrbanGreeningProject.created_at < end,
            )

        if search:
            normalized = _normalize_text(search)
            conditions = []

            if normalized:
                like_normalized = f"%{normalized}%"
                conditions.extend(
                    [
                        UrbanGreeningProject.project_code_search.ilike(like_normalized),
                        UrbanGreeningProject.location_search.ilike(like_normalized),
                        UrbanGreeningProject.barangay_search.ilike(like_normalized),
                    ]
                )

            like_term = f"%{search}%"
            conditions.extend(
                [
                    UrbanGreeningProject.project_code.ilike(like_term),
                    UrbanGreeningProject.location.ilike(like_term),
                    UrbanGreeningProject.barangay.ilike(like_term),
                    UrbanGreeningProject.project_lead.ilike(like_term),
                    UrbanGreeningProject.organization.ilike(like_term),
                ]
            )

            query = query.filter(or_(*conditions))

        return query
    
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
        query = self._apply_filters(
            self._base_query(db),
            status=status,
            project_type=project_type,
            search=search,
            year=year,
        )

        return (
            query.order_by(UrbanGreeningProject.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
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
        aggregates = db.query(
            func.count(UrbanGreeningProject.id),
            func.coalesce(
                func.sum(
                    case(
                        (UrbanGreeningProject.status.in_(["planning", "procurement", "ready", "in_progress"]), 1),
                        else_=0,
                    )
                ),
                0,
            ),
            func.coalesce(
                func.sum(
                    case(
                        (UrbanGreeningProject.status == "completed", 1),
                        else_=0,
                    )
                ),
                0,
            ),
            func.coalesce(func.sum(UrbanGreeningProject.total_plants), 0),
            func.coalesce(func.sum(UrbanGreeningProject.surviving_plants), 0),
            func.avg(UrbanGreeningProject.survival_rate),
        ).one()

        total_projects = aggregates[0] or 0
        active_projects = aggregates[1] or 0
        completed_projects = aggregates[2] or 0
        total_plants_planned = int(aggregates[3] or 0)
        total_plants_planted = int(aggregates[4] or 0)
        avg_survival_rate = float(aggregates[5] or 0)

        by_type_query = db.query(
            UrbanGreeningProject.project_type.label("type"),
            func.count(UrbanGreeningProject.id).label("count"),
            func.coalesce(func.sum(UrbanGreeningProject.total_plants), 0).label("plants"),
        ).group_by(UrbanGreeningProject.project_type)

        by_type = [
            {"type": row.type, "count": row.count, "plants": row.plants}
            for row in by_type_query
        ]

        by_status_query = db.query(
            UrbanGreeningProject.status.label("status"),
            func.count(UrbanGreeningProject.id).label("count"),
        ).group_by(UrbanGreeningProject.status)

        by_status = [{"status": row.status, "count": row.count} for row in by_status_query]

        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_plantings = (
            db.query(func.count(UrbanGreeningProject.id))
            .filter(UrbanGreeningProject.actual_start_date >= thirty_days_ago.date())
            .scalar()
            or 0
        )

        return ProjectStats(
            total_projects=total_projects,
            active_projects=active_projects,
            completed_projects=completed_projects,
            total_plants_planned=total_plants_planned,
            total_plants_planted=total_plants_planted,
            survival_rate=avg_survival_rate,
            by_type=by_type,
            by_status=by_status,
            recent_plantings=recent_plantings
        )


urban_greening_project_crud = CRUDUrbanGreeningProject(UrbanGreeningProject)
