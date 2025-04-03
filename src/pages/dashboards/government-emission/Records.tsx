
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RecordTable } from "@/components/dashboard/RecordTable";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";

// Form schema for vehicle lookup
const lookupSchema = z.object({
  plateNumber: z.string().min(3, "Plate number must be at least 3 characters"),
});

// Form schema for adding a new vehicle
const vehicleSchema = z.object({
  plateNumber: z.string().min(3, "Plate number is required"),
  officeName: z.string().min(2, "Office name is required"),
  wheels: z.enum(["2", "4"], {
    required_error: "Wheel type is required",
  }),
  engineType: z.enum(["Gas", "Diesel"], {
    required_error: "Engine type is required",
  }),
  driverName: z.string().min(3, "Driver name is required"),
  vehicleType: z.string().min(2, "Vehicle type is required"),
  contactNumber: z.string().optional(),
});

// Form schema for emission test
const testSchema = z.object({
  year: z.string().min(4, "Year is required"),
  quarter: z.enum(["1", "2", "3", "4"], {
    required_error: "Quarter is required",
  }),
  testDate: z.string().min(1, "Test date is required"),
  result: z.enum(["pass", "fail"], {
    required_error: "Result is required",
  }),
});

export default function GovernmentEmissionRecords() {
  const navigate = useNavigate();
  const { user, userData, loading } = useAuth();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [emissionRecords, setEmissionRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentVehicle, setCurrentVehicle] = useState<any>(null);
  const [isLookupDialogOpen, setIsLookupDialogOpen] = useState(false);
  const [isNewVehicleDialogOpen, setIsNewVehicleDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);

  // Form handling
  const lookupForm = useForm<z.infer<typeof lookupSchema>>({
    resolver: zodResolver(lookupSchema),
    defaultValues: {
      plateNumber: '',
    },
  });

  const vehicleForm = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      plateNumber: '',
      officeName: '',
      wheels: "4",
      engineType: "Gas",
      driverName: '',
      vehicleType: '',
      contactNumber: '',
    },
  });

  const testForm = useForm<z.infer<typeof testSchema>>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      year: new Date().getFullYear().toString(),
      quarter: "1",
      testDate: new Date().toISOString().split('T')[0],
      result: "pass",
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    } else if (user && userData && 
              !userData.roles.includes('admin') && 
              !userData.roles.includes('government-emission')) {
      navigate("/dashboard-selection");
      toast.error("You don't have access to this dashboard");
    } else if (!loading && user) {
      fetchEmissionRecords();
    }
  }, [user, userData, loading, navigate]);

  const fetchEmissionRecords = async () => {
    setIsLoadingData(true);
    
    try {
      // In a real application, we would fetch actual data
      // Since the database is newly created, for demonstration we'll use dummy data
      const dummyRecords = [];
      
      for (let i = 1; i <= 10; i++) {
        const randomDate = new Date();
        randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 60));
        
        dummyRecords.push({
          id: `GE${String(i).padStart(3, '0')}`,
          plate_number: `ABC${Math.floor(Math.random() * 1000)}`,
          office_name: `Office ${i}`,
          driver_name: `Driver ${i}`,
          vehicle_type: Math.random() > 0.5 ? "Sedan" : "SUV",
          engine_type: Math.random() > 0.5 ? "Gas" : "Diesel",
          wheels: Math.random() > 0.7 ? "2" : "4",
          year: 2025,
          quarter: Math.floor(Math.random() * 4) + 1,
          test_date: randomDate.toISOString().split('T')[0],
          result: Math.random() > 0.3,
          updated_at: new Date().toISOString()
        });
      }
      
      setEmissionRecords(dummyRecords);
    } catch (error) {
      console.error('Error fetching emission records:', error);
      toast.error("Failed to load emission records");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSearchVehicle = async (data: z.infer<typeof lookupSchema>) => {
    try {
      // In a real app, we would search the database for the vehicle
      const { plateNumber } = data;
      
      // Simulate database lookup with a timeout
      setIsLoadingData(true);
      
      setTimeout(() => {
        // Check if the plate number exists in our dummy data
        const vehicle = emissionRecords.find(record => 
          record.plate_number.toUpperCase() === plateNumber.toUpperCase()
        );
        
        if (vehicle) {
          setCurrentVehicle(vehicle);
          setIsLookupDialogOpen(false);
          setIsTestDialogOpen(true);
        } else {
          toast.info("Vehicle not found. Please add a new vehicle.");
          vehicleForm.setValue("plateNumber", plateNumber);
          setIsLookupDialogOpen(false);
          setIsNewVehicleDialogOpen(true);
        }
        
        setIsLoadingData(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error looking up vehicle:', error);
      toast.error("Failed to lookup vehicle");
      setIsLoadingData(false);
    }
  };

  const handleAddVehicle = async (data: z.infer<typeof vehicleSchema>) => {
    try {
      // In a real app, we would add the vehicle to the database
      setIsLoadingData(true);
      
      // Simulate adding to database with a timeout
      setTimeout(() => {
        const newVehicle = {
          id: `GE${String(emissionRecords.length + 1).padStart(3, '0')}`,
          plate_number: data.plateNumber,
          office_name: data.officeName,
          driver_name: data.driverName,
          vehicle_type: data.vehicleType,
          engine_type: data.engineType,
          wheels: data.wheels,
          updated_at: new Date().toISOString()
        };
        
        setCurrentVehicle(newVehicle);
        setIsNewVehicleDialogOpen(false);
        setIsTestDialogOpen(true);
        
        toast.success("Vehicle added successfully");
        setIsLoadingData(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error("Failed to add vehicle");
      setIsLoadingData(false);
    }
  };

  const handleAddTest = async (data: z.infer<typeof testSchema>) => {
    try {
      // In a real app, we would add the test to the database
      setIsLoadingData(true);
      
      // Simulate adding to database with a timeout
      setTimeout(() => {
        const newRecord = {
          ...currentVehicle,
          year: parseInt(data.year),
          quarter: parseInt(data.quarter),
          test_date: data.testDate,
          result: data.result === 'pass',
          updated_at: new Date().toISOString()
        };
        
        // Add to existing records
        setEmissionRecords([newRecord, ...emissionRecords]);
        
        setIsTestDialogOpen(false);
        toast.success("Emission test recorded successfully");
        setIsLoadingData(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error adding test:', error);
      toast.error("Failed to record emission test");
      setIsLoadingData(false);
    }
  };

  const emissionColumns = [
    { key: "id", title: "ID" },
    { key: "plate_number", title: "Plate Number" },
    { key: "office_name", title: "Office" },
    { key: "driver_name", title: "Driver" },
    { key: "engine_type", title: "Engine" },
    { key: "quarter", title: "Quarter" },
    { key: "result", title: "Result" },
    { key: "test_date", title: "Test Date" },
  ];

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
                <h1 className="text-3xl font-semibold">Government Emission Records</h1>
                <p className="text-muted-foreground">Manage and view emission reports from government vehicles</p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <Dialog open={isLookupDialogOpen} onOpenChange={setIsLookupDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" /> New Emission Test
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Vehicle Lookup</DialogTitle>
                      <DialogDescription>
                        Enter the plate number to search for an existing vehicle.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...lookupForm}>
                      <form onSubmit={lookupForm.handleSubmit(handleSearchVehicle)} className="space-y-4">
                        <FormField
                          control={lookupForm.control}
                          name="plateNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Plate Number</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input {...field} placeholder="ABC123" className="flex-1" />
                                  <Button type="submit" size="icon" disabled={isLoadingData}>
                                    <Search className="h-4 w-4" />
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {
                            setIsLookupDialogOpen(false);
                            setIsNewVehicleDialogOpen(true);
                          }}>
                            Add New Vehicle
                          </Button>
                          <Button type="submit" disabled={isLoadingData}>
                            {isLoadingData ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Searching...
                              </>
                            ) : "Search"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isNewVehicleDialogOpen} onOpenChange={setIsNewVehicleDialogOpen}>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Vehicle</DialogTitle>
                      <DialogDescription>
                        Enter vehicle details to add it to the database.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...vehicleForm}>
                      <form onSubmit={vehicleForm.handleSubmit(handleAddVehicle)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={vehicleForm.control}
                            name="plateNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Plate Number</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={vehicleForm.control}
                            name="officeName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Office Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={vehicleForm.control}
                            name="wheels"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Wheels</FormLabel>
                                <FormControl>
                                  <Select 
                                    value={field.value} 
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select wheels" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="2">2 Wheels</SelectItem>
                                      <SelectItem value="4">4 Wheels</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={vehicleForm.control}
                            name="engineType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Engine Type</FormLabel>
                                <FormControl>
                                  <Select 
                                    value={field.value} 
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select engine type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Gas">Gas</SelectItem>
                                      <SelectItem value="Diesel">Diesel</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={vehicleForm.control}
                            name="driverName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Driver Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={vehicleForm.control}
                            name="vehicleType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Vehicle Type</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g. Sedan, SUV" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={vehicleForm.control}
                          name="contactNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Number</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsNewVehicleDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isLoadingData}>
                            {isLoadingData ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                              </>
                            ) : "Add Vehicle"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Emission Test</DialogTitle>
                      <DialogDescription>
                        Enter test details for {currentVehicle?.plate_number}
                      </DialogDescription>
                    </DialogHeader>
                    
                    {currentVehicle && (
                      <Card className="p-4 bg-muted/50 mb-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-semibold">Plate:</span> {currentVehicle.plate_number}
                          </div>
                          <div>
                            <span className="font-semibold">Office:</span> {currentVehicle.office_name}
                          </div>
                          <div>
                            <span className="font-semibold">Driver:</span> {currentVehicle.driver_name}
                          </div>
                          <div>
                            <span className="font-semibold">Engine:</span> {currentVehicle.engine_type}
                          </div>
                        </div>
                      </Card>
                    )}
                    
                    <Form {...testForm}>
                      <form onSubmit={testForm.handleSubmit(handleAddTest)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={testForm.control}
                            name="year"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Year</FormLabel>
                                <FormControl>
                                  <Select 
                                    value={field.value} 
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[...Array(5)].map((_, i) => {
                                        const year = new Date().getFullYear() - i;
                                        return (
                                          <SelectItem key={i} value={year.toString()}>
                                            {year}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={testForm.control}
                            name="quarter"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quarter</FormLabel>
                                <FormControl>
                                  <Select 
                                    value={field.value} 
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select quarter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">Quarter 1</SelectItem>
                                      <SelectItem value="2">Quarter 2</SelectItem>
                                      <SelectItem value="3">Quarter 3</SelectItem>
                                      <SelectItem value="4">Quarter 4</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={testForm.control}
                            name="testDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Test Date</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={testForm.control}
                            name="result"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Test Result</FormLabel>
                                <FormControl>
                                  <Select 
                                    value={field.value} 
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select result" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pass">Pass</SelectItem>
                                      <SelectItem value="fail">Fail</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isLoadingData}>
                            {isLoadingData ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : "Save Test Result"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </header>

            <section className="mb-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 w-full sm:w-1/3">
                  <Input
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                  <Button size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        {emissionColumns.map((column) => (
                          <th key={column.key} className="text-left p-3 font-medium text-muted-foreground text-sm">
                            {column.title}
                          </th>
                        ))}
                        <th className="text-left p-3 font-medium text-muted-foreground text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {emissionRecords.filter((record) => {
                        if (!searchTerm) return true;
                        const searchLower = searchTerm.toLowerCase();
                        return (
                          record.plate_number.toLowerCase().includes(searchLower) ||
                          record.office_name.toLowerCase().includes(searchLower) ||
                          record.driver_name.toLowerCase().includes(searchLower)
                        );
                      }).map((record, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{record.id}</td>
                          <td className="p-3">{record.plate_number}</td>
                          <td className="p-3">{record.office_name}</td>
                          <td className="p-3">{record.driver_name}</td>
                          <td className="p-3">{record.engine_type}</td>
                          <td className="p-3">Q{record.quarter}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              record.result ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                              {record.result ? "Passed" : "Failed"}
                            </span>
                          </td>
                          <td className="p-3">{record.test_date}</td>
                          <td className="p-3">
                            <Button variant="ghost" size="sm">View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {emissionRecords.filter((record) => {
                    if (!searchTerm) return true;
                    const searchLower = searchTerm.toLowerCase();
                    return (
                      record.plate_number.toLowerCase().includes(searchLower) ||
                      record.office_name.toLowerCase().includes(searchLower) ||
                      record.driver_name.toLowerCase().includes(searchLower)
                    );
                  }).length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">No emission records found</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
