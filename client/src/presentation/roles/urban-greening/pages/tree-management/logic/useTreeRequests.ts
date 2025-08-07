import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchTreeManagementRequests,
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

export const transformApiRequest = (
  request: TreeManagementRequest
): TreeRequest => ({
  id: request.id,
  request_number: request.request_number,
  request_type: request.request_type,
  requester_name: request.requester_name,
  contact_number: request.contact_number,
  email: request.email,
  property_address: request.property_address,
  tree_species: request.tree_species,
  tree_count: request.tree_count,
  tree_location: request.tree_location,
  reason_for_request: request.reason_for_request,
  urgency_level: request.urgency_level,
  status: request.status,
  request_date: request.request_date,
  scheduled_date: request.scheduled_date,
  completion_date: request.completion_date,
  assigned_inspector: request.assigned_inspector,
  inspection_notes: request.inspection_notes,
  fee_amount: request.fee_amount,
  fee_status: request.fee_status,
  permit_number: request.permit_number,
  attachment_files: request.attachment_files,
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
  };
};

export const fetchTreeRequests = async (): Promise<TreeRequest[]> => {
  const requests = await fetchTreeManagementRequests();
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
  return requests.reduce(
    (acc, request) => {
      acc[request.urgency_level] = (acc[request.urgency_level] || 0) + 1;
      return acc;
    },
    { low: 0, normal: 0, high: 0, emergency: 0 }
  );
};

export const getTotalFeeAmount = (requests: TreeRequest[]) => {
  return requests.reduce(
    (total, request) => total + (request.fee_amount || 0),
    0
  );
};

export const filterRequests = (
  requests: TreeRequest[],
  searchTerm: string,
  statusFilter: string,
  typeFilter: string,
  urgencyFilter: string
) => {
  return requests.filter((request) => {
    const matchesSearch =
      !searchTerm ||
      request.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.tree_species.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    const matchesType =
      typeFilter === "all" || request.request_type === typeFilter;
    const matchesUrgency =
      urgencyFilter === "all" || request.urgency_level === urgencyFilter;

    return matchesSearch && matchesStatus && matchesType && matchesUrgency;
  });
};
