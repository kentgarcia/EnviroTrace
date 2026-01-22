from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.apis.deps import get_db
from app.models.urban_greening_models import (
    FeeRecord, UrbanGreeningPlanting, SaplingRequest, TreeRequest
)
from app.schemas.dashboard_schemas import UrbanGreeningDashboardOverview, LabelValue, MonthValue

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def month_labels():
    return [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]


@router.get("/urban-greening", response_model=UrbanGreeningDashboardOverview)
def get_urban_greening_dashboard(
    year: int | None = None,
    month: int | None = None,
    db: Session = Depends(get_db)
):
    """
    Get urban greening dashboard overview data.
    
    Args:
        year: Filter by year (defaults to current year)
        month: Optional filter by specific month (1-12)
        db: Database session
    
    Returns:
        Dashboard overview with charts and statistics
    """
    if year is None:
        year = datetime.now().year

    # Monthly fees (paid amount by payment_date in current year)
    fee_query = db.query(
        extract('month', FeeRecord.payment_date).label('m'),
        func.coalesce(func.sum(FeeRecord.amount), 0)
    ).filter(
        FeeRecord.payment_date.isnot(None),
        extract('year', FeeRecord.payment_date) == year,
        FeeRecord.status == 'paid'
    )
    
    if month is not None:
        fee_query = fee_query.filter(extract('month', FeeRecord.payment_date) == month)
    
    fee_rows = fee_query.group_by(extract('month', FeeRecord.payment_date)).all()

    fee_by_month = {int(m): float(total) for m, total in fee_rows}
    fee_monthly: List[MonthValue] = []
    for i, label in enumerate(month_labels(), start=1):
        fee_monthly.append(MonthValue(month=i, label=label, total=fee_by_month.get(i, 0.0)))

    # Planting type breakdown (current year) - sum quantities instead of count
    type_query = db.query(
        UrbanGreeningPlanting.planting_type,
        func.coalesce(func.sum(UrbanGreeningPlanting.quantity_planted), 0)
    ).filter(extract('year', UrbanGreeningPlanting.planting_date) == year)
    
    if month is not None:
        type_query = type_query.filter(extract('month', UrbanGreeningPlanting.planting_date) == month)
    
    type_rows = type_query.group_by(UrbanGreeningPlanting.planting_type).all()
    planting_type_data = [
        LabelValue(id=t, label=t.replace('_', ' ').title(), value=float(c)) for t, c in type_rows
    ]

    # Species bar: top 12 by total quantity
    species_query = db.query(
        UrbanGreeningPlanting.species_name,
        func.coalesce(func.sum(UrbanGreeningPlanting.quantity_planted), 0)
    ).filter(extract('year', UrbanGreeningPlanting.planting_date) == year)
    
    if month is not None:
        species_query = species_query.filter(extract('month', UrbanGreeningPlanting.planting_date) == month)
    
    species_rows = (
        species_query
        .group_by(UrbanGreeningPlanting.species_name)
        .order_by(func.coalesce(func.sum(UrbanGreeningPlanting.quantity_planted), 0).desc())
        .limit(12)
        .all()
    )
    species_data = [LabelValue(id=s, label=s, value=float(q)) for s, q in species_rows]

    # Tree request counts by type and status (current year)
    type_query = db.query(
        TreeRequest.request_type, 
        func.count(TreeRequest.id)
    ).filter(extract('year', TreeRequest.created_at) == year)
    
    if month is not None:
        type_query = type_query.filter(extract('month', TreeRequest.created_at) == month)
    
    type_counts = type_query.group_by(TreeRequest.request_type).all()
    tree_request_type_counts = [
        LabelValue(id=t, label=t.replace('_', ' ').title(), value=float(c)) for t, c in type_counts
    ]

    status_query = db.query(
        TreeRequest.overall_status, 
        func.count(TreeRequest.id)
    ).filter(extract('year', TreeRequest.created_at) == year)
    
    if month is not None:
        status_query = status_query.filter(extract('month', TreeRequest.created_at) == month)
    
    status_counts = status_query.group_by(TreeRequest.overall_status).all()
    tree_request_status_counts = [
        LabelValue(id=s, label=s.replace('_', ' ').title(), value=float(c)) for s, c in status_counts
    ]

    # Trees to be cut/prune bar: Not available in new schema yet, return empty
    tree_types_bar = []

    # Recent Activity monthly totals for current year (UG plantings and sapling requests)
    ug_rows = (
        db.query(
            extract('month', UrbanGreeningPlanting.planting_date).label('m'),
            func.coalesce(func.sum(UrbanGreeningPlanting.quantity_planted), 0)
        )
        .filter(extract('year', UrbanGreeningPlanting.planting_date) == year)
        .group_by(extract('month', UrbanGreeningPlanting.planting_date))
        .all()
    )
    ug_by_month = {int(m): float(total) for m, total in ug_rows}
    ug_monthly: List[MonthValue] = []
    for i, label in enumerate(month_labels(), start=1):
        ug_monthly.append(MonthValue(month=i, label=label, total=ug_by_month.get(i, 0.0)))

    # Sapling Requests (Demand) instead of Collection (Supply)
    sap_rows = (
        db.query(
            extract('month', SaplingRequest.date_received).label('m'),
            func.coalesce(func.sum(SaplingRequest.total_qty), 0)
        )
        .filter(extract('year', SaplingRequest.date_received) == year)
        .group_by(extract('month', SaplingRequest.date_received))
        .all()
    )
    sap_by_month = {int(m): float(total) for m, total in sap_rows}
    saplings_monthly: List[MonthValue] = []
    for i, label in enumerate(month_labels(), start=1):
        saplings_monthly.append(MonthValue(month=i, label=label, total=sap_by_month.get(i, 0.0)))

    return UrbanGreeningDashboardOverview(
        planting_type_data=planting_type_data,
        species_data=species_data,
        fee_monthly=fee_monthly,
        tree_request_type_counts=tree_request_type_counts,
        tree_request_status_counts=tree_request_status_counts,
        tree_types_bar=tree_types_bar,
        ug_monthly=ug_monthly,
        saplings_monthly=saplings_monthly,
    )
