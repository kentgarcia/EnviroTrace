from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from decimal import Decimal
from uuid import UUID

class TreeManagementRequestBase(BaseModel):
    request_number: str
    request_type: str  # pruning, cutting, violation_complaint
    requester_name: str
    contact_number: Optional[str] = None
    email: Optional[str] = None
    property_address: str
    tree_species: str
    tree_count: int = 1
    tree_location: str
    reason_for_request: str
    urgency_level: str = 'normal'  # low, normal, high, emergency
    status: str = 'filed'  # filed, under_review, approved, rejected, in_progress, completed, payment_pending, for_signature, on_hold
    request_date: date
    scheduled_date: Optional[date] = None
    completion_date: Optional[date] = None
    assigned_inspector: Optional[str] = None
    inspection_notes: Optional[str] = None
    fee_amount: Optional[Decimal] = None
    fee_status: Optional[str] = None  # pending, paid, waived
    permit_number: Optional[str] = None
    attachment_files: Optional[str] = None  # JSON array of file paths

class TreeManagementRequestCreate(TreeManagementRequestBase):
    pass

class TreeManagementRequestUpdate(BaseModel):
    request_number: Optional[str] = None
    request_type: Optional[str] = None
    requester_name: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    property_address: Optional[str] = None
    tree_species: Optional[str] = None
    tree_count: Optional[int] = None
    tree_location: Optional[str] = None
    reason_for_request: Optional[str] = None
    urgency_level: Optional[str] = None
    status: Optional[str] = None
    request_date: Optional[date] = None
    scheduled_date: Optional[date] = None
    completion_date: Optional[date] = None
    assigned_inspector: Optional[str] = None
    inspection_notes: Optional[str] = None
    fee_amount: Optional[Decimal] = None
    fee_status: Optional[str] = None
    permit_number: Optional[str] = None
    attachment_files: Optional[str] = None

class TreeManagementRequestInDB(TreeManagementRequestBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TreeManagementRequest(TreeManagementRequestInDB):
    pass
