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


// ==================== NEW ISO TREE REQUEST API ====================

export type ISORequestType = 'cutting' | 'pruning' | 'ball_out' | string;
export type ISOOverallStatus = 'receiving' | 'inspection' | 'requirements' | 'clearance' | 'completed' | 'cancelled';

export interface RequirementChecklistItem {
  requirement_name: string;
  is_checked: boolean;
  date_submitted?: string;
}

export interface TreeRequest {
  id: string;
  request_number: string;
  request_type: ISORequestType;
  overall_status: ISOOverallStatus;
  
  // Receiving Phase
  receiving_date_received?: string;
  receiving_month?: string;
  receiving_received_through?: string;
  receiving_date_received_by_dept_head?: string;
  receiving_name?: string;
  receiving_address?: string;
  receiving_contact?: string;
  receiving_request_status?: string;
  
  // Inspection Phase
  inspection_date_received_by_inspectors?: string;
  inspection_date_of_inspection?: string;
  inspection_month?: string;
  inspection_proponent_present?: string;
  inspection_date_submitted_to_dept_head?: string;
  inspection_date_released_to_inspectors?: string;
  inspection_report_control_number?: string;
  inspection_remarks?: string;
  
  // Requirements Phase
  requirements_checklist?: RequirementChecklistItem[];
  requirements_remarks?: string;
  requirements_status?: string;
  requirements_date_completion?: string;
  
  // Clearance Phase
  clearance_date_issued?: string;
  clearance_date_of_payment?: string;
  clearance_control_number?: string;
  clearance_or_number?: string;
  clearance_date_received?: string;
  clearance_status?: string;
  
  // DENR Phase
  denr_date_received_by_inspectors?: string;
  denr_date_submitted_to_dept_head?: string;
  denr_date_released_to_inspectors?: string;
  denr_date_received?: string;
  denr_status?: string;
  
  is_archived: boolean;

  created_at: string;
  updated_at?: string;
}

export interface TreeRequestWithAnalytics extends TreeRequest {
  created_by?: string; // User ID who created the request
  editors?: string[]; // List of user IDs who edited the request
  days_in_receiving: number;
  days_in_inspection: number;
  days_in_requirements: number;
  days_in_clearance: number;
  total_days: number;
  is_delayed: boolean;
  is_archived: boolean;
  receiving_standard_days?: number;
  inspection_standard_days?: number;
  requirements_standard_days?: number;
  clearance_standard_days?: number;
}

export interface TreeRequestCreate {
  request_type: ISORequestType;
  overall_status?: ISOOverallStatus;
  is_archived?: boolean;
  
  // Receiving Phase
  receiving_date_received?: string;
  receiving_month?: string;
  receiving_received_through?: string;
  receiving_date_received_by_dept_head?: string;
  receiving_name?: string;
  receiving_address?: string;
  receiving_contact?: string;
  receiving_request_status?: string;
  
  // Inspection Phase
  inspection_date_received_by_inspectors?: string;
  inspection_date_of_inspection?: string;
  inspection_month?: string;
  inspection_proponent_present?: string;
  inspection_date_submitted_to_dept_head?: string;
  inspection_date_released_to_inspectors?: string;
  inspection_report_control_number?: string;
  inspection_remarks?: string;
  
  // Requirements Phase
  requirements_checklist?: RequirementChecklistItem[];
  requirements_remarks?: string;
  requirements_status?: string;
  requirements_date_completion?: string;
  
  // Clearance Phase
  clearance_date_issued?: string;
  clearance_date_of_payment?: string;
  clearance_control_number?: string;
  clearance_or_number?: string;
  clearance_date_received?: string;
  clearance_status?: string;
  
  // DENR Phase
  denr_date_received_by_inspectors?: string;
  denr_date_submitted_to_dept_head?: string;
  denr_date_released_to_inspectors?: string;
  denr_date_received?: string;
  denr_status?: string;
}

export interface UpdateReceivingPhase {
  receiving_date_received?: string;
  receiving_month?: string;
  receiving_received_through?: string;
  receiving_date_received_by_dept_head?: string;
  receiving_name?: string;
  receiving_address?: string;
  receiving_contact?: string;
  receiving_request_status?: string;
}

export interface UpdateInspectionPhase {
  inspection_date_received_by_inspectors?: string;
  inspection_date_of_inspection?: string;
  inspection_month?: string;
  inspection_proponent_present?: string;
  inspection_date_submitted_to_dept_head?: string;
  inspection_date_released_to_inspectors?: string;
  inspection_report_control_number?: string;
}

export interface UpdateRequirementsPhase {
  requirements_checklist?: RequirementChecklistItem[];
  requirements_remarks?: string;
  requirements_status?: string;
  requirements_date_completion?: string;
}

export interface UpdateClearancePhase {
  clearance_date_issued?: string;
  clearance_date_of_payment?: string;
  clearance_control_number?: string;
  clearance_or_number?: string;
  clearance_date_received?: string;
  clearance_status?: string;
}

export interface UpdateDENRPhase {
  denr_date_received_by_inspectors?: string;
  denr_date_submitted_to_dept_head?: string;
  denr_date_released_to_inspectors?: string;
  denr_date_received?: string;
  denr_status?: string;
}

export interface ProcessingStandards {
  id: string;
  request_type: ISORequestType;
  receiving_standard_days: number;
  inspection_standard_days: number;
  requirements_standard_days: number;
  clearance_standard_days: number;
  created_at: string;
  updated_at?: string;
}

export interface ProcessingStandardsUpdate {
  receiving_standard_days?: number;
  inspection_standard_days?: number;
  requirements_standard_days?: number;
  clearance_standard_days?: number;
}

