from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from app.apis.deps import get_db
from app.crud.crud_planting import urban_greening_planting_crud, sapling_collection_crud
from app.schemas.planting_schemas import (
    UrbanGreeningPlantingCreate, UrbanGreeningPlantingUpdate, UrbanGreeningPlantingInDB,
    SaplingCollectionCreate, SaplingCollectionUpdate, SaplingCollectionInDB,
    PlantingStatistics, SaplingStatistics
)

router = APIRouter()

# Urban Greening Planting Endpoints
@router.get("/urban-greening/", response_model=List[UrbanGreeningPlantingInDB])
def get_urban_greening_plantings(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    planting_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all urban greening planting records with optional filters"""
    if search or planting_type or status:
        return urban_greening_planting_crud.search(
            db, 
            search_term=search or "",
            planting_type=planting_type,
            status=status,
            skip=skip, 
            limit=limit
        )
    return urban_greening_planting_crud.get_multi(db, skip=skip, limit=limit)

@router.post("/urban-greening/", response_model=UrbanGreeningPlantingInDB)
def create_urban_greening_planting(
    planting_data: UrbanGreeningPlantingCreate,
    db: Session = Depends(get_db)
):
    """Create a new urban greening planting record"""
    # Generate unique record number
    from datetime import datetime
    import random
    
    current_date = datetime.now()
    record_number = f"UG-{current_date.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    
    # Check if record number already exists and regenerate if needed
    while urban_greening_planting_crud.get_by_record_number(db, record_number=record_number):
        record_number = f"UG-{current_date.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    
    # Create the record with generated number
    planting_dict = planting_data.model_dump()
    planting_dict["record_number"] = record_number
    
    # Create a new Pydantic object with the record number
    create_data = UrbanGreeningPlantingCreate(**planting_dict)
    
    return urban_greening_planting_crud.create(db, obj_in=create_data)

@router.get("/urban-greening/{planting_id}", response_model=UrbanGreeningPlantingInDB)
def get_urban_greening_planting(
    planting_id: UUID,
    db: Session = Depends(get_db)
):
    """Get a specific urban greening planting record"""
    planting = urban_greening_planting_crud.get(db, id=planting_id)
    if not planting:
        raise HTTPException(status_code=404, detail="Urban greening planting record not found")
    return planting

@router.put("/urban-greening/{planting_id}", response_model=UrbanGreeningPlantingInDB)
def update_urban_greening_planting(
    planting_id: UUID,
    planting_data: UrbanGreeningPlantingUpdate,
    db: Session = Depends(get_db)
):
    """Update an urban greening planting record"""
    planting = urban_greening_planting_crud.get(db, id=planting_id)
    if not planting:
        raise HTTPException(status_code=404, detail="Urban greening planting record not found")
    
    return urban_greening_planting_crud.update(db, db_obj=planting, obj_in=planting_data)

@router.delete("/urban-greening/{planting_id}")
def delete_urban_greening_planting(
    planting_id: UUID,
    db: Session = Depends(get_db)
):
    """Delete an urban greening planting record"""
    planting = urban_greening_planting_crud.get(db, id=planting_id)
    if not planting:
        raise HTTPException(status_code=404, detail="Urban greening planting record not found")
    
    urban_greening_planting_crud.remove(db, id=planting_id)
    return {"message": "Urban greening planting record deleted successfully"}

@router.get("/urban-greening/by-type/{planting_type}", response_model=List[UrbanGreeningPlantingInDB])
def get_plantings_by_type(
    planting_type: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get urban greening plantings by type"""
    return urban_greening_planting_crud.get_by_type(db, planting_type=planting_type, skip=skip, limit=limit)

@router.get("/urban-greening/statistics/", response_model=PlantingStatistics)
def get_urban_greening_statistics(db: Session = Depends(get_db)):
    """Get urban greening planting statistics"""
    return urban_greening_planting_crud.get_statistics(db)

# Sapling Collection Endpoints
@router.get("/saplings/", response_model=List[SaplingCollectionInDB])
def get_sapling_collections(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    purpose: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all sapling collection records with optional filters"""
    if search or purpose or status:
        return sapling_collection_crud.search(
            db,
            search_term=search or "",
            purpose=purpose,
            status=status,
            skip=skip,
            limit=limit
        )
    return sapling_collection_crud.get_multi(db, skip=skip, limit=limit)

@router.post("/saplings/", response_model=SaplingCollectionInDB)
def create_sapling_collection(
    collection_data: SaplingCollectionCreate,
    db: Session = Depends(get_db)
):
    """Create a new sapling collection record"""
    # Generate unique collection number
    from datetime import datetime
    import random
    
    current_date = datetime.now()
    collection_number = f"SC-{current_date.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    
    # Check if collection number already exists and regenerate if needed
    while sapling_collection_crud.get_by_collection_number(db, collection_number=collection_number):
        collection_number = f"SC-{current_date.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    
    # Create the record with generated number
    collection_dict = collection_data.model_dump()
    collection_dict["collection_number"] = collection_number
    
    # Create a new Pydantic object with the collection number
    create_data = SaplingCollectionCreate(**collection_dict)
    
    return sapling_collection_crud.create(db, obj_in=create_data)

@router.get("/saplings/{collection_id}", response_model=SaplingCollectionInDB)
def get_sapling_collection(
    collection_id: UUID,
    db: Session = Depends(get_db)
):
    """Get a specific sapling collection record"""
    collection = sapling_collection_crud.get(db, id=collection_id)
    if not collection:
        raise HTTPException(status_code=404, detail="Sapling collection record not found")
    return collection

@router.put("/saplings/{collection_id}", response_model=SaplingCollectionInDB)
def update_sapling_collection(
    collection_id: UUID,
    collection_data: SaplingCollectionUpdate,
    db: Session = Depends(get_db)
):
    """Update a sapling collection record"""
    collection = sapling_collection_crud.get(db, id=collection_id)
    if not collection:
        raise HTTPException(status_code=404, detail="Sapling collection record not found")
    
    return sapling_collection_crud.update(db, db_obj=collection, obj_in=collection_data)

@router.delete("/saplings/{collection_id}")
def delete_sapling_collection(
    collection_id: UUID,
    db: Session = Depends(get_db)
):
    """Delete a sapling collection record"""
    collection = sapling_collection_crud.get(db, id=collection_id)
    if not collection:
        raise HTTPException(status_code=404, detail="Sapling collection record not found")
    
    sapling_collection_crud.remove(db, id=collection_id)
    return {"message": "Sapling collection record deleted successfully"}

@router.get("/saplings/by-species/{species_name}", response_model=List[SaplingCollectionInDB])
def get_collections_by_species(
    species_name: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get sapling collections by species name"""
    return sapling_collection_crud.get_by_species(db, species_name=species_name, skip=skip, limit=limit)

@router.get("/saplings/statistics/", response_model=SaplingStatistics)
def get_sapling_statistics(db: Session = Depends(get_db)):
    """Get sapling collection statistics"""
    return sapling_collection_crud.get_statistics(db)
