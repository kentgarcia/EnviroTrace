# app/crud/crud_inspection.py
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.urban_greening_models import InspectionReport
from app.schemas.inspection_schemas import InspectionReportCreate, InspectionReportUpdate
from datetime import date

def get_inspection_reports(db: Session, skip: int = 0, limit: int = 100) -> List[InspectionReport]:
    """Get all inspection reports"""
    return (
        db.query(InspectionReport)
        .order_by(desc(InspectionReport.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_inspection_report(db: Session, report_id: str) -> Optional[InspectionReport]:
    """Get inspection report by ID"""
    return db.query(InspectionReport).filter(InspectionReport.id == report_id).first()

def get_inspection_report_by_number(db: Session, report_number: str) -> Optional[InspectionReport]:
    """Get inspection report by report number"""
    return db.query(InspectionReport).filter(InspectionReport.report_number == report_number).first()

def get_inspection_reports_by_status(
    db: Session, status: str, skip: int = 0, limit: int = 100
) -> List[InspectionReport]:
    """Get inspection reports by status"""
    return (
        db.query(InspectionReport)
        .filter(InspectionReport.status == status)
        .order_by(desc(InspectionReport.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_inspection_reports_by_type(
    db: Session, type: str, skip: int = 0, limit: int = 100
) -> List[InspectionReport]:
    """Get inspection reports by type"""
    return (
        db.query(InspectionReport)
        .filter(InspectionReport.type == type)
        .order_by(desc(InspectionReport.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_inspection_reports_by_inspector(
    db: Session, inspector_name: str, skip: int = 0, limit: int = 100
) -> List[InspectionReport]:
    """Get inspection reports by inspector name"""
    return (
        db.query(InspectionReport)
        .filter(InspectionReport.inspectors.ilike(f"%{inspector_name}%"))
        .order_by(desc(InspectionReport.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_inspection_reports_count(db: Session) -> int:
    """Get total count of inspection reports"""
    return db.query(InspectionReport).count()

def create_inspection_report(db: Session, report: InspectionReportCreate) -> InspectionReport:
    """Create a new inspection report"""
    db_report = InspectionReport(
        report_number=report.report_number,
        inspectors=report.inspectors,
        date=report.date,
        location=report.location,
        type=report.type,
        status=report.status,
        trees=report.trees,
        notes=report.notes,
        pictures=report.pictures,
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def update_inspection_report(
    db: Session, report_id: str, report_update: InspectionReportUpdate
) -> Optional[InspectionReport]:
    """Update an inspection report"""
    db_report = get_inspection_report(db, report_id)
    if not db_report:
        return None
    
    update_data = report_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_report, field, value)
    
    db.commit()
    db.refresh(db_report)
    return db_report

def delete_inspection_report(db: Session, report_id: str) -> Optional[InspectionReport]:
    """Delete an inspection report"""
    db_report = get_inspection_report(db, report_id)
    if not db_report:
        return None
    
    db.delete(db_report)
    db.commit()
    return db_report

def generate_report_number(db: Session) -> str:
    """Generate a unique report number"""
    today = date.today()
    prefix = f"IR-{today.strftime('%Y%m%d')}"
    
    # Get the count of reports created today
    count = (
        db.query(InspectionReport)
        .filter(InspectionReport.report_number.like(f"{prefix}%"))
        .count()
    )
    
    # Generate next number in sequence
    next_num = count + 1
    return f"{prefix}-{next_num:03d}"

def search_inspection_reports(
    db: Session, query: str, skip: int = 0, limit: int = 100
) -> List[InspectionReport]:
    """Search inspection reports by multiple fields"""
    search_term = f"%{query}%"
    return (
        db.query(InspectionReport)
        .filter(
            (InspectionReport.report_number.ilike(search_term)) |
            (InspectionReport.inspectors.ilike(search_term)) |
            (InspectionReport.location.ilike(search_term)) |
            (InspectionReport.notes.ilike(search_term))
        )
        .order_by(desc(InspectionReport.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
