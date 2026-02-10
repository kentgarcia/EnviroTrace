import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEmissionOverviewData } from "./logic/useEmissionOverviewData";
import EmissionKeyStatsCards from "./components/EmissionKeyStatsCards";
import EmissionDetailedStats from "./components/EmissionDetailedStats";
import EmissionVisualDashboard from "./components/EmissionVisualDashboard";
import { Button } from "@/presentation/components/shared/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/presentation/components/shared/ui/select";

const QUARTERS = [
    { value: "all", label: "All Quarters" },
    { value: "1", label: "Q1 (Jan-Mar)" },
    { value: "2", label: "Q2 (Apr-Jun)" },
    { value: "3", label: "Q3 (Jul-Sep)" },
    { value: "4", label: "Q4 (Oct-Dec)" },
];

const getYearOptions = (): number[] => {
    const currentYear = new Date().getFullYear();
    return [0, 1, 2, 3, 4].map((i) => currentYear - i);
};

export const EmissionOverview: React.FC = () => {
    const queryClient = useQueryClient();
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [selectedQuarter, setSelectedQuarter] = useState("all");
    const selectedQuarterValue =
        selectedQuarter === "all" ? undefined : parseInt(selectedQuarter, 10);

    const {
        // Data
        keyStatsData,
        detailedStatsData,
        vehicleTypeData,
        quarterlyData,
        monthlyTrendsData,
        engineTypeData,
        officeComplianceData,

        // Loading states
        isLoading,
        error,
    } = useEmissionOverviewData(parseInt(selectedYear, 10), selectedQuarterValue);

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["vehicles"] });
        queryClient.invalidateQueries({ queryKey: ["office-compliance"] });
        queryClient.invalidateQueries({ queryKey: ["emission-tests"] });
    };

    const isAccessDenied = (error as any)?.response?.status === 403;

    if (error) {
        return (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="page-header-bg px-6 py-3">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">Government Emission Dashboard</h1>
                        <div className="text-xs text-gray-500">Error occurred</div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 page-bg">
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-md border border-red-200 dark:border-red-800">
                        <h3 className="font-medium">
                            {isAccessDenied ? "Access Denied" : "Error Loading Dashboard Data"}
                        </h3>
                        <p className="mb-2">
                            {isAccessDenied
                                ? "You do not have permission to view this dashboard data."
                                : "There was a problem connecting to the server. Please try again later or contact support if the issue persists."}
                        </p>
                        {!isAccessDenied && (
                            <details className="text-sm">
                                <summary className="cursor-pointer font-medium">
                                    Technical Details
                                </summary>
                                <p className="mt-2 font-mono text-xs bg-red-100 dark:bg-red-900/30 p-2 rounded border border-red-200 dark:border-red-800">
                                    {error.message}
                                </p>
                            </details>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="page-header-bg px-6 py-3">
                <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">Government Emission Dashboard</h1>
                        <div className="flex items-center gap-3">
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-[120px] h-9">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getYearOptions().map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                                <SelectTrigger className="w-[150px] h-9">
                                    <SelectValue placeholder="Quarter" />
                                </SelectTrigger>
                                <SelectContent>
                                    {QUARTERS.map((q) => (
                                        <SelectItem key={q.value} value={q.value}>
                                            {q.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-none rounded-lg h-9 w-9 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <RefreshCw className={`h-4 w-4 text-slate-600 ${isLoading ? "animate-spin" : ""}`} />
                            </Button>
                            <div className="text-xs text-gray-500">Updated {new Date().toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-[#F9FBFC] dark:bg-gray-900 space-y-6">
                    {/* Key Stats Cards */}
                    <EmissionKeyStatsCards
                        data={keyStatsData}
                        selectedYear={parseInt(selectedYear, 10)}
                        isLoading={isLoading}
                    />

                    {/* Detailed Statistics Cards */}
                    <EmissionDetailedStats
                        data={detailedStatsData}
                        isLoading={isLoading}
                    />

                    {/* Visual Dashboard */}
                    <EmissionVisualDashboard
                        quarterlyData={quarterlyData}
                        vehicleTypeData={vehicleTypeData}
                        engineTypeData={engineTypeData}
                        monthlyTrendsData={monthlyTrendsData}
                    />
                </div>
            </div>
    );
};
