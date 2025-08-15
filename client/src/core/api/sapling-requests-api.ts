import apiClient from "./api-client";

export interface SaplingItem {
  name: string;
  qty: number;
}

export interface SaplingRequest {
  id: string;
  date_received: string; // YYYY-MM-DD
  requester_name: string;
  address: string;
  saplings: SaplingItem[] | string; // backend may return JSON string; we'll normalize in consumer
  monitoring_request_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaplingRequestCreate {
  date_received: string;
  requester_name: string;
  address: string;
  saplings: SaplingItem[];
  monitoring_request_id?: string | null;
}

export interface SaplingRequestUpdate {
  date_received?: string;
  requester_name?: string;
  address?: string;
  saplings?: SaplingItem[];
  monitoring_request_id?: string | null;
}

export const fetchSaplingRequests = async (): Promise<SaplingRequest[]> => {
  const res = await apiClient.get("/planting/sapling-requests/");
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
