import React from "react";
import { useEmissionOverviewData } from "./logic/useEmissionOverviewData";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import EmissionKeyStatsCards from "./components/EmissionKeyStatsCards";
import EmissionDetailedStats from "./components/EmissionDetailedStats";
import EmissionVisualDashboard from "./components/EmissionVisualDashboard";
import { NetworkStatus } from "@/presentation/components/shared/layout/NetworkStatus";

export const EmissionOverview: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const selectedYear = currentYear; // For now, we'll use current year
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

    if (error) {
        return (
            <div className="flex min-h-screen w-full">
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopNavBarContainer dashboardType="government-emission" />

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
                <NetworkStatus />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBarContainer dashboardType="government-emission" />

                <div className="bg-white px-6 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-900">Government Emission Dashboard</h1>
                        <div className="text-xs text-gray-500">Updated {new Date().toLocaleString()}</div>
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
                        officeComplianceData={officeComplianceData}
                        engineTypeData={engineTypeData}
                        monthlyTrendsData={monthlyTrendsData}
                    />
                </div>
            </div>
            <NetworkStatus />
        </div>
    );
};
