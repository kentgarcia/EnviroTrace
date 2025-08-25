import apiClient from "./api-client";

export interface TreeManagementRequest {
  id: string;
  request_number: string;
  request_type: "pruning" | "cutting" | "violation_complaint";

  // Requester Information (simplified)
  requester_name: string;
  property_address: string;

  // Status (limited options)
  status: "filed" | "on_hold" | "for_signature" | "payment_pending";
  request_date: string;

  // Processing Information (connected to Fee Records)
  fee_record_id?: string | null;

  // Inspection Information (inline instead of separate reports)
  inspectors?: string[] | null;
  trees_and_quantities?: string[] | null;
  picture_links?: string[] | null;

  // Optional fields
  notes?: string;

  // Link to Monitoring Request
  monitoring_request_id?: string | null;

  created_at: string;
  updated_at?: string;
}

export interface TreeManagementRequestCreate {
  request_number: string;
  request_type: "pruning" | "cutting" | "violation_complaint";
  requester_name: string;
  property_address: string;
  status?: "filed" | "on_hold" | "for_signature" | "payment_pending";
  request_date: string;
  fee_record_id?: string | null;
  inspectors?: string[] | null;
  trees_and_quantities?: string[] | null;
  picture_links?: string[] | null;
  notes?: string;
  monitoring_request_id?: string | null;
}

export interface TreeManagementRequestUpdate {
  request_number?: string;
  request_type?: "pruning" | "cutting" | "violation_complaint";
  requester_name?: string;
  property_address?: string;
  status?: "filed" | "on_hold" | "for_signature" | "payment_pending";
  request_date?: string;
  fee_record_id?: string | null;
  inspectors?: string[] | null;
  trees_and_quantities?: string[] | null;
  picture_links?: string[] | null;
  notes?: string;
  monitoring_request_id?: string | null;
}

// Tree Management Request API functions
export const fetchTreeManagementRequests = async (): Promise<
  TreeManagementRequest[]
> => {
  const res = await apiClient.get("/tree-management");
  return res.data;
};

export const fetchTreeManagementRequestsByMonth = async (
  year: string,
  month: string
): Promise<TreeManagementRequest[]> => {
  const res = await apiClient.get("/tree-management/by-month", {
    params: { year, month },
  });
  return res.data;
};

// Urban Greening Fee Record lightweight search (for linking in tree requests)
export interface UrbanGreeningFeeRecordSearchResult {
  id: string;
  reference_number: string;
  type: string;
  payer_name: string;
  status: string;
  date: string;
}

export const searchUrbanGreeningFeeRecords = async (
  query: string
): Promise<UrbanGreeningFeeRecordSearchResult[]> => {
  if (!query.trim()) return [];
  const res = await apiClient.get("/fees/urban-greening/search", {
    params: { q: query.trim() },
  });
  return res.data;
};

export const createTreeManagementRequest = async (
  request: TreeManagementRequestCreate
): Promise<TreeManagementRequest> => {
  // Clean up the request data - convert empty UUID strings to null
  const cleanedRequest = {
    ...request,
    fee_record_id:
      request.fee_record_id?.trim() === "" ? null : request.fee_record_id,
  };

  const res = await apiClient.post("/tree-management", cleanedRequest);
  return res.data;
};

export const updateTreeManagementRequest = async (
  id: string,
  request: TreeManagementRequestUpdate
): Promise<TreeManagementRequest> => {
  // Clean up the request data - convert empty UUID strings to null
  const cleanedRequest = {
    ...request,
    fee_record_id:
      request.fee_record_id?.trim() === "" ? null : request.fee_record_id,
  };

  const res = await apiClient.put(`/tree-management/${id}`, cleanedRequest);
  return res.data;
};

export const deleteTreeManagementRequest = async (id: string) => {
  const res = await apiClient.delete(`/tree-management/${id}`);
  return res.data;
};

export const fetchTreeManagementRequestByNumber = async (
  requestNumber: string
): Promise<TreeManagementRequest> => {
  const res = await apiClient.get(
    `/tree-management/request-number/${requestNumber}`
  );
  return res.data;
};

export const fetchTreeManagementRequestsByType = async (
  type: string
): Promise<TreeManagementRequest[]> => {
  const res = await apiClient.get(`/tree-management/type/${type}`);
  return res.data;
};

export const fetchTreeManagementRequestsByStatus = async (
  status: string
): Promise<TreeManagementRequest[]> => {
  const res = await apiClient.get(`/tree-management/status/${status}`);
  return res.data;
};

export const fetchTreeManagementRequestsByRequester = async (
  requesterName: string
): Promise<TreeManagementRequest[]> => {
  const res = await apiClient.get(
    `/tree-management/requester/${requesterName}`
  );
  return res.data;
};

export const fetchPendingTreeManagementRequests = async (): Promise<
  TreeManagementRequest[]
> => {
  const res = await apiClient.get("/tree-management/pending/all");
  return res.data;
};

export const fetchOverdueTreeManagementRequests = async (): Promise<
  TreeManagementRequest[]
> => {
  const res = await apiClient.get("/tree-management/overdue/all");
  return res.data;
};

// Function to fetch tree management requests by monitoring request ID
export const getTreeManagementByMonitoringRequest = async (
  monitoringRequestId: string
): Promise<TreeManagementRequest[]> => {
  const res = await apiClient.get(
    `/tree-management/by-monitoring-request/${monitoringRequestId}`
  );
  return res.data;
};
