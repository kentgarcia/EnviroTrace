
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  assigned_personnel: string;
  location: string;
  conducted_on: string;
}

interface UseEmissionDashboardProps {
  year: number;
  quarter?: number;
}

export const useEmissionDashboard = ({ year, quarter }: UseEmissionDashboardProps) => {
  const [data, setData] = useState<EmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEmissionData = async () => {
    try {
      setLoading(true);
      // Each query will be performed separately to avoid complex join queries

      // 1. Calculate total vehicles count and change from previous year
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('count', { count: 'exact' });

      if (vehiclesError) throw vehiclesError;

      const totalVehicles = vehiclesData || 0;

      // 2. Calculate tested vehicles and compliance rate
      let testsQuery = supabase
        .from('emission_tests')
        .select('count, result', { count: 'exact' })
        .eq('year', year);

      if (quarter) {
        testsQuery = testsQuery.eq('quarter', quarter);
      }

      const { data: testsData, error: testsError } = await testsQuery;

      if (testsError) throw testsError;

      const testedVehicles = testsData ? testsData.length : 0;
      const passedVehicles = testsData ? testsData.filter(test => test.result).length : 0;
      const complianceRate = totalVehicles > 0 ? (passedVehicles / totalVehicles) * 100 : 0;
      const failRate = testedVehicles > 0 ? ((testedVehicles - passedVehicles) / testedVehicles) * 100 : 0;

      // 3. Get quarterly tests data
      let quarterlyData: {
        quarter: number;
        passed: number;
        failed: number;
      }[] = [];

      // This would normally use the groupBy functionality, but for the demo we'll simulate it
      for (let q = 1; q <= 4; q++) {
        const { data: quarterResults, error: quarterError } = await supabase
          .from('emission_tests')
          .select('result')
          .eq('year', year)
          .eq('quarter', q);

        if (quarterError) throw quarterError;

        const passed = quarterResults ? quarterResults.filter(test => test.result).length : 0;
        const failed = quarterResults ? quarterResults.filter(test => !test.result).length : 0;

        quarterlyData.push({
          quarter: q,
          passed,
          failed,
        });
      }

      // 4. Generate office compliance data
      const { data: officesData, error: officesError } = await supabase
        .from('vehicles')
        .select('office_name');

      if (officesError) throw officesError;

      const offices = [...new Set(officesData.map(v => v.office_name))];
      const officeCompliance = [];

      for (const officeName of offices) {
        const { data: officeVehicles, error: officeVehiclesError } = await supabase
          .from('vehicles')
          .select('id')
          .eq('office_name', officeName);

        if (officeVehiclesError) throw officeVehiclesError;

        const vehicleCount = officeVehicles.length;

        let testQuery = supabase
          .from('emission_tests')
          .select('vehicle_id, result')
          .eq('year', year);

        if (quarter) {
          testQuery = testQuery.eq('quarter', quarter);
        }

        const { data: testResults, error: testResultsError } = await testQuery;

        if (testResultsError) throw testResultsError;

        // Filter test results that belong to this office
        const vehicleIds = officeVehicles.map(v => v.id);
        const officeTests = testResults.filter(test => vehicleIds.includes(test.vehicle_id));
        const testedCount = officeTests.length;
        const passedCount = officeTests.filter(test => test.result).length;

        officeCompliance.push({
          officeName,
          vehicleCount,
          testedCount,
          passedCount,
          complianceRate: vehicleCount > 0 ? (passedCount / vehicleCount) * 100 : 0
        });
      }

      // 5. Generate yearly trends (mocked data for now)
      const currentYear = new Date().getFullYear();
      const yearlyTrends = [
        { year: currentYear - 2, complianceRate: 82, totalVehicles: 450 },
        { year: currentYear - 1, complianceRate: 87, totalVehicles: 475 },
        { year: currentYear, complianceRate: complianceRate, totalVehicles: totalVehicles }
      ];

      // 6. Get recent tests
      let recentTestsQuery = supabase
        .from('emission_tests')
        .select(`
          id,
          test_date,
          result,
          vehicles(plate_number, office_name)
        `)
        .order('test_date', { ascending: false })
        .limit(5);

      if (quarter) {
        recentTestsQuery = recentTestsQuery
          .eq('year', year)
          .eq('quarter', quarter);
      } else {
        recentTestsQuery = recentTestsQuery.eq('year', year);
      }

      const { data: recentTestsData, error: recentTestsError } = await recentTestsQuery;

      if (recentTestsError) throw recentTestsError;

      const recentTests = recentTestsData.map(test => ({
        id: test.id,
        plateNumber: test.vehicles ? test.vehicles.plate_number : 'Unknown',
        officeName: test.vehicles ? test.vehicles.office_name : 'Unknown',
        testDate: test.test_date,
        result: test.result
      }));

      // Combine all data
      setData({
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
      });
    } catch (err) {
      console.error('Error fetching emission data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch emission data'));
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTestSchedules = async (): Promise<TestSchedule[]> => {
    try {
      let query = supabase
        .from('emission_test_schedules')
        .select('*')
        .eq('year', year);
        
      if (quarter) {
        query = query.eq('quarter', quarter);
      }
        
      query = query.order('quarter', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      return data as TestSchedule[];
    } catch (error) {
      console.error("Error fetching test schedules:", error);
      toast.error("Failed to load quarterly test schedules");
      return [];
    }
  };

  // Fetch data on component mount and when year/quarter changes
  useEffect(() => {
    fetchEmissionData();
  }, [year, quarter]);

  return { data, loading, error, refetch: fetchEmissionData, fetchTestSchedules };
};
