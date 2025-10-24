import apiClient from "./api-client";

// Types for Tree Management module
export interface TreeManagementRequest {
  id: string;
  request_number: string;
  request_type: "pruning" | "cutting" | "violation_complaint";
  requester_name: string;
  property_address: string;
  status: "filed" | "on_hold" | "for_signature" | "payment_pending";
  request_date: string;
  fee_record_id?: string | null;
  inspectors?: string[];
  trees_and_quantities?: string[];
  picture_links?: string[];
  notes?: string | null;
  monitoring_request_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TreeManagementFilters {
  request_type?: string;
  status?: string;
  requester_name?: string;
  property_address?: string;
  request_number?: string;
  search?: string;
  year?: number;
  month?: number;
}

interface TreeManagementResponse {
  requests: TreeManagementRequest[];
  total: number;
}

class TreeManagementService {
  private baseUrl = "/tree-management";

  // Tree Management Requests API
  async getRequests(
    params: {
      skip?: number;
      limit?: number;
      filters?: TreeManagementFilters;
    } = {}
  ): Promise<TreeManagementRequest[]> {
    const queryParams: any = {
      skip: params.skip || 0,
      limit: params.limit || 100,
    };

    // Add filters if provided
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams[key] = value;
        }
      });
    }

    const response = await apiClient.get(this.baseUrl, {
      params: queryParams,
    });
    return response.data;
  }

  async getRecentRequests(
    params: { limit?: number } = {}
  ): Promise<TreeManagementRequest[]> {
    return this.getRequests({ limit: params.limit || 10 });
  }

  async getRequest(id: string): Promise<TreeManagementRequest> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getRequestsByMonth(
    year: number,
    month: number
  ): Promise<TreeManagementRequest[]> {
    const response = await apiClient.get(`${this.baseUrl}/by-month`, {
      params: { year, month },
    });
    return response.data;
  }

  async searchRequests(
    searchTerm: string,
    limit = 20
  ): Promise<TreeManagementRequest[]> {
    return this.getRequests({
      limit,
      filters: { search: searchTerm },
    });
  }

  // Statistics
  async getTreeStats(): Promise<{
    total_requests: number;
    filed: number;
    on_hold: number;
    for_signature: number;
    payment_pending: number;
    by_type: {
      pruning: number;
      cutting: number;
      violation_complaint: number;
    };
  }> {
    // Fetch all requests to calculate stats
    const requests = await this.getRequests({ limit: 1000 });

    const stats = {
      total_requests: requests.length,
      filed: 0,
      on_hold: 0,
      for_signature: 0,
      payment_pending: 0,
      by_type: {
        pruning: 0,
        cutting: 0,
        violation_complaint: 0,
      },
    };

    requests.forEach((req) => {
      // Count by status
      if (req.status === "filed") stats.filed++;
      else if (req.status === "on_hold") stats.on_hold++;
      else if (req.status === "for_signature") stats.for_signature++;
      else if (req.status === "payment_pending") stats.payment_pending++;

      // Count by type
      if (req.request_type === "pruning") stats.by_type.pruning++;
      else if (req.request_type === "cutting") stats.by_type.cutting++;
      else if (req.request_type === "violation_complaint")
        stats.by_type.violation_complaint++;
    });

    return stats;
  }

  // Helper methods
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      filed: "Filed",
      on_hold: "On Hold",
      for_signature: "For Signature",
      payment_pending: "Payment Pending",
    };
    return labels[status] || status;
  }

  getRequestTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      pruning: "Pruning",
      cutting: "Cutting",
      violation_complaint: "Violation Complaint",
    };
    return labels[type] || type;
  }
}

export const treeManagementService = new TreeManagementService();
