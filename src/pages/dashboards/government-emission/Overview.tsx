
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataChart } from "@/components/dashboard/DataChart";
import { ArrowRight, Building, Factory, Loader2, Search, Truck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const currentYear = new Date().getFullYear();
const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function GovEmissionOverview() {
  const navigate = useNavigate();
  const { user, userData, loading } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [engineTypeData, setEngineTypeData] = useState<any[]>([]);
  const [vehicleTypeData, setVehicleTypeData] = useState<any[]>([]);
  const [quarterStats, setQuarterStats] = useState<any[]>([]);
  const [recentTests, setRecentTests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [complianceByOffice, setComplianceByOffice] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    } else if (user && userData && 
              !userData.roles.includes('admin') && 
              !userData.roles.includes('government-emission')) {
      navigate("/dashboard-selection");
      toast.error("You don't have access to this dashboard");
    } else if (!loading && user) {
      fetchDashboardData(selectedYear);
    }
  }, [user, userData, loading, navigate, selectedYear]);

  const fetchDashboardData = async (year: number) => {
    setIsLoadingData(true);
    
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
        .eq('year', year)
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
        .eq('emission_tests.year', year);
      
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
      
      // Update state with fetched data
      setEngineTypeData(processedEngineTypeData);
      setVehicleTypeData(processedVehicleTypeData);
      setQuarterStats(quarters);
      setRecentTests(recentTestsData || []);
      setComplianceByOffice(officeComplianceData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(parseInt(value));
  };

  // Filter recent tests by search term
  const filteredRecentTests = recentTests.filter(test => 
    test.vehicle?.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.vehicle?.office_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totalVehicles = engineTypeData.reduce((sum, item) => sum + item.value, 0);
  const totalTests = quarterStats.reduce((sum, q) => sum + q.passed + q.failed, 0);
  const totalPassed = quarterStats.reduce((sum, q) => sum + q.passed, 0);
  const totalFailed = quarterStats.reduce((sum, q) => sum + q.failed, 0);
  const complianceRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="government-emission" />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <header className="mb-8 flex flex-wrap justify-between items-center">
              <div>
                <h1 className="text-3xl font-semibold">Government Emission Dashboard</h1>
                <p className="text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </header>

            <section>
              <h2 className="text-xl font-semibold mb-4">Emission Overview ({selectedYear})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  title="Total Vehicles"
                  value={totalVehicles.toString()}
                  description="Registered in database"
                  icon={Truck}
                  trend="up"
                  trendValue={`${totalVehicles} total vehicles`}
                />
                <StatCard
                  title="Passed Tests"
                  value={totalPassed.toString()}
                  description="All quarters combined"
                  icon={Building}
                  trend="up"
                  trendValue={`${totalPassed} passed tests`}
                />
                <StatCard
                  title="Failed Tests"
                  value={totalFailed.toString()}
                  description="Requiring follow-up"
                  icon={Factory}
                  trend={totalFailed > 0 ? "down" : "up"}
                  trendValue={`${totalFailed} failed tests`}
                />
                <StatCard
                  title="Compliance Rate"
                  value={`${complianceRate}%`}
                  description="Pass rate across all tests"
                  icon={Loader2}
                  trend={complianceRate >= 90 ? "up" : "down"}
                  trendValue={`${complianceRate}% compliance rate`}
                />
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <DataChart
                title="Quarterly Emission Test Results"
                description={`${selectedYear} test results by quarter`}
                data={quarterStats}
                type="bar"
                dataKeys={["passed", "failed"]}
                colors={["#4ade80", "#f87171"]}
              />
              <DataChart
                title="Vehicle Distribution"
                description="By engine type and wheel count"
                data={[
                  {
                    name: "Engine Type",
                    gas: engineTypeData.find(item => item.name === "Gas")?.value || 0,
                    diesel: engineTypeData.find(item => item.name === "Diesel")?.value || 0
                  },
                  {
                    name: "Wheel Count",
                    "2-wheels": vehicleTypeData.find(item => item.name === "2-wheel")?.value || 0,
                    "4-wheels": vehicleTypeData.find(item => item.name === "4-wheel")?.value || 0
                  }
                ]}
                type="bar"
                dataKeys={["gas", "diesel", "2-wheels", "4-wheels"]}
                colors={["#60a5fa", "#a855f7", "#fbbf24", "#f97316"]}
              />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Compliance by Office</CardTitle>
                  </div>
                  <CardDescription>Pass rate by office for {selectedYear}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Office</TableHead>
                          <TableHead>Passed</TableHead>
                          <TableHead>Failed</TableHead>
                          <TableHead>Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {complianceByOffice.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4">
                              No data available for {selectedYear}
                            </TableCell>
                          </TableRow>
                        ) : (
                          complianceByOffice.map((office, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{office.name}</TableCell>
                              <TableCell>{office.pass}</TableCell>
                              <TableCell>{office.fail}</TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    office.rate >= 90
                                      ? "bg-green-100 text-green-800"
                                      : office.rate >= 70
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {office.rate}%
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Test History Trends</CardTitle>
                  </div>
                  <CardDescription>Pass/fail trends by quarter</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataChart
                    title=""
                    description=""
                    data={quarterStats}
                    type="line"
                    dataKeys={["passed", "failed", "total"]}
                    colors={["#4ade80", "#f87171", "#94a3b8"]}
                  />
                </CardContent>
              </Card>
            </section>

            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Tests</h2>
                <div className="flex gap-4">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search plate or office"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    variant="default" 
                    className="flex items-center" 
                    onClick={() => navigate("/government-emission/records")}
                  >
                    View all records <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Plate Number</TableHead>
                      <TableHead>Office</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Engine</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecentTests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No recent tests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecentTests.map((test) => (
                        <TableRow key={test.id}>
                          <TableCell>
                            {new Date(test.test_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            {test.vehicle?.plate_number}
                          </TableCell>
                          <TableCell>{test.vehicle?.office_name}</TableCell>
                          <TableCell>{test.vehicle?.vehicle_type}</TableCell>
                          <TableCell>{test.vehicle?.engine_type}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                test.result
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {test.result ? "Pass" : "Fail"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
