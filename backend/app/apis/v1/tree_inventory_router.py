# app/apis/v1/tree_inventory_router.py
"""API endpoints for Tree Inventory System"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.db.database import get_db
from app.apis.deps import require_permissions_sync
from app.models.auth_models import User
from app.schemas.tree_inventory_schemas import (
    TreeInventoryCreate, TreeInventoryUpdate, TreeInventoryResponse,
    TreeMonitoringLogCreate, TreeMonitoringLogResponse,
    PlantingProjectCreate, PlantingProjectUpdate, PlantingProjectResponse,
    TreeInventoryStats, PlantingProjectStats, TreeCarbonStatistics,
    TreeSpeciesCreate, TreeSpeciesUpdate, TreeSpeciesResponse
)
from app.crud import crud_tree_inventory as crud

router = APIRouter(prefix="/tree-inventory", tags=["Tree Inventory"])


# ==================== Tree Species Endpoints ====================

@router.get("/species", response_model=List[TreeSpeciesResponse])
def get_all_species(
    search: Optional[str] = Query(None, description="Search by scientific, common, or local name"),
    species_type: Optional[str] = Query(None, description="Filter by species type (Tree, Ornamental, Seed, Other)"),
    include_inactive: bool = Query(False, description="Include inactive species"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree_species.view']))
):
    """Get all tree species for dropdown selection"""
    return crud.get_all_species(db, search, include_inactive, species_type)


@router.get("/species/{species_id}", response_model=TreeSpeciesResponse)
def get_species_by_id(
    species_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree_species.view']))
):
    """Get a specific tree species by ID"""
    species = crud.get_species_by_id(db, species_id)
    if not species:
        raise HTTPException(status_code=404, detail="Species not found")
    return species


@router.post("/species", response_model=TreeSpeciesResponse, status_code=201)
def create_species(
    species_data: TreeSpeciesCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree_species.create']))
):
    """Add a new tree species to the database"""
    # Check if already exists by scientific name (if provided)
    if species_data.scientific_name:
        existing = crud.get_species_by_name(db, species_data.scientific_name)
        if existing:
            raise HTTPException(status_code=400, detail="Species with this scientific name already exists")
    return crud.create_species(db, species_data)


@router.put("/species/{species_id}", response_model=TreeSpeciesResponse)
def update_species(
    species_id: UUID,
    species_data: TreeSpeciesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree_species.update']))
):
    """Update a tree species"""
    species = crud.update_species(db, species_id, species_data)
    if not species:
        raise HTTPException(status_code=404, detail="Species not found")
    return species


@router.delete("/species/{species_id}", status_code=200)
def delete_species(
    species_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree_species.delete']))
):
    """
    Soft delete a tree species (marks as inactive).
    Returns count of trees currently using this species.
    """
    species = crud.get_species_by_id(db, species_id)
    if not species:
        raise HTTPException(status_code=404, detail="Species not found")
    
    # Count trees using this species
    trees_count = crud.count_trees_using_species(db, species.common_name)
    
    # Perform soft delete
    if not crud.delete_species(db, species_id):
        raise HTTPException(status_code=404, detail="Species not found")
    
    return {
        "message": "Species deactivated successfully",
        "trees_using_species": trees_count,
        "species_name": species.common_name
    }


# ==================== Tree Inventory Endpoints ====================

@router.get("/trees", response_model=List[TreeInventoryResponse])
def get_all_trees(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status: Optional[str] = Query(None, description="Filter by status: alive, cut, dead, replaced"),
    health: Optional[str] = Query(None, description="Filter by health: healthy, needs_attention, diseased, dead"),
    species: Optional[str] = Query(None, description="Filter by species (partial match)"),
    barangay: Optional[str] = Query(None, description="Filter by barangay (partial match)"),
    search: Optional[str] = Query(None, description="Search by code, species, name, or address"),
    is_archived: Optional[bool] = Query(False, description="Filter by archived status. Set to null to include all."),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree.view']))
):
    """Get all trees in inventory with optional filters"""
    trees = crud.get_all_trees(db, skip, limit, status, health, species, barangay, search, is_archived)
    return [TreeInventoryResponse.from_db_model(t) for t in trees]


@router.get("/trees/next-code")
def preview_tree_code(
    year: Optional[int] = Query(None, ge=1900, le=9999, description="Year used to generate the code"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree.view']))
):
    """Preview the next available tree code for a specific year."""
    target_year = year if year is not None else datetime.now().year
    return {"tree_code": crud.generate_tree_code(db, target_year)}


@router.get("/trees/map", response_model=List[TreeInventoryResponse])
def get_trees_for_map(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree.view']))
):
    """Get all trees with location data for map visualization"""
    trees = crud.get_trees_for_map(db)
    return [TreeInventoryResponse.from_db_model(t) for t in trees]


@router.get("/trees/bounds")
def get_trees_in_bounds(
    min_lat: float = Query(..., description="Minimum latitude"),
    min_lng: float = Query(..., description="Minimum longitude"),
    max_lat: float = Query(..., description="Maximum latitude"),
    max_lng: float = Query(..., description="Maximum longitude"),
    status: Optional[str] = Query(None, description="Filter by status"),
    health: Optional[str] = Query(None, description="Filter by health"),
    limit: int = Query(500, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree.view']))
):
    """Get trees within bounding box using PostGIS spatial query"""
    return crud.get_trees_in_bounds(db, min_lat, min_lng, max_lat, max_lng, status, health, limit)


@router.get("/trees/clusters")
def get_tree_clusters(
    min_lat: float = Query(..., description="Minimum latitude"),
    min_lng: float = Query(..., description="Minimum longitude"),
    max_lat: float = Query(..., description="Maximum latitude"),
    max_lng: float = Query(..., description="Maximum longitude"),
    zoom: int = Query(14, ge=1, le=20, description="Map zoom level"),
    status: Optional[str] = Query(None, description="Filter by status"),
    health: Optional[str] = Query(None, description="Filter by health"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree.view']))
):
    """Get clustered tree data for map visualization at different zoom levels"""
    # Calculate grid size based on zoom level (smaller grid = more clusters at lower zoom)
    grid_sizes = {
        1: 10.0, 2: 5.0, 3: 2.0, 4: 1.0, 5: 0.5,
        6: 0.25, 7: 0.1, 8: 0.05, 9: 0.025, 10: 0.01,
        11: 0.005, 12: 0.0025, 13: 0.001, 14: 0.0005,
        15: 0.00025, 16: 0.0001, 17: 0.00005, 18: 0.000025,
        19: 0.00001, 20: 0.000005
    }
    grid_size = grid_sizes.get(zoom, 0.001)
    return crud.get_tree_clusters(db, min_lat, min_lng, max_lat, max_lng, grid_size, status, health)


@router.get("/trees/stats", response_model=TreeInventoryStats)
def get_tree_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree.view']))
):
    """Get tree inventory statistics"""
    return crud.get_tree_inventory_stats(db)


@router.get("/trees/carbon-statistics", response_model=TreeCarbonStatistics)
def get_carbon_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree.view']))
):
    """
    Get comprehensive tree carbon statistics including:
    - Tree Count & Composition (total, per species, native vs exotic)
    - Carbon Stock (total CO₂ stored, per species, top 5 contribution)
    - Annual Carbon Sequestration (total absorbed, from new plantings)
    - Carbon Loss (from removals, projected decay)
    """
    return crud.get_tree_carbon_statistics(db)


@router.get("/trees/{tree_id}", response_model=TreeInventoryResponse)
def get_tree(
    tree_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree.view']))
):
    """Get a specific tree by ID"""
    tree = crud.get_tree_by_id(db, tree_id)
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")
    
    # Get monitoring logs count and last inspection
    logs = crud.get_monitoring_logs(db, tree_id)
    logs_count = len(logs)
    last_inspection = logs[0].inspection_date if logs else None
    
    return TreeInventoryResponse.from_db_model(tree, logs_count, last_inspection)


@router.get("/trees/code/{tree_code}", response_model=TreeInventoryResponse)
def get_tree_by_code(
    tree_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree.view']))
):
    """Get a specific tree by tree code (for QR scanning)"""
    tree = crud.get_tree_by_code(db, tree_code)
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")
    return TreeInventoryResponse.from_db_model(tree)


@router.post("/trees", response_model=TreeInventoryResponse, status_code=201)
def create_tree(
    tree_data: TreeInventoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree.create']))
):
    """Create a new tree in the inventory with automatic initial monitoring log"""
    try:
        tree = crud.create_tree(db, tree_data, current_user)
    except crud.DuplicateTreeCodeError:
        raise HTTPException(status_code=409, detail="Tree code already exists")
    return TreeInventoryResponse.from_db_model(tree)


@router.put("/trees/{tree_id}", response_model=TreeInventoryResponse)
def update_tree(
    tree_id: UUID,
    tree_data: TreeInventoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree.update']))
):
    """Update a tree in the inventory"""
    try:
        tree = crud.update_tree(db, tree_id, tree_data)
    except crud.DuplicateTreeCodeError:
        raise HTTPException(status_code=409, detail="Tree code already exists")
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")
    return TreeInventoryResponse.from_db_model(tree)


@router.delete("/trees/{tree_id}", status_code=204)
def archive_tree(
    tree_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree.delete']))
):
    """Archive a tree from the inventory"""
    if not crud.archive_tree(db, tree_id):
        raise HTTPException(status_code=404, detail="Tree not found")


@router.post("/trees/{tree_id}/restore", status_code=200)
def restore_tree(
    tree_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree.update']))
):
    """Restore an archived tree"""
    if not crud.restore_tree(db, tree_id):
        raise HTTPException(status_code=404, detail="Tree not found")
    return {"message": "Tree restored successfully"}


# ==================== Monitoring Log Endpoints ====================

@router.get("/trees/{tree_id}/monitoring", response_model=List[TreeMonitoringLogResponse])
def get_monitoring_logs(
    tree_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['monitoring_log.view']))
):
    """Get all monitoring logs for a tree"""
    logs = crud.get_monitoring_logs(db, tree_id)
    return [TreeMonitoringLogResponse.from_db_model(log) for log in logs]


@router.post("/monitoring", response_model=TreeMonitoringLogResponse, status_code=201)
def create_monitoring_log(
    log_data: TreeMonitoringLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['monitoring_log.create']))
):
    """Create a new monitoring log (also updates tree health)"""
    # Verify tree exists
    tree = crud.get_tree_by_id(db, log_data.tree_id)
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")
    
    log = crud.create_monitoring_log(db, log_data)
    return TreeMonitoringLogResponse.from_db_model(log)


# ==================== Planting Project Endpoints ====================

@router.get("/projects", response_model=List[PlantingProjectResponse])
def get_all_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    project_type: Optional[str] = Query(None, description="Filter by type: replacement, urban_greening, reforestation"),
    status: Optional[str] = Query(None, description="Filter by status: planned, ongoing, completed, cancelled"),
    search: Optional[str] = Query(None, description="Search by code, name, or organization"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree_project.view']))
):
    """Get all planting projects with optional filters"""
    projects = crud.get_all_projects(db, skip, limit, project_type, status, search)
    return [PlantingProjectResponse.from_db_model(p) for p in projects]


@router.get("/projects/stats", response_model=PlantingProjectStats)
def get_project_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree_project.view']))
):
    """Get planting project statistics"""
    return crud.get_planting_project_stats(db)


@router.get("/projects/{project_id}", response_model=PlantingProjectResponse)
def get_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree_project.view']))
):
    """Get a specific planting project by ID"""
    project = crud.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return PlantingProjectResponse.from_db_model(project)


@router.post("/projects", response_model=PlantingProjectResponse, status_code=201)
def create_project(
    project_data: PlantingProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree_project.create']))
):
    """Create a new planting project"""
    project = crud.create_project(db, project_data)
    return PlantingProjectResponse.from_db_model(project)


@router.put("/projects/{project_id}", response_model=PlantingProjectResponse)
def update_project(
    project_id: UUID,
    project_data: PlantingProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree_project.update']))
):
    """Update a planting project"""
    project = crud.update_project(db, project_id, project_data)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return PlantingProjectResponse.from_db_model(project)


@router.delete("/projects/{project_id}", status_code=204)
def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree_project.delete']))
):
    """Delete a planting project"""
    if not crud.delete_project(db, project_id):
        raise HTTPException(status_code=404, detail="Project not found")


# ==================== Batch Operations ====================

@router.post("/trees/batch", response_model=List[TreeInventoryResponse], status_code=201)
def create_trees_batch(
    trees_data: List[TreeInventoryCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree.create']))
):
    """Create multiple trees in a single request (for bulk import)"""
    created_trees = []
    for tree_data in trees_data:
        tree = crud.create_tree(db, tree_data, current_user)
        created_trees.append(TreeInventoryResponse.from_db_model(tree))
    return created_trees


@router.post("/projects/{project_id}/add-trees", response_model=List[TreeInventoryResponse], status_code=201)
def add_trees_to_project(
    project_id: UUID,
    trees_data: List[TreeInventoryCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions_sync(['tree.create']))
):
    """Add multiple trees to a planting project"""
    # Verify project exists
    project = crud.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    created_trees = []
    for tree_data in trees_data:
        # Link tree to project
        tree_data.planting_project_id = project_id
        # Use project location if tree doesn't have one
        if not tree_data.latitude and project.latitude:
            tree_data.latitude = project.latitude
            tree_data.longitude = project.longitude
        if not tree_data.address and project.address:
            tree_data.address = project.address
        if not tree_data.barangay and project.barangay:
            tree_data.barangay = project.barangay
        
        tree = crud.create_tree(db, tree_data, current_user)
        created_trees.append(TreeInventoryResponse.from_db_model(tree))
    
    # Update project trees_planted count
    project.trees_planted = (project.trees_planted or 0) + len(created_trees)
    db.commit()
    
    return created_trees
