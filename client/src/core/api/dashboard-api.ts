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

export interface UrbanGreeningDashboardOverview {
  planting_type_data: LabelValue[];
  species_data: LabelValue[];
  sapling_species_data: LabelValue[];
  fee_monthly: MonthValue[];
  tree_request_type_counts: LabelValue[];
  tree_request_status_counts: LabelValue[];
  tree_types_bar: LabelValue[];
  ug_monthly: MonthValue[];
  saplings_monthly: MonthValue[];
}

export const fetchUrbanGreeningDashboard =
  async (): Promise<UrbanGreeningDashboardOverview> => {
    const { data } = await apiClient.get("/dashboard/urban-greening");
    return data;
  };
