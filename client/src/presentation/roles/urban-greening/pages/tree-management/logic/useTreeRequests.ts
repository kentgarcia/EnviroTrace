import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchTreeManagementRequests,
  fetchTreeManagementRequestsByMonth,
  updateTreeManagementRequest,
  createTreeManagementRequest,
  deleteTreeManagementRequest,
  TreeManagementRequest,
  TreeManagementRequestUpdate,
  TreeManagementRequestCreate,
} from "@/core/api/tree-management-api";

export interface TreeRequest {
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

export const transformApiRequest = (
  request: TreeManagementRequest
): TreeRequest => ({
  id: request.id,
  request_number: request.request_number,
  request_type: request.request_type,
  requester_name: request.requester_name,
  property_address: request.property_address,
  status: request.status,
  request_date: request.request_date,
  fee_record_id: request.fee_record_id,
  inspectors: request.inspectors,
  trees_and_quantities: request.trees_and_quantities,
  picture_links: request.picture_links,
  notes: request.notes,
  monitoring_request_id: request.monitoring_request_id,
  created_at: request.created_at,
  updated_at: request.updated_at,
});

export const useTreeRequestMutations = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      field,
      value,
    }: {
      id: string;
      field: keyof TreeRequest;
      value: any;
    }) => {
      const updateData: TreeManagementRequestUpdate = {
        [field]: value,
      };
      return updateTreeManagementRequest(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree-requests"] });
      toast.success("Tree management request updated successfully");
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast.error("Failed to update tree management request");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: TreeManagementRequestCreate) =>
      createTreeManagementRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree-requests"] });
      toast.success("Tree management request created successfully");
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("Failed to create tree management request");
    },
  });

  // Full update mutation for editing via inline form (updates multiple fields at once)
  const fullUpdateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: TreeManagementRequestUpdate;
    }) => updateTreeManagementRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree-requests"] });
      toast.success("Tree management request updated successfully");
    },
    onError: (error) => {
      console.error("Full update error:", error);
      toast.error("Failed to update tree management request");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTreeManagementRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree-requests"] });
      toast.success("Tree management request deleted successfully");
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast.error("Failed to delete tree management request");
    },
  });

  return {
    updateMutation,
    createMutation,
    deleteMutation,
    fullUpdateMutation,
  };
};

export const fetchTreeRequests = async (opts?: {
  year?: string;
  month?: string;
}): Promise<TreeRequest[]> => {
  let requests;
  if (opts?.year && opts?.month) {
    requests = await fetchTreeManagementRequestsByMonth(opts.year, opts.month);
  } else {
    requests = await fetchTreeManagementRequests();
  }
  return requests.map(transformApiRequest);
};

export const getStatusCounts = (requests: TreeRequest[]) => {
  return requests.reduce(
    (acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    },
    {
      filed: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      in_progress: 0,
      completed: 0,
      payment_pending: 0,
      for_signature: 0,
      on_hold: 0,
    }
  );
};

export const getTypeCounts = (requests: TreeRequest[]) => {
  return requests.reduce(
    (acc, request) => {
      acc[request.request_type] = (acc[request.request_type] || 0) + 1;
      return acc;
    },
    { pruning: 0, cutting: 0, violation_complaint: 0 }
  );
};

export const getUrgencyCounts = (requests: TreeRequest[]) => {
  // Urgency level removed - return empty counts
  return {
    low: 0,
    normal: 0,
    high: 0,
    emergency: 0,
  };
};

export const getTotalFeeAmount = (requests: TreeRequest[]) => {
  // Fee amount removed - return 0 for now
  return 0;
};

export const filterRequests = (
  requests: TreeRequest[],
  searchTerm: string,
  statusFilter: string,
  typeFilter: string,
  monthFilter: string, // 'all' or MM
  yearFilter: string // 'all' or YYYY
) => {
  return requests.filter((request) => {
    const matchesSearch =
      !searchTerm ||
      request.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.property_address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    const matchesType =
      typeFilter === "all" || request.request_type === typeFilter;

    let matchesMonthYear = true;
    if (monthFilter !== "all" || yearFilter !== "all") {
      // request_date may include time; take first 10 chars
      const d = request.request_date.slice(0, 10);
      const [y, m] = d.split("-");
      if (yearFilter !== "all" && y !== yearFilter) matchesMonthYear = false;
      if (monthFilter !== "all" && m !== monthFilter) matchesMonthYear = false;
    }

    return matchesSearch && matchesStatus && matchesType && matchesMonthYear;
  });
};
