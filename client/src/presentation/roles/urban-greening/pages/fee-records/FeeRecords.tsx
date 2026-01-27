import React, { useState, useMemo, useCallback } from "react";
import { DataTable } from "@/presentation/components/shared/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/presentation/components/shared/ui/dialog";
import { Alert, AlertDescription } from "@/presentation/components/shared/ui/alert";
import { Plus, Search, CheckCircle, Clock, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import FeeRecordForm from "./components/FeeRecordForm";

import {
    FeeRecord,
    useFeeRecordMutations,
    fetchFeeRecords,
    getStatusCounts,
    getTotalAmount,
    getPaidAmount,
    filterRecords
} from "./logic/useFeeRecords";
import {
    convertToCSV,
    downloadCSV,
    formatCurrency,
    getStatusColor,
    getTypeLabel
} from "./logic/utils";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

const FeeRecords: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "pending" | "paid">("pending");
    const [typeFilter, setTypeFilter] = useState("all");
    const [yearFilter, setYearFilter] = useState<number | "all">(currentYear); // Default to current year
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"add">("add");
    const [selectedRecord, setSelectedRecord] = useState<FeeRecord | null>(null);
    const [selectedRowForDetails, setSelectedRowForDetails] = useState<FeeRecord | null>(null);
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { updateMutation, createMutation, deleteMutation, fullUpdateMutation } = useFeeRecordMutations();

    // Use React Query for data fetching with year filter
    const { data: allRecords = [], isLoading, error, refetch } = useQuery({
        queryKey: ["fee-records", yearFilter],
        queryFn: () => fetchFeeRecords(yearFilter === "all" ? undefined : (yearFilter as number)),
    });

    // Column definitions for fee records
    const feeColumns: ColumnDef<FeeRecord>[] = useMemo(() => {
        const base = [
            { accessorKey: "reference_number", header: "Reference No." },
            {
                accessorKey: "type",
                header: "Type",
                cell: ({ getValue }: any) => (
                    <Badge variant="outline">{getTypeLabel(getValue() as string)}</Badge>
                ),
            },
            { accessorKey: "payer_name", header: "Payer" },
            {
                accessorKey: "amount",
                header: "Amount",
                cell: ({ getValue }: any) => formatCurrency(Number(getValue())),
            },
            { accessorKey: "date", header: "Date" },
            {
                accessorKey: "or_number",
                header: "OR Number",
                cell: ({ getValue }: any) => (
                    <span className="font-mono font-medium text-blue-700">{getValue() || "---"}</span>
                ),
            },
            {
                accessorKey: "payment_date",
                header: "Payment Date",
                cell: ({ getValue }: any) => getValue() || "---",
            },
        ] as ColumnDef<FeeRecord>[];

        // Add Status column if not in specific status tabs
        if (activeTab === "all") {
            base.push({
                accessorKey: "status",
                header: "Status",
                cell: ({ getValue }: any) => {
                    const status = getValue() as string;
                    const getStatusIcon = (status: string) => {
                        switch (status) {
                            case "paid":
                                return <CheckCircle className="w-4 h-4" />;
                            case "pending":
                                return <Clock className="w-4 h-4" />;
                            case "cancelled":
                                return <XCircle className="w-4 h-4" />;
                            default:
                                return <Clock className="w-4 h-4" />;
                        }
                    };
                    return (
                        <Badge className={getStatusColor(status)}>
                            {getStatusIcon(status)}
                            <span className="ml-1">{status.toUpperCase()}</span>
                        </Badge>
                    );
                },
            });
        }

        return base;
    }, [activeTab]);

    const handleRowSelect = useCallback((rows: any[]) => {
        setSelectedRows(rows);
    }, []);

    const handleExport = useCallback((data: any[]) => {
        // Convert to CSV and download
        const csv = convertToCSV(data);
        downloadCSV(csv, "fee-records.csv");
        toast.success(`Exported ${data.length} records`);
    }, []);

    const handleAddRecord = () => {
        setFormMode("add");
        setSelectedRecord(null);
        setIsFormOpen(true);
    };

    const handleRowClick = (row: any) => {
        setSelectedRowForDetails(row.original);
    };
    const handleCloseDetails = () => {
        setSelectedRowForDetails(null);
        setIsEditingDetails(false);
    };
    const handleStartInlineEdit = () => {
        if (selectedRowForDetails) setIsEditingDetails(true);
    };

    const handleDeleteSelected = () => {
        if (!selectedRowForDetails) return;
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedRowForDetails) return;
        deleteMutation.mutate(selectedRowForDetails.id);
        setSelectedRowForDetails(null);
        setIsDeleteDialogOpen(false);
    };

    const handleFormSave = (data: any) => {
        if (formMode === "add") {
            createMutation.mutate(data);
            setIsFormOpen(false);
        }
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
        setSelectedRecord(null);
    };

    // Generate year options dynamically from 2020 to current year
    const yearOptions = useMemo<number[]>(() => {
        const years: number[] = [];
        for (let year = currentYear; year >= 2020; year--) {
            years.push(year);
        }
        return years;
    }, [currentYear]);

    // Filter data based on search and filters (year filtering now done on backend)
    const filteredData = useMemo(() => {
        return filterRecords(
            allRecords,
            searchTerm,
            activeTab === "all" ? "all" : activeTab,
            typeFilter
        );
    }, [allRecords, searchTerm, activeTab, typeFilter]);

    // Calculate statistics
    const statusCounts = useMemo(() => getStatusCounts(allRecords), [allRecords]);
    const totalAmount = useMemo(() => getTotalAmount(allRecords), [allRecords]);
    const paidAmount = useMemo(() => getPaidAmount(allRecords), [allRecords]);

    return (
        <div className="flex flex-col h-full bg-[#F9FBFC]">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Fee Records</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">Manage and track environmental compliance fees</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => refetch()}
                                disabled={isLoading}
                                className="border border-gray-200 bg-white shadow-none rounded-lg h-9 w-9 flex items-center justify-center hover:bg-slate-50 transition-colors"
                            >
                                <RefreshCw className={`h-4 w-4 text-slate-600 ${isLoading ? "animate-spin" : ""}`} />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-[#F9FBFC]">

                    {error && (
                        <div className="mt-6">
                            <Alert className="border-red-200 bg-red-50">
                                <AlertDescription className="text-red-700">
                                    Failed to load fee records. Please try again.
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
                        <div className={`min-w-0 flex flex-col transition-all duration-300 lg:col-span-2`}>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="flex flex-col gap-4 w-full">
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Fee Records</CardTitle>
                                            <Button
                                                onClick={handleAddRecord}
                                                size="sm"
                                                disabled={isLoading}
                                                className="rounded-lg"
                                            >
                                                Add New Record
                                            </Button>
                                        </div>
                                        
                                        {/* Tabs Design */}
                                        <div className="flex border-b border-gray-200">
                                            <button
                                                onClick={() => setActiveTab("pending")}
                                                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                                                    activeTab === "pending" 
                                                    ? "text-blue-600" 
                                                    : "text-gray-500 hover:text-gray-700"
                                                }`}
                                            >
                                                Pending
                                                {activeTab === "pending" && (
                                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setActiveTab("paid")}
                                                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                                                    activeTab === "paid" 
                                                    ? "text-blue-600" 
                                                    : "text-gray-500 hover:text-gray-700"
                                                }`}
                                            >
                                                Paid
                                                {activeTab === "paid" && (
                                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setActiveTab("all")}
                                                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                                                    activeTab === "all" 
                                                    ? "text-blue-600" 
                                                    : "text-gray-500 hover:text-gray-700"
                                                }`}
                                            >
                                                All Records
                                                {activeTab === "all" && (
                                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Filters and Search */}
                                    <div className="flex flex-col sm:flex-row gap-4 mb-4 mt-2">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <Input
                                                    placeholder="Search by reference number or payer name..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10 rounded-lg"
                                                />
                                            </div>
                                        </div>
                                        <select
                                            value={yearFilter}
                                            onChange={(e) => setYearFilter(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                                            className="px-3 py-2 border rounded-lg text-sm"
                                        >
                                            {yearOptions.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                            <option value="all">All Years</option>
                                        </select>
                                        <select
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                            className="px-3 py-2 border rounded-lg text-sm"
                                        >
                                            <option value="all">All Types</option>
                                            <option value="cutting_permit">Cutting Permit</option>
                                            <option value="pruning_permit">Pruning Permit</option>
                                            <option value="violation_fine">Violation Fine</option>
                                        </select>
                                    </div>

                                    {isLoading && allRecords.length === 0 ? (
                                        <div className="flex items-center justify-center h-32">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                                <p className="mt-2 text-sm text-gray-600">Loading records...</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <DataTable
                                            data={filteredData}
                                            columns={feeColumns}
                                            onRowClick={handleRowClick}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        <div className={`flex flex-col min-h-0 transition-all duration-300 lg:col-span-1`}>
                            <Card className={`flex-1 flex flex-col min-h-0 ${selectedRowForDetails ? 'bg-gray-50' : 'bg-white'}`}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg">{selectedRowForDetails ? (isEditingDetails ? 'Edit Record' : 'Record Details') : 'Statistics'}</CardTitle>
                                    {selectedRowForDetails && (
                                        <Button variant="ghost" size="sm" onClick={handleCloseDetails}>Close</Button>
                                    )}
                                </CardHeader>
                                <CardContent className="flex-1 overflow-auto space-y-4">
                                    {selectedRowForDetails ? (
                                        isEditingDetails ? (
                                            <FeeRecordForm
                                                mode="edit"
                                                initialData={selectedRowForDetails}
                                                onSave={async (data) => {
                                                    // Only send updateable fields, exclude auto-generated and readonly fields
                                                    const { id, reference_number, or_number, created_at, updated_at, ...updateData } = data || {};
                                                    await fullUpdateMutation.mutateAsync({ id: selectedRowForDetails.id, data: updateData });
                                                    // Refetch to get updated data
                                                    const result = await refetch();
                                                    // Update the selected row with fresh data from refetch
                                                    if (result.data) {
                                                        const updatedRecord = result.data.find((r: FeeRecord) => r.id === selectedRowForDetails.id);
                                                        if (updatedRecord) {
                                                            setSelectedRowForDetails(updatedRecord);
                                                        }
                                                    }
                                                    setIsEditingDetails(false);
                                                }}
                                                onCancel={() => setIsEditingDetails(false)}
                                            />
                                        ) : (
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between"><span className="text-gray-600">Reference #</span><Badge variant="outline">{selectedRowForDetails.reference_number}</Badge></div>
                                                <div className="flex justify-between"><span className="text-gray-600">Type</span><Badge variant="outline">{getTypeLabel(selectedRowForDetails.type)}</Badge></div>
                                                <div className="flex justify-between"><span className="text-gray-600">Payer</span><span className="font-medium">{selectedRowForDetails.payer_name}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-600">Amount</span><span className="font-medium">{formatCurrency(selectedRowForDetails.amount)}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-600">Date</span><span className="font-medium">{selectedRowForDetails.date}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-600">Status</span><Badge className={getStatusColor(selectedRowForDetails.status)}>{selectedRowForDetails.status.toUpperCase()}</Badge></div>
                                                {selectedRowForDetails.or_number && (
                                                    <div className="flex justify-between"><span className="text-gray-600">OR #</span><span className="font-medium">{selectedRowForDetails.or_number}</span></div>
                                                )}
                                                {selectedRowForDetails.payment_date && (
                                                    <div className="flex justify-between"><span className="text-gray-600">Payment Date</span><span className="font-medium">{selectedRowForDetails.payment_date}</span></div>
                                                )}
                                                <div className="pt-3 border-t flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={handleStartInlineEdit} className="rounded-lg">Edit</Button>
                                                    <Button variant="outline" size="sm" className="text-red-600 rounded-lg" onClick={handleDeleteSelected}>Delete</Button>
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Total Records:</span>
                                                <Badge variant="outline">{allRecords.length}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Total Amount:</span>
                                                <span className="font-semibold">{formatCurrency(totalAmount)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Paid:</span>
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-green-100 text-green-800">{statusCounts.paid}</Badge>
                                                    <span className="text-sm font-medium text-green-600">{formatCurrency(paidAmount)}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Pending:</span>
                                                <Badge className="bg-yellow-100 text-yellow-800">{statusCounts.pending}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Cancelled:</span>
                                                <Badge className="bg-gray-100 text-gray-800">{statusCounts.cancelled}</Badge>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

            {/* Form Dialog (Add only) */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Fee Record</DialogTitle>
                        <DialogDescription >
                            Enter the details of the new fee record to add to the database.
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <FeeRecordForm
                            mode="add"
                            initialData={selectedRecord}
                            onSave={handleFormSave}
                            onCancel={handleFormCancel}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl border-none p-0 overflow-hidden">
                    <DialogHeader className="bg-red-600 p-6 m-0 border-none">
                        <DialogTitle className="text-xl font-bold text-white">Confirm Delete</DialogTitle>
                        <DialogDescription className="text-red-100/80">
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 bg-white space-y-4">
                        <p className="text-sm text-gray-700">
                            Are you sure you want to delete this fee record?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                className="rounded-lg"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FeeRecords;
