from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.crud.base_crud import CRUDBase
from app.models.emission_models import VehicleRemarks
from app.schemas.emission_schemas import VehicleRemarksCreate, VehicleRemarksUpdate


class CRUDVehicleRemarks(CRUDBase[VehicleRemarks, VehicleRemarksCreate, VehicleRemarksUpdate]):
    async def get_by_vehicle_and_year(
        self, db: AsyncSession, vehicle_id: UUID, year: int
    ) -> Optional[VehicleRemarks]:
        """Get vehicle remarks by vehicle ID and year."""
        result = await db.execute(
            select(VehicleRemarks).where(
                and_(
                    VehicleRemarks.vehicle_id == vehicle_id,
                    VehicleRemarks.year == year
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_by_vehicle(
        self, db: AsyncSession, vehicle_id: UUID
    ) -> List[VehicleRemarks]:
        """Get all remarks for a vehicle across all years."""
        result = await db.execute(
            select(VehicleRemarks)
            .where(VehicleRemarks.vehicle_id == vehicle_id)
            .order_by(VehicleRemarks.year.desc())
        )
        return result.scalars().all()
    
    async def get_by_year(
        self, db: AsyncSession, year: int
    ) -> List[VehicleRemarks]:
        """Get all vehicle remarks for a specific year."""
        result = await db.execute(
            select(VehicleRemarks)
            .where(VehicleRemarks.year == year)
            .order_by(VehicleRemarks.updated_at.desc())
        )
        return result.scalars().all()
    
    async def create_or_update(
        self, 
        db: AsyncSession, 
        obj_in: VehicleRemarksCreate,
        created_by: Optional[UUID] = None
    ) -> VehicleRemarks:
        """Create new remarks or update existing ones for a vehicle/year combination."""
        existing = await self.get_by_vehicle_and_year(
            db, obj_in.vehicle_id, obj_in.year
        )
        
        if existing:
            # Update existing remarks
            update_data = obj_in.model_dump(exclude_unset=True)
            return await self.update(db, db_obj=existing, obj_in=update_data)
        else:
            # Create new remarks
            create_data = obj_in.model_dump()
            if created_by:
                create_data["created_by"] = created_by
            return await self.create(db, obj_in=create_data)


vehicle_remarks = CRUDVehicleRemarks(VehicleRemarks)
