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
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchTreeRequests,
  TreeRequestWithAnalytics,
  ISOOverallStatus,
  ISORequestType,
} from "@/core/api/tree-management-request-api";
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
  Settings
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import ISOTreeRequestForm from "./components/ISOTreeRequestForm";
import ISOTreeRequestDetails from "./components/ISOTreeRequestDetails";
import EnhancedISODashboard from "./components/EnhancedISODashboard";
import ProcessingStandardsSettings from "./components/ProcessingStandardsSettings";

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

const ISOTreeRequestsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"list" | "dashboard" | "settings">("list");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TreeRequestWithAnalytics | null>(null);
  const [statusFilter, setStatusFilter] = useState<ISOOverallStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ISORequestType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ["tree-requests", statusFilter, typeFilter],
    queryFn: () => fetchTreeRequests({
      status: statusFilter !== "all" ? statusFilter : undefined,
      request_type: typeFilter !== "all" ? typeFilter : undefined,
    }),
  });

  // Handle view changes with data refresh
  const handleViewChange = (newView: "list" | "dashboard" | "settings") => {
    setView(newView);
    // Invalidate queries based on the new view
    if (newView === "dashboard") {
      queryClient.invalidateQueries({ queryKey: ["tree-requests-dashboard"] });
    } else if (newView === "settings") {
      queryClient.invalidateQueries({ queryKey: ["processing-standards"] });
      queryClient.invalidateQueries({ queryKey: ["dropdown-options"] });
    } else if (newView === "list") {
      queryClient.invalidateQueries({ queryKey: ["tree-requests"] });
    }
  };

  // Handle refresh based on current view
  const handleRefresh = () => {
    if (view === "dashboard") {
      queryClient.invalidateQueries({ queryKey: ["tree-requests-dashboard"] });
    } else if (view === "settings") {
      queryClient.invalidateQueries({ queryKey: ["processing-standards"] });
      queryClient.invalidateQueries({ queryKey: ["dropdown-options"] });
    } else {
      refetch();
    }
  };

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    if (!searchQuery) return requests;
    const query = searchQuery.toLowerCase();
    return requests.filter(request =>
      request.request_number.toLowerCase().includes(query) ||
      request.receiving_name?.toLowerCase().includes(query) ||
      request.receiving_address?.toLowerCase().includes(query)
    );
  }, [requests, searchQuery]);

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
        size: 140,
        cell: ({ getValue }) => {
          const type = getValue() as ISORequestType;
          const config = REQUEST_TYPE_CONFIG[type];
          return (
            <Badge className={config.color}>
              {config.icon}
              <span className="ml-1">{config.label}</span>
            </Badge>
          );
        },
        meta: { group: "Receiving" },
      },
      {
        accessorKey: "receiving_request_status",
        header: "Status of Request",
        size: 140,
        cell: ({ getValue }) => <span className="text-sm">{String(getValue() || "") || "—"}</span>,
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
        size: 120,
        cell: ({ getValue }) => <span className="text-sm">{String(getValue() || "") || "—"}</span>,
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
        size: 120,
        cell: ({ getValue }) => <span className="text-sm">{String(getValue() || "") || "—"}</span>,
        meta: { group: "Clearance" },
      },
    ],
    []
  );

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBarContainer dashboardType="urban-greening" />

        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Tree Request Tracking</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                ISO-compliant 4-phase tracking: Receiving → Inspection → Requirements → Clearance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading}
                className="rounded-lg h-9 w-9"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button
                variant={view === "list" ? "default" : "outline"}
                onClick={() => handleViewChange("list")}
                className="rounded-lg"
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
              <Button
                variant={view === "dashboard" ? "default" : "outline"}
                onClick={() => handleViewChange("dashboard")}
                className="rounded-lg"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={view === "settings" ? "default" : "outline"}
                onClick={() => handleViewChange("settings")}
                className="rounded-lg"
              >
                <Settings className="w-4 h-4 mr-2" />
                Standards
              </Button>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-[#0033a0] hover:bg-[#002a80] text-white rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC] space-y-6">
          {view === "dashboard" ? (
            <EnhancedISODashboard onViewRequest={(request) => {
              setSelectedRequest(request);
              setView("list");
            }} />
          ) : view === "settings" ? (
            <ProcessingStandardsSettings />
          ) : (
            <>
              {/* Filters and Table */}
              <Card className="border-0">
                <CardHeader className="pb-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">All Tree Requests</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Comprehensive view with all fields categorized by phase
                      </p>
                    </div>
                  </div>
                  
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
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as ISORequestType | "all")}
                        className="h-9 px-3 rounded-lg border border-gray-200 text-sm"
                      >
                        <option value="all">All Types</option>
                        <option value="cutting">Tree Cutting</option>
                        <option value="pruning">Pruning</option>
                        <option value="ball_out">Ball-out</option>
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
    </div>
  );
};

export default ISOTreeRequestsPage;
