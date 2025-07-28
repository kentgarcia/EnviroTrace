export const markUntracked = async (
  requestId: string,
  location: { lat: number; lng: number }
): Promise<MonitoringRequest> => {
  return updateMonitoringRequest(requestId, { status: "Untracked", location });
};
import apiClient from "./api-client";

// Types for monitoring requests - matching the backend structure
export interface MonitoringRequest {
  id: string;
  title: string;
  description: string;
  requester_name: string;
  date: string;
  status: "pending" | "approved" | "rejected" | "in-progress" | "completed";
  latitude?: number;
  longitude?: number;
  address: string;
  sapling_count?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MonitoringRequestCreate {
  title: string;
  description: string;
  requester_name: string;
  date: string;
  address: string;
  sapling_count?: number;
  notes?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  location: { lat: number; lng: number };
}

export interface MonitoringRequestUpdate {
  title?: string;
  description?: string;
  requester_name?: string;
  date?: string;
  status?: "Living" | "Dead" | "Replaced" | "Untracked";
  address?: string;
  sapling_count?: number;
  notes?: string;
  latitude?: number;
  longitude?: number;
  location: { lat: number; lng: number };
}

export interface MonitoringRequestListResponse {
  reports: MonitoringRequest[];
  total: number;
}

// API functions
export const fetchMonitoringRequests = async (params?: {
  skip?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
}): Promise<MonitoringRequestListResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.skip !== undefined)
    searchParams.append("skip", params.skip.toString());
  if (params?.limit !== undefined)
    searchParams.append("limit", params.limit.toString());
  if (params?.status) searchParams.append("status", params.status);
  if (params?.type) searchParams.append("type", params.type);
  if (params?.search) searchParams.append("search", params.search);

  const queryString = searchParams.toString();
  const url = `/monitoring-requests${queryString ? `?${queryString}` : ""}`;

  const res = await apiClient.get(url);
  return res.data;
};

export const fetchMonitoringRequest = async (
  requestId: string
): Promise<MonitoringRequest> => {
  const res = await apiClient.get(`/monitoring-requests/${requestId}`);
  return res.data;
};

export const createMonitoringRequest = async (
  request: MonitoringRequestCreate
): Promise<MonitoringRequest> => {
  // Set default status to 'Untracked' if not provided
  const reqWithDefault = {
    ...request,
    status: request.status ?? "Untracked",
  };
  const res = await apiClient.post("/monitoring-requests", reqWithDefault);
  return res.data;
};

export const updateMonitoringRequest = async (
  requestId: string,
  request: MonitoringRequestUpdate
): Promise<MonitoringRequest> => {
  const res = await apiClient.put(`/monitoring-requests/${requestId}`, request);
  return res.data;
};

export const deleteMonitoringRequest = async (
  requestId: string
): Promise<{ message: string }> => {
  const res = await apiClient.delete(`/monitoring-requests/${requestId}`);
  return res.data;
};

export const markLiving = async (
  requestId: string,
  location: { lat: number; lng: number }
): Promise<MonitoringRequest> => {
  return updateMonitoringRequest(requestId, { status: "Living", location });
};

export const markDead = async (
  requestId: string,
  location: { lat: number; lng: number }
): Promise<MonitoringRequest> => {
  return updateMonitoringRequest(requestId, { status: "Dead", location });
};

export const markReplaced = async (
  requestId: string,
  location: { lat: number; lng: number }
): Promise<MonitoringRequest> => {
  return updateMonitoringRequest(requestId, { status: "Replaced", location });
};
