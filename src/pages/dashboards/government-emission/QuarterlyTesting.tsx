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
import { Calendar } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { format, parse } from "date-fns";
import { toast } from "sonner";
import { YearSelector } from "@/components/dashboards/government-emission/YearSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmissionTestSchedule } from "@/components/dashboards/government-emission/EmissionTestSchedule";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TestSchedule {
  id: string;
  year: number;
  quarter: number;
  assigned_personnel: string;
  location: string;
  conducted_on: string;
}

export default function QuarterlyTestingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const currentYear = new Date().getFullYear();
  const [availableYears, setAvailableYears] = useState<number[]>(
    Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
  );
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState<number | "All">("All");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("schedule");
  const [isLoading, setIsLoading] = useState(true);
  const [schedules, setSchedules] = useState<TestSchedule[]>([]);
  
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

  const handleQuarterChange = (quarter: string) => {
    setSelectedQuarter(quarter === "All" ? "All" : parseInt(quarter));
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
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Quarterly Emissions Testing</h1>
              <p className="text-muted-foreground">Schedule and manage quarterly emission tests</p>
            </div>
            <Button onClick={() => setOpenAddDialog(true)}>
              <Calendar className="mr-2 h-4 w-4" />
              Add Test Schedule
            </Button>
          </div>

          <div className="mb-6">
            <YearSelector
              selectedYear={selectedYear}
              selectedQuarter={selectedQuarter}
              availableYears={availableYears}
              onYearChange={handleYearChange}
              onQuarterChange={handleQuarterChange}
              showQuarters={true}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="schedule">Test Schedule</TabsTrigger>
              <TabsTrigger value="tests">Vehicle Tests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="schedule">
              <EmissionTestSchedule 
                selectedYear={selectedYear}
                selectedQuarter={selectedQuarter === "All" ? undefined : selectedQuarter}
              />
            </TabsContent>
            
            <TabsContent value="tests">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Vehicle Test Records</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Vehicle tests content will be implemented later */}
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">
                      Select a test schedule to view and add vehicle tests.
                    </p>
                  </div>
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
                  <CalendarComponent
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
            <Button onClick={handleAddSchedule}>Add Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </SidebarProvider>
  );
}
