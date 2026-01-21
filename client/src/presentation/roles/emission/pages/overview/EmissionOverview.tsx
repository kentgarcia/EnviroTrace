import React from "react";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEmissionOverviewData } from "./logic/useEmissionOverviewData";
import EmissionKeyStatsCards from "./components/EmissionKeyStatsCards";
import EmissionDetailedStats from "./components/EmissionDetailedStats";
import EmissionVisualDashboard from "./components/EmissionVisualDashboard";
import { Button } from "@/presentation/components/shared/ui/button";

export const EmissionOverview: React.FC = () => {
    const queryClient = useQueryClient();
    const currentYear = new Date().getFullYear();
    // Use current year (2025) to get the latest test data
    const selectedYear = currentYear;
    const selectedQuarter = undefined; // Show all quarters

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
    } = useEmissionOverviewData(selectedYear, selectedQuarter);

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["vehicles"] });
        queryClient.invalidateQueries({ queryKey: ["office-compliance"] });
        queryClient.invalidateQueries({ queryKey: ["emission-tests"] });
    };

    if (error) {
        return (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="bg-white px-6 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-900">Government Emission Dashboard</h1>
                        <div className="text-xs text-gray-500">Error occurred</div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-[#F9FBFC]">
                    <div className="bg-red-50 text-red-700 p-4 rounded-md">
                        <h3 className="font-medium">Error Loading Dashboard Data</h3>
                        <p className="mb-2">
                            There was a problem connecting to the server. Please try again
                            later or contact support if the issue persists.
                        </p>
                        <details className="text-sm">
                            <summary className="cursor-pointer font-medium">
                                Technical Details
                            </summary>
                            <p className="mt-2 font-mono text-xs bg-red-100 p-2 rounded">
                                {error.message}
                            </p>
                        </details>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="bg-white px-6 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-900">Government Emission Dashboard</h1>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className="border border-gray-200 bg-white shadow-none rounded-lg h-9 w-9 flex items-center justify-center hover:bg-slate-50 transition-colors"
                            >
                                <RefreshCw className={`h-4 w-4 text-slate-600 ${isLoading ? "animate-spin" : ""}`} />
                            </Button>
                            <div className="text-xs text-gray-500">Updated {new Date().toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-[#F9FBFC] space-y-6">
                    {/* Key Stats Cards */}
                    <EmissionKeyStatsCards
                        data={keyStatsData}
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
