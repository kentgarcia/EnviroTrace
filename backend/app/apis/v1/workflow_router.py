from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
import json

from app.db.database import get_db
from app.models.workflow_models import ActionWorkflow, EnvironmentalReport
from app.models.monitoring_request_models import MonitoringRequest
from app.schemas.workflow_schemas import (
    ActionWorkflowCreate,
    ActionWorkflowUpdate,
    ActionWorkflow as ActionWorkflowSchema,
    EnvironmentalReportCreate,
    EnvironmentalReport as EnvironmentalReportSchema,
    WorkflowAnalytics
)

router = APIRouter(prefix="/workflows", tags=["Environmental Workflows"])

@router.post("/actions", response_model=ActionWorkflowSchema)
def create_action_workflow(
    workflow_data: ActionWorkflowCreate, 
    db: Session = Depends(get_db)
):
    """Create a new action workflow for environmental management"""
    
    # Validate monitoring request IDs exist
    request_ids = workflow_data.monitoring_request_ids
    existing_requests = db.query(MonitoringRequest).filter(
        MonitoringRequest.id.in_(request_ids)
    ).all()
    
    if len(existing_requests) != len(request_ids):
        raise HTTPException(
            status_code=400, 
            detail="Some monitoring request IDs are invalid"
        )
    
    # Create workflow
    db_workflow = ActionWorkflow(
        action_type=workflow_data.action_type,
        title=workflow_data.title,
        description=workflow_data.description,
        scheduled_date=workflow_data.scheduled_date,
        estimated_duration=workflow_data.estimated_duration,
        assigned_to=workflow_data.assigned_to,
        priority=workflow_data.priority,
        resources_needed=workflow_data.resources_needed,
        notes=workflow_data.notes,
        monitoring_request_ids=request_ids,
        affected_locations=workflow_data.affected_locations,
        created_by=workflow_data.created_by
    )
    
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    
    return db_workflow

