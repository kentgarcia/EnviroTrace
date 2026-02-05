import React, { useCallback } from "react";
import { useAdminOverviewData } from "./logic/useAdminOverviewData";
import { AdminStatsCards } from "./components/AdminStatsCards";
import { AdminVisualDashboard } from "./components/AdminVisualDashboard";
import { AdminQuickActions } from "./components/AdminQuickActions";
import { RefreshButton } from "@/presentation/components/shared/buttons/RefreshButton";
import { useContextMenuAction } from "@/core/hooks/useContextMenuAction";

export const AdminOverview: React.FC = () => {
    const {
        // Data
        keyStatsData,
        userActivityData,

        // Loading states
        isLoading,
        isRefreshing,
        error,
        refreshAll,
    } = useAdminOverviewData();

    const handleRefresh = useCallback(async () => {
        await refreshAll();
    }, [refreshAll]);

    useContextMenuAction("refresh", handleRefresh);

    if (error) {
        return (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="page-header-bg px-6 py-3">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
                        <div className="flex items-center gap-3">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Error occurred</div>
                            <RefreshButton onClick={handleRefresh} isLoading={isRefreshing} />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 page-bg">
                    <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 p-4 rounded-md border border-red-200 dark:border-red-800">
                        <h3 className="font-medium">Error Loading Dashboard Data</h3>
                        <p className="mb-2">
                            There was a problem connecting to the server. Please try again
                            later or contact support if the issue persists.
                        </p>
                        <details className="text-sm">
                            <summary className="cursor-pointer font-medium">
                                Technical Details
                            </summary>
                            <p className="mt-2 font-mono text-xs bg-red-100 dark:bg-red-900/50 p-2 rounded">
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
            <div className="page-header-bg px-6 py-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
                    <RefreshButton onClick={handleRefresh} isLoading={isRefreshing} />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 page-bg space-y-6">
                {/* Key Stats Cards */}
                <AdminStatsCards
                    data={keyStatsData}
                    isLoading={isLoading}
                />

                {/* Quick Actions */}
                <AdminQuickActions />

                {/* Visual Dashboard */}
                <AdminVisualDashboard
                    userActivityData={userActivityData}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};
