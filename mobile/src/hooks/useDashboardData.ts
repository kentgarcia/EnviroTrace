import { useMemo } from "react";
import {
  useVehicles,
  useOfficeCompliance,
  useEmissionTests,
  type Vehicle,
} from "../core/api/emission-service";

export interface DashboardData {
  totalVehicles: number;
  testedVehicles: number;
  complianceRate: number;
  departments: number;
  lastTestDate?: string;
  
  // New metrics
  passedTests: number;
  failedTests: number;
  pendingTests: number;
  topPerformingOffice?: {
    name: string;
    complianceRate: number;
  };

  // Chart Data
  vehicleTypeData: any[];
  monthlyTrendsData: any;
  quarterlyData: any;
  engineTypeData: any;
}

/**
 * Hook for fetching government emission dashboard data from the API.
 * Mirrors the logic of the desktop client.
 */
export function useDashboardData(year?: number, quarter?: number) {
  const selectedYear = year || new Date().getFullYear();
  
  // Fetch vehicles data (all vehicles)
  const {
    data: vehiclesData,
    isLoading: vehiclesLoading,
    error: vehiclesError,
    refetch: refetchVehicles
  } = useVehicles();

  // Fetch office compliance data with filters
  const {
    data: officeData,
    isLoading: officeLoading,
    error: officeError,
    refetch: refetchOffice
  } = useOfficeCompliance({
    year: selectedYear,
    quarter: quarter,
  });

  // Fetch emission tests data for the selected period
  // Note: The API supports filtering by year and quarter directly
  const {
    data: testsData,
    isLoading: testsLoading,
    error: testsError,
    refetch: refetchTests
  } = useEmissionTests({
    year: selectedYear,
    quarter: quarter,
  });

  const loading = vehiclesLoading || officeLoading || testsLoading;
  const error = vehiclesError || officeError || testsError;

  const data = useMemo((): DashboardData => {
    if (!vehiclesData || !officeData || !testsData) {
      return {
        totalVehicles: 0,
        testedVehicles: 0,
        complianceRate: 0,
        departments: 0,
        passedTests: 0,
        failedTests: 0,
        pendingTests: 0,
        vehicleTypeData: [],
        monthlyTrendsData: { labels: [], datasets: [] },
        quarterlyData: { labels: [], datasets: [] },
        engineTypeData: { labels: [], datasets: [] },
      };
    }

    const vehicles = vehiclesData.vehicles || [];
    const offices = officeData.offices || [];
    const summary = officeData.summary;
    const tests = testsData || [];

    // Calculate test results
    const passedTestsCount = tests.filter((t) => t.result === true).length;
    const failedTestsCount = tests.filter((t) => t.result === false).length;
    
    // Calculate tested vehicles (unique vehicles tested in this period)
    const testedVehicleIds = new Set(tests.map((t) => t.vehicle_id));
    const testedCount = testedVehicleIds.size;

    // Pending tests: Total Vehicles - Tested Vehicles (Unique)
    // This aligns with the desktop logic
    const pendingTestsCount = Math.max(0, vehicles.length - testedCount);

    // Compliance Rate from summary or calculation
    const complianceRate = summary?.overall_compliance_rate || 
      (tests.length > 0 ? Math.round((passedTestsCount / tests.length) * 100) : 0);

    // Get last test date
    const sortedTests = [...tests].sort(
      (a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime()
    );
    const lastTestDate = sortedTests.length > 0 ? sortedTests[0].test_date : undefined;

    // --- Top Performing Office Calculation ---
    let topOffice = { name: "N/A", complianceRate: 0 };
    if (offices.length > 0) {
      // Find office with highest compliance rate
      const bestOffice = offices.reduce((prev, current) => 
        (prev.compliance_rate > current.compliance_rate) ? prev : current
      );
      
      if (bestOffice) {
        topOffice = {
          name: bestOffice.office_name,
          complianceRate: bestOffice.compliance_rate
        };
      }
    }

    // --- Chart Data Preparation ---

    // 1. Vehicle Type Distribution (Pie Chart)
    // We use all vehicles for this distribution
    const vehicleTypes = vehicles.reduce((acc, v) => {
      const type = v.vehicle_type || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieColors = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
    const vehicleTypeData = Object.entries(vehicleTypes).map(([name, count], index) => ({
      name,
      population: count,
      color: pieColors[index % pieColors.length],
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    }));

    // 2. Monthly Testing Trends (Line/Area Chart)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyTests = new Array(12).fill(0);
    const monthlyCompliance = new Array(12).fill(0);

    tests.forEach((t) => {
      const date = new Date(t.test_date);
      // Ensure we only count for the selected year (though API should have filtered it)
      if (date.getFullYear() === selectedYear) {
        const month = date.getMonth();
        monthlyTests[month]++;
        if (t.result === true) {
          monthlyCompliance[month]++;
        }
      }
    });

    const currentMonth = new Date().getMonth();
    // If viewing past year, show all months. If current year, show up to current month.
    const isCurrentYear = selectedYear === new Date().getFullYear();
    const endMonth = isCurrentYear ? currentMonth + 1 : 12;
    
    const monthlyLabels = months.slice(0, endMonth);
    const monthlyTestsData = monthlyTests.slice(0, endMonth);
    const monthlyComplianceData = monthlyCompliance.slice(0, endMonth);

    const monthlyTrendsData = {
      labels: monthlyLabels,
      datasets: [
        {
          data: monthlyTestsData,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue
          strokeWidth: 2,
        },
        {
          data: monthlyComplianceData,
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // Green
          strokeWidth: 2,
        },
      ],
      legend: ["Total Tests", "Passed"],
    };

    // 3. Quarterly Test Results (Bar Chart)
    const quarterlyCounts = {
      Q1: { passed: 0, failed: 0 },
      Q2: { passed: 0, failed: 0 },
      Q3: { passed: 0, failed: 0 },
      Q4: { passed: 0, failed: 0 },
    };

    tests.forEach((t) => {
      const date = new Date(t.test_date);
      if (date.getFullYear() === selectedYear) {
        const month = date.getMonth();
        const q = Math.floor(month / 3) + 1;
        const qKey = `Q${q}` as keyof typeof quarterlyCounts;
        
        if (t.result === true) quarterlyCounts[qKey].passed++;
        else if (t.result === false) quarterlyCounts[qKey].failed++;
      }
    });

    const quarterlyData = {
      labels: ["Q1", "Q2", "Q3", "Q4"],
      datasets: [
        {
          data: [
            quarterlyCounts.Q1.passed,
            quarterlyCounts.Q2.passed,
            quarterlyCounts.Q3.passed,
            quarterlyCounts.Q4.passed,
          ],
        },
      ],
    };

    // 4. Engine Type Performance (Bar Chart)
    // This needs to correlate vehicles with their test results
    // We'll use the tests data to find pass/fail for engine types
    const engineTypes = vehicles.reduce((acc, v) => {
      const type = v.engine_type || "Unknown";
      if (!acc[type]) acc[type] = { total: 0, passed: 0 };
      acc[type].total++;
      
      // Check if this vehicle has a passed test in the current filtered tests
      // Note: This is slightly different from "latest_test_result" on the vehicle object
      // which might be from a different period. We want stats for the *selected period*.
      const vehicleTests = tests.filter(t => t.vehicle_id === v.id);
      const hasPass = vehicleTests.some(t => t.result === true);
      
      if (hasPass) acc[type].passed++;
      
      return acc;
    }, {} as Record<string, { total: number; passed: number }>);

    const engineLabels = Object.keys(engineTypes);
    const engineTotalData = engineLabels.map(l => engineTypes[l].total);
    
    const engineTypeData = {
      labels: engineLabels,
      datasets: [
        {
          data: engineTotalData,
        },
      ],
    };

    return {
      totalVehicles: summary?.total_vehicles || vehicles.length,
      testedVehicles: testedCount,
      complianceRate,
      departments: summary?.total_offices || offices.length,
      lastTestDate,
      passedTests: passedTestsCount,
      failedTests: failedTestsCount,
      pendingTests: pendingTestsCount,
      topPerformingOffice: topOffice,
      vehicleTypeData,
      monthlyTrendsData,
      quarterlyData,
      engineTypeData,
    };
  }, [vehiclesData, officeData, testsData, selectedYear]);

  const refetch = async () => {
    await Promise.all([refetchVehicles(), refetchOffice(), refetchTests()]);
  };

  return {
    data,
    loading,
    error: error as Error | null,
    refetch,
    forceRefresh: refetch,
    isFromCache: false,
    isStale: false,
  };
}

