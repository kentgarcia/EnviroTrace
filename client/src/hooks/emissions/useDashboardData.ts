import { useState, useEffect } from "react";
import { apolloClient } from "@/lib/apollo-client";
import { gql, ApolloError } from "@apollo/client";

const DASHBOARD_DATA_QUERY_WITH_QUARTER = gql`
  query DashboardDataWithQuarter($year: Int!, $quarter: Int!) {
    vehicleSummaries {
      engineType
      wheels
      vehicleType
      officeName
      latestTestResult
      latestTestYear
      latestTestQuarter
    }
    emissionTests(filters: { year: $year, quarter: $quarter }) {
      result
      vehicleId
      vehicle {
        engineType
        vehicleType
        officeName
        wheels
      }
    }
    officeCompliance: officeCompliance(year: $year, quarter: $quarter) {
      name
      vehicleCount
      passedCount
      complianceRate
    }
  }
`;

const DASHBOARD_DATA_QUERY_BY_YEAR = gql`
  query DashboardDataByYear($year: Int!) {
    vehicleSummaries {
      engineType
      wheels
      vehicleType
      officeName
      latestTestResult
      latestTestYear
      latestTestQuarter
    }
    emissionTests(filters: { year: $year }) {
      result
      vehicleId
      vehicle {
        engineType
        vehicleType
        officeName
        wheels
      }
    }
    officeComplianceByYear(year: $year) {
      name
      vehicleCount
      passedCount
      complianceRate
    }
  }
`;

// Dashboard data types
export interface VehicleSummary {
  engineType: string;
  wheels: number;
  vehicleType: string;
  officeName: string;
  latestTestResult: boolean | null;
  latestTestYear: number | null;
  latestTestQuarter: number | null;
}

export interface EmissionTest {
  result: boolean;
  vehicleId: string;
  vehicle: {
    engineType: string;
    vehicleType: string;
    officeName: string;
    wheels: number;
  };
}

export interface OfficeCompliance {
  name: string;
  vehicleCount: number;
  passedCount: number;
  complianceRate: number;
}

export interface DashboardData {
  totalVehicles: number;
  testedVehicles: number;
  complianceRate: number;
  officeDepartments: number;
  engineTypeData: { id: string; label: string; value: number }[];
  wheelCountData: { id: string; label: string; value: number }[];
  vehicleTypeData: { id: string; label: string; value: number }[];
  officeComplianceData: {
    id: string;
    label: string;
    value: number;
    vehicleCount: number;
    passedCount: number;
  }[];
}

// Mock data for development or when the server is unavailable
const MOCK_DATA: DashboardData = {
  totalVehicles: 256,
  testedVehicles: 189,
  complianceRate: 86,
  officeDepartments: 12,
  engineTypeData: [
    { id: "Gasoline", label: "Gasoline", value: 182 },
    { id: "Diesel", label: "Diesel", value: 74 },
  ],
  wheelCountData: [
    { id: "4", label: "4 wheels", value: 203 },
    { id: "6", label: "6 wheels", value: 38 },
    { id: "8", label: "8 wheels", value: 15 },
  ],
  vehicleTypeData: [
    { id: "Sedan", label: "Sedan", value: 112 },
    { id: "SUV", label: "SUV", value: 68 },
    { id: "Truck", label: "Truck", value: 43 },
    { id: "Van", label: "Van", value: 33 },
  ],
  officeComplianceData: [
    {
      id: "Environment Office",
      label: "Environment Office",
      value: 95,
      vehicleCount: 28,
      passedCount: 27,
    },
    {
      id: "Public Works",
      label: "Public Works",
      value: 90,
      vehicleCount: 42,
      passedCount: 38,
    },
    {
      id: "Mayor's Office",
      label: "Mayor's Office",
      value: 87,
      vehicleCount: 32,
      passedCount: 28,
    },
    {
      id: "Health Department",
      label: "Health Department",
      value: 83,
      vehicleCount: 36,
      passedCount: 30,
    },
  ],
};

