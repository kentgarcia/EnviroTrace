from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.apis.deps import get_db
from app.models.urban_greening_models import (
    FeeRecord, UrbanGreeningPlanting, SaplingCollection, TreeManagementRequest
)
from app.schemas.dashboard_schemas import UrbanGreeningDashboardOverview, LabelValue, MonthValue

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def month_labels():
    return [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]


@router.get("/urban-greening", response_model=UrbanGreeningDashboardOverview)
def get_urban_greening_dashboard(db: Session = Depends(get_db)):
    year = datetime.now().year

    # Monthly fees (paid amount by payment_date in current year)
    fee_rows = (
        db.query(
            extract('month', FeeRecord.payment_date).label('m'),
            func.coalesce(func.sum(FeeRecord.amount), 0)
        )
        .filter(
            FeeRecord.payment_date.isnot(None),
            extract('year', FeeRecord.payment_date) == year,
            FeeRecord.status == 'paid'
        )
        .group_by(extract('month', FeeRecord.payment_date))
        .all()
    )

    fee_by_month = {int(m): float(total) for m, total in fee_rows}
    fee_monthly: List[MonthValue] = []
    for i, label in enumerate(month_labels(), start=1):
        fee_monthly.append(MonthValue(month=i, label=label, total=fee_by_month.get(i, 0.0)))

    # Planting type breakdown (current year)
    type_rows = (
        db.query(
            UrbanGreeningPlanting.planting_type,
            func.count(UrbanGreeningPlanting.id)
        )
        .filter(extract('year', UrbanGreeningPlanting.planting_date) == year)
        .group_by(UrbanGreeningPlanting.planting_type)
        .all()
    )
    planting_type_data = [
        LabelValue(id=t, label=t.replace('_', ' ').title(), value=float(c)) for t, c in type_rows
    ]

    # Species bar: top 12 by total quantity
    species_rows = (
        db.query(
            UrbanGreeningPlanting.species_name,
            func.coalesce(func.sum(UrbanGreeningPlanting.quantity_planted), 0)
        )
        .filter(extract('year', UrbanGreeningPlanting.planting_date) == year)
        .group_by(UrbanGreeningPlanting.species_name)
        .order_by(func.coalesce(func.sum(UrbanGreeningPlanting.quantity_planted), 0).desc())
        .limit(12)
        .all()
    )
    species_data = [LabelValue(id=s, label=s, value=float(q)) for s, q in species_rows]

    # Tree request counts by type and status (current year)
    type_counts = (
        db.query(TreeManagementRequest.request_type, func.count(TreeManagementRequest.id))
        .filter(extract('year', TreeManagementRequest.request_date) == year)
        .group_by(TreeManagementRequest.request_type)
        .all()
    )
    tree_request_type_counts = [
        LabelValue(id=t, label=t.replace('_', ' ').title(), value=float(c)) for t, c in type_counts
    ]

    status_counts = (
        db.query(TreeManagementRequest.status, func.count(TreeManagementRequest.id))
        .filter(extract('year', TreeManagementRequest.request_date) == year)
        .group_by(TreeManagementRequest.status)
        .all()
    )
    tree_request_status_counts = [
        LabelValue(id=s, label=s.replace('_', ' ').title(), value=float(c)) for s, c in status_counts
    ]

    # Trees to be cut/prune bar: parse trees_and_quantities text best-effort and aggregate top 10
    all_trees_text = (
        db.query(TreeManagementRequest.trees_and_quantities)
        .filter(TreeManagementRequest.trees_and_quantities.isnot(None))
        .filter(extract('year', TreeManagementRequest.request_date) == year)
        .all()
    )
    counts: dict[str, int] = {}
    for (txt,) in all_trees_text:
        try:
            # Expect a JSON array of strings like "Narrah: 3"; but handle plain text with commas
            import json, re
            arr = json.loads(txt)
            if isinstance(arr, list):
                for raw in arr:
                    s = str(raw)
                    m = re.search(r"([A-Za-z\s]+)[^0-9]*([0-9]+)", s)
                    if m:
                        name = m.group(1).strip()
                        qty = int(m.group(2))
                        counts[name] = counts.get(name, 0) + qty
                    else:
                        name = s.strip()
                        counts[name] = counts.get(name, 0) + 1
        except Exception:
            continue
    tree_types_bar = [LabelValue(id=k, label=k, value=float(v)) for k, v in counts.items()]
    tree_types_bar.sort(key=lambda x: x.value, reverse=True)
    tree_types_bar = tree_types_bar[:10]

    # Recent Activity monthly totals for current year (UG plantings and sapling collections)
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

    sap_rows = (
        db.query(
            extract('month', SaplingCollection.collection_date).label('m'),
            func.coalesce(func.sum(SaplingCollection.quantity_collected), 0)
        )
        .filter(extract('year', SaplingCollection.collection_date) == year)
        .group_by(extract('month', SaplingCollection.collection_date))
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
