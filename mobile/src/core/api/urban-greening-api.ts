import apiClient from "./api-client";
import { queueableRequest } from "../queue/offlineQueue";

// Urban Greening Plantings
export interface UrbanGreeningPlanting {
  id: string;
  planting_type: string;
  species: string;
  quantity_planted: number;
  location: string;
  planting_date: string;
  fee_record_id?: string | null;
  monitoring_request_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlantingStatistics {
  total_plantings: number;
  total_quantity: number;
  by_type: Record<string, number>;
  by_species: Record<string, number>;
  recent_plantings: UrbanGreeningPlanting[];
}

// Fee Records
export interface UrbanGreeningFeeRecord {
  id: string;
  fee_type: string;
  amount: number;
  payment_date: string;
  payment_method?: string | null;
  payer_name: string;
  payer_contact?: string | null;
  reference_number?: string | null;
  tree_request_id?: string | null;
  monitoring_request_id?: string | null;
  planting_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// Dashboard Overview (aggregated data from backend)
export interface DashboardOverview {
  planting_type_data: Array<{ label: string; value: number }>;
  species_data: Array<{ label: string; value: number }>;
  fee_monthly: Array<{ month: string; amount: number }>;
  tree_request_type_counts: Array<{ label: string; value: number }>;
  tree_request_status_counts: Array<{ label: string; value: number }>;
  tree_types_bar: Array<{ label: string; value: number }>;
  ug_monthly: Array<{ month: number; label: string; total: number }>;
}

class UrbanGreeningAPI {
  // Plantings
  async getPlantings(params?: {
    skip?: number;
    limit?: number;
    planting_type?: string;
  }): Promise<UrbanGreeningPlanting[]> {
    const response = await apiClient.get("/planting/urban-greening/", {
      params: params || {},
    });
    return response.data;
  }

  async getPlantingStatistics(): Promise<PlantingStatistics> {
    const response = await apiClient.get("/planting/urban-greening/statistics/");
    return response.data;
  }

  async createPlanting(data: Partial<UrbanGreeningPlanting>): Promise<UrbanGreeningPlanting> {
    return queueableRequest<UrbanGreeningPlanting>({
      role: "urban_greening",
      action: "urban_greening.planting.create",
      method: "POST",
      endpoint: "/planting/urban-greening/",
      payload: data,
      send: async () => {
        const response = await apiClient.post("/planting/urban-greening/", data);
        return response.data;
      },
    });
  }

  // Fee Records
  async getFeeRecords(params?: {
    skip?: number;
    limit?: number;
    year?: number;
    month?: number;
  }): Promise<UrbanGreeningFeeRecord[]> {
    const response = await apiClient.get("/fees/urban-greening", {
      params: params || {},
    });
    return response.data;
  }

  async getFeeRecordsByDate(startDate: string, endDate: string): Promise<UrbanGreeningFeeRecord[]> {
    const response = await apiClient.get("/fees/urban-greening/by-date-range", {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  }

  async createFeeRecord(data: Partial<UrbanGreeningFeeRecord>): Promise<UrbanGreeningFeeRecord> {
    return queueableRequest<UrbanGreeningFeeRecord>({
      role: "urban_greening",
      action: "urban_greening.fee.create",
      method: "POST",
      endpoint: "/fees/urban-greening",
      payload: data,
      send: async () => {
        const response = await apiClient.post("/fees/urban-greening", data);
        return response.data;
      },
    });
  }

  // Dashboard Overview (if backend provides aggregated endpoint)
  async getDashboardOverview(params?: {
    year?: number;
    month?: number;
  }): Promise<DashboardOverview> {
    try {
      const response = await apiClient.get("/dashboard/urban-greening", {
        params: params || {},
      });
      return response.data;
    } catch (error) {
      // Fallback: aggregate data client-side if endpoint doesn't exist yet
      console.warn("Dashboard endpoint not available, aggregating client-side");
      return this.aggregateDashboardData(params?.year);
    }
  }

  // Client-side aggregation fallback
  private async aggregateDashboardData(year?: number): Promise<DashboardOverview> {
    const currentYear = year ?? new Date().getFullYear();

    // Fetch all required data in parallel
    const [plantings, saplings, fees] = await Promise.all([
      this.getPlantings({ limit: 1000 }),
      this.getSaplingRequests({ limit: 1000 }),
      this.getFeeRecords({ limit: 1000, year: currentYear }),
    ]);

    // Aggregate planting types
    const plantingTypeCounts: Record<string, number> = {};
    const speciesCounts: Record<string, number> = {};
    plantings.forEach((p) => {
      plantingTypeCounts[p.planting_type] = (plantingTypeCounts[p.planting_type] || 0) + p.quantity_planted;
      speciesCounts[p.species] = (speciesCounts[p.species] || 0) + p.quantity_planted;
    });

    const planting_type_data = Object.entries(plantingTypeCounts).map(([label, value]) => ({
      label,
      value,
    }));

    const species_data = Object.entries(speciesCounts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12); // Top 12 species

    // Aggregate fees by month
    const feesByMonth: Record<string, number> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    fees.forEach((f) => {
      const date = new Date(f.payment_date);
      const month = monthNames[date.getMonth()];
      feesByMonth[month] = (feesByMonth[month] || 0) + f.amount;
    });

    const fee_monthly = monthNames.map((month) => ({
      month,
      amount: feesByMonth[month] || 0,
    }));

    // Aggregate UG and saplings by month
    const ugMonthly: Record<number, number> = {};
    const saplingsMonthly: Record<number, number> = {};

    plantings.forEach((p) => {
      const date = new Date(p.planting_date);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth() + 1;
        ugMonthly[month] = (ugMonthly[month] || 0) + p.quantity_planted;
      }
    });

    saplings.forEach((s) => {
      const date = new Date(s.collection_date || s.date_received);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth() + 1;
        saplingsMonthly[month] = (saplingsMonthly[month] || 0) + (s.quantity_collected || 0);
      }
    });

    const ug_monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      label: monthNames[i],
      total: ugMonthly[i + 1] || 0,
    }));

    const saplings_monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      label: monthNames[i],
      total: saplingsMonthly[i + 1] || 0,
    }));

    // Placeholder for tree request data (would need tree management API)
    const tree_request_type_counts: Array<{ label: string; value: number }> = [];
    const tree_request_status_counts: Array<{ label: string; value: number }> = [];
    const tree_types_bar: Array<{ label: string; value: number }> = [];

    return {
      planting_type_data,
      species_data,
      fee_monthly,
      tree_request_type_counts,
      tree_request_status_counts,
      tree_types_bar,
      ug_monthly,
      saplings_monthly,
    };
  }
}

export const urbanGreeningAPI = new UrbanGreeningAPI();
