import { useMemo } from "react";
import {
  useVehicles,
  useOfficeCompliance,
  useEmissionDashboardSummary,
  type Vehicle,
} from "@/core/api/emission-service";
import { useEmissionTests } from "@/core/hooks/emission/useQuarterlyTesting";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";
import { PERMISSIONS } from "@/core/utils/permissions";

// Dashboard data structure for the overview page
export interface DashboardData {
  // Summary statistics
  totalVehicles: number;
  totalOffices: number;
  testedVehicles: number;
  passedTests: number;
  failedTests: number;
  pendingTests: number;
  complianceRate: number;
  officeDepartments: number; // Keep for backward compatibility

  // Chart data for pie charts - now showing pass/fail by category
  engineTypeData: Array<{
    id: string;
    label: string;
    passed: number;
    failed: number;
    untested: number;
    total: number;
  }>;
  wheelCountData: Array<{
    id: string;
    label: string;
    passed: number;
    failed: number;
    untested: number;
    total: number;
  }>;

  // Chart data for bar charts - enhanced with pass/fail breakdown
  vehicleTypeData: Array<{
    id: string;
    label: string;
    passed: number;
    failed: number;
    untested: number;
    total: number;
  }>;
  officeComplianceData: Array<{
    id: string;
    label: string;
    value: number;
    passedCount: number;
    vehicleCount: number;
    complianceRate: number;
  }>;
  topOffice?: {
    officeName: string;
    complianceRate: number;
    passedCount: number;
    vehicleCount: number;
  } | null;

  // Vehicle type breakdown for detailed stats
  vehicleTypeBreakdown: Array<{
    type: string;
    count: number;
    passedCount: number;
  }>;

  // Vehicle list for dialogs
  vehicleStatusList: Array<{
    id: string;
    plateNumber: string;
    driverName: string;
    officeName: string;
    result: "Passed" | "Failed" | "Pending";
    testDate?: string | null;
  }>;

  // Additional data for chatbot
  vehicleSummaries?: Array<{
    vehicleType: string;
    engineType: string;
    wheels: number;
    officeName: string;
    latestTestResult: boolean | null;
  }>;
}

interface UseDashboardDataReturn {
  data: DashboardData;
  loading: boolean;
  error: Error | null;
}

