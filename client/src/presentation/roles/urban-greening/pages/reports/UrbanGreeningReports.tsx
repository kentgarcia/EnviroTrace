import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Label } from "@/presentation/components/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/shared/ui/select";
import { Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { fetchTrees } from "@/core/api/tree-inventory-api";
import { fetchTreeRequests } from "@/core/api/tree-management-request-api";
import { fetchUrbanGreeningPlantings } from "@/core/api/planting-api";
import { fetchUrbanGreeningFeeRecords } from "@/core/api/fee-api";
import { generateUrbanGreeningReportHTML } from "./utils/reportHTMLGenerator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/presentation/components/shared/ui/dialog";
import { ExportDropdown } from "@/presentation/components/shared/reports/ExportDropdown";
import { MultiSelect } from "@/presentation/components/shared/ui/multi-select";

type ReportType = 'tree-inventory' | 'tree-requests' | 'urban-greening-projects' | 'fee-records';

export const UrbanGreeningReports: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [reportType, setReportType] = useState<ReportType>("tree-inventory");
    const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const [selectedQuarter, setSelectedQuarter] = useState<string>("Q1");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [selectedRequestType, setSelectedRequestType] = useState<string>("all");
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewContent, setPreviewContent] = useState<string>("");
    const [exportHeaders, setExportHeaders] = useState<string[]>([]);
    const [exportRows, setExportRows] = useState<Array<Array<string | number | boolean | null>>>([]);
    const [exportFileName, setExportFileName] = useState<string>("");
    const [exportTitle, setExportTitle] = useState<string>("");

    // Fetch data for reports
    const { data: treeInventoryData, isLoading: isLoadingTrees, error: treeError } = useQuery({
        queryKey: ["tree-inventory", "all"],
        queryFn: async () => {
            const data = await fetchTrees({ skip: 0, limit: 500 });
            console.log('Tree Inventory Data:', data);
            return data;
        },
    });

    const { data: treeRequestsData, isLoading: isLoadingRequests, error: requestsError } = useQuery({
        queryKey: ["tree-requests", "all"],
        queryFn: async () => {
            const data = await fetchTreeRequests({ skip: 0, limit: 1000 });
            console.log('Tree Requests Data:', data);
            return data;
        },
    });

    const { data: plantingData, isLoading: isLoadingPlantings, error: plantingError } = useQuery({
        queryKey: ["urban-greening-projects", "all"],
        queryFn: async () => {
            const data = await fetchUrbanGreeningPlantings({ skip: 0, limit: 1000 });
            console.log('Planting Data:', data);
            return data;
        },
    });

    const { data: feeData, isLoading: isLoadingFees, error: feeError } = useQuery({
        queryKey: ["fee-records", "all"],
        queryFn: async () => {
            const data = await fetchUrbanGreeningFeeRecords();
            console.log('Fee Data:', data);
            return data;
        },
    });

    const reportTypes = [
        {
            id: "tree-inventory" as ReportType,
            label: "Tree Inventory Report",
            description: "Complete registry of all trees including species, health status, and location",
        },
        {
            id: "tree-requests" as ReportType,
            label: "Tree Requests Report",
            description: "Tree cutting and planting permit applications with processing status",
        },
        {
            id: "urban-greening-projects" as ReportType,
            label: "Urban Greening Projects Report",
            description: "Urban greening initiatives and project details",
        },
        {
            id: "fee-records" as ReportType,
            label: "Fee Records Report",
            description: "Payment records and fee collection summary",
        },
    ];

    const buildFileName = (label: string) => {
        const safeLabel = label.replace(/\s+/g, "_");
        const monthPart = selectedMonths.length > 0 ? `Months_${selectedMonths.join("-")}` : "All_Months";
        return `${safeLabel}_${selectedYear}_${monthPart}_${Date.now()}`;
    };

    const buildExportPayload = (type: ReportType, data: any[]) => {
        const buildAllFieldsPayload = (
            rows: any[],
            options?: { omitKeys?: string[]; dateOnlyKeys?: string[] }
        ) => {
            if (rows.length === 0) {
                return { headers: [] as string[], rows: [] as Array<Array<string | number | boolean | null>>, title: "" };
            }

            const omitKeys = new Set((options?.omitKeys || []).map((key) => key.toLowerCase()));
            const dateOnlyKeys = new Set((options?.dateOnlyKeys || []).map((key) => key.toLowerCase()));
            const keys = Object.keys(rows[0]).filter((key) => !omitKeys.has(key.toLowerCase()));
            const headers = keys.map((key) =>
                key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())
            );
            const tableRows = rows.map((row) =>
                keys.map((key) => {
                    const value = row[key];
                    if (dateOnlyKeys.has(key.toLowerCase()) && value) {
                        const parsed = new Date(value);
                        if (!Number.isNaN(parsed.getTime())) {
                            return parsed.toISOString().slice(0, 10);
                        }
                    }
                    if (value === null || value === undefined) return "N/A";
                    if (typeof value === "object") return JSON.stringify(value);
                    return value;
                })
            );

            return { headers, rows: tableRows, title: "" };
        };

        switch (type) {
            case "tree-inventory":
                return {
                    headers: [
                        "Tree ID",
                        "Status",
                        "Health",
                        "Species",
                        "Address",
                        "Planted",
                    ],
                    rows: data.map((tree: any) => [
                        tree.tree_code || "N/A",
                        tree.status || tree.tree_status || "N/A",
                        tree.health || "N/A",
                        tree.species?.common_name || tree.common_name || tree.species?.scientific_name || tree.scientific_name || "N/A",
                        tree.address || tree.location || "N/A",
                        tree.planting_date ? new Date(tree.planting_date).toLocaleDateString() : "N/A",
                    ]),
                    title: "",
                };
            case "tree-requests":
                return buildAllFieldsPayload(data);
            case "urban-greening-projects":
                return buildAllFieldsPayload(data);
            case "fee-records":
                return buildAllFieldsPayload(data, {
                    omitKeys: ["id", "fee_id"],
                    dateOnlyKeys: ["created_at", "updated_at"],
                });
            default:
                return { headers: [], rows: [], title: "" };
        }
    };

    const handleGenerateReport = async () => {
        const isLoading = isLoadingTrees || isLoadingRequests || isLoadingPlantings || isLoadingFees;
        
        if (isLoading) {
            toast.error("Please wait, data is still loading...");
            return;
        }

        setIsGenerating(true);

        try {
            let filteredData: any[] = [];
            let reportTitle = "";
            
            console.log('=== Report Generation Debug ===');
            console.log('Report Type:', reportType);
            console.log('Selected Year:', selectedYear);
            console.log('Selected Months:', selectedMonths);
            console.log('Raw Data Lengths:', {
                treeInventory: treeInventoryData?.length,
                treeRequests: treeRequestsData?.length,
                planting: plantingData?.length,
                fee: feeData?.length,
            });
            
            // Filter data based on report type
            switch (reportType) {
                case "tree-inventory":
                    filteredData = treeInventoryData || [];
                    reportTitle = "Tree Inventory Report";
                    break;
                case "tree-requests":
                    filteredData = filterDataByPeriod(treeRequestsData || [], "receiving_date_received", {
                        year: selectedYear,
                        month: selectedMonths,
                    });
                    if (selectedStatus !== "all") {
                        filteredData = filteredData.filter((item: any) => item.status_receiving === selectedStatus);
                    }
                    if (selectedRequestType !== "all") {
                        filteredData = filteredData.filter((item: any) => item.request_type === selectedRequestType);
                    }
                    reportTitle = "Tree Requests Report";
                    break;
                case "urban-greening-projects":
                    filteredData = filterDataByPeriod(plantingData || [], "planting_date", {
                        year: selectedYear,
                        month: selectedMonths,
                    });
                    reportTitle = "Urban Greening Projects Report";
                    break;
                case "fee-records":
                    filteredData = filterDataByPeriod(feeData || [], "date", {
                        year: selectedYear,
                        quarter: selectedQuarter,
                    });
                    reportTitle = "Fee Records Report";
                    break;
            }
            
            console.log('Filtered Data Length:', filteredData.length);
            console.log('Filtered Data Sample:', filteredData[0]);

            const reportConfig = {
                reportType,
                reportTitle,
                year: selectedYear !== "all" ? parseInt(selectedYear) : undefined,
                month: selectedMonths.length === 1 ? parseInt(selectedMonths[0]) : undefined,
                status: selectedStatus,
                data: filteredData,
            };

            // Generate HTML for preview
            const html = generateUrbanGreeningReportHTML(reportConfig);
            const exportPayload = buildExportPayload(reportType, filteredData);
            setExportHeaders(exportPayload.headers);
            setExportRows(exportPayload.rows);
            setExportTitle(exportPayload.title);
            setExportFileName(buildFileName(reportTitle));
            setPreviewContent(html);
            setShowPreview(true);
        } catch (error) {
            console.error("Error generating report:", error);
            toast.error("Failed to generate report. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const filterDataByPeriod = (
        data: any[],
        dateField: string,
        options: { year?: string; month?: string | string[]; quarter?: string }
    ) => {
        const { year, month, quarter } = options;
        const monthValues = Array.isArray(month) ? month : month ? [month] : [];

        if (year === "all" && monthValues.length === 0 && quarter === "all") {
            return data;
        }

        return data.filter((item: any) => {
            if (!item[dateField]) return false;

            const itemDate = new Date(item[dateField]);
            const itemYear = itemDate.getFullYear();
            const itemMonth = itemDate.getMonth() + 1;
            const itemQuarter = Math.ceil(itemMonth / 3);

            if (year !== undefined && year !== "all" && itemYear !== parseInt(year)) {
                return false;
            }

            if (monthValues.length > 0) {
                const monthMatches = monthValues.some((value) => itemMonth === parseInt(value));
                if (!monthMatches) {
                    return false;
                }
            }

            if (quarter !== undefined && quarter !== "all") {
                const quarterValue = parseInt(quarter.replace("Q", ""));
                if (itemQuarter !== quarterValue) {
                    return false;
                }
            }

            return true;
        });
    };

    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = [
        { value: "1", label: "January" },
        { value: "2", label: "February" },
        { value: "3", label: "March" },
        { value: "4", label: "April" },
        { value: "5", label: "May" },
        { value: "6", label: "June" },
        { value: "7", label: "July" },
        { value: "8", label: "August" },
        { value: "9", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
    ];
    const quarters = ["Q1", "Q2", "Q3", "Q4"];

    const showStatusFilter = reportType === "tree-requests";
    const showYearFilter = reportType !== "tree-inventory";
    const showMonthFilter = reportType === "tree-requests" || reportType === "urban-greening-projects";
    const showQuarterFilter =
        reportType === "fee-records";
    const showRequestTypeFilter = reportType === "tree-requests";
    const yearDisplay = selectedYear === "all" ? "All Years" : selectedYear;
    const monthDisplay = selectedMonths.length === 0
        ? "All Months"
        : selectedMonths
            .map((monthValue) => months.find((month) => month.value === monthValue)?.label || monthValue)
            .join(", ");
    const quarterDisplay = selectedQuarter === "all" ? "All Quarters" : selectedQuarter;
    const statusLabelMap: Record<string, string> = {
        all: "All Statuses",
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
        completed: "Completed",
    };
    const statusDisplay = statusLabelMap[selectedStatus] || "All Statuses";
    const requestTypeOptions = React.useMemo(() => {
        const options = new Set<string>();
        (treeRequestsData || []).forEach((request: any) => {
            if (request?.request_type) {
                options.add(request.request_type);
            }
        });
        return Array.from(options).sort((a, b) => a.localeCompare(b));
    }, [treeRequestsData]);

    return (
        <React.Fragment>
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-6xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
                    <DialogHeader className="px-6 pt-6 pb-4">
                        <DialogTitle>Report Preview</DialogTitle>
                        <DialogDescription>
                            Review the report before exporting.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="px-6 pb-6 flex-1 flex flex-col overflow-hidden min-h-0">
                        <div className="flex items-center justify-end gap-2 mb-4">
                            <Button variant="outline" onClick={() => setShowPreview(false)}>
                                Close
                            </Button>
                            <ExportDropdown
                                data={exportRows}
                                headers={exportHeaders}
                                fileName={exportFileName}
                                title={exportTitle}
                                onSuccess={() => toast.success("Report exported successfully")}
                                onError={(error) => {
                                    console.error("Error exporting report:", error);
                                    toast.error("Failed to export report");
                                }}
                            />
                        </div>
                        <div className="border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 flex-1 overflow-hidden min-h-0">
                            <div
                                className="h-full overflow-y-auto p-6 prose prose-sm sm:prose lg:prose-lg max-w-none"
                                style={{ maxHeight: "calc(90vh - 220px)" }}
                                dangerouslySetInnerHTML={{ __html: previewContent }}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col h-full overflow-hidden">
                {/* Header Section */}
                <div className="page-header-bg sticky top-0 z-10">
                    <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
                        <div className="shrink-0">
                            <h1 className="text-xl font-semibold tracking-tight">
                                Urban Greening Reports
                            </h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Generate comprehensive reports for urban greening activities
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body Section */}
                <div className="flex-1 overflow-y-auto page-bg">
                    <div className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Configuration Panel */}
                            <div className="lg:col-span-1">
                                <Card className="border border-slate-200 dark:border-slate-700 shadow-none bg-white dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle>Report Configuration</CardTitle>
                                        <CardDescription>
                                            Select report type and parameters
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Report Type Selection */}
                                        <div className="space-y-2">
                                            <Label>Report Type</Label>
                                            <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {reportTypes.map(type => (
                                                        <SelectItem key={type.id} value={type.id}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-gray-500">
                                                {reportTypes.find(t => t.id === reportType)?.description}
                                            </p>
                                            
                                            {/* Display any data loading errors */}
                                            {(treeError || requestsError || plantingError || feeError) && (
                                                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                                                    <p className="font-medium">Data Loading Errors:</p>
                                                    {treeError && <p>• Tree Inventory: {(treeError as any).message}</p>}
                                                    {requestsError && <p>• Tree Requests: {(requestsError as any).message}</p>}
                                                    {plantingError && <p>• Urban Greening Projects: {(plantingError as any).message}</p>}
                                                    {feeError && <p>• Fee Records: {(feeError as any).message}</p>}
                                                </div>
                                            )}
                                        </div>

                                        {/* Year Selection */}
                                        {showYearFilter && (
                                            <div className="space-y-2">
                                                <Label>Year</Label>
                                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Years</SelectItem>
                                                        {years.map(year => (
                                                            <SelectItem key={year} value={year.toString()}>
                                                                {year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {/* Quarter Selection */}
                                        {showQuarterFilter && (
                                            <div className="space-y-2">
                                                <Label>Quarter</Label>
                                                <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Quarters</SelectItem>
                                                        {quarters.map(quarter => (
                                                            <SelectItem key={quarter} value={quarter}>
                                                                {quarter}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {/* Month Selection */}
                                        {showMonthFilter && (
                                            <div className="space-y-2">
                                                <Label>Months</Label>
                                                <MultiSelect
                                                    items={months}
                                                    selectedValues={selectedMonths}
                                                    onChange={setSelectedMonths}
                                                    placeholder="Select months..."
                                                    emptyMessage="No months available."
                                                    maxDisplayItems={2}
                                                />
                                            </div>
                                        )}

                                        {/* Status Filter for Tree Requests */}
                                        {showStatusFilter && (
                                            <div className="space-y-2">
                                                <Label>Request Status</Label>
                                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Statuses</SelectItem>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="approved">Approved</SelectItem>
                                                        <SelectItem value="rejected">Rejected</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {showRequestTypeFilter && (
                                            <div className="space-y-2">
                                                <Label>Request Type</Label>
                                                <Select value={selectedRequestType} onValueChange={setSelectedRequestType}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Types</SelectItem>
                                                        {requestTypeOptions.map((type) => (
                                                            <SelectItem key={type} value={type}>
                                                                {type}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {/* Generate Button */}
                                        <div className="space-y-2">
                                            <Button
                                                className="w-full bg-green-600 hover:bg-green-700 text-white border-none shadow-none rounded-lg"
                                                size="lg"
                                                onClick={handleGenerateReport}
                                                disabled={isGenerating}
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Preview Report
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Report Information Panel */}
                            <div className="lg:col-span-2">
                                {/* Data Summary Card */}
                                <Card className="mb-6 border border-slate-200 dark:border-slate-700 shadow-none bg-white dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle className="text-base">Data Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Trees in Inventory</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {isLoadingTrees ? (
                                                        <Loader2 className="w-6 h-6 animate-spin inline" />
                                                    ) : (
                                                        treeInventoryData?.length || 0
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Tree Requests</p>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {isLoadingRequests ? (
                                                        <Loader2 className="w-6 h-6 animate-spin inline" />
                                                    ) : (
                                                        treeRequestsData?.length || 0
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Urban Greening Projects</p>
                                                <p className="text-2xl font-bold text-emerald-600">
                                                    {isLoadingPlantings ? (
                                                        <Loader2 className="w-6 h-6 animate-spin inline" />
                                                    ) : (
                                                        plantingData?.length || 0
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Fee Records</p>
                                                <p className="text-2xl font-bold text-amber-600">
                                                    {isLoadingFees ? (
                                                        <Loader2 className="w-6 h-6 animate-spin inline" />
                                                    ) : (
                                                        feeData?.length || 0
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border border-slate-200 dark:border-slate-700 shadow-none bg-white dark:bg-gray-900">
                                    <CardHeader>
                                        <CardTitle>Report Information</CardTitle>
                                        <CardDescription>
                                            Details about the selected report type
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {/* Report Type Info */}
                                            <div>
                                                <h3 className="text-lg font-semibold mb-3">
                                                    {reportTypes.find(t => t.id === reportType)?.label}
                                                </h3>
                                                <p className="text-gray-600 mb-4">
                                                    {reportTypes.find(t => t.id === reportType)?.description}
                                                </p>

                                                {/* Specific Info per Report Type */}
                                                {reportType === "tree-inventory" && (
                                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                                        <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">Report Contents:</h4>
                                                        <ul className="list-disc list-inside text-green-800 dark:text-green-400 space-y-1">
                                                            <li>Tree ID and Location</li>
                                                            <li>Species Information</li>
                                                            <li>Health Status</li>
                                                            <li>Height and DBH</li>
                                                            <li>Planting Date</li>
                                                            <li>Maintenance Records</li>
                                                        </ul>
                                                    </div>
                                                )}

                                                {reportType === "tree-requests" && (
                                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                                        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Report Contents:</h4>
                                                        <ul className="list-disc list-inside text-blue-800 dark:text-blue-400 space-y-1">
                                                            <li>Request ID and Date Received</li>
                                                            <li>Applicant Information</li>
                                                            <li>Request Type (Cutting/Planting)</li>
                                                            <li>Processing Status</li>
                                                            <li>Location Details</li>
                                                            <li>Approval Information</li>
                                                        </ul>
                                                    </div>
                                                )}

                                                {reportType === "urban-greening-projects" && (
                                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                                                        <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-2">Report Contents:</h4>
                                                        <ul className="list-disc list-inside text-emerald-800 dark:text-emerald-400 space-y-1">
                                                            <li>Project Name and Type</li>
                                                            <li>Planting Date and Location</li>
                                                            <li>Number of Trees Planted</li>
                                                            <li>Species Planted</li>
                                                            <li>Project Status</li>
                                                            <li>Organization Details</li>
                                                        </ul>
                                                    </div>
                                                )}

                                                {reportType === "fee-records" && (
                                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                                        <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">Report Contents:</h4>
                                                        <ul className="list-disc list-inside text-amber-800 dark:text-amber-400 space-y-1">
                                                            <li>Fee Type and Amount</li>
                                                            <li>Payment Date</li>
                                                            <li>Payer Information</li>
                                                            <li>Receipt Number</li>
                                                            <li>Purpose of Fee</li>
                                                            <li>Payment Status</li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Preview Info */}
                                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                    Selected Parameters
                                                </h4>
                                                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                                    <p><span className="font-medium">Report Type:</span> {reportTypes.find(t => t.id === reportType)?.label}</p>
                                                    {showYearFilter && (
                                                        <p><span className="font-medium">Year:</span> {yearDisplay}</p>
                                                    )}
                                                    {showQuarterFilter && (
                                                        <p><span className="font-medium">Quarter:</span> {quarterDisplay}</p>
                                                    )}
                                                    {showMonthFilter && (
                                                        <p><span className="font-medium">Month:</span> {monthDisplay}</p>
                                                    )}
                                                    {showRequestTypeFilter && (
                                                        <p><span className="font-medium">Request Type:</span> {selectedRequestType === "all" ? "All Types" : selectedRequestType}</p>
                                                    )}
                                                    {showStatusFilter && (
                                                        <p><span className="font-medium">Status:</span> {statusDisplay}</p>
                                                    )}
                                                    {!showYearFilter && !showQuarterFilter && !showMonthFilter && (
                                                        <p><span className="font-medium">Filters:</span> None</p>
                                                    )}
                                                    <p><span className="font-medium">Format:</span> PDF, CSV, Excel</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default UrbanGreeningReports;
