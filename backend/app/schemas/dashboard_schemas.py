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


class StatCardData(BaseModel):
    """Statistics for dashboard stat cards"""
    # Fees
    fees_yearly_total: float
    fees_monthly_total: float
    
    # Sapling Requests
    sapling_requests_yearly_total: int
    sapling_requests_monthly_total: int
    
    # Urban Greening Plantings
    urban_greening_yearly_total: int
    urban_greening_monthly_total: int


class UrbanGreeningDashboardOverview(BaseModel):
    # Stat cards data
    stat_cards: StatCardData
    
    # Chart data
    planting_type_data: List[LabelValue]
    species_data: List[LabelValue]
    sapling_species_data: List[LabelValue]
    fee_monthly: List[MonthValue]

    tree_request_type_counts: List[LabelValue]
    tree_request_status_counts: List[LabelValue]
    tree_types_bar: List[LabelValue]

    ug_monthly: List[MonthValue]
    saplings_monthly: List[MonthValue]
