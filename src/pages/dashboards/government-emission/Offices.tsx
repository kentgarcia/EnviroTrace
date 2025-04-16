import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, AlertTriangle } from "lucide-react";
import { OfficeComplianceTableWrapper } from "@/components/dashboards/government-emission/OfficeComplianceTableWrapper";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";

export default function OfficesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [complianceData, setComplianceData] = useState([]);
  const [isComplianceLoading, setIsComplianceLoading] = useState(true);
  const [complianceError, setComplianceError] = useState(null);

  // Get current year and quarter
  const currentYear = 2025;
  const currentQuarter = 2;

  useEffect(() => {
    async function fetchCompliance() {
      setIsComplianceLoading(true);
      setComplianceError(null);
      try {
        // Fetch all vehicles
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('id, office_name');
        if (vehiclesError) throw vehiclesError;
        // Group vehicles by office_name
        const officeMap = new Map();
        vehicles.forEach(v => {
          if (!officeMap.has(v.office_name)) {
            officeMap.set(v.office_name, []);
          }
          officeMap.get(v.office_name).push(v.id);
        });
        // Fetch emission tests for current year/quarter
        const { data: tests, error: testsError } = await supabase
          .from('emission_tests')
          .select('vehicle_id, result')
          .eq('year', currentYear)
          .eq('quarter', currentQuarter);
        if (testsError) throw testsError;
        // Map vehicle_id to test result
        const testMap = new Map();
        tests.forEach(t => {
          testMap.set(t.vehicle_id, t.result);
        });
        // Build compliance data
        const complianceArr = Array.from(officeMap.entries()).map(([officeName, vehicleIds]) => {
          const vehicleCount = vehicleIds.length;
          let testedCount = 0;
          let passedCount = 0;
          vehicleIds.forEach(id => {
            if (testMap.has(id)) {
              testedCount++;
              if (testMap.get(id)) passedCount++;
            }
          });
          return {
            officeName,
            vehicleCount,
            testedCount,
            passedCount,
            complianceRate: vehicleCount > 0 ? Math.round((passedCount / vehicleCount) * 100) : 0,
          };
        });
        setComplianceData(complianceArr);
      } catch (err) {
        setComplianceError(err.message || 'Failed to load compliance data');
      } finally {
        setIsComplianceLoading(false);
      }
    }
    fetchCompliance();
  }, []);

  const { data: vehicles, isLoading, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('office_name', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });

  // Get unique offices from vehicles
  const uniqueOffices = vehicles
    ? Array.from(
        vehicles.reduce((map, v) => {
          if (!map.has(v.office_name)) {
            map.set(v.office_name, v);
          }
          return map;
        }, new Map())
      ).map(([_, v]) => v)
    : [];

  const filteredOffices = uniqueOffices.filter((office) =>
    office.office_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="government-emission" />
        <div className="flex-1 overflow-auto">
          <DashboardNavbar />
          <div className="p-6">
            <header className="mb-8">
              <h1 className="text-3xl font-semibold">Offices & Departments</h1>
              <p className="text-muted-foreground">List of offices and departments from vehicles</p>
            </header>
            <main className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card className="xl:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Office & Department Compliance</CardTitle>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search offices..."
                        className="w-[200px] pl-8 md:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isComplianceLoading ? (
                    <SkeletonTable rows={5} columns={4} />
                  ) : complianceError ? (
                    <div className="rounded-md bg-red-50 p-4 my-4">
                      <div className="flex">
                        <div className="text-red-700">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Error loading compliance data</h3>
                          <div className="mt-2 text-sm text-red-700">{complianceError}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <OfficeComplianceTableWrapper
                      complianceData={complianceData}
                      loading={isComplianceLoading}
                    />
                  )}
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
