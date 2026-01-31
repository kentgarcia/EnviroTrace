# app/crud/crud_tree_inventory.py
"""CRUD operations for Tree Inventory System"""

from sqlalchemy.orm import Session
from sqlalchemy import func, extract, desc, or_
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from uuid import UUID
from datetime import date, datetime, timezone
import json
import re

from app.models.tree_inventory_models import TreeInventory, TreeMonitoringLog, PlantingProject, TreeSpecies
from app.schemas.tree_inventory_schemas import (
    TreeInventoryCreate, TreeInventoryUpdate,
    TreeMonitoringLogCreate,
    PlantingProjectCreate, PlantingProjectUpdate,
    TreeInventoryStats, PlantingProjectStats,
    TreeSpeciesCreate, TreeSpeciesUpdate,
    TreeCarbonStatistics, TreeCountCompositionStats, CarbonStockStats,
    AnnualCarbonSequestrationStats, CarbonLossStats,
    SpeciesComposition, SpeciesCarbonData
)


class DuplicateTreeCodeError(Exception):
    """Raised when a tree code already exists."""


TREE_CODE_PATTERN = re.compile(r"^TAG-(?P<year>\d{4})-(\d{6})$")


def _extract_year_from_code(tree_code: Optional[str]) -> Optional[int]:
    if not tree_code:
        return None
    match = TREE_CODE_PATTERN.match(tree_code)
    if not match:
        return None
    return int(match.group("year"))


def _is_duplicate_tree_code_error(error: IntegrityError) -> bool:
    return "tree_code" in str(getattr(error, "orig", ""))


# ==================== Tree Species CRUD ====================

def get_all_species(db: Session, search: Optional[str] = None, include_inactive: bool = False) -> List[TreeSpecies]:
    """Get all tree species with optional search"""
    query = db.query(TreeSpecies)
    
    if not include_inactive:
        query = query.filter(TreeSpecies.is_active == True)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                TreeSpecies.scientific_name.ilike(search_term),
                TreeSpecies.common_name.ilike(search_term),
                TreeSpecies.local_name.ilike(search_term)
            )
        )
    
    return query.order_by(TreeSpecies.common_name).all()


def get_species_by_name(db: Session, scientific_name: str) -> Optional[TreeSpecies]:
    """Get species by scientific name"""
    return db.query(TreeSpecies).filter(TreeSpecies.scientific_name == scientific_name).first()


def get_species_by_id(db: Session, species_id: UUID) -> Optional[TreeSpecies]:
    """Get species by ID"""
    return db.query(TreeSpecies).filter(TreeSpecies.id == species_id).first()


def create_species(db: Session, species_data: TreeSpeciesCreate) -> TreeSpecies:
    """Create a new tree species"""
    species = TreeSpecies(**species_data.model_dump())
    db.add(species)
    db.commit()
    db.refresh(species)
    return species


def update_species(db: Session, species_id: UUID, species_data: TreeSpeciesUpdate) -> Optional[TreeSpecies]:
    """Update a tree species"""
    species = get_species_by_id(db, species_id)
    if not species:
        return None
    
    update_data = species_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(species, field, value)
    
    db.commit()
    db.refresh(species)
    return species


def delete_species(db: Session, species_id: UUID) -> bool:
    """
    Soft delete a tree species by marking it as inactive.
    This prevents breaking references from existing trees.
    """
    species = get_species_by_id(db, species_id)
    if not species:
        return False
    
    # Mark as inactive instead of hard delete to preserve data integrity
    species.is_active = False
    db.commit()
    return True


def count_trees_using_species(db: Session, common_name: str) -> int:
    """Count how many trees are using this species (by common_name)"""
    return db.query(TreeInventory).filter(TreeInventory.common_name == common_name).count()


# ==================== Tree Code Generation ====================

