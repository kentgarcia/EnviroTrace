import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";

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

const initialMonitoringRequests: MonitoringRequest[] = [
  {
    id: "REQ-001",
    title: "Tree Planting Request - Central Park",
    description: "Request for monitoring tree planting activities in Central Park area",
    requesterName: "John Doe",
    date: "2024-01-15",
    status: "approved",
    location: { lat: 14.5995, lng: 120.9842 },
    address: "Central Park, Manila",
    saplingCount: 50,
    notes: "Focus on native tree species",
  },
  {
    id: "REQ-002",
    title: "Urban Forest Maintenance",
    description: "Regular maintenance and health check of existing urban forest",
    requesterName: "Jane Smith",
    date: "2024-01-20",
    status: "in-progress",
    location: { lat: 14.6091, lng: 121.0223 },
    address: "Quezon City Memorial Circle",
    saplingCount: 200,
    notes: "Check for pest infestation",
  },
  {
    id: "REQ-003",
    title: "New Green Space Development",
    description: "Monitoring request for new green space development project",
    requesterName: "Mike Johnson",
    date: "2024-01-25",
    status: "pending",
    address: "Makati Business District",
    saplingCount: 30,
  },
];

export function useMonitoringRequests() {
  const [requests, setRequests] = useState<MonitoringRequest[]>(initialMonitoringRequests);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    initialMonitoringRequests.length > 0 ? initialMonitoringRequests[0].id : null
  );
  const [mode, setMode] = useState<"viewing" | "adding" | "editing">("viewing");
  const [currentView, setCurrentView] = useState<"table" | "map">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
    (id: string) => {
      setRequests((prev) => {
        const newRequests = prev.filter((r) => r.id !== id);
        if (selectedRequestId === id) {
          setSelectedRequestId(newRequests.length > 0 ? newRequests[0].id : null);
        }
        return newRequests;
      });
      setMode("viewing");
      toast.success("Request has been deleted.");
    },
    [selectedRequestId]
  );

  const handleSaveRequest = useCallback(
    (data: MonitoringRequestSubmission, location: Coordinates | null) => {
      if (mode === "editing" && selectedRequest) {
        const updatedRequest: MonitoringRequest = {
          ...selectedRequest,
          ...data,
          date: data.date.toISOString().split("T")[0],
        };
        if (location) {
          updatedRequest.location = location;
        } else {
          delete updatedRequest.location;
        }
        setRequests((prev) =>
          prev.map((r) => (r.id === selectedRequest.id ? updatedRequest : r))
        );
        toast.success(`Request ${selectedRequest.id} has been updated.`);
      } else if (mode === "adding") {
        const newRequest: MonitoringRequest = {
          id: `REQ-${String(requests.length + 1).padStart(3, "0")}`,
          ...data,
          date: data.date.toISOString().split("T")[0],
          status: "pending",
          ...(location && { location }),
        };
        setRequests((prev) => [...prev, newRequest]);
        setSelectedRequestId(newRequest.id);
        toast.success(`New request ${newRequest.id} has been added.`);
      }
      setMode("viewing");
    },
    [mode, requests.length, selectedRequest]
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
  };
}
