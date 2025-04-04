
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, Eye, Edit, Plus } from "lucide-react";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { format, parse } from "date-fns";
import { toast } from "sonner";
import { YearSelector } from "@/components/dashboards/government-emission/YearSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";

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
  vehicle_type: string;
  engine_type: string;
  test_date: string;
  result: boolean;
}

export default function QuarterlyTestingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const currentYear = new Date().getFullYear();
  const [availableYears, setAvailableYears] = useState<number[]>(
    Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
  );
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("schedule");
  const [isLoading, setIsLoading] = useState(true);
  const [schedules, setSchedules] = useState<TestSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<TestSchedule | null>(null);
  const [vehicleTests, setVehicleTests] = useState<VehicleTest[]>([]);
  const [isLoadingTests, setIsLoadingTests] = useState(false);
  
  // Form state for new schedule
  const [newSchedule, setNewSchedule] = useState({
    year: currentYear,
    quarter: 1,
    assigned_personnel: "",
    location: "",
    conducted_on: new Date(),
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchSchedules();
  }, [selectedYear]);

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('emission_test_schedules')
        .select('*')
        .eq('year', selectedYear)
        .order('quarter', { ascending: true });

      if (error) throw error;
      setSchedules(data as TestSchedule[]);
    } catch (error) {
      console.error("Error fetching test schedules:", error);
      toast.error("Failed to load quarterly test schedules");
    } finally {
      setIsLoading(false);
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year));
  };

  const handleViewTests = async (schedule: TestSchedule) => {
    setSelectedSchedule(schedule);
    setActiveTab("tests");
    setIsLoadingTests(true);
    
    try {
      // Fetch tests related to this schedule (matching year & quarter)
      const { data, error } = await supabase
        .from('emission_tests')
        .select(`
          id, 
          test_date,
          result,
          vehicle_id,
          vehicles:vehicle_id (
            plate_number,
            vehicle_type,
            engine_type
          )
        `)
        .eq('year', schedule.year)
        .eq('quarter', schedule.quarter);
      
      if (error) throw error;
      
      // Transform the data for display
      const formattedTests = data.map(test => ({
        id: test.id,
        vehicle_id: test.vehicle_id,
        plate_number: test.vehicles.plate_number,
        vehicle_type: test.vehicles.vehicle_type,
        engine_type: test.vehicles.engine_type,
        test_date: test.test_date,
        result: test.result
      }));
      
      setVehicleTests(formattedTests);
    } catch (error) {
      console.error("Error fetching vehicle tests:", error);
      toast.error("Failed to load vehicle test data");
    } finally {
      setIsLoadingTests(false);
    }
  };

  const handleEditSchedule = (schedule: TestSchedule) => {
    setNewSchedule({
      year: schedule.year,
      quarter: schedule.quarter,
      assigned_personnel: schedule.assigned_personnel,
      location: schedule.location,
      conducted_on: new Date(schedule.conducted_on),
    });
    setOpenAddDialog(true);
  };

  const handleAddSchedule = async () => {
    try {
      const { error } = await supabase
        .from('emission_test_schedules')
        .insert({
          year: newSchedule.year,
          quarter: newSchedule.quarter,
          assigned_personnel: newSchedule.assigned_personnel,
          location: newSchedule.location,
          conducted_on: format(newSchedule.conducted_on, 'yyyy-MM-dd'),
        });

      if (error) throw error;
      
      toast.success("Quarterly test schedule added successfully");
      setOpenAddDialog(false);
      fetchSchedules();
      
      // Reset form
      setNewSchedule({
        year: currentYear,
        quarter: 1,
        assigned_personnel: "",
        location: "",
        conducted_on: new Date(),
      });
    } catch (error) {
      console.error("Error adding schedule:", error);
      toast.error("Failed to add quarterly test schedule");
    }
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
              <h1 className="text-2xl font-bold">Quarterly Emissions Testing</h1>
              <p className="text-muted-foreground">Schedule and manage quarterly emission tests</p>
            </div>
            <Button onClick={() => setOpenAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Test Schedule
            </Button>
          </div>

          <div className="mb-6">
            <YearSelector
              selectedYear={selectedYear}
              availableYears={availableYears}
              onYearChange={handleYearChange}
              showQuarters={false}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="schedule">Test Schedules</TabsTrigger>
              <TabsTrigger value="tests" disabled={!selectedSchedule}>Vehicle Tests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="schedule">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>
                    {selectedYear} Test Schedules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : schedules.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No test schedules found for {selectedYear}.
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Quarter</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Assigned Personnel</TableHead>
                            <TableHead>Conducted On</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {schedules.map((schedule) => (
                            <TableRow key={schedule.id}>
                              <TableCell>Q{schedule.quarter}</TableCell>
                              <TableCell>{schedule.location}</TableCell>
                              <TableCell>{schedule.assigned_personnel}</TableCell>
                              <TableCell>
                                {format(new Date(schedule.conducted_on), 'MMMM d, yyyy')}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleViewTests(schedule)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Tests
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleEditSchedule(schedule)}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
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
              </Card>
            </TabsContent>
            
            <TabsContent value="tests">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>
                    {selectedSchedule ? 
                      `Q${selectedSchedule.quarter} ${selectedSchedule.year} - Vehicle Tests at ${selectedSchedule.location}` : 
                      'Vehicle Tests'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingTests ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : vehicleTests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No vehicle tests found for this schedule.
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Plate Number</TableHead>
                            <TableHead>Vehicle Type</TableHead>
                            <TableHead>Engine Type</TableHead>
                            <TableHead>Test Date</TableHead>
                            <TableHead>Result</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vehicleTests.map((test) => (
                            <TableRow key={test.id}>
                              <TableCell>{test.plate_number}</TableCell>
                              <TableCell>{test.vehicle_type}</TableCell>
                              <TableCell>{test.engine_type}</TableCell>
                              <TableCell>
                                {format(new Date(test.test_date), 'MMMM d, yyyy')}
                              </TableCell>
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
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Schedule Dialog */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Quarterly Test Schedule</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={newSchedule.year}
                  onChange={(e) => setNewSchedule({ ...newSchedule, year: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="quarter">Quarter</Label>
                <Input
                  id="quarter"
                  type="number"
                  min="1"
                  max="4"
                  value={newSchedule.quarter}
                  onChange={(e) => setNewSchedule({ ...newSchedule, quarter: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="personnel">Assigned Personnel</Label>
              <Input
                id="personnel"
                value={newSchedule.assigned_personnel}
                onChange={(e) => setNewSchedule({ ...newSchedule, assigned_personnel: e.target.value })}
                placeholder="Enter name of assigned personnel"
              />
            </div>

            <div>
              <Label htmlFor="location">Test Location</Label>
              <Input
                id="location"
                value={newSchedule.location}
                onChange={(e) => setNewSchedule({ ...newSchedule, location: e.target.value })}
                placeholder="Enter test location"
              />
            </div>

            <div>
              <Label>Conducted On</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newSchedule.conducted_on && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(newSchedule.conducted_on, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarUI
                    mode="single"
                    selected={newSchedule.conducted_on}
                    onSelect={(date) => date && setNewSchedule({ ...newSchedule, conducted_on: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSchedule}>Save Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </SidebarProvider>
  );
}
