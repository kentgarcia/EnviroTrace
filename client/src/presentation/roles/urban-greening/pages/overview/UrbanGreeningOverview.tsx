import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/presentation/components/shared/ui/button";
import { useOverviewData } from "./logic/useOverviewData";
import { PlantingSummary } from "./components/PlantingSummary";
import { FeeManagement } from "./components/FeeManagement";
import { ChartsOverview } from "./components/ChartsOverview";
import UGKeyStatsCards from "./components/UGKeyStatsCards";
import UGVisualDashboard from "./components/UGVisualDashboard";

export const UrbanGreeningOverview: React.FC = () => {
    const queryClient = useQueryClient();
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

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["urban-greening-statistics"] });
        queryClient.invalidateQueries({ queryKey: ["sapling-statistics"] });
        queryClient.invalidateQueries({ queryKey: ["tree-requests"] });
        queryClient.invalidateQueries({ queryKey: ["urban-greening-plantings"] });
        queryClient.invalidateQueries({ queryKey: ["sapling-records"] });
        queryClient.invalidateQueries({ queryKey: ["fee-records"] });
    };

    return (
        <div className="flex flex-col h-full bg-[#F9FBFC]">
            <div className="bg-white px-6 py-3 border-b border-gray-200 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-900">Urban Greening Dashboard</h1>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleRefresh}
                                disabled={isUrbanGreeningLoading || isSaplingLoading}
                                className="border border-gray-200 bg-white shadow-none rounded-lg h-9 w-9 flex items-center justify-center hover:bg-slate-50 transition-colors"
                            >
                                <RefreshCw className={`h-4 w-4 text-slate-600 ${isUrbanGreeningLoading || isSaplingLoading ? "animate-spin" : ""}`} />
                            </Button>
                            <div className="text-xs text-gray-500">Updated {new Date().toLocaleString()}</div>
                        </div>
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
    );
};
