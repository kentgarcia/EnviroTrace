from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import date
from sqlalchemy.orm import Session
from app.apis.deps import get_db, get_current_user
from app.models.auth_models import User
from app.crud.crud_tree_management import tree_management_request, tree_request, processing_standards, dropdown_options
from app.schemas.tree_management_schemas import (
    TreeManagementRequest, TreeManagementRequestCreate, TreeManagementRequestUpdate,
    TreeRequestCreate, TreeRequestUpdate, TreeRequestInDB,
    UpdateReceivingPhase, UpdateInspectionPhase, UpdateRequirementsPhase, UpdateClearancePhase, UpdateDENRPhase,
    ProcessingStandardsCreate, ProcessingStandardsUpdate, ProcessingStandardsInDB,
    DropdownOptionCreate, DropdownOptionUpdate, DropdownOptionInDB
)

router = APIRouter()

@router.get("/stats")
def get_tree_management_stats(db: Session = Depends(get_db)):
    """
    Get statistics for tree management requests.
    Returns counts by status, total trees affected, and fees collected.
    """
    import json
    from sqlalchemy import func
    from app.models.urban_greening_models import TreeManagementRequest as TreeManagementRequestModel, FeeRecord
    
    # Get all requests
    all_requests = db.query(TreeManagementRequestModel).all()
    
    # Count by status
    status_counts = db.query(
        TreeManagementRequestModel.status,
        func.count(TreeManagementRequestModel.id)
    ).group_by(TreeManagementRequestModel.status).all()
    
    by_status = {status: count for status, count in status_counts}
    
    # Count by type
    type_counts = db.query(
        TreeManagementRequestModel.request_type,
        func.count(TreeManagementRequestModel.id)
    ).group_by(TreeManagementRequestModel.request_type).all()
    
    by_type = [{
        "type": req_type,
        "count": count
    } for req_type, count in type_counts]
    
    # Count total trees affected (linked_tree_ids + new_trees)
    trees_affected = 0
    for req in all_requests:
        # Count linked trees from inventory
        if req.linked_tree_ids:
            try:
                linked_ids = json.loads(req.linked_tree_ids) if isinstance(req.linked_tree_ids, str) else req.linked_tree_ids
                if isinstance(linked_ids, list):
                    trees_affected += len(linked_ids)
            except (json.JSONDecodeError, TypeError):
                pass
        
        # Count new trees not in inventory
        if req.new_trees:
            try:
                new_tree_list = json.loads(req.new_trees) if isinstance(req.new_trees, str) else req.new_trees
                if isinstance(new_tree_list, list):
                    trees_affected += len(new_tree_list)
            except (json.JSONDecodeError, TypeError):
                pass
    
    # Calculate fees collected (only paid fees)
    # Fee records with type cutting_permit, pruning_permit, or violation_fine
    fees_collected = 0
    fee_records = db.query(FeeRecord).filter(
        FeeRecord.status == "paid",
        FeeRecord.type.in_(["cutting_permit", "pruning_permit", "violation_fine"])
    ).all()
    
    for fee in fee_records:
        if fee.amount:
            fees_collected += float(fee.amount)
    
    return {
        "total_requests": len(all_requests),
        "filed": by_status.get("filed", 0),
        "on_hold": by_status.get("on_hold", 0),
        "for_signature": by_status.get("for_signature", 0),
        "payment_pending": by_status.get("payment_pending", 0),
        "by_type": by_type,
        "by_status": [
            {"status": status, "count": count}
            for status, count in by_status.items()
        ],
        "trees_affected": trees_affected,
        "fees_collected": fees_collected,
    }

