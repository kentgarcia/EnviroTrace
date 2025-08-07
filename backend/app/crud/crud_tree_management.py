from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import date
from app.crud.base_crud import CRUDBase
from app.models.urban_greening_models import TreeManagementRequest
from app.schemas.tree_management_schemas import (
    TreeManagementRequestCreate, 
    TreeManagementRequestUpdate
)


class CRUDTreeManagementRequest(CRUDBase[TreeManagementRequest, TreeManagementRequestCreate, TreeManagementRequestUpdate]):
    def get_by_request_number(self, db: Session, *, request_number: str) -> Optional[TreeManagementRequest]:
        return db.query(TreeManagementRequest).filter(TreeManagementRequest.request_number == request_number).first()

    def get_by_request_type(self, db: Session, *, request_type: str) -> List[TreeManagementRequest]:
        return db.query(TreeManagementRequest).filter(TreeManagementRequest.request_type == request_type).all()

    def get_by_status(self, db: Session, *, status: str) -> List[TreeManagementRequest]:
        return db.query(TreeManagementRequest).filter(TreeManagementRequest.status == status).all()

    def get_by_requester(self, db: Session, *, requester_name: str) -> List[TreeManagementRequest]:
        return db.query(TreeManagementRequest).filter(TreeManagementRequest.requester_name.ilike(f"%{requester_name}%")).all()

    def get_by_urgency_level(self, db: Session, *, urgency_level: str) -> List[TreeManagementRequest]:
        return db.query(TreeManagementRequest).filter(TreeManagementRequest.urgency_level == urgency_level).all()

    def get_pending_requests(self, db: Session) -> List[TreeManagementRequest]:
        return db.query(TreeManagementRequest).filter(
            TreeManagementRequest.status.in_(["filed", "under_review", "approved", "payment_pending"])
        ).all()

    def get_overdue_requests(self, db: Session) -> List[TreeManagementRequest]:
        today = date.today()
        return db.query(TreeManagementRequest).filter(
            and_(
                TreeManagementRequest.scheduled_date < today,
                TreeManagementRequest.status.in_(["approved", "in_progress"])
            )
        ).all()

    def get_by_tree_species(self, db: Session, *, tree_species: str) -> List[TreeManagementRequest]:
        return db.query(TreeManagementRequest).filter(TreeManagementRequest.tree_species.ilike(f"%{tree_species}%")).all()

    def get_by_assigned_inspector(self, db: Session, *, inspector: str) -> List[TreeManagementRequest]:
        return db.query(TreeManagementRequest).filter(TreeManagementRequest.assigned_inspector.ilike(f"%{inspector}%")).all()

    def get_by_date_range(self, db: Session, *, start_date: date, end_date: date) -> List[TreeManagementRequest]:
        return db.query(TreeManagementRequest).filter(
            and_(
                TreeManagementRequest.request_date >= start_date,
                TreeManagementRequest.request_date <= end_date
            )
        ).all()

    def get_multi_sync(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[TreeManagementRequest]:
        """Synchronous version of get_multi for use with sync sessions"""
        return db.query(TreeManagementRequest).offset(skip).limit(limit).all()

    def create_sync(self, db: Session, *, obj_in: TreeManagementRequestCreate) -> TreeManagementRequest:
        """Synchronous version of create for use with sync sessions"""
        obj_in_data = obj_in.model_dump()
        db_obj = TreeManagementRequest(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_sync(self, db: Session, *, db_obj: TreeManagementRequest, obj_in: TreeManagementRequestUpdate) -> TreeManagementRequest:
        """Synchronous version of update for use with sync sessions"""
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove_sync(self, db: Session, *, id: str) -> Optional[TreeManagementRequest]:
        """Synchronous version of remove for use with sync sessions"""
        obj = db.query(TreeManagementRequest).filter(TreeManagementRequest.id == id).first()
        if obj:
            db.delete(obj)
            db.commit()
        return obj


tree_management_request = CRUDTreeManagementRequest(TreeManagementRequest)