@router.get("/actions", response_model=List[ActionWorkflowSchema])
def list_action_workflows(
    status: Optional[str] = None,
    action_type: Optional[str] = None,
    assigned_to: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List action workflows with optional filtering"""
    
    query = db.query(ActionWorkflow)
    
    if status:
        query = query.filter(ActionWorkflow.status == status)
    if action_type:
        query = query.filter(ActionWorkflow.action_type == action_type)
    if assigned_to:
        query = query.filter(ActionWorkflow.assigned_to.ilike(f"%{assigned_to}%"))
    
    workflows = query.offset(skip).limit(limit).all()
    return workflows

@router.get("/actions/{workflow_id}", response_model=ActionWorkflowSchema)
def get_action_workflow(workflow_id: str, db: Session = Depends(get_db)):
    """Get a specific action workflow"""
    
    workflow = db.query(ActionWorkflow).filter(
        ActionWorkflow.id == workflow_id
    ).first()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return workflow

@router.put("/actions/{workflow_id}", response_model=ActionWorkflowSchema)
def update_action_workflow(
    workflow_id: str, 
    workflow_data: ActionWorkflowUpdate, 
    db: Session = Depends(get_db)
):
    """Update an action workflow"""
    
    workflow = db.query(ActionWorkflow).filter(
        ActionWorkflow.id == workflow_id
    ).first()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Update fields
    update_data = workflow_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(workflow, field, value)
    
    workflow.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(workflow)
    
    return workflow

@router.post("/actions/{workflow_id}/complete")
def complete_action_workflow(
    workflow_id: str, 
    completion_notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Mark an action workflow as completed"""
    
    workflow = db.query(ActionWorkflow).filter(
        ActionWorkflow.id == workflow_id
    ).first()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    workflow.status = "completed"
    workflow.completion_date = datetime.utcnow()
    workflow.completion_notes = completion_notes
    workflow.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Workflow marked as completed"}

@router.post("/reports/generate", response_model=EnvironmentalReportSchema)
def generate_environmental_report(
    report_data: EnvironmentalReportCreate, 
    db: Session = Depends(get_db)
):
    """Generate an environmental impact report"""
    
    # Validate monitoring request IDs
    request_ids = report_data.monitoring_request_ids
    monitoring_requests = db.query(MonitoringRequest).filter(
        MonitoringRequest.id.in_(request_ids)
    ).all()
    
    if len(monitoring_requests) == 0:
        raise HTTPException(
            status_code=400, 
            detail="No valid monitoring requests found"
        )
    
    # Calculate analytics for the report
    total_requests = len(monitoring_requests)
    living_count = len([r for r in monitoring_requests if r.status and r.status.lower() == 'living'])
    dead_count = len([r for r in monitoring_requests if r.status and r.status.lower() == 'dead'])
    untracked_count = len([r for r in monitoring_requests if r.status and r.status.lower() == 'untracked'])
    replaced_count = len([r for r in monitoring_requests if r.status and r.status.lower() == 'replaced'])
    
    survival_rate = (living_count / total_requests * 100) if total_requests > 0 else 0
    
    # Group by source type
    urban_greening_count = len([r for r in monitoring_requests if r.source_type == 'urban_greening'])
    tree_management_count = len([r for r in monitoring_requests if r.source_type == 'tree_management'])
    
    # Compile report data
    compiled_report_data = {
        "summary": {
            "total_monitored": total_requests,
            "living_count": living_count,
            "dead_count": dead_count,
            "untracked_count": untracked_count,
            "replaced_count": replaced_count,
            "survival_rate": round(survival_rate, 2),
            "urban_greening_count": urban_greening_count,
            "tree_management_count": tree_management_count
        },
        "details": [
            {
                "id": req.id,
                "title": req.title,
                "status": req.status,
                "location": req.location,
                "address": req.address,
                "source_type": req.source_type,
                "date": req.date.isoformat() if req.date else None
            }
            for req in monitoring_requests
        ],
        "generated_at": datetime.utcnow().isoformat()
    }
    
    # Create report record
    db_report = EnvironmentalReport(
        report_type=report_data.report_type,
        title=report_data.title,
        description=report_data.description,
        date_range_start=report_data.date_range_start,
        date_range_end=report_data.date_range_end,
        monitoring_request_ids=request_ids,
        report_data=compiled_report_data,
        file_format=report_data.file_format,
        generation_status="completed",
        generated_by=report_data.generated_by
    )
    
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    return db_report

@router.get("/analytics", response_model=WorkflowAnalytics)
def get_workflow_analytics(db: Session = Depends(get_db)):
    """Get analytics for workflows and environmental impact"""
    
    # Count active workflows by type
    workflows = db.query(ActionWorkflow).filter(
        ActionWorkflow.status.in_(["scheduled", "in_progress"])
    ).all()
    
    workflow_counts = {}
    for workflow in workflows:
        action_type = workflow.action_type
        workflow_counts[action_type] = workflow_counts.get(action_type, 0) + 1
    
    # Get monitoring request analytics
    all_requests = db.query(MonitoringRequest).all()
    total_monitored = len(all_requests)
    
    status_counts = {}
    source_counts = {}
    
    for request in all_requests:
        # Count by status
        status = request.status or "unknown"
        status_counts[status] = status_counts.get(status, 0) + 1
        
        # Count by source type
        source = request.source_type or "unknown"
        source_counts[source] = source_counts.get(source, 0) + 1
    
    return WorkflowAnalytics(
        total_monitored_locations=total_monitored,
        active_workflows=len(workflows),
        workflow_counts_by_type=workflow_counts,
        status_distribution=status_counts,
        source_type_distribution=source_counts,
        survival_rate=round(
            (status_counts.get("living", 0) / total_monitored * 100) if total_monitored > 0 else 0, 
            2
        )
    )