def generate_tree_code(db: Session, year: Optional[int] = None) -> str:
    """Generate unique tree code: TAG-YYYY-XXXXXX"""
    try:
        target_year = int(year) if year is not None else datetime.now().year
    except (TypeError, ValueError):
        target_year = datetime.now().year

    target_year = max(1900, min(target_year, 9999))
    prefix = f"TAG-{target_year}-"

    # Find the highest number for this year
    result = (
        db.query(func.max(TreeInventory.tree_code))
        .filter(TreeInventory.tree_code.like(f"{prefix}%"))
        .scalar()
    )

    if result:
        try:
            last_num = int(result.replace(prefix, ""))
            new_num = last_num + 1
        except Exception:
            new_num = 1
    else:
        new_num = 1

    return f"{prefix}{str(new_num).zfill(6)}"


def generate_project_code(db: Session) -> str:
    """Generate unique project code: PRJ-YYYY-XXXXXX"""
    year = datetime.now().year
    prefix = f"PRJ-{year}-"
    
    result = db.query(func.max(PlantingProject.project_code))\
        .filter(PlantingProject.project_code.like(f"{prefix}%"))\
        .scalar()
    
    if result:
        try:
            last_num = int(result.replace(prefix, ""))
            new_num = last_num + 1
        except:
            new_num = 1
    else:
        new_num = 1
    
    return f"{prefix}{str(new_num).zfill(6)}"


# ==================== Tree Inventory CRUD ====================

def get_all_trees(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    health: Optional[str] = None,
    species: Optional[str] = None,
    barangay: Optional[str] = None,
    search: Optional[str] = None,
    is_archived: Optional[bool] = False
) -> List[TreeInventory]:
    """Get all trees with optional filters"""
    query = db.query(TreeInventory)
    
    if is_archived is not None:
        query = query.filter(TreeInventory.is_archived == is_archived)
    if status:
        query = query.filter(TreeInventory.status == status)
    if health:
        query = query.filter(TreeInventory.health == health)
    if species:
        query = query.filter(TreeInventory.species.ilike(f"%{species}%"))
    if barangay:
        query = query.filter(TreeInventory.barangay.ilike(f"%{barangay}%"))
    if search:
        query = query.filter(
            (TreeInventory.tree_code.ilike(f"%{search}%")) |
            (TreeInventory.species.ilike(f"%{search}%")) |
            (TreeInventory.common_name.ilike(f"%{search}%")) |
            (TreeInventory.address.ilike(f"%{search}%"))
        )
    
    return query.order_by(desc(TreeInventory.created_at)).offset(skip).limit(limit).all()


def get_tree_by_id(db: Session, tree_id: UUID) -> Optional[TreeInventory]:
    """Get tree by ID"""
    return db.query(TreeInventory).filter(TreeInventory.id == tree_id).first()


def get_tree_by_code(db: Session, tree_code: str) -> Optional[TreeInventory]:
    """Get tree by code"""
    return db.query(TreeInventory).filter(TreeInventory.tree_code == tree_code).first()


def create_tree(db: Session, tree_data: TreeInventoryCreate) -> TreeInventory:
    """Create new tree in inventory"""
    # Generate tree code if not provided
    planted_date = tree_data.planted_date
    target_year = planted_date.year if planted_date else datetime.now().year
    tree_code = tree_data.tree_code or generate_tree_code(db, target_year)
    
    # Convert photos list to JSON string
    photos_json = None
    if tree_data.photos:
        photos_list = [
            p.model_dump() if hasattr(p, "model_dump") else p 
            for p in tree_data.photos
        ]
        photos_json = json.dumps(photos_list)
    
    db_tree = TreeInventory(
        tree_code=tree_code,
        species=tree_data.species,
        common_name=tree_data.common_name,
        latitude=tree_data.latitude,
        longitude=tree_data.longitude,
        address=tree_data.address,
        barangay=tree_data.barangay,
        status=tree_data.status,
        health=tree_data.health,
        height_meters=tree_data.height_meters,
        diameter_cm=tree_data.diameter_cm,
        age_years=tree_data.age_years,
        planted_date=tree_data.planted_date,
        managed_by=tree_data.managed_by,
        contact_person=tree_data.contact_person,
        contact_number=tree_data.contact_number,
        planting_project_id=tree_data.planting_project_id,
        photos=photos_json,
        notes=tree_data.notes
    )
    
    db.add(db_tree)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        if _is_duplicate_tree_code_error(exc):
            raise DuplicateTreeCodeError from exc
        raise

    db.refresh(db_tree)
    return db_tree


