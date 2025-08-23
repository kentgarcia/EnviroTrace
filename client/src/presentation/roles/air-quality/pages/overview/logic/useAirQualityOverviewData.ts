import { useQuery } from "@tanstack/react-query";
import {
  fetchAirQualityDashboard,
  AirQualityDashboard,
} from "@/core/api/air-quality-api";

// Interfaces for transformed chart data
interface ChartDataPoint {
  id: string;
  label: string;
  value: number;
}

interface MonthlyDataPoint {
  month: string;
  amount: number;
}

interface FeeData {
  totalFees: number;
  monthlyFees: MonthlyDataPoint[];
  pendingPayments: number;
  recentViolations: number;
  totalViolations: number;
  totalRecords: number;
  totalDrivers: number;
}

export const useAirQualityOverviewData = () => {
  // Fetch dashboard statistics
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useQuery<AirQualityDashboard>({
    queryKey: ["air-quality-dashboard"],
    queryFn: fetchAirQualityDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isLoading = isDashboardLoading;
  const hasError = dashboardError;

  // Transform dashboard data for charts
  const violationStatusData: ChartDataPoint[] =
    dashboardData?.payment_status_distribution?.map((status) => ({
      id: status.status.toLowerCase().replace(/\s+/g, "_"),
      label: status.status,
      value: status.count,
    })) || [];

  const vehicleTypeData: ChartDataPoint[] =
    dashboardData?.vehicle_types?.map((vt) => ({
      id: vt.vehicle_type.toLowerCase().replace(/\s+/g, "_"),
      label: vt.vehicle_type,
      value: vt.count,
    })) || [];

  const locationData: ChartDataPoint[] =
    dashboardData?.top_violation_locations?.map((loc) => ({
      id: loc.location.toLowerCase().replace(/\s+/g, "_"),
      label: loc.location,
      value: loc.count,
    })) || [];

  const monthlyViolationsData: MonthlyDataPoint[] =
    dashboardData?.monthly_violations?.map((mv) => ({
      month: mv.month.slice(0, 3), // Short month name
      amount: mv.violation_count,
    })) || [];

  // Create fee data from dashboard statistics
  const feeData: FeeData = {
    totalFees: 0, // Can be calculated from violations and fee amounts if needed
    monthlyFees: monthlyViolationsData,
    pendingPayments: dashboardData
      ? dashboardData.total_violations - dashboardData.paid_violations_driver
      : 0,
    recentViolations: dashboardData?.recent_violations_count || 0,
    totalViolations: dashboardData?.total_violations || 0,
    totalRecords: dashboardData?.total_records || 0,
    totalDrivers: dashboardData?.total_drivers || 0,
  };

  return {
    // Raw data
    belchingStatistics: dashboardData
      ? {
          total_records: dashboardData.total_records,
          total_violations: dashboardData.total_violations,
        }
      : undefined,
    recentRecords: [],
    recentViolations: [],
    dashboardData,

    // Loading states
    isBelchingLoading: isDashboardLoading,
    isRecordsLoading: false,
    isViolationsLoading: false,
    isDashboardLoading,

    // Processed data for charts
    violationStatusData,
    vehicleTypeData,
    locationData,
    monthlyViolationsData,

    // Fee data
    feeData,

    // Legacy properties for backward compatibility
    isLoading,
    hasError,
  };
};
