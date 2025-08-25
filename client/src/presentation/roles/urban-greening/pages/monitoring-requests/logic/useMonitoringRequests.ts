import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as monitoringRequestService from "@/core/api/monitoring-request-service";
import { DEFAULT_MONITORING_REQUEST_STATUS } from "../../../constants";

// Types for the monitoring requests
export type Coordinates = {
  lat: number;
  lng: number;
};

export type MonitoringRequest = monitoringRequestService.MonitoringRequest;

export type MonitoringRequestSubmission = {
  title: string;
  description: string;
  date: Date;
  notes?: string;
  source_type?: string;
};

export function useMonitoringRequests() {
  const queryClient = useQueryClient();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const [mode, setMode] = useState<"viewing" | "adding" | "editing">("viewing");
  const [currentView, setCurrentView] = useState<"table" | "map">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>("all");

  // Fetch monitoring requests using TanStack Query
  const {
    data: requestsResponse,
    isLoading: loading,
    error,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: [
      "monitoring-requests",
      { statusFilter, searchTerm, sourceTypeFilter },
    ],
    queryFn: () =>
      monitoringRequestService.fetchMonitoringRequests({
        limit: 100,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const requests = Array.isArray(requestsResponse)
    ? requestsResponse
    : requestsResponse?.reports || [];

  // Set first request as selected if none selected and we have requests
  useMemo(() => {
    if (!selectedRequestId && requests.length > 0) {
      setSelectedRequestId(requests[0].id);
    }
  }, [selectedRequestId, requests]);

  const selectedRequest = useMemo(
    () => requests.find((r) => r.id === selectedRequestId) || null,
    [requests, selectedRequestId]
  );

  const [formLocation, setFormLocation] = useState<Coordinates | null>({
    lat: selectedRequest?.location?.lat || 14.5995,
    lng: selectedRequest?.location?.lng || 120.9842,
  });

  // Update form location when mode or selected request changes
  useMemo(() => {
    if (mode === "adding") {
      setFormLocation({ lat: 14.5995, lng: 120.9842 });
    } else if (mode === "editing" && selectedRequest) {
      setFormLocation({
        lat: selectedRequest.location?.lat || 14.5995,
        lng: selectedRequest.location?.lng || 120.9842,
      });
    }
  }, [mode, selectedRequest]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: monitoringRequestService.deleteMonitoringRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring-requests"] });
      toast.success("Request has been deleted.");
      setMode("viewing");
    },
    onError: (err) => {
      console.error("Failed to delete request:", err);
      toast.error("Failed to delete request");
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: monitoringRequestService.createMonitoringRequest,
    onSuccess: (newRequest) => {
      queryClient.invalidateQueries({ queryKey: ["monitoring-requests"] });
      setSelectedRequestId(newRequest.id);
      toast.success(`New request ${newRequest.id} has been added.`);
      setMode("viewing");
    },
    onError: (err) => {
      console.error("Failed to create request:", err);
      toast.error("Failed to create request");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: monitoringRequestService.MonitoringRequestUpdate;
    }) => monitoringRequestService.updateMonitoringRequest(id, data),
    onSuccess: (updatedRequest) => {
      queryClient.invalidateQueries({ queryKey: ["monitoring-requests"] });
      toast.success(`Request ${updatedRequest.id} has been updated.`);
      setMode("viewing");
    },
    onError: (err) => {
      console.error("Failed to update request:", err);
      toast.error("Failed to update request");
    },
  });

  const handleSelectRequest = useCallback((id: string | null) => {
    setSelectedRequestId(id);
    setMode("viewing");
  }, []);

  const handleAddRequest = useCallback(() => {
    setSelectedRequestId(null);
    setMode("adding");
  }, []);

  const handleCancel = useCallback(() => {
    setMode("viewing");
    if (mode === "adding") {
      setSelectedRequestId(requests.length > 0 ? requests[0].id : null);
    }
  }, [mode, requests]);

  const handleEdit = useCallback(() => {
    if (selectedRequest) {
      setMode("editing");
    }
  }, [selectedRequest]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id);
        if (selectedRequestId === id) {
          const remainingRequests = requests.filter((r) => r.id !== id);
          setSelectedRequestId(
            remainingRequests.length > 0 ? remainingRequests[0].id : null
          );
        }
      } catch (err) {
        // Error handling is done in the mutation
      }
    },
    [deleteMutation, selectedRequestId, requests]
  );

  const handleSaveRequest = useCallback(
    async (
      data: MonitoringRequestSubmission,
      location: Coordinates | null,
      status: string
    ) => {
      try {
        const baseData = {
          ...data,
          date: data.date.toISOString().split("T")[0],
        };

        if (mode === "editing" && selectedRequest) {
          const requestData: monitoringRequestService.MonitoringRequestUpdate =
            {
              status: status, // Use the status from the form
              location: {
                lat: (location?.lat ?? selectedRequest.location?.lat)!,
                lng: (location?.lng ?? selectedRequest.location?.lng)!,
              },
              // Optional metadata passthrough
              title: baseData.title,
              date: baseData.date,
              description: baseData.description,
              notes: baseData.notes,
              source_type: baseData.source_type,
            };
          await updateMutation.mutateAsync({
            id: selectedRequest.id,
            data: requestData,
          });
        } else if (mode === "adding") {
          const requestData: monitoringRequestService.MonitoringRequestCreate =
            {
              status: status, // Use the status from the form
              location: location || { lat: 0, lng: 0 },
              // Optional metadata
              title: baseData.title,
              date: baseData.date,
              description: baseData.description,
              notes: baseData.notes,
              source_type: baseData.source_type || "urban_greening",
            };
          await createMutation.mutateAsync(requestData);
        }
      } catch (err) {
        // Re-throw the error so the calling component can handle it
        throw err;
      }
    },
    [mode, selectedRequest, updateMutation, createMutation]
  );

  const getStatusColor = (status: string) => {
    // Convert to lowercase for case-insensitive comparison
    const lowerStatus = status?.toLowerCase();

    switch (lowerStatus) {
      case "untracked":
        return "bg-gray-100 text-gray-800";
      case "living":
        return "bg-green-100 text-green-800";
      case "dead":
        return "bg-red-100 text-red-800";
      case "replaced":
        return "bg-blue-100 text-blue-800";
      // Legacy status values (keeping for backward compatibility)
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return {
    requests,
    loading,
    error: error?.message || null,
    selectedRequestId,
    mode,
    currentView,
    searchTerm,
    statusFilter,
    sourceTypeFilter,
    selectedRequest,
    formLocation,
    setCurrentView,
    setSearchTerm,
    setStatusFilter,
    setSourceTypeFilter,
    setFormLocation,
    setSelectedRequestId,
    handleSelectRequest,
    handleAddRequest,
    handleCancel,
    handleEdit,
    handleDelete,
    handleSaveRequest,
    getStatusColor,
    refetchRequests,
  };
}
