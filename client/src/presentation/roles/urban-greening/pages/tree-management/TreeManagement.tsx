import React, { useState, useMemo } from "react";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/presentation/components/shared/ui/dialog";
import { Alert, AlertDescription } from "@/presentation/components/shared/ui/alert";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";
import {
    Plus,
    Edit,
    Trash,
    Eye,
    Search,
    CheckCircle,
    Clock,
    XCircle,
    AlertTriangle,
    TreePine,
    Users,
    FileText
} from "lucide-react";
import TreeRequestForm from "./components/TreeRequestForm";

import {
    TreeRequest,
    useTreeRequestMutations,
    fetchTreeRequests,
    getStatusCounts,
    getTypeCounts,
    getUrgencyCounts,
    getTotalFeeAmount,
    filterRequests
} from "./logic/useTreeRequests";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

const TreeManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [urgencyFilter, setUrgencyFilter] = useState("all");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"add" | "edit" | "view">("add");
    const [selectedRequest, setSelectedRequest] = useState<TreeRequest | null>(null);

    const { updateMutation, createMutation, deleteMutation } = useTreeRequestMutations();

    // Use React Query for data fetching
    const { data: allRequests = [], isLoading, error, refetch } = useQuery({
        queryKey: ["tree-requests"],
        queryFn: fetchTreeRequests,
    });

    // Utility functions
    const getRequestTypeLabel = (type: string) => {
        switch (type) {
            case "pruning": return "Pruning";
            case "cutting": return "Tree Cutting";
            case "violation_complaint": return "Violation/Complaint";
            default: return type;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "filed": return "bg-blue-100 text-blue-800";
            case "under_review": return "bg-yellow-100 text-yellow-800";
            case "approved": return "bg-green-100 text-green-800";
            case "rejected": return "bg-red-100 text-red-800";
            case "in_progress": return "bg-purple-100 text-purple-800";
            case "completed": return "bg-emerald-100 text-emerald-800";
            case "payment_pending": return "bg-orange-100 text-orange-800";
            case "for_signature": return "bg-indigo-100 text-indigo-800";
            case "on_hold": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case "low": return "bg-gray-100 text-gray-800";
            case "normal": return "bg-blue-100 text-blue-800";
            case "high": return "bg-orange-100 text-orange-800";
            case "emergency": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    // Column definitions for tree requests
    const treeColumns: ColumnDef<TreeRequest>[] = useMemo(() => [
        {
            accessorKey: "request_number",
            header: "Request No.",
        },
        {
            accessorKey: "request_type",
            header: "Type",
            cell: ({ getValue }) => (
                <Badge variant="outline">
                    {getRequestTypeLabel(getValue() as string)}
                </Badge>
            ),
        },
        {
            accessorKey: "requester_name",
            header: "Requester",
        },
        {
            accessorKey: "tree_species",
            header: "Tree Species",
        },
        {
            accessorKey: "tree_count",
            header: "Count",
        },
        {
            accessorKey: "urgency_level",
            header: "Urgency",
            cell: ({ getValue }) => {
                const urgency = getValue() as string;
                return (
                    <Badge className={getUrgencyColor(urgency)}>
                        {urgency.toUpperCase()}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ getValue }) => {
                const status = getValue() as string;
                const getStatusIcon = (status: string) => {
                    switch (status) {
                        case "completed":
                            return <CheckCircle className="w-4 h-4" />;
                        case "in_progress":
                            return <Clock className="w-4 h-4" />;
                        case "rejected":
                            return <XCircle className="w-4 h-4" />;
                        case "approved":
                            return <CheckCircle className="w-4 h-4" />;
                        default:
                            return <FileText className="w-4 h-4" />;
                    }
                };

                return (
                    <Badge className={getStatusColor(status)}>
                        {getStatusIcon(status)}
                        <span className="ml-1">{status.replace("_", " ").toUpperCase()}</span>
                    </Badge>
                );
            },
        },
        {
            accessorKey: "request_date",
            header: "Date",
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewRequest(row.original)}
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRequest(row.original)}
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRequest(row.original)}
                    >
                        <Trash className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ], []);

    const handleAddRequest = () => {
        setFormMode("add");
        setSelectedRequest(null);
        setIsFormOpen(true);
    };

    const handleEditRequest = (request: TreeRequest) => {
        setFormMode("edit");
        setSelectedRequest(request);
        setIsFormOpen(true);
    };

    const handleViewRequest = (request: TreeRequest) => {
        setFormMode("view");
        setSelectedRequest(request);
        setIsFormOpen(true);
    };

    const handleDeleteRequest = (request: TreeRequest) => {
        if (confirm(`Are you sure you want to delete tree request ${request.request_number}?`)) {
            deleteMutation.mutate(request.id);
        }
    };

    const handleFormSave = (data: any) => {
        if (formMode === "add") {
            createMutation.mutate(data);
            setIsFormOpen(false);
        } else if (formMode === "edit" && selectedRequest) {
            updateMutation.mutate({
                id: selectedRequest.id,
                field: "status", // This should be replaced with proper field updates
                value: data
            });
            setIsFormOpen(false);
        }
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
        setSelectedRequest(null);
    };

    // Filter data based on search and filters
    const filteredData = useMemo(() => {
        return filterRequests(
            allRequests,
            searchTerm,
            statusFilter,
            typeFilter,
            urgencyFilter
        );
    }, [allRequests, searchTerm, statusFilter, typeFilter, urgencyFilter]);

    // Calculate statistics
    const statusCounts = useMemo(() => getStatusCounts(allRequests), [allRequests]);
    const typeCounts = useMemo(() => getTypeCounts(allRequests), [allRequests]);
    const urgencyCounts = useMemo(() => getUrgencyCounts(allRequests), [allRequests]);
    const totalFeeAmount = useMemo(() => getTotalFeeAmount(allRequests), [allRequests]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBarContainer dashboardType="urban-greening" />
                <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
                    <h1 className="text-2xl font-semibold text-gray-900">Tree Management Requests</h1>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">
                    <div className="px-6">
                        <ColorDivider />
                    </div>

                    {error && (
                        <div className="mt-6">
                            <Alert className="border-red-200 bg-red-50">
                                <AlertDescription className="text-red-700">
                                    Failed to load tree management requests. Please try again.
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => refetch()}
                                        className="ml-2 h-auto p-0 text-red-700 underline"
                                    >
                                        Try Again
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle>Tree Management Requests</CardTitle>
                                    <Button
                                        onClick={handleAddRequest}
                                        size="sm"
                                        disabled={isLoading}
                                    >
                                        Add New Request
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {/* Filters and Search */}
                                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <Input
                                                    placeholder="Search by request number, requester, or tree species..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="px-3 py-2 border rounded-md"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="filed">Filed</option>
                                            <option value="under_review">Under Review</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="payment_pending">Payment Pending</option>
                                            <option value="for_signature">For Signature</option>
                                            <option value="on_hold">On Hold</option>
                                        </select>
                                        <select
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                            className="px-3 py-2 border rounded-md"
                                        >
                                            <option value="all">All Types</option>
                                            <option value="pruning">Pruning</option>
                                            <option value="cutting">Tree Cutting</option>
                                            <option value="violation_complaint">Violation/Complaint</option>
                                        </select>
                                        <select
                                            value={urgencyFilter}
                                            onChange={(e) => setUrgencyFilter(e.target.value)}
                                            className="px-3 py-2 border rounded-md"
                                        >
                                            <option value="all">All Urgency</option>
                                            <option value="low">Low</option>
                                            <option value="normal">Normal</option>
                                            <option value="high">High</option>
                                            <option value="emergency">Emergency</option>
                                        </select>
                                    </div>

                                    {isLoading && allRequests.length === 0 ? (
                                        <div className="flex items-center justify-center h-32">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                                <p className="mt-2 text-sm text-gray-600">Loading requests...</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <DataTable
                                            data={filteredData}
                                            columns={treeColumns}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Statistics</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Total Requests:</span>
                                        <Badge variant="outline">{allRequests.length}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Total Fees:</span>
                                        <span className="font-semibold">{formatCurrency(totalFeeAmount)}</span>
                                    </div>

                                    {/* Status Breakdown */}
                                    <div className="pt-2 border-t">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">By Status</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Filed:</span>
                                                <Badge className="bg-blue-100 text-blue-800">{statusCounts.filed}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Under Review:</span>
                                                <Badge className="bg-yellow-100 text-yellow-800">{statusCounts.under_review}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Approved:</span>
                                                <Badge className="bg-green-100 text-green-800">{statusCounts.approved}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">In Progress:</span>
                                                <Badge className="bg-purple-100 text-purple-800">{statusCounts.in_progress}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Completed:</span>
                                                <Badge className="bg-emerald-100 text-emerald-800">{statusCounts.completed}</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Type Breakdown */}
                                    <div className="pt-2 border-t">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">By Type</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Pruning:</span>
                                                <Badge className="bg-green-100 text-green-800">{typeCounts.pruning}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Tree Cutting:</span>
                                                <Badge className="bg-orange-100 text-orange-800">{typeCounts.cutting}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Violations:</span>
                                                <Badge className="bg-red-100 text-red-800">{typeCounts.violation_complaint}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>
                            {formMode === "add" && "Add Tree Management Request"}
                            {formMode === "edit" && "Edit Tree Management Request"}
                            {formMode === "view" && "View Tree Management Request"}
                        </DialogTitle>
                    </DialogHeader>
                    <TreeRequestForm
                        mode={formMode}
                        initialData={selectedRequest}
                        onSave={handleFormSave}
                        onCancel={handleFormCancel}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TreeManagement;
