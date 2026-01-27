from typing import List
from pydantic import BaseModel


class LabelValue(BaseModel):
    id: str
    label: str
    value: float


class MonthValue(BaseModel):
    month: int
    label: str
    total: float


class UrbanGreeningDashboardOverview(BaseModel):
    planting_type_data: List[LabelValue]
    species_data: List[LabelValue]
    sapling_species_data: List[LabelValue]
    fee_monthly: List[MonthValue]

    tree_request_type_counts: List[LabelValue]
    tree_request_status_counts: List[LabelValue]
    tree_types_bar: List[LabelValue]

    ug_monthly: List[MonthValue]
    saplings_monthly: List[MonthValue]
