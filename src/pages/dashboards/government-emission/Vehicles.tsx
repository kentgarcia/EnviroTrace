import { useEffect, useState, useCallback } from "react";
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
import { useNavigate, useLocation } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useTauriStore } from "@/hooks/useTauriStore";

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

const debugLog = (...args: any[]) => {
  if (typeof window !== 'undefined') {
    // Only log in development
    if (import.meta.env.DEV) {
      // @ts-ignore
      window.__TAURI_DEBUG__ = window.__TAURI_DEBUG__ || [];
      // @ts-ignore
      window.__TAURI_DEBUG__.push(args);
      // eslint-disable-next-line no-console
      console.log('[TAURI DEBUG]', ...args);
    }
  }
};

export default function VehiclesPage() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [isOffline, setIsOffline] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState(false);
  const { get, set, save } = useTauriStore(".vehicles-data.dat");
  const [pendingVehicles, setPendingVehicles] = useState<Vehicle[]>([]);
  
  // Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editFormData, setEditFormData] = useState({
    plate_number: "",
    driver_name: "",
    office_name: "",
    vehicle_type: "",
    engine_type: "",
    wheels: 0,
    contact_number: ""
  });
  const [addFormData, setAddFormData] = useState({
    plate_number: "",
    driver_name: "",
    office_name: "",
    vehicle_type: "",
    engine_type: "Gas",
    wheels: 4,
    contact_number: ""
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    updateOnlineStatus();
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const loadPending = useCallback(async () => {
    const pending = await get("pending_vehicles");
    if (Array.isArray(pending)) setPendingVehicles(pending as Vehicle[]);
    else setPendingVehicles([]);
  }, [get]);

  const loadOfflineData = useCallback(async () => {
    debugLog('Loading offline data from Tauri Store...');
    const cached = await get("vehicles_list");
    debugLog('Loaded cached vehicles:', cached);
    if (Array.isArray(cached)) {
      setVehicles(cached as Vehicle[]);
      setFilteredVehicles(cached as Vehicle[]);
    } else {
      setVehicles([]);
      setFilteredVehicles([]);
    }
    const pending = await get("pending_vehicles");
    debugLog('Loaded pending vehicles:', pending);
    if (Array.isArray(pending)) setPendingVehicles(pending as Vehicle[]);
    else setPendingVehicles([]);
  }, [get]);

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    debugLog('fetchVehicles called. Online:', navigator.onLine);
    if (!navigator.onLine) {
      debugLog('Offline: loading from Tauri Store only.');
      const cached = await get("vehicles_list");
      debugLog('Loaded cached vehicles:', cached);
      if (Array.isArray(cached) && cached.length > 0) {
        setVehicles(cached as Vehicle[]);
        setFilteredVehicles(cached as Vehicle[]);
        setOfflineNotice(true);
      } else {
        setVehicles([]);
        setFilteredVehicles([]);
        setOfflineNotice(true);
      }
      setIsLoading(false);
      return;
    }
    debugLog('Online: fetching from Supabase.');
    const { data, error } = await supabase
      .from('vehicle_summary_view')
      .select('*')
      .order('plate_number', { ascending: true });
    debugLog('Supabase fetch result:', { data, error });
    if (error) {
      debugLog('Supabase fetch error, fallback to cache.');
      const cached = await get("vehicles_list");
      debugLog('Loaded cached vehicles:', cached);
      if (Array.isArray(cached) && cached.length > 0) {
        setVehicles(cached as Vehicle[]);
        setFilteredVehicles(cached as Vehicle[]);
        setOfflineNotice(true);
      } else {
        setVehicles([]);
        setFilteredVehicles([]);
        setOfflineNotice(true);
      }
      setIsLoading(false);
      toast.error("Failed to load vehicles data. Showing last available data.");
      return;
    }
    setVehicles(data as Vehicle[]);
    setFilteredVehicles(data as Vehicle[]);
    setOfflineNotice(false);
    await set("vehicles_list", data);
    await save();
    debugLog('Saved vehicles to Tauri Store:', data);
    setIsLoading(false);
  }, [get, set, save]);

  useEffect(() => {
    let subscription: any = null;
    const fetchAndSubscribe = async () => {
      if (!isOffline) {
        // Online: fetch from Supabase and subscribe to realtime
        await fetchVehicles();
        subscription = supabase
          .channel('vehicle_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => {
            fetchVehicles();
          })
          .subscribe();
      } else {
        // Offline: only load from Tauri Store, do not call Supabase
        await loadOfflineData();
      }
    };
    fetchAndSubscribe();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [isOffline, location.pathname]);

  useEffect(() => {
    if (!isOffline && pendingVehicles.length > 0) {
      const syncPending = async () => {
        for (const v of pendingVehicles) {
          try {
            await supabase.from('vehicles').insert({
              plate_number: v.plate_number,
              driver_name: v.driver_name,
              office_name: v.office_name,
              vehicle_type: v.vehicle_type,
              engine_type: v.engine_type,
              wheels: v.wheels,
              contact_number: v.contact_number
            });
          } catch (e) {
            // If any fail, keep them in pending
            toast.error("Some vehicles failed to sync. Will retry later.");
            return;
          }
        }
        await set("pending_vehicles", []);
        await save();
        setPendingVehicles([]);
        toast.success("Pending vehicles synced!");
      };
      syncPending();
    }
  }, [isOffline, pendingVehicles, set, save]);

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

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setViewModalOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setEditFormData({
      plate_number: vehicle.plate_number,
      driver_name: vehicle.driver_name,
      office_name: vehicle.office_name,
      vehicle_type: vehicle.vehicle_type,
      engine_type: vehicle.engine_type,
      wheels: vehicle.wheels,
      contact_number: vehicle.contact_number || ""
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedVehicle) return;
    // Validation checks
    if (!editFormData.plate_number.trim() || !editFormData.driver_name.trim() || !editFormData.office_name.trim() || !editFormData.vehicle_type.trim() || !editFormData.engine_type.trim() || !editFormData.wheels) {
      toast.error("Please fill in all required fields.");
      return;
    }
    // Prevent duplicate plate number (except for the current vehicle)
    const duplicate = vehicles.find(v => v.plate_number.toLowerCase() === editFormData.plate_number.trim().toLowerCase() && v.id !== selectedVehicle.id);
    if (duplicate) {
      toast.error("A vehicle with this plate number already exists.");
      return;
    }
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({
          plate_number: editFormData.plate_number,
          driver_name: editFormData.driver_name,
          office_name: editFormData.office_name,
          vehicle_type: editFormData.vehicle_type,
          engine_type: editFormData.engine_type,
          wheels: editFormData.wheels,
          contact_number: editFormData.contact_number
        })
        .eq('id', selectedVehicle.id);

      if (error) throw error;
      
      toast.success("Vehicle updated successfully");
      setEditModalOpen(false);
      
      // Update the vehicle in the local state
      const updatedVehicle = {
        ...selectedVehicle,
        plate_number: editFormData.plate_number,
        driver_name: editFormData.driver_name,
        office_name: editFormData.office_name,
        vehicle_type: editFormData.vehicle_type,
        engine_type: editFormData.engine_type,
        wheels: editFormData.wheels,
        contact_number: editFormData.contact_number
      };
      
      setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? updatedVehicle : v));
      
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast.error("Failed to update vehicle");
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar dashboardType="government-emission" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNavbar dashboardTitle="Government Vehicles" />
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Vehicles Database</h1>
                <p className="text-muted-foreground">Manage and view all vehicles in the system</p>
                {offlineNotice && (
                  <div className="text-sm text-yellow-600 mt-2">Offline mode: showing last available data</div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportToCSV}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export to CSV
                </Button>
                <Button onClick={() => setAddModalOpen(true)}>
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
                        <TableHead>Wheels</TableHead>
                        <TableHead>Latest Test</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            <div className="flex justify-center">
                              <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredVehicles.length === 0 && pendingVehicles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            No vehicles found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        [...filteredVehicles, ...pendingVehicles].map((vehicle) => (
                          <TableRow key={vehicle.id} className={vehicle.id?.toString().startsWith('pending-') ? 'opacity-60' : ''}>
                            <TableCell className="font-medium">{vehicle.plate_number}</TableCell>
                            <TableCell>{vehicle.office_name}</TableCell>
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
                              {vehicle.id?.toString().startsWith('pending-') && (
                                <span className="ml-2 text-xs text-yellow-600">(pending sync)</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {/* Hide actions for pending vehicles */}
                              {vehicle.id?.toString().startsWith('pending-') ? null : (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      Actions <ChevronDown className="ml-1 h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewDetails(vehicle)}>
                                      <Eye className="mr-2 h-4 w-4" /> View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEditVehicle(vehicle)}>
                                      <Edit className="mr-2 h-4 w-4" /> Edit Vehicle
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            {/* View Vehicle Modal */}
            <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Vehicle Details</DialogTitle>
                  <DialogDescription>
                    Complete information about this vehicle
                  </DialogDescription>
                </DialogHeader>
                {selectedVehicle && (
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Plate Number</Label>
                      <p className="font-medium">{selectedVehicle.plate_number}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Office</Label>
                      <p className="font-medium">{selectedVehicle.office_name}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Driver</Label>
                      <p className="font-medium">{selectedVehicle.driver_name}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Contact Number</Label>
                      <p className="font-medium">{selectedVehicle.contact_number || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Vehicle Type</Label>
                      <p className="font-medium">{selectedVehicle.vehicle_type}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Engine Type</Label>
                      <p className="font-medium">{selectedVehicle.engine_type}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Wheel Count</Label>
                      <p className="font-medium">{selectedVehicle.wheels}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Latest Test Date</Label>
                      <p className="font-medium">
                        {selectedVehicle.latest_test_date 
                          ? format(new Date(selectedVehicle.latest_test_date), 'MMM dd, yyyy') 
                          : "Not tested"}
                      </p>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-muted-foreground">Test Result</Label>
                      <p>
                        {selectedVehicle.latest_test_result === null ? (
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Not tested
                          </span>
                        ) : selectedVehicle.latest_test_result ? (
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Passed
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Failed
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setViewModalOpen(false)}>Close</Button>
                  <Button onClick={() => {
                    setViewModalOpen(false);
                    if (selectedVehicle) handleEditVehicle(selectedVehicle);
                  }}>Edit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Edit Vehicle Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Edit Vehicle</DialogTitle>
                  <DialogDescription>
                    Make changes to this vehicle's information
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="plate_number">Plate Number</Label>
                    <Input 
                      id="plate_number"
                      value={editFormData.plate_number}
                      onChange={(e) => setEditFormData({...editFormData, plate_number: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="office_name">Office</Label>
                    <Input 
                      id="office_name"
                      value={editFormData.office_name}
                      onChange={(e) => setEditFormData({...editFormData, office_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver_name">Driver</Label>
                    <Input 
                      id="driver_name"
                      value={editFormData.driver_name}
                      onChange={(e) => setEditFormData({...editFormData, driver_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_number">Contact Number</Label>
                    <Input 
                      id="contact_number"
                      value={editFormData.contact_number}
                      onChange={(e) => setEditFormData({...editFormData, contact_number: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_type">Vehicle Type</Label>
                    <Input 
                      id="vehicle_type"
                      value={editFormData.vehicle_type}
                      onChange={(e) => setEditFormData({...editFormData, vehicle_type: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="engine_type">Engine Type</Label>
                    <Select 
                      value={editFormData.engine_type}
                      onValueChange={(value) => setEditFormData({...editFormData, engine_type: value})}
                    >
                      <SelectTrigger id="engine_type">
                        <SelectValue placeholder="Select engine type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gas">Gas</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wheels">Wheels</Label>
                    <Select 
                      value={editFormData.wheels.toString()}
                      onValueChange={(value) => setEditFormData({...editFormData, wheels: parseInt(value)})}
                    >
                      <SelectTrigger id="wheels">
                        <SelectValue placeholder="Select wheel count" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveEdit}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add Vehicle Modal */}
            <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Vehicle</DialogTitle>
                  <DialogDescription>
                    Enter details for the new vehicle
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="add_plate_number">Plate Number</Label>
                    <Input 
                      id="add_plate_number"
                      value={addFormData.plate_number}
                      onChange={(e) => setAddFormData({...addFormData, plate_number: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add_office_name">Office</Label>
                    <Input 
                      id="add_office_name"
                      value={addFormData.office_name}
                      onChange={(e) => setAddFormData({...addFormData, office_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add_driver_name">Driver</Label>
                    <Input 
                      id="add_driver_name"
                      value={addFormData.driver_name}
                      onChange={(e) => setAddFormData({...addFormData, driver_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add_contact_number">Contact Number</Label>
                    <Input 
                      id="add_contact_number"
                      value={addFormData.contact_number}
                      onChange={(e) => setAddFormData({...addFormData, contact_number: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add_vehicle_type">Vehicle Type</Label>
                    <Input 
                      id="add_vehicle_type"
                      value={addFormData.vehicle_type}
                      onChange={(e) => setAddFormData({...addFormData, vehicle_type: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add_engine_type">Engine Type</Label>
                    <Select 
                      value={addFormData.engine_type}
                      onValueChange={(value) => setAddFormData({...addFormData, engine_type: value})}
                    >
                      <SelectTrigger id="add_engine_type">
                        <SelectValue placeholder="Select engine type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gas">Gas</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add_wheels">Wheels</Label>
                    <Select 
                      value={addFormData.wheels.toString()}
                      onValueChange={(value) => setAddFormData({...addFormData, wheels: parseInt(value)})}
                    >
                      <SelectTrigger id="add_wheels">
                        <SelectValue placeholder="Select wheel count" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
                  <Button onClick={async () => {
                    // Validation checks
                    if (!addFormData.plate_number.trim() || !addFormData.driver_name.trim() || !addFormData.office_name.trim() || !addFormData.vehicle_type.trim() || !addFormData.engine_type.trim() || !addFormData.wheels) {
                      toast.error("Please fill in all required fields.");
                      return;
                    }
                    // Prevent duplicate plate number (including pending)
                    if (vehicles.some(v => v.plate_number.toLowerCase() === addFormData.plate_number.trim().toLowerCase()) ||
                        pendingVehicles.some(v => v.plate_number.toLowerCase() === addFormData.plate_number.trim().toLowerCase())) {
                      toast.error("A vehicle with this plate number already exists.");
                      return;
                    }
                    if (isOffline) {
                      // Add to pending vehicles in Tauri Store
                      const newVehicle = {
                        ...addFormData,
                        id: `pending-${Date.now()}`,
                        latest_test_date: null,
                        latest_test_result: null
                      };
                      const updatedPending = [...pendingVehicles, newVehicle];
                      await set("pending_vehicles", updatedPending);
                      await save();
                      setPendingVehicles(updatedPending);
                      // setVehicles(prev => [...prev, newVehicle]);
                      // setFilteredVehicles(prev => [...prev, newVehicle]);
                      toast.success("Vehicle added offline. Will sync when online.");
                      setAddModalOpen(false);
                      setAddFormData({
                        plate_number: "",
                        driver_name: "",
                        office_name: "",
                        vehicle_type: "",
                        engine_type: "Gas",
                        wheels: 4,
                        contact_number: ""
                      });
                      return;
                    }
                    try {
                      const { error } = await supabase
                        .from('vehicles')
                        .insert({
                          plate_number: addFormData.plate_number,
                          driver_name: addFormData.driver_name,
                          office_name: addFormData.office_name,
                          vehicle_type: addFormData.vehicle_type,
                          engine_type: addFormData.engine_type,
                          wheels: addFormData.wheels,
                          contact_number: addFormData.contact_number
                        });
                      if (error) throw error;
                      toast.success("Vehicle added successfully");
                      setAddModalOpen(false);
                      setAddFormData({
                        plate_number: "",
                        driver_name: "",
                        office_name: "",
                        vehicle_type: "",
                        engine_type: "Gas",
                        wheels: 4,
                        contact_number: ""
                      });
                    } catch (error) {
                      console.error("Error adding vehicle:", error);
                      toast.error("Failed to add vehicle");
                    }
                  }}>Add Vehicle</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
