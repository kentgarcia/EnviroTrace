# app/crud/crud_urban_greening.py
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, or_, and_
from sqlalchemy.future import select
from app.crud.base_crud import CRUDBase
from app.models.urban_greening_models import (
    MonitoringRequest,
    InspectionReport,
    FeeRecord,
    TreeRecord,
    SaplingRecord,
    UrbanGreeningProject
)
from app.schemas.urban_greening_schemas import (
    MonitoringRequestCreate,
    MonitoringRequestUpdate,
    InspectionReportCreate,
    InspectionReportUpdate,
    FeeRecordCreate,
    FeeRecordUpdate,
    TreeRecordCreate,
    TreeRecordUpdate,
    SaplingRecordCreate,
    SaplingRecordUpdate,
    UrbanGreeningProjectCreate,
    UrbanGreeningProjectUpdate
)

class CRUDMonitoringRequest(CRUDBase[MonitoringRequest, MonitoringRequestCreate, MonitoringRequestUpdate]):
    async def get_by_status(self, db: AsyncSession, *, status: str, skip: int = 0, limit: int = 100) -> List[MonitoringRequest]:
        result = await db.execute(
            select(self.model)
            .filter(self.model.status == status)
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.date))
        )
        return result.scalars().all()

    async def get_by_requester(self, db: AsyncSession, *, requester_name: str, skip: int = 0, limit: int = 100) -> List[MonitoringRequest]:
        result = await db.execute(
            select(self.model)
            .filter(self.model.requester_name.ilike(f"%{requester_name}%"))
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.date))
        )
        return result.scalars().all()

    async def get_by_type(self, db: AsyncSession, *, type: str, skip: int = 0, limit: int = 100) -> List[MonitoringRequest]:
        """For monitoring requests, type filtering can be based on status or other criteria"""
        result = await db.execute(
            select(self.model)
            .filter(self.model.status == type)  # Using status as type filter
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.date))
        )
        return result.scalars().all()

    async def search(self, db: AsyncSession, *, query: str, skip: int = 0, limit: int = 100) -> List[MonitoringRequest]:
        result = await db.execute(
            select(self.model)
            .filter(
                or_(
                    self.model.title.ilike(f"%{query}%"),
                    self.model.description.ilike(f"%{query}%"),
                    self.model.requester_name.ilike(f"%{query}%"),
                    self.model.address.ilike(f"%{query}%")
                )
            )
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.date))
        )
        return result.scalars().all()

class CRUDInspectionReport(CRUDBase[InspectionReport, InspectionReportCreate, InspectionReportUpdate]):
    async def get_by_report_number(self, db: AsyncSession, *, report_number: str) -> Optional[InspectionReport]:
        result = await db.execute(
            select(self.model).filter(self.model.report_number == report_number)
        )
        return result.scalars().first()

    async def get_by_status(self, db: AsyncSession, *, status: str, skip: int = 0, limit: int = 100) -> List[InspectionReport]:
        result = await db.execute(
            select(self.model)
            .filter(self.model.status == status)
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.date))
        )
        return result.scalars().all()

    async def get_by_type(self, db: AsyncSession, *, type: str, skip: int = 0, limit: int = 100) -> List[InspectionReport]:
        result = await db.execute(
            select(self.model)
            .filter(self.model.type == type)
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.date))
        )
        return result.scalars().all()

class CRUDFeeRecord(CRUDBase[FeeRecord, FeeRecordCreate, FeeRecordUpdate]):
    async def get_by_reference_number(self, db: AsyncSession, *, reference_number: str) -> Optional[FeeRecord]:
        result = await db.execute(
            select(self.model).filter(self.model.reference_number == reference_number)
        )
        return result.scalars().first()

    async def get_by_status(self, db: AsyncSession, *, status: str, skip: int = 0, limit: int = 100) -> List[FeeRecord]:
        result = await db.execute(
            select(self.model)
            .filter(self.model.status == status)
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.date))
        )
        return result.scalars().all()

    async def get_overdue_fees(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[FeeRecord]:
        from datetime import date
        result = await db.execute(
            select(self.model)
            .filter(
                and_(
                    self.model.status == "pending",
                    self.model.due_date < date.today()
                )
            )
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.due_date))
        )
        return result.scalars().all()

class CRUDTreeRecord(CRUDBase[TreeRecord, TreeRecordCreate, TreeRecordUpdate]):
    async def get_by_species(self, db: AsyncSession, *, species: str, skip: int = 0, limit: int = 100) -> List[TreeRecord]:
        result = await db.execute(
            select(self.model)
            .filter(self.model.species == species)
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.created_at))
        )
        return result.scalars().all()

    async def get_by_condition(self, db: AsyncSession, *, condition: str, skip: int = 0, limit: int = 100) -> List[TreeRecord]:
        result = await db.execute(
            select(self.model)
            .filter(self.model.condition == condition)
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.created_at))
        )
        return result.scalars().all()

    async def get_requiring_action(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[TreeRecord]:
        result = await db.execute(
            select(self.model)
            .filter(self.model.action != "none")
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.created_at))
        )
        return result.scalars().all()

class CRUDSaplingRecord(CRUDBase[SaplingRecord, SaplingRecordCreate, SaplingRecordUpdate]):
    async def get_by_species(self, db: AsyncSession, *, species: str, skip: int = 0, limit: int = 100) -> List[SaplingRecord]:
        result = await db.execute(
            select(self.model)
            .filter(self.model.species == species)
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.collection_date))
        )
        return result.scalars().all()

    async def get_by_source(self, db: AsyncSession, *, source: str, skip: int = 0, limit: int = 100) -> List[SaplingRecord]:
        result = await db.execute(
            select(self.model)
            .filter(self.model.source == source)
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.collection_date))
        )
        return result.scalars().all()

    async def get_unplanted(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[SaplingRecord]:
        result = await db.execute(
            select(self.model)
            .filter(self.model.planting_date.is_(None))
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.collection_date))
        )
        return result.scalars().all()

class CRUDUrbanGreeningProject(CRUDBase[UrbanGreeningProject, UrbanGreeningProjectCreate, UrbanGreeningProjectUpdate]):
    async def get_by_type(self, db: AsyncSession, *, type: str, skip: int = 0, limit: int = 100) -> List[UrbanGreeningProject]:
        result = await db.execute(
            select(self.model)
            .filter(self.model.type == type)
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.planting_date))
        )
        return result.scalars().all()

    async def get_by_status(self, db: AsyncSession, *, status: str, skip: int = 0, limit: int = 100) -> List[UrbanGreeningProject]:
        result = await db.execute(
            select(self.model)
            .filter(self.model.status == status)
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.planting_date))
        )
        return result.scalars().all()

    async def search_projects(
        self, 
        db: AsyncSession, 
        *, 
        query: str, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[UrbanGreeningProject]:
        result = await db.execute(
            select(self.model)
            .filter(
                or_(
                    self.model.project_name.ilike(f"%{query}%"),
                    self.model.species.ilike(f"%{query}%"),
                    self.model.location.ilike(f"%{query}%")
                )
            )
            .offset(skip)
            .limit(limit)
            .order_by(desc(self.model.planting_date))
        )
        return result.scalars().all()

# Create CRUD objects
monitoring_request = CRUDMonitoringRequest(MonitoringRequest)
inspection_report = CRUDInspectionReport(InspectionReport)
fee_record = CRUDFeeRecord(FeeRecord)
tree_record = CRUDTreeRecord(TreeRecord)
sapling_record = CRUDSaplingRecord(SaplingRecord)
urban_greening_project = CRUDUrbanGreeningProject(UrbanGreeningProject)
