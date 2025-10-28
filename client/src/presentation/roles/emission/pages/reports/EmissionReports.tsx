import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Label } from "@/presentation/components/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/shared/ui/select";
import { Checkbox } from "@/presentation/components/shared/ui/checkbox";
import { Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import { useOffices, useVehicles, useEmissionTests } from "@/core/api/emission-service";
import { generateReportHTML } from "./utils/reportHTMLGenerator";
import { exportHTMLToWord } from "./utils/htmlToWordConverter";
import { ReportPreviewEditor } from "./components/ReportPreviewEditor";

type ReportType = 'vehicle-registry' | 'testing-result' | 'office-compliance';

export const EmissionReports: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [reportType, setReportType] = useState<ReportType>("vehicle-registry");
    const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
    const [selectedQuarter, setSelectedQuarter] = useState<string>("Q1");
    const [selectedOffices, setSelectedOffices] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewContent, setPreviewContent] = useState<string>("");

    // Fetch data for report generation - fetch ALL vehicles (no limit)
    const { data: officesData } = useOffices();
    const { data: vehiclesData, isLoading: isLoadingVehicles } = useVehicles(undefined, 0, 10000); // Fetch up to 10,000 vehicles for reports
    const { data: emissionTests, isLoading: isLoadingTests } = useEmissionTests(); // Fetch all emission tests

    const reportTypes = [
        {
            id: "vehicle-registry" as ReportType,
            label: "Vehicle Registry",
            description: "Complete list of all registered government vehicles",
        },
        {
            id: "testing-result" as ReportType,
            label: "Testing Result",
            description: "Quarterly emission testing results by office (Q1-Q4)",
        },
        {
            id: "office-compliance" as ReportType,
            label: "Office Compliance Summary",
            description: "Compliance rates by quarter and office",
        },
    ];

    const toggleOfficeSelection = (officeId: string) => {
        setSelectedOffices(prev =>
            prev.includes(officeId)
                ? prev.filter(id => id !== officeId)
                : [...prev, officeId]
        );
    };

    const selectAllOffices = () => {
        if (selectedOffices.length === officesData?.offices.length) {
            setSelectedOffices([]);
        } else {
            setSelectedOffices(officesData?.offices.map(o => o.id) || []);
        }
    };

    const handleGenerateReport = async () => {
        // Check if data is still loading
        if (isLoadingVehicles || isLoadingTests) {
            toast.error("Please wait, data is still loading...");
            return;
        }

        // Validation based on report type
        if (reportType === "testing-result" && selectedOffices.length === 0) {
            toast.error("Please select at least one office for Testing Result report");
            return;
        }

        if (reportType === "office-compliance" && selectedOffices.length === 0) {
            toast.error("Please select at least one office for Office Compliance report");
            return;
        }

        setIsGenerating(true);

        try {
            const reportConfig = {
                reportType,
                year: parseInt(selectedYear),
                quarter: selectedQuarter,
                offices: officesData?.offices || [],
                selectedOfficeIds: selectedOffices,
                vehicles: vehiclesData?.vehicles || [],
                emissionTests: emissionTests || [],
            };

            // Generate HTML for preview
            const html = generateReportHTML(reportConfig);
            setPreviewContent(html);
            setShowPreview(true);
        } catch (error) {
            console.error("Error generating report:", error);
            toast.error("Failed to generate report. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExport = async (format: "word" | "excel", content: string) => {
        try {
            const fileName = `${reportTypes.find(r => r.id === reportType)?.label.replace(/\s+/g, '_')}_${selectedYear}_${selectedQuarter}_${Date.now()}.docx`;
            await exportHTMLToWord(content, fileName);
            toast.success("Report exported successfully");
            setShowPreview(false);
        } catch (error) {
            console.error("Error exporting report:", error);
            toast.error("Failed to export report");
        }
    };

    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const quarters = ["Q1", "Q2", "Q3", "Q4"];

    // Get available options based on report type
    const showQuarterSelection = reportType === "office-compliance";
    const showOfficeSelection = reportType === "testing-result" || reportType === "office-compliance";

    return (
        <>
            {/* Preview Modal */}
            {showPreview && (
                <ReportPreviewEditor
                    content={previewContent}
                    onClose={() => setShowPreview(false)}
                    onExport={handleExport}
                    reportFormat="word"
                />
            )}

            {/* Desktop Version */}
            <div className="hidden md:block min-h-screen bg-gray-50">
                <div className="sticky top-0 z-10 bg-white shadow-sm border-b">
                    <TopNavBarContainer dashboardType="government-emission" />
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Emission Reports</h1>
                        <p className="text-gray-600 mt-1">
                            Generate comprehensive reports for government vehicle emission testing
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Configuration Panel */}
                        <div className="lg:col-span-1">
                            <Card>
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
                                    </div>

                                    {/* Year Selection */}
                                    <div className="space-y-2">
                                        <Label>Year</Label>
                                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map(year => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Quarter Selection - Only for Office Compliance */}
                                    {showQuarterSelection && (
                                        <div className="space-y-2">
                                            <Label>Quarter</Label>
                                            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {quarters.map(quarter => (
                                                        <SelectItem key={quarter} value={quarter}>
                                                            {quarter}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Office Selection - For Testing Result and Office Compliance */}
                                    {showOfficeSelection && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label>Office/Department</Label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={selectAllOffices}
                                                    className="h-6 text-xs"
                                                >
                                                    {selectedOffices.length === officesData?.offices.length
                                                        ? "Deselect All"
                                                        : "Select All"}
                                                </Button>
                                            </div>
                                            <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                                                {officesData?.offices.map(office => (
                                                    <div key={office.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={office.id}
                                                            checked={selectedOffices.includes(office.id)}
                                                            onCheckedChange={() => toggleOfficeSelection(office.id)}
                                                        />
                                                        <label
                                                            htmlFor={office.id}
                                                            className="text-sm cursor-pointer flex-1"
                                                        >
                                                            {office.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {selectedOffices.length} office(s) selected
                                            </p>
                                        </div>
                                    )}

                                    {/* Generate Button */}
                                    <Button
                                        className="w-full"
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
                                </CardContent>
                            </Card>
                        </div>

                        {/* Report Information Panel */}
                        <div className="lg:col-span-2">
                            {/* Data Summary Card */}
                            <Card className="mb-6 border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <CardTitle className="text-base">Data Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Total Vehicles</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {isLoadingVehicles ? (
                                                    <Loader2 className="w-6 h-6 animate-spin inline" />
                                                ) : (
                                                    vehiclesData?.total || 0
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Loaded</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {isLoadingVehicles ? (
                                                    <Loader2 className="w-6 h-6 animate-spin inline" />
                                                ) : (
                                                    vehiclesData?.vehicles.length || 0
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Test Records</p>
                                            <p className="text-2xl font-bold text-cyan-600">
                                                {isLoadingTests ? (
                                                    <Loader2 className="w-6 h-6 animate-spin inline" />
                                                ) : (
                                                    emissionTests?.length || 0
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Government Offices</p>
                                            <p className="text-2xl font-bold text-purple-600">
                                                {officesData?.offices.length || 0}
                                            </p>
                                        </div>
                                    </div>
                                    {vehiclesData && vehiclesData.total > vehiclesData.vehicles.length && (
                                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                            <p className="text-sm text-yellow-800">
                                                ⚠️ Showing {vehiclesData.vehicles.length} of {vehiclesData.total} vehicles.
                                                Some vehicles may not be included in the report.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
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
                                            {reportType === "vehicle-registry" && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <h4 className="font-semibold text-blue-900 mb-2">Report Contents:</h4>
                                                    <ul className="list-disc list-inside text-blue-800 space-y-1">
                                                        <li>Plate Number</li>
                                                        <li>Driver Name</li>
                                                        <li>Contact Number</li>
                                                        <li>Office</li>
                                                        <li>Vehicle Type</li>
                                                        <li>Engine Type</li>
                                                        <li>Number of Wheels</li>
                                                    </ul>
                                                </div>
                                            )}

                                            {reportType === "testing-result" && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                    <h4 className="font-semibold text-green-900 mb-2">Report Contents:</h4>
                                                    <ul className="list-disc list-inside text-green-800 space-y-1">
                                                        <li>Tables categorized by each selected office</li>
                                                        <li>Each vehicle listed with quarterly test results (Q1-Q4)</li>
                                                        <li>Green cells indicate passed tests</li>
                                                        <li>Shows testing compliance throughout the year</li>
                                                    </ul>
                                                    <div className="mt-3 p-2 bg-yellow-100 rounded text-sm text-yellow-800">
                                                        ⚠️ Please select at least one office
                                                    </div>
                                                </div>
                                            )}

                                            {reportType === "office-compliance" && (
                                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                                    <h4 className="font-semibold text-purple-900 mb-2">Report Contents:</h4>
                                                    <ul className="list-disc list-inside text-purple-800 space-y-1">
                                                        <li>Total vehicles per office</li>
                                                        <li>Number of tested vehicles in the selected quarter</li>
                                                        <li>Number of passed tests</li>
                                                        <li>Compliance rate percentage</li>
                                                    </ul>
                                                    <div className="mt-3 p-2 bg-yellow-100 rounded text-sm text-yellow-800">
                                                        ⚠️ Please select quarter and at least one office
                                                    </div>
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
                                                <p><span className="font-medium">Year:</span> {selectedYear}</p>
                                                {showQuarterSelection && (
                                                    <p><span className="font-medium">Quarter:</span> {selectedQuarter}</p>
                                                )}
                                                {showOfficeSelection && (
                                                    <p>
                                                        <span className="font-medium">Offices:</span>{" "}
                                                        {selectedOffices.length === 0
                                                            ? "None selected"
                                                            : selectedOffices.length === officesData?.offices.length
                                                                ? "All offices"
                                                                : `${selectedOffices.length} office(s)`}
                                                    </p>
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

            {/* Mobile Version */}
            <div className="md:hidden min-h-screen bg-gray-50">
                <TopNavBarContainer dashboardType="government-emission" />

                <div className="p-4 space-y-4">
                    <div className="mb-4">
                        <h1 className="text-xl font-bold text-gray-900">Emission Reports</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Generate reports for emission testing
                        </p>
                    </div>

                    {/* Mobile Data Summary */}
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Data Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Vehicles</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {isLoadingVehicles ? "..." : vehiclesData?.vehicles.length || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-cyan-50 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Tests</p>
                                    <p className="text-xl font-bold text-cyan-600">
                                        {isLoadingTests ? "..." : emissionTests?.length || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Offices</p>
                                    <p className="text-xl font-bold text-purple-600">
                                        {officesData?.offices.length || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mobile Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Report Type */}
                            <div className="space-y-2">
                                <Label className="text-sm">Report Type</Label>
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
                            </div>

                            {/* Year */}
                            <div className="space-y-2">
                                <Label className="text-sm">Year</Label>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map(year => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Quarter - Only for Office Compliance */}
                            {showQuarterSelection && (
                                <div className="space-y-2">
                                    <Label className="text-sm">Quarter</Label>
                                    <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {quarters.map(quarter => (
                                                <SelectItem key={quarter} value={quarter}>
                                                    {quarter}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Office Selection */}
                            {showOfficeSelection && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm">Office/Department</Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={selectAllOffices}
                                            className="h-6 text-xs"
                                        >
                                            {selectedOffices.length === officesData?.offices.length
                                                ? "Deselect All"
                                                : "Select All"}
                                        </Button>
                                    </div>
                                    <div className="border rounded-md p-2 max-h-48 overflow-y-auto space-y-2">
                                        {officesData?.offices.map(office => (
                                            <div key={office.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`mobile-${office.id}`}
                                                    checked={selectedOffices.includes(office.id)}
                                                    onCheckedChange={() => toggleOfficeSelection(office.id)}
                                                />
                                                <label
                                                    htmlFor={`mobile-${office.id}`}
                                                    className="text-sm cursor-pointer flex-1"
                                                >
                                                    {office.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {selectedOffices.length} office(s) selected
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Mobile Report Information */}
                    <Card className={`border-l-4 ${reportType === 'vehicle-registry' ? 'border-l-blue-500' :
                            reportType === 'testing-result' ? 'border-l-green-500' :
                                'border-l-purple-500'
                        }`}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {reportTypes.find(r => r.id === reportType)?.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-700">
                                {reportTypes.find(r => r.id === reportType)?.description}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Mobile Generate Button */}
                    <Button
                        className="w-full"
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
            </div>
        </>
    );
};

export default EmissionReports;
