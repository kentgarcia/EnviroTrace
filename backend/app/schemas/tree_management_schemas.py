from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List
from uuid import UUID

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
