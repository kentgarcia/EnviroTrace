import { useQuery } from "@tanstack/react-query";
import {
  fetchBelchingStatistics,
  fetchBelchingRecords,
  fetchBelchingViolations,
  fetchBelchingDashboard,
  BelchingStatistics,
  Record,
  Violation,
  BelchingDashboardData,
} from "@/core/api/belching-api";

export const useAirQualityOverviewData = () => {
  // Fetch belching statistics
  const {
    data: belchingStats,
    isLoading: belchingStatsLoading,
    error: belchingStatsError,
  } = useQuery({
    queryKey: ["belching-statistics"],
    queryFn: fetchBelchingStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch recent records
  const {
    data: recentRecords,
    isLoading: recordsLoading,
    error: recordsError,
  } = useQuery({
    queryKey: ["recent-belching-records"],
    queryFn: () => fetchBelchingRecords({ limit: 10 }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch recent violations
  const {
    data: recentViolations,
    isLoading: violationsLoading,
    error: violationsError,
  } = useQuery({
    queryKey: ["recent-violations"],
    queryFn: () => fetchBelchingViolations({ limit: 10 }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: ["air-quality-dashboard"],
    queryFn: fetchBelchingDashboard,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading =
    belchingStatsLoading ||
    recordsLoading ||
    violationsLoading ||
    dashboardLoading;

  const hasError =
    belchingStatsError || recordsError || violationsError || dashboardError;

  // Transform data for charts
  const violationCharts = transformViolationData(recentViolations || []);
  const statisticsCharts = transformStatisticsData(belchingStats);
  const feeData = calculateFeeData(belchingStats);

  return {
    // Raw data
    belchingStatistics: belchingStats,
    recentRecords,
    recentViolations,
    dashboardData,

    // Loading states
    isBelchingLoading: belchingStatsLoading,
    isRecordsLoading: recordsLoading,
    isViolationsLoading: violationsLoading,
    isDashboardLoading: dashboardLoading,

    // Processed data for charts
    violationStatusData: violationCharts.statusPie,
    vehicleTypeData: violationCharts.vehicleTypePie,
    locationData: violationCharts.locationBar,
    monthlyViolationsData: statisticsCharts.monthlyBar,

    // Fee data
    feeData,

    // Legacy properties for backward compatibility
    isLoading,
    hasError,
  };
};

// Transform violation data for charts
export const transformViolationData = (violations: Violation[]) => {
  if (!violations || violations.length === 0)
    return { statusPie: [], vehicleTypePie: [], locationBar: [] };

  // Payment status distribution
  const statusCounts = violations.reduce((acc, violation) => {
    const status =
      violation.paid_driver && violation.paid_operator
        ? "Fully Paid"
        : violation.paid_driver || violation.paid_operator
        ? "Partially Paid"
        : "Unpaid";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusPie = Object.entries(statusCounts).map(([status, count]) => ({
    id: status.toLowerCase().replace(/\s+/g, "_"),
    label: status,
    value: count,
  }));

  // Location distribution
  const locationCounts = violations.reduce((acc, violation) => {
    const location = violation.place_of_apprehension;
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const locationBar = Object.entries(locationCounts).map(
    ([location, count]) => ({
      id: location.toLowerCase().replace(/\s+/g, "_"),
      label: location,
      value: count,
    })
  );

  return { statusPie, vehicleTypePie: [], locationBar };
};

// Transform statistics data for charts
export const transformStatisticsData = (
  stats: BelchingStatistics | undefined
) => {
  if (!stats)
    return { monthlyBar: [], vehicleTypeBreakdown: [], statusBreakdown: [] };

  const monthlyBar =
    stats.monthly_violations?.map((item) => ({
      id: item.month.toLowerCase(),
      label: item.month,
      value: item.count,
    })) || [];

  const vehicleTypeBreakdown =
    stats.vehicle_type_breakdown?.map((item) => ({
      id: item.vehicle_type.toLowerCase().replace(/\s+/g, "_"),
      label: item.vehicle_type,
      value: item.count,
    })) || [];

  const statusBreakdown =
    stats.violation_status_breakdown?.map((item) => ({
      id: item.status.toLowerCase().replace(/\s+/g, "_"),
      label: item.status,
      value: item.count,
    })) || [];

  return { monthlyBar, vehicleTypeBreakdown, statusBreakdown };
};

// Calculate fee amounts from statistics
export const calculateFeeData = (stats: BelchingStatistics | undefined) => {
  if (!stats) return { totalFees: 0, monthlyFees: [], pendingPayments: 0 };

  const totalFees = stats.total_fees_collected || 0;
  const pendingPayments = stats.pending_payments || 0;

  // Calculate monthly fees based on violations (mock calculation)
  const monthlyFees =
    stats.monthly_violations?.map((item) => ({
      month: item.month,
      amount: Math.floor(item.count * 500), // Assuming average fee of ₱500 per violation
    })) || [];

  return {
    totalFees,
    monthlyFees,
    pendingPayments,
    recentViolations: stats.recent_violations || 0,
    totalViolations: stats.total_violations || 0,
    totalRecords: stats.total_records || 0,
    totalDrivers: stats.total_drivers || 0,
  };
};
