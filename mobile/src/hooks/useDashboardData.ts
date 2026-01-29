import { database, LocalEmissionTest } from "../core/database/database";
import { useSmartQuery } from "./useSmartQuery";

export interface DashboardData {
  totalVehicles: number;
  testedVehicles: number;
  complianceRate: number;
  departments: number;
  lastTestDate?: string;
  recentTests: (LocalEmissionTest & { vehicle_plate?: string })[];
  pendingSyncCount: number;
  chartData?: any;
  passedTests: number;
  failedTests: number;
  pendingTests: number;
  topPerformingOffice?: { name: string };
  monthlyTrendsData?: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  vehicleTypeData?: Array<{
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }>;
  quarterlyData?: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  engineTypeData?: {
    labels: string[];
    datasets: { data: number[] }[];
  };
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
export function useDashboardData(year?: number, quarter?: number) {
  // Fetch dashboard stats from local database
  const fetchDashboardStats = async (): Promise<DashboardData> => {
    try {
      const stats = await database.getDashboardStats();
      const vehicles = await database.getVehicles();
      let tests = await database.getEmissionTests();

      // Filter tests by year and quarter if specified
      if (year || quarter) {
        tests = tests.filter((test) => {
          const testDate = new Date(test.test_date);
          const testYear = testDate.getFullYear();
          const testQuarter = Math.floor(testDate.getMonth() / 3) + 1;
          
          if (year && testYear !== year) return false;
          if (quarter && testQuarter !== quarter) return false;
          return true;
        });
      }

      // Calculate tested vehicles (vehicles with at least one test)
      const vehicleIds = vehicles.map((v) => v.id);
      const testedVehicleIds = new Set(tests.map((t) => t.vehicle_id));
      const testedCount = vehicleIds.filter((id) =>
        testedVehicleIds.has(id)
      ).length;

      // Calculate test results
      const passedTests = tests.filter((t) => t.result === true).length;
      const failedTests = tests.filter((t) => t.result === false).length;
      const pendingTests = tests.filter((t) => t.result === null || t.result === undefined).length;
      const totalTests = tests.length;
      const complianceRate =
        totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

      // Get last test date
      const sortedTests = [...tests].sort(
        (a, b) =>
          new Date(b.test_date).getTime() - new Date(a.test_date).getTime()
      );
      const lastTestDate =
        sortedTests.length > 0 ? sortedTests[0].test_date : undefined;

      // Get recent tests with plate numbers
      const recentTestsRaw = await database.getEmissionTests({ limit: 5 });
      const recentTests = await Promise.all(
        recentTestsRaw.map(async (test) => {
          const vehicle = await database.getVehicleById(test.vehicle_id);
          return {
            ...test,
            vehicle_plate: vehicle?.plate_number || "Unknown",
          };
        })
      );

      // Generate monthly trends data (simplified)
      const monthlyTrendsData = generateMonthlyTrends(tests);

      // Generate vehicle type distribution (simplified)
      const vehicleTypeData = generateVehicleTypeData(vehicles, tests);

      // Generate quarterly data (simplified)
      const quarterlyData = generateQuarterlyData(tests);

      // Generate engine type data (simplified)
      const engineTypeData = generateEngineTypeData(tests);

      return {
        totalVehicles: stats.totalVehicles,
        testedVehicles: testedCount,
        complianceRate,
        departments: stats.totalOffices,
        lastTestDate,
        recentTests,
        pendingSyncCount: stats.pendingSync,
        passedTests,
        failedTests,
        pendingTests,
        topPerformingOffice: { name: "City Hall" }, // Placeholder
        monthlyTrendsData,
        vehicleTypeData,
        quarterlyData,
        engineTypeData,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        totalVehicles: 0,
        testedVehicles: 0,
        complianceRate: 0,
        departments: 0,
        recentTests: [],
        pendingSyncCount: 0,
        passedTests: 0,
        failedTests: 0,
        pendingTests: 0,
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
    queryKey: ["dashboard-stats", year, quarter],
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
      recentTests: [],
      pendingSyncCount: 0,
      passedTests: 0,
      failedTests: 0,
      pendingTests: 0,
    },
    loading: isLoading,
    error,
    refetch,
    forceRefresh,
    isFromCache,
    isStale,
  };
}

// Helper functions for chart data generation
function generateMonthlyTrends(tests: LocalEmissionTest[]) {
  if (tests.length === 0) return undefined;
  
  const monthlyMap: Record<string, number> = {};
  tests.forEach((test) => {
    const month = new Date(test.test_date).toLocaleDateString('en-US', { month: 'short' });
    monthlyMap[month] = (monthlyMap[month] || 0) + 1;
  });
  
  const labels = Object.keys(monthlyMap);
  const data = Object.values(monthlyMap);
  
  return labels.length > 0 ? {
    labels,
    datasets: [{ data }],
  } : undefined;
}

function generateVehicleTypeData(vehicles: any[], tests: LocalEmissionTest[]) {
  if (vehicles.length === 0) return undefined;
  
  const typeMap: Record<string, number> = {};
  vehicles.forEach((vehicle) => {
    const type = vehicle.vehicle_type || 'Unknown';
    typeMap[type] = (typeMap[type] || 0) + 1;
  });
  
  const colors = ['#1E40AF', '#7C3AED', '#16A34A', '#DC2626', '#F59E0B'];
  return Object.entries(typeMap).map(([name, population], index) => ({
    name,
    population,
    color: colors[index % colors.length],
    legendFontColor: '#64748B',
    legendFontSize: 12,
  }));
}

function generateQuarterlyData(tests: LocalEmissionTest[]) {
  if (tests.length === 0) return undefined;
  
  const quarterlyMap: Record<string, number> = {};
  tests.forEach((test) => {
    const date = new Date(test.test_date);
    const quarter = `Q${Math.floor(date.getMonth() / 3) + 1}`;
    quarterlyMap[quarter] = (quarterlyMap[quarter] || 0) + (test.result ? 1 : 0);
  });
  
  const labels = Object.keys(quarterlyMap);
  const data = Object.values(quarterlyMap);
  
  return labels.length > 0 ? {
    labels,
    datasets: [{ data }],
  } : undefined;
}

function generateEngineTypeData(tests: LocalEmissionTest[]) {
  if (tests.length === 0) return undefined;
  
  const engineMap: Record<string, number> = {
    'Gasoline': 0,
    'Diesel': 0,
    'Hybrid': 0,
    'Electric': 0,
  };
  
  // Simplified - would need vehicle data to properly categorize
  tests.forEach((test) => {
    if (test.result) {
      engineMap['Gasoline'] = (engineMap['Gasoline'] || 0) + 1;
    }
  });
  
  const labels = Object.keys(engineMap).filter(k => engineMap[k] > 0);
  const data = labels.map(k => engineMap[k]);
  
  return labels.length > 0 ? {
    labels,
    datasets: [{ data }],
  } : undefined;
}
