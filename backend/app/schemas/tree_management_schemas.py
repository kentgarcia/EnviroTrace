from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List
from uuid import UUID

class TreeManagementRequestBase(BaseModel):
    request_number: str
    request_type: str  # pruning, cutting, violation_complaint
    
    # Requester Information (simplified)
    requester_name: str
    property_address: str
    
    # Status (limited options)
    status: str = 'filed'  # filed, on_hold, for_signature, payment_pending
    request_date: date
    
    # Processing Information (connected to Fee Records)
    fee_record_id: Optional[UUID] = None
    
    # Inspection Information (inline instead of separate reports)
    inspectors: Optional[List[str]] = None  # List of inspector names
    trees_and_quantities: Optional[List[str]] = None  # List of "Tree Type: Quantity" entries
    picture_links: Optional[List[str]] = None  # List of picture URLs for future bucket integration
    
    # Optional fields
    notes: Optional[str] = None  # General notes
    
    # Link to Monitoring Request
    monitoring_request_id: Optional[str] = None

class TreeManagementRequestCreate(BaseModel):
    request_number: Optional[str] = ""  # Optional for auto-generation
    request_type: str  # pruning, cutting, violation_complaint
    
    # Requester Information (simplified)
    requester_name: str
    property_address: str
    
    # Status (limited options)
    status: str = 'filed'  # filed, on_hold, for_signature, payment_pending
    request_date: date
    
    # Processing Information (connected to Fee Records)
    fee_record_id: Optional[UUID] = None
    
    # Inspection Information (inline instead of separate reports)
    inspectors: List[str] = []  # List of inspector names
    trees_and_quantities: List[str] = []  # List of "Tree Type: Quantity" entries
    picture_links: List[str] = []  # List of picture URLs for future bucket integration
    
    # Optional fields
    notes: Optional[str] = None  # General notes
    
    # Link to Monitoring Request
    monitoring_request_id: Optional[str] = None

class TreeManagementRequestUpdate(BaseModel):
    request_number: Optional[str] = None
    request_type: Optional[str] = None
    requester_name: Optional[str] = None
    property_address: Optional[str] = None
    status: Optional[str] = None
    request_date: Optional[date] = None
    fee_record_id: Optional[UUID] = None
    inspectors: Optional[List[str]] = []
    trees_and_quantities: Optional[List[str]] = []
    picture_links: Optional[List[str]] = []
    notes: Optional[str] = None
    monitoring_request_id: Optional[str] = None

class TreeManagementRequestInDB(TreeManagementRequestBase):
    id: UUID
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
            'property_address': db_obj.property_address,
            'status': db_obj.status,
            'request_date': db_obj.request_date,
            'fee_record_id': db_obj.fee_record_id,
            'notes': db_obj.notes,
            'monitoring_request_id': db_obj.monitoring_request_id,
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
        
        data['inspectors'] = safe_parse_json_list(db_obj.inspectors)
        data['trees_and_quantities'] = safe_parse_json_list(db_obj.trees_and_quantities)
        data['picture_links'] = safe_parse_json_list(db_obj.picture_links)
            
        return cls(**data)