export interface AnalyticsSummary {
  total_requests: number;
  by_status: Record<string, number>;
  delayed_count: number;
}

// API Functions for ISO Tree Requests
export const fetchTreeRequests = async (params?: {
  status?: ISOOverallStatus;
  request_type?: ISORequestType;
  skip?: number;
  limit?: number;
  year?: number;
  is_archived?: boolean;
}): Promise<TreeRequestWithAnalytics[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.request_type) queryParams.append('request_type', params.request_type);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.year !== undefined) queryParams.append('year', params.year.toString());
    if (params?.is_archived !== undefined) queryParams.append('is_archived', params.is_archived.toString());
    
    const url = `/tree-management/v2/requests${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching tree requests:", error);
    return [];
  }
};

export const fetchTreeRequest = async (id: string): Promise<TreeRequestWithAnalytics | null> => {
  try {
    const response = await apiClient.get(`/tree-management/v2/requests/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tree request:", error);
    return null;
  }
};

export const createTreeRequest = async (data: TreeRequestCreate): Promise<TreeRequestWithAnalytics> => {
  const response = await apiClient.post('/tree-management/v2/requests', data);
  return response.data;
};

export const updateTreeRequest = async (id: string, data: Partial<TreeRequestCreate>): Promise<TreeRequestWithAnalytics> => {
  const response = await apiClient.put(`/tree-management/v2/requests/${id}`, data);
  return response.data;
};

export const deleteTreeRequest = async (id: string): Promise<void> => {
  await apiClient.delete(`/tree-management/v2/requests/${id}`);
};

// Phase-specific updates
export const updateReceivingPhase = async (id: string, data: UpdateReceivingPhase): Promise<TreeRequestWithAnalytics> => {
  const response = await apiClient.patch(`/tree-management/v2/requests/${id}/receiving`, data);
  return response.data;
};

export const updateInspectionPhase = async (id: string, data: UpdateInspectionPhase): Promise<TreeRequestWithAnalytics> => {
  const response = await apiClient.patch(`/tree-management/v2/requests/${id}/inspection`, data);
  return response.data;
};

export const updateRequirementsPhase = async (id: string, data: UpdateRequirementsPhase): Promise<TreeRequestWithAnalytics> => {
  const response = await apiClient.patch(`/tree-management/v2/requests/${id}/requirements`, data);
  return response.data;
};

export const updateClearancePhase = async (id: string, data: UpdateClearancePhase): Promise<TreeRequestWithAnalytics> => {
  const response = await apiClient.patch(`/tree-management/v2/requests/${id}/clearance`, data);
  return response.data;
};

export const updateDENRPhase = async (id: string, data: UpdateDENRPhase): Promise<TreeRequestWithAnalytics> => {
  const response = await apiClient.patch(`/tree-management/v2/requests/${id}/denr`, data);
  return response.data;
};

// Analytics
export const fetchDelayedRequests = async (params?: {
  skip?: number;
  limit?: number;
}): Promise<TreeRequestWithAnalytics[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    
    const url = `/tree-management/v2/analytics/delays${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching delayed requests:", error);
    return [];
  }
};

export const fetchAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  try {
    const response = await apiClient.get('/tree-management/v2/analytics/summary');
    return response.data;
  } catch (error) {
    console.error("Error fetching analytics summary:", error);
    return {
      total_requests: 0,
      by_status: {},
      delayed_count: 0,
    };
  }
};

// Processing Standards
export const fetchAllProcessingStandards = async (): Promise<ProcessingStandards[]> => {
  try {
    const response = await apiClient.get('/tree-management/v2/processing-standards');
    return response.data;
  } catch (error) {
    console.error("Error fetching processing standards:", error);
    return [];
  }
};

export const fetchProcessingStandards = async (requestType: ISORequestType): Promise<ProcessingStandards | null> => {
  try {
    const response = await apiClient.get(`/tree-management/v2/processing-standards/${requestType}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching processing standards:", error);
    return null;
  }
};

export const updateProcessingStandards = async (
  requestType: ISORequestType,
  data: ProcessingStandardsUpdate
): Promise<ProcessingStandards> => {
  const response = await apiClient.put(`/tree-management/v2/processing-standards/${requestType}`, data);
  return response.data;
};

export const deleteProcessingStandards = async (requestType: ISORequestType): Promise<void> => {
  await apiClient.delete(`/tree-management/v2/processing-standards/${requestType}`);
};


// ==================== Dropdown Options API ====================

export interface DropdownOption {
  id: string;
  field_name: string;
  option_value: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DropdownOptionCreate {
  field_name: string;
  option_value: string;
  display_order?: number;
  is_active?: boolean;
}

export interface DropdownOptionUpdate {
  option_value?: string;
  display_order?: number;
  is_active?: boolean;
}

export const fetchDropdownOptions = async (fieldName?: string, activeOnly: boolean = true): Promise<DropdownOption[]> => {
  const params = new URLSearchParams();
  if (fieldName) params.append('field_name', fieldName);
  params.append('active_only', String(activeOnly));
  
  const response = await apiClient.get(`/tree-management/v2/dropdown-options?${params.toString()}`);
  return response.data;
};

export const createDropdownOption = async (data: DropdownOptionCreate): Promise<DropdownOption> => {
  const response = await apiClient.post('/tree-management/v2/dropdown-options', data);
  return response.data;
};

export const updateDropdownOption = async (id: string, data: DropdownOptionUpdate): Promise<DropdownOption> => {
  const response = await apiClient.put(`/tree-management/v2/dropdown-options/${id}`, data);
  return response.data;
};

export const deleteDropdownOption = async (id: string): Promise<void> => {
  await apiClient.delete(`/tree-management/v2/dropdown-options/${id}`);
};
