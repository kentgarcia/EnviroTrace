// client/src/presentation/roles/urban-greening/pages/tree-requests/TreeRequestsPage.tsx
/**
 * Tree Management Requests Page (DEPRECATED)
 * 
 * ⚠️ THIS PAGE HAS BEEN DEPRECATED ⚠️
 * Please use the new ISO Tree Request Tracking System instead.
 * This legacy page is maintained for historical reference only.
 * 
 * New system location: /urban-greening/tree-requests (ISOTreeRequestsPage)
 * Features: 4-phase tracking, delay monitoring, ISO compliance
 */

import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/presentation/components/shared/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/presentation/components/shared/ui/alert-dialog";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/presentation/components/shared/ui/tabs";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import {
  Plus,
  Search,
  RefreshCw,
  Axe,
  Scissors,
  AlertTriangle,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  TreePine,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
  useTreeManagementRequests,
  useRequestStats,
  useTreeManagementRequestMutations,
} from "./logic/useTreeManagementRequests";
import {
  TreeManagementRequest,
  RequestType,
  RequestStatus,
} from "@/core/api/tree-management-request-api";
import TreeRequestForm from "./components/TreeRequestForm";
import TreeRequestDetails from "./components/TreeRequestDetails";

const REQUEST_TYPE_CONFIG: Record<RequestType, { label: string; icon: React.ReactNode; color: string }> = {
  cutting: { label: "Tree Cutting", icon: <Axe className="w-4 h-4" />, color: "bg-red-100 text-red-800" },
  pruning: { label: "Pruning", icon: <Scissors className="w-4 h-4" />, color: "bg-yellow-100 text-yellow-800" },
  violation: { label: "Violation", icon: <AlertTriangle className="w-4 h-4" />, color: "bg-orange-100 text-orange-800" },
};

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string }> = {
  filed: { label: "Filed", color: "bg-gray-100 text-gray-800" },
  on_hold: { label: "On Hold", color: "bg-yellow-100 text-yellow-800" },
  for_signature: { label: "For Signature", color: "bg-blue-100 text-blue-800" },
  payment_pending: { label: "Payment Pending", color: "bg-orange-100 text-orange-800" },
};

const TreeRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<RequestType | "all">("all");
  const [yearFilter, setYearFilter] = useState<number | undefined>(new Date().getFullYear());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedRequest, setSelectedRequest] = useState<TreeManagementRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<TreeManagementRequest | null>(null);
  const [showDeprecationWarning, setShowDeprecationWarning] = useState(true);

  // Show deprecation warning on mount
  useEffect(() => {
    const hasSeenWarning = sessionStorage.getItem('legacy-tree-requests-warning');
    if (!hasSeenWarning) {
      setShowDeprecationWarning(true);
    }
  }, []);

  // Generate year options (2020 to current year)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let year = currentYear; year >= 2020; year--) {
      years.push(year);
    }
    return years;
  }, []);

  const { data: requests = [], isLoading, refetch } = useTreeManagementRequests({
    status: statusFilter === "all" ? undefined : statusFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
    search: searchTerm || undefined,
    year: yearFilter,
  });

  const { data: stats } = useRequestStats();
  const { deleteMutation } = useTreeManagementRequestMutations();

  const handleDeleteClick = (request: TreeManagementRequest) => {
    setRequestToDelete(request);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (requestToDelete) {
      await deleteMutation.mutateAsync(requestToDelete.id);
      setDeleteConfirmOpen(false);
      setRequestToDelete(null);
    }
  };

  // Filter requests
  const filteredRequests = useMemo(() => {
    let result = requests;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.request_number.toLowerCase().includes(search) ||
          r.requester_name.toLowerCase().includes(search) ||
          r.property_address.toLowerCase().includes(search)
      );
    }
    return result;
  }, [requests, searchTerm]);

  const columns: ColumnDef<TreeManagementRequest>[] = useMemo(
    () => [
      {
        accessorKey: "request_number",
        header: "Request No.",
        cell: ({ getValue }) => (
          <span className="font-mono text-sm">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: "request_type",
        header: "Type",
        cell: ({ getValue }) => {
          const type = getValue() as RequestType;
          const config = REQUEST_TYPE_CONFIG[type] || { label: type || "Unknown", icon: <FileText className="w-4 h-4" />, color: "bg-gray-100 text-gray-800" };
          return (
            <Badge className={config.color}>
              {config.icon}
              <span className="ml-1">{config.label}</span>
            </Badge>
          );
        },
      },
      {
        accessorKey: "requester_name",
        header: "Requester",
      },
      {
        accessorKey: "property_address",
        header: "Address",
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-600 truncate max-w-[200px] block">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as RequestStatus;
          const config = STATUS_CONFIG[status] || { label: status || "Unknown", color: "bg-gray-100 text-gray-800" };
          return <Badge className={config.color}>{config.label}</Badge>;
        },
      },
      {
        accessorKey: "request_date",
        header: "Date",
        cell: ({ getValue }) => {
          const date = getValue() as string;
          return date ? new Date(date).toLocaleDateString() : "-";
        },
      },
      {
        accessorKey: "linked_trees",
        header: "Trees",
        cell: ({ row }) => {
          const trees = row.original.linked_trees || [];
          const newTrees = row.original.new_trees || [];
          const total = trees.length + newTrees.length;
          return (
            <Badge variant="outline">
              <TreePine className="w-3 h-3 mr-1" />
              {total}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRequest(row.original);
                setShowDetails(true);
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(row.original);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const handleAddRequest = () => {
    setFormMode("add");
    setSelectedRequest(null);
    setIsFormOpen(true);
  };

  const handleEditRequest = (request: TreeManagementRequest) => {
    setFormMode("edit");
    setSelectedRequest(request);
    setIsFormOpen(true);
  };

  const handleRowClick = (row: any) => {
    setSelectedRequest(row.original);
    setShowDetails(true);
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBarContainer dashboardType="urban-greening" />

        {/* Deprecation Warning Banner */}
        {showDeprecationWarning && (
          <div className="bg-orange-50 border-b-2 border-orange-200 px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-base font-semibold text-orange-900">
                    ⚠️ This page has been deprecated
                  </h2>
                  <p className="text-sm text-orange-800 mt-1">
                    The legacy Tree Request system is no longer maintained. Please use the new <strong>ISO Tree Request Tracking System</strong> which features:
                  </p>
                  <ul className="text-sm text-orange-800 mt-2 ml-4 list-disc space-y-1">
                    <li>4-phase workflow (Receiving → Inspection → Requirements → Clearance)</li>
                    <li>Automated delay monitoring and analytics</li>
                    <li>ISO compliance and configurable processing standards</li>
                    <li>Improved user interface and better reporting</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate({ to: "/urban-greening/tree-requests" })}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Go to New System
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    sessionStorage.setItem('legacy-tree-requests-warning', 'true');
                    setShowDeprecationWarning(false);
                  }}
                  className="border-orange-300"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Tree Management Requests <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-800 border-orange-300">LEGACY</Badge>
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Cutting permits, pruning requests, and violation reports
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isLoading}
                className="rounded-lg h-9 w-9"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button
                onClick={handleAddRequest}
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
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.total_requests || 0}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.filed || 0}</div>
                    <div className="text-xs text-gray-500">Filed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.on_hold || 0}</div>
                    <div className="text-xs text-gray-500">On Hold</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Edit className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.for_signature || 0}</div>
                    <div className="text-xs text-gray-500">For Signature</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.payment_pending || 0}</div>
                    <div className="text-xs text-gray-500">Payment Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TreePine className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.trees_affected || 0}</div>
                    <div className="text-xs text-gray-500">Trees Affected</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fees Collected - Full Width */}
          <Card className="border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    ₱{(stats?.fees_collected || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-gray-500">Fees Collected (Paid)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters and Table */}
          <Card className="border-0">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as RequestType | "all")}
                    className="h-9 px-3 rounded-lg border border-gray-200 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="cutting">Tree Cutting</option>
                    <option value="pruning">Pruning</option>
                    <option value="violation">Violation</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as RequestStatus | "all")}
                    className="h-9 px-3 rounded-lg border border-gray-200 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="filed">Filed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="for_signature">For Signature</option>
                    <option value="payment_pending">Payment Pending</option>
                  </select>
                  <select
                    value={yearFilter || ""}
                    onChange={(e) => setYearFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="h-9 px-3 rounded-lg border border-gray-200 text-sm"
                  >
                    <option value="">All Years</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredRequests}
                columns={columns}
                onRowClick={handleRowClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Request Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl rounded-2xl border-none p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="bg-[#0033a0] p-6 m-0 border-none shrink-0">
            <DialogTitle className="text-xl font-bold text-white">
              {formMode === "add" ? "New Tree Management Request" : "Edit Request"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 overflow-y-auto">
            <TreeRequestForm
              mode={formMode}
              initialData={selectedRequest}
              onClose={() => setIsFormOpen(false)}
              onSuccess={() => {
                setIsFormOpen(false);
                refetch();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl rounded-2xl border-none p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="bg-[#0033a0] p-6 m-0 border-none shrink-0">
            <DialogTitle className="text-xl font-bold text-white">Request Details</DialogTitle>
          </DialogHeader>
          <div className="p-6 overflow-y-auto">
            {selectedRequest && (
              <TreeRequestDetails
                request={selectedRequest}
                onClose={() => setShowDetails(false)}
                onEdit={() => {
                  setShowDetails(false);
                  handleEditRequest(selectedRequest);
                }}
                onRefresh={() => refetch()}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete request{" "}
              <strong>{requestToDelete?.request_number}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TreeRequestsPage;
