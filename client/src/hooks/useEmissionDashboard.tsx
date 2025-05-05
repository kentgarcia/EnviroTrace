import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useQuery as useApolloQuery } from "@apollo/client";
import {
  GET_EMISSION_TESTS,
  GET_VEHICLE_SUMMARIES,
  GET_TEST_SCHEDULES,
  fetchVehicleSummaries,
  fetchEmissionTests,
  fetchTestSchedules as fetchScheduleData
} from "@/lib/emission-api";

export interface EmissionStat {
  label: string;
  value: number;
  change: number;
  icon?: React.ReactNode;
}

export interface EmissionData {
  stats: {
    totalVehicles: EmissionStat;
    testedVehicles: EmissionStat;
    complianceRate: EmissionStat;
    failRate: EmissionStat;
  };
  quarterlyTests: {
    quarter: number;
    passed: number;
    failed: number;
    total?: number;
    name?: string;
  }[];
  officeCompliance: {
    officeName: string;
    vehicleCount: number;
    testedCount: number;
    passedCount: number;
    complianceRate: number;
  }[];
  yearlyTrends: {
    year: number;
    complianceRate: number;
    totalVehicles: number;
  }[];
  recentTests: {
    id: string;
    plateNumber: string;
    officeName: string;
    testDate: string;
    result: boolean;
  }[];
  monthlyTrends?: {
    month: string;
    passed: number;
    failed: number;
  }[];
}

export interface TestSchedule {
  id: string;
  year: number;
  quarter: number;
  assignedPersonnel: string; // updated from assigned_personnel to camelCase
  location: string;
  conductedOn: string; // updated from conducted_on to camelCase
}

export interface DashboardData {
  totalVehicles: number;
  totalPassed: number;
  totalFailed: number;
  complianceRate: number;
  quarterStats: { quarter: number; passed: number; failed: number; name: string; }[];
  engineTypeData: { name: string; value: number }[];
  vehicleTypeData: { name: string; value: number }[];
  complianceByOffice: {
    officeName: string;
    vehicleCount: number;
    testedCount: number;
    passedCount: number;
    complianceRate: number;
  }[];
  recentTests: {
    id: string;
    plateNumber: string;
    officeName: string;
    testDate: string;
    result: boolean;
  }[];
}

