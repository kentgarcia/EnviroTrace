import React, { useState, useMemo, useCallback } from "react";
import { DataGrid, DataGridColumn } from "@/presentation/components/shared/ui/data-grid";
import { useDataGrid } from "@/hooks/useDataGrid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { toast } from "sonner";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";
import {
    Plus,
    Edit,
    Trash,
    Eye,
    FileText,
    TreePine,
    Leaf,
    Coins,
    CheckCircle,
    XCircle,
    Clock,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/presentation/components/shared/ui/dialog";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/presentation/components/shared/ui/tabs";

// Types for different record types
interface InspectionReport {
    id: string;
    reportNumber: string;
    inspectorName: string;
    date: string;
    location: string;
    type: "pruning" | "cutting" | "violation" | "maintenance";
    status: "pending" | "in-progress" | "completed" | "rejected";
    findings: string;
    recommendations: string;
    followUpRequired: boolean;
}

interface FeeRecord {
    id: string;
    referenceNumber: string;
    type: "inspection" | "cutting_permit" | "pruning_permit" | "violation_fine";
    amount: number;
    payerName: string;
    date: string;
    dueDate: string;
    status: "paid" | "pending" | "overdue" | "cancelled";
    orNumber?: string;
    paymentDate?: string;
}

interface TreeRecord {
    id: string;
    species: string;
    location: string;
    coordinates?: { lat: number; lng: number };
    diameter: number;
    height: number;
    condition: "healthy" | "diseased" | "damaged" | "dead";
    action: "none" | "pruning" | "cutting" | "treatment";
    permitNumber?: string;
    actionDate?: string;
    replacementRequired: boolean;
}

interface SaplingRecord {
    id: string;
    species: string;
    quantity: number;
    collectionDate: string;
    source: "replacement" | "donation" | "purchase";
    condition: "excellent" | "good" | "fair" | "poor";
    plantingDate?: string;
    location?: string;
    notes: string;
}

interface UrbanGreeningRecord {
    id: string;
    projectName: string;
    type: "ornamental" | "trees" | "seeds" | "seeds_private";
    quantity: number;
    species: string;
    plantingDate: string;
    location: string;
    coordinates?: { lat: number; lng: number };
    status: "planned" | "planted" | "maintained" | "completed";
    responsiblePerson: string;
    notes: string;
}

// Sample data - in real app, this would come from API
const sampleInspectionReports: InspectionReport[] = [
    {
        id: "IR-001",
        reportNumber: "2025-IR-001",
        inspectorName: "Juan Dela Cruz",
        date: "2025-01-15",
        location: "Rizal Park",
        type: "pruning",
        status: "completed",
        findings: "Several branches overhanging walkways",
        recommendations: "Selective pruning required",
        followUpRequired: true,
    },
    {
        id: "IR-002",
        reportNumber: "2025-IR-002",
        inspectorName: "Maria Santos",
        date: "2025-01-20",
        location: "Ayala Avenue",
        type: "cutting",
        status: "pending",
        findings: "Dead tree posing safety risk",
        recommendations: "Immediate removal and replacement",
        followUpRequired: false,
    },
    {
        id: "IR-003",
        reportNumber: "2025-IR-003",
        inspectorName: "Carlos Reyes",
        date: "2025-01-18",
        location: "BGC Park",
        type: "maintenance",
        status: "in-progress",
        findings: "Regular maintenance inspection",
        recommendations: "Continue monthly inspections",
        followUpRequired: true,
    },
];

const sampleFeeRecords: FeeRecord[] = [
    {
        id: "FR-001",
        referenceNumber: "2025-FEE-001",
        type: "cutting_permit",
        amount: 2500,
        payerName: "ABC Development Corp",
        date: "2025-01-10",
        dueDate: "2025-01-25",
        status: "paid",
        orNumber: "OR-2025-001",
        paymentDate: "2025-01-20",
    },
    {
        id: "FR-002",
        referenceNumber: "2025-FEE-002",
        type: "violation_fine",
        amount: 5000,
        payerName: "XYZ Construction",
        date: "2025-01-12",
        dueDate: "2025-01-27",
        status: "overdue",
    },
    {
        id: "FR-003",
        referenceNumber: "2025-FEE-003",
        type: "inspection",
        amount: 1000,
        payerName: "Green Landscaping Inc",
        date: "2025-01-15",
        dueDate: "2025-01-30",
        status: "pending",
    },
];

// Mock API functions
const fetchInspectionReports = async (): Promise<InspectionReport[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return sampleInspectionReports;
};

const fetchFeeRecords = async (): Promise<FeeRecord[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return sampleFeeRecords;
};

const updateInspectionReport = async (id: string, field: keyof InspectionReport, value: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Updating inspection report ${id}: ${String(field)} = ${value}`);
};

const updateFeeRecord = async (id: string, field: keyof FeeRecord, value: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Updating fee record ${id}: ${String(field)} = ${value}`);
};

