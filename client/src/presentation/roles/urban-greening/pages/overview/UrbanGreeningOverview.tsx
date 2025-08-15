import React from "react";
import { useOverviewData } from "./logic/useOverviewData";
import { PlantingSummary } from "./components/PlantingSummary";
import { FeeManagement } from "./components/FeeManagement";
import { ChartsOverview } from "./components/ChartsOverview";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";

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
    } = useOverviewData();

    const isChartsLoading = isTreeRequestsLoading || isPlantingLoading || isSaplingRecordsLoading;

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBarContainer dashboardType="urban-greening" />

                <div className="flex items-center justify-between bg-white px-6 py-3 border-b border-gray-200">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Urban Greening Overview
                    </h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-[#F9FBFC]">
                    {/* Three Column Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column - Summary Tables */}
                        <div className="space-y-4">
                            <PlantingSummary
                                plantingStats={urbanGreeningStatistics}
                                saplingStats={saplingStatistics}
                                isLoading={isUrbanGreeningLoading || isSaplingLoading}
                            />

                            <FeeManagement
                                totalFees={feeData.totalFees}
                                monthlyFees={feeData.monthlyFees}
                                latePayments={feeData.latePayments}
                                isLoading={isTreeRequestsLoading}
                            />
                        </div>

                        {/* Charts Overview */}
                        <ChartsOverview
                            requestStatusData={requestStatusData}
                            requestTypeData={requestTypeData}
                            urgencyData={urgencyData}
                            plantingTypeData={plantingTypeData}
                            speciesData={speciesData}
                            isLoading={isChartsLoading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
