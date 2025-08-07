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

class TreeManagementRequestCreate(TreeManagementRequestBase):
    pass

class TreeManagementRequestUpdate(BaseModel):
    request_number: Optional[str] = None
    request_type: Optional[str] = None
    requester_name: Optional[str] = None
    property_address: Optional[str] = None
    status: Optional[str] = None
    request_date: Optional[date] = None
    fee_record_id: Optional[UUID] = None
    inspectors: Optional[List[str]] = None
    trees_and_quantities: Optional[List[str]] = None
    picture_links: Optional[List[str]] = None
    notes: Optional[str] = None

class TreeManagementRequestInDB(TreeManagementRequestBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TreeManagementRequest(TreeManagementRequestInDB):
    pass
