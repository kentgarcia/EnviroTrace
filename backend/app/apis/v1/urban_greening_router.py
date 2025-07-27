# app/apis/v1/urban_greening_router.py
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.apis.deps import get_db, get_current_user
from app.crud.crud_urban_greening import (
    monitoring_request,
    tree_record,
    sapling_record,
    urban_greening_project
)
from app.schemas.urban_greening_schemas import (
    MonitoringRequest,
    MonitoringRequestCreate,
    MonitoringRequestUpdate,
    MonitoringRequestListResponse,
    TreeRecord,
    TreeRecordCreate,
    TreeRecordListResponse,
    SaplingRecord,
    SaplingRecordCreate,
    SaplingRecordListResponse,
    UrbanGreeningProject,
    UrbanGreeningProjectCreate,
    UrbanGreeningProjectListResponse
)
from app.models.auth_models import User

router = APIRouter()

# Monitoring Requests Endpoints
@router.get("/monitoring-requests", response_model=MonitoringRequestListResponse)
async def get_monitoring_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all monitoring requests with filtering."""
    try:
        if status:
            reports = await monitoring_request.get_by_status(
                db=db, status=status, skip=skip, limit=limit
            )
        elif type:
            reports = await monitoring_request.get_by_type(
                db=db, type=type, skip=skip, limit=limit
            )
        else:
            reports = await monitoring_request.get_multi(
                db=db, skip=skip, limit=limit
            )
        total = await monitoring_request.count(db)
        return MonitoringRequestListResponse(reports=reports, total=total)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/monitoring-requests/{request_id}", response_model=MonitoringRequest)
async def get_monitoring_request(
    request_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific monitoring request by ID."""
    try:
        report = await monitoring_request.get(db=db, id=request_id)
        if not report:
            raise HTTPException(status_code=404, detail="Monitoring request not found")
        return report
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/monitoring-requests", response_model=MonitoringRequest, status_code=201)
async def create_monitoring_request(
    request_data: MonitoringRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new monitoring request."""
    try:
        # Note: MonitoringRequest doesn't have a report_number field like InspectionReport
        # so we skip the duplicate check that would be done for InspectionReports
        
        report = await monitoring_request.create(db=db, obj_in=request_data)
        return report
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/monitoring-requests/{request_id}", response_model=MonitoringRequest)
async def update_monitoring_request(
    request_id: str,
    request_data: MonitoringRequestUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a monitoring request."""
    try:
        report = await monitoring_request.get(db=db, id=request_id)
        if not report:
            raise HTTPException(status_code=404, detail="Monitoring request not found")
        
        updated_report = await monitoring_request.update(
            db=db, db_obj=report, obj_in=request_data
        )
        return updated_report
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/monitoring-requests/{request_id}")
async def delete_monitoring_request(
    request_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a monitoring request."""
    try:
        report = await monitoring_request.get(db=db, id=request_id)
        if not report:
            raise HTTPException(status_code=404, detail="Monitoring request not found")
        
        await monitoring_request.remove(db=db, id=request_id)
        return {"message": "Monitoring request deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Tree Records Endpoints
@router.get("/tree-records", response_model=TreeRecordListResponse)
async def get_tree_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all tree records."""
    try:
        records = await tree_record.get_multi(db=db, skip=skip, limit=limit)
        total = await tree_record.count(db)
        return TreeRecordListResponse(records=records, total=total)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tree-records/{record_id}", response_model=TreeRecord)
async def get_tree_record(
    record_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific tree record by ID."""
    try:
        record = await tree_record.get(db=db, id=record_id)
        if not record:
            raise HTTPException(status_code=404, detail="Tree record not found")
        return record
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tree-records", response_model=TreeRecord, status_code=201)
async def create_tree_record(
    record_data: TreeRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new tree record."""
    try:
        record = await tree_record.create(db=db, obj_in=record_data)
        return record
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Sapling Records Endpoints
@router.get("/sapling-records", response_model=SaplingRecordListResponse)
async def get_sapling_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all sapling records."""
    try:
        records = await sapling_record.get_multi(db=db, skip=skip, limit=limit)
        total = await sapling_record.count(db)
        return SaplingRecordListResponse(records=records, total=total)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sapling-records/{record_id}", response_model=SaplingRecord)
async def get_sapling_record(
    record_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific sapling record by ID."""
    try:
        record = await sapling_record.get(db=db, id=record_id)
        if not record:
            raise HTTPException(status_code=404, detail="Sapling record not found")
        return record
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sapling-records", response_model=SaplingRecord, status_code=201)
async def create_sapling_record(
    record_data: SaplingRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new sapling record."""
    try:
        record = await sapling_record.create(db=db, obj_in=record_data)
        return record
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Urban Greening Projects Endpoints
@router.get("/projects", response_model=UrbanGreeningProjectListResponse)
async def get_urban_greening_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all urban greening projects."""
    try:
        projects = await urban_greening_project.get_multi(db=db, skip=skip, limit=limit)
        total = await urban_greening_project.count(db)
        return UrbanGreeningProjectListResponse(projects=projects, total=total)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/projects/{project_id}", response_model=UrbanGreeningProject)
async def get_urban_greening_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific urban greening project by ID."""
    try:
        project = await urban_greening_project.get(db=db, id=project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Urban greening project not found")
        return project
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/projects", response_model=UrbanGreeningProject, status_code=201)
async def create_urban_greening_project(
    project_data: UrbanGreeningProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new urban greening project."""
    try:
        project = await urban_greening_project.create(db=db, obj_in=project_data)
        return project
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
