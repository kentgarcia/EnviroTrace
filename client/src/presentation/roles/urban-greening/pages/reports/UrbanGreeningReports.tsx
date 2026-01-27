import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Label } from "@/presentation/components/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/shared/ui/select";
import { Eye, Loader2, FileSpreadsheet, Download } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { fetchTrees } from "@/core/api/tree-inventory-api";
import { fetchTreeRequests } from "@/core/api/tree-management-request-api";
import { fetchUrbanGreeningPlantings, fetchSaplingCollections } from "@/core/api/planting-api";
import { fetchUrbanGreeningFeeRecords } from "@/core/api/fee-api";
import { generateUrbanGreeningReportHTML } from "./utils/reportHTMLGenerator";
import { exportHTMLToWord } from "@/core/utils/htmlToWordConverter";
import { ReportPreviewEditor } from "@/presentation/components/shared/reports/ReportPreviewEditor";

type ReportType = 'tree-inventory' | 'tree-requests' | 'planting-projects' | 'sapling-collections' | 'fee-records';

export const UrbanGreeningReports: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [reportType, setReportType] = useState<ReportType>("tree-inventory");
    const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
    const [selectedMonth, setSelectedMonth] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewContent, setPreviewContent] = useState<string>("");

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
        queryKey: ["planting-projects", "all"],
        queryFn: async () => {
            const data = await fetchUrbanGreeningPlantings({ skip: 0, limit: 1000 });
            console.log('Planting Data:', data);
            return data;
        },
    });

    const { data: saplingData, isLoading: isLoadingSaplings, error: saplingError } = useQuery({
        queryKey: ["sapling-collections", "all"],
        queryFn: async () => {
            const data = await fetchSaplingCollections({ skip: 0, limit: 1000 });
            console.log('Sapling Data:', data);
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
            id: "planting-projects" as ReportType,
            label: "Planting Projects Report",
            description: "Urban greening planting initiatives and project details",
        },
        {
            id: "sapling-collections" as ReportType,
            label: "Sapling Collections Report",
            description: "Sapling distribution and collection records",
        },
        {
            id: "fee-records" as ReportType,
            label: "Fee Records Report",
            description: "Payment records and fee collection summary",
        },
    ];

    const handleGenerateReport = async () => {
        const isLoading = isLoadingTrees || isLoadingRequests || isLoadingPlantings || isLoadingSaplings || isLoadingFees;
        
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
            console.log('Selected Month:', selectedMonth);
            console.log('Raw Data Lengths:', {
                treeInventory: treeInventoryData?.length,
                treeRequests: treeRequestsData?.length,
                planting: plantingData?.length,
                sapling: saplingData?.length,
                fee: feeData?.length,
            });
            
            // Filter data based on report type
            switch (reportType) {
                case "tree-inventory":
                    filteredData = filterDataByDateTime(treeInventoryData || [], "created_at");
                    reportTitle = "Tree Inventory Report";
                    break;
                case "tree-requests":
                    filteredData = filterDataByDateTime(treeRequestsData || [], "receiving_date_received");
                    if (selectedStatus !== "all") {
                        filteredData = filteredData.filter((item: any) => item.status_receiving === selectedStatus);
                    }
                    reportTitle = "Tree Requests Report";
                    break;
                case "planting-projects":
                    filteredData = filterDataByDateTime(plantingData || [], "planting_date");
                    reportTitle = "Planting Projects Report";
                    break;
                case "sapling-collections":
                    filteredData = filterDataByDateTime(saplingData || [], "collection_date");
                    reportTitle = "Sapling Collections Report";
                    break;
                case "fee-records":
                    filteredData = filterDataByDateTime(feeData || [], "date");
                    reportTitle = "Fee Records Report";
                    break;
            }
            
            console.log('Filtered Data Length:', filteredData.length);
            console.log('Filtered Data Sample:', filteredData[0]);

            const reportConfig = {
                reportType,
                reportTitle,
                year: selectedYear !== "all" ? parseInt(selectedYear) : undefined,
                month: selectedMonth !== "all" ? parseInt(selectedMonth) : undefined,
                status: selectedStatus,
                data: filteredData,
            };

            // Generate HTML for preview
            const html = generateUrbanGreeningReportHTML(reportConfig);
            setPreviewContent(html);
            setShowPreview(true);
        } catch (error) {
            console.error("Error generating report:", error);
            toast.error("Failed to generate report. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const filterDataByDateTime = (data: any[], dateField: string) => {
        // If both year and month are "all", return all data
        if (selectedYear === "all" && selectedMonth === "all") {
            return data;
        }

        return data.filter((item: any) => {
            // If no date field exists, exclude only if filtering by date
            if (!item[dateField]) return false;
            
            const itemDate = new Date(item[dateField]);
            const itemYear = itemDate.getFullYear();
            const itemMonth = itemDate.getMonth() + 1;

            // Filter by year if specified
            if (selectedYear !== "all" && itemYear !== parseInt(selectedYear)) {
                return false;
            }

            // Filter by month if specified
            if (selectedMonth !== "all" && itemMonth !== parseInt(selectedMonth)) {
                return false;
            }

            return true;
        });
    };

    const handleExport = async (format: "word" | "excel", content: string) => {
        try {
            const fileName = `${reportTypes.find(r => r.id === reportType)?.label.replace(/\s+/g, '_')}_${selectedYear}_${selectedMonth !== "all" ? `Month_${selectedMonth}` : "All_Months"}_${Date.now()}.docx`;
            await exportHTMLToWord(content, fileName);
            toast.success("Report exported successfully");
            setShowPreview(false);
        } catch (error) {
            console.error("Error exporting report:", error);
            toast.error("Failed to export report");
        }
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

    const showStatusFilter = reportType === "tree-requests";

    return (
        <React.Fragment>
            {showPreview && (
                <ReportPreviewEditor
                    content={previewContent}
                    onClose={() => setShowPreview(false)}
                    onExport={handleExport}
                    reportFormat="word"
                />
            )}

            <div className="flex flex-col h-full overflow-hidden">
                {/* Header Section */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
                        <div className="shrink-0">
                            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                                Urban Greening Reports
                            </h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Generate comprehensive reports for urban greening activities
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body Section */}
                <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
                    <div className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Configuration Panel */}
                            <div className="lg:col-span-1">
                                <Card className="border border-slate-200 shadow-none bg-white">
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
                                            {(treeError || requestsError || plantingError || saplingError || feeError) && (
                                                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                                                    <p className="font-medium">Data Loading Errors:</p>
                                                    {treeError && <p>• Tree Inventory: {(treeError as any).message}</p>}
                                                    {requestsError && <p>• Tree Requests: {(requestsError as any).message}</p>}
                                                    {plantingError && <p>• Planting Projects: {(plantingError as any).message}</p>}
                                                    {saplingError && <p>• Sapling Collections: {(saplingError as any).message}</p>}
                                                    {feeError && <p>• Fee Records: {(feeError as any).message}</p>}
                                                </div>
                                            )}
                                        </div>

                                        {/* Year Selection */}
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

                                        {/* Month Selection */}
                                        <div className="space-y-2">
                                            <Label>Month</Label>
                                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Months</SelectItem>
                                                    {months.map(month => (
                                                        <SelectItem key={month.value} value={month.value}>
                                                            {month.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

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
                                <Card className="mb-6 border border-slate-200 shadow-none bg-white">
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
                                                <p className="text-sm text-gray-600">Planting Projects</p>
                                                <p className="text-2xl font-bold text-emerald-600">
                                                    {isLoadingPlantings ? (
                                                        <Loader2 className="w-6 h-6 animate-spin inline" />
                                                    ) : (
                                                        plantingData?.length || 0
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Sapling Collections</p>
                                                <p className="text-2xl font-bold text-teal-600">
                                                    {isLoadingSaplings ? (
                                                        <Loader2 className="w-6 h-6 animate-spin inline" />
                                                    ) : (
                                                        saplingData?.length || 0
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

                                <Card className="border border-slate-200 shadow-none bg-white">
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
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                        <h4 className="font-semibold text-green-900 mb-2">Report Contents:</h4>
                                                        <ul className="list-disc list-inside text-green-800 space-y-1">
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
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                        <h4 className="font-semibold text-blue-900 mb-2">Report Contents:</h4>
                                                        <ul className="list-disc list-inside text-blue-800 space-y-1">
                                                            <li>Request ID and Date Received</li>
                                                            <li>Applicant Information</li>
                                                            <li>Request Type (Cutting/Planting)</li>
                                                            <li>Processing Status</li>
                                                            <li>Location Details</li>
                                                            <li>Approval Information</li>
                                                        </ul>
                                                    </div>
                                                )}

                                                {reportType === "planting-projects" && (
                                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                                        <h4 className="font-semibold text-emerald-900 mb-2">Report Contents:</h4>
                                                        <ul className="list-disc list-inside text-emerald-800 space-y-1">
                                                            <li>Project Name and Type</li>
                                                            <li>Planting Date and Location</li>
                                                            <li>Number of Trees Planted</li>
                                                            <li>Species Planted</li>
                                                            <li>Project Status</li>
                                                            <li>Organization Details</li>
                                                        </ul>
                                                    </div>
                                                )}

                                                {reportType === "sapling-collections" && (
                                                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                                                        <h4 className="font-semibold text-teal-900 mb-2">Report Contents:</h4>
                                                        <ul className="list-disc list-inside text-teal-800 space-y-1">
                                                            <li>Collection Date and Location</li>
                                                            <li>Sapling Species</li>
                                                            <li>Quantity Collected/Distributed</li>
                                                            <li>Recipient Information</li>
                                                            <li>Purpose of Collection</li>
                                                            <li>Collection Method</li>
                                                        </ul>
                                                    </div>
                                                )}

                                                {reportType === "fee-records" && (
                                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                                        <h4 className="font-semibold text-amber-900 mb-2">Report Contents:</h4>
                                                        <ul className="list-disc list-inside text-amber-800 space-y-1">
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
                                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                                    Selected Parameters
                                                </h4>
                                                <div className="text-sm text-gray-700 space-y-1">
                                                    <p><span className="font-medium">Report Type:</span> {reportTypes.find(t => t.id === reportType)?.label}</p>
                                                    <p><span className="font-medium">Year:</span> {selectedYear === "all" ? "All Years" : selectedYear}</p>
                                                    <p><span className="font-medium">Month:</span> {selectedMonth === "all" ? "All Months" : months.find(m => m.value === selectedMonth)?.label}</p>
                                                    {showStatusFilter && (
                                                        <p><span className="font-medium">Status:</span> {selectedStatus === "all" ? "All Statuses" : selectedStatus}</p>
                                                    )}
                                                    <p><span className="font-medium">Format:</span> Microsoft Word (.docx)</p>
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
