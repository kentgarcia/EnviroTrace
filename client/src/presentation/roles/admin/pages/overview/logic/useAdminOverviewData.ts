import { useState, useEffect } from "react";
import {
  useAdminDashboardStats,
  useUserActivityData,
  AdminDashboardStats,
  UserActivityData,
} from "@/core/api/admin-api";

export const useAdminOverviewData = () => {
  // Use the React Query hooks
  const {
    data: keyStatsData,
    isLoading: statsLoading,
    error: statsError,
    isFetching: statsFetching,
    refetch: refetchStats,
  } = useAdminDashboardStats();

  const {
    data: userActivityData,
    isLoading: activityLoading,
    error: activityError,
    isFetching: activityFetching,
    refetch: refetchActivity,
  } = useUserActivityData();

  // Combine loading states
  const isLoading = statsLoading || activityLoading;
  const isRefreshing = statsFetching || activityFetching;

  // Combine errors (prioritize the first error encountered)
  const error = statsError || activityError;

  // Provide default data structures
  const defaultKeyStats: AdminDashboardStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalRoles: 0,
    systemUptime: "0d 0h 0m",
    totalSessions: 0,
    failedLogins: 0,
  };

  return {
    // Data with defaults
    keyStatsData: keyStatsData || defaultKeyStats,
    userActivityData: userActivityData || [],

    // Loading states
    isLoading,
    isRefreshing,
    error,
    refreshAll: async () => {
      await Promise.all([refetchStats(), refetchActivity()]);
    },
  };
};
export type { UserActivityData };