def update_tree(db: Session, tree_id: UUID, tree_data: TreeInventoryUpdate) -> Optional[TreeInventory]:
    """Update tree in inventory"""
    db_tree = get_tree_by_id(db, tree_id)
    if not db_tree:
        return None
    
    update_data = tree_data.model_dump(exclude_unset=True)
    
    # Handle photos field
    if 'photos' in update_data and update_data['photos'] is not None:
        update_data['photos'] = json.dumps(update_data['photos'])

    # Normalize empty tree code to trigger regeneration logic
    if 'tree_code' in update_data and update_data['tree_code'] is None:
        update_data.pop('tree_code')

    manual_tree_code_provided = 'tree_code' in update_data

    if not manual_tree_code_provided:
        # Determine if planted date is changing and whether existing code follows the auto pattern
        new_planted_date = update_data.get('planted_date', db_tree.planted_date)
        target_year = new_planted_date.year if new_planted_date else datetime.now().year
        existing_year = _extract_year_from_code(db_tree.tree_code)

        if 'planted_date' in update_data and existing_year is not None and existing_year != target_year:
            update_data['tree_code'] = generate_tree_code(db, target_year)
        elif db_tree.tree_code is None:
            update_data['tree_code'] = generate_tree_code(db, target_year)
    
    for key, value in update_data.items():
        setattr(db_tree, key, value)
    
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        if _is_duplicate_tree_code_error(exc):
            raise DuplicateTreeCodeError from exc
        raise

    db.refresh(db_tree)
    return db_tree


def delete_tree(db: Session, tree_id: UUID) -> bool:
    """Archive tree from inventory (legacy delete alias)"""
    return archive_tree(db, tree_id)


def archive_tree(db: Session, tree_id: UUID) -> bool:
    """Mark tree as archived"""
    db_tree = get_tree_by_id(db, tree_id)
    if not db_tree:
        return False

    if db_tree.is_archived:
        return True

    db_tree.is_archived = True
    db_tree.archived_at = datetime.now(timezone.utc)
    db.commit()
    return True


def restore_tree(db: Session, tree_id: UUID) -> bool:
    """Restore archived tree"""
    db_tree = get_tree_by_id(db, tree_id)
    if not db_tree:
        return False

    if not db_tree.is_archived:
        return True

    db_tree.is_archived = False
    db_tree.archived_at = None
    db.commit()
    return True


def get_trees_for_map(db: Session) -> List[TreeInventory]:
    """Get all trees with location for map display"""
    return db.query(TreeInventory)\
        .filter(TreeInventory.is_archived == False)\
        .filter(TreeInventory.latitude.isnot(None))\
        .filter(TreeInventory.longitude.isnot(None))\
        .all()


def get_trees_in_bounds(
    db: Session,
    min_lat: float,
    min_lng: float,
    max_lat: float,
    max_lng: float,
    status: Optional[str] = None,
    health: Optional[str] = None,
    limit: int = 500
) -> List[dict]:
    """Get trees within bounding box using PostGIS spatial query"""
    from sqlalchemy import text
    
    result = db.execute(
        text("""
            SELECT * FROM urban_greening.get_trees_in_bounds(
                :min_lat, :min_lng, :max_lat, :max_lng, :status, :health, :limit
            )
        """),
        {
            "min_lat": min_lat,
            "min_lng": min_lng,
            "max_lat": max_lat,
            "max_lng": max_lng,
            "status": status,
            "health": health,
            "limit": limit
        }
    )
    
    rows = [dict(row._mapping) for row in result.fetchall()]
    return [row for row in rows if not row.get("is_archived")]