const UrbanGreeningRecords: React.FC = () => {
    const [activeTab, setActiveTab] = useState("inspection");
    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    // Hook for inspection reports
    const inspectionQuery = useDataGrid<InspectionReport>({
        queryKey: ['inspection-reports'],
        queryFn: fetchInspectionReports,
        initialPageSize: 10,
    });

    // Hook for fee records
    const feeQuery = useDataGrid<FeeRecord>({
        queryKey: ['fee-records'],
        queryFn: fetchFeeRecords,
        initialPageSize: 10,
    });

    const queryClient = useQueryClient();

    // Mutation for updating records
    const updateInspectionMutation = useMutation({
        mutationFn: ({ id, field, value }: { id: string; field: keyof InspectionReport; value: any }) =>
            updateInspectionReport(id, field, value),
        onSuccess: () => {
            toast.success("Record updated successfully");
            queryClient.invalidateQueries({ queryKey: ['inspection-reports'] });
        },
        onError: () => {
            toast.error("Failed to update record");
        },
    });

    const updateFeeMutation = useMutation({
        mutationFn: ({ id, field, value }: { id: string; field: keyof FeeRecord; value: any }) =>
            updateFeeRecord(id, field, value),
        onSuccess: () => {
            toast.success("Record updated successfully");
            queryClient.invalidateQueries({ queryKey: ['fee-records'] });
        },
        onError: () => {
            toast.error("Failed to update record");
        },
    });

    // Column definitions for inspection reports
    const inspectionColumns: DataGridColumn<InspectionReport>[] = useMemo(() => [
        {
            id: "reportNumber",
            title: "Report No.",
            field: "reportNumber",
            sortable: true,
            filterable: true,
            width: 120,
        },
        {
            id: "inspectorName",
            title: "Inspector",
            field: "inspectorName",
            sortable: true,
            filterable: true,
            editable: true,
            width: 150,
        },
        {
            id: "date",
            title: "Date",
            field: "date",
            type: "date",
            sortable: true,
            width: 100,
        },
        {
            id: "location",
            title: "Location",
            field: "location",
            sortable: true,
            filterable: true,
            editable: true,
            width: 200,
        },
        {
            id: "type",
            title: "Type",
            field: "type",
            type: "select",
            selectOptions: [
                { value: "pruning", label: "Pruning" },
                { value: "cutting", label: "Cutting" },
                { value: "violation", label: "Violation" },
                { value: "maintenance", label: "Maintenance" },
            ],
            editable: true,
            renderCell: (value) => (
                <Badge variant="outline">{value}</Badge>
            ),
            width: 120,
        },
        {
            id: "status",
            title: "Status",
            field: "status",
            type: "select",
            selectOptions: [
                { value: "pending", label: "Pending" },
                { value: "in-progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
                { value: "rejected", label: "Rejected" },
            ],
            editable: true,
            renderCell: (value) => {
                const getStatusColor = (status: string) => {
                    switch (status) {
                        case "completed":
                            return "bg-green-100 text-green-800";
                        case "pending":
                            return "bg-yellow-100 text-yellow-800";
                        case "rejected":
                            return "bg-red-100 text-red-800";
                        case "in-progress":
                            return "bg-blue-100 text-blue-800";
                        default:
                            return "bg-gray-100 text-gray-800";
                    }
                };

                const getStatusIcon = (status: string) => {
                    switch (status) {
                        case "completed":
                            return <CheckCircle className="w-4 h-4" />;
                        case "pending":
                            return <Clock className="w-4 h-4" />;
                        case "rejected":
                            return <XCircle className="w-4 h-4" />;
                        default:
                            return <Clock className="w-4 h-4" />;
                    }
                };

                return (
                    <Badge className={getStatusColor(value)}>
                        {getStatusIcon(value)}
                        <span className="ml-1">{value}</span>
                    </Badge>
                );
            },
            width: 140,
        },
        {
            id: "followUpRequired",
            title: "Follow-up",
            field: "followUpRequired",
            type: "boolean",
            editable: true,
            renderCell: (value) => (
                <Badge variant={value ? "default" : "secondary"}>
                    {value ? "Required" : "Not Required"}
                </Badge>
            ),
            width: 120,
        },
        {
            id: "actions",
            title: "Actions",
            renderCell: (_, row) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Trash className="w-4 h-4" />
                    </Button>
                </div>
            ),
            width: 120,
            sortable: false,
            filterable: false,
        },
    ], []);

    // Column definitions for fee records
    const feeColumns: DataGridColumn<FeeRecord>[] = useMemo(() => [
        {
            id: "referenceNumber",
            title: "Reference No.",
            field: "referenceNumber",
            sortable: true,
            filterable: true,
            width: 140,
        },
        {
            id: "type",
            title: "Type",
            field: "type",
            type: "select",
            selectOptions: [
                { value: "inspection", label: "Inspection" },
                { value: "cutting_permit", label: "Cutting Permit" },
                { value: "pruning_permit", label: "Pruning Permit" },
                { value: "violation_fine", label: "Violation Fine" },
            ],
            editable: true,
            renderCell: (value) => (
                <Badge variant="outline">{value.replace("_", " ")}</Badge>
            ),
            width: 150,
        },
        {
            id: "payerName",
            title: "Payer",
            field: "payerName",
            sortable: true,
            filterable: true,
            editable: true,
            width: 200,
        },
        {
            id: "amount",
            title: "Amount",
            field: "amount",
            type: "currency",
            sortable: true,
            editable: true,
            width: 120,
        },
        {
            id: "date",
            title: "Date",
            field: "date",
            type: "date",
            sortable: true,
            width: 100,
        },
        {
            id: "dueDate",
            title: "Due Date",
            field: "dueDate",
            type: "date",
            sortable: true,
            editable: true,
            width: 100,
        },
        {
            id: "status",
            title: "Status",
            field: "status",
            type: "select",
            selectOptions: [
                { value: "paid", label: "Paid" },
                { value: "pending", label: "Pending" },
                { value: "overdue", label: "Overdue" },
                { value: "cancelled", label: "Cancelled" },
            ],
            editable: true,
            renderCell: (value) => {
                const getStatusColor = (status: string) => {
                    switch (status) {
                        case "paid":
                            return "bg-green-100 text-green-800";
                        case "pending":
                            return "bg-yellow-100 text-yellow-800";
                        case "overdue":
                            return "bg-red-100 text-red-800";
                        case "cancelled":
                            return "bg-gray-100 text-gray-800";
                        default:
                            return "bg-gray-100 text-gray-800";
                    }
                };

                const getStatusIcon = (status: string) => {
                    switch (status) {
                        case "paid":
                            return <CheckCircle className="w-4 h-4" />;
                        case "pending":
                            return <Clock className="w-4 h-4" />;
                        case "overdue":
                            return <XCircle className="w-4 h-4" />;
                        default:
                            return <Clock className="w-4 h-4" />;
                    }
                };

                return (
                    <Badge className={getStatusColor(value)}>
                        {getStatusIcon(value)}
                        <span className="ml-1">{value}</span>
                    </Badge>
                );
            },
            width: 120,
        },
        {
            id: "actions",
            title: "Actions",
            renderCell: (_, row) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Trash className="w-4 h-4" />
                    </Button>
                </div>
            ),
            width: 120,
            sortable: false,
            filterable: false,
        },
    ], []);

    const handleCellEdit = useCallback(async (rowId: string | number, field: string, value: any) => {
        const id = String(rowId); // Convert rowId to string since our API expects string IDs

        if (activeTab === "inspection") {
            await updateInspectionMutation.mutateAsync({
                id,
                field: field as keyof InspectionReport,
                value,
            });
        } else if (activeTab === "fees") {
            await updateFeeMutation.mutateAsync({
                id,
                field: field as keyof FeeRecord,
                value,
            });
        }
    }, [activeTab, updateInspectionMutation, updateFeeMutation]);

    const handleRowSelect = useCallback((rows: any[]) => {
        setSelectedRows(rows);
    }, []);

    const handleExport = useCallback((data: any[]) => {
        // Convert to CSV and download
        const csv = convertToCSV(data);
        downloadCSV(csv, `${activeTab}-records.csv`);
        toast.success(`Exported ${data.length} records`);
    }, [activeTab]);

    const convertToCSV = useCallback((data: any[]) => {
        if (!data.length) return '';

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' ? `"${value}"` : value;
                }).join(',')
            )
        ].join('\n');

        return csvContent;
    }, []);

    const downloadCSV = useCallback((csv: string, filename: string) => {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }, []);

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBarContainer dashboardType="urban-greening" />

                {/* Header Section */}
                <div className="flex items-center justify-between bg-white px-6 py-3 border-b border-gray-200">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Urban Greening Records Management
                    </h1>
                </div>

                {/* Body Section */}
                <div className="flex-1 overflow-y-auto p-4 bg-[#F9FBFC]">
                    <div className="px-4">
                        <ColorDivider />
                    </div>

                    {/* Selection Info */}
                    {selectedRows.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-blue-900">
                                    {selectedRows.length} record(s) selected
                                </span>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline">
                                        Bulk Edit
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        Delete Selected
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabs for different record types */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="inspection" className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Inspection Reports
                            </TabsTrigger>
                            <TabsTrigger value="fees" className="flex items-center gap-2">
                                <Coins className="w-4 h-4" />
                                Fee Records
                            </TabsTrigger>
                            <TabsTrigger value="trees" className="flex items-center gap-2">
                                <TreePine className="w-4 h-4" />
                                Tree Records
                            </TabsTrigger>
                            <TabsTrigger value="saplings" className="flex items-center gap-2">
                                <Leaf className="w-4 h-4" />
                                Saplings
                            </TabsTrigger>
                            <TabsTrigger value="urban-greening" className="flex items-center gap-2">
                                <Leaf className="w-4 h-4" />
                                Urban Greening
                            </TabsTrigger>
                        </TabsList>

                        {/* Inspection Reports Tab */}
                        <TabsContent value="inspection" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-medium">Inspection Reports</h2>
                                <Button className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Report
                                </Button>
                            </div>

                            <Card>
                                <CardContent className="p-6">
                                    <DataGrid
                                        data={inspectionQuery.data}
                                        columns={inspectionColumns}
                                        loading={inspectionQuery.isLoading}
                                        error={inspectionQuery.error}
                                        onRowSelect={handleRowSelect}
                                        onCellEdit={handleCellEdit}
                                        onRefresh={inspectionQuery.refetch}
                                        onExport={handleExport}
                                        enableRowSelection={true}
                                        enableMultiRowSelection={true}
                                        enableGlobalSearch={true}
                                        enableColumnFilters={true}
                                        enableSorting={true}
                                        enablePagination={true}
                                        enableColumnVisibility={true}
                                        enableExport={true}
                                        enableRefresh={true}
                                        pageSize={10}
                                        pageSizeOptions={[5, 10, 20, 50]}
                                        queryKey={inspectionQuery.queryKey as string[]}
                                        optimisticUpdates={true}
                                        emptyStateMessage="No inspection reports found"
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Fee Records Tab */}
                        <TabsContent value="fees" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-medium">Fee Records</h2>
                                <Button className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Fee Record
                                </Button>
                            </div>

                            <Card>
                                <CardContent className="p-6">
                                    <DataGrid
                                        data={feeQuery.data}
                                        columns={feeColumns}
                                        loading={feeQuery.isLoading}
                                        error={feeQuery.error}
                                        onRowSelect={handleRowSelect}
                                        onCellEdit={handleCellEdit}
                                        onRefresh={feeQuery.refetch}
                                        onExport={handleExport}
                                        enableRowSelection={true}
                                        enableMultiRowSelection={true}
                                        enableGlobalSearch={true}
                                        enableColumnFilters={true}
                                        enableSorting={true}
                                        enablePagination={true}
                                        enableColumnVisibility={true}
                                        enableExport={true}
                                        enableRefresh={true}
                                        pageSize={10}
                                        pageSizeOptions={[5, 10, 20, 50]}
                                        queryKey={feeQuery.queryKey as string[]}
                                        optimisticUpdates={true}
                                        emptyStateMessage="No fee records found"
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Placeholder tabs for other record types */}
                        <TabsContent value="trees" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-medium">Tree Records</h2>
                                <Button className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Tree Record
                                </Button>
                            </div>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="text-center text-gray-500">
                                        Tree records implementation coming soon...
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="saplings" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-medium">Sapling Records</h2>
                                <Button className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Sapling Record
                                </Button>
                            </div>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="text-center text-gray-500">
                                        Sapling records implementation coming soon...
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="urban-greening" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-medium">Urban Greening Projects</h2>
                                <Button className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Project
                                </Button>
                            </div>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="text-center text-gray-500">
                                        Urban greening projects implementation coming soon...
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default UrbanGreeningRecords;
