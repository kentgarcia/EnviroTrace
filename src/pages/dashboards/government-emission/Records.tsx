
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";

// Current year for default filters
const currentYear = new Date().getFullYear();
const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);
const quarters = [1, 2, 3, 4];

interface Vehicle {
  id: string;
  plate_number: string;
  office_name: string;
  wheels: number;
  engine_type: string;
  driver_name: string;
  vehicle_type: string;
  contact_number: string | null;
}

interface EmissionTest {
  id: string;
  vehicle_id: string;
  year: number;
  quarter: number;
  test_date: string;
  result: boolean;
  created_at: string;
  created_by: string | null;
  vehicle?: Vehicle;
}

interface VehicleWithTests extends Vehicle {
  emission_tests: EmissionTest[];
}

export default function GovernmentEmissionRecords() {
  const navigate = useNavigate();
  const { user, userData, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("vehicles");
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Filters
  const [yearFilter, setYearFilter] = useState<string>(currentYear.toString());
  const [quarterFilter, setQuarterFilter] = useState<string>("");
  const [engineTypeFilter, setEngineTypeFilter] = useState<string>("");
  const [wheelsFilter, setWheelsFilter] = useState<string>("");
  const [resultFilter, setResultFilter] = useState<string>("");
  
  // Data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tests, setTests] = useState<EmissionTest[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithTests | null>(null);
  
  // Add/Edit vehicle dialog state
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [plateNumber, setPlateNumber] = useState("");
  const [officeName, setOfficeName] = useState("");
  const [wheels, setWheels] = useState<string>("4");
  const [engineType, setEngineType] = useState<string>("Gas");
  const [driverName, setDriverName] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  
  // Test dialog state
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testVehicle, setTestVehicle] = useState<Vehicle | null>(null);
  const [testYear, setTestYear] = useState<string>(currentYear.toString());
  const [testQuarter, setTestQuarter] = useState<string>("1");
  const [testDate, setTestDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [testResult, setTestResult] = useState<string>("true");
  
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    } else if (user && userData && 
              !userData.roles.includes('admin') && 
              !userData.roles.includes('government-emission')) {
      navigate("/dashboard-selection");
      toast.error("You don't have access to this dashboard");
    } else if (!loading && user) {
      fetchData();
    }
  }, [user, userData, loading, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .order('plate_number');
      
      if (vehiclesError) throw vehiclesError;
      
      // Fetch emission tests
      const { data: testsData, error: testsError } = await supabase
        .from('emission_tests')
        .select(`
          *,
          vehicle:vehicles(*)
        `)
        .order('test_date', { ascending: false });
      
      if (testsError) throw testsError;
      
      setVehicles(vehiclesData);
      setTests(testsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setIsEditing(false);
    setPlateNumber("");
    setOfficeName("");
    setWheels("4");
    setEngineType("Gas");
    setDriverName("");
    setVehicleType("");
    setContactNumber("");
    setVehicleDialogOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setIsEditing(true);
    setPlateNumber(vehicle.plate_number);
    setOfficeName(vehicle.office_name);
    setWheels(vehicle.wheels.toString());
    setEngineType(vehicle.engine_type);
    setDriverName(vehicle.driver_name);
    setVehicleType(vehicle.vehicle_type);
    setContactNumber(vehicle.contact_number || "");
    setSelectedVehicle(vehicle as VehicleWithTests);
    setVehicleDialogOpen(true);
  };

  const handleSaveVehicle = async () => {
    if (!plateNumber || !officeName || !driverName || !vehicleType) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (isEditing && selectedVehicle) {
        // Update existing vehicle
        const { error } = await supabase
          .from('vehicles')
          .update({
            plate_number: plateNumber,
            office_name: officeName,
            wheels: parseInt(wheels),
            engine_type: engineType,
            driver_name: driverName,
            vehicle_type: vehicleType,
            contact_number: contactNumber || null,
          })
          .eq('id', selectedVehicle.id);
        
        if (error) throw error;
        toast.success("Vehicle updated successfully");
      } else {
        // Add new vehicle
        const { error } = await supabase
          .from('vehicles')
          .insert({
            plate_number: plateNumber,
            office_name: officeName,
            wheels: parseInt(wheels),
            engine_type: engineType,
            driver_name: driverName,
            vehicle_type: vehicleType,
            contact_number: contactNumber || null,
          });
        
        if (error) throw error;
        toast.success("Vehicle added successfully");
      }
      
      setVehicleDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      
      if (error.code === '23505') {
        toast.error("A vehicle with this plate number already exists");
      } else {
        toast.error("Failed to save vehicle");
      }
    }
  };

  const handleAddTest = (vehicle: Vehicle) => {
    setTestVehicle(vehicle);
    setTestYear(currentYear.toString());
    setTestQuarter("1");
    setTestDate(new Date().toISOString().split("T")[0]);
    setTestResult("true");
    setTestDialogOpen(true);
  };

  const handleSaveTest = async () => {
    if (!testVehicle) return;
    
    try {
      // Check if test for this vehicle, year and quarter already exists
      const { data: existingTests, error: checkError } = await supabase
        .from('emission_tests')
        .select('*')
        .eq('vehicle_id', testVehicle.id)
        .eq('year', parseInt(testYear))
        .eq('quarter', parseInt(testQuarter));
      
      if (checkError) throw checkError;
      
      if (existingTests && existingTests.length > 0) {
        // Update existing test
        const { error } = await supabase
          .from('emission_tests')
          .update({
            test_date: testDate,
            result: testResult === "true",
          })
          .eq('id', existingTests[0].id);
        
        if (error) throw error;
        toast.success("Test updated successfully");
      } else {
        // Add new test
        const { error } = await supabase
          .from('emission_tests')
          .insert({
            vehicle_id: testVehicle.id,
            year: parseInt(testYear),
            quarter: parseInt(testQuarter),
            test_date: testDate,
            result: testResult === "true",
          });
        
        if (error) throw error;
        toast.success("Test added successfully");
      }
      
      setTestDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving test:', error);
      toast.error("Failed to save test");
    }
  };

  const handleViewVehicleHistory = async (vehicle: Vehicle) => {
    try {
      setIsLoading(true);
      
      // Fetch all tests for this vehicle
      const { data, error } = await supabase
        .from('emission_tests')
        .select('*')
        .eq('vehicle_id', vehicle.id)
        .order('year', { ascending: false })
        .order('quarter', { ascending: false });
      
      if (error) throw error;
      
      const vehicleWithTests: VehicleWithTests = {
        ...vehicle,
        emission_tests: data || [],
      };
      
      setSelectedVehicle(vehicleWithTests);
      setActiveTab("history");
    } catch (error) {
      console.error('Error fetching vehicle history:', error);
      toast.error("Failed to load vehicle history");
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    // In a real app, this would generate a CSV or Excel file
    toast.info("Export functionality would be implemented here");
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.office_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driver_name.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesEngineType = !engineTypeFilter || vehicle.engine_type === engineTypeFilter;
    const matchesWheels = !wheelsFilter || vehicle.wheels.toString() === wheelsFilter;
    
    return matchesSearch && matchesEngineType && matchesWheels;
  });

  // Filter tests
  const filteredTests = tests.filter(test => {
    if (!test.vehicle) return false;
    
    const matchesSearch = 
      test.vehicle.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.vehicle.office_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.vehicle.driver_name.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesYear = !yearFilter || test.year.toString() === yearFilter;
    const matchesQuarter = !quarterFilter || test.quarter.toString() === quarterFilter;
    const matchesResult = resultFilter === "" || 
      (resultFilter === "pass" && test.result) || 
      (resultFilter === "fail" && !test.result);
    const matchesEngineType = !engineTypeFilter || test.vehicle.engine_type === engineTypeFilter;
    const matchesWheels = !wheelsFilter || test.vehicle.wheels.toString() === wheelsFilter;
    
    return matchesSearch && matchesYear && matchesQuarter && matchesResult && 
           matchesEngineType && matchesWheels;
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="government-emission" />
        <div className="flex-1 overflow-auto">
          <DashboardNavbar />
          <div className="p-6">
            <header className="mb-8">
              <h1 className="text-3xl font-semibold">Emission Records</h1>
              <p className="text-muted-foreground">
                Manage vehicle records and emission tests
              </p>
            </header>
            
            <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative w-full sm:w-2/3 md:w-1/2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by plate number, office, or driver..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              
              <div className="flex gap-2">
                <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Filter Records</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="yearFilter">Year</Label>
                        <Select 
                          value={yearFilter} 
                          onValueChange={setYearFilter}
                        >
                          <SelectTrigger id="yearFilter">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="year">Any Year</SelectItem>
                            {availableYears.map(year => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="quarterFilter">Quarter</Label>
                        <Select 
                          value={quarterFilter} 
                          onValueChange={setQuarterFilter}
                        >
                          <SelectTrigger id="quarterFilter">
                            <SelectValue placeholder="Select quarter" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quarter">Any Quarter</SelectItem>
                            {quarters.map(quarter => (
                              <SelectItem key={quarter} value={quarter.toString()}>
                                Quarter {quarter}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="engineTypeFilter">Engine Type</Label>
                        <Select 
                          value={engineTypeFilter} 
                          onValueChange={setEngineTypeFilter}
                        >
                          <SelectTrigger id="engineTypeFilter">
                            <SelectValue placeholder="Select engine type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Any">Any Type</SelectItem>
                            <SelectItem value="Gas">Gas</SelectItem>
                            <SelectItem value="Diesel">Diesel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="wheelsFilter">Wheels</Label>
                        <Select 
                          value={wheelsFilter} 
                          onValueChange={setWheelsFilter}
                        >
                          <SelectTrigger id="wheelsFilter">
                            <SelectValue placeholder="Select wheels" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Any">Any</SelectItem>
                            <SelectItem value="2">2 Wheels</SelectItem>
                            <SelectItem value="4">4 Wheels</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="resultFilter">Test Result</Label>
                        <Select 
                          value={resultFilter} 
                          onValueChange={setResultFilter}
                        >
                          <SelectTrigger id="resultFilter">
                            <SelectValue placeholder="Select result" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Result</SelectItem>
                            <SelectItem value="pass">Pass</SelectItem>
                            <SelectItem value="fail">Fail</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex justify-between pt-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setYearFilter("");
                            setQuarterFilter("");
                            setEngineTypeFilter("");
                            setWheelsFilter("");
                            setResultFilter("");
                          }}
                        >
                          Reset
                        </Button>
                        <Button onClick={() => setFilterOpen(false)}>
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={exportData}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Export
                </Button>
                
                <Button onClick={handleAddVehicle}>
                  Add Vehicle
                </Button>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                <TabsTrigger value="tests">Emission Tests</TabsTrigger>
                {selectedVehicle && (
                  <TabsTrigger value="history">
                    Vehicle History
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="vehicles" className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plate Number</TableHead>
                      <TableHead>Office</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Wheels</TableHead>
                      <TableHead>Engine</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                          No vehicles found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVehicles.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell className="font-medium">
                            {vehicle.plate_number}
                          </TableCell>
                          <TableCell>{vehicle.office_name}</TableCell>
                          <TableCell>{vehicle.vehicle_type}</TableCell>
                          <TableCell>{vehicle.wheels}</TableCell>
                          <TableCell>{vehicle.engine_type}</TableCell>
                          <TableCell>{vehicle.driver_name}</TableCell>
                          <TableCell className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddTest(vehicle)}
                            >
                              Add Test
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewVehicleHistory(vehicle)}
                            >
                              History
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditVehicle(vehicle)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="tests" className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Quarter</TableHead>
                      <TableHead>Plate Number</TableHead>
                      <TableHead>Vehicle Type</TableHead>
                      <TableHead>Engine</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                          No tests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTests.map((test) => (
                        <TableRow key={test.id}>
                          <TableCell>
                            {new Date(test.test_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{test.year}</TableCell>
                          <TableCell>{test.quarter}</TableCell>
                          <TableCell className="font-medium">
                            {test.vehicle?.plate_number}
                          </TableCell>
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
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                {selectedVehicle && (
                  <>
                    <div className="p-4 rounded-md border bg-muted/40">
                      <h3 className="text-xl font-medium mb-4">
                        Vehicle Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Plate Number
                          </h4>
                          <p>{selectedVehicle.plate_number}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Office
                          </h4>
                          <p>{selectedVehicle.office_name}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Driver
                          </h4>
                          <p>{selectedVehicle.driver_name}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Vehicle Type
                          </h4>
                          <p>{selectedVehicle.vehicle_type}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Engine Type
                          </h4>
                          <p>{selectedVehicle.engine_type}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Wheels
                          </h4>
                          <p>{selectedVehicle.wheels}</p>
                        </div>
                        {selectedVehicle.contact_number && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                              Contact Number
                            </h4>
                            <p>{selectedVehicle.contact_number}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-medium mb-2">Test History</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Quarter</TableHead>
                            <TableHead>Result</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedVehicle.emission_tests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-10">
                                No test history found
                              </TableCell>
                            </TableRow>
                          ) : (
                            selectedVehicle.emission_tests.map((test) => (
                              <TableRow key={test.id}>
                                <TableCell>
                                  {new Date(test.test_date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{test.year}</TableCell>
                                <TableCell>{test.quarter}</TableCell>
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
                    
                    <div className="flex justify-end mt-4">
                      <Button
                        variant="outline"
                        onClick={() => handleAddTest(selectedVehicle)}
                      >
                        Add Test
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Add/Edit Vehicle Dialog */}
      <Dialog open={vehicleDialogOpen} onOpenChange={setVehicleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Vehicle" : "Add New Vehicle"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plateNumber" className="text-right">
                Plate Number *
              </Label>
              <Input
                id="plateNumber"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="officeName" className="text-right">
                Office Name *
              </Label>
              <Input
                id="officeName"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="driverName" className="text-right">
                Driver Name *
              </Label>
              <Input
                id="driverName"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vehicleType" className="text-right">
                Vehicle Type *
              </Label>
              <Input
                id="vehicleType"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="col-span-3"
                required
                placeholder="e.g. Sedan, Pickup, Motorcycle"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactNumber" className="text-right">
                Contact Number
              </Label>
              <Input
                id="contactNumber"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="col-span-3"
                placeholder="Optional"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="engineType" className="text-right">
                Engine Type
              </Label>
              <Select value={engineType} onValueChange={setEngineType}>
                <SelectTrigger id="engineType" className="col-span-3">
                  <SelectValue placeholder="Select engine type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gas">Gas</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="wheels" className="text-right">
                Wheels
              </Label>
              <Select value={wheels} onValueChange={setWheels}>
                <SelectTrigger id="wheels" className="col-span-3">
                  <SelectValue placeholder="Select wheels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Wheels</SelectItem>
                  <SelectItem value="4">4 Wheels</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setVehicleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVehicle}>
              {isEditing ? "Update Vehicle" : "Add Vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Test Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Record Emission Test
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Vehicle
              </Label>
              <div className="col-span-3 font-medium">
                {testVehicle?.plate_number}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="testYear" className="text-right">
                Year
              </Label>
              <Select value={testYear} onValueChange={setTestYear}>
                <SelectTrigger id="testYear" className="col-span-3">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="testQuarter" className="text-right">
                Quarter
              </Label>
              <Select value={testQuarter} onValueChange={setTestQuarter}>
                <SelectTrigger id="testQuarter" className="col-span-3">
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  {quarters.map(quarter => (
                    <SelectItem key={quarter} value={quarter.toString()}>
                      Quarter {quarter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="testDate" className="text-right">
                Test Date
              </Label>
              <Input
                id="testDate"
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="testResult" className="text-right">
                Result
              </Label>
              <Select value={testResult} onValueChange={setTestResult}>
                <SelectTrigger id="testResult" className="col-span-3">
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Pass</SelectItem>
                  <SelectItem value="false">Fail</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTest}>
              Save Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
