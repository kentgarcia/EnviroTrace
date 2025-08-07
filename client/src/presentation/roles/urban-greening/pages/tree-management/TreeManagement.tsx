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
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"add" | "edit" | "view">("add");
    const [selectedRequest, setSelectedRequest] = useState<TreeRequest | null>(null);
    const [selectedRowForDetails, setSelectedRowForDetails] = useState<TreeRequest | null>(null);

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
            case "on_hold": return "bg-gray-100 text-gray-800";
            case "for_signature": return "bg-indigo-100 text-indigo-800";
            case "payment_pending": return "bg-orange-100 text-orange-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    // Column definitions for tree requests
    const treeColumns: ColumnDef<TreeRequest>[] = useMemo(() => {
        const baseColumns = [
            {
                accessorKey: "request_number",
                header: "Request No.",
            },
            {
                accessorKey: "requester_name",
                header: "Requester",
            },
            {
                accessorKey: "property_address",
                header: "Address",
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
                accessorKey: "status",
                header: "Status",
                cell: ({ getValue }) => {
                    const status = getValue() as string;
                    const getStatusIcon = (status: string) => {
                        switch (status) {
                            case "filed":
                                return <FileText className="w-4 h-4" />;
                            case "on_hold":
                                return <Clock className="w-4 h-4" />;
                            case "for_signature":
                                return <FileText className="w-4 h-4" />;
                            case "payment_pending":
                                return <AlertTriangle className="w-4 h-4" />;
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
        ];

        // Hide some columns when details view is active to save space
        if (selectedRowForDetails) {
            return baseColumns.filter(col =>
                col.accessorKey === "request_number" ||
                col.accessorKey === "requester_name" ||
                col.accessorKey === "status"
            );
        }

        return baseColumns;
    }, [selectedRowForDetails]);

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

    const handleRowClick = (row: any) => {
        setSelectedRowForDetails(row.original);
    };

    const handleCloseDetails = () => {
        setSelectedRowForDetails(null);
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
            "all" // Remove urgency filter
        );
    }, [allRequests, searchTerm, statusFilter, typeFilter]);

    // Calculate statistics
    const statusCounts = useMemo(() => getStatusCounts(allRequests), [allRequests]);
    const typeCounts = useMemo(() => getTypeCounts(allRequests), [allRequests]);
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
                <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">

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

                    <div className={`grid gap-6 mt-6 transition-all duration-300 ${selectedRowForDetails
                            ? 'grid-cols-1 lg:grid-cols-2'
                            : 'grid-cols-1 lg:grid-cols-3'
                        }`}>
                        <div className={selectedRowForDetails ? 'lg:col-span-1' : 'lg:col-span-2'}>
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
                                                    placeholder="Search by request number, requester, or address..."
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
                                            <option value="on_hold">On Hold</option>
                                            <option value="for_signature">For Signature</option>
                                            <option value="payment_pending">Payment Pending</option>
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
                                            onRowClick={handleRowClick}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg">
                                        {selectedRowForDetails ? 'Request Details' : 'Statistics'}
                                    </CardTitle>
                                    {selectedRowForDetails && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCloseDetails}
                                            className="gap-1"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Hide
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {selectedRowForDetails ? (
                                        // Show selected row details
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Request Number:</span>
                                                <Badge variant="outline">{selectedRowForDetails.request_number}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Type:</span>
                                                <Badge variant="outline">{getRequestTypeLabel(selectedRowForDetails.request_type)}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Status:</span>
                                                <Badge className={getStatusColor(selectedRowForDetails.status)}>
                                                    {selectedRowForDetails.status.replace("_", " ").toUpperCase()}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Requester:</span>
                                                <span className="text-sm font-medium">{selectedRowForDetails.requester_name}</span>
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-sm text-gray-600">Address:</span>
                                                <p className="text-sm font-medium">{selectedRowForDetails.property_address}</p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Date:</span>
                                                <span className="text-sm font-medium">{selectedRowForDetails.request_date}</span>
                                            </div>
                                            {selectedRowForDetails.notes && (
                                                <div className="space-y-2">
                                                    <span className="text-sm text-gray-600">Notes:</span>
                                                    <p className="text-sm">{selectedRowForDetails.notes}</p>
                                                </div>
                                            )}

                                            {/* Inspection Information */}
                                            <div className="pt-2 border-t">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Inspection Information</h4>

                                                {selectedRowForDetails.inspectors && selectedRowForDetails.inspectors.length > 0 && (
                                                    <div className="space-y-2">
                                                        <span className="text-sm text-gray-600">Inspectors:</span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {selectedRowForDetails.inspectors.map((inspector, index) => (
                                                                <Badge key={index} variant="secondary" className="text-xs">
                                                                    {inspector}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedRowForDetails.trees_and_quantities && selectedRowForDetails.trees_and_quantities.length > 0 && (
                                                    <div className="space-y-2">
                                                        <span className="text-sm text-gray-600">Trees & Quantities:</span>
                                                        <div className="space-y-1">
                                                            {selectedRowForDetails.trees_and_quantities.map((tree, index) => (
                                                                <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                                                                    {tree}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedRowForDetails.picture_links && selectedRowForDetails.picture_links.length > 0 && (
                                                    <div className="space-y-2">
                                                        <span className="text-sm text-gray-600">Pictures:</span>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {selectedRowForDetails.picture_links.map((link, index) => (
                                                                <a
                                                                    key={index}
                                                                    href={link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-blue-600 hover:text-blue-800 underline truncate"
                                                                >
                                                                    Picture {index + 1}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {(!selectedRowForDetails.inspectors || selectedRowForDetails.inspectors.length === 0) &&
                                                    (!selectedRowForDetails.trees_and_quantities || selectedRowForDetails.trees_and_quantities.length === 0) &&
                                                    (!selectedRowForDetails.picture_links || selectedRowForDetails.picture_links.length === 0) && (
                                                        <p className="text-sm text-gray-500 italic">No inspection information available</p>
                                                    )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="pt-4 border-t space-y-2">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Actions</h4>
                                                <div className="space-y-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full justify-start"
                                                        onClick={() => handleEditRequest(selectedRowForDetails)}
                                                    >
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit Request
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full justify-start text-red-600 hover:text-red-700"
                                                        onClick={() => handleDeleteRequest(selectedRowForDetails)}
                                                    >
                                                        <Trash className="w-4 h-4 mr-2" />
                                                        Delete Request
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Show statistics
                                        <>
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
                                                        <span className="text-sm text-gray-600">On Hold:</span>
                                                        <Badge className="bg-gray-100 text-gray-800">{statusCounts.on_hold}</Badge>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">For Signature:</span>
                                                        <Badge className="bg-indigo-100 text-indigo-800">{statusCounts.for_signature}</Badge>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Payment Pending:</span>
                                                        <Badge className="bg-orange-100 text-orange-800">{statusCounts.payment_pending}</Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Processing Information - Connected to Fee Records */}
                                            <div className="pt-2 border-t">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Processing Information</h4>
                                                <div className="space-y-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full justify-start"
                                                        onClick={() => {/* Navigate to Fee Records */ }}
                                                    >
                                                        <FileText className="w-4 h-4 mr-2" />
                                                        View Fee Records
                                                    </Button>
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
                                        </>
                                    )}
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
