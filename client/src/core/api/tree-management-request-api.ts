// client/src/core/api/tree-management-request-api.ts
/**
 * Tree Management Request API Client
 * For cutting/pruning/violation requests with tree linking
 */

import apiClient from "./api-client";

// ==================== Types ====================

export type RequestType = 'cutting' | 'pruning' | 'violation';
export type RequestStatus = 'filed' | 'on_hold' | 'for_signature' | 'payment_pending';

export interface TreeManagementRequest {
  id: string;
  request_number: string;
  request_type: RequestType;
  status: RequestStatus;
  
  // Requester Information
  requester_name: string;
  requester_contact?: string;
  requester_email?: string;
  property_address: string;
  barangay?: string;
  
  // Request Details
  request_date: string;
  reason?: string;
  urgency: 'low' | 'normal' | 'high' | 'emergency';
  
  // Linked Trees (from tree inventory)
  linked_tree_ids?: string[];
  linked_trees?: LinkedTreeInfo[];
  
  // New trees (if not in inventory yet)
  new_trees?: NewTreeEntry[];
  
  // Inspection
  inspection_date?: string;
  inspectors?: string[];
  inspection_notes?: string;
  inspection_photos?: string[];
  
  // Approval
  approved_by?: string;
  approval_date?: string;
  approval_notes?: string;
  
  // Fee
  fee_record_id?: string;
  fee_amount?: number;
  fee_status?: 'pending' | 'paid' | 'waived';
  
  // Completion
  completion_date?: string;
  completion_notes?: string;
  
  // Replacement requirement
  replacement_required: boolean;
  replacement_count?: number;
  replacement_project_id?: string;
  
  created_at: string;
  updated_at?: string;
}

export interface LinkedTreeInfo {
  tree_id: string;
  tree_code: string;
  species?: string;
  common_name: string;
  status: string;
  health: string;
  location?: string;
  action: 'cut' | 'prune' | 'inspect';
}

export interface NewTreeEntry {
  species?: string;
  common_name: string;
  address?: string;
  condition?: string;
  notes?: string;
}

export interface TreeManagementRequestCreate {
  request_type: RequestType;
  requester_name: string;
  requester_contact?: string;
  requester_email?: string;
  property_address: string;
  barangay?: string;
  reason?: string;
  urgency?: 'low' | 'normal' | 'high' | 'emergency';
  linked_tree_ids?: string[];
  new_trees?: NewTreeEntry[];
  inspection_date?: string;
  inspectors?: string[];
  notes?: string;
  fee_record_id?: string;
}

export interface TreeManagementRequestUpdate {
  status?: RequestStatus;
  inspection_date?: string;
  inspectors?: string[];
  inspection_notes?: string;
  inspection_photos?: string[];
  approved_by?: string;
  approval_notes?: string;
  fee_amount?: number;
  completion_notes?: string;
  replacement_required?: boolean;
  replacement_count?: number;
}

export interface RequestStats {
  total_requests: number;
  filed: number;
  on_hold: number;
  for_signature: number;
  payment_pending: number;
  by_type: { type: string; count: number }[];
  by_status: { status: string; count: number }[];
  trees_affected: number;
  fees_collected: number;
}

// ==================== API Functions ====================

export const fetchTreeManagementRequests = async (params?: {
  status?: RequestStatus;
  type?: RequestType;
  year?: number;
  month?: string;
  search?: string;
}): Promise<TreeManagementRequest[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.month) queryParams.append('month', params.month);
    if (params?.search) queryParams.append('search', params.search);
    
    const url = `/tree-management${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching tree management requests:", error);
    return [];
  }
};

export const fetchTreeManagementRequest = async (id: string): Promise<TreeManagementRequest | null> => {
  try {
    const response = await apiClient.get(`/tree-management/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tree management request:", error);
    return null;
  }
};

export const createTreeManagementRequest = async (
  data: TreeManagementRequestCreate
): Promise<TreeManagementRequest> => {
  const response = await apiClient.post('/tree-management', data);
  return response.data;
};

export const updateTreeManagementRequest = async (
  id: string,
  data: TreeManagementRequestUpdate
): Promise<TreeManagementRequest> => {
  const response = await apiClient.patch(`/tree-management/${id}`, data);
  return response.data;
};

export const approveRequest = async (
  id: string,
  data: { approved_by: string; fee_amount?: number; notes?: string }
): Promise<TreeManagementRequest> => {
  const response = await apiClient.post(`/tree-management/${id}/approve`, data);
  return response.data;
};

export const completeRequest = async (
  id: string,
  data: { completion_notes?: string; replacement_project_id?: string }
): Promise<TreeManagementRequest> => {
  const response = await apiClient.post(`/tree-management/${id}/complete`, data);
  return response.data;
};

export const fetchRequestStats = async (): Promise<RequestStats> => {
  try {
    const response = await apiClient.get('/tree-management/stats');
    return response.data;
  } catch (error) {
    console.error("Error fetching request stats:", error);
    return {
      total_requests: 0,
      pending_requests: 0,
      approved_requests: 0,
      completed_requests: 0,
      by_type: [],
      by_status: [],
      trees_affected: 0,
      fees_collected: 0,
    };
  }
};

export const deleteTreeManagementRequest = async (id: string): Promise<void> => {
  await apiClient.delete(`/tree-management/${id}`);
};
