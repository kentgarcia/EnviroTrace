// client/src/presentation/roles/urban-greening/pages/tree-requests/ISOTreeRequestsPage.tsx
/**
 * ISO Tree Requests Main Page
 * List view with filters, dashboard, and request management
 */

import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Card, CardContent, CardHeader } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  fetchTreeRequests,
  updateTreeRequest,
  updateReceivingPhase,
  updateRequirementsPhase,
  updateClearancePhase,
  updateDENRPhase,
  fetchAllProcessingStandards,
  TreeRequestWithAnalytics,
  ISOOverallStatus,
  ISORequestType,
} from "@/core/api/tree-management-request-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/shared/ui/dialog";
import { 
  Plus, 
  Search, 
  BarChart3, 
  List,
  AlertTriangle,
  Clock,
  RefreshCw,
  FileText,
  Activity,
  CheckCircle2,
  Eye,
  Scissors,
  Axe,
  TreePine,
  Settings,
  Archive,
  ArchiveRestore
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import ISOTreeRequestForm from "./components/ISOTreeRequestForm";
import ISOTreeRequestDetails from "./components/ISOTreeRequestDetails";
import EnhancedISODashboard from "./components/EnhancedISODashboard";

// Extend ColumnMeta to support group property for category headers
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    group?: string;
  }
}

const REQUEST_TYPE_CONFIG: Record<ISORequestType, { label: string; icon: React.ReactNode; color: string }> = {
  cutting: { label: "Tree Cutting", icon: <Axe className="w-4 h-4" />, color: "bg-red-100 text-red-800" },
  pruning: { label: "Pruning", icon: <Scissors className="w-4 h-4" />, color: "bg-yellow-100 text-yellow-800" },
  ball_out: { label: "Ball-out", icon: <TreePine className="w-4 h-4" />, color: "bg-green-100 text-green-800" },
};

const STATUS_CONFIG: Record<ISOOverallStatus, { label: string; color: string }> = {
  receiving: { label: "Receiving", color: "bg-blue-100 text-blue-800" },
  inspection: { label: "Inspection", color: "bg-purple-100 text-purple-800" },
  requirements: { label: "Requirements", color: "bg-yellow-100 text-yellow-800" },
  clearance: { label: "Clearance", color: "bg-orange-100 text-orange-800" },
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
};

const RECEIVING_STATUS_OPTIONS = ["Pending", "Received", "Forwarded", "Returned"];
const REQUIREMENTS_STATUS_OPTIONS = ["Pending", "Incomplete", "Complete", "Verified"];
const CLEARANCE_STATUS_OPTIONS = ["Pending", "Issued", "Released", "Claimed"];
const DENR_STATUS_OPTIONS = ["Pending", "Submitted", "Released", "Received"];


const ISOTreeRequestsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"list" | "dashboard">("list");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TreeRequestWithAnalytics | null>(null);
  const [statusFilter, setStatusFilter] = useState<ISOOverallStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ISORequestType | "all">("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] = useState(false);
  const [requestToArchive, setRequestToArchive] = useState<TreeRequestWithAnalytics | null>(null);

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ["tree-requests", statusFilter, typeFilter, showArchived],
    queryFn: () => fetchTreeRequests({
      status: statusFilter !== "all" ? statusFilter : undefined,
      request_type: typeFilter !== "all" ? typeFilter : undefined,
      is_archived: showArchived,
    }),
  });

  // Fetch standards for dynamic type filter
  const { data: standards = [] } = useQuery({
    queryKey: ["processing-standards"],
    queryFn: fetchAllProcessingStandards,
  });

  const updateTypeMutation = useMutation({
    mutationFn: ({ id, type }: { id: string; type: ISORequestType }) => updateTreeRequest(id, { request_type: type }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tree-requests"] }),
  });

  const updateArchiveMutation = useMutation({
    mutationFn: ({ id, is_archived }: { id: string; is_archived: boolean }) => updateTreeRequest(id, { is_archived }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tree-requests"] });
      queryClient.invalidateQueries({ queryKey: ["tree-requests-dashboard"] });
    },
  });

  const updateReceivingMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateReceivingPhase(id, { receiving_request_status: status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tree-requests"] }),
  });

  const updateRequirementsMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateRequirementsPhase(id, { requirements_status: status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tree-requests"] }),
  });

  const updateClearanceMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateClearancePhase(id, { clearance_status: status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tree-requests"] }),
  });

  const updateDENRMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateDENRPhase(id, { denr_status: status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tree-requests"] }),
  });

  // Handle view changes with data refresh
  const handleViewChange = (newView: "list" | "dashboard") => {
    setView(newView);
    // Invalidate queries based on the new view
    if (newView === "dashboard") {
      queryClient.invalidateQueries({ queryKey: ["tree-requests-dashboard"] });
    } else if (newView === "list") {
      queryClient.invalidateQueries({ queryKey: ["tree-requests"] });
    }
  };

  // Handle refresh based on current view
  const handleRefresh = () => {
    if (view === "dashboard") {
      queryClient.invalidateQueries({ queryKey: ["tree-requests-dashboard"] });
    } else {
      refetch();
    }
  };

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    let filtered = requests;
    
    // Filter by year
    if (yearFilter !== "all") {
      filtered = filtered.filter(request => {
        const dateReceived = request.receiving_date_received;
        if (!dateReceived) return false;
        const year = new Date(dateReceived).getFullYear().toString();
        return year === yearFilter;
      });
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(request =>
        request.request_number.toLowerCase().includes(query) ||
        request.receiving_name?.toLowerCase().includes(query) ||
        request.receiving_address?.toLowerCase().includes(query)
      );
    }
    
    // Sort by receiving_date_received (newest first)
    filtered = [...filtered].sort((a, b) => {
      const dateA = a.receiving_date_received ? new Date(a.receiving_date_received).getTime() : 0;
      const dateB = b.receiving_date_received ? new Date(b.receiving_date_received).getTime() : 0;
      return dateB - dateA; // Descending order (newest first)
    });
    
    return filtered;
  }, [requests, searchQuery, yearFilter]);

  // Get available years from requests
  const availableYears = useMemo(() => {
    if (!requests) return [];
    const years = new Set<string>();
    requests.forEach(request => {
      if (request.receiving_date_received) {
        const year = new Date(request.receiving_date_received).getFullYear().toString();
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a)); // Sort descending
  }, [requests]);

  const delayedCount = requests?.filter(r => r.is_delayed).length || 0;

  const handleRowClick = useCallback((row: any) => {
    setSelectedRequest(row.original);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedRequest(null);
  }, []);

  const columns: ColumnDef<TreeRequestWithAnalytics>[] = useMemo(
    () => [
      // ===== RECEIVING =====
      {
        accessorKey: "receiving_date_received",
        header: "Date Received",
        size: 120,
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return val ? new Date(val).toLocaleDateString() : "—";
        },
        meta: { group: "Receiving" },
      },
      {
        accessorKey: "receiving_month",
        header: "Month",
        size: 100,
        cell: ({ getValue }) => <span className="text-sm">{String(getValue() || "") || "—"}</span>,
        meta: { group: "Receiving" },
      },
      {
        accessorKey: "receiving_received_through",
        header: "Received Through",
        size: 140,
        cell: ({ getValue }) => <span className="text-sm">{String(getValue() || "") || "—"}</span>,
        meta: { group: "Receiving" },
      },
      {
        accessorKey: "receiving_date_received_by_dept_head",
        header: "Date Received by Dept. Head",
        size: 160,
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return val ? new Date(val).toLocaleDateString() : "—";
        },
        meta: { group: "Receiving" },
      },
      {
        accessorKey: "receiving_name",
        header: "Name",
        size: 180,
        cell: ({ getValue }) => <span className="text-sm">{String(getValue() || "") || "—"}</span>,
        meta: { group: "Receiving" },
      },
      {
        accessorKey: "receiving_address",
        header: "Address",
        size: 200,
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-600">{getValue() as string || "—"}</span>
        ),
        meta: { group: "Receiving" },
      },
      {
        accessorKey: "receiving_contact",
        header: "Contact Number/Email",
        size: 160,
        cell: ({ getValue }) => <span className="text-sm">{String(getValue() || "") || "—"}</span>,
        meta: { group: "Receiving" },
      },
      {
        accessorKey: "request_type",
        header: "Type of Request",
        size: 150,
        cell: ({ getValue }) => {
          const type = getValue() as ISORequestType;
          const config = REQUEST_TYPE_CONFIG[type];
          return (
            <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${config?.color || "text-gray-600"}`}>
                {config?.icon}
                <span className="text-sm font-medium">{config?.label || type}</span>
            </div>
          );
        },
        meta: { group: "Receiving" },
      },
      {
        accessorKey: "receiving_request_status",
        header: "Status of Request",
        size: 140,
        cell: ({ getValue }) => <span className="text-sm">{String(getValue() || "") || "Pending"}</span>,
        meta: { group: "Receiving" },
      },
      
      // ===== INSPECTION =====
      {
        accessorKey: "inspection_date_received_by_inspectors",
        header: "Date Received by Inspectors",
        size: 160,
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return val ? new Date(val).toLocaleDateString() : "—";
        },
        meta: { group: "Inspection" },
      },
      {
        accessorKey: "inspection_date_of_inspection",
        header: "Date of Inspection",
        size: 130,
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return val ? new Date(val).toLocaleDateString() : "—";
        },
        meta: { group: "Inspection" },
      },
      {
        accessorKey: "inspection_month",
        header: "Month",
        size: 100,
        cell: ({ getValue }) => <span className="text-sm">{String(getValue() || "")  || "—"}</span>,
        meta: { group: "Inspection" },
      },
      {
        accessorKey: "inspection_proponent_present",
        header: "Proponent Present",
        size: 140,
        cell: ({ getValue }) => <span className="text-sm">{String(getValue() || "") || "—"}</span>,
        meta: { group: "Inspection" },
      },
      {
        accessorKey: "inspection_date_submitted_to_dept_head",
        header: "Date Submitted to Dept. Head",
        size: 170,
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return val ? new Date(val).toLocaleDateString() : "—";
        },
        meta: { group: "Inspection" },
      },
      {
        accessorKey: "inspection_date_released_to_inspectors",
        header: "Date Released to Inspectors",
        size: 170,
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return val ? new Date(val).toLocaleDateString() : "—";
        },
        meta: { group: "Inspection" },
      },
      {
        accessorKey: "inspection_report_control_number",
        header: "Inspection Report Control No.",
        size: 180,
        cell: ({ getValue }) => <span className="text-sm font-mono">{String(getValue() || "") || "—"}</span>,
        meta: { group: "Inspection" },
      },
      
      // ===== REQUIREMENTS =====
      {
        id: "req_application_letter",
        header: "Application Letter",
        size: 120,
        cell: ({ row }) => {
          const checklist = row.original.requirements_checklist;
          const item = checklist?.find((c) => c.requirement_name === "Application Letter");
          return item?.is_checked ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : "—";
        },
        meta: { group: "Requirements" },
      },
      {
        id: "req_photos",
        header: "Photos",
        size: 80,
        cell: ({ row }) => {
          const checklist = row.original.requirements_checklist;
          const item = checklist?.find((c) => c.requirement_name === "Photos");
          return item?.is_checked ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : "—";
        },
        meta: { group: "Requirements" },
      },
      {
        id: "req_sketchmap",
        header: "Sketchmap",
        size: 90,
        cell: ({ row }) => {
          const checklist = row.original.requirements_checklist;
          const item = checklist?.find((c) => c.requirement_name === "Sketchmap");
          return item?.is_checked ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : "—";
        },
        meta: { group: "Requirements" },
      },
      {
        id: "req_brgy_endorsement",
        header: "Brgy. Endorsement",
        size: 120,
        cell: ({ row }) => {
          const checklist = row.original.requirements_checklist;
          const item = checklist?.find((c) => c.requirement_name === "Brgy. Endorsement Letter");
          return item?.is_checked ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : "—";
        },
        meta: { group: "Requirements" },
      },
      {
        id: "req_hoa_endorsement",
        header: "HOA Endorsement",
        size: 120,
        cell: ({ row }) => {
          const checklist = row.original.requirements_checklist;
          const item = checklist?.find((c) => c.requirement_name === "HOA Endorsement Letter");
          return item?.is_checked ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : "—";
        },
        meta: { group: "Requirements" },
      },
      {
        id: "req_replacement",
        header: "Replacement",
        size: 100,
        cell: ({ row }) => {
          const checklist = row.original.requirements_checklist;
          const item = checklist?.find((c) => c.requirement_name === "Replacement");
          return item?.is_checked ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : "—";
        },
        meta: { group: "Requirements" },
      },
      {
        id: "req_tct",
        header: "TCT",
        size: 70,
        cell: ({ row }) => {
          const checklist = row.original.requirements_checklist;
          const item = checklist?.find((c) => c.requirement_name === "TCT");
          return item?.is_checked ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : "—";
        },
        meta: { group: "Requirements" },
      },
      {
        id: "req_ecc",
        header: "ECC",
        size: 70,
        cell: ({ row }) => {
          const checklist = row.original.requirements_checklist;
          const item = checklist?.find((c) => c.requirement_name === "ECC");
          return item?.is_checked ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : "—";
        },
        meta: { group: "Requirements" },
      },
      {
        accessorKey: "requirements_remarks",
        header: "Remarks and Recommendations",
        size: 200,
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-600">{String(getValue() || "") || "—"}</span>
        ),
        meta: { group: "Requirements" },
      },
      {
        accessorKey: "requirements_status",
        header: "Status",
        size: 140,
        cell: ({ getValue }) => <span className="text-sm">{String(getValue() || "") || "Pending"}</span>,
        meta: { group: "Requirements" },
      },
      {
        accessorKey: "requirements_date_completion",
        header: "Date of Completion",
        size: 140,
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return val ? new Date(val).toLocaleDateString() : "—";
        },
        meta: { group: "Requirements" },
      },
      
      // ===== CLEARANCE =====
      {
        accessorKey: "clearance_date_issued",
        header: "Date Issued",
        size: 120,
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return val ? new Date(val).toLocaleDateString() : "—";
        },
        meta: { group: "Clearance" },
      },
      {
        accessorKey: "clearance_date_of_payment",
        header: "Date of Payment",
        size: 130,
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return val ? new Date(val).toLocaleDateString() : "—";
        },
        meta: { group: "Clearance" },
      },
      {
        accessorKey: "clearance_control_number",
        header: "Clearance Control No.",
        size: 150,
        cell: ({ getValue }) => <span className="text-sm font-mono">{String(getValue() || "") || "—"}</span>,
        meta: { group: "Clearance" },
      },
      {
        accessorKey: "clearance_or_number",
        header: "OR Number",
        size: 120,
        cell: ({ getValue }) => <span className="text-sm font-mono">{String(getValue() || "") || "—"}</span>,
        meta: { group: "Clearance" },
      },
      {
        accessorKey: "clearance_date_received",
        header: "Date Received",
        size: 120,
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return val ? new Date(val).toLocaleDateString() : "—";
        },
        meta: { group: "Clearance" },
      },
      {
        accessorKey: "clearance_status",
        header: "Status",
        size: 140,
        cell: ({ getValue }) => <span className="text-sm">{String(getValue() || "") || "Pending"}</span>,
        meta: { group: "Clearance" },
      },

      // ===== DENR (if letter only) =====
      {
        accessorKey: "denr_date_received_by_inspectors",
        header: "Date Received by Inspectors",
        size: 160,
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return val ? new Date(val).toLocaleDateString() : "—";
        },
        meta: { group: "DENR" },
      },
      {
        accessorKey: "denr_date_submitted_to_dept_head",
        header: "Date Submitted to Dept. Head (DENR Letter)",
        size: 200,
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return val ? new Date(val).toLocaleDateString() : "—";
        },
        meta: { group: "DENR" },
      },
      {
        accessorKey: "denr_date_released_to_inspectors",
        header: "Date Released to Inspectors",
        size: 160,
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return val ? new Date(val).toLocaleDateString() : "—";
        },
        meta: { group: "DENR" },
      },
      {
        accessorKey: "denr_date_received",
        header: "Date Received",
        size: 120,
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return val ? new Date(val).toLocaleDateString() : "—";
        },
        meta: { group: "DENR" },
      },
      {
        accessorKey: "denr_status",
        header: "Status",
        size: 140,
        cell: ({ getValue }) => <span className="text-sm">{String(getValue() || "") || "Pending"}</span>,
        meta: { group: "DENR" },
      },
      {
        id: "actions",
        header: "Actions",
        size: 80,
        cell: ({ row }) => (
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setRequestToArchive(row.original);
                setIsArchiveConfirmationOpen(true);
              }}
              title={row.original.is_archived ? "Restore request" : "Archive request"}
            >
              {row.original.is_archived ? (
                <ArchiveRestore className="h-4 w-4" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
            </Button>
          </div>
        ),
        meta: { group: "Actions" },
      },
    ],
    [updateTypeMutation, updateReceivingMutation, updateRequirementsMutation, updateClearanceMutation, updateDENRMutation, updateArchiveMutation]
  );

  return (
    <div className="flex flex-col h-full bg-[#F9FBFC]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Tree Request Tracking</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                4-phase tracking: Receiving → Inspection → Requirements → Clearance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading}
                className="border border-gray-200 bg-white rounded-lg h-9 w-9 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6">
            <nav className="flex space-x-8 -mb-px">
              <button
                onClick={() => handleViewChange("list")}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  view === "list"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <List className="w-4 h-4 inline mr-2" />
                Request List
              </button>
              <button
                onClick={() => handleViewChange("dashboard")}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  view === "dashboard"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Dashboard
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC] space-y-6">
          
          {view === "dashboard" ? (
            <EnhancedISODashboard onViewRequest={(request) => {
              setSelectedRequest(request);
              setView("list");
            }} />
          ) : (
            <>
              {/* Filters and Table */}
              <Card>
                <CardHeader className="pb-4 space-y-4">
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search requests..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 w-64 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={showArchived ? "secondary" : "outline"}
                        onClick={() => setShowArchived(!showArchived)}
                        className="h-9 gap-2"
                      >
                        {showArchived ? (
                          <>
                            <ArchiveRestore className="w-4 h-4" />
                            Archived
                          </>
                        ) : (
                          <>
                            <Archive className="w-4 h-4" />
                            Active
                          </>
                        )}
                      </Button>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as ISORequestType | "all")}
                        className="h-9 px-3 rounded-lg border border-gray-200 text-sm"
                      >
                        <option value="all">All Types</option>
                        <option value="cutting">Tree Cutting</option>
                        <option value="pruning">Pruning</option>
                        <option value="ball_out">Ball-out</option>
                        {standards
                          .filter(s => !['cutting', 'pruning', 'ball_out'].includes(s.request_type))
                          .map(s => (
                            <option key={s.request_type} value={s.request_type}>{s.request_type}</option>
                          ))
                        }
                      </select>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as ISOOverallStatus | "all")}
                        className="h-9 px-3 rounded-lg border border-gray-200 text-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="receiving">Receiving</option>
                        <option value="inspection">Inspection</option>
                        <option value="requirements">Requirements</option>
                        <option value="clearance">Clearance</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="h-9 px-3 rounded-lg border border-gray-200 text-sm"
                      >
                        <option value="all">All Years</option>
                        {availableYears.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                                    <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <DataTable
                      data={filteredRequests}
                      columns={columns}
                      onRowClick={handleRowClick}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

      {/* Dialogs */}
      {showCreateForm && (
        <ISOTreeRequestForm
          mode="add"
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            // React Query will auto-update the list
          }}
        />
      )}

      {selectedRequest && (
        <ISOTreeRequestDetails
          request={selectedRequest}
          onClose={handleCloseDetails}
          onUpdate={handleCloseDetails}
        />
      )}

      {/* Confirmation Dialog */}
      <Dialog open={isArchiveConfirmationOpen} onOpenChange={setIsArchiveConfirmationOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{requestToArchive?.is_archived ? "Restore Request" : "Archive Request"}</DialogTitle>
                <DialogDescription>
                    Are you sure you want to {requestToArchive?.is_archived ? "restore" : "archive"} request <strong>{requestToArchive?.request_number ?? ""}</strong>?
                    {!requestToArchive?.is_archived && " It will be moved to the archived list and hidden from the main table."}
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsArchiveConfirmationOpen(false)}>Cancel</Button>
                <Button variant={requestToArchive?.is_archived ? "default" : "destructive"} onClick={() => {
                    if (requestToArchive) {
                         updateArchiveMutation.mutate({ 
                            id: requestToArchive.id, 
                            is_archived: !requestToArchive.is_archived 
                          });
                          setIsArchiveConfirmationOpen(false);
                          setRequestToArchive(null);
                    }
                }}>
                    {requestToArchive?.is_archived ? "Restore" : "Archive"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ISOTreeRequestsPage;
