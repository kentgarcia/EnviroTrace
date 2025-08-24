from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import date
from sqlalchemy.orm import Session
from app.apis.deps import get_db
from app.crud.crud_tree_management import tree_management_request
from app.schemas.tree_management_schemas import (
    TreeManagementRequest, TreeManagementRequestCreate, TreeManagementRequestUpdate
)

router = APIRouter()

@router.get("/", response_model=List[TreeManagementRequest])
def read_tree_management_requests(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    """
    Retrieve tree management requests.
    """
    requests = tree_management_request.get_multi_sync(db, skip=skip, limit=limit)
    return [TreeManagementRequest.from_db_model(req) for req in requests]

@router.get("/by-month", response_model=List[TreeManagementRequest])
def read_tree_management_requests_by_month(
    year: int = Query(..., description="Year, e.g. 2025"),
    month: int = Query(..., ge=1, le=12, description="Month 1-12"),
    db: Session = Depends(get_db)
):
    """Retrieve tree management requests for a specific month/year."""
    try:
        start_date = date(year, month, 1)
        # naive end date: next month minus one day
        if month == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month + 1, 1)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid year/month")
    
    requests = tree_management_request.get_by_date_range(db, start_date=start_date, end_date=end_date)
    return [TreeManagementRequest.from_db_model(req) for req in requests]

@router.post("/", response_model=TreeManagementRequest)
def create_tree_management_request(request_in: TreeManagementRequestCreate, db: Session = Depends(get_db)):
    """
    Create new tree management request.
    """
    import random
    
    # Generate a unique request number in format 2XXXXX if not provided or empty
    if not request_in.request_number or request_in.request_number.strip() == "":
        max_attempts = 100
        for attempt in range(max_attempts):
            # Generate 6-digit number starting with 2 (200000 to 299999)
            request_number = f"2{random.randint(10000, 99999)}"
            
            # Check if this number already exists
            existing = tree_management_request.get_by_request_number(db, request_number=request_number)
            if not existing:
                request_in.request_number = request_number
                break
        else:
            raise HTTPException(status_code=500, detail="Failed to generate unique request number after multiple attempts")
    else:
        # Check if provided request number already exists
        existing = tree_management_request.get_by_request_number(db, request_number=request_in.request_number)
        if existing:
            raise HTTPException(status_code=400, detail="Request number already exists")
    
    created_obj = tree_management_request.create_sync(db=db, obj_in=request_in)
    return TreeManagementRequest.from_db_model(created_obj)

@router.get("/{request_id}", response_model=TreeManagementRequest)
def read_tree_management_request(request_id: str, db: Session = Depends(get_db)):
    """
    Get tree management request by ID.
    """
    request_obj = tree_management_request.get_sync(db, id=request_id)
    if not request_obj:
        raise HTTPException(status_code=404, detail="Tree management request not found")
    return TreeManagementRequest.from_db_model(request_obj)

@router.put("/{request_id}", response_model=TreeManagementRequest)
def update_tree_management_request(request_id: str, request_in: TreeManagementRequestUpdate, db: Session = Depends(get_db)):
    """
    Update tree management request.
    """
    request_obj = tree_management_request.get_sync(db, id=request_id)
    if not request_obj:
        raise HTTPException(status_code=404, detail="Tree management request not found")
    updated_obj = tree_management_request.update_sync(db=db, db_obj=request_obj, obj_in=request_in)
    return TreeManagementRequest.from_db_model(updated_obj)

@router.delete("/{request_id}")
def delete_tree_management_request(request_id: str, db: Session = Depends(get_db)):
    """
    Delete tree management request.
    """
    request_obj = tree_management_request.get_sync(db, id=request_id)
    if not request_obj:
        raise HTTPException(status_code=404, detail="Tree management request not found")
    tree_management_request.remove_sync(db=db, id=request_id)
    return {"message": "Tree management request deleted successfully"}

@router.get("/request-number/{request_number}", response_model=TreeManagementRequest)
def read_tree_management_request_by_number(request_number: str, db: Session = Depends(get_db)):
    """
    Get tree management request by request number.
    """
    request_obj = tree_management_request.get_by_request_number(db, request_number=request_number)
    if not request_obj:
        raise HTTPException(status_code=404, detail="Tree management request not found")
    return TreeManagementRequest.from_db_model(request_obj)

@router.get("/type/{request_type}", response_model=List[TreeManagementRequest])
def read_tree_management_requests_by_type(request_type: str, db: Session = Depends(get_db)):
    """
    Get tree management requests by type.
    """
    requests = tree_management_request.get_by_request_type(db, request_type=request_type)
    return [TreeManagementRequest.from_db_model(req) for req in requests]

@router.get("/status/{status}", response_model=List[TreeManagementRequest])
def read_tree_management_requests_by_status(status: str, db: Session = Depends(get_db)):
    """
    Get tree management requests by status.
    """
    requests = tree_management_request.get_by_status(db, status=status)
    return [TreeManagementRequest.from_db_model(req) for req in requests]

@router.get("/requester/{requester_name}", response_model=List[TreeManagementRequest])
def read_tree_management_requests_by_requester(requester_name: str, db: Session = Depends(get_db)):
    """
    Get tree management requests by requester name.
    """
    requests = tree_management_request.get_by_requester(db, requester_name=requester_name)
    return [TreeManagementRequest.from_db_model(req) for req in requests]

# @router.get("/urgency/{urgency_level}", response_model=List[TreeManagementRequest])
# def read_tree_management_requests_by_urgency(urgency_level: str, db: Session = Depends(get_db)):
#     """
#     Get tree management requests by urgency level.
#     """
#     return tree_management_request.get_by_urgency_level(db, urgency_level=urgency_level)

@router.get("/pending/all", response_model=List[TreeManagementRequest])
def read_pending_tree_management_requests(db: Session = Depends(get_db)):
    """
    Get pending tree management requests.
    """
    requests = tree_management_request.get_pending_requests(db)
    return [TreeManagementRequest.from_db_model(req) for req in requests]

# @router.get("/overdue/all", response_model=List[TreeManagementRequest])
# def read_overdue_tree_management_requests(db: Session = Depends(get_db)):
#     """
#     Get overdue tree management requests.
#     """
#     return tree_management_request.get_overdue_requests(db)
