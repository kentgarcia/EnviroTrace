import apiClient from "../core/api/api-client";
import { useSmartQuery } from "./useSmartQuery";
import {
  Vehicle,
  EmissionTest,
  OfficeComplianceResponse,
} from "../core/api/emission-service";

interface VehiclesResponse {
  vehicles: Vehicle[];
  total: number;
}

interface TestsResponse {
  tests: EmissionTest[];
  total: number;
}

interface PieChartSlice {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

interface StackedBarChartData {
  labels: string[];
  legend: string[];
  data: number[][];
  barColors: string[];
}

interface DashboardOfficeSummary {
  id: string;
  label: string;
  complianceRate: number;
  passedCount: number;
  vehicleCount: number;
}

interface TopOffice {
  name: string;
  complianceRate: number;
  passedCount: number;
  vehicleCount: number;
}

interface VehicleSummary {
  vehicleId: string;
  latestTestResult: boolean | null;
  vehicleType: string;
  engineType: string;
  wheels: number;
  officeName: string;
}

export interface DashboardData {
  totalVehicles: number;
  totalOffices: number;
  testedVehicles: number;
  complianceRate: number;
  passedTests: number;
  failedTests: number;
  pendingTests: number;
  officeDepartments: number;
  topPerformingOffice?: TopOffice;
  vehicleTypeDistribution?: PieChartSlice[];
  engineTypeStackedData?: StackedBarChartData;
  officeComplianceData: DashboardOfficeSummary[];
  lastUpdated?: string;
}

const VEHICLES_ENDPOINT = "/emission/vehicles";
const OFFICE_COMPLIANCE_ENDPOINT = "/emission/offices/compliance";
const TESTS_ENDPOINT = "/emission/tests";

const PIE_COLORS = ["#1E40AF", "#7C3AED", "#16A34A", "#DC2626", "#F59E0B", "#0891B2", "#f97316"];

const EMPTY_DASHBOARD_DATA: DashboardData = {
  totalVehicles: 0,
  totalOffices: 0,
  testedVehicles: 0,
  complianceRate: 0,
  passedTests: 0,
  failedTests: 0,
  pendingTests: 0,
  officeDepartments: 0,
  officeComplianceData: [],
};

export function useDashboardData(year?: number, quarter?: number) {
  const fetchDashboardStats = async (): Promise<DashboardData> => {
    try {
      const vehicleParams = {
        include_test_data: "true",
        limit: 1000,
      } as const;

      const complianceParams: Record<string, string | number> = {};
      if (year) complianceParams.year = year;
      if (typeof quarter === "number") complianceParams.quarter = quarter;

      const testParams: Record<string, string | number> = {};
      if (year) testParams.year = year;
      if (typeof quarter === "number") testParams.quarter = quarter;

      const [vehiclesResponse, officeComplianceResponse, testsResponse] = await Promise.all([
        apiClient.get<VehiclesResponse>(VEHICLES_ENDPOINT, { params: vehicleParams }),
        apiClient.get<OfficeComplianceResponse>(OFFICE_COMPLIANCE_ENDPOINT, { params: complianceParams }),
        apiClient.get<TestsResponse>(TESTS_ENDPOINT, { params: testParams }),
      ]);

      if (vehiclesResponse.status >= 400) {
        const message = (vehiclesResponse.data as any)?.message || "Unable to load vehicles";
        throw new Error(message);
      }

      if (officeComplianceResponse.status >= 400) {
        const message = (officeComplianceResponse.data as any)?.message || "Unable to load office compliance";
        throw new Error(message);
      }

      if (testsResponse.status >= 400) {
        const message = (testsResponse.data as any)?.message || "Unable to load emission tests";
        throw new Error(message);
      }

      const vehicles = vehiclesResponse.data?.vehicles ?? [];
      const complianceData = officeComplianceResponse.data ?? {
        offices: [],
        summary: {
          total_offices: 0,
          total_vehicles: 0,
          total_compliant: 0,
          overall_compliance_rate: 0,
        },
        total: 0,
      };
      const offices = complianceData.offices ?? [];
      const summary = complianceData.summary;
      const apiTests = testsResponse.data?.tests ?? [];

      const filteredTests = apiTests.filter((test) => {
        const matchesYear = year ? test.year === year : true;
        const matchesQuarter = typeof quarter === "number" ? test.quarter === quarter : true;
        return matchesYear && matchesQuarter;
      });

      const testsByVehicle = new Map<string, EmissionTest[]>();
      filteredTests.forEach((test) => {
        const current = testsByVehicle.get(test.vehicle_id) ?? [];
        current.push(test);
        testsByVehicle.set(test.vehicle_id, current);
      });

      const vehicleSummaries: VehicleSummary[] = vehicles.map((vehicle) => {
        const testsForVehicle = testsByVehicle.get(vehicle.id) ?? [];
        const latestTest = [...testsForVehicle]
          .sort((a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime())[0];

        let latestResult: boolean | null = null;
        if (latestTest) {
          latestResult = latestTest.result;
        } else if (vehicle.latest_test_result !== undefined) {
          latestResult = vehicle.latest_test_result;
        }

        return {
          vehicleId: vehicle.id,
          latestTestResult: latestResult ?? null,
          vehicleType: vehicle.vehicle_type || "Unknown",
          engineType: vehicle.engine_type || "Unknown",
          wheels: vehicle.wheels || 0,
          officeName: vehicle.office?.name || "Unknown",
        };
      });

      const passedTests = vehicleSummaries.filter((summary) => summary.latestTestResult === true).length;
      const failedTests = vehicleSummaries.filter((summary) => summary.latestTestResult === false).length;
      const pendingTests = vehicleSummaries.filter((summary) => summary.latestTestResult === null).length;
      const testedVehicles = passedTests + failedTests;
      const totalVehiclesFromSummary = summary?.total_vehicles ?? vehiclesResponse.data?.total ?? vehicles.length;
      const totalOfficesFromSummary = summary?.total_offices ?? complianceData.total ?? offices.length;
      const complianceRateBase = passedTests + failedTests;
      const complianceRate = complianceRateBase > 0 ? Math.round((passedTests / complianceRateBase) * 100) : 0;

      const officeComplianceData: DashboardOfficeSummary[] = offices.map((office) => ({
        id: office.office_name,
        label: office.office_name,
        complianceRate: Math.round(office.compliance_rate ?? 0),
        passedCount: office.compliant_vehicles ?? 0,
        vehicleCount: office.total_vehicles ?? 0,
      }));

      const topPerformingOfficeSource = officeComplianceData
        .filter((office) => office.vehicleCount > 0)
        .sort((a, b) => b.complianceRate - a.complianceRate)[0];

      const topPerformingOffice: TopOffice | undefined = topPerformingOfficeSource
        ? {
            name: topPerformingOfficeSource.label,
            complianceRate: topPerformingOfficeSource.complianceRate,
            passedCount: topPerformingOfficeSource.passedCount,
            vehicleCount: topPerformingOfficeSource.vehicleCount,
          }
        : undefined;

      const vehicleTypeCount = new Map<string, number>();
      vehicleSummaries.forEach((summary) => {
        const current = vehicleTypeCount.get(summary.vehicleType) ?? 0;
        vehicleTypeCount.set(summary.vehicleType, current + 1);
      });

      const vehicleTypeDistribution: PieChartSlice[] | undefined = vehicleTypeCount.size > 0
        ? Array.from(vehicleTypeCount.entries()).map(([vehicleType, population], index) => ({
            name: vehicleType,
            population,
            color: PIE_COLORS[index % PIE_COLORS.length],
            legendFontColor: "#4B5563",
            legendFontSize: 12,
          }))
        : undefined;

      const engineTypeStats = new Map<string, { passed: number; failed: number; pending: number }>();
      vehicleSummaries.forEach((summary) => {
        const current = engineTypeStats.get(summary.engineType) ?? { passed: 0, failed: 0, pending: 0 };
        if (summary.latestTestResult === true) {
          current.passed += 1;
        } else if (summary.latestTestResult === false) {
          current.failed += 1;
        } else {
          current.pending += 1;
        }
        engineTypeStats.set(summary.engineType, current);
      });

      const engineTypeEntries = Array.from(engineTypeStats.entries()).filter(([, stats]) => stats.passed || stats.failed || stats.pending);
      const engineTypeStackedData: StackedBarChartData | undefined = engineTypeEntries.length > 0
        ? {
            labels: engineTypeEntries.map(([engineType]) => engineType),
            legend: ["Passed", "Failed", "Pending"],
            data: engineTypeEntries.map(([, stats]) => [stats.passed, stats.failed, stats.pending]),
            barColors: ["#22c55e", "#ef4444", "#f59e0b"],
          }
        : undefined;

      return {
        totalVehicles: totalVehiclesFromSummary,
        totalOffices: totalOfficesFromSummary,
        testedVehicles,
        complianceRate,
        passedTests,
        failedTests,
        pendingTests,
        officeDepartments: totalOfficesFromSummary,
        topPerformingOffice,
        vehicleTypeDistribution,
        engineTypeStackedData,
        officeComplianceData,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
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
    staleTime: 2 * 60 * 1000,
    cacheTime: 24 * 60 * 60 * 1000,
    refetchOnAppFocus: true,
  });

  return {
    data: data ?? EMPTY_DASHBOARD_DATA,
    loading: isLoading,
    error,
    refetch,
    forceRefresh,
    isFromCache,
    isStale,
  };
}
