from datetime import datetime
from typing import List
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, cast
from sqlalchemy.types import Date

from app.apis.deps import get_db
from app.models.urban_greening_models import (
    FeeRecord, UrbanGreeningPlanting, TreeRequest, UrbanGreeningProject
)
from app.schemas.dashboard_schemas import (
    UrbanGreeningDashboardOverview, LabelValue, MonthValue, StatCardData
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def month_labels():
    return [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]


@router.get("/urban-greening", response_model=UrbanGreeningDashboardOverview)
def get_urban_greening_dashboard(
    year: int | None = None,
    quarter: str | None = None,
    db: Session = Depends(get_db)
):
    """
    Get urban greening dashboard overview data.
    
    Args:
        year: Filter by year (defaults to current year)
        quarter: Optional filter by quarter (Q1, Q2, Q3, Q4, or "all")
        db: Database session
    
    Returns:
        Dashboard overview with charts and statistics
    """
    if year is None:
        year = datetime.now().year

    # Get months to filter based on quarter
    quarter_months = None
    if quarter and quarter != "all":
        quarter_map = {
            "Q1": [1, 2, 3],
            "Q2": [4, 5, 6],
            "Q3": [7, 8, 9],
            "Q4": [10, 11, 12]
        }
        quarter_months = quarter_map.get(quarter.upper())
    
    current_month = datetime.now().month

    project_date_expr = func.coalesce(
        UrbanGreeningProject.actual_end_date,
        UrbanGreeningProject.actual_start_date,
        UrbanGreeningProject.planting_date,
        UrbanGreeningProject.date_received,
        cast(UrbanGreeningProject.created_at, Date),
    )

    # ===== STAT CARD DATA =====
    
    # Fees - Yearly total (paid fees in selected year/quarter)
    fees_query = db.query(
        func.coalesce(func.sum(FeeRecord.amount), 0)
    ).filter(
        FeeRecord.payment_date.isnot(None),
        extract('year', FeeRecord.payment_date) == year,
        FeeRecord.status == 'paid'
    )
    if quarter_months:
        fees_query = fees_query.filter(extract('month', FeeRecord.payment_date).in_(quarter_months))
    fees_yearly_total = fees_query.scalar() or 0.0
    
    # Fees - Monthly total (paid fees in current month)
    fees_monthly_total = db.query(
        func.coalesce(func.sum(FeeRecord.amount), 0)
    ).filter(
        FeeRecord.payment_date.isnot(None),
        extract('year', FeeRecord.payment_date) == year,
        extract('month', FeeRecord.payment_date) == current_month,
        FeeRecord.status == 'paid'
    ).scalar() or 0.0
    
    # Urban Greening - Yearly total (quantity planted in selected year/quarter)
    planting_query = db.query(
        func.coalesce(func.sum(UrbanGreeningPlanting.quantity_planted), 0)
    ).filter(
        extract('year', UrbanGreeningPlanting.planting_date) == year
    )
    if quarter_months:
        planting_query = planting_query.filter(extract('month', UrbanGreeningPlanting.planting_date).in_(quarter_months))
    planting_yearly_total = planting_query.scalar() or 0

    project_query = db.query(
        func.coalesce(func.sum(UrbanGreeningProject.total_plants), 0)
    ).filter(
        extract('year', project_date_expr) == year
    )
    if quarter_months:
        project_query = project_query.filter(extract('month', project_date_expr).in_(quarter_months))
    project_yearly_total = project_query.scalar() or 0

    urban_greening_yearly_total = planting_yearly_total + project_yearly_total

    # Urban Greening - Monthly total (quantity planted in current/selected month)
    planting_monthly_total = db.query(
        func.coalesce(func.sum(UrbanGreeningPlanting.quantity_planted), 0)
    ).filter(
        extract('year', UrbanGreeningPlanting.planting_date) == year,
        extract('month', UrbanGreeningPlanting.planting_date) == current_month
    ).scalar() or 0

    project_monthly_total = db.query(
        func.coalesce(func.sum(UrbanGreeningProject.total_plants), 0)
    ).filter(
        extract('year', project_date_expr) == year,
        extract('month', project_date_expr) == current_month
    ).scalar() or 0

    urban_greening_monthly_total = planting_monthly_total + project_monthly_total
    
    stat_cards = StatCardData(
        fees_yearly_total=float(fees_yearly_total),
        fees_monthly_total=float(fees_monthly_total),
        urban_greening_yearly_total=int(urban_greening_yearly_total),
        urban_greening_monthly_total=int(urban_greening_monthly_total),
    )

    # ===== CHART DATA =====
    
    # Monthly fees (paid amount by payment_date in current year/quarter)
    fee_query = db.query(
        extract('month', FeeRecord.payment_date).label('m'),
        func.coalesce(func.sum(FeeRecord.amount), 0)
    ).filter(
        FeeRecord.payment_date.isnot(None),
        extract('year', FeeRecord.payment_date) == year,
        FeeRecord.status == 'paid'
    )
    
    if quarter_months:
        fee_query = fee_query.filter(extract('month', FeeRecord.payment_date).in_(quarter_months))
    
    fee_rows = fee_query.group_by(extract('month', FeeRecord.payment_date)).all()

    fee_by_month = {int(m): float(total) for m, total in fee_rows}
    fee_monthly: List[MonthValue] = []
    months_to_show = quarter_months if quarter_months else range(1, 13)
    for i in months_to_show:
        label = month_labels()[i - 1]
        fee_monthly.append(MonthValue(month=i, label=label, total=fee_by_month.get(i, 0.0)))

    # Planting type breakdown (current year/quarter) - sum quantities instead of count
    type_query = db.query(
        UrbanGreeningPlanting.planting_type,
        func.coalesce(func.sum(UrbanGreeningPlanting.quantity_planted), 0)
    ).filter(extract('year', UrbanGreeningPlanting.planting_date) == year)

    if quarter_months:
        type_query = type_query.filter(extract('month', UrbanGreeningPlanting.planting_date).in_(quarter_months))

    type_rows = type_query.group_by(UrbanGreeningPlanting.planting_type).all()

    planting_type_totals: dict[str, float] = {}
    for planting_type, quantity in type_rows:
        if not planting_type:
            continue
        planting_type_totals[planting_type] = planting_type_totals.get(planting_type, 0.0) + float(quantity or 0)

    # Species bar: top 12 by total quantity (excluding trees - Flora only)
    species_query = db.query(
        UrbanGreeningPlanting.species_name,
        func.coalesce(func.sum(UrbanGreeningPlanting.quantity_planted), 0)
    ).filter(
        extract('year', UrbanGreeningPlanting.planting_date) == year,
        UrbanGreeningPlanting.planting_type != 'trees'
    )

    if quarter_months:
        species_query = species_query.filter(extract('month', UrbanGreeningPlanting.planting_date).in_(quarter_months))

    species_rows = (
        species_query
        .group_by(UrbanGreeningPlanting.species_name)
        .order_by(func.coalesce(func.sum(UrbanGreeningPlanting.quantity_planted), 0).desc())
        .all()
    )

    species_totals: dict[str, float] = {}
    for species_name, quantity in species_rows:
        if not species_name:
            continue
        species_totals[species_name] = species_totals.get(species_name, 0.0) + float(quantity or 0)

    # Include Urban Greening Project flora (plants stored as JSON)
    project_plants_query = db.query(UrbanGreeningProject.plants).filter(
        extract('year', project_date_expr) == year
    )

    if quarter_months:
        project_plants_query = project_plants_query.filter(extract('month', project_date_expr).in_(quarter_months))

    project_plants_rows = project_plants_query.all()

    for (plants_json,) in project_plants_rows:
        if not plants_json:
            continue
        try:
            plants_payload = json.loads(plants_json) if isinstance(plants_json, str) else plants_json
        except Exception:
            continue
        if not isinstance(plants_payload, list):
            continue
        for item in plants_payload:
            if not isinstance(item, dict):
                continue
            plant_type = (item.get('plant_type') or item.get('type') or 'unknown').strip()
            quantity = item.get('quantity') or item.get('qty') or 0
            try:
                quantity_value = float(quantity)
            except (TypeError, ValueError):
                quantity_value = 0.0
            if quantity_value <= 0:
                continue
            if plant_type:
                planting_type_totals[plant_type] = planting_type_totals.get(plant_type, 0.0) + quantity_value
            species_label = item.get('common_name') or item.get('species') or item.get('name')
            if species_label:
                key = species_label.strip()
                if key:
                    species_totals[key] = species_totals.get(key, 0.0) + quantity_value

    planting_type_data = [
        LabelValue(
            id=plant_type,
            label=plant_type.replace('_', ' ').title() if plant_type else 'Unknown',
            value=float(total)
        )
        for plant_type, total in planting_type_totals.items()
        if total > 0
    ]
    planting_type_data.sort(key=lambda item: item.value, reverse=True)

    species_data = [
        LabelValue(id=species, label=species, value=float(total))
        for species, total in species_totals.items()
        if total > 0
    ]
    species_data.sort(key=lambda item: item.value, reverse=True)
    species_data = species_data[:12]
    
    # No sapling species data (feature removed)
    sapling_species_data: List[LabelValue] = []

    # Tree request counts by type and status (current year/quarter)
    type_query = db.query(
        TreeRequest.request_type, 
        func.count(TreeRequest.id)
    ).filter(extract('year', TreeRequest.created_at) == year)
    
    if quarter_months:
        type_query = type_query.filter(extract('month', TreeRequest.created_at).in_(quarter_months))
    
    type_counts = type_query.group_by(TreeRequest.request_type).all()
    tree_request_type_counts = [
        LabelValue(id=t, label=t.replace('_', ' ').title(), value=float(c)) for t, c in type_counts
    ]

    status_query = db.query(
        TreeRequest.overall_status, 
        func.count(TreeRequest.id)
    ).filter(extract('year', TreeRequest.created_at) == year)
    
    if quarter_months:
        status_query = status_query.filter(extract('month', TreeRequest.created_at).in_(quarter_months))
    
    status_counts = status_query.group_by(TreeRequest.overall_status).all()
    tree_request_status_counts = [
        LabelValue(id=s, label=s.replace('_', ' ').title(), value=float(c)) for s, c in status_counts
    ]

    # Trees to be cut/prune bar: Not available in new schema yet, return empty
    tree_types_bar = []

    # Recent Activity monthly totals for current year/quarter (UG plantings and projects)
    ug_query = db.query(
        extract('month', UrbanGreeningPlanting.planting_date).label('m'),
        func.coalesce(func.sum(UrbanGreeningPlanting.quantity_planted), 0)
    ).filter(extract('year', UrbanGreeningPlanting.planting_date) == year)
    
    if quarter_months:
        ug_query = ug_query.filter(extract('month', UrbanGreeningPlanting.planting_date).in_(quarter_months))
    
    ug_rows = ug_query.group_by(extract('month', UrbanGreeningPlanting.planting_date)).all()
    ug_by_month = {int(m): float(total) for m, total in ug_rows if m is not None}

    project_ug_query = db.query(
        extract('month', project_date_expr).label('m'),
        func.coalesce(func.sum(UrbanGreeningProject.total_plants), 0)
    ).filter(extract('year', project_date_expr) == year)
    
    if quarter_months:
        project_ug_query = project_ug_query.filter(extract('month', project_date_expr).in_(quarter_months))
    
    project_ug_rows = project_ug_query.group_by(extract('month', project_date_expr)).all()

    for m, total in project_ug_rows:
        if m is None:
            continue
        month_index = int(m)
        ug_by_month[month_index] = ug_by_month.get(month_index, 0.0) + float(total or 0)
    
    ug_monthly: List[MonthValue] = []
    for i in months_to_show:
        label = month_labels()[i - 1]
        ug_monthly.append(MonthValue(month=i, label=label, total=ug_by_month.get(i, 0.0)))

    return UrbanGreeningDashboardOverview(
        stat_cards=stat_cards,
        planting_type_data=planting_type_data,
        species_data=species_data,
        sapling_species_data=sapling_species_data,
        fee_monthly=fee_monthly,
        tree_request_type_counts=tree_request_type_counts,
        tree_request_status_counts=tree_request_status_counts,
        tree_types_bar=tree_types_bar,
        ug_monthly=ug_monthly,
    )
