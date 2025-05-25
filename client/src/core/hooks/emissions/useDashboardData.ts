import { useMemo } from "react";
import { useVehicles, useOfficeCompliance } from "@/core/api/emission-service";
import { useEmissionTests } from "@/core/hooks/emission/useQuarterlyTesting";

// Dashboard data structure for the overview page
export interface DashboardData {
  // Summary statistics
  totalVehicles: number;
  testedVehicles: number;
  complianceRate: number;
  officeDepartments: number;

  // Chart data for pie charts
  engineTypeData: Array<{ id: string; label: string; value: number }>;
  wheelCountData: Array<{ id: string; label: string; value: number }>;

  // Chart data for bar charts
  vehicleTypeData: Array<{ id: string; label: string; value: number }>;
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

    // Calculate basic statistics
    const totalVehicles = summary?.total_vehicles || vehicles.length;
    const testedVehicles = vehicles.filter(
      (v) => v.latest_test_result !== null
    ).length;
    const complianceRate = summary?.overall_compliance_rate || 0;
    const officeDepartments = summary?.total_offices || offices.length;

    // Process engine type data for pie chart
    const engineTypeMap = new Map<string, number>();
    vehicles.forEach((vehicle) => {
      const engineType = vehicle.engine_type || "Unknown";
      engineTypeMap.set(engineType, (engineTypeMap.get(engineType) || 0) + 1);
    });
    const engineTypeData = Array.from(engineTypeMap.entries()).map(
      ([type, count]) => ({
        id: type,
        label: type,
        value: count,
      })
    );

    // Process wheel count data for pie chart
    const wheelCountMap = new Map<string, number>();
    vehicles.forEach((vehicle) => {
      const wheels = vehicle.wheels?.toString() || "Unknown";
      const label = wheels === "Unknown" ? "Unknown" : `${wheels} wheels`;
      wheelCountMap.set(label, (wheelCountMap.get(label) || 0) + 1);
    });
    const wheelCountData = Array.from(wheelCountMap.entries()).map(
      ([label, count]) => ({
        id: label,
        label,
        value: count,
      })
    );

    // Process vehicle type data for bar chart
    const vehicleTypeMap = new Map<string, number>();
    vehicles.forEach((vehicle) => {
      const vehicleType = vehicle.vehicle_type || "Unknown";
      vehicleTypeMap.set(
        vehicleType,
        (vehicleTypeMap.get(vehicleType) || 0) + 1
      );
    });
    const vehicleTypeData = Array.from(vehicleTypeMap.entries()).map(
      ([type, count]) => ({
        id: type,
        label: type,
        value: count,
      })
    );

    // Process office compliance data for bar chart
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
      officeName: vehicle.office_name || "Unknown",
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
  }, [vehiclesData, officeData, testsData]);

  return {
    data,
    loading,
    error: error as Error | null,
  };
}
