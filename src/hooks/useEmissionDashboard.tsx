
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DashboardData {
  engineTypeData: any[];
  vehicleTypeData: any[];
  quarterStats: any[];
  recentTests: any[];
  complianceByOffice: any[];
  totalVehicles: number;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  complianceRate: number;
  schedules: any[];
  isLoading: boolean;
}

export function useEmissionDashboard(selectedYear: number, selectedQuarter?: number) {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    engineTypeData: [],
    vehicleTypeData: [],
    quarterStats: [],
    recentTests: [],
    complianceByOffice: [],
    totalVehicles: 0,
    totalTests: 0,
    totalPassed: 0,
    totalFailed: 0,
    complianceRate: 0,
    schedules: [],
    isLoading: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch vehicles count by engine type
          const { data: engineTypes, error: engineTypesError } = await supabase
          .from('vehicles')
          .select('engine_type');
        
        if (engineTypesError) throw engineTypesError;
        
        // Process unique types with counts
        const engineTypeMap = {};
        engineTypes?.forEach(vehicle => {
          const type = vehicle.engine_type;
          engineTypeMap[type] = (engineTypeMap[type] || 0) + 1;
        });
        
        const engineTypeStats = Object.entries(engineTypeMap).map(([type, count]) => ({
          engine_type: type,
          count
        }));
        
        // Fetch vehicles count by wheel type
        const { data: wheelTypes, error: wheelTypeError } = await supabase
          .from('vehicles')
          .select('wheels');          
        
        if (wheelTypeError) throw wheelTypeError;

        const wheelTypeMap = {};
        wheelTypes?.forEach(vehicle => {
          const type = vehicle.wheels;
          wheelTypeMap[type] = (wheelTypeMap[type] || 0) + 1;
        });
        
        const wheelTypeStats = Object.entries(wheelTypeMap).map(([type, count]) => ({
          wheels: type,
          count
        }));

        // Fetch quarterly test results for year
        const { data: rawTestResults, error: testResultsError } = await supabase
        .from('emission_tests')
        .select(`
          quarter,
          result
        `) 
        .eq('year', selectedYear);    
        
        if (testResultsError) throw testResultsError;

        const testResultsMap = {};
        rawTestResults?.forEach(test => {
          const key = `${test.quarter}_${test.result ? 'pass' : 'fail'}`;
          testResultsMap[key] = (testResultsMap[key] || 0) + 1;
        });

        const testResults = [];
        for (let quarter = 1; quarter <= 4; quarter++) {
          const passKey = `${quarter}_pass`;
          const failKey = `${quarter}_fail`;
          
          if (testResultsMap[passKey]) {
            testResults.push({
              quarter,
              result: true,
              count: testResultsMap[passKey]
            });
          }
          
          if (testResultsMap[failKey]) {
            testResults.push({
              quarter,
              result: false,
              count: testResultsMap[failKey]
            });
          }
        }

        // Fetch recent tests with vehicle data
        const { data: recentTestsData, error: recentTestsError } = await supabase
          .from('emission_tests')
          .select(`
            *,
            vehicle:vehicles(*)
          `)
          .order('test_date', { ascending: false })
          .limit(5);
        
        if (recentTestsError) throw recentTestsError;

        // Fetch compliance by office
        let complianceQuery = supabase
          .from('vehicles')
          .select(`
            office_name,
            id,
            emission_tests!inner(result, year, quarter)
          `)
          .eq('emission_tests.year', selectedYear);
          
        if (selectedQuarter) {
          complianceQuery = complianceQuery.eq('emission_tests.quarter', selectedQuarter);
        }
        
        const { data: complianceData, error: complianceError } = await complianceQuery;
        
        if (complianceError) throw complianceError;

        // Fetch test schedules
        const { data: schedulesData, error: schedulesError } = await supabase
          .from('emission_test_schedules')
          .select('*')
          .eq('year', selectedYear)
          .order('quarter');
        
        if (schedulesError) throw schedulesError;

        // Process data for charts
        const processedEngineTypeData = engineTypeStats?.map(stat => ({
          name: stat.engine_type,
          value: stat.count
        })) || [];
        
        const processedVehicleTypeData = wheelTypeStats?.map(stat => ({
          name: `${stat.wheels}-wheel`,
          value: stat.count
        })) || [];
        
        // Process quarterly test results
        const quarters = [
          { name: 'Q1', passed: 0, failed: 0, total: 0 },
          { name: 'Q2', passed: 0, failed: 0, total: 0 },
          { name: 'Q3', passed: 0, failed: 0, total: 0 },
          { name: 'Q4', passed: 0, failed: 0, total: 0 }
        ];
        
        if (testResults && testResults.length > 0) {
          testResults.forEach((result: any) => {
            const quarterIndex = result.quarter - 1;
            if (result.result) {
              quarters[quarterIndex].passed = result.count;
            } else {
              quarters[quarterIndex].failed = result.count;
            }
            quarters[quarterIndex].total = quarters[quarterIndex].passed + quarters[quarterIndex].failed;
          });
        }

        // Process compliance by office
        const officeComplianceMap = new Map<string, { pass: number, fail: number, total: number }>();
        
        if (complianceData && complianceData.length > 0) {
          complianceData.forEach((item: any) => {
            const officeName = item.office_name;
            
            if (!officeComplianceMap.has(officeName)) {
              officeComplianceMap.set(officeName, { pass: 0, fail: 0, total: 0 });
            }
            
            item.emission_tests.forEach((test: any) => {
              const stats = officeComplianceMap.get(officeName)!;
              if (test.result) {
                stats.pass += 1;
              } else {
                stats.fail += 1;
              }
              stats.total += 1;
            });
          });
        }
        
        const officeComplianceData = Array.from(officeComplianceMap.entries()).map(([name, stats]) => ({
          name,
          pass: stats.pass,
          fail: stats.fail,
          rate: stats.total > 0 ? Math.round((stats.pass / stats.total) * 100) : 0
        }));

        // Calculate totals
        const totalVehicles = processedEngineTypeData.reduce((sum, item) => sum + Number(item.value), 0);
        const totalTests = quarters.reduce((sum, q) => sum + q.passed + q.failed, 0);
        const totalPassed = quarters.reduce((sum, q) => sum + q.passed, 0);
        const totalFailed = quarters.reduce((sum, q) => sum + q.failed, 0);
        const complianceRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
        
        // Update state with fetched data
        setDashboardData({
          engineTypeData: processedEngineTypeData,
          vehicleTypeData: processedVehicleTypeData,
          quarterStats: quarters,
          recentTests: recentTestsData || [],
          complianceByOffice: officeComplianceData,
          totalVehicles,
          totalTests,
          totalPassed,
          totalFailed,
          complianceRate,
          schedules: schedulesData || [],
          isLoading: false
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
        setDashboardData(prev => ({...prev, isLoading: false}));
      }
    };

    setDashboardData(prev => ({...prev, isLoading: true}));
    fetchDashboardData();

    // Set up realtime subscriptions for dashboard updates
    const emissionTestsChannel = supabase
      .channel('emission-tests-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'emission_tests',
        filter: `year=eq.${selectedYear}` + (selectedQuarter ? `,quarter=eq.${selectedQuarter}` : '')
      }, () => {
        // Refetch data when changes occur
        fetchDashboardData();
      })
      .subscribe();

    const vehiclesChannel = supabase
      .channel('vehicles-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'vehicles'
      }, () => {
        // Refetch data when vehicle data changes
        fetchDashboardData();
      })
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(emissionTestsChannel);
      supabase.removeChannel(vehiclesChannel);
    };
  }, [selectedYear, selectedQuarter]);

  return dashboardData;
}