export const useEmissionDashboard = (year: number, quarter?: number) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalVehicles: 0,
    totalPassed: 0,
    totalFailed: 0,
    complianceRate: 0,
    quarterStats: [],
    engineTypeData: [],
    vehicleTypeData: [],
    complianceByOffice: [],
    recentTests: []
  });

  // Use Apollo queries for vehicle summaries
  const {
    data: vehicleSummariesData,
    loading: vehiclesLoading,
    error: vehiclesError,
    refetch: refetchVehicles
  } = useApolloQuery(GET_VEHICLE_SUMMARIES, {
    variables: { filters: {} },
    fetchPolicy: "network-only"
  });

  // Use Apollo queries for emission tests
  const {
    data: emissionTestsData,
    loading: testsLoading,
    error: testsError,
    refetch: refetchTests
  } = useApolloQuery(GET_EMISSION_TESTS, {
    variables: {
      filters: quarter !== undefined ? { year, quarter } : { year }
    },
    fetchPolicy: "network-only"
  });

  // Use Apollo queries for test schedules
  const {
    data: schedulesData,
    loading: schedulesLoading,
    error: schedulesError,
    refetch: refetchSchedules
  } = useApolloQuery(GET_TEST_SCHEDULES, {
    variables: { year, quarter },
    fetchPolicy: "network-only"
  });

  const processEmissionData = useCallback(async () => {
    try {
      // Only process data when all required queries have completed
      if (vehiclesLoading || testsLoading) return;

      // Check for errors
      if (vehiclesError) {
        console.error('Error fetching vehicles data:', vehiclesError);
        toast.error("Failed to load vehicles data");
        return;
      }

      if (testsError) {
        console.error('Error fetching emission tests data:', testsError);
        toast.error("Failed to load emission tests data");
        return;
      }

      // Extract data from Apollo results
      const vehicles = vehicleSummariesData?.vehicleSummaries || [];
      const testsData = emissionTestsData?.emissionTests || [];

      const totalVehicles = vehicles.length;
      const testedVehicles = testsData.length;
      const passedVehicles = testsData.filter(test => test.result).length;
      const failedVehicles = testsData.filter(test => !test.result).length;
      const complianceRate = totalVehicles > 0 ? Math.round((passedVehicles / totalVehicles) * 100) : 0;
      const failRate = testedVehicles > 0 ? Math.round(((testedVehicles - passedVehicles) / testedVehicles) * 100) : 0;

      // 3. Generate quarterly tests data
      const quarterlyData: {
        quarter: number;
        passed: number;
        failed: number;
        name: string;
      }[] = [];

      // Get data for each quarter
      for (let q = 1; q <= 4; q++) {
        // Use Apollo client directly to fetch data for this specific quarter
        const quarterResults = await fetchEmissionTests({ year, quarter: q });

        const passed = quarterResults.filter(test => test.result).length;
        const failed = quarterResults.filter(test => !test.result).length;

        quarterlyData.push({
          quarter: q,
          passed,
          failed,
          name: `Q${q}`
        });
      }

      // 4. Generate engine type data
      // Count vehicles by engine type
      const engineTypeCounts: Record<string, number> = {};
      vehicles.forEach(vehicle => {
        const engineType = vehicle.engineType || 'Unknown';
        engineTypeCounts[engineType] = (engineTypeCounts[engineType] || 0) + 1;
      });

      const engineTypeData = Object.entries(engineTypeCounts).map(([name, value]) => ({
        name,
        value
      }));

      // 5. Generate vehicle type data by wheels count
      const wheelCounts: Record<string, number> = {};
      vehicles.forEach(vehicle => {
        // Convert wheels number to string for grouping
        const wheels = vehicle.wheels?.toString() || 'Unknown';
        wheelCounts[wheels] = (wheelCounts[wheels] || 0) + 1;
      });

      const vehicleTypeData = Object.entries(wheelCounts).map(([name, value]) => ({
        name,
        value
      }));

      // 6. Generate office compliance data
      // Get unique offices, ensuring they are strings
      const officeNames = [...new Set(vehicles.map(v => v.officeName).filter((name): name is string => typeof name === 'string'))];
      const officeCompliance: EmissionData['officeCompliance'] = [];

      for (const officeName of officeNames) {
        // Get vehicles for this office
        const officeVehicles = vehicles.filter(v => v.officeName === officeName);
        const vehicleCount = officeVehicles.length;

        // Get test results for vehicles in this office
        const officeVehicleIds = officeVehicles.map(v => v.id);

        // Filter test results that belong to this office
        const officeTests = testsData.filter(test =>
          officeVehicleIds.includes(test.vehicleId)
        );

        const testedCount = officeTests.length;
        const passedCount = officeTests.filter(test => test.result).length;

        officeCompliance.push({
          officeName: officeName as string,
          vehicleCount,
          testedCount,
          passedCount,
          complianceRate: vehicleCount > 0 ? Math.round((passedCount / vehicleCount) * 100) : 0
        });
      }

      // 7. Generate yearly trends (mocked data for now)
      const currentYear = new Date().getFullYear();
      const yearlyTrends = [
        { year: currentYear - 2, complianceRate: 82, totalVehicles: 450 },
        { year: currentYear - 1, complianceRate: 87, totalVehicles: 475 },
        { year: currentYear, complianceRate: complianceRate, totalVehicles: totalVehicles }
      ];

      // 8. Get recent tests
      // Sort by testDate in descending order
      const sortedTests = [...testsData].sort((a, b) =>
        new Date(b.testDate).getTime() - new Date(a.testDate).getTime()
      ).slice(0, 5);

      const recentTests = sortedTests.map(test => ({
        id: test.id,
        plateNumber: test.vehicle?.plateNumber || 'Unknown',
        officeName: test.vehicle?.officeName || 'Unknown',
        testDate: test.testDate,
        result: test.result
      }));

      // Set dashboard data
      const newDashboardData = {
        totalVehicles,
        totalPassed: passedVehicles,
        totalFailed: failedVehicles,
        complianceRate,
        quarterStats: quarterlyData,
        engineTypeData,
        vehicleTypeData,
        complianceByOffice: officeCompliance,
        recentTests
      };

      setDashboardData(newDashboardData);

      // Create emission data
      const emissionData: EmissionData = {
        stats: {
          totalVehicles: {
            label: 'Total Vehicles',
            value: totalVehicles,
            change: 5.2, // Mocked change percentage
          },
          testedVehicles: {
            label: 'Tested Vehicles',
            value: testedVehicles,
            change: 12.3, // Mocked change percentage
          },
          complianceRate: {
            label: 'Compliance Rate',
            value: complianceRate,
            change: 3.1, // Mocked change percentage
          },
          failRate: {
            label: 'Fail Rate',
            value: failRate,
            change: -2.4, // Mocked change percentage
          },
        },
        quarterlyTests: quarterlyData,
        officeCompliance,
        yearlyTrends,
        recentTests,
      };

      return emissionData;
    } catch (err) {
      console.error('Error processing emission data:', err);
      toast.error("Failed to process dashboard data");
      throw err;
    }
  }, [year, vehicleSummariesData, emissionTestsData, vehiclesLoading, testsLoading, vehiclesError, testsError]);

  // Process data whenever Apollo query results change
  useEffect(() => {
    processEmissionData();
  }, [processEmissionData]);

  // Calculate loading state from all queries
  const isLoading = vehiclesLoading || testsLoading || schedulesLoading;

  // Combine all errors
  const error = vehiclesError || testsError || schedulesError;

  // Process schedule data from Apollo
  const schedules = schedulesData?.emissionTestSchedules || [];

  return {
    data: processEmissionData(),
    loading: isLoading,
    error: error,
    refetch: () => {
      refetchVehicles();
      refetchTests();
      refetchSchedules();
    },
    fetchTestSchedules: async () => {
      const result = await refetchSchedules();
      return result.data?.emissionTestSchedules || [];
    },
    ...dashboardData
  };
}
