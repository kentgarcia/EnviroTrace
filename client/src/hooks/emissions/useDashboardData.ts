// filepath: new version of useDashboardData.ts
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/api-client";
import {
  Vehicle,
  EmissionTest,
  OfficeCompliance,
} from "@/lib/api/emission-service";

// API Endpoints
const ENDPOINTS = {
  VEHICLES: "/vehicles",
  EMISSION_TESTS: "/emission-tests",
  OFFICE_COMPLIANCE: "/office-compliance",
};

// Dashboard data types
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

  // Query for fetching vehicles
  const vehiclesQuery = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data } = await apiClient.get<Vehicle[]>(ENDPOINTS.VEHICLES);
      return data;
    },
    enabled: !useMockData,
  });

  // Query for fetching emission tests
  const emissionTestsQuery = useQuery({
    queryKey: ["emissionTests", { year, quarter }],
    queryFn: async () => {
      const params = quarter !== undefined ? { year, quarter } : { year };
      const { data } = await apiClient.get<EmissionTest[]>(
        ENDPOINTS.EMISSION_TESTS,
        { params }
      );
      return data;
    },
    enabled: !useMockData,
  });

  // Query for fetching office compliance data
  const officeComplianceQuery = useQuery({
    queryKey: ["officeCompliance", year, quarter],
    queryFn: async () => {
      const params = quarter !== undefined ? { year, quarter } : { year };
      const { data } = await apiClient.get<OfficeCompliance[]>(
        ENDPOINTS.OFFICE_COMPLIANCE,
        { params }
      );
      return data;
    },
    enabled: !useMockData,
  });

  // Combine all the loading states
  const loading =
    vehiclesQuery.isLoading ||
    emissionTestsQuery.isLoading ||
    officeComplianceQuery.isLoading;

  // Combine all the error states
  const error =
    vehiclesQuery.error ||
    emissionTestsQuery.error ||
    officeComplianceQuery.error;

  useEffect(() => {
    // If using mock data, simulate a delay then return mock data
    if (useMockData) {
      console.log("Using mock data for dashboard");
      setTimeout(() => {
        setData(MOCK_DATA);
      }, 800);
      return;
    }

    // If we're still loading or have errors, don't process the data
    if (loading || error) {
      return;
    }

    // If we have all the data, process it
    if (
      vehiclesQuery.data &&
      emissionTestsQuery.data &&
      officeComplianceQuery.data
    ) {
      const vehicleSummaries = vehiclesQuery.data;
      const emissionTests = emissionTestsQuery.data;
      const officeComplianceData = officeComplianceQuery.data;

      console.log("Dashboard data received:", {
        vehicleSummaries,
        emissionTests,
        officeComplianceData,
      });

      // Calculate total vehicles and tested vehicles
      const totalVehicles = vehicleSummaries.length;
      const testedVehicles = emissionTests.length;

      // Calculate compliance rate
      const passedTests = emissionTests.filter(
        (test) => test.result === "PASS"
      ).length;
      const complianceRate =
        testedVehicles > 0
          ? Math.round((passedTests / testedVehicles) * 100)
          : 0;

      // Process engine type data
      const engineTypeCounts: Record<string, number> = {};
      vehicleSummaries.forEach((vehicle) => {
        const engineType = vehicle.engineType || "Unknown";
        engineTypeCounts[engineType] = (engineTypeCounts[engineType] || 0) + 1;
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
      vehicleSummaries.forEach((vehicle) => {
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
      vehicleSummaries.forEach((vehicle) => {
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
        .map((office) => ({
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
        officeDepartments: new Set(vehicleSummaries.map((v) => v.officeName))
          .size,
        engineTypeData,
        wheelCountData,
        vehicleTypeData,
        officeComplianceData: processedOfficeComplianceData,
      });
    }
  }, [
    vehiclesQuery.data,
    emissionTestsQuery.data,
    officeComplianceQuery.data,
    loading,
    error,
    useMockData,
  ]);

  // Handle error case by providing mock data in production
  useEffect(() => {
    if (error && !isDevelopment) {
      console.error("Error fetching dashboard data:", error);
      console.log("Using mock data as fallback due to API error");
      setData(MOCK_DATA);
    }
  }, [error, isDevelopment]);

  return { data, loading, error };
}
