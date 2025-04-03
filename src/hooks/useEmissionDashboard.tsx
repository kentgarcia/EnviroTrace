
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
  isLoading: boolean;
}

export function useEmissionDashboard(selectedYear: number) {
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
    isLoading: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch vehicles count by engine type
        const { data: engineTypeStats, error: engineTypeError } = await supabase
          .from('vehicles')
          .select('engine_type, count')
          .group('engine_type');
        
        if (engineTypeError) throw engineTypeError;
        
        // Fetch vehicles count by wheel type
        const { data: wheelTypeStats, error: wheelTypeError } = await supabase
          .from('vehicles')
          .select('wheels, count')
          .group('wheels');
        
        if (wheelTypeError) throw wheelTypeError;

        // Fetch quarterly test results for year
        const { data: testResults, error: testResultsError } = await supabase
          .from('emission_tests')
          .select(`
            quarter,
            result,
            count
          `)
          .eq('year', selectedYear)
          .group('quarter, result');
        
        if (testResultsError) throw testResultsError;

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
        const { data: complianceData, error: complianceError } = await supabase
          .from('vehicles')
          .select(`
            office_name,
            id,
            emission_tests!inner(result, year)
          `)
          .eq('emission_tests.year', selectedYear);
        
        if (complianceError) throw complianceError;

        // Process data for charts
        const processedEngineTypeData = engineTypeStats?.map(stat => ({
          name: stat.engine_type,
          value: parseInt(stat.count)
        })) || [];
        
        const processedVehicleTypeData = wheelTypeStats?.map(stat => ({
          name: `${stat.wheels}-wheel`,
          value: parseInt(stat.count)
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
              quarters[quarterIndex].passed = parseInt(result.count);
            } else {
              quarters[quarterIndex].failed = parseInt(result.count);
            }
            quarters[quarterIndex].total = quarters[quarterIndex].passed + quarters[quarterIndex].failed;
          });
        }

        // Process compliance by office
        const officeComplianceMap = new Map<string, { pass: number, fail: number, total: number }>();
        
        if (complianceData && complianceData.length > 0) {
          complianceData.forEach((item: any) => {
            const officeName = item.office_name;
            const testResult = item.emission_tests[0]?.result;
            
            if (!officeComplianceMap.has(officeName)) {
              officeComplianceMap.set(officeName, { pass: 0, fail: 0, total: 0 });
            }
            
            const stats = officeComplianceMap.get(officeName)!;
            if (testResult) {
              stats.pass += 1;
            } else {
              stats.fail += 1;
            }
            stats.total += 1;
          });
        }
        
        const officeComplianceData = Array.from(officeComplianceMap.entries()).map(([name, stats]) => ({
          name,
          pass: stats.pass,
          fail: stats.fail,
          rate: stats.total > 0 ? Math.round((stats.pass / stats.total) * 100) : 0
        }));

        // Calculate totals
        const totalVehicles = processedEngineTypeData.reduce((sum, item) => sum + item.value, 0);
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
  }, [selectedYear]);

  return dashboardData;
}
