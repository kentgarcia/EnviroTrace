# app/apis/v1/inspection_router.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.apis.deps import get_db
from app.crud import crud_inspection
from app.schemas.inspection_schemas import (
    InspectionReportCreate,
    InspectionReportCreateFrontend,
    InspectionReportUpdate,
    InspectionReportResponse,
    InspectionReportListResponse,
    InspectionRecordFrontend,
    InspectionRecordFrontendListResponse
)

router = APIRouter()

@router.get("/", response_model=InspectionReportListResponse)
def get_inspection_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: str = Query(None),
    type: str = Query(None),
    db: Session = Depends(get_db)
):
    """Get all inspection reports with optional filtering"""
    try:
        if status:
            reports = crud_inspection.get_inspection_reports_by_status(db, status=status, skip=skip, limit=limit)
        elif type:
            reports = crud_inspection.get_inspection_reports_by_type(db, type=type, skip=skip, limit=limit)
        else:
            reports = crud_inspection.get_inspection_reports(db, skip=skip, limit=limit)
        
        total = crud_inspection.get_inspection_reports_count(db)
        
        return InspectionReportListResponse(
            success=True,
            message="Inspection reports retrieved successfully",
            data=reports,
            total=total
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving inspection reports: {str(e)}")

@router.get("/frontend", response_model=InspectionRecordFrontendListResponse)
def get_inspection_reports_frontend(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get inspection reports in frontend format"""
    try:
        db_reports = crud_inspection.get_inspection_reports(db, skip=skip, limit=limit)
        frontend_reports = [InspectionRecordFrontend.from_db_model(report) for report in db_reports]
        total = crud_inspection.get_inspection_reports_count(db)
        
        return InspectionRecordFrontendListResponse(
            success=True,
            message="Inspection reports retrieved successfully",
            data=frontend_reports,
            total=total
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving inspection reports: {str(e)}")

@router.get("/search", response_model=InspectionReportListResponse)
def search_inspection_reports(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Search inspection reports"""
    try:
        reports = crud_inspection.search_inspection_reports(db, query=q, skip=skip, limit=limit)
        total = len(reports)  # For search, we return the count of found items
        
        return InspectionReportListResponse(
            success=True,
            message=f"Found {total} inspection reports matching '{q}'",
            data=reports,
            total=total
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching inspection reports: {str(e)}")

@router.get("/{report_id}", response_model=InspectionReportResponse)
def get_inspection_report(
    report_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific inspection report by ID"""
    try:
        report = crud_inspection.get_inspection_report(db, report_id=report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Inspection report not found")
        
        return InspectionReportResponse(
            success=True,
            message="Inspection report retrieved successfully",
            data=report
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving inspection report: {str(e)}")

@router.get("/report-number/{report_number}", response_model=InspectionReportResponse)
def get_inspection_report_by_number(
    report_number: str,
    db: Session = Depends(get_db)
):
    """Get a specific inspection report by report number"""
    try:
        report = crud_inspection.get_inspection_report_by_number(db, report_number=report_number)
        if not report:
            raise HTTPException(status_code=404, detail="Inspection report not found")
        
        return InspectionReportResponse(
            success=True,
            message="Inspection report retrieved successfully",
            data=report
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving inspection report: {str(e)}")

@router.post("/", response_model=InspectionReportResponse)
def create_inspection_report(
    report_in: InspectionReportCreate,
    db: Session = Depends(get_db)
):
    """Create a new inspection report"""
    try:
        # Check if report number already exists
        existing = crud_inspection.get_inspection_report_by_number(db, report_number=report_in.report_number)
        if existing:
            raise HTTPException(status_code=400, detail="Report number already exists")
        
        report = crud_inspection.create_inspection_report(db, report=report_in)
        
        return InspectionReportResponse(
            success=True,
            message="Inspection report created successfully",
            data=report
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating inspection report: {str(e)}")

@router.post("/frontend", response_model=InspectionReportResponse)
def create_inspection_report_frontend(
    report_in: InspectionReportCreateFrontend,
    db: Session = Depends(get_db)
):
    """Create a new inspection report from frontend format"""
    try:
        # Generate report number if not provided or empty
        if not report_in.reportNo or report_in.reportNo.strip() == "":
            report_in.reportNo = crud_inspection.generate_report_number(db)
        
        # Check if report number already exists
        existing = crud_inspection.get_inspection_report_by_number(db, report_number=report_in.reportNo)
        if existing:
            raise HTTPException(status_code=400, detail="Report number already exists")
        
        # Convert frontend format to database format
        db_report_in = report_in.to_db_create()
        report = crud_inspection.create_inspection_report(db, report=db_report_in)
        
        return InspectionReportResponse(
            success=True,
            message="Inspection report created successfully",
            data=report
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating inspection report: {str(e)}")

@router.put("/{report_id}", response_model=InspectionReportResponse)
def update_inspection_report(
    report_id: str,
    report_in: InspectionReportUpdate,
    db: Session = Depends(get_db)
):
    """Update an inspection report"""
    try:
        report = crud_inspection.get_inspection_report(db, report_id=report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Inspection report not found")
        
        # Check if report number is being changed and if it already exists
        if report_in.report_number and report_in.report_number != report.report_number:
            existing = crud_inspection.get_inspection_report_by_number(db, report_number=report_in.report_number)
            if existing:
                raise HTTPException(status_code=400, detail="Report number already exists")
        
        updated_report = crud_inspection.update_inspection_report(db, report_id=report_id, report_update=report_in)
        
        return InspectionReportResponse(
            success=True,
            message="Inspection report updated successfully",
            data=updated_report
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating inspection report: {str(e)}")

@router.delete("/{report_id}", response_model=InspectionReportResponse)
def delete_inspection_report(
    report_id: str,
    db: Session = Depends(get_db)
):
    """Delete an inspection report"""
    try:
        report = crud_inspection.get_inspection_report(db, report_id=report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Inspection report not found")
        
        deleted_report = crud_inspection.delete_inspection_report(db, report_id=report_id)
        
        return InspectionReportResponse(
            success=True,
            message="Inspection report deleted successfully",
            data=deleted_report
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting inspection report: {str(e)}")

@router.get("/generate/report-number")
def generate_report_number(db: Session = Depends(get_db)):
    """Generate a new unique report number"""
    try:
        new_number = crud_inspection.generate_report_number(db)
        return {
            "success": True,
            "message": "Report number generated successfully",
            "report_number": new_number
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report number: {str(e)}")
