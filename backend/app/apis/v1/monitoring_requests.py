from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.schemas.monitoring_request_schemas import (
    MonitoringRequestCreate,
    MonitoringRequestUpdate,
    MonitoringRequest as MonitoringRequestSchema,
    MonitoringRequestListResponse,
)
from app.crud import crud_monitoring_request
from app.db.database import get_db
from typing import List, Optional

router = APIRouter(prefix="/monitoring-requests", tags=["Monitoring Requests"])

@router.get("/", response_model=MonitoringRequestListResponse)
def list_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return crud_monitoring_request.get_requests(
        db, 
        skip=skip, 
        limit=limit, 
        status=status, 
        search=search
    )

@router.get("/{request_id}", response_model=MonitoringRequestSchema)
def get_request(request_id: str, db: Session = Depends(get_db)):
    req = crud_monitoring_request.get_request(db, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req

@router.post("/", response_model=MonitoringRequestSchema)
def create_request(request: MonitoringRequestCreate, db: Session = Depends(get_db)):
    return crud_monitoring_request.create_request(db, request)

@router.put("/{request_id}", response_model=MonitoringRequestSchema)
def update_request(request_id: str, request: MonitoringRequestUpdate, db: Session = Depends(get_db)):
    updated = crud_monitoring_request.update_request(db, request_id, request)
    if not updated:
        raise HTTPException(status_code=404, detail="Request not found")
    return updated

@router.delete("/{request_id}", response_model=bool)
def delete_request(request_id: str, db: Session = Depends(get_db)):
    deleted = crud_monitoring_request.delete_request(db, request_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Request not found")
    return deleted
