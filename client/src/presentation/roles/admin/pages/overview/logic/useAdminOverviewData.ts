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
  } = useAdminDashboardStats();

  const {
    data: userActivityData,
    isLoading: activityLoading,
    error: activityError,
  } = useUserActivityData();

  // Combine loading states
  const isLoading = statsLoading || activityLoading;

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
    error,
  };
};
export type { UserActivityData };
