from app.models.monitoring_request_models import MonitoringRequest
from app.schemas.monitoring_request_schemas import (
    MonitoringRequestCreate,
    MonitoringRequestUpdate,
    MonitoringRequest as MonitoringRequestSchema,
)
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

def get_requests(db: Session) -> List[MonitoringRequest]:
    return db.query(MonitoringRequest).all()

def get_request(db: Session, request_id: str) -> Optional[MonitoringRequest]:
    return db.query(MonitoringRequest).filter(MonitoringRequest.id == request_id).first()

def create_request(db: Session, request: MonitoringRequestCreate) -> MonitoringRequest:
    db_request = MonitoringRequest(
        id=f"REQ-{str(uuid.uuid4())[:8]}",
        status=request.status,
        location=request.location.dict(),
        title=request.title,
        requester_name=request.requester_name,
        date=request.date,
        address=request.address,
        description=request.description,
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

def update_request(db: Session, request_id: str, request: MonitoringRequestUpdate) -> Optional[MonitoringRequest]:
    db_request = get_request(db, request_id)
    if not db_request:
        return None
    data = request.model_dump(exclude_unset=False)
    for field, value in data.items():
        setattr(db_request, field, value)
    db.commit()
    db.refresh(db_request)
    return db_request

def delete_request(db: Session, request_id: str) -> bool:
    db_request = get_request(db, request_id)
    if not db_request:
        return False
    db.delete(db_request)
    db.commit()
    return True
