import { useState, useEffect } from "react";
import {
  useAdminDashboardStats,
  useUserActivityData,
  useSystemHealthData,
  useRecentActivity,
  AdminDashboardStats,
  UserActivityData,
  SystemHealthData,
  RecentActivityData,
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

  const {
    data: systemHealthData,
    isLoading: healthLoading,
    error: healthError,
  } = useSystemHealthData();

  const {
    data: recentActivityData,
    isLoading: recentLoading,
    error: recentError,
  } = useRecentActivity();

  // Combine loading states
  const isLoading =
    statsLoading || activityLoading || healthLoading || recentLoading;

  // Combine errors (prioritize the first error encountered)
  const error = statsError || activityError || healthError || recentError;

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
    systemHealthData: systemHealthData || [],
    recentActivityData: recentActivityData || [],

    // Loading states
    isLoading,
    error,
  };
};
