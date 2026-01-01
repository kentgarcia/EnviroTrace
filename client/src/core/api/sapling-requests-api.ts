import apiClient from "./api-client";

export interface SaplingItem {
  name: string;
  qty: number;
  plant_type?: string; // ornamental, trees, seeds, etc.
}

export interface SaplingRequest {
  id: string;
  date_received: string; // YYYY-MM-DD
  requester_name: string;
  address: string;
  saplings: SaplingItem[] | string; // backend may return JSON string; we'll normalize in consumer
  created_at: string;
  updated_at: string;
}

export interface SaplingRequestCreate {
  date_received: string;
  requester_name: string;
  address: string;
  saplings: SaplingItem[];
}

export interface SaplingRequestUpdate {
  date_received?: string;
  requester_name?: string;
  address?: string;
  saplings?: SaplingItem[];
}

export const fetchSaplingRequests = async (year?: number): Promise<SaplingRequest[]> => {
  const params = year ? { year } : {};
  const res = await apiClient.get("/planting/sapling-requests/", { params });
  return res.data;
};

export const createSaplingRequest = async (
  data: SaplingRequestCreate
): Promise<SaplingRequest> => {
  const res = await apiClient.post("/planting/sapling-requests/", data);
  return res.data;
};

export const updateSaplingRequest = async (
  id: string,
  data: SaplingRequestUpdate
): Promise<SaplingRequest> => {
  const res = await apiClient.put(`/planting/sapling-requests/${id}`, data);
  return res.data;
};

export const deleteSaplingRequest = async (id: string): Promise<boolean> => {
  const res = await apiClient.delete(`/planting/sapling-requests/${id}`);
  return res.data;
};
