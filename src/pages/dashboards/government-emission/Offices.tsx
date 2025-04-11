
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, FileDown, Eye, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { SkeletonTable } from "@/components/ui/skeleton-table";

type OfficeSummary = {
  office_name: string;
  total_vehicles: number;
  tested_vehicles: number;
  untested_vehicles: number;
  passed_vehicles: number;
  failed_vehicles: number;
  compliance_rate: number;
}

type OfficeVehicle = {
  id: string;
  plate_number: string;
  driver_name: string;
  vehicle_type: string;
  engine_type: string;
  wheels: number;
  latest_test_date: string | null;
  latest_test_result: boolean | null;
}

export default function OfficesPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString());
  const [quarterFilter, setQuarterFilter] = useState<string>("all");
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  
  // Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
  
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Generate available years (current year - 2 to current year + 2)
    const currentYear = new Date().getFullYear();
    setAvailableYears(Array.from({ length: 5 }, (_, i) => currentYear - 2 + i));
  }, []);

  // Fetch office summaries using react-query
  const fetchOfficeSummaries = async () => {
    try {
      // First, get all unique offices
      const { data: officesData, error: officesError } = await supabase
        .from('vehicles')
        .select('office_name')
        .order('office_name')
        .not('office_name', 'is', null);

      if (officesError) throw officesError;

      // Get unique office names
      const uniqueOffices = [...new Set(officesData.map(item => item.office_name))];
      
      const summaries: OfficeSummary[] = [];
      
      for (const office of uniqueOffices) {
        // Get all vehicles for this office
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('id')
          .eq('office_name', office);
          
        if (vehiclesError) throw vehiclesError;
        
        const totalVehicles = vehiclesData.length;
        const vehicleIds = vehiclesData.map(v => v.id);
        
        // Get test results for these vehicles in the selected year/quarter
        let testQuery = supabase
          .from('emission_tests')
          .select('vehicle_id,result');
          
        if (yearFilter !== "all") {
          testQuery = testQuery.eq('year', parseInt(yearFilter));
        }
        
        if (quarterFilter !== "all") {
          testQuery = testQuery.eq('quarter', parseInt(quarterFilter));
        }
        
        const { data: testsData, error: testsError } = await testQuery;
        
        if (testsError) throw testsError;
        
        // Get unique vehicles that have been tested (to avoid counting multiple tests for the same vehicle)
        const testedVehicleIds = [...new Set(testsData.map(t => t.vehicle_id))];
        const testedVehicles = testedVehicleIds.length;
        const untestedVehicles = totalVehicles - testedVehicles;
        
        // Count passed and failed tests
        const passedVehicles = testsData.filter(t => t.result === true).length;
        const failedVehicles = testsData.filter(t => t.result === false).length;
        
        // Calculate compliance rate
        const complianceRate = totalVehicles > 0 
          ? Math.round((passedVehicles / totalVehicles) * 100) 
          : 0;
          
        summaries.push({
          office_name: office,
          total_vehicles: totalVehicles,
          tested_vehicles: testedVehicles,
          untested_vehicles: untestedVehicles,
          passed_vehicles: passedVehicles,
          failed_vehicles: failedVehicles,
          compliance_rate: complianceRate
        });
      }
      
      return summaries;
    } catch (error) {
      console.error("Error fetching office summaries:", error);
      throw error;
    }
  };

  const { data: officeSummaries = [], isLoading: isLoadingOffices, error: officeError } = useQuery({
    queryKey: ['offices', yearFilter, quarterFilter],
    queryFn: fetchOfficeSummaries,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter offices based on debounced search query
  const filteredOffices = officeSummaries.filter(office => 
    office.office_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  // Fetch office vehicles using react-query
  const fetchOfficeVehicles = async (officeName: string) => {
    try {
      // Get all vehicles for this office with their latest test result
      const { data, error } = await supabase
        .from('vehicle_summary_view')
        .select('id,plate_number,driver_name,vehicle_type,engine_type,wheels,latest_test_date,latest_test_result')
        .eq('office_name', officeName)
        .order('plate_number');
        
      if (error) throw error;
      return data as OfficeVehicle[];
    } catch (error) {
      console.error("Error fetching office vehicles:", error);
      throw error;
    }
  };

  const { 
    data: officeVehicles = [], 
    isLoading: loadingVehicles,
    refetch: refetchVehicles
  } = useQuery({
    queryKey: ['office-vehicles', selectedOffice],
    queryFn: () => selectedOffice ? fetchOfficeVehicles(selectedOffice) : Promise.resolve([]),
    enabled: !!selectedOffice && viewModalOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleExportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    // Add CSV Headers
    csvContent += "Office Name,Total Vehicles,Tested Vehicles,Untested Vehicles,Passed Vehicles,Failed Vehicles,Compliance Rate\n";
    
    // Add data rows
    filteredOffices.forEach(office => {
      csvContent += `"${office.office_name}","${office.total_vehicles}","${office.tested_vehicles}","${office.untested_vehicles}","${office.passed_vehicles}","${office.failed_vehicles}","${office.compliance_rate}%"\n`;
    });

    // Create a download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `office_report_${yearFilter}_Q${quarterFilter === 'all' ? 'All' : quarterFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Office data exported successfully");
  };

  const handleViewOfficeVehicles = (officeName: string) => {
    setSelectedOffice(officeName);
    setViewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="government-emission" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNavbar />
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Office Summary</h1>
                <p className="text-muted-foreground">Emission test compliance by office</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportToCSV}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export to CSV
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Office Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by office name..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select
                    value={yearFilter}
                    onValueChange={setYearFilter}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={quarterFilter}
                    onValueChange={setQuarterFilter}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Quarters</SelectItem>
                      <SelectItem value="1">Q1</SelectItem>
                      <SelectItem value="2">Q2</SelectItem>
                      <SelectItem value="3">Q3</SelectItem>
                      <SelectItem value="4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  {isLoadingOffices ? (
                    <SkeletonTable rows={7} columns={8} />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Office Name</TableHead>
                          <TableHead>Total Vehicles</TableHead>
                          <TableHead>Tested</TableHead>
                          <TableHead>Untested</TableHead>
                          <TableHead>Passed</TableHead>
                          <TableHead>Failed</TableHead>
                          <TableHead>Compliance Rate</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {officeError ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-red-500">
                              Error loading data. Please try again later.
                            </TableCell>
                          </TableRow>
                        ) : filteredOffices.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              No offices found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredOffices.map((office) => (
                            <TableRow key={office.office_name}>
                              <TableCell className="font-medium">{office.office_name}</TableCell>
                              <TableCell>{office.total_vehicles}</TableCell>
                              <TableCell>{office.tested_vehicles}</TableCell>
                              <TableCell>{office.untested_vehicles}</TableCell>
                              <TableCell>{office.passed_vehicles}</TableCell>
                              <TableCell>{office.failed_vehicles}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Progress value={office.compliance_rate} className="h-2 w-20" />
                                  <span>{office.compliance_rate}%</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleViewOfficeVehicles(office.office_name)}
                                >
                                  <Eye className="mr-2 h-4 w-4" /> View Vehicles
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* View Office Vehicles Modal */}
            <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
              <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Vehicles for {selectedOffice}</DialogTitle>
                  <DialogDescription>
                    All vehicles registered under this office
                  </DialogDescription>
                </DialogHeader>
                {loadingVehicles ? (
                  <SkeletonTable rows={5} columns={7} />
                ) : (
                  <div className="rounded-md border mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plate Number</TableHead>
                          <TableHead>Driver</TableHead>
                          <TableHead>Vehicle Type</TableHead>
                          <TableHead>Engine Type</TableHead>
                          <TableHead>Wheels</TableHead>
                          <TableHead>Latest Test</TableHead>
                          <TableHead>Result</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {officeVehicles.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              No vehicles found for this office.
                            </TableCell>
                          </TableRow>
                        ) : (
                          officeVehicles.map((vehicle) => (
                            <TableRow key={vehicle.id}>
                              <TableCell className="font-medium">{vehicle.plate_number}</TableCell>
                              <TableCell>{vehicle.driver_name}</TableCell>
                              <TableCell>{vehicle.vehicle_type}</TableCell>
                              <TableCell>{vehicle.engine_type}</TableCell>
                              <TableCell>{vehicle.wheels}</TableCell>
                              <TableCell>
                                {vehicle.latest_test_date 
                                  ? format(new Date(vehicle.latest_test_date), 'MMM dd, yyyy') 
                                  : "Not tested"}
                              </TableCell>
                              <TableCell>
                                {vehicle.latest_test_result === null ? (
                                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Not tested
                                  </span>
                                ) : vehicle.latest_test_result ? (
                                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Passed
                                  </span>
                                ) : (
                                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Failed
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <DialogFooter>
                  <Button onClick={() => setViewModalOpen(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
