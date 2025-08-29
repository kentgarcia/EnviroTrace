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


router = APIRouter(prefix="/planting/sapling-requests", tags=["Sapling Requests"])


def _serialize(obj) -> dict:
    """Serialize a SaplingRequest ORM to response dict with saplings as list."""
    try:
        saplings = json.loads(obj.saplings) if isinstance(obj.saplings, str) else (obj.saplings or [])
    except Exception:
        saplings = []
    # Normalize sapling items to objects { name: str, qty: int }
    def _normalize_item(it):
        # If already a dict-like object, try to extract expected fields
        if isinstance(it, dict):
            name = it.get("name") or it.get("species") or it.get("species_name") or None
            qty = it.get("qty") or it.get("quantity") or it.get("quantity_planted") or it.get("quantity_collected") or None
            try:
                qty = int(qty) if qty is not None else 1
            except Exception:
                qty = 1
            return {"name": name or "", "qty": qty}
        # If it's a legacy string like "Bougainvillea: 6", parse it
        if isinstance(it, str):
            import re
            m = re.match(r"^(?P<name>.+?):\s*(?P<qty>\d+)$", it.strip())
            if m:
                return {"name": m.group("name").strip(), "qty": int(m.group("qty"))}
            # fallback: whole string as name, qty 1
            return {"name": it.strip(), "qty": 1}
        # Unknown type -> stringify
        try:
            return {"name": str(it), "qty": 1}
        except Exception:
            return {"name": "", "qty": 1}

    normalized = [_normalize_item(s) for s in saplings]

    return {
        "id": str(obj.id),
        "date_received": obj.date_received,
        "requester_name": obj.requester_name,
        "address": obj.address,
        "saplings": normalized,
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
    obj = sapling_request_crud.create(db, obj_in=request)
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