@router.get("", response_model=List[TreeManagementRequest])
def read_tree_management_requests(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    year: int = Query(None, description="Filter by year (extracted from request_date)"),
    status: str = Query(None, description="Filter by status"),
    type: str = Query(None, description="Filter by request type"),
    search: str = Query(None, description="Search in requester name, address, or request number")
):
    """
    Retrieve tree management requests with optional filters.
    """
    # Start with base query
    if year:
        from datetime import date as dt_date
        start_date = dt_date(year, 1, 1)
        end_date = dt_date(year, 12, 31)
        requests = tree_management_request.get_by_date_range(db, start_date=start_date, end_date=end_date)
    else:
        requests = tree_management_request.get_multi_sync(db, skip=skip, limit=limit)
    
    # Apply filters
    if status:
        requests = [r for r in requests if r.status == status]
    if type:
        requests = [r for r in requests if r.request_type == type]
    if search:
        search_lower = search.lower()
        requests = [
            r for r in requests
            if search_lower in (r.request_number or "").lower()
            or search_lower in (r.requester_name or "").lower()
            or search_lower in (r.property_address or "").lower()
        ]
    
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

@router.post("", response_model=TreeManagementRequest)
def create_tree_management_request(request_in: TreeManagementRequestCreate, db: Session = Depends(get_db)):
    """
    Create new tree management request.
    Request number will be auto-generated in TR{YEAR}-{sequential} format.
    """
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

# Dedicated endpoint for monitoring request related data
@router.get("/by-monitoring-request/{monitoring_request_id}", response_model=List[TreeManagementRequest])
def get_tree_management_by_monitoring_request(
    monitoring_request_id: str,
    db: Session = Depends(get_db)
):
    """Get all tree management requests linked to a specific monitoring request"""
    requests = tree_management_request.get_by_monitoring_request(db, monitoring_request_id=monitoring_request_id)
    return [TreeManagementRequest.from_db_model(req) for req in requests]

# @router.get("/overdue/all", response_model=List[TreeManagementRequest])
# def read_overdue_tree_management_requests(db: Session = Depends(get_db)):
#     """
#     Get overdue tree management requests.
#     """
#     return tree_management_request.get_overdue_requests(db)


# ===== NEW ISO TREE REQUEST ENDPOINTS =====

