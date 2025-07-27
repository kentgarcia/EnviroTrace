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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/presentation/components/shared/ui/tabs";
import { toast } from "sonner";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import ColorDivider from "@/presentation/components/shared/layout/ColorDivider";
import {
    Plus,
    Edit,
    Trash,
    Eye,
    RefreshCw,
    Download,
    Filter,
    Search,
    Settings2,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
} from "lucide-react";

// Sample data types for testing different data grid scenarios
interface TestRecord {
    id: string;
    name: string;
    email: string;
    status: "active" | "inactive" | "pending" | "suspended";
    role: "admin" | "user" | "moderator" | "guest";
    createdDate: string;
    lastLogin?: string;
    score: number;
    isVerified: boolean;
    department: string;
    tags: string[];
}

interface PerformanceTestRecord {
    id: string;
    transactionId: string;
    amount: number;
    currency: "PHP" | "USD" | "EUR";
    type: "income" | "expense" | "transfer";
    category: string;
    description: string;
    date: string;
    status: "completed" | "pending" | "failed" | "cancelled";
    reference: string;
}

// Generate large sample datasets for performance testing
const generateTestRecords = (count: number): TestRecord[] => {
    const departments = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations"];
    const statuses: TestRecord["status"][] = ["active", "inactive", "pending", "suspended"];
    const roles: TestRecord["role"][] = ["admin", "user", "moderator", "guest"];

    return Array.from({ length: count }, (_, i) => ({
        id: `test-${i + 1}`,
        name: `Test User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        role: roles[Math.floor(Math.random() * roles.length)],
        createdDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastLogin: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
        score: Math.floor(Math.random() * 100),
        isVerified: Math.random() > 0.2,
        department: departments[Math.floor(Math.random() * departments.length)],
        tags: ["tag1", "tag2", "tag3"].slice(0, Math.floor(Math.random() * 3) + 1),
    }));
};

const generatePerformanceTestRecords = (count: number): PerformanceTestRecord[] => {
    const currencies: PerformanceTestRecord["currency"][] = ["PHP", "USD", "EUR"];
    const types: PerformanceTestRecord["type"][] = ["income", "expense", "transfer"];
    const statuses: PerformanceTestRecord["status"][] = ["completed", "pending", "failed", "cancelled"];
    const categories = ["Food", "Transport", "Utilities", "Entertainment", "Healthcare", "Shopping"];

    return Array.from({ length: count }, (_, i) => ({
        id: `perf-${i + 1}`,
        transactionId: `TXN-${String(i + 1).padStart(6, '0')}`,
        amount: Math.random() * 10000,
        currency: currencies[Math.floor(Math.random() * currencies.length)],
        type: types[Math.floor(Math.random() * types.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        description: `Transaction description ${i + 1}`,
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        reference: `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    }));
};

// Mock API functions - optimized with proper data structures
const fetchTestRecords = async (): Promise<TestRecord[]> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return generateTestRecords(50);
};

const fetchPerformanceTestRecords = async (): Promise<PerformanceTestRecord[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return generatePerformanceTestRecords(1000);
};

// Optimized update functions
const updateTestRecord = async (id: string, field: keyof TestRecord, value: any) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    console.log(`Updating test record ${id}: ${String(field)} = ${value}`);
    return { id, field, value }; // Return updated data for optimistic updates
};

const updatePerformanceTestRecord = async (id: string, field: keyof PerformanceTestRecord, value: any) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    console.log(`Updating performance test record ${id}: ${String(field)} = ${value}`);
    return { id, field, value }; // Return updated data for optimistic updates
};

const DataGridTestingPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState("basic");
    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    // Hooks for different test scenarios
    const basicTestQuery = useDataGrid<TestRecord>({
        queryKey: ['test-records'],
        queryFn: fetchTestRecords,
        initialPageSize: 10,
    });

    const performanceTestQuery = useDataGrid<PerformanceTestRecord>({
        queryKey: ['performance-test-records'],
        queryFn: fetchPerformanceTestRecords,
        initialPageSize: 20,
    });

    // Debug logging
    console.log('BasicTestQuery data:', basicTestQuery.data?.length);
    console.log('PerformanceTestQuery data:', performanceTestQuery.data?.length);

    const queryClient = useQueryClient();

    // Memoized mutations for testing updates - fixed to prevent page reloads
    const updateTestMutation = useMutation({
        mutationFn: ({ id, field, value }: { id: string; field: keyof TestRecord; value: any }) =>
            updateTestRecord(id, field, value),
        onMutate: async ({ id, field, value }) => {
            // Cancel any outgoing refetches for optimistic updates
            await queryClient.cancelQueries({ queryKey: ['test-records'] });

            // Snapshot the previous value
            const previousData = queryClient.getQueryData(['test-records']);

            // Optimistically update the cache
            queryClient.setQueryData(['test-records'], (old: any) => {
                if (!old || !Array.isArray(old)) return old;
                return old.map((record: TestRecord) =>
                    record.id === id ? { ...record, [field]: value } : record
                );
            });

            return { previousData };
        },
        onSuccess: () => {
            toast.success("Test record updated successfully");
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(['test-records'], context.previousData);
            }
            toast.error("Failed to update test record");
        },
        onSettled: () => {
            // Don't refetch - rely on optimistic updates
            // queryClient.invalidateQueries({ queryKey: ['test-records'] });
        },
    });

    const updatePerformanceMutation = useMutation({
        mutationFn: ({ id, field, value }: { id: string; field: keyof PerformanceTestRecord; value: any }) =>
            updatePerformanceTestRecord(id, field, value),
        onMutate: async ({ id, field, value }) => {
            // Cancel any outgoing refetches for optimistic updates
            await queryClient.cancelQueries({ queryKey: ['performance-test-records'] });

            // Snapshot the previous value
            const previousData = queryClient.getQueryData(['performance-test-records']);

            // Optimistically update the cache
            queryClient.setQueryData(['performance-test-records'], (old: any) => {
                if (!old || !Array.isArray(old)) return old;
                return old.map((record: PerformanceTestRecord) =>
                    record.id === id ? { ...record, [field]: value } : record
                );
            });

            return { previousData };
        },
        onSuccess: () => {
            toast.success("Performance test record updated successfully");
        },
        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(['performance-test-records'], context.previousData);
            }
            toast.error("Failed to update performance test record");
        },
        onSettled: () => {
            // Don't refetch - rely on optimistic updates
            // queryClient.invalidateQueries({ queryKey: ['performance-test-records'] });
        },
    });

    // Memoized helper functions to prevent recreation
    const getStatusColor = useCallback((status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "inactive":
                return "bg-gray-100 text-gray-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "suspended":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    }, []);

    const getStatusIcon = useCallback((status: string) => {
        switch (status) {
            case "active":
                return <CheckCircle className="w-4 h-4" />;
            case "inactive":
                return <XCircle className="w-4 h-4" />;
            case "pending":
                return <Clock className="w-4 h-4" />;
            case "suspended":
                return <AlertTriangle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    }, []);

    const getTransactionStatusColor = useCallback((status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "failed":
                return "bg-red-100 text-red-800";
            case "cancelled":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    }, []);

    // Memoized render functions for cells
    const renderStatusCell = useCallback((value: string) => (
        <Badge className={getStatusColor(value)}>
            {getStatusIcon(value)}
            <span className="ml-1 capitalize">{value}</span>
        </Badge>
    ), [getStatusColor, getStatusIcon]);

    const renderRoleCell = useCallback((value: string) => (
        <Badge variant="outline" className="capitalize">{value}</Badge>
    ), []);

    const renderVerifiedCell = useCallback((value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
            {value ? "Verified" : "Not Verified"}
        </Badge>
    ), []);

    const renderTypeCell = useCallback((value: string) => (
        <Badge variant="outline" className="capitalize">{value}</Badge>
    ), []);

    const renderTransactionStatusCell = useCallback((value: string) => (
        <Badge className={getTransactionStatusColor(value)}>
            <span className="capitalize">{value}</span>
        </Badge>
    ), [getTransactionStatusColor]);

    const renderActionsCell = useCallback((_, row) => (
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                <Trash className="w-4 h-4" />
            </Button>
        </div>
    ), []);

    // Column definitions for basic testing - heavily optimized
    const basicTestColumns: DataGridColumn<TestRecord>[] = useMemo(() => [
        {
            id: "id",
            title: "ID",
            field: "id",
            sortable: true,
            filterable: true,
            width: 100,
        },
        {
            id: "name",
            title: "Name",
            field: "name",
            sortable: true,
            filterable: true,
            editable: true,
            width: 200,
        },
        {
            id: "email",
            title: "Email",
            field: "email",
            sortable: true,
            filterable: true,
            editable: true,
            width: 250,
        },
        {
            id: "status",
            title: "Status",
            field: "status",
            type: "select",
            selectOptions: [
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "pending", label: "Pending" },
                { value: "suspended", label: "Suspended" },
            ],
            editable: true,
            renderCell: renderStatusCell,
            width: 120,
        },
        {
            id: "role",
            title: "Role",
            field: "role",
            type: "select",
            selectOptions: [
                { value: "admin", label: "Admin" },
                { value: "user", label: "User" },
                { value: "moderator", label: "Moderator" },
                { value: "guest", label: "Guest" },
            ],
            editable: true,
            renderCell: renderRoleCell,
            width: 120,
        },
        {
            id: "score",
            title: "Score",
            field: "score",
            type: "number",
            sortable: true,
            editable: true,
            width: 100,
        },
        {
            id: "isVerified",
            title: "Verified",
            field: "isVerified",
            type: "boolean",
            editable: true,
            renderCell: renderVerifiedCell,
            width: 120,
        },
        {
            id: "department",
            title: "Department",
            field: "department",
            sortable: true,
            filterable: true,
            editable: true,
            width: 150,
        },
        {
            id: "createdDate",
            title: "Created",
            field: "createdDate",
            type: "date",
            sortable: true,
            width: 120,
        },
        {
            id: "actions",
            title: "Actions",
            renderCell: renderActionsCell,
            width: 120,
            sortable: false,
            filterable: false,
        },
    ], [renderStatusCell, renderRoleCell, renderVerifiedCell, renderActionsCell]);

    // Column definitions for performance testing - heavily optimized
    const performanceTestColumns: DataGridColumn<PerformanceTestRecord>[] = useMemo(() => [
        {
            id: "transactionId",
            title: "Transaction ID",
            field: "transactionId",
            sortable: true,
            filterable: true,
            width: 150,
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
            id: "currency",
            title: "Currency",
            field: "currency",
            type: "select",
            selectOptions: [
                { value: "PHP", label: "PHP" },
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
            ],
            editable: true,
            width: 100,
        },
        {
            id: "type",
            title: "Type",
            field: "type",
            type: "select",
            selectOptions: [
                { value: "income", label: "Income" },
                { value: "expense", label: "Expense" },
                { value: "transfer", label: "Transfer" },
            ],
            editable: true,
            renderCell: renderTypeCell,
            width: 120,
        },
        {
            id: "category",
            title: "Category",
            field: "category",
            sortable: true,
            filterable: true,
            editable: true,
            width: 150,
        },
        {
            id: "status",
            title: "Status",
            field: "status",
            type: "select",
            selectOptions: [
                { value: "completed", label: "Completed" },
                { value: "pending", label: "Pending" },
                { value: "failed", label: "Failed" },
                { value: "cancelled", label: "Cancelled" },
            ],
            editable: true,
            renderCell: renderTransactionStatusCell,
            width: 120,
        },
        {
            id: "date",
            title: "Date",
            field: "date",
            type: "date",
            sortable: true,
            width: 120,
        },
        {
            id: "reference",
            title: "Reference",
            field: "reference",
            sortable: true,
            filterable: true,
            width: 150,
        },
    ], [renderTypeCell, renderTransactionStatusCell]);

    const handleCellEdit = useCallback(async (rowId: string | number, field: string, value: any) => {
        const id = String(rowId);

        console.log('Cell edit triggered:', { id, field, value, activeTab });

        try {
            if (activeTab === "basic") {
                await updateTestMutation.mutateAsync({
                    id,
                    field: field as keyof TestRecord,
                    value,
                });
            } else if (activeTab === "performance") {
                await updatePerformanceMutation.mutateAsync({
                    id,
                    field: field as keyof PerformanceTestRecord,
                    value,
                });
            }
        } catch (error) {
            console.error('Cell edit error:', error);
        }
    }, [activeTab, updateTestMutation, updatePerformanceMutation]);

    const handleRowSelect = useCallback((rows: any[]) => {
        setSelectedRows(rows);
    }, []);

    const handleExport = useCallback((data: any[]) => {
        const csv = convertToCSV(data);
        downloadCSV(csv, `${activeTab}-test-data.csv`);
        toast.success(`Exported ${data.length} test records`);
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

    const refreshAllData = useCallback(() => {
        console.log('Refreshing all data...');
        basicTestQuery.refetch();
        performanceTestQuery.refetch();
        toast.success("All test data refreshed");
    }, [basicTestQuery.refetch, performanceTestQuery.refetch]);

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBarContainer dashboardType="urban-greening" />

                {/* Header Section */}
                <div className="flex items-center justify-between bg-white px-6 py-3 border-b border-gray-200">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            Data Grid Testing
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Test various data grid features and performance scenarios
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={refreshAllData} variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh All
                        </Button>
                        <Button variant="outline" size="sm">
                            <Settings2 className="w-4 h-4 mr-2" />
                            Settings
                        </Button>
                    </div>
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
                                        <Download className="w-4 h-4 mr-1" />
                                        Export Selected
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <Edit className="w-4 h-4 mr-1" />
                                        Bulk Edit
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                        <Trash className="w-4 h-4 mr-1" />
                                        Delete Selected
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Test Scenarios Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic" className="flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                Basic Testing
                            </TabsTrigger>
                            <TabsTrigger value="performance" className="flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Performance Testing
                            </TabsTrigger>
                            <TabsTrigger value="features" className="flex items-center gap-2">
                                <Settings2 className="w-4 h-4" />
                                Feature Testing
                            </TabsTrigger>
                        </TabsList>

                        {/* Basic Testing Tab */}
                        <TabsContent value="basic" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-medium">Basic Data Grid Features</h2>
                                    <p className="text-sm text-gray-600">Test basic sorting, filtering, editing, and pagination</p>
                                </div>
                                <Button className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Test Record
                                </Button>
                            </div>

                            <Card>
                                <CardContent className="p-6">
                                    <DataGrid
                                        data={basicTestQuery.data || []}
                                        columns={basicTestColumns}
                                        loading={basicTestQuery.isLoading}
                                        error={basicTestQuery.error}
                                        onRowSelect={handleRowSelect}
                                        onCellEdit={handleCellEdit}
                                        onRefresh={basicTestQuery.refetch}
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
                                        queryKey={['test-records']}
                                        optimisticUpdates={true}
                                        emptyStateMessage="No test records found"
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Performance Testing Tab */}
                        <TabsContent value="performance" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-medium">Performance Testing</h2>
                                    <p className="text-sm text-gray-600">Test with large datasets (1000+ records) to evaluate performance</p>
                                </div>
                                <Button className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Generate More Data
                                </Button>
                            </div>

                            <Card>
                                <CardContent className="p-6">
                                    <DataGrid
                                        data={performanceTestQuery.data || []}
                                        columns={performanceTestColumns}
                                        loading={performanceTestQuery.isLoading}
                                        error={performanceTestQuery.error}
                                        onRowSelect={handleRowSelect}
                                        onCellEdit={handleCellEdit}
                                        onRefresh={performanceTestQuery.refetch}
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
                                        pageSize={20}
                                        pageSizeOptions={[10, 20, 50, 100]}
                                        queryKey={['performance-test-records']}
                                        optimisticUpdates={true}
                                        emptyStateMessage="No performance test records found"
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Feature Testing Tab */}
                        <TabsContent value="features" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-medium">Feature Testing</h2>
                                    <p className="text-sm text-gray-600">Test advanced features and edge cases</p>
                                </div>
                            </div>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="text-center text-gray-500 py-12">
                                        <Settings2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <h3 className="text-lg font-medium mb-2">Advanced Feature Testing</h3>
                                        <p className="text-sm">
                                            Advanced feature testing scenarios coming soon...
                                            <br />
                                            Will include: Complex filtering, Custom renderers, Virtual scrolling, etc.
                                        </p>
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

export default DataGridTestingPage;
