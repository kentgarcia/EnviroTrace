import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Label } from "@/presentation/components/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/shared/ui/select";
import { Checkbox } from "@/presentation/components/shared/ui/checkbox";
import { Eye, Loader2, FileSpreadsheet, Printer } from "lucide-react";
import { toast } from "sonner";
import {
    useOffices,
    useEmissionTests,
    fetchVehicles,
    type Vehicle,
} from "@/core/api/emission-service";
import { generateReportHTML, generateComprehensiveTestingReportHTML } from "./utils/reportHTMLGenerator";
import { generateComprehensiveTestingReport } from "./utils/excelReportGenerator";
import { exportHTMLToWord } from "@/core/utils/htmlToWordConverter";
import { ReportPreviewEditor } from "@/presentation/components/shared/reports/ReportPreviewEditor";

type ReportType = 'quarterly-testing' | 'vehicle-registry' | 'testing-result' | 'office-compliance';

export const EmissionReports: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [reportType, setReportType] = useState<ReportType>("quarterly-testing");
    const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
    const [selectedQuarter, setSelectedQuarter] = useState<string>("Q1");
    const [selectedOffices, setSelectedOffices] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [previewContent, setPreviewContent] = useState<string>("");
    
    // Comprehensive report filters
    const [comprehensiveStatus, setComprehensiveStatus] = useState<string>("all");
    const [comprehensiveOffice, setComprehensiveOffice] = useState<string>("all");
    const [comprehensiveEngineType, setComprehensiveEngineType] = useState<string>("all");

    const { data: officesData } = useOffices();
    const { data: emissionTests, isLoading: isLoadingTests } = useEmissionTests(); // Fetch all emission tests

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [vehiclesTotal, setVehiclesTotal] = useState<number>(0);
    const [isVehiclesLoading, setIsVehiclesLoading] = useState(false);
    const vehiclesLoadPromiseRef = React.useRef<Promise<Vehicle[]> | null>(null);

    const ensureVehiclesLoaded = React.useCallback(async () => {
        if (vehicles.length > 0) {
            return vehicles;
        }

        if (vehiclesLoadPromiseRef.current) {
            return vehiclesLoadPromiseRef.current;
        }

        const loader = (async () => {
            const pageSize = 1000;
            let skip = 0;
            let allVehicles: Vehicle[] = [];
            let total = 0;

            while (true) {
                const response = await fetchVehicles(undefined, skip, pageSize);
                allVehicles = allVehicles.concat(response.vehicles);
                total = response.total;
                skip += response.vehicles.length;

                if (allVehicles.length >= total || response.vehicles.length === 0) {
                    break;
                }
            }

            setVehicles(allVehicles);
            setVehiclesTotal(total);
            return allVehicles;
        })();

        vehiclesLoadPromiseRef.current = loader;
        setIsVehiclesLoading(true);

        try {
            return await loader;
        } finally {
            vehiclesLoadPromiseRef.current = null;
            setIsVehiclesLoading(false);
        }
    }, [vehicles]);

    const engineTypeOptions = React.useMemo(() => {
        if (vehicles.length === 0) {
            return [] as string[];
        }

        const deduped = new Map<string, string>();
        vehicles.forEach(vehicle => {
            const type = vehicle.engine_type?.trim();
            if (!type) {
                return;
            }

            const normalized = type.toLowerCase();
            if (!deduped.has(normalized)) {
                deduped.set(normalized, type);
            }
        });

        return Array.from(deduped.values()).sort((a, b) => a.localeCompare(b));
    }, [vehicles]);

    const reportTypes = [
        {
            id: "quarterly-testing" as ReportType,
            label: "Quarterly Testing Report",
            description: "Detailed emission testing report with CO/HC levels and vehicle information",
        },
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
        if (isLoadingTests) {
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
            const vehiclesForReport = await ensureVehiclesLoaded();

            if (vehiclesForReport.length === 0) {
                toast.info("No vehicles available to generate this report.");
                setIsGenerating(false);
                return;
            }

            // Handle quarterly testing report differently
            if (reportType === "quarterly-testing") {
                // Create vehicle test map, preferring latest tests with diesel opacimeter data
                const vehicleTestMap = new Map();
                (emissionTests || []).forEach(test => {
                    const existing = vehicleTestMap.get(test.vehicle_id);
                    if (!existing) {
                        vehicleTestMap.set(test.vehicle_id, test);
                        return;
                    }

                    const existingDate = existing?.test_date ? new Date(existing.test_date).getTime() : null;
                    const incomingDate = test?.test_date ? new Date(test.test_date).getTime() : null;

                    if (incomingDate === null && existingDate === null) {
                        const existingHasOpacimeter = existing.opacimeter_result !== undefined && existing.opacimeter_result !== null;
                        const newHasOpacimeter = test.opacimeter_result !== undefined && test.opacimeter_result !== null;

                        if (!existingHasOpacimeter && newHasOpacimeter) {
                            vehicleTestMap.set(test.vehicle_id, test);
                        }
                        return;
                    }

                    if (existingDate === null && incomingDate !== null) {
                        vehicleTestMap.set(test.vehicle_id, test);
                        return;
                    }

                    if (incomingDate === null) {
                        return;
                    }

                    if (existingDate === null || incomingDate > existingDate) {
                        vehicleTestMap.set(test.vehicle_id, test);
                        return;
                    }

                    if (incomingDate === existingDate) {
                        const existingHasOpacimeter = existing.opacimeter_result !== undefined && existing.opacimeter_result !== null;
                        const newHasOpacimeter = test.opacimeter_result !== undefined && test.opacimeter_result !== null;

                        if (!existingHasOpacimeter && newHasOpacimeter) {
                            vehicleTestMap.set(test.vehicle_id, test);
                        }
                    }
                });

                // Build report data
                const reportData = vehiclesForReport
                    .filter(v => {
                        // Filter by year if selected
                        if (selectedYear !== "all") {
                            const test = vehicleTestMap.get(v.id);
                            if (!test || new Date(test.test_date).getFullYear() !== parseInt(selectedYear)) {
                                return false;
                            }
                        }

                        // Filter by quarter if selected
                        if (selectedQuarter !== "all") {
                            const test = vehicleTestMap.get(v.id);
                            if (!test) return false;
                            const testQuarter = Math.ceil((new Date(test.test_date).getMonth() + 1) / 3);
                            if (testQuarter !== parseInt(selectedQuarter.replace("Q", ""))) {
                                return false;
                            }
                        }

                        // Filter by office if selected
                        if (comprehensiveOffice !== "all") {
                            if (v.office_id !== comprehensiveOffice) return false;
                        }

                        // Filter by status if selected
                        if (comprehensiveStatus !== "all") {
                            const test = vehicleTestMap.get(v.id);
                            if (comprehensiveStatus === "not-tested") return !test;
                            if (comprehensiveStatus === "passed") return test?.result === true;
                            if (comprehensiveStatus === "failed") return test?.result === false;
                        }

                        // Filter by engine type if selected
                        if (comprehensiveEngineType !== "all") {
                            const vehicleEngine = v.engine_type?.trim().toLowerCase() || "";
                            if (vehicleEngine !== comprehensiveEngineType.trim().toLowerCase()) {
                                return false;
                            }
                        }

                        return true;
                    })
                    .map(v => {
                        const test = vehicleTestMap.get(v.id);
                        const identifier = v.plate_number || v.chassis_number || v.registration_number || "N/A";
                        const engineType = v.engine_type?.toLowerCase() || "";
                        return {
                            vehicleId: v.id,
                            driverName: v.driver_name || "N/A",
                            office: v.office?.name || "N/A",
                            identifier,
                            category: v.vehicle_type || "N/A",
                            description: v.description || "",
                            yearAcquired: v.year_acquired || null,
                            co: test?.co_level ?? null,
                            hc: test?.hc_level ?? null,
                            opacimeter: engineType.includes("diesel") ? test?.opacimeter_result ?? null : null,
                            engineType: v.engine_type || "",
                            testResult: (test?.result === true ? "PASSED" : test?.result === false ? "FAILED" : "NOT TESTED") as "PASSED" | "FAILED" | "NOT TESTED",
                            testDate: test?.test_date ? new Date(test.test_date).toLocaleDateString() : null,
                        };
                    });

                // Generate HTML for preview
                const html = generateComprehensiveTestingReportHTML({
                    year: selectedYear !== "all" ? parseInt(selectedYear) : undefined,
                    quarter: selectedQuarter !== "all" ? parseInt(selectedQuarter.replace("Q", "")) : undefined,
                    office: comprehensiveOffice !== "all" ? officesData?.offices.find(o => o.id === comprehensiveOffice)?.name : "All Offices",
                    status: comprehensiveStatus,
                    data: reportData,
                });

                setPreviewContent(html);
                setShowPreview(true);
            } else {
                const reportConfig = {
                    reportType,
                    year: parseInt(selectedYear),
                    quarter: selectedQuarter,
                    offices: officesData?.offices || [],
                    selectedOfficeIds: selectedOffices,
                    vehicles: vehiclesForReport,
                    emissionTests: emissionTests || [],
                };

                // Generate HTML for preview
                const html = generateReportHTML(reportConfig);
                setPreviewContent(html);
                setShowPreview(true);
            }
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

    const handleLoadVehicles = React.useCallback(async () => {
        try {
            await ensureVehiclesLoaded();
            toast.success("Vehicle data loaded");
        } catch (error) {
            console.error("Error loading vehicles:", error);
            toast.error("Failed to load vehicle data");
        }
    }, [ensureVehiclesLoaded]);

    const handleExportToExcel = async () => {
        if (reportType !== "quarterly-testing") {
            toast.error("Excel export is only available for Quarterly Testing Report");
            return;
        }

        try {
            const vehiclesForReport = await ensureVehiclesLoaded();

            if (vehiclesForReport.length === 0) {
                toast.info("No vehicles available to export.");
                return;
            }

            // Create vehicle test map, preferring latest tests with diesel opacimeter data
            const vehicleTestMap = new Map();
            (emissionTests || []).forEach(test => {
                const existing = vehicleTestMap.get(test.vehicle_id);
                if (!existing) {
                    vehicleTestMap.set(test.vehicle_id, test);
                    return;
                }

                const existingDate = existing?.test_date ? new Date(existing.test_date).getTime() : null;
                const incomingDate = test?.test_date ? new Date(test.test_date).getTime() : null;

                if (incomingDate === null && existingDate === null) {
                    const existingHasOpacimeter = existing.opacimeter_result !== undefined && existing.opacimeter_result !== null;
                    const newHasOpacimeter = test.opacimeter_result !== undefined && test.opacimeter_result !== null;

                    if (!existingHasOpacimeter && newHasOpacimeter) {
                        vehicleTestMap.set(test.vehicle_id, test);
                    }
                    return;
                }

                if (existingDate === null && incomingDate !== null) {
                    vehicleTestMap.set(test.vehicle_id, test);
                    return;
                }

                if (incomingDate === null) {
                    return;
                }

                if (existingDate === null || incomingDate > existingDate) {
                    vehicleTestMap.set(test.vehicle_id, test);
                    return;
                }

                if (incomingDate === existingDate) {
                    const existingHasOpacimeter = existing.opacimeter_result !== undefined && existing.opacimeter_result !== null;
                    const newHasOpacimeter = test.opacimeter_result !== undefined && test.opacimeter_result !== null;

                    if (!existingHasOpacimeter && newHasOpacimeter) {
                        vehicleTestMap.set(test.vehicle_id, test);
                    }
                }
            });

            // Filter vehicles
            let filteredVehicles = vehiclesForReport;

            if (selectedYear !== "all") {
                filteredVehicles = filteredVehicles.filter(v => {
                    const test = vehicleTestMap.get(v.id);
                    return test && new Date(test.test_date).getFullYear() === parseInt(selectedYear);
                });
            }

            if (selectedQuarter !== "all") {
                filteredVehicles = filteredVehicles.filter(v => {
                    const test = vehicleTestMap.get(v.id);
                    if (!test) return false;
                    const testQuarter = Math.ceil((new Date(test.test_date).getMonth() + 1) / 3);
                    return testQuarter === parseInt(selectedQuarter.replace("Q", ""));
                });
            }

            if (comprehensiveOffice !== "all") {
                filteredVehicles = filteredVehicles.filter(v => v.office_id === comprehensiveOffice);
            }

            if (comprehensiveStatus !== "all") {
                filteredVehicles = filteredVehicles.filter(v => {
                    const test = vehicleTestMap.get(v.id);
                    if (comprehensiveStatus === "not-tested") return !test;
                    if (comprehensiveStatus === "passed") return test?.result === true;
                    if (comprehensiveStatus === "failed") return test?.result === false;
                    return true;
                });
            }

            if (comprehensiveEngineType !== "all") {
                const selectedEngine = comprehensiveEngineType.trim().toLowerCase();
                filteredVehicles = filteredVehicles.filter(v => {
                    const vehicleEngine = v.engine_type?.trim().toLowerCase() || "";
                    return vehicleEngine === selectedEngine;
                });
            }

            await generateComprehensiveTestingReport({
                year: selectedYear !== "all" ? parseInt(selectedYear) : undefined,
                quarter: selectedQuarter !== "all" ? parseInt(selectedQuarter.replace("Q", "")) : undefined,
                office: comprehensiveOffice !== "all" ? comprehensiveOffice : undefined,
                status: comprehensiveStatus,
                engineType: comprehensiveEngineType !== "all" ? comprehensiveEngineType : undefined,
                vehicles: filteredVehicles,
                tests: emissionTests || [],
            });

            toast.success("Excel report generated successfully");
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            toast.error("Failed to export to Excel");
        }
    };

    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const quarters = ["Q1", "Q2", "Q3", "Q4"];

    // Get available options based on report type
    const showQuarterSelection = reportType === "office-compliance" || reportType === "quarterly-testing";
    const showOfficeSelection = reportType === "testing-result" || reportType === "office-compliance";
    const showComprehensiveFilters = reportType === "quarterly-testing";
    const showYearSelection = reportType !== "vehicle-registry";

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
                <div className="page-header-bg sticky top-0 z-10">
                    <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
                        <div className="shrink-0">
                            <h1 className="text-xl font-semibold tracking-tight">
                                Emission Reports
                            </h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Generate comprehensive reports for government vehicle emission testing
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
                                <Card className="border border-slate-200 dark:border-gray-700 shadow-none bg-white dark:bg-gray-900">
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

                                    {/* Year Selection - Hidden for Vehicle Registry */}
                                    {showYearSelection && (
                                    <div className="space-y-2">
                                        <Label>Year</Label>
                                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {reportType === "quarterly-testing" && (
                                                    <SelectItem value="all">All Years</SelectItem>
                                                )}
                                                {years.map(year => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    )}

                                    {/* Quarter Selection - Only for Office Compliance and Quarterly Testing */}
                                    {showQuarterSelection && (
                                        <div className="space-y-2">
                                            <Label>Quarter</Label>
                                            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {reportType === "quarterly-testing" && (
                                                        <SelectItem value="all">All Quarters</SelectItem>
                                                    )}
                                                    {quarters.map(quarter => (
                                                        <SelectItem key={quarter} value={quarter}>
                                                            {quarter}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Quarterly Testing Filters */}
                                    {showComprehensiveFilters && (
                                        <>
                                            <div className="space-y-2">
                                                <Label>Office Filter</Label>
                                                <Select value={comprehensiveOffice} onValueChange={setComprehensiveOffice}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Offices</SelectItem>
                                                        {officesData?.offices.map(office => (
                                                            <SelectItem key={office.id} value={office.id}>
                                                                {office.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Status Filter</Label>
                                                <Select value={comprehensiveStatus} onValueChange={setComprehensiveStatus}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Vehicles</SelectItem>
                                                        <SelectItem value="passed">Passed Only</SelectItem>
                                                        <SelectItem value="failed">Failed Only</SelectItem>
                                                        <SelectItem value="not-tested">Not Tested</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Engine Type Filter</Label>
                                                <Select value={comprehensiveEngineType} onValueChange={setComprehensiveEngineType}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Engine Types</SelectItem>
                                                        {engineTypeOptions.map(type => (
                                                            <SelectItem key={type} value={type}>
                                                                {type}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </>
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
                                                    className="h-6 text-xs hover:bg-slate-100"
                                                >
                                                    {selectedOffices.length === officesData?.offices.length
                                                        ? "Deselect All"
                                                        : "Select All"}
                                                </Button>
                                            </div>
                                            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
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
                                    <div className="space-y-2">
                                        <Button
                                            className="w-full bg-[#0033a0] hover:bg-[#002a80] text-white border-none shadow-none rounded-lg"
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

                                        {/* Export to Excel Button - Only for Quarterly Testing */}
                                        {showComprehensiveFilters && (
                                            <Button
                                                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-none rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700"
                                                size="lg"
                                                variant="outline"
                                                onClick={handleExportToExcel}
                                                disabled={isGenerating}
                                            >
                                                <FileSpreadsheet className="w-4 h-4 mr-2" />
                                                Export to Excel
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Report Information Panel */}
                        <div className="lg:col-span-2">
                            {/* Data Summary Card */}
                            <Card className="mb-6 border border-slate-200 dark:border-gray-700 shadow-none bg-white dark:bg-gray-900">
                                <CardHeader>
                                    <CardTitle className="text-base">Data Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Vehicles</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {isVehiclesLoading ? (
                                                    <Loader2 className="w-6 h-6 animate-spin inline" />
                                                ) : vehiclesTotal > 0 ? vehiclesTotal : "—"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Loaded</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {isVehiclesLoading ? (
                                                    <Loader2 className="w-6 h-6 animate-spin inline" />
                                                ) : vehicles.length}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Test Records</p>
                                            <p className="text-2xl font-bold text-cyan-600">
                                                {isLoadingTests ? (
                                                    <Loader2 className="w-6 h-6 animate-spin inline" />
                                                ) : (
                                                    emissionTests?.length || 0
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Government Offices</p>
                                            <p className="text-2xl font-bold text-purple-600">
                                                {officesData?.offices.length || 0}
                                            </p>
                                        </div>
                                    </div>
                                    {vehiclesTotal > 0 && vehicles.length < vehiclesTotal && (
                                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md">
                                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                ⚠️ Showing {vehicles.length} of {vehiclesTotal} vehicles. Use the load button to fetch remaining records.
                                            </p>
                                        </div>
                                    )}
                                    {vehiclesTotal === 0 && vehicles.length === 0 && !isVehiclesLoading && (
                                        <div className="mt-4 p-3 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-md flex items-center justify-between">
                                            <p className="text-sm text-slate-700 dark:text-slate-300">Vehicle data has not been loaded yet.</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleLoadVehicles}
                                                disabled={isVehiclesLoading}
                                            >
                                                {isVehiclesLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    "Load vehicle data"
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border border-slate-200 dark:border-gray-700 shadow-none bg-white dark:bg-gray-900">
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
                                            <p className="text-gray-600 mb-4 dark:text-gray-400">
                                                {reportTypes.find(t => t.id === reportType)?.description}
                                            </p>

                                            {/* Specific Info per Report Type */}
                                            {reportType === "vehicle-registry" && (
                                                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Report Contents:</h4>
                                                    <ul className="list-disc list-inside text-blue-800 dark:text-blue-300 space-y-1">
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
                                                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                                    <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Report Contents:</h4>
                                                    <ul className="list-disc list-inside text-green-800 dark:text-green-300 space-y-1">
                                                        <li>Tables categorized by each selected office</li>
                                                        <li>Each vehicle listed with quarterly test results (Q1-Q4)</li>
                                                        <li>Green cells indicate passed tests</li>
                                                        <li>Shows testing compliance throughout the year</li>
                                                    </ul>
                                                    <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-sm text-yellow-800 dark:text-yellow-200">
                                                        ⚠️ Please select at least one office
                                                    </div>
                                                </div>
                                            )}

                                            {reportType === "office-compliance" && (
                                                <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                                                    <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">Report Contents:</h4>
                                                    <ul className="list-disc list-inside text-purple-800 dark:text-purple-300 space-y-1">
                                                        <li>Total vehicles per office</li>
                                                        <li>Number of tested vehicles in the selected quarter</li>
                                                        <li>Number of passed tests</li>
                                                        <li>Compliance rate percentage</li>
                                                    </ul>
                                                    <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-sm text-yellow-800 dark:text-yellow-200">
                                                        ⚠️ Please select quarter and at least one office
                                                    </div>
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
            </div>
        </React.Fragment>
    );
};

export default EmissionReports;