@router.post("/v2/requests", response_model=Dict[str, Any])
def create_tree_request(
    request_in: TreeRequestCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new ISO-compliant tree request with all 4 phases"""
    created_obj = tree_request.create_sync(db=db, obj_in=request_in, current_user_id=str(current_user.id))
    return tree_request.get_with_analytics(db, str(created_obj.id))

@router.get("/v2/requests", response_model=List[Dict[str, Any]])
def read_tree_requests(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None, description="Filter by overall status"),
    request_type: Optional[str] = Query(None, description="Filter by request type"),
    year: Optional[int] = Query(None, description="Filter by year"),
    is_archived: bool = Query(False, description="Filter by archived status")
):
    """Get all tree requests with analytics"""
    from sqlalchemy import extract
    from app.models.urban_greening_models import TreeRequest
    
    query = db.query(tree_request.model)
    
    # Filter by archived status
    query = query.filter(TreeRequest.is_archived == is_archived)
    
    if year:
        query = query.filter(extract('year', TreeRequest.created_at) == year)
    if status:
        query = query.filter(TreeRequest.overall_status == status)
    if request_type:
        query = query.filter(TreeRequest.request_type == request_type)
    
    requests = query.offset(skip).limit(limit).all()
    
    return [tree_request.get_with_analytics(db, str(req.id)) for req in requests]

@router.get("/v2/requests/{request_id}", response_model=Dict[str, Any])
def read_tree_request(request_id: str, db: Session = Depends(get_db)):
    """Get tree request by ID with analytics"""
    result = tree_request.get_with_analytics(db, request_id)
    if not result:
        raise HTTPException(status_code=404, detail="Tree request not found")
    return result

@router.put("/v2/requests/{request_id}", response_model=Dict[str, Any])
def update_tree_request(
    request_id: str, 
    request_in: TreeRequestUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update tree request"""
    from app.models.urban_greening_models import TreeRequest
    request_obj = db.query(TreeRequest).filter(TreeRequest.id == request_id).first()
    if not request_obj:
        raise HTTPException(status_code=404, detail="Tree request not found")
    
    updated_obj = tree_request.update_sync(
        db=db, 
        db_obj=request_obj, 
        obj_in=request_in,
        current_user_id=str(current_user.id)
    )
    return tree_request.get_with_analytics(db, str(updated_obj.id))

@router.delete("/v2/requests/{request_id}")
def delete_tree_request(request_id: str, db: Session = Depends(get_db)):
    """Delete tree request"""
    from app.models.urban_greening_models import TreeRequest
    request_obj = db.query(TreeRequest).filter(TreeRequest.id == request_id).first()
    if not request_obj:
        raise HTTPException(status_code=404, detail="Tree request not found")
    
    db.delete(request_obj)
    db.commit()
    return {"message": "Tree request deleted successfully"}

# Phase-specific update endpoints
@router.patch("/v2/requests/{request_id}/receiving", response_model=Dict[str, Any])
def update_receiving_phase(request_id: str, phase_data: UpdateReceivingPhase, db: Session = Depends(get_db)):
    """Update receiving phase of a tree request"""
    updated_obj = tree_request.update_receiving_phase(db, request_id=request_id, phase_data=phase_data)
    if not updated_obj:
        raise HTTPException(status_code=404, detail="Tree request not found")
    return tree_request.get_with_analytics(db, str(updated_obj.id))

@router.patch("/v2/requests/{request_id}/inspection", response_model=Dict[str, Any])
def update_inspection_phase(request_id: str, phase_data: UpdateInspectionPhase, db: Session = Depends(get_db)):
    """Update inspection phase of a tree request"""
    updated_obj = tree_request.update_inspection_phase(db, request_id=request_id, phase_data=phase_data)
    if not updated_obj:
        raise HTTPException(status_code=404, detail="Tree request not found")
    return tree_request.get_with_analytics(db, str(updated_obj.id))

@router.patch("/v2/requests/{request_id}/requirements", response_model=Dict[str, Any])
def update_requirements_phase(request_id: str, phase_data: UpdateRequirementsPhase, db: Session = Depends(get_db)):
    """Update requirements phase of a tree request"""
    updated_obj = tree_request.update_requirements_phase(db, request_id=request_id, phase_data=phase_data)
    if not updated_obj:
        raise HTTPException(status_code=404, detail="Tree request not found")
    return tree_request.get_with_analytics(db, str(updated_obj.id))

@router.patch("/v2/requests/{request_id}/clearance", response_model=Dict[str, Any])
def update_clearance_phase(request_id: str, phase_data: UpdateClearancePhase, db: Session = Depends(get_db)):
    """Update clearance phase of a tree request"""
    updated_obj = tree_request.update_clearance_phase(db, request_id=request_id, phase_data=phase_data)
    if not updated_obj:
        raise HTTPException(status_code=404, detail="Tree request not found")
    return tree_request.get_with_analytics(db, str(updated_obj.id))

@router.patch("/v2/requests/{request_id}/denr", response_model=Dict[str, Any])
def update_denr_phase(request_id: str, phase_data: UpdateDENRPhase, db: Session = Depends(get_db)):
    """Update DENR phase of a tree request"""
    updated_obj = tree_request.update_denr_phase(db, request_id=request_id, phase_data=phase_data)
    if not updated_obj:
        raise HTTPException(status_code=404, detail="Tree request not found")
    return tree_request.get_with_analytics(db, str(updated_obj.id))

# Analytics endpoints
@router.get("/v2/analytics/delays", response_model=List[Dict[str, Any]])
def get_delayed_requests(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get all delayed requests"""
    return tree_request.get_delayed_requests(db, skip=skip, limit=limit)

@router.get("/v2/analytics/summary", response_model=Dict[str, Any])
def get_analytics_summary(db: Session = Depends(get_db)):
    """Get summary analytics for dashboard"""
    return tree_request.get_analytics_summary(db)

# Processing standards endpoints
@router.get("/v2/processing-standards", response_model=List[ProcessingStandardsInDB])
def get_all_processing_standards(db: Session = Depends(get_db)):
    """Get all processing standards"""
    return processing_standards.get_all_standards(db)

@router.get("/v2/processing-standards/{request_type}", response_model=ProcessingStandardsInDB)
def get_processing_standards_by_type(request_type: str, db: Session = Depends(get_db)):
    """Get processing standards for a specific request type"""
    standards = processing_standards.get_by_request_type(db, request_type=request_type)
    if not standards:
        raise HTTPException(status_code=404, detail="Processing standards not found for this request type")
    return standards

@router.put("/v2/processing-standards/{request_type}", response_model=ProcessingStandardsInDB)
def update_processing_standards(
    request_type: str,
    standards_in: ProcessingStandardsUpdate,
    db: Session = Depends(get_db)
):
    """Update processing standards for a specific request type"""
    # Check if exists
    existing = processing_standards.get_by_request_type(db, request_type=request_type)
    if not existing:
        # Create
        create_data = ProcessingStandardsCreate(
            request_type=request_type,
            **standards_in.model_dump(exclude_unset=True)
        )
        # Apply default values if fields are missing in update/create payload
        if create_data.receiving_standard_days is None: create_data.receiving_standard_days = 3
        if create_data.inspection_standard_days is None: create_data.inspection_standard_days = 7
        if create_data.requirements_standard_days is None: create_data.requirements_standard_days = 10
        if create_data.clearance_standard_days is None: create_data.clearance_standard_days = 5
        
        return processing_standards.create_sync(db, obj_in=create_data)
        
    updated_standards = processing_standards.update_standards(db, request_type=request_type, obj_in=standards_in)
    return updated_standards

@router.delete("/v2/processing-standards/{request_type}")
def delete_processing_standards(request_type: str, db: Session = Depends(get_db)):
    """Delete processing standards for a specific request type"""
    success = processing_standards.remove_by_request_type(db, request_type=request_type)
    if not success:
        raise HTTPException(status_code=404, detail="Processing standards not found")
    return {"message": "Processing standards deleted successfully"}


# ===== DROPDOWN OPTIONS ENDPOINTS =====

@router.get("/v2/dropdown-options", response_model=List[DropdownOptionInDB])
def get_all_dropdown_options(
    field_name: Optional[str] = None,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all dropdown options, optionally filtered by field name"""
    if field_name:
        return dropdown_options.get_by_field(db, field_name=field_name, active_only=active_only)
    return dropdown_options.get_multi(db)

@router.post("/v2/dropdown-options", response_model=DropdownOptionInDB)
def create_dropdown_option(option_in: DropdownOptionCreate, db: Session = Depends(get_db)):
    """Create a new dropdown option"""
    return dropdown_options.create_option(db, obj_in=option_in)

@router.put("/v2/dropdown-options/{option_id}", response_model=DropdownOptionInDB)
def update_dropdown_option(
    option_id: str,
    option_in: DropdownOptionUpdate,
    db: Session = Depends(get_db)
):
    """Update a dropdown option"""
    updated_option = dropdown_options.update_option(db, id=option_id, obj_in=option_in)
    if not updated_option:
        raise HTTPException(status_code=404, detail="Dropdown option not found")
    return updated_option

@router.delete("/v2/dropdown-options/{option_id}")
def delete_dropdown_option(option_id: str, db: Session = Depends(get_db)):
    """Delete (soft delete) a dropdown option"""
    success = dropdown_options.delete_option(db, id=option_id)
    if not success:
        raise HTTPException(status_code=404, detail="Dropdown option not found")
    return {"message": "Dropdown option deleted successfully"}
