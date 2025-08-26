import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { airQualityService } from "../core/api/air-quality-service";
import type {
  AirQualityViolation,
  AirQualityRecord,
} from "../core/api/air-quality-service";

interface AirQualityDashboardData {
  totalRecords?: number;
  totalViolations?: number;
  totalDrivers?: number;
  pendingPayments?: number;
  totalFees?: number;
  recentViolations?: AirQualityViolation[];
  recentRecords?: AirQualityRecord[];
  paymentStatusDistribution?: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  vehicleTypes?: Array<{
    vehicle_type: string;
    count: number;
  }>;
  monthlyViolations?: Array<{
    month: string;
    count: number;
  }>;
}

export const useAirQualityDashboardData = () => {
  const [data, setData] = useState<AirQualityDashboardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use React Query for fetching dashboard data
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ["air-quality-dashboard"],
    queryFn: () => airQualityService.fetchDashboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  const {
    data: violationsData,
    isLoading: isViolationsLoading,
    error: violationsError,
    refetch: refetchViolations,
  } = useQuery({
    queryKey: ["air-quality-recent-violations"],
    queryFn: () => airQualityService.fetchRecentViolations({ limit: 10 }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });

  const {
    data: recordsData,
    isLoading: isRecordsLoading,
    error: recordsError,
    refetch: refetchRecords,
  } = useQuery({
    queryKey: ["air-quality-recent-records"],
    queryFn: () => airQualityService.fetchRecentRecords({ limit: 10 }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });

  // Combine all data sources
  useEffect(() => {
    const combinedData: AirQualityDashboardData = {
      // Map backend snake_case to frontend camelCase
      totalRecords: dashboardData?.total_records || 0,
      totalViolations: dashboardData?.total_violations || 0,
      totalDrivers: dashboardData?.total_drivers || 0,
      totalFees: dashboardData?.total_fees_configured || 0,
      pendingPayments: 0, // Not provided by backend yet
      recentViolations: violationsData || [],
      recentRecords: recordsData || [],
      paymentStatusDistribution:
        dashboardData?.payment_status_distribution || [],
      vehicleTypes: dashboardData?.vehicle_types || [],
      monthlyViolations: dashboardData?.monthly_violations || [],
    };

    setData(combinedData);
    setLoading(isDashboardLoading || isViolationsLoading || isRecordsLoading);
    setError(
      dashboardError?.message ||
        violationsError?.message ||
        recordsError?.message ||
        null
    );
  }, [
    dashboardData,
    violationsData,
    recordsData,
    isDashboardLoading,
    isViolationsLoading,
    isRecordsLoading,
    dashboardError,
    violationsError,
    recordsError,
  ]);

  const refetch = async () => {
    try {
      await Promise.all([
        refetchDashboard(),
        refetchViolations(),
        refetchRecords(),
      ]);
    } catch (err) {
      console.error("Error refetching air quality data:", err);
    }
  };

  return {
    data,
    loading,
    error,
    refetch,
    // Individual data sources
    dashboardData,
    violationsData,
    recordsData,
    // Individual loading states
    isDashboardLoading,
    isViolationsLoading,
    isRecordsLoading,
    // Individual errors
    dashboardError,
    violationsError,
    recordsError,
  };
};
