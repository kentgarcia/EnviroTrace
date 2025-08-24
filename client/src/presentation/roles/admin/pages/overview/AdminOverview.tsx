import React from "react";
import { useAdminOverviewData } from "./logic/useAdminOverviewData";
import TopNavBarContainer from "@/presentation/components/shared/layout/TopNavBarContainer";
import { AdminStatsCards } from "./components/AdminStatsCards";
import { AdminVisualDashboard } from "./components/AdminVisualDashboard";
import { NetworkStatus } from "@/presentation/components/shared/layout/NetworkStatus";

export const AdminOverview: React.FC = () => {
    const {
        // Data
        keyStatsData,
        userActivityData,
        systemHealthData,
        recentActivityData,

        // Loading states
        isLoading,
        error,
    } = useAdminOverviewData();

    if (error) {
        return (
            <div className="flex min-h-screen w-full">
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopNavBarContainer dashboardType="admin" />

                    <div className="bg-white px-6 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
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
                <TopNavBarContainer dashboardType="admin" />

                <div className="bg-white px-6 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                        <div className="text-xs text-gray-500">Updated {new Date().toLocaleString()}</div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-[#F9FBFC] space-y-6">
                    {/* Key Stats Cards */}
                    <AdminStatsCards
                        data={keyStatsData}
                        isLoading={isLoading}
                    />

                    {/* Visual Dashboard */}
                    <AdminVisualDashboard
                        userActivityData={userActivityData}
                        systemHealthData={systemHealthData}
                        recentActivityData={recentActivityData}
                        isLoading={isLoading}
                    />
                </div>
            </div>
            <NetworkStatus />
        </div>
    );
};
