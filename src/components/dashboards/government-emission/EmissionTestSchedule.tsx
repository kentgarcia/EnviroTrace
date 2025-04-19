
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, Edit2, FileDown, Trash2, Plus, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EmissionTestScheduleProps {
  selectedYear: number;
  selectedQuarter?: number;
}

interface TestSchedule {
  id: string;
  year: number;
  quarter: number;
  assigned_personnel: string;
  location: string;
  conducted_on: string;
}

interface VehicleTest {
  id: string;
  vehicle_id: string;
  plate_number: string;
  driver_name: string;
  office_name: string;
  test_date: string;
  result: boolean;
}

export function EmissionTestSchedule({ 
  selectedYear,
  selectedQuarter 
}: EmissionTestScheduleProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [schedules, setSchedules] = useState<TestSchedule[]>([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<TestSchedule | null>(null);
  const [formValues, setFormValues] = useState({
    assigned_personnel: "",
    location: "",
    conducted_on: new Date(),
  });
  
  // Vehicle tests modal state
  const [viewTestsModalOpen, setViewTestsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<TestSchedule | null>(null);
  const [vehicleTests, setVehicleTests] = useState<VehicleTest[]>([]);
  const [isLoadingTests, setIsLoadingTests] = useState(false);
  const [testSearchQuery, setTestSearchQuery] = useState("");
  const [filteredTests, setFilteredTests] = useState<VehicleTest[]>([]);
  
  // Add vehicle test modal state
  const [addTestModalOpen, setAddTestModalOpen] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [testDate, setTestDate] = useState<Date>(new Date());
  const [testResult, setTestResult] = useState<boolean>(true);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  
  // Create schedule modal state
  const [addScheduleModalOpen, setAddScheduleModalOpen] = useState(false);
  const [newScheduleValues, setNewScheduleValues] = useState({
    quarter: 1,
    assigned_personnel: "",
    location: "",
    conducted_on: new Date(),
  });

  useEffect(() => {
    fetchSchedules();

    // Set up real-time listener
    const channel = supabase
      .channel('emission_schedules')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'emission_test_schedules' 
      }, () => {
        fetchSchedules();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [selectedYear, selectedQuarter]);
  
  useEffect(() => {
    if (vehicleTests.length > 0) {
      const filtered = vehicleTests.filter(test => 
        test.plate_number.toLowerCase().includes(testSearchQuery.toLowerCase()) ||
        test.driver_name.toLowerCase().includes(testSearchQuery.toLowerCase()) ||
        test.office_name.toLowerCase().includes(testSearchQuery.toLowerCase())
      );
      setFilteredTests(filtered);
    }
  }, [testSearchQuery, vehicleTests]);

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('emission_test_schedules')
        .select('*')
        .eq('year', selectedYear);
        
      if (selectedQuarter) {
        query = query.eq('quarter', selectedQuarter);
      }
        
      query = query.order('quarter', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      setSchedules(data as TestSchedule[]);
    } catch (error) {
      console.error("Error fetching test schedules:", error);
      toast.error("Failed to load quarterly test schedules");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchVehicleTests = async (schedule: TestSchedule) => {
    setIsLoadingTests(true);
    try {
      // Get all emission tests for this schedule
      const { data: testsData, error: testsError } = await supabase
        .from('emission_tests')
        .select('id, vehicle_id, test_date, result')
        .eq('year', schedule.year)
        .eq('quarter', schedule.quarter);
        
      if (testsError) throw testsError;
      
      if (testsData.length === 0) {
        setVehicleTests([]);
        setFilteredTests([]);
        setIsLoadingTests(false);
        return;
      }
      
      // Get vehicle details for each test
      const vehicleIds = testsData.map(test => test.vehicle_id);
      
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, plate_number, driver_name, office_name')
        .in('id', vehicleIds);
        
      if (vehiclesError) throw vehiclesError;
      
      // Combine test data with vehicle data
      const combinedTests = testsData.map(test => {
        const vehicle = vehiclesData.find(v => v.id === test.vehicle_id);
        return {
          id: test.id,
          vehicle_id: test.vehicle_id,
          plate_number: vehicle?.plate_number || 'Unknown',
          driver_name: vehicle?.driver_name || 'Unknown',
          office_name: vehicle?.office_name || 'Unknown',
          test_date: test.test_date,
          result: test.result
        };
      });
      
      setVehicleTests(combinedTests);
      setFilteredTests(combinedTests);
      
    } catch (error) {
      console.error("Error fetching vehicle tests:", error);
      toast.error("Failed to load vehicle test data");
    } finally {
      setIsLoadingTests(false);
    }
  };
  
  const fetchAvailableVehicles = async () => {
    setIsLoadingVehicles(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, plate_number, driver_name, office_name')
        .order('plate_number');
        
      if (error) throw error;
      
      setAvailableVehicles(data);
    } catch (error) {
      console.error("Error fetching available vehicles:", error);
      toast.error("Failed to load available vehicles");
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const handleEdit = (schedule: TestSchedule) => {
    setCurrentSchedule(schedule);
    setFormValues({
      assigned_personnel: schedule.assigned_personnel,
      location: schedule.location,
      conducted_on: new Date(schedule.conducted_on),
    });
    setOpenEditDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    
    try {
      const { error } = await supabase
        .from('emission_test_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Schedule deleted successfully");
      fetchSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete schedule");
    }
  };

  const handleUpdate = async () => {
    if (!currentSchedule) return;
    
    try {
      const { error } = await supabase
        .from('emission_test_schedules')
        .update({
          assigned_personnel: formValues.assigned_personnel,
          location: formValues.location,
          conducted_on: format(formValues.conducted_on, 'yyyy-MM-dd'),
        })
        .eq('id', currentSchedule.id);

      if (error) throw error;
      toast.success("Schedule updated successfully");
      setOpenEditDialog(false);
      fetchSchedules();
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error("Failed to update schedule");
    }
  };
  
  const handleCreateSchedule = async () => {
    try {
      const { error } = await supabase
        .from('emission_test_schedules')
        .insert({
          year: selectedYear,
          quarter: newScheduleValues.quarter,
          assigned_personnel: newScheduleValues.assigned_personnel,
          location: newScheduleValues.location,
          conducted_on: format(newScheduleValues.conducted_on, 'yyyy-MM-dd'),
        });

      if (error) throw error;
      toast.success("Test schedule created successfully");
      setAddScheduleModalOpen(false);
      fetchSchedules();
    } catch (error) {
      console.error("Error creating test schedule:", error);
      toast.error("Failed to create test schedule");
    }
  };
  
  const handleViewTests = (schedule: TestSchedule) => {
    setSelectedSchedule(schedule);
    fetchVehicleTests(schedule);
    setViewTestsModalOpen(true);
  };
  
  const handleAddVehicleTest = async () => {
    if (!selectedSchedule || !selectedVehicleId) return;
    
    try {
      const { error } = await supabase
        .from('emission_tests')
        .insert({
          year: selectedSchedule.year,
          quarter: selectedSchedule.quarter,
          vehicle_id: selectedVehicleId,
          test_date: format(testDate, 'yyyy-MM-dd'),
          result: testResult
        });

      if (error) throw error;
      toast.success("Vehicle test added successfully");
      setAddTestModalOpen(false);
      fetchVehicleTests(selectedSchedule);
    } catch (error) {
      console.error("Error adding vehicle test:", error);
      toast.error("Failed to add vehicle test");
    }
  };
  
  const handleDeleteTest = async (testId: string) => {
    if (!confirm("Are you sure you want to delete this test record?")) return;
    
    try {
      const { error } = await supabase
        .from('emission_tests')
        .delete()
        .eq('id', testId);

      if (error) throw error;
      toast.success("Test record deleted successfully");
      if (selectedSchedule) {
        fetchVehicleTests(selectedSchedule);
      }
    } catch (error) {
      console.error("Error deleting test record:", error);
      toast.error("Failed to delete test record");
    }
  };

  const handleExportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    // Add CSV Headers
    csvContent += "Year,Quarter,Assigned Personnel,Location,Conducted On\n";
    
    // Add data rows
    schedules.forEach(schedule => {
      const testDate = format(new Date(schedule.conducted_on), 'yyyy-MM-dd');
      csvContent += `${schedule.year},${schedule.quarter},"${schedule.assigned_personnel}","${schedule.location}","${testDate}"\n`;
    });

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `quarterly_test_schedules_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Schedule data exported successfully");
  };

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle>Quarterly Test Schedules</CardTitle>
        <div className="flex space-x-2">
          {schedules.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExportToCSV}>
              <FileDown className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          )}
          <Button size="sm" onClick={() => setAddScheduleModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No test schedules found for {selectedQuarter ? `Q${selectedQuarter} ` : ''}the year {selectedYear}.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Assigned Personnel</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Conducted On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>{schedule.year}</TableCell>
                    <TableCell>Q{schedule.quarter}</TableCell>
                    <TableCell>{schedule.assigned_personnel}</TableCell>
                    <TableCell>{schedule.location}</TableCell>
                    <TableCell>{format(new Date(schedule.conducted_on), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewTests(schedule)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(schedule)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(schedule.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Edit Schedule Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Test Schedule</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="personnel">Assigned Personnel</Label>
              <Input
                id="personnel"
                value={formValues.assigned_personnel}
                onChange={(e) => setFormValues({ ...formValues, assigned_personnel: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="location">Test Location</Label>
              <Input
                id="location"
                value={formValues.location}
                onChange={(e) => setFormValues({ ...formValues, location: e.target.value })}
              />
            </div>

            <div>
              <Label>Conducted On</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(formValues.conducted_on, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formValues.conducted_on}
                    onSelect={(date) => date && setFormValues({ ...formValues, conducted_on: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Schedule Dialog */}
      <Dialog open={addScheduleModalOpen} onOpenChange={setAddScheduleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Test Schedule</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="quarter">Quarter</Label>
              <Select
                value={newScheduleValues.quarter.toString()}
                onValueChange={(value) => setNewScheduleValues({ 
                  ...newScheduleValues, 
                  quarter: parseInt(value) 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Q1</SelectItem>
                  <SelectItem value="2">Q2</SelectItem>
                  <SelectItem value="3">Q3</SelectItem>
                  <SelectItem value="4">Q4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="new-personnel">Assigned Personnel</Label>
              <Input
                id="new-personnel"
                value={newScheduleValues.assigned_personnel}
                onChange={(e) => setNewScheduleValues({ 
                  ...newScheduleValues, 
                  assigned_personnel: e.target.value 
                })}
              />
            </div>

            <div>
              <Label htmlFor="new-location">Test Location</Label>
              <Input
                id="new-location"
                value={newScheduleValues.location}
                onChange={(e) => setNewScheduleValues({ 
                  ...newScheduleValues, 
                  location: e.target.value 
                })}
              />
            </div>

            <div>
              <Label>Conducted On</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(newScheduleValues.conducted_on, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={newScheduleValues.conducted_on}
                    onSelect={(date) => date && setNewScheduleValues({ 
                      ...newScheduleValues, 
                      conducted_on: date 
                    })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSchedule}>Create Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Vehicle Tests Dialog */}
      <Dialog open={viewTestsModalOpen} onOpenChange={setViewTestsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Vehicle Tests for {selectedSchedule ? `Q${selectedSchedule.quarter} ${selectedSchedule.year}` : ''}
            </DialogTitle>
          </DialogHeader>
          
          {selectedSchedule && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Quarter</Label>
                <p className="font-medium">Q{selectedSchedule.quarter}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Test Location</Label>
                <p className="font-medium">{selectedSchedule.location}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Conducted On</Label>
                <p className="font-medium">{format(new Date(selectedSchedule.conducted_on), 'MMM dd, yyyy')}</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <div className="relative grow mr-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by plate number, driver, or office..."
                className="pl-8"
                value={testSearchQuery}
                onChange={(e) => setTestSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => {
                fetchAvailableVehicles();
                setAddTestModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle Test
            </Button>
          </div>
          
          {isLoadingTests ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No vehicle tests found for this schedule.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plate Number</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Office</TableHead>
                    <TableHead>Test Date</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.plate_number}</TableCell>
                      <TableCell>{test.driver_name}</TableCell>
                      <TableCell>{test.office_name}</TableCell>
                      <TableCell>{format(new Date(test.test_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        {test.result ? (
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
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteTest(test.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewTestsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Vehicle Test Dialog */}
      <Dialog open={addTestModalOpen} onOpenChange={setAddTestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vehicle Test</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="vehicle">Vehicle</Label>
              <Select
                value={selectedVehicleId}
                onValueChange={setSelectedVehicleId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingVehicles ? (
                    <div className="flex justify-center p-2">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate_number} - {vehicle.driver_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Test Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(testDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={testDate}
                    onSelect={(date) => date && setTestDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label>Result</Label>
              <Select
                value={testResult ? "pass" : "fail"}
                onValueChange={(value) => setTestResult(value === "pass")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select test result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">Passed</SelectItem>
                  <SelectItem value="fail">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTestModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVehicleTest}>Add Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
