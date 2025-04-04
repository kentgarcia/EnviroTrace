
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
import { 
  Download, 
  FileDown, 
  Plus, 
  Search, 
  Eye, 
  Edit,
  ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Vehicle = {
  id: string;
  plate_number: string;
  office_name: string;
  driver_name: string;
  vehicle_type: string;
  engine_type: string;
  wheels: number;
  contact_number: string;
  latest_test_date: string | null;
  latest_test_result: boolean | null;
}

export default function VehiclesPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("all");
  const [engineTypeFilter, setEngineTypeFilter] = useState<string>("all");
  const [wheelsFilter, setWheelsFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [engineTypes, setEngineTypes] = useState<string[]>([]);
  const [wheelCounts, setWheelCounts] = useState<number[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('vehicle_summary_view')
        .select('*')
        .order('plate_number', { ascending: true });

      if (error) {
        console.error("Error fetching vehicles:", error);
        toast.error("Failed to load vehicles data");
        setIsLoading(false);
        return;
      }

      setVehicles(data as Vehicle[]);
      setFilteredVehicles(data as Vehicle[]);
      
      // Extract unique values for filters
      const types = Array.from(new Set(data.map(v => v.vehicle_type)));
      const engines = Array.from(new Set(data.map(v => v.engine_type)));
      const wheels = Array.from(new Set(data.map(v => v.wheels)));
      
      setVehicleTypes(types);
      setEngineTypes(engines);
      setWheelCounts(wheels);
      
      setIsLoading(false);
    };

    fetchVehicles();

    // Set up real-time changes listener
    const subscription = supabase
      .channel('vehicle_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'vehicles' 
      }, () => {
        fetchVehicles();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Filter vehicles based on search query and filter types
    const filtered = vehicles.filter(vehicle => {
      // Search matching
      const matchesSearch = 
        vehicle.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.office_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filtering
      const matchesStatus = 
        statusFilter === "all" ? true :
        statusFilter === "passed" ? vehicle.latest_test_result === true :
        statusFilter === "failed" ? vehicle.latest_test_result === false :
        vehicle.latest_test_result === null;
      
      // Vehicle type filtering
      const matchesVehicleType = 
        vehicleTypeFilter === "all" ? true :
        vehicle.vehicle_type === vehicleTypeFilter;
      
      // Engine type filtering
      const matchesEngineType = 
        engineTypeFilter === "all" ? true :
        vehicle.engine_type === engineTypeFilter;
      
      // Wheels filtering
      const matchesWheels = 
        wheelsFilter === "all" ? true :
        vehicle.wheels === parseInt(wheelsFilter);
      
      return matchesSearch && matchesStatus && matchesVehicleType && matchesEngineType && matchesWheels;
    });

    setFilteredVehicles(filtered);
  }, [searchQuery, statusFilter, vehicleTypeFilter, engineTypeFilter, wheelsFilter, vehicles]);

  const handleExportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    // Add CSV Headers
    csvContent += "Plate Number,Office,Driver,Vehicle Type,Engine Type,Wheels,Contact,Latest Test,Test Result\n";
    
    // Add data rows
    filteredVehicles.forEach(vehicle => {
      const testDate = vehicle.latest_test_date 
        ? format(new Date(vehicle.latest_test_date), 'MMM dd, yyyy')
        : "Not Tested";
        
      const testResult = vehicle.latest_test_result === null
        ? "Not Tested"
        : vehicle.latest_test_result
          ? "Passed"
          : "Failed";

      csvContent += `"${vehicle.plate_number}","${vehicle.office_name}","${vehicle.driver_name}","${vehicle.vehicle_type}","${vehicle.engine_type}","${vehicle.wheels}","${vehicle.contact_number}","${testDate}","${testResult}"\n`;
    });

    // Create a download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vehicles_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Vehicle data exported successfully");
  };

  const handleViewDetails = (id: string) => {
    toast.info(`Viewing details for vehicle: ${id}`);
    // Implement view details functionality
  };

  const handleEditVehicle = (id: string) => {
    toast.info(`Editing vehicle: ${id}`);
    // Implement edit vehicle functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
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
                <h1 className="text-2xl font-bold">Vehicles Database</h1>
                <p className="text-muted-foreground">Manage and view all vehicles in the system</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportToCSV}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export to CSV
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vehicle
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Vehicles List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by plate number, driver, or office..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Test Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="passed">Passed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="untested">Not Tested</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={vehicleTypeFilter}
                    onValueChange={setVehicleTypeFilter}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Vehicle Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {vehicleTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={engineTypeFilter}
                    onValueChange={setEngineTypeFilter}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Engine Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Engines</SelectItem>
                      {engineTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={wheelsFilter}
                    onValueChange={setWheelsFilter}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Wheels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Wheels</SelectItem>
                      {wheelCounts.map(count => (
                        <SelectItem key={count} value={count.toString()}>{count} Wheels</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plate Number</TableHead>
                        <TableHead>Office</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Vehicle Type</TableHead>
                        <TableHead>Engine Type</TableHead>
                        <TableHead>Latest Test</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex justify-center">
                              <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredVehicles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            No vehicles found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredVehicles.map((vehicle) => (
                          <TableRow key={vehicle.id}>
                            <TableCell className="font-medium">{vehicle.plate_number}</TableCell>
                            <TableCell>{vehicle.office_name}</TableCell>
                            <TableCell>{vehicle.driver_name}</TableCell>
                            <TableCell>{vehicle.vehicle_type}</TableCell>
                            <TableCell>{vehicle.engine_type}</TableCell>
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
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    Actions <ChevronDown className="ml-1 h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewDetails(vehicle.id)}>
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditVehicle(vehicle.id)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit Vehicle
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