def get_tree_clusters(
    db: Session,
    min_lat: float,
    min_lng: float,
    max_lat: float,
    max_lng: float,
    grid_size: float = 0.01,
    status: Optional[str] = None,
    health: Optional[str] = None
) -> List[dict]:
    """Get clustered tree data for map visualization"""
    from sqlalchemy import text
    
    result = db.execute(
        text("""
            SELECT * FROM urban_greening.get_tree_clusters(
                :min_lat, :min_lng, :max_lat, :max_lng, :grid_size, :status, :health
            )
        """),
        {
            "min_lat": min_lat,
            "min_lng": min_lng,
            "max_lat": max_lat,
            "max_lng": max_lng,
            "grid_size": grid_size,
            "status": status,
            "health": health
        }
    )
    
    return [dict(row._mapping) for row in result.fetchall()]


# ==================== Tree Monitoring CRUD ====================

def get_monitoring_logs(db: Session, tree_id: UUID) -> List[TreeMonitoringLog]:
    """Get all monitoring logs for a tree"""
    return db.query(TreeMonitoringLog)\
        .filter(TreeMonitoringLog.tree_id == tree_id)\
        .order_by(desc(TreeMonitoringLog.inspection_date))\
        .all()


def create_monitoring_log(db: Session, log_data: TreeMonitoringLogCreate) -> TreeMonitoringLog:
    """Create monitoring log and update tree health"""
    photos_json = json.dumps(log_data.photos) if log_data.photos else None
    
    db_log = TreeMonitoringLog(
        tree_id=log_data.tree_id,
        inspection_date=log_data.inspection_date,
        health_status=log_data.health_status,
        height_meters=log_data.height_meters,
        diameter_cm=log_data.diameter_cm,
        notes=log_data.notes,
        inspector_name=log_data.inspector_name,
        photos=photos_json
    )
    
    db.add(db_log)
    
    # Update tree health based on latest inspection
    tree = get_tree_by_id(db, log_data.tree_id)
    if tree:
        tree.health = log_data.health_status
        if log_data.height_meters:
            tree.height_meters = log_data.height_meters
        if log_data.diameter_cm:
            tree.diameter_cm = log_data.diameter_cm
        if log_data.health_status == 'dead':
            tree.status = 'dead'
            tree.death_date = log_data.inspection_date
    
    db.commit()
    db.refresh(db_log)
    return db_log


# ==================== Planting Project CRUD ====================

def get_all_projects(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    project_type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None
) -> List[PlantingProject]:
    """Get all planting projects with optional filters"""
    query = db.query(PlantingProject)
    
    if project_type:
        query = query.filter(PlantingProject.project_type == project_type)
    if status:
        query = query.filter(PlantingProject.status == status)
    if search:
        query = query.filter(
            (PlantingProject.project_code.ilike(f"%{search}%")) |
            (PlantingProject.project_name.ilike(f"%{search}%")) |
            (PlantingProject.organization.ilike(f"%{search}%"))
        )
    
    return query.order_by(desc(PlantingProject.created_at)).offset(skip).limit(limit).all()


def get_project_by_id(db: Session, project_id: UUID) -> Optional[PlantingProject]:
    """Get planting project by ID"""
    return db.query(PlantingProject).filter(PlantingProject.id == project_id).first()


def create_project(db: Session, project_data: PlantingProjectCreate) -> PlantingProject:
    """Create new planting project"""
    project_code = project_data.project_code or generate_project_code(db)
    photos_json = json.dumps(project_data.photos) if project_data.photos else None
    
    db_project = PlantingProject(
        project_code=project_code,
        project_name=project_data.project_name,
        project_type=project_data.project_type,
        latitude=project_data.latitude,
        longitude=project_data.longitude,
        address=project_data.address,
        barangay=project_data.barangay,
        planting_date=project_data.planting_date,
        target_trees=project_data.target_trees,
        responsible_person=project_data.responsible_person,
        organization=project_data.organization,
        contact_number=project_data.contact_number,
        status=project_data.status,
        notes=project_data.notes,
        photos=photos_json
    )
    
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def update_project(db: Session, project_id: UUID, project_data: PlantingProjectUpdate) -> Optional[PlantingProject]:
    """Update planting project"""
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        return None
    
    update_data = project_data.model_dump(exclude_unset=True)
    
    if 'photos' in update_data and update_data['photos'] is not None:
        update_data['photos'] = json.dumps(update_data['photos'])
    
    for key, value in update_data.items():
        setattr(db_project, key, value)
    
    db.commit()
    db.refresh(db_project)
    return db_project


