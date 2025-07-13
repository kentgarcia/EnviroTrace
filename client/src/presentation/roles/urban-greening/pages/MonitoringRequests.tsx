import React, { useState, useCallback, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/presentation/components/shared/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/presentation/components/shared/ui/tabs";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { DatePicker } from "@/presentation/components/shared/ui/date-picker";
import { toast } from "sonner";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";
import {
  MapPin,
  Calendar,
  User,
  FileText,
  Plus,
  Edit,
  Trash,
  Eye,
} from "lucide-react";
import LocationMap from "./LocationMap";
import LocationPickerMap from "./LocationPickerMap";
import MapView from "./MapView";
import MonitoringRequestForm, {
  MonitoringRequestFormValues,
} from "../components/MonitoringRequestForm";
import MonitoringRequestDetails, {
  MonitoringRequest as MonitoringRequestType,
} from "../components/MonitoringRequestDetails";
import MonitoringRequestsTable from "../components/MonitoringRequestsTable";

// Types for the monitoring requests
interface Coordinates {
  lat: number;
  lng: number;
}

interface MonitoringRequest {
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
}

interface MonitoringRequestSubmission {
  title: string;
  description: string;
  requesterName: string;
  date: Date;
  address: string;
  saplingCount?: number;
  notes?: string;
}

// Sample data
const initialMonitoringRequests: MonitoringRequest[] = [
  {
    id: "REQ-001",
    title: "Tree Planting Request - Central Park",
    description:
      "Request for monitoring tree planting activities in Central Park area",
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
    description:
      "Regular maintenance and health check of existing urban forest",
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

const MonitoringRequests: React.FC = () => {
  const [requests, setRequests] = useState<MonitoringRequest[]>(
    initialMonitoringRequests
  );
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    () => {
      return initialMonitoringRequests.length > 0
        ? initialMonitoringRequests[0].id
        : null;
    }
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

  React.useEffect(() => {
    if (mode === "adding") {
      setFormLocation({ lat: 14.5995, lng: 120.9842 });
    } else if (mode === "editing" && selectedRequest?.location) {
      setFormLocation(selectedRequest.location);
    }
  }, [mode, selectedRequest]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch =
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requesterName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        request.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

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
          setSelectedRequestId(
            newRequests.length > 0 ? newRequests[0].id : null
          );
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBarContainer dashboardType="urban-greening" />

        {/* Header Section */}
        <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">
            Monitoring Requests
          </h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() =>
                setCurrentView(currentView === "table" ? "map" : "table")
              }
            >
              {currentView === "table" ? "Map View" : "Table View"}
            </Button>
            <Button onClick={handleAddRequest}>
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>

        {/* Body Section */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
          <div className="px-6">
            <ColorDivider />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Main Content */}
            <div className="col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Monitoring Requests</span>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                      />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded px-3 py-2"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentView === "table" ? (
                    <MonitoringRequestsTable
                      requests={filteredRequests}
                      selectedRequestId={selectedRequestId}
                      onSelectRequest={handleSelectRequest}
                      searchTerm={searchTerm}
                      onSearchTermChange={setSearchTerm}
                      statusFilter={statusFilter}
                      onStatusFilterChange={setStatusFilter}
                      onEdit={() => handleEdit()}
                      onDelete={handleDelete}
                      getStatusColor={getStatusColor}
                    />
                  ) : (
                    <MapView
                      requests={requests}
                      onSelectRequest={handleSelectRequest}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>
                    {mode === "adding"
                      ? "New Request"
                      : mode === "editing"
                      ? "Edit Request"
                      : "Request Details"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mode === "adding" || mode === "editing" ? (
                    <MonitoringRequestForm
                      mode={mode}
                      initialValues={
                        mode === "editing" && selectedRequest
                          ? {
                              ...selectedRequest,
                              date: new Date(selectedRequest.date),
                            }
                          : {}
                      }
                      location={formLocation}
                      onLocationChange={setFormLocation}
                      onSave={handleSaveRequest}
                      onCancel={handleCancel}
                    />
                  ) : (
                    selectedRequest && (
                      <MonitoringRequestDetails
                        request={selectedRequest}
                        onEdit={handleEdit}
                        onDelete={() => handleDelete(selectedRequest.id)}
                        getStatusColor={getStatusColor}
                      />
                    )
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringRequests;
