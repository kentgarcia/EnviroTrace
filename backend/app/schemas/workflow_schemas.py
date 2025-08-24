from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class ActionWorkflowBase(BaseModel):
    action_type: str = Field(..., description="Type of action (bulk_inspect, schedule_maintenance, etc.)")
    title: str = Field(..., description="Title of the workflow")
    description: Optional[str] = Field(None, description="Detailed description")
    scheduled_date: Optional[datetime] = Field(None, description="When the action is scheduled")
    estimated_duration: Optional[str] = Field(None, description="Estimated time needed")
    assigned_to: Optional[str] = Field(None, description="Person or team assigned")
    priority: str = Field("medium", description="Priority level (low, medium, high, urgent)")
    resources_needed: Optional[str] = Field(None, description="Resources required")
    notes: Optional[str] = Field(None, description="Additional notes")
    monitoring_request_ids: List[str] = Field(..., description="List of monitoring request IDs")
    affected_locations: Optional[List[Dict[str, Any]]] = Field(None, description="Location data")

class ActionWorkflowCreate(ActionWorkflowBase):
    created_by: Optional[str] = Field(None, description="User who created the workflow")

class ActionWorkflowUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    estimated_duration: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = None
    resources_needed: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    completion_notes: Optional[str] = None

class ActionWorkflow(ActionWorkflowBase):
    id: str
    status: str
    completion_date: Optional[datetime] = None
    completion_notes: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EnvironmentalReportBase(BaseModel):
    report_type: str = Field(..., description="Type of report (impact_summary, monitoring_overview, etc.)")
    title: str = Field(..., description="Report title")
    description: Optional[str] = Field(None, description="Report description")
    date_range_start: Optional[datetime] = Field(None, description="Start of date range covered")
    date_range_end: Optional[datetime] = Field(None, description="End of date range covered")
    monitoring_request_ids: List[str] = Field(..., description="Monitoring requests included")
    file_format: str = Field("pdf", description="Output format (pdf, xlsx, csv)")

class EnvironmentalReportCreate(EnvironmentalReportBase):
    generated_by: Optional[str] = Field(None, description="User who requested the report")

class EnvironmentalReport(EnvironmentalReportBase):
    id: str
    report_data: Dict[str, Any]
    file_path: Optional[str] = None
    generation_status: str
    generated_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WorkflowAnalytics(BaseModel):
    total_monitored_locations: int
    active_workflows: int
    workflow_counts_by_type: Dict[str, int]
    status_distribution: Dict[str, int]
    source_type_distribution: Dict[str, int]
    survival_rate: float

class ActionExecutionRequest(BaseModel):
    """Request model for executing actions from the frontend"""
    action_type: str
    request_ids: List[str]
    scheduled_date: Optional[str] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    priority: str = "medium"
    estimated_duration: Optional[str] = None
    resources: Optional[str] = None
    locations: Optional[List[Dict[str, Any]]] = None
    executed_at: str
