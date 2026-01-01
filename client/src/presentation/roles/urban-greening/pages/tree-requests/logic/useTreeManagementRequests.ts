// client/src/presentation/roles/urban-greening/pages/tree-requests/logic/useTreeManagementRequests.ts
/**
 * React Query hooks for Tree Management Requests
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  TreeManagementRequest,
  TreeManagementRequestCreate,
  TreeManagementRequestUpdate,
  RequestStats,
  RequestType,
  RequestStatus,
  fetchTreeManagementRequests,
  fetchTreeManagementRequest,
  createTreeManagementRequest,
  updateTreeManagementRequest,
  approveRequest,
  completeRequest,
  fetchRequestStats,
  deleteTreeManagementRequest,
} from "@/core/api/tree-management-request-api";

const QUERY_KEY = "tree-management-requests";
const STATS_KEY = "tree-management-request-stats";

export const useTreeManagementRequests = (params?: {
  status?: RequestStatus;
  type?: RequestType;
  year?: number;
  month?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => fetchTreeManagementRequests(params),
    staleTime: 60_000,
  });
};

export const useTreeManagementRequest = (id: string | null) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => (id ? fetchTreeManagementRequest(id) : null),
    enabled: !!id,
    staleTime: 60_000,
  });
};

export const useRequestStats = () => {
  return useQuery({
    queryKey: [STATS_KEY],
    queryFn: fetchRequestStats,
    staleTime: 60_000,
  });
};

export const useTreeManagementRequestMutations = () => {
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [STATS_KEY] });
    // Also invalidate tree inventory as requests affect tree status
    queryClient.invalidateQueries({ queryKey: ["tree-inventory"] });
    queryClient.invalidateQueries({ queryKey: ["tree-stats"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: TreeManagementRequestCreate) => createTreeManagementRequest(data),
    onSuccess: () => {
      toast.success("Request created successfully");
      invalidateQueries();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create request: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TreeManagementRequestUpdate }) =>
      updateTreeManagementRequest(id, data),
    onSuccess: () => {
      toast.success("Request updated successfully");
      invalidateQueries();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update request: ${error.message}`);
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { approved_by: string; fee_amount?: number; notes?: string } }) =>
      approveRequest(id, data),
    onSuccess: () => {
      toast.success("Request approved successfully");
      invalidateQueries();
      // Fee record should be created automatically
      queryClient.invalidateQueries({ queryKey: ["fee-records"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve request: ${error.message}`);
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { completion_notes?: string; replacement_project_id?: string } }) =>
      completeRequest(id, data || {}),
    onSuccess: () => {
      toast.success("Request completed - tree status updated");
      invalidateQueries();
    },
    onError: (error: Error) => {
      toast.error(`Failed to complete request: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTreeManagementRequest(id),
    onSuccess: () => {
      toast.success("Request deleted successfully");
      invalidateQueries();
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete request: ${error.message}`);
    },
  });

  return {
    createMutation,
    updateMutation,
    approveMutation,
    completeMutation,
    deleteMutation,
  };
};
