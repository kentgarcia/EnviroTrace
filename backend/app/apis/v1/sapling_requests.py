from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from app.db.database import get_db
from app.schemas.planting_schemas import (
    SaplingRequestCreate,
    SaplingRequestUpdate,
    SaplingRequestInDB,
)
from app.crud.crud_planting import sapling_request_crud
from app.crud import crud_monitoring_request
from app.schemas.monitoring_request_schemas import MonitoringRequestCreate


router = APIRouter(prefix="/planting/sapling-requests", tags=["Sapling Requests"])


def _serialize(obj) -> dict:
    """Serialize a SaplingRequest ORM to response dict with saplings as list."""
    try:
        saplings = json.loads(obj.saplings) if isinstance(obj.saplings, str) else (obj.saplings or [])
    except Exception:
        saplings = []
    return {
        "id": str(obj.id),
        "date_received": obj.date_received,
        "requester_name": obj.requester_name,
        "address": obj.address,
        "saplings": saplings,
        "monitoring_request_id": obj.monitoring_request_id,
        "created_at": obj.created_at,
        "updated_at": obj.updated_at,
    }


@router.get("/", response_model=List[SaplingRequestInDB])
def list_sapling_requests(db: Session = Depends(get_db)):
    items = sapling_request_crud.get_multi(db)
    return [_serialize(x) for x in items]


@router.get("/{request_id}", response_model=SaplingRequestInDB)
def get_sapling_request(request_id: str, db: Session = Depends(get_db)):
    req = sapling_request_crud.get(db, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Sapling request not found")
    return _serialize(req)


@router.post("/", response_model=SaplingRequestInDB)
def create_sapling_request(request: SaplingRequestCreate, db: Session = Depends(get_db)):
    # If no monitoring request is linked, auto-create a default one
    monitoring_request_id = request.monitoring_request_id
    if not monitoring_request_id:
        # Default to Untracked with a sensible center location
        default_loc = {"lat": 14.5995, "lng": 120.9842}
        mr = crud_monitoring_request.create_request(
            db,
            MonitoringRequestCreate(
                status="Untracked",
                location=default_loc,  # type: ignore[arg-type]
                title=f"Sapling Request: {request.requester_name}",
                address=request.address,
            ),
        )
        monitoring_request_id = mr.id

    data = request.model_dump()
    data["monitoring_request_id"] = monitoring_request_id
    obj = sapling_request_crud.create(db, obj_in=data)
    return _serialize(obj)


@router.put("/{request_id}", response_model=SaplingRequestInDB)
def update_sapling_request(
    request_id: str, request: SaplingRequestUpdate, db: Session = Depends(get_db)
):
    db_obj = sapling_request_crud.get(db, request_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Sapling request not found")
    updated = sapling_request_crud.update(db, db_obj=db_obj, obj_in=request)
    return _serialize(updated)


@router.delete("/{request_id}", response_model=bool)
def delete_sapling_request(request_id: str, db: Session = Depends(get_db)):
    deleted = sapling_request_crud.remove(db, id=request_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Sapling request not found")
    return True
