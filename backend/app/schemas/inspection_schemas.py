# app/schemas/inspection_schemas.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import date as Date, datetime
from uuid import UUID

# Tree item schema for frontend compatibility
class TreeItem(BaseModel):
    name: str
    quantity: int

# Base schema for inspection reports
class InspectionReportBase(BaseModel):
    report_number: str = Field(..., description="Unique report number")
    date: Date = Field(..., description="Date of inspection")
    location: str = Field(..., description="Location of inspection")
    type: str = Field(..., description="Type of inspection: pruning, cutting, ballout, violation/complaint")
    status: str = Field(..., description="Status: pending, in-progress, completed, rejected")
    inspectors: Optional[str] = Field(None, description="JSON string of inspector names")
    trees: Optional[str] = Field(None, description="JSON string of tree information")
    notes: Optional[str] = Field(None, description="Inspection notes")
    pictures: Optional[str] = Field(None, description="JSON string of picture file paths")

# Schema for creating inspection reports (backend format with JSON strings)
class InspectionReportCreate(BaseModel):
    report_number: str = Field(..., description="Unique report number")
    date: Date = Field(..., description="Date of inspection")
    location: str = Field(..., description="Location of inspection")
    type: str = Field(..., description="Type of inspection: pruning, cutting, ballout, violation/complaint")
    status: str = Field(..., description="Status: pending, in-progress, completed, rejected")
    inspectors: Optional[str] = Field(None, description="JSON string of inspector names")
    trees: Optional[str] = Field(None, description="JSON string of tree information")
    notes: Optional[str] = Field(None, description="Inspection notes")
    pictures: Optional[str] = Field(None, description="JSON string of picture file paths")

# Schema for creating inspection reports from frontend (accepts arrays/objects)
class InspectionReportCreateFrontend(BaseModel):
    reportNo: str = Field(..., description="Unique report number")
    date: str = Field(..., description="Date of inspection in ISO format")
    location: str = Field(..., description="Location of inspection")
    type: str = Field(..., description="Type of inspection: pruning, cutting, ballout, violation/complaint")
    status: str = Field(..., description="Status: pending, in-progress, completed, rejected")
    inspectors: List[str] = Field(default_factory=list, description="List of inspector names")
    trees: List[TreeItem] = Field(default_factory=list, description="List of tree information")
    notes: str = Field(default="", description="Inspection notes")
    pictures: List[str] = Field(default_factory=list, description="List of picture file paths")
    followUp: str = Field(default="", description="Follow up information")
    
    def to_db_create(self) -> InspectionReportCreate:
        import json
        from datetime import datetime
        
        # Parse the date string
        try:
            parsed_date = datetime.fromisoformat(self.date.replace('Z', '+00:00')).date()
        except (ValueError, AttributeError):
            # Fallback to current date if parsing fails
            from datetime import date
            parsed_date = date.today()
        
        # Convert trees to JSON-serializable format
        trees_json = []
        for tree in self.trees:
            if hasattr(tree, 'name') and hasattr(tree, 'quantity'):
                trees_json.append({'name': tree.name, 'quantity': tree.quantity})
            elif isinstance(tree, dict):
                trees_json.append(tree)
            else:
                # Handle string format or other formats
                trees_json.append(str(tree))
        
        return InspectionReportCreate(
            report_number=self.reportNo,
            date=parsed_date,
            location=self.location,
            type=self.type,
            status=self.status,
            inspectors=json.dumps(self.inspectors),
            trees=json.dumps(trees_json),
            notes=self.notes,
            pictures=json.dumps(self.pictures)
        )

# Schema for updating inspection reports
class InspectionReportUpdate(BaseModel):
    report_number: Optional[str] = None
    date: Optional[Date] = None
    location: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    inspectors: Optional[str] = None
    trees: Optional[str] = None
    notes: Optional[str] = None
    pictures: Optional[str] = None
    findings: Optional[str] = None
    recommendations: Optional[str] = None
    follow_up_required: Optional[bool] = None

# Schema for reading inspection reports (includes database fields)
class InspectionReport(InspectionReportBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    created_at: datetime
    updated_at: datetime

# Tree item schema for frontend compatibility
class TreeItem(BaseModel):
    name: str
    quantity: int

# Extended schema for frontend compatibility (includes fields not in DB)
class InspectionRecordFrontend(BaseModel):
    id: Optional[UUID] = None
    reportNo: str
    inspectors: List[str]
    date: str  # Frontend uses string format
    location: str
    type: str
    status: str
    followUp: str
    trees: List[TreeItem] = []
    notes: str = ""
    pictures: List[str] = []  # File paths or URLs
    
    # Mapping between frontend and backend fields
    @classmethod
    def from_db_model(cls, db_model):
        import json
        
        # Parse JSON fields safely
        inspectors = []
        trees = []
        pictures = []
        
        try:
            if db_model.inspectors:
                inspectors = json.loads(db_model.inspectors)
        except (json.JSONDecodeError, TypeError):
            inspectors = []
            
        try:
            if db_model.trees:
                trees_data = json.loads(db_model.trees)
                # Convert back to TreeItem-like objects
                trees = []
                for tree in trees_data:
                    if isinstance(tree, dict) and 'name' in tree:
                        trees.append({
                            'name': tree.get('name', ''),
                            'quantity': tree.get('quantity', 1)
                        })
                    elif isinstance(tree, str):
                        # Handle string format "TreeName (quantity)"
                        import re
                        match = re.match(r'(.+?)\s*\((\d+)\)', tree)
                        if match:
                            trees.append({
                                'name': match.group(1).strip(),
                                'quantity': int(match.group(2))
                            })
                        else:
                            trees.append({'name': tree, 'quantity': 1})
        except (json.JSONDecodeError, TypeError):
            trees = []
            
        try:
            if db_model.pictures:
                pictures = json.loads(db_model.pictures)
        except (json.JSONDecodeError, TypeError):
            pictures = []
        
        return cls(
            id=str(db_model.id),
            reportNo=db_model.report_number,
            inspectors=inspectors,
            date=db_model.date.isoformat(),
            location=db_model.location,
            type=db_model.type,
            status=db_model.status,
            followUp="",  # Not stored separately anymore
            trees=trees,
            notes=db_model.notes or "",
            pictures=pictures
        )
    
    def to_db_create(self) -> InspectionReportCreate:
        import json
        
        # Convert trees to JSON-serializable format
        trees_json = []
        for tree in self.trees:
            if hasattr(tree, 'name') and hasattr(tree, 'quantity'):
                trees_json.append({'name': tree.name, 'quantity': tree.quantity})
            elif isinstance(tree, dict):
                trees_json.append(tree)
            else:
                # Handle string format or other formats
                trees_json.append(str(tree))
        
        return InspectionReportCreate(
            report_number=self.reportNo,
            date=Date.fromisoformat(self.date),
            location=self.location,
            type=self.type,
            status=self.status,
            inspectors=json.dumps(self.inspectors),
            trees=json.dumps(trees_json),
            notes=self.notes,
            pictures=json.dumps(self.pictures)
        )

# Response schemas
class InspectionReportResponse(BaseModel):
    success: bool
    message: str
    data: Optional[InspectionReport] = None

class InspectionReportListResponse(BaseModel):
    success: bool
    message: str
    data: List[InspectionReport]
    total: int

class InspectionRecordFrontendListResponse(BaseModel):
    success: bool
    message: str
    data: List[InspectionRecordFrontend]
    total: int
