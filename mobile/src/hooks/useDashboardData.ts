import { database } from "../core/database/database";
import { useSmartQuery } from "./useSmartQuery";

export interface DashboardData {
  totalVehicles: number;
  testedVehicles: number;
  complianceRate: number;
  departments: number;
  lastTestDate?: string;
  chartData?: any;
}

/**
 * Hook for fetching government emission dashboard data with smart caching.
 * 
 * Features:
 * - Instant UI with cached data from previous sessions
 * - Background refresh when data is stale (>2 min old)
 * - Automatic refresh when app comes to foreground
 * - Offline support with cached data
 * - Data persists across app restarts (up to 24 hours)
 */
export function useDashboardData() {
  // Fetch dashboard stats from local database
  const fetchDashboardStats = async (): Promise<DashboardData> => {
    try {
      const stats = await database.getDashboardStats();
      const vehicles = await database.getVehicles();
      const tests = await database.getEmissionTests();

      // Calculate tested vehicles (vehicles with at least one test)
      const vehicleIds = vehicles.map((v) => v.id);
      const testedVehicleIds = new Set(tests.map((t) => t.vehicle_id));
      const testedCount = vehicleIds.filter((id) =>
        testedVehicleIds.has(id)
      ).length;

      // Calculate compliance rate (passed tests / total tests)
      const passedTests = tests.filter((t) => t.result === true).length;
      const totalTests = tests.length;
      const complianceRate =
        totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

      // Get last test date
      const sortedTests = tests.sort(
        (a, b) =>
          new Date(b.test_date).getTime() - new Date(a.test_date).getTime()
      );
      const lastTestDate =
        sortedTests.length > 0 ? sortedTests[0].test_date : undefined;

      return {
        totalVehicles: stats.totalVehicles,
        testedVehicles: testedCount,
        complianceRate,
        departments: stats.totalOffices,
        lastTestDate,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        totalVehicles: 0,
        testedVehicles: 0,
        complianceRate: 0,
        departments: 0,
      };
    }
  };

  const {
    data,
    isLoading,
    error,
    refetch,
    forceRefresh,
    isFromCache,
    isStale,
  } = useSmartQuery<DashboardData>({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    staleTime: 2 * 60 * 1000, // Consider stale after 2 minutes
    cacheTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
    refetchOnAppFocus: true, // Refresh when app comes to foreground
  });

  return {
    data: data ?? {
      totalVehicles: 0,
      testedVehicles: 0,
      complianceRate: 0,
      departments: 0,
    },
    loading: isLoading,
    error,
    refetch,
    forceRefresh,
    isFromCache,
    isStale,
  };
}
