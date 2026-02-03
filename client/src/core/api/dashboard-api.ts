import apiClient from "./api-client";

export interface LabelValue {
  id: string;
  label: string;
  value: number;
}
export interface MonthValue {
  month: number;
  label: string;
  total: number;
}

export interface StatCardData {
  fees_yearly_total: number;
  fees_monthly_total: number;
  urban_greening_yearly_total: number;
  urban_greening_monthly_total: number;
}

export interface UrbanGreeningDashboardOverview {
  stat_cards: StatCardData;
  planting_type_data: LabelValue[];
  species_data: LabelValue[];
  sapling_species_data: LabelValue[];
  fee_monthly: MonthValue[];
  tree_request_type_counts: LabelValue[];
  tree_request_status_counts: LabelValue[];
  tree_types_bar: LabelValue[];
  ug_monthly: MonthValue[];
}

export const fetchUrbanGreeningDashboard = async (
  year?: number,
  quarter?: string
): Promise<UrbanGreeningDashboardOverview> => {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());
  if (quarter && quarter !== "all") params.append("quarter", quarter);
  
  const { data } = await apiClient.get(
    `/dashboard/urban-greening${params.toString() ? `?${params.toString()}` : ""}`
  );
  return data;
};
