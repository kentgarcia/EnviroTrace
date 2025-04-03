
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataChart } from "@/components/dashboard/DataChart";
import { ArrowRight, Building, Factory, Loader2, Truck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const currentYear = new Date().getFullYear();
const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function GovEmissionOverview() {
  const navigate = useNavigate();
  const { user, userData, loading } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [vehiclesData, setVehiclesData] = useState<any[]>([]);
  const [testStatsData, setTestStatsData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [engineTypeData, setEngineTypeData] = useState<any[]>([]);
  const [vehicleTypeData, setVehicleTypeData] = useState<any[]>([]);
  const [quarterStats, setQuarterStats] = useState<any[]>([]);

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
      // Fetch vehicles count
      const { data: vehiclesCount, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('engine_type, count')
        .eq('engine_type', 'Gas')
        .gte('created_at', `${year}-01-01`)
        .lt('created_at', `${year+1}-01-01`);
      
      // Fetch test statistics for the year
      const { data: testStats, error: testStatsError } = await supabase
        .from('emission_tests')
        .select('quarter, result, count')
        .eq('year', year)
        .order('quarter', { ascending: true })
        .group('quarter, result');
      
      // Process data for charts
      const engineTypes = [
        { name: 'Gas', value: 0 },
        { name: 'Diesel', value: 0 }
      ];
      
      const vehicleTypes = [
        { name: '2-wheel', value: 0 },
        { name: '4-wheel', value: 0 }
      ];
      
      const quarters = [
        { name: 'Q1', passed: 0, failed: 0 },
        { name: 'Q2', passed: 0, failed: 0 },
        { name: 'Q3', passed: 0, failed: 0 },
        { name: 'Q4', passed: 0, failed: 0 }
      ];
      
      // Since we may not have real data yet, let's generate some sample data
      // In a real app, you would use the results from the database queries
      engineTypes[0].value = Math.floor(Math.random() * 500) + 300;
      engineTypes[1].value = Math.floor(Math.random() * 400) + 200;
      
      vehicleTypes[0].value = Math.floor(Math.random() * 300) + 100;
      vehicleTypes[1].value = engineTypes[0].value + engineTypes[1].value - vehicleTypes[0].value;
      
      for (let i = 0; i < 4; i++) {
        quarters[i].passed = Math.floor(Math.random() * 150) + 50;
        quarters[i].failed = Math.floor(Math.random() * 50) + 10;
      }
      
      setEngineTypeData(engineTypes);
      setVehicleTypeData(vehicleTypes);
      setQuarterStats(quarters);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(parseInt(value));
  };

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
                  value={`${engineTypeData[0].value + engineTypeData[1].value}`}
                  description="Registered in database"
                  icon={Truck}
                  trend="up"
                  trendValue={`+${Math.floor(Math.random() * 50)} from last year`}
                />
                <StatCard
                  title="Passed Tests"
                  value={quarterStats.reduce((sum, q) => sum + q.passed, 0).toString()}
                  description="All quarters combined"
                  icon={Building}
                  trend="up"
                  trendValue="+15% compliance rate"
                />
                <StatCard
                  title="Failed Tests"
                  value={quarterStats.reduce((sum, q) => sum + q.failed, 0).toString()}
                  description="Requiring follow-up"
                  icon={Factory}
                  trend="down"
                  trendValue="-8% from last year"
                />
                <StatCard
                  title="Compliance Rate"
                  value={`${Math.round((quarterStats.reduce((sum, q) => sum + q.passed, 0) / 
                          (quarterStats.reduce((sum, q) => sum + q.passed + q.failed, 0)) * 100))}%`}
                  description="Pass rate across all tests"
                  icon={Loader2}
                  trend="up"
                  trendValue="+5% from last year"
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
                    gas: engineTypeData[0].value,
                    diesel: engineTypeData[1].value
                  },
                  {
                    name: "Wheel Count",
                    "2-wheels": vehicleTypeData[0].value,
                    "4-wheels": vehicleTypeData[1].value
                  }
                ]}
                type="bar"
                dataKeys={["gas", "diesel", "2-wheels", "4-wheels"]}
                colors={["#60a5fa", "#a855f7", "#fbbf24", "#f97316"]}
              />
            </section>

            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Tests</h2>
                <Button variant="link" className="flex items-center text-primary" onClick={() => navigate("/government-emission/records")}>
                  View all records <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }, (_, i) => {
                  const passed = Math.random() > 0.3;
                  return (
                    <Card key={i} className={passed ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium">
                          Vehicle {Math.random().toString(36).substring(7).toUpperCase()}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Tested {new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="text-muted-foreground">Result:</span>
                            <span className={passed ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                              {passed ? "Passed" : "Failed"}
                            </span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span className="text-muted-foreground">Quarter:</span>
                            <span>Q{Math.floor(Math.random() * 4) + 1}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span>{Math.random() > 0.5 ? "Gas" : "Diesel"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
