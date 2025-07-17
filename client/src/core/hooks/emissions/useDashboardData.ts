import { useMemo } from "react";
import {
  useVehicles,
  useOfficeCompliance,
  type Vehicle,
} from "@/core/api/emission-service";
import { useEmissionTests } from "@/core/hooks/emission/useQuarterlyTesting";

// Dashboard data structure for the overview page
export interface DashboardData {
  // Summary statistics
  totalVehicles: number;
  testedVehicles: number;
  complianceRate: number;
  officeDepartments: number;

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
    passedCount?: number;
    vehicleCount?: number;
    complianceRate?: number;
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
  // Fetch vehicles data
  const {
    data: vehiclesData,
    isLoading: vehiclesLoading,
    error: vehiclesError,
  } = useVehicles();

  // Fetch office compliance data with filters
  const {
    data: officeData,
    isLoading: officeLoading,
    error: officeError,
  } = useOfficeCompliance({
    year: selectedYear,
    quarter: selectedQuarter,
  });

  // Fetch emission tests data for the selected period
  const {
    data: testsData,
    isLoading: testsLoading,
    error: testsError,
  } = useEmissionTests();

  // Calculate loading state
  const loading = vehiclesLoading || officeLoading || testsLoading;

  // Calculate error state
  const error = vehiclesError || officeError || testsError;

  // Process and transform the data
  const data = useMemo(() => {
    if (!vehiclesData || !officeData) {
      return {
        totalVehicles: 0,
        testedVehicles: 0,
        complianceRate: 0,
        officeDepartments: 0,
        engineTypeData: [],
        wheelCountData: [],
        vehicleTypeData: [],
        officeComplianceData: [],
        vehicleSummaries: [],
      };
    }

    const vehicles = vehiclesData.vehicles || [];
    const offices = officeData.offices || [];
    const summary = officeData.summary;
    const tests = testsData || [];

    // Filter tests by selected quarter if specified
    const filteredTests = selectedQuarter
      ? tests.filter((test) => {
          return test.quarter === selectedQuarter && test.year === selectedYear;
        })
      : tests.filter((test) => {
          return test.year === selectedYear;
        });

    // Create vehicle-test lookup
    const vehicleTestMap = new Map<
      string,
      { passed: boolean; tested: boolean }
    >();
    filteredTests.forEach((test) => {
      if (test.result !== null) {
        vehicleTestMap.set(test.vehicle_id, {
          passed: test.result,
          tested: true,
        });
      }
    });

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
        const testResult = vehicleTestMap.get(vehicle.id);

        if (testResult?.tested) {
          if (testResult.passed) {
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
    const totalVehicles = summary?.total_vehicles || vehicles.length;
    const testedVehicles = filteredTests.length;
    const complianceRate = summary?.overall_compliance_rate || 0;
    const officeDepartments = summary?.total_offices || offices.length;

    // Process engine type data with pass/fail breakdown
    const engineTypeData = categorizeVehicles("engine_type");

    // Process wheel count data with pass/fail breakdown
    const wheelCountData = categorizeVehicles("wheels", (wheels) =>
      wheels ? `${wheels} wheels` : "Unknown"
    );

    // Process vehicle type data with pass/fail breakdown
    const vehicleTypeData = categorizeVehicles("vehicle_type");

    // Process office compliance data (keep existing format)
    const officeComplianceData = offices.map((office) => ({
      id: office.office_name,
      label: office.office_name,
      value: Math.round(office.compliance_rate || 0),
      passedCount: office.compliant_vehicles,
      vehicleCount: office.total_vehicles,
      complianceRate: office.compliance_rate,
    }));

    // Create vehicle summaries for chatbot
    const vehicleSummaries = vehicles.map((vehicle) => ({
      vehicleType: vehicle.vehicle_type || "Unknown",
      engineType: vehicle.engine_type || "Unknown",
      wheels: vehicle.wheels || 0,
      officeName: vehicle.office?.name || "Unknown",
      latestTestResult: vehicle.latest_test_result,
    }));

    return {
      totalVehicles,
      testedVehicles,
      complianceRate,
      officeDepartments,
      engineTypeData,
      wheelCountData,
      vehicleTypeData,
      officeComplianceData,
      vehicleSummaries,
    };
  }, [vehiclesData, officeData, testsData, selectedYear, selectedQuarter]);

  return {
    data,
    loading,
    error: error as Error | null,
  };
}
