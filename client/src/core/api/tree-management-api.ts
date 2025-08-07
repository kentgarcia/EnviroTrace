import apiClient from "./api-client";

export interface TreeManagementRequest {
  id: string;
  request_number: string;
  request_type: "pruning" | "cutting" | "violation_complaint";
  requester_name: string;
  contact_number?: string;
  email?: string;
  property_address: string;
  tree_species: string;
  tree_count: number;
  tree_location: string;
  reason_for_request: string;
  urgency_level: "low" | "normal" | "high" | "emergency";
  status:
    | "filed"
    | "under_review"
    | "approved"
    | "rejected"
    | "in_progress"
    | "completed"
    | "payment_pending"
    | "for_signature"
    | "on_hold";
  request_date: string;
  scheduled_date?: string;
  completion_date?: string;
  assigned_inspector?: string;
  inspection_notes?: string;
  fee_amount?: number;
  fee_status?: "pending" | "paid" | "waived";
  permit_number?: string;
  attachment_files?: string;
  created_at: string;
  updated_at?: string;
}

export interface TreeManagementRequestCreate {
  request_number: string;
  request_type: "pruning" | "cutting" | "violation_complaint";
  requester_name: string;
  contact_number?: string;
  email?: string;
  property_address: string;
  tree_species: string;
  tree_count: number;
  tree_location: string;
  reason_for_request: string;
  urgency_level: "low" | "normal" | "high" | "emergency";
  status:
    | "filed"
    | "under_review"
    | "approved"
    | "rejected"
    | "in_progress"
    | "completed"
    | "payment_pending"
    | "for_signature"
    | "on_hold";
  request_date: string;
  scheduled_date?: string;
  completion_date?: string;
  assigned_inspector?: string;
  inspection_notes?: string;
  fee_amount?: number;
  fee_status?: "pending" | "paid" | "waived";
  permit_number?: string;
  attachment_files?: string;
}

export interface TreeManagementRequestUpdate {
  request_number?: string;
  request_type?: "pruning" | "cutting" | "violation_complaint";
  requester_name?: string;
  contact_number?: string;
  email?: string;
  property_address?: string;
  tree_species?: string;
  tree_count?: number;
  tree_location?: string;
  reason_for_request?: string;
  urgency_level?: "low" | "normal" | "high" | "emergency";
  status?:
    | "filed"
    | "under_review"
    | "approved"
    | "rejected"
    | "in_progress"
    | "completed"
    | "payment_pending"
    | "for_signature"
    | "on_hold";
  request_date?: string;
  scheduled_date?: string;
  completion_date?: string;
  assigned_inspector?: string;
  inspection_notes?: string;
  fee_amount?: number;
  fee_status?: "pending" | "paid" | "waived";
  permit_number?: string;
  attachment_files?: string;
}

// Tree Management Request API functions
export const fetchTreeManagementRequests = async (): Promise<
  TreeManagementRequest[]
> => {
  const res = await apiClient.get("/tree-management");
  return res.data;
};

export const createTreeManagementRequest = async (
  request: TreeManagementRequestCreate
): Promise<TreeManagementRequest> => {
  const res = await apiClient.post("/tree-management", request);
  return res.data;
};

export const updateTreeManagementRequest = async (
  id: string,
  request: TreeManagementRequestUpdate
): Promise<TreeManagementRequest> => {
  const res = await apiClient.put(`/tree-management/${id}`, request);
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
