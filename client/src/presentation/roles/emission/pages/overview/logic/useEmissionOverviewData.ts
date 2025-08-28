import { useMemo } from "react";
import { useDashboardData } from "@/core/hooks/emissions/useDashboardData";

// Interfaces for transformed chart data
interface ChartDataPoint {
  id: string;
  label: string;
  value: number;
  color?: string;
}

interface QuarterlyDataPoint {
  quarter: string;
  passed: number;
  failed: number;
  pending: number;
}

interface MonthlyTrendPoint {
  month: string;
  tests: number;
  compliance: number;
}

interface EngineTypeDataPoint {
  type: string;
  count: number;
  passedCount: number;
}

interface EmissionKeyStats {
  totalVehicles: number;
  totalOffices: number;
  passedTests: number;
  failedTests: number;
  pendingTests: number;
  complianceRate: number;
}

export const useEmissionOverviewData = (
  selectedYear: number,
  selectedQuarter?: number
) => {
  // Use the existing dashboard data hook
  const { data, loading, error } = useDashboardData(
    selectedYear,
    selectedQuarter
  );

  // Transform data for key stats cards
  const keyStatsData: EmissionKeyStats = useMemo(() => {
    if (!data) {
      return {
        totalVehicles: 0,
        totalOffices: 0,
        passedTests: 0,
        failedTests: 0,
        pendingTests: 0,
        complianceRate: 0,
      };
    }

    // Safe number conversion function
    const safeNumber = (value: any, defaultValue: number = 0): number => {
      const num = Number(value);
      return isNaN(num) || !isFinite(num) ? defaultValue : Math.max(num, 0);
    };

    const totalVehicles = safeNumber(data.totalVehicles, 0);
    const totalOffices = safeNumber(data.officeDepartments, 0);

    // Calculate passed, failed, and pending from vehicleSummaries with safety checks
    const vehicleSummaries = Array.isArray(data.vehicleSummaries)
      ? data.vehicleSummaries
      : [];
    const passedTests =
      vehicleSummaries.filter((v) => v?.latestTestResult === true).length || 0;
    const failedTests =
      vehicleSummaries.filter((v) => v?.latestTestResult === false).length || 0;
    const pendingTests =
      vehicleSummaries.filter(
        (v) => v?.latestTestResult === null || v?.latestTestResult === undefined
      ).length || 0;

    const complianceRate = Math.max(
      Math.min(safeNumber(data.complianceRate, 0), 100),
      0
    );

    return {
      totalVehicles,
      totalOffices,
      passedTests,
      failedTests,
      pendingTests,
      complianceRate,
    };
  }, [data]);

  // Transform data for vehicle type distribution
  const vehicleTypeData: ChartDataPoint[] = useMemo(() => {
    if (!data?.vehicleTypeData || !Array.isArray(data.vehicleTypeData))
      return [];

    const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

    // Safe number conversion function
    const safeNumber = (value: any, defaultValue: number = 0): number => {
      const num = Number(value);
      return isNaN(num) || !isFinite(num) ? defaultValue : Math.max(num, 0);
    };

    return data.vehicleTypeData
      .map((item, index) => ({
        id: item.id || `type-${index}`,
        label: item.label || `Type ${index + 1}`,
        value: safeNumber(item.total, 0),
        color: colors[index % colors.length],
      }))
      .filter((item) => item.value > 0); // Remove items with 0 value
  }, [data?.vehicleTypeData]);

  // Transform data for quarterly comparison (mock data for now)
  const quarterlyData: QuarterlyDataPoint[] = useMemo(() => {
    // Since the existing data doesn't have quarterly breakdown, we'll create mock data
    // based on the current data
    if (!data) return [];

    const quarters = ["Q1", "Q2", "Q3", "Q4"];

    // Safe number conversion function
    const safeNumber = (value: any, defaultValue: number = 0): number => {
      const num = Number(value);
      return isNaN(num) || !isFinite(num) ? defaultValue : Math.max(num, 0);
    };

    const safeTotal = safeNumber(data.totalVehicles, 0);
    const safeComplianceRate = Math.max(
      Math.min(safeNumber(data.complianceRate, 0), 100),
      0
    );

    return quarters.map((quarter) => {
      const baseValue = Math.floor(safeTotal / 4) || 0;
      const variance = Math.floor(Math.random() * 20 - 10); // ±10 variance
      const total = Math.max(baseValue + variance, 0);
      const passedRate = safeComplianceRate / 100;

      // Ensure passedRate is valid
      const validPassedRate =
        isNaN(passedRate) || !isFinite(passedRate) ? 0 : passedRate;

      const passed = Math.floor(total * validPassedRate) || 0;
      const remaining = Math.max(total - passed, 0);
      const failed = Math.floor(remaining * 0.7) || 0;
      const pending = Math.max(remaining - failed, 0);

      return {
        quarter,
        passed: safeNumber(passed, 0),
        failed: safeNumber(failed, 0),
        pending: safeNumber(pending, 0),
      };
    });
  }, [data]);

  // Transform data for monthly trends (mock data)
  const monthlyTrendsData: MonthlyTrendPoint[] = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Safe number generation for consistent values
    const safeNumber = (value: any, defaultValue: number = 0): number => {
      const num = Number(value);
      return isNaN(num) || !isFinite(num) ? defaultValue : Math.max(num, 0);
    };

    return months.map((month) => {
      const tests = safeNumber(Math.floor(Math.random() * 50) + 20, 20);
      // Ensure compliance is always <= tests (70-95% compliance rate)
      const complianceRate = Math.random() * 0.25 + 0.7; // 70% to 95%
      const compliance = safeNumber(Math.floor(tests * complianceRate), 0);

      return {
        month,
        tests,
        compliance: Math.min(compliance, tests), // Additional safety check
      };
    });
  }, []);

  // Transform data for engine type analysis
  const engineTypeData: EngineTypeDataPoint[] = useMemo(() => {
    if (!data?.engineTypeData || !Array.isArray(data.engineTypeData)) return [];

    // Safe number conversion function
    const safeNumber = (value: any, defaultValue: number = 0): number => {
      const num = Number(value);
      return isNaN(num) || !isFinite(num) ? defaultValue : Math.max(num, 0);
    };

    return data.engineTypeData.map((engine) => {
      const count = safeNumber(engine.total, 0);
      const passedCount = safeNumber(engine.passed, 0);

      return {
        type: engine.label || "Unknown",
        count,
        passedCount: Math.min(passedCount, count), // Ensure passedCount doesn't exceed count
      };
    });
  }, [data?.engineTypeData]);

  // Office compliance data (already in the right format)
  const officeComplianceData = useMemo(() => {
    return data?.officeComplianceData || [];
  }, [data?.officeComplianceData]);

  return {
    // Raw data
    rawData: data,

    // Loading states
    isLoading: loading,
    error,

    // Transformed data for components
    keyStatsData,
    detailedStatsData: data,
    vehicleTypeData,
    quarterlyData,
    monthlyTrendsData,
    engineTypeData,
    officeComplianceData,
  };
};
