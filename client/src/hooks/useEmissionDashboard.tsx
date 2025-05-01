import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  fetchEmissionTests,
  fetchVehicleSummaries,
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
  quarterStats: any[];
  engineTypeData: any[];
  vehicleTypeData: any[];
  complianceByOffice: any[];
  recentTests: any[];
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

  // Use react-query to fetch and cache dashboard data
  const fetchEmissionData = useCallback(async () => {
    try {
      // 1. Fetch all vehicles to get count
      const vehicles = await fetchVehicleSummaries();
      const totalVehicles = vehicles.length;

      // 2. Fetch tests with filters
      const testsData = await fetchEmissionTests(
        quarter !== undefined
          ? { year, quarter }
          : { year }
      );

      const testedVehicles = testsData.length;
      const passedVehicles = testsData.filter(test => test.result).length;
      const failedVehicles = testsData.filter(test => !test.result).length;
      const complianceRate = totalVehicles > 0 ? Math.round((passedVehicles / totalVehicles) * 100) : 0;
      const failRate = testedVehicles > 0 ? Math.round(((testedVehicles - passedVehicles) / testedVehicles) * 100) : 0;

      // 3. Generate quarterly tests data
      let quarterlyData: {
        quarter: number;
        passed: number;
        failed: number;
        name: string;
      }[] = [];

      // Get data for each quarter
      for (let q = 1; q <= 4; q++) {
        // Fetch tests for this specific quarter
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
      // Get unique offices
      const officeNames = [...new Set(vehicles.map(v => v.officeName))];
      const officeCompliance = [];

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
          officeName,
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

      // Create and return emission data
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
      console.error('Error fetching emission data:', err);
      toast.error("Failed to load dashboard data");
      throw err;
    }
  }, [year, quarter]);

  const fetchTestSchedules = useCallback(async (): Promise<TestSchedule[]> => {
    try {
      // Fetch test schedules using the GraphQL client
      const data = await fetchScheduleData(year, quarter);

      // Map response to TestSchedule interface
      return data.map(schedule => ({
        id: schedule.id,
        year: schedule.year,
        quarter: schedule.quarter,
        assignedPersonnel: schedule.assignedPersonnel,
        location: schedule.location,
        conductedOn: schedule.conductedOn
      }));
    } catch (error) {
      console.error("Error fetching test schedules:", error);
      toast.error("Failed to load quarterly test schedules");
      return [];
    }
  }, [year, quarter]);

  // Use React Query to fetch and cache emission data
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['emissionData', year, quarter],
    queryFn: fetchEmissionData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use React Query to fetch and cache test schedules
  const {
    data: schedules = [],
    refetch: refetchSchedules
  } = useQuery({
    queryKey: ['testSchedules', year, quarter],
    queryFn: fetchTestSchedules,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data,
    loading: isLoading,
    error,
    refetch,
    fetchTestSchedules: () => refetchSchedules().then(result => result.data || []),
    ...dashboardData
  };
};
