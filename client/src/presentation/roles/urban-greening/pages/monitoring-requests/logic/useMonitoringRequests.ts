import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import * as monitoringRequestService from "@/core/api/monitoring-request-service";

// Types for the monitoring requests
export type Coordinates = {
  lat: number;
  lng: number;
};

export type MonitoringRequest = {
  id: string;
  title: string;
  description: string;
  requesterName: string;
  date: string;
  status: "pending" | "approved" | "rejected" | "in-progress" | "completed";
  location?: Coordinates;
  address: string;
  saplingCount?: number;
  notes?: string;
};

export type MonitoringRequestSubmission = {
  title: string;
  description: string;
  requesterName: string;
  date: Date;
  address: string;
  saplingCount?: number;
  notes?: string;
};

export function useMonitoringRequests() {
  const [requests, setRequests] = useState<MonitoringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const [mode, setMode] = useState<"viewing" | "adding" | "editing">("viewing");
  const [currentView, setCurrentView] = useState<"table" | "map">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Load monitoring requests from API
  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await monitoringRequestService.fetchMonitoringRequests({
        limit: 100, // Get a reasonable amount
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });
      setRequests(response.reports);

      // Set first request as selected if none selected
      if (!selectedRequestId && response.reports.length > 0) {
        setSelectedRequestId(response.reports[0].id);
      }
    } catch (err) {
      console.error("Failed to load monitoring requests:", err);
      setError("Failed to load monitoring requests");
      toast.error("Failed to load monitoring requests");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, selectedRequestId]);

  // Load requests on mount and when filters change
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const selectedRequest = useMemo(
    () => requests.find((r) => r.id === selectedRequestId) || null,
    [requests, selectedRequestId]
  );

  const [formLocation, setFormLocation] = useState<Coordinates>(
    selectedRequest?.location || { lat: 14.5995, lng: 120.9842 }
  );

  useEffect(() => {
    if (mode === "adding") {
      setFormLocation({ lat: 14.5995, lng: 120.9842 });
    } else if (mode === "editing" && selectedRequest?.location) {
      setFormLocation(selectedRequest.location);
    }
  }, [mode, selectedRequest]);

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
        await monitoringRequestService.deleteMonitoringRequest(id);

        setRequests((prev) => {
          const newRequests = prev.filter((r) => r.id !== id);
          if (selectedRequestId === id) {
            setSelectedRequestId(
              newRequests.length > 0 ? newRequests[0].id : null
            );
          }
          return newRequests;
        });
        setMode("viewing");
        toast.success("Request has been deleted.");
      } catch (err) {
        console.error("Failed to delete request:", err);
        toast.error("Failed to delete request");
      }
    },
    [selectedRequestId]
  );

  const handleSaveRequest = useCallback(
    async (data: MonitoringRequestSubmission, location: Coordinates | null) => {
      try {
        const requestData:
          | monitoringRequestService.MonitoringRequestCreate
          | monitoringRequestService.MonitoringRequestUpdate = {
          ...data,
          date: data.date.toISOString().split("T")[0],
          ...(location && { location }),
        };

        if (mode === "editing" && selectedRequest) {
          const updatedRequest =
            await monitoringRequestService.updateMonitoringRequest(
              selectedRequest.id,
              requestData
            );
          setRequests((prev) =>
            prev.map((r) => (r.id === selectedRequest.id ? updatedRequest : r))
          );
          toast.success(`Request ${selectedRequest.id} has been updated.`);
        } else if (mode === "adding") {
          const newRequest =
            await monitoringRequestService.createMonitoringRequest(
              requestData as monitoringRequestService.MonitoringRequestCreate
            );
          setRequests((prev) => [...prev, newRequest]);
          setSelectedRequestId(newRequest.id);
          toast.success(`New request ${newRequest.id} has been added.`);
        }
        setMode("viewing");
      } catch (err) {
        console.error("Failed to save request:", err);
        toast.error("Failed to save request");
      }
    },
    [mode, selectedRequest]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
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
    error,
    selectedRequestId,
    mode,
    currentView,
    searchTerm,
    statusFilter,
    selectedRequest,
    formLocation,
    setCurrentView,
    setSearchTerm,
    setStatusFilter,
    setFormLocation,
    handleSelectRequest,
    handleAddRequest,
    handleCancel,
    handleEdit,
    handleDelete,
    handleSaveRequest,
    getStatusColor,
    refetchRequests: loadRequests,
  };
}
