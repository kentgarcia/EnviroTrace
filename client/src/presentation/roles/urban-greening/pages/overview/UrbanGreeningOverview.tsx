import React from "react";
import { useOverviewData } from "./logic/useOverviewData";
import { PlantingSummary } from "./components/PlantingSummary";
import { FeeManagement } from "./components/FeeManagement";
import { ChartsOverview } from "./components/ChartsOverview";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import UGKeyStatsCards from "./components/UGKeyStatsCards";
import UGVisualDashboard from "./components/UGVisualDashboard";

export const UrbanGreeningOverview: React.FC = () => {
    const {
        // Data hooks
        urbanGreeningStatistics,
        saplingStatistics,
        treeRequests,
        plantingRecords,
        saplingRecords,

        // Loading states
        isUrbanGreeningLoading,
        isSaplingLoading,
        isTreeRequestsLoading,
        isPlantingLoading,
        isSaplingRecordsLoading,

        // Processed data
        requestStatusData,
        requestTypeData,
        urgencyData,
        plantingTypeData,
        speciesData,

        // Fee data
        feeData,
        dashboardData,
    } = useOverviewData();

    const isChartsLoading = isTreeRequestsLoading || isPlantingLoading || isSaplingRecordsLoading;

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBarContainer dashboardType="urban-greening" />

                <div className="bg-white px-6 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-900">Urban Greening Dashboard</h1>
                        <div className="text-xs text-gray-500">Updated {new Date().toLocaleString()}</div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-[#F9FBFC] space-y-6">
                    {/* Row 1: Key Stats (Fees + Monthly counts) */}
                    <UGKeyStatsCards feeData={feeData} />

                    {/* Row 2: Urban Greening Breakdown */}

                    {/* Row 3: Visualized Dashboard (Monthly bars, pies, flora) */}
                    <UGVisualDashboard
                        feeMonthly={dashboardData?.fee_monthly?.map(m => ({ month: m.label.slice(0, 3), amount: m.total })) || feeData.monthlyFees}
                        plantingTypeData={dashboardData?.planting_type_data || plantingTypeData}
                        speciesData={dashboardData?.species_data || speciesData}
                        treeRequestTypeCounts={dashboardData?.tree_request_type_counts}
                        treeRequestStatusCounts={dashboardData?.tree_request_status_counts}
                        treeTypesBarPreset={dashboardData?.tree_types_bar}
                        ugMonthlyFromApi={dashboardData?.ug_monthly}
                        saplingsMonthlyFromApi={dashboardData?.saplings_monthly}
                        recentUg={plantingRecords}
                        recentSaplings={saplingRecords}
                        recentLoading={isPlantingLoading || isSaplingRecordsLoading}
                    />
                </div>
            </div>
        </div>
    );
};