export function useDashboardData(
  selectedYear: number,
  selectedQuarter?: number
): UseDashboardDataReturn {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canViewVehicles = hasPermission(PERMISSIONS.VEHICLE.VIEW);
  const canViewOffices = hasPermission(PERMISSIONS.OFFICE.VIEW);
  const canViewTests = hasPermission(PERMISSIONS.TEST.VIEW);
  const canViewSummary = canViewVehicles || canViewOffices || canViewTests;

  // Fetch vehicles data
  const {
    data: vehiclesData,
    isLoading: vehiclesLoading,
    error: vehiclesError,
  } = useVehicles(undefined, 0, 100, { enabled: canViewVehicles });

  // Fetch office compliance data with filters
  const {
    data: officeData,
    isLoading: officeLoading,
    error: officeError,
  } = useOfficeCompliance({
    year: selectedYear,
    quarter: selectedQuarter,
  }, 0, 100, { enabled: canViewOffices });

  // Fetch emission tests data for the selected period
  const {
    data: testsData,
    isLoading: testsLoading,
    error: testsError,
  } = useEmissionTests(
    {
      year: selectedYear,
      quarter: selectedQuarter,
      limit: 1000,
    },
    { enabled: canViewTests }
  );

  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useEmissionDashboardSummary(
    {
      year: selectedYear,
      quarter: selectedQuarter,
    },
    { enabled: canViewSummary }
  );

  // Calculate loading state
  const loading = vehiclesLoading || officeLoading || testsLoading || summaryLoading;

  const isPermissionError = (err: unknown) => {
    const status = (err as any)?.response?.status;
    return status === 403;
  };

  // Calculate error state
  const error = [vehiclesError, officeError, testsError, summaryError].find(
    (err) => err && !isPermissionError(err)
  );

  // Process and transform the data
  const data = useMemo(() => {
    const vehicles = vehiclesData?.vehicles || [];
    const offices = officeData?.offices || [];
    const summary = officeData?.summary;
    const tests = testsData || [];

    // Filter tests by selected quarter if specified
    const filteredTests = selectedQuarter
      ? tests.filter((test) => test.quarter === selectedQuarter && test.year === selectedYear)
      : tests.filter((test) => test.year === selectedYear);

    // Build latest test map per vehicle for the selected period
    const latestTestsByVehicle = new Map<string, (typeof filteredTests)[number]>();
    filteredTests.forEach((test) => {
      const existing = latestTestsByVehicle.get(test.vehicle_id);
      if (!existing) {
        latestTestsByVehicle.set(test.vehicle_id, test);
        return;
      }

      const existingDate = new Date(existing.test_date).getTime();
      const currentDate = new Date(test.test_date).getTime();
      if (currentDate > existingDate) {
        latestTestsByVehicle.set(test.vehicle_id, test);
      }
    });

    const latestTests = Array.from(latestTestsByVehicle.values());

    // Calculate test results based on latest test per vehicle in the period
    const passedTests = latestTests.filter((test) => test.result === true).length;
    const failedTests = latestTests.filter((test) => test.result === false).length;

    // Helper function to categorize vehicles by type with pass/fail stats
    const categorizeVehicles = (
      categoryKey: keyof Vehicle,
      formatLabel?: (value: any) => string
    ) => {
      const categoryMap = new Map<
        string,
        { passed: number; failed: number; untested: number; total: number }
      >();

      vehicles.forEach((vehicle) => {
        const categoryValue = vehicle[categoryKey];
        const label = formatLabel
          ? formatLabel(categoryValue)
          : String(categoryValue || "Unknown");

        if (!categoryMap.has(label)) {
          categoryMap.set(label, {
            passed: 0,
            failed: 0,
            untested: 0,
            total: 0,
          });
        }

        const stats = categoryMap.get(label)!;
        const latestTest = latestTestsByVehicle.get(vehicle.id);

        if (latestTest && latestTest.result !== null && latestTest.result !== undefined) {
          if (latestTest.result) {
            stats.passed++;
          } else {
            stats.failed++;
          }
        } else {
          stats.untested++;
        }
        stats.total++;
      });

      return Array.from(categoryMap.entries()).map(([label, stats]) => ({
        id: label,
        label,
        ...stats,
      }));
    };

    // Calculate basic statistics
    const totalVehicles = summaryData?.total_vehicles || vehiclesData?.total || vehicles.length;
    const totalOffices = summaryData?.total_offices || officeData?.total || offices.length;
    const testedVehicles = summaryData?.tested_vehicles || latestTests.length;
    const passedTestsValue = summaryData?.passed_tests ?? passedTests;
    const failedTestsValue = summaryData?.failed_tests ?? failedTests;
    const pendingTests = summaryData?.pending_tests ?? Math.max(totalVehicles - testedVehicles, 0);
    const complianceRate = summaryData?.compliance_rate ?? summary?.overall_compliance_rate ?? 0;
    const officeDepartments = totalOffices;

    // Process engine type data with pass/fail breakdown
    const engineTypeData = categorizeVehicles("engine_type");

    // Process wheel count data with pass/fail breakdown
    const wheelCountData = categorizeVehicles("wheels", (wheels) =>
      wheels ? `${wheels} wheels` : "Unknown"
    );

    // Process vehicle type data with pass/fail breakdown
    const vehicleTypeData = categorizeVehicles("vehicle_type");

    // Create vehicle type breakdown for detailed stats
    const vehicleTypeBreakdown = vehicleTypeData.map((item) => ({
      type: item.label,
      count: item.total,
      passedCount: item.passed,
    }));

    // Process office compliance data (keep existing format)
    const officeComplianceData = offices.map((office) => ({
      id: office.office_name,
      label:
        office.office_name.length > 25
          ? office.office_name.substring(0, 22) + "..."
          : office.office_name, // Truncate long office names for chart display
      value: Math.round(office.compliance_rate || 0),
      passedCount: office.compliant_vehicles || 0,
      vehicleCount: office.total_vehicles || 0,
      complianceRate: office.compliance_rate || 0,
    }));

    // Create vehicle summaries for chatbot
    const vehicleSummaries = vehicles.map((vehicle) => {
      const latestTest = latestTestsByVehicle.get(vehicle.id);

      return {
      vehicleType: vehicle.vehicle_type || "Unknown",
      engineType: vehicle.engine_type || "Unknown",
      wheels: vehicle.wheels || 0,
      officeName: vehicle.office?.name || "Unknown",
      latestTestResult: latestTest?.result ?? null, // Convert undefined to null
    };
    });

    return {
      totalVehicles,
      totalOffices,
      testedVehicles,
      passedTests: passedTestsValue,
      failedTests: failedTestsValue,
      pendingTests,
      complianceRate,
      officeDepartments,
      engineTypeData,
      wheelCountData,
      vehicleTypeData,
      officeComplianceData,
      vehicleStatusList: vehicles.map((vehicle) => {
        const latestTest = latestTestsByVehicle.get(vehicle.id);
        const result = latestTest?.result;
        const resultLabel = result === true ? "Passed" : result === false ? "Failed" : "Pending";

        return {
          id: vehicle.id,
          plateNumber: vehicle.plate_number || "Unassigned",
          driverName: vehicle.driver_name || "Unknown",
          officeName: vehicle.office?.name || "Unknown Office",
          result: resultLabel,
          testDate: latestTest?.test_date ?? null,
        };
      }),
      topOffice: summaryData?.top_office
        ? {
            officeName: summaryData.top_office.office_name,
            complianceRate: summaryData.top_office.compliance_rate,
            passedCount: summaryData.top_office.passed_count,
            vehicleCount: summaryData.top_office.vehicle_count,
          }
        : null,
      vehicleTypeBreakdown,
      vehicleSummaries,
    };
  }, [vehiclesData, officeData, testsData, selectedYear, selectedQuarter]);

  return {
    data,
    loading,
    error: error as Error | null,
  };
}
