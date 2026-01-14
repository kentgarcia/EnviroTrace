from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

# ===== NEW ISO TREE REQUEST SCHEMAS =====

class DropdownOptionBase(BaseModel):
    """Base dropdown option fields"""
    field_name: str  # 'received_through' or 'status'
    option_value: str
    display_order: int = 0
    is_active: bool = True

class DropdownOptionCreate(DropdownOptionBase):
    pass

class DropdownOptionUpdate(BaseModel):
    option_value: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class DropdownOptionInDB(DropdownOptionBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RequirementChecklistItem(BaseModel):
    """Single requirement checklist item"""
    requirement_name: str
    is_checked: bool = False
    date_submitted: Optional[str] = None  # String format: YYYY-MM-DD

class ProcessingStandardsBase(BaseModel):
    """Processing timeframes configuration"""
    request_type: str  # cutting, pruning, ball_out
    receiving_standard_days: int = 3
    inspection_standard_days: int = 7
    requirements_standard_days: int = 10
    clearance_standard_days: int = 5

class ProcessingStandardsCreate(ProcessingStandardsBase):
    pass

class ProcessingStandardsUpdate(BaseModel):
    receiving_standard_days: Optional[int] = None
    inspection_standard_days: Optional[int] = None
    requirements_standard_days: Optional[int] = None
    clearance_standard_days: Optional[int] = None

class ProcessingStandardsInDB(ProcessingStandardsBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TreeRequestBase(BaseModel):
    """Base tree request fields"""
    request_type: str  # cutting, pruning, ball_out
    overall_status: str = 'receiving'

class TreeRequestCreate(BaseModel):
    """Create new tree request"""
    request_number: Optional[str] = None  # Auto-generated if not provided
    request_type: str
    overall_status: str = 'receiving'
    created_by: Optional[UUID] = None  # User ID who created the request
    
    # Receiving phase
    receiving_date_received: Optional[date] = None
    receiving_month: Optional[str] = None
    receiving_received_through: Optional[str] = None
    receiving_date_received_by_dept_head: Optional[date] = None
    receiving_name: Optional[str] = None
    receiving_address: Optional[str] = None
    receiving_contact: Optional[str] = None
    receiving_request_status: Optional[str] = None
    
    # Inspection phase
    inspection_date_received_by_inspectors: Optional[date] = None
    inspection_date_of_inspection: Optional[date] = None
    inspection_month: Optional[str] = None
    inspection_proponent_present: Optional[str] = None
    inspection_date_submitted_to_dept_head: Optional[date] = None
    inspection_date_released_to_inspectors: Optional[date] = None
    inspection_report_control_number: Optional[str] = None
    
    # Requirements phase
    requirements_checklist: Optional[List[RequirementChecklistItem]] = None
    requirements_remarks: Optional[str] = None
    requirements_status: Optional[str] = None
    requirements_date_completion: Optional[date] = None
    
    # Clearance phase
    clearance_date_issued: Optional[date] = None
    clearance_date_of_payment: Optional[date] = None
    clearance_control_number: Optional[str] = None
    clearance_or_number: Optional[str] = None
    clearance_date_received: Optional[date] = None
    clearance_status: Optional[str] = None

class UpdateReceivingPhase(BaseModel):
    """Update receiving phase only"""
    receiving_date_received: Optional[date] = None
    receiving_month: Optional[str] = None
    receiving_received_through: Optional[str] = None
    receiving_date_received_by_dept_head: Optional[date] = None
    receiving_name: Optional[str] = None
    receiving_address: Optional[str] = None
    receiving_contact: Optional[str] = None
    receiving_request_status: Optional[str] = None

class UpdateInspectionPhase(BaseModel):
    """Update inspection phase only"""
    inspection_date_received_by_inspectors: Optional[date] = None
    inspection_date_of_inspection: Optional[date] = None
    inspection_month: Optional[str] = None
    inspection_proponent_present: Optional[str] = None
    inspection_date_submitted_to_dept_head: Optional[date] = None
    inspection_date_released_to_inspectors: Optional[date] = None
    inspection_report_control_number: Optional[str] = None

class UpdateRequirementsPhase(BaseModel):
    """Update requirements phase only"""
    requirements_checklist: Optional[List[RequirementChecklistItem]] = None
    requirements_remarks: Optional[str] = None
    requirements_status: Optional[str] = None
    requirements_date_completion: Optional[date] = None

class UpdateClearancePhase(BaseModel):
    """Update clearance phase only"""
    clearance_date_issued: Optional[date] = None
    clearance_date_of_payment: Optional[date] = None
    clearance_control_number: Optional[str] = None
    clearance_or_number: Optional[str] = None
    clearance_date_received: Optional[date] = None
    clearance_status: Optional[str] = None

class TreeRequestUpdate(BaseModel):
    """Update any tree request fields"""
    request_type: Optional[str] = None
    overall_status: Optional[str] = None
    
    receiving_date_received: Optional[date] = None
    receiving_month: Optional[str] = None
    receiving_received_through: Optional[str] = None
    receiving_date_received_by_dept_head: Optional[date] = None
    receiving_name: Optional[str] = None
    receiving_address: Optional[str] = None
    receiving_contact: Optional[str] = None
    receiving_request_status: Optional[str] = None
    
    inspection_date_received_by_inspectors: Optional[date] = None
    inspection_date_of_inspection: Optional[date] = None
    inspection_month: Optional[str] = None
    inspection_proponent_present: Optional[str] = None
    inspection_date_submitted_to_dept_head: Optional[date] = None
    inspection_date_released_to_inspectors: Optional[date] = None
    inspection_report_control_number: Optional[str] = None
    
    requirements_checklist: Optional[List[RequirementChecklistItem]] = None
    requirements_remarks: Optional[str] = None
    requirements_status: Optional[str] = None
    requirements_date_completion: Optional[date] = None
    
    clearance_date_issued: Optional[date] = None
    clearance_date_of_payment: Optional[date] = None
    clearance_control_number: Optional[str] = None
    clearance_or_number: Optional[str] = None
    clearance_date_received: Optional[date] = None
    clearance_status: Optional[str] = None

class TreeRequestInDB(TreeRequestBase):
    """Tree request from database"""
    id: UUID
    request_number: str
    created_by: Optional[UUID] = None  # User ID who created the request
    editors: Optional[List[UUID]] = None  # List of user IDs who edited the request
    
    receiving_date_received: Optional[date] = None
    receiving_month: Optional[str] = None
    receiving_received_through: Optional[str] = None
    receiving_date_received_by_dept_head: Optional[date] = None
    receiving_name: Optional[str] = None
    receiving_address: Optional[str] = None
    receiving_contact: Optional[str] = None
    receiving_request_status: Optional[str] = None
    
    inspection_date_received_by_inspectors: Optional[date] = None
    inspection_date_of_inspection: Optional[date] = None
    inspection_month: Optional[str] = None
    inspection_proponent_present: Optional[str] = None
    inspection_date_submitted_to_dept_head: Optional[date] = None
    inspection_date_released_to_inspectors: Optional[date] = None
    inspection_report_control_number: Optional[str] = None
    
    requirements_checklist: Optional[List[RequirementChecklistItem]] = None
    requirements_remarks: Optional[str] = None
    requirements_status: Optional[str] = None
    requirements_date_completion: Optional[date] = None
    
    clearance_date_issued: Optional[date] = None
    clearance_date_of_payment: Optional[date] = None
    clearance_control_number: Optional[str] = None
    clearance_or_number: Optional[str] = None
    clearance_date_received: Optional[date] = None
    clearance_status: Optional[str] = None
    
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TreeRequestWithAnalytics(TreeRequestInDB):
    """Tree request with computed analytics"""
    days_in_receiving: int = 0
    days_in_inspection: int = 0
    days_in_requirements: int = 0
    days_in_clearance: int = 0
    total_days: int = 0
    is_delayed: bool = False
    receiving_standard_days: Optional[int] = None
    inspection_standard_days: Optional[int] = None
    requirements_standard_days: Optional[int] = None
    clearance_standard_days: Optional[int] = None

# ===== LEGACY SCHEMAS (for backward compatibility) =====

class NewTreeEntry(BaseModel):
    """New tree entry not yet in inventory"""
    species: Optional[str] = None
    common_name: str
    address: Optional[str] = None
    condition: Optional[str] = None
    notes: Optional[str] = None

class TreeManagementRequestBase(BaseModel):
    request_type: str  # cutting, pruning, violation
    
    # Requester Information
    requester_name: str
    requester_contact: Optional[str] = None
    requester_email: Optional[str] = None
    property_address: str
    barangay: Optional[str] = None
    
    # Request Details
    request_date: date
    reason: Optional[str] = None
    urgency: str = 'normal'  # low, normal, high, emergency
    
    # Status
    status: str = 'filed'  # filed, on_hold, for_signature, payment_pending
    
    # Tree Links
    linked_tree_ids: Optional[List[str]] = None
    new_trees: Optional[List[NewTreeEntry]] = None
    
    # Processing Information
    fee_record_id: Optional[UUID] = None
    
    # Inspection Information
    inspectors: Optional[List[str]] = None
    picture_links: Optional[List[str]] = None
    
    # Notes
    notes: Optional[str] = None

class TreeManagementRequestCreate(BaseModel):
    request_number: Optional[str] = ""  # Optional for auto-generation
    request_type: str  # cutting, pruning, violation
    
    # Requester Information
    requester_name: str
    requester_contact: Optional[str] = None
    requester_email: Optional[str] = None
    property_address: str
    barangay: Optional[str] = None
    
    # Request Details
    request_date: Optional[date] = None  # Auto-set to today if not provided
    reason: Optional[str] = None
    urgency: str = 'normal'  # low, normal, high, emergency
    
    # Status
    status: str = 'filed'  # filed, on_hold, for_signature, payment_pending
    
    # Tree Links
    linked_tree_ids: Optional[List[str]] = None
    new_trees: Optional[List[NewTreeEntry]] = None
    
    # Processing Information
    fee_record_id: Optional[str] = None
    
    # Inspection Information
    inspectors: Optional[List[str]] = None
    picture_links: Optional[List[str]] = None
    
    # Notes
    notes: Optional[str] = None

class TreeManagementRequestUpdate(BaseModel):
    request_number: Optional[str] = None
    request_type: Optional[str] = None
    requester_name: Optional[str] = None
    requester_contact: Optional[str] = None
    requester_email: Optional[str] = None
    property_address: Optional[str] = None
    barangay: Optional[str] = None
    request_date: Optional[date] = None
    reason: Optional[str] = None
    urgency: Optional[str] = None
    status: Optional[str] = None
    linked_tree_ids: Optional[List[str]] = None
    new_trees: Optional[List[NewTreeEntry]] = None
    fee_record_id: Optional[str] = None
    inspectors: Optional[List[str]] = None
    picture_links: Optional[List[str]] = None
    notes: Optional[str] = None

class TreeManagementRequestInDB(TreeManagementRequestBase):
    id: UUID
    request_number: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TreeManagementRequest(TreeManagementRequestInDB):
    @classmethod
    def from_db_model(cls, db_obj):
        """Convert database model to response schema with JSON parsing"""
        import json
        
        data = {
            'id': db_obj.id,
            'request_number': db_obj.request_number,
            'request_type': db_obj.request_type,
            'requester_name': db_obj.requester_name,
            'requester_contact': db_obj.requester_contact,
            'requester_email': db_obj.requester_email,
            'property_address': db_obj.property_address,
            'barangay': db_obj.barangay,
            'request_date': db_obj.request_date,
            'reason': db_obj.reason,
            'urgency': db_obj.urgency,
            'status': db_obj.status,
            'fee_record_id': db_obj.fee_record_id,
            'notes': db_obj.notes,
            'created_at': db_obj.created_at,
            'updated_at': db_obj.updated_at,
        }
        
        # Parse JSON fields back to lists with robust error handling
        def safe_parse_json_list(value):
            """Safely parse JSON to list, handling edge cases"""
            if not value or value.strip() == "":
                return []
            if value.strip() == "{}":  # Handle empty objects
                return []
            try:
                parsed = json.loads(value)
                # Ensure result is a list
                if isinstance(parsed, list):
                    return parsed
                elif isinstance(parsed, dict) and not parsed:  # Empty dict
                    return []
                else:
                    return [parsed] if parsed is not None else []
            except (json.JSONDecodeError, TypeError, ValueError):
                return []
        
        data['linked_tree_ids'] = safe_parse_json_list(db_obj.linked_tree_ids)
        data['new_trees'] = safe_parse_json_list(db_obj.new_trees)
        data['inspectors'] = safe_parse_json_list(db_obj.inspectors)
        data['picture_links'] = safe_parse_json_list(db_obj.picture_links)
            
        return cls(**data)
