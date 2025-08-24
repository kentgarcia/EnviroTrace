from sqlalchemy import Column, String, DateTime, Text, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func, text
from app.db.database import Base

class ActionWorkflow(Base):
    """Model for tracking environmental action workflows like inspections, maintenance, etc."""
    __tablename__ = "action_workflows"
    __table_args__ = ({"schema": "urban_greening"},)
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    
    # Action details
    action_type = Column(String(50), nullable=False)  # bulk_inspect, schedule_maintenance, etc.
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Scheduling information
    scheduled_date = Column(DateTime(timezone=True), nullable=True)
    estimated_duration = Column(String(50), nullable=True)
    assigned_to = Column(String(255), nullable=True)
    priority = Column(String(20), nullable=False, default='medium')  # low, medium, high, urgent
    
    # Resources and notes
    resources_needed = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Related monitoring requests
    monitoring_request_ids = Column(JSONB, nullable=False)  # Array of monitoring request IDs
    affected_locations = Column(JSONB, nullable=True)  # Array of location data
    
    # Status tracking
    status = Column(String(50), nullable=False, default='scheduled')  # scheduled, in_progress, completed, cancelled
    completion_date = Column(DateTime(timezone=True), nullable=True)
    completion_notes = Column(Text, nullable=True)
    
    # Audit fields
    created_by = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class EnvironmentalReport(Base):
    """Model for storing generated environmental impact reports"""
    __tablename__ = "environmental_reports"
    __table_args__ = ({"schema": "urban_greening"},)
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    
    # Report metadata
    report_type = Column(String(50), nullable=False)  # impact_summary, monitoring_overview, etc.
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Date range covered
    date_range_start = Column(DateTime(timezone=True), nullable=True)
    date_range_end = Column(DateTime(timezone=True), nullable=True)
    
    # Report data
    monitoring_request_ids = Column(JSONB, nullable=False)  # IDs included in report
    report_data = Column(JSONB, nullable=False)  # Aggregated metrics and analysis
    
    # File information
    file_path = Column(String(500), nullable=True)  # Path to generated report file
    file_format = Column(String(20), nullable=False, default='pdf')  # pdf, xlsx, csv
    
    # Status
    generation_status = Column(String(20), nullable=False, default='pending')  # pending, generating, completed, failed
    
    # Audit fields
    generated_by = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
