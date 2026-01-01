from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
import json

from app.apis.deps import get_db, get_current_user
from app.models.auth_models import User
from app.crud.crud_urban_greening_project import urban_greening_project_crud
from app.schemas.urban_greening_project_schemas import (
    UrbanGreeningProjectCreate,
    UrbanGreeningProjectUpdate,
    UrbanGreeningProjectInDB,
    ProjectStats,
    ProjectPlant
)

router = APIRouter()


def _serialize_project(project) -> dict:
    """Serialize urban greening project with JSON parsing"""
    data = {
        "id": project.id,
        "project_code": project.project_code,
        "project_type": project.project_type,
        "barangay": project.barangay,
        "location": project.location,
        "latitude": float(project.latitude) if project.latitude else None,
        "longitude": float(project.longitude) if project.longitude else None,
        "planting_date": project.planting_date.isoformat() if project.planting_date else None,
        "plants": json.loads(project.plants) if project.plants else [],
        "total_plants": project.total_plants,
        "status": project.status,
        "project_lead": project.project_lead,
        "contact_number": project.contact_number,
        "organization": project.organization,
        "description": project.description,
        "photos": json.loads(project.photos) if project.photos else [],
        "linked_cutting_request_id": str(project.linked_cutting_request_id) if project.linked_cutting_request_id else None,
        "linked_cut_tree_ids": json.loads(project.linked_cut_tree_ids) if project.linked_cut_tree_ids else [],
        "created_at": project.created_at.isoformat() if project.created_at else None,
        "updated_at": project.updated_at.isoformat() if project.updated_at else None
    }
    return data


@router.get("/", response_model=List[dict])
def list_urban_greening_projects(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None),
    project_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get list of urban greening projects with optional filters
    """
    projects = urban_greening_project_crud.get_multi(
        db,
        skip=skip,
        limit=limit,
        status=status,
        project_type=project_type,
        search=search,
        year=year
    )
    return [_serialize_project(p) for p in projects]


@router.get("/stats")
def get_project_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get statistics for urban greening projects
    """
    return urban_greening_project_crud.get_stats(db)


@router.get("/{project_id}")
def get_urban_greening_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a specific urban greening project by ID
    """
    project = urban_greening_project_crud.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Urban greening project not found"
        )
    return _serialize_project(project)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_urban_greening_project(
    project_in: UrbanGreeningProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new urban greening project
    """
    project = urban_greening_project_crud.create(db, obj_in=project_in)
    return _serialize_project(project)


@router.patch("/{project_id}")
def update_urban_greening_project(
    project_id: str,
    project_in: UrbanGreeningProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update an urban greening project
    """
    project = urban_greening_project_crud.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Urban greening project not found"
        )
    
    updated_project = urban_greening_project_crud.update(db, db_obj=project, obj_in=project_in)
    return _serialize_project(updated_project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_urban_greening_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> None:
    """
    Delete an urban greening project
    """
    project = urban_greening_project_crud.get(db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Urban greening project not found"
        )
    
    urban_greening_project_crud.remove(db, id=project_id)
