import React from "react";
import { useAirQualityOverviewData } from "./logic/useAirQualityOverviewData";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import AirQualityKeyStatsCards from "./components/AirQualityKeyStatsCards";
import AirQualityDetailedStats from "./components/AirQualityDetailedStats";
import AirQualityVisualDashboard from "./components/AirQualityVisualDashboard";

export const AirQualityOverview: React.FC = () => {
    const {
        // Data hooks
        belchingStatistics,
        recentRecords,
        recentViolations,
        dashboardData,

        // Loading states
        isBelchingLoading,
        isRecordsLoading,
        isViolationsLoading,
        isDashboardLoading,

        // Processed data
        violationStatusData,
        vehicleTypeData,
        locationData,
        monthlyViolationsData,

        // Fee data
        feeData,
    } = useAirQualityOverviewData();

    const isChartsLoading = isRecordsLoading || isViolationsLoading || isDashboardLoading;

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavBarContainer dashboardType="air-quality" />

                <div className="bg-white px-6 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-900">Air Quality Dashboard</h1>
                        <div className="text-xs text-gray-500">Updated {new Date().toLocaleString()}</div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-[#F9FBFC] space-y-6">
                    {/* Key Stats Cards */}
                    <AirQualityKeyStatsCards
                        feeData={feeData}
                        isLoading={isBelchingLoading}
                    />

                    {/* Detailed Statistics Cards */}
                    <AirQualityDetailedStats
                        dashboardData={dashboardData}
                        isLoading={isDashboardLoading}
                    />

                    {/* Visual Dashboard */}
                    <AirQualityVisualDashboard
                        monthlyViolations={monthlyViolationsData}
                        vehicleTypeData={vehicleTypeData}
                        paymentStatusData={violationStatusData}
                        locationData={locationData}
                    />
                </div>
            </div>
        </div>
    );
};