def delete_project(db: Session, project_id: UUID) -> bool:
    """Delete planting project"""
    db_project = get_project_by_id(db, project_id)
    if not db_project:
        return False
    
    db.delete(db_project)
    db.commit()
    return True


# ==================== Statistics ====================

def get_tree_inventory_stats(db: Session) -> TreeInventoryStats:
    """Get comprehensive tree inventory statistics"""
    current_year = datetime.now().year
    active_clause = (TreeInventory.is_archived == False)
    active_clause = (TreeInventory.is_archived == False)
    
    # Total counts by status
    total = db.query(func.count(TreeInventory.id)).filter(active_clause).scalar() or 0
    alive = db.query(func.count(TreeInventory.id)).filter(active_clause, TreeInventory.status == 'alive').scalar() or 0
    cut = db.query(func.count(TreeInventory.id)).filter(active_clause, TreeInventory.status == 'cut').scalar() or 0
    dead = db.query(func.count(TreeInventory.id)).filter(active_clause, TreeInventory.status == 'dead').scalar() or 0
    
    # Health counts
    healthy = db.query(func.count(TreeInventory.id)).filter(active_clause, TreeInventory.health == 'healthy').scalar() or 0
    needs_attention = db.query(func.count(TreeInventory.id)).filter(active_clause, TreeInventory.health == 'needs_attention').scalar() or 0
    diseased = db.query(func.count(TreeInventory.id)).filter(active_clause, TreeInventory.health == 'diseased').scalar() or 0
    
    # This year's activity
    planted_this_year = db.query(func.count(TreeInventory.id))\
        .filter(active_clause, extract('year', TreeInventory.planted_date) == current_year).scalar() or 0
    cut_this_year = db.query(func.count(TreeInventory.id))\
        .filter(active_clause, extract('year', TreeInventory.cutting_date) == current_year).scalar() or 0
    
    # Replacement ratio
    replacement_ratio = None
    if cut_this_year > 0:
        replacement_ratio = round(planted_this_year / cut_this_year, 2)
    
    # Top species
    top_species = db.query(
        TreeInventory.species,
        func.count(TreeInventory.id).label('count')
    ).filter(active_clause, TreeInventory.status == 'alive')\
     .group_by(TreeInventory.species)\
     .order_by(desc('count'))\
     .limit(10).all()
    
    # By barangay
    by_barangay = db.query(
        TreeInventory.barangay,
        func.count(TreeInventory.id).label('count')
    ).filter(active_clause, TreeInventory.barangay.isnot(None))\
     .group_by(TreeInventory.barangay)\
     .order_by(desc('count'))\
     .limit(10).all()
    
    return TreeInventoryStats(
        total_trees=total,
        alive_trees=alive,
        cut_trees=cut,
        dead_trees=dead,
        healthy_trees=healthy,
        needs_attention_trees=needs_attention,
        diseased_trees=diseased,
        trees_planted_this_year=planted_this_year,
        trees_cut_this_year=cut_this_year,
        replacement_ratio=replacement_ratio,
        top_species=[{"species": s, "count": c} for s, c in top_species],
        by_barangay=[{"barangay": b or "Unknown", "count": c} for b, c in by_barangay]
    )