export function useDashboardData(year: number, quarter?: number) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const [data, setData] = useState<DashboardData>({
    totalVehicles: 0,
    testedVehicles: 0,
    complianceRate: 0,
    officeDepartments: 0,
    engineTypeData: [],
    wheelCountData: [],
    vehicleTypeData: [],
    officeComplianceData: [],
  });

  // Use development mode flag to determine if mock data should be used
  const isDevelopment = process.env.NODE_ENV === "development";
  const useMockData = isDevelopment && false; // Set to true to use mock data during development

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // If using mock data, simulate a delay then return mock data
        if (useMockData) {
          console.log("Using mock data for dashboard");
          setTimeout(() => {
            setData(MOCK_DATA);
            setLoading(false);
          }, 800);
          return;
        }

        setLoading(true);
        console.log(
          `Fetching dashboard data for year: ${year}, quarter: ${
            quarter || "all"
          }`
        );

        let responseData;
        if (quarter !== undefined && quarter !== null) {
          const { data: resp } = await apolloClient.query({
            query: DASHBOARD_DATA_QUERY_WITH_QUARTER,
            variables: { year, quarter },
            fetchPolicy: "network-only",
          });
          responseData = resp;
        } else {
          const { data: resp } = await apolloClient.query({
            query: DASHBOARD_DATA_QUERY_BY_YEAR,
            variables: { year },
            fetchPolicy: "network-only",
          });
          responseData = resp;
        }

        console.log("Dashboard data received:", responseData);

        // Process the data
        const {
          vehicleSummaries = [],
          emissionTests = [],
          officeCompliance = [],
          officeComplianceByYear = [],
        } = responseData;

        // Use the appropriate office compliance data based on whether quarter was provided
        const officeComplianceData = quarter
          ? officeCompliance
          : officeComplianceByYear;

        // Calculate total vehicles and tested vehicles
        const totalVehicles = vehicleSummaries.length;
        const testedVehicles = emissionTests.length;

        // Calculate compliance rate
        const passedTests = emissionTests.filter(
          (test: EmissionTest) => test.result
        ).length;
        const complianceRate =
          testedVehicles > 0
            ? Math.round((passedTests / testedVehicles) * 100)
            : 0;

        // Process engine type data
        const engineTypeCounts: Record<string, number> = {};
        vehicleSummaries.forEach((vehicle: VehicleSummary) => {
          const engineType = vehicle.engineType || "Unknown";
          engineTypeCounts[engineType] =
            (engineTypeCounts[engineType] || 0) + 1;
        });

        const engineTypeData = Object.entries(engineTypeCounts).map(
          ([type, count]) => ({
            id: type,
            label: type,
            value: count,
          })
        );

        // Process wheel count data
        const wheelCounts: Record<string, number> = {};
        vehicleSummaries.forEach((vehicle: VehicleSummary) => {
          const wheels = vehicle.wheels ? vehicle.wheels.toString() : "Unknown";
          wheelCounts[wheels] = (wheelCounts[wheels] || 0) + 1;
        });

        const wheelCountData = Object.entries(wheelCounts).map(
          ([wheels, count]) => ({
            id: wheels,
            label: `${wheels} wheels`,
            value: count,
          })
        );

        // Process vehicle type data
        const vehicleTypeCounts: Record<string, number> = {};
        vehicleSummaries.forEach((vehicle: VehicleSummary) => {
          const vehicleType = vehicle.vehicleType || "Unknown";
          vehicleTypeCounts[vehicleType] =
            (vehicleTypeCounts[vehicleType] || 0) + 1;
        });

        const vehicleTypeData = Object.entries(vehicleTypeCounts)
          .map(([type, count]) => ({
            id: type,
            label: type,
            value: count,
          }))
          .sort((a, b) => b.value - a.value);

        // Process office compliance data
        const processedOfficeComplianceData = officeComplianceData
          .map((office: OfficeCompliance) => ({
            id: office.name,
            label: office.name,
            value: office.complianceRate,
            vehicleCount: office.vehicleCount,
            passedCount: office.passedCount,
          }))
          .sort((a, b) => b.value - a.value);

        setData({
          totalVehicles,
          testedVehicles,
          complianceRate,
          officeDepartments: new Set(
            vehicleSummaries.map((v: VehicleSummary) => v.officeName)
          ).size,
          engineTypeData,
          wheelCountData,
          vehicleTypeData,
          officeComplianceData: processedOfficeComplianceData,
        });

        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);

        // Use mock data as fallback in case of network errors in production
        if (!isDevelopment) {
          console.log("Using mock data as fallback due to API error");
          setData(MOCK_DATA);
        } else {
          setError(err as Error | ApolloError);
        }

        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [year, quarter, useMockData, isDevelopment]);

  return { data, loading, error };
}
