import React from "react";
import { useOverviewData } from "./logic/useOverviewData";
import { PlantingSummary } from "./components/PlantingSummary";
import { FeeManagement } from "./components/FeeManagement";
import { ChartsOverview } from "./components/ChartsOverview";

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
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Urban Greening Overview</h2>
            </div>

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
    );
};