def get_planting_project_stats(db: Session) -> PlantingProjectStats:
    """Get planting project statistics"""
    total = db.query(func.count(PlantingProject.id)).scalar() or 0
    planned = db.query(func.count(PlantingProject.id)).filter(PlantingProject.status == 'planned').scalar() or 0
    ongoing = db.query(func.count(PlantingProject.id)).filter(PlantingProject.status == 'ongoing').scalar() or 0
    completed = db.query(func.count(PlantingProject.id)).filter(PlantingProject.status == 'completed').scalar() or 0
    
    total_planted = db.query(func.sum(PlantingProject.trees_planted)).scalar() or 0
    
    by_type = db.query(
        PlantingProject.project_type,
        func.count(PlantingProject.id).label('count'),
        func.sum(PlantingProject.trees_planted).label('trees')
    ).group_by(PlantingProject.project_type).all()
    
    return PlantingProjectStats(
        total_projects=total,
        planned_projects=planned,
        ongoing_projects=ongoing,
        completed_projects=completed,
        total_trees_planted=total_planted,
        by_type=[{"type": t, "count": c, "trees": tr or 0} for t, c, tr in by_type]
    )


def get_tree_carbon_statistics(db: Session) -> TreeCarbonStatistics:
    """
    Get comprehensive tree carbon statistics including:
    - Tree Count & Composition
    - Carbon Stock
    - Annual Carbon Sequestration
    - Carbon Loss
    """
    from datetime import datetime
    
    current_year = datetime.now().year
    
    # ==================== Tree Count & Composition ====================
    
    # Basic counts
    total_trees = db.query(func.count(TreeInventory.id)).filter(active_clause).scalar() or 0
    alive_trees = db.query(func.count(TreeInventory.id)).filter(active_clause, TreeInventory.status == 'alive').scalar() or 0
    cut_trees = db.query(func.count(TreeInventory.id)).filter(active_clause, TreeInventory.status == 'cut').scalar() or 0
    dead_trees = db.query(func.count(TreeInventory.id)).filter(active_clause, TreeInventory.status == 'dead').scalar() or 0
    
    # Native vs endangered - join with species table
    native_subquery = db.query(func.count(TreeInventory.id))\
        .join(TreeSpecies, TreeInventory.common_name == TreeSpecies.common_name)\
        .filter(TreeSpecies.is_native == True)\
        .filter(active_clause, TreeInventory.status == 'alive')\
        .scalar() or 0
    
    endangered_subquery = db.query(func.count(TreeInventory.id))\
        .join(TreeSpecies, TreeInventory.common_name == TreeSpecies.common_name)\
        .filter(TreeSpecies.is_endangered == True)\
        .filter(active_clause, TreeInventory.status == 'alive')\
        .scalar() or 0
    
    native_count = native_subquery
    endangered_count = endangered_subquery
    native_ratio = round(native_count / alive_trees * 100, 1) if alive_trees > 0 else 0.0
    
    # Trees per species with native flag
    species_counts = db.query(
        TreeInventory.common_name,
        TreeSpecies.scientific_name,
        TreeSpecies.is_native,
        func.count(TreeInventory.id).label('count')
    ).outerjoin(TreeSpecies, TreeInventory.common_name == TreeSpecies.common_name)\
     .filter(active_clause, TreeInventory.status == 'alive')\
     .group_by(TreeInventory.common_name, TreeSpecies.scientific_name, TreeSpecies.is_native)\
     .order_by(desc('count'))\
     .all()
    
    trees_per_species = []
    for common_name, scientific_name, is_native, count in species_counts:
        trees_per_species.append(SpeciesComposition(
            species_name=scientific_name or common_name or "Unknown",
            common_name=common_name or "Unknown",
            count=count,
            percentage=round(count / alive_trees * 100, 2) if alive_trees > 0 else 0,
            is_native=is_native or False
        ))
    
    composition = TreeCountCompositionStats(
        total_trees=total_trees,
        alive_trees=alive_trees,
        cut_trees=cut_trees,
        dead_trees=dead_trees,
        native_count=native_count,
        endangered_count=endangered_count,
        native_ratio=native_ratio,
        trees_per_species=trees_per_species
    )
    
    # ==================== Carbon Stock ====================
    
    # Calculate CO2 stored based on species data
    # Join trees with species to get CO2 stored per tree
    carbon_by_species = db.query(
        TreeInventory.common_name,
        TreeSpecies.scientific_name,
        func.count(TreeInventory.id).label('tree_count'),
        TreeSpecies.co2_stored_mature_avg_kg,
        TreeSpecies.co2_absorbed_kg_per_year
    ).outerjoin(TreeSpecies, TreeInventory.common_name == TreeSpecies.common_name)\
     .filter(active_clause, TreeInventory.status == 'alive')\
     .group_by(
         TreeInventory.common_name,
         TreeSpecies.scientific_name,
         TreeSpecies.co2_stored_mature_avg_kg,
         TreeSpecies.co2_absorbed_kg_per_year
     ).all()
    
    total_co2_stored = 0.0
    co2_stored_per_species = []
    
    for common_name, scientific_name, tree_count, co2_stored, co2_absorbed in carbon_by_species:
        # Use species avg CO2 stored, or estimate 500kg if unknown
        # Convert Decimal to float to avoid type errors
        species_co2_stored = (float(co2_stored) if co2_stored else 500.0) * tree_count
        species_co2_absorbed = (float(co2_absorbed) if co2_absorbed else 22.0) * tree_count  # Default ~22kg/year
        
        total_co2_stored += species_co2_stored
        
        co2_stored_per_species.append({
            "species_name": scientific_name or common_name or "Unknown",
            "common_name": common_name or "Unknown",
            "tree_count": tree_count,
            "co2_stored_kg": species_co2_stored,
            "co2_absorbed_per_year_kg": species_co2_absorbed,
            "percentage_of_total": 0  # Calculate after we have total
        })
    
    # Calculate percentages and sort
    for species_data in co2_stored_per_species:
        species_data["percentage_of_total"] = round(
            species_data["co2_stored_kg"] / total_co2_stored * 100, 2
        ) if total_co2_stored > 0 else 0
    
    co2_stored_per_species.sort(key=lambda x: x["co2_stored_kg"], reverse=True)
    
    # Convert to proper schema objects
    co2_species_list = [
        SpeciesCarbonData(
            species_name=s["species_name"],
            common_name=s["common_name"],
            tree_count=s["tree_count"],
            co2_stored_kg=s["co2_stored_kg"],
            co2_absorbed_per_year_kg=s["co2_absorbed_per_year_kg"],
            percentage_of_total=s["percentage_of_total"]
        ) for s in co2_stored_per_species
    ]
    
    # Top 5 species contribution
    top_5_contribution = sum(s.percentage_of_total for s in co2_species_list[:5])
    
    carbon_stock = CarbonStockStats(
        total_co2_stored_kg=round(total_co2_stored, 2),
        total_co2_stored_tonnes=round(total_co2_stored / 1000, 2),
        co2_stored_per_species=co2_species_list,
        top_5_species_contribution_pct=round(top_5_contribution, 1)
    )
    
    # ==================== Annual Carbon Sequestration ====================
    
    # Total CO2 absorbed per year (all alive trees)
    total_co2_absorbed = sum(s.co2_absorbed_per_year_kg for s in co2_species_list)
    
    # Trees planted this year
    trees_planted_this_year = db.query(func.count(TreeInventory.id))\
        .filter(active_clause, extract('year', TreeInventory.planted_date) == current_year)\
        .scalar() or 0
    
    # CO2 from new plantings (newly planted trees absorb less initially)
    # Estimate 30% of mature absorption rate for new trees
    new_planting_co2 = db.query(
        func.count(TreeInventory.id),
        func.avg(TreeSpecies.co2_absorbed_kg_per_year)
    ).outerjoin(TreeSpecies, TreeInventory.common_name == TreeSpecies.common_name)\
     .filter(active_clause, extract('year', TreeInventory.planted_date) == current_year)\
     .first()
    
    new_tree_count = new_planting_co2[0] or 0
    avg_absorption = float(new_planting_co2[1]) if new_planting_co2[1] else 22.0
    co2_from_new_plantings = new_tree_count * avg_absorption * 0.3  # 30% for young trees
    
    annual_sequestration = AnnualCarbonSequestrationStats(
        total_co2_absorbed_per_year_kg=round(total_co2_absorbed, 2),
        total_co2_absorbed_per_year_tonnes=round(total_co2_absorbed / 1000, 2),
        co2_absorbed_per_hectare_kg=None,  # Would need area data
        co2_from_new_plantings_kg=round(co2_from_new_plantings, 2),
        trees_planted_this_year=trees_planted_this_year
    )
    
    # ==================== Carbon Loss ====================
    
    # Trees removed this year
    trees_removed_this_year = db.query(func.count(TreeInventory.id))\
        .filter(
            active_clause,
            extract('year', TreeInventory.cutting_date) == current_year
        ).scalar() or 0
    
    # CO2 released from removals
    removed_trees_carbon = db.query(
        TreeInventory.cutting_reason,
        func.count(TreeInventory.id).label('count'),
        TreeSpecies.co2_stored_mature_avg_kg,
        TreeSpecies.burned_carbon_release_pct,
        TreeSpecies.lumber_carbon_retention_pct,
        TreeSpecies.decay_years_min,
        TreeSpecies.decay_years_max
    ).outerjoin(TreeSpecies, TreeInventory.common_name == TreeSpecies.common_name)\
     .filter(active_clause, extract('year', TreeInventory.cutting_date) == current_year)\
     .group_by(
         TreeInventory.cutting_reason,
         TreeSpecies.co2_stored_mature_avg_kg,
         TreeSpecies.burned_carbon_release_pct,
         TreeSpecies.lumber_carbon_retention_pct,
         TreeSpecies.decay_years_min,
         TreeSpecies.decay_years_max
     ).all()
    
    total_co2_released = 0.0
    projected_decay_release = 0.0
    removal_methods = {}
    
    for (cutting_reason, count, co2_stored, burned_pct, lumber_pct, 
         decay_min, decay_max) in removed_trees_carbon:
        # Convert Decimal to float to avoid type errors
        co2_per_tree = float(co2_stored) if co2_stored else 500.0
        total_tree_co2 = co2_per_tree * count
        
        # Estimate release based on disposal method
        reason = cutting_reason or "Unknown"
        if "burn" in reason.lower() or "fire" in reason.lower():
            # Burned - immediate release
            release_pct = float(burned_pct) if burned_pct else 0.95
            co2_released = total_tree_co2 * release_pct
        elif "lumber" in reason.lower() or "wood" in reason.lower():
            # Converted to lumber - partial retention
            retention_pct = float(lumber_pct) if lumber_pct else 0.5
            co2_released = total_tree_co2 * (1 - retention_pct)
        else:
            # Natural decay - gradual release
            co2_released = total_tree_co2 * 0.3  # 30% immediate, rest over decay years
            avg_decay = ((float(decay_min) if decay_min else 10) + (float(decay_max) if decay_max else 20)) / 2
            projected_decay_release += total_tree_co2 * 0.7 / avg_decay  # Annual decay release
        
        total_co2_released += co2_released
        
        # Track by method
        if reason not in removal_methods:
            removal_methods[reason] = {"count": 0, "co2_released_kg": 0}
        removal_methods[reason]["count"] += count
        removal_methods[reason]["co2_released_kg"] += co2_released
    
    carbon_loss = CarbonLossStats(
        trees_removed_this_year=trees_removed_this_year,
        co2_released_from_removals_kg=round(total_co2_released, 2),
        co2_released_from_removals_tonnes=round(total_co2_released / 1000, 2),
        projected_decay_release_kg=round(projected_decay_release, 2),
        projected_decay_release_tonnes=round(projected_decay_release / 1000, 2),
        removal_methods=[
            {"reason": k, "count": v["count"], "co2_released_kg": round(v["co2_released_kg"], 2)}
            for k, v in removal_methods.items()
        ]
    )
    
    return TreeCarbonStatistics(
        composition=composition,
        carbon_stock=carbon_stock,
        annual_sequestration=annual_sequestration,
        carbon_loss=carbon_loss,
        generated_at=datetime.now().isoformat()
    )
