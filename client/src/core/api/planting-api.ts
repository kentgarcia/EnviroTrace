import apiClient from "./api-client";
// Types
export interface UrbanGreeningPlanting {
  id: string;
  record_number: string;
  planting_type: "ornamental_plants" | "trees" | "seeds" | "seeds_private";
  species_name: string;
  quantity_planted: number;
  planting_date: string;
  location: string;
  barangay?: string;
  coordinates?: string;
  planting_method?: string;
  status: "planted" | "growing" | "mature" | "died" | "removed";
  survival_rate?: number;
  responsible_person: string;
  contact_number?: string;
  organization?: string;
  project_name?: string;
  funding_source?: string;
  maintenance_schedule?: string;
  notes?: string;
  photos?: string;
  created_at: string;
  updated_at: string;
}

export interface SaplingCollection {
  id: string;
  collection_number: string;
  species_name: string;
  quantity_collected: number;
  collection_date: string;
  collection_location: string;
  collector_name: string;
  collector_contact?: string;
  purpose: "replacement" | "reforestation" | "distribution" | "nursery";
  target_planting_date?: string;
  target_location?: string;
  nursery_location?: string;
  status:
    | "collected"
    | "nursery"
    | "ready_for_planting"
    | "planted"
    | "distributed";
  health_condition?: "excellent" | "good" | "fair" | "poor";
  size_category?: "seedling" | "sapling" | "juvenile" | "mature";
  survival_rate?: number;
  distribution_date?: string;
  recipient_name?: string;
  recipient_contact?: string;
  recipient_address?: string;
  care_instructions?: string;
  notes?: string;
  photos?: string;
  created_at: string;
  updated_at: string;
}

export interface PlantingStatistics {
  total_plantings: number;
  total_quantity: number;
  by_type: Record<string, { count: number; quantity: number }>;
  by_status: Record<string, number>;
  by_month: Record<number, { count: number; quantity: number }>;
}

export interface SaplingStatistics {
  total_collections: number;
  total_quantity: number;
  by_species: Record<string, { count: number; quantity: number }>;
  by_purpose: Record<string, { count: number; quantity: number }>;
  by_status: Record<string, number>;
  survival_rate_avg?: number;
}

export interface CreateUrbanGreeningPlantingData {
  planting_type: string;
  species_name: string;
  quantity_planted: number;
  planting_date: string;
  location: string;
  barangay?: string;
  coordinates?: string;
  planting_method?: string;
  status?: string;
  survival_rate?: number;
  responsible_person: string;
  contact_number?: string;
  organization?: string;
  project_name?: string;
  funding_source?: string;
  maintenance_schedule?: string;
  notes?: string;
  photos?: string;
}

export interface CreateSaplingCollectionData {
  species_name: string;
  quantity_collected: number;
  collection_date: string;
  collection_location: string;
  collector_name: string;
  collector_contact?: string;
  purpose: string;
  target_planting_date?: string;
  target_location?: string;
  nursery_location?: string;
  status?: string;
  health_condition?: string;
  size_category?: string;
  survival_rate?: number;
  distribution_date?: string;
  recipient_name?: string;
  recipient_contact?: string;
  recipient_address?: string;
  care_instructions?: string;
  notes?: string;
  photos?: string;
}

// Urban Greening Planting API functions
export const fetchUrbanGreeningPlantings = async (params?: {
  skip?: number;
  limit?: number;
  planting_type?: string;
  status?: string;
  search?: string;
}): Promise<UrbanGreeningPlanting[]> => {
  const response = await apiClient.get("/planting/urban-greening/", { params });
  return response.data;
};

export const fetchUrbanGreeningPlanting = async (
  id: string
): Promise<UrbanGreeningPlanting> => {
  const response = await apiClient.get(`/planting/urban-greening/${id}`);
  return response.data;
};

export const createUrbanGreeningPlanting = async (
  data: CreateUrbanGreeningPlantingData
): Promise<UrbanGreeningPlanting> => {
  const response = await apiClient.post("/planting/urban-greening/", data);
  return response.data;
};

export const updateUrbanGreeningPlanting = async (
  id: string,
  data: Partial<CreateUrbanGreeningPlantingData>
): Promise<UrbanGreeningPlanting> => {
  const response = await apiClient.put(`/planting/urban-greening/${id}`, data);
  return response.data;
};

export const deleteUrbanGreeningPlanting = async (
  id: string
): Promise<void> => {
  await apiClient.delete(`/planting/urban-greening/${id}`);
};

export const fetchUrbanGreeningStatistics =
  async (): Promise<PlantingStatistics> => {
    const response = await apiClient.get(
      "/planting/urban-greening/statistics/"
    );
    return response.data;
  };

// Sapling Collection API functions
export const fetchSaplingCollections = async (params?: {
  skip?: number;
  limit?: number;
  purpose?: string;
  status?: string;
  search?: string;
}): Promise<SaplingCollection[]> => {
  const response = await apiClient.get("/planting/saplings/", { params });
  return response.data;
};

export const fetchSaplingCollection = async (
  id: string
): Promise<SaplingCollection> => {
  const response = await apiClient.get(`/planting/saplings/${id}`);
  return response.data;
};

export const createSaplingCollection = async (
  data: CreateSaplingCollectionData
): Promise<SaplingCollection> => {
  const response = await apiClient.post("/planting/saplings/", data);
  return response.data;
};

export const updateSaplingCollection = async (
  id: string,
  data: Partial<CreateSaplingCollectionData>
): Promise<SaplingCollection> => {
  const response = await apiClient.put(`/planting/saplings/${id}`, data);
  return response.data;
};

export const deleteSaplingCollection = async (id: string): Promise<void> => {
  await apiClient.delete(`/planting/saplings/${id}`);
};

export const fetchSaplingStatistics = async (): Promise<SaplingStatistics> => {
  const response = await apiClient.get("/planting/saplings/statistics/");
  return response.data;
};
