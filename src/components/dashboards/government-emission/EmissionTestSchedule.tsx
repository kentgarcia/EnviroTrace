
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
import { Calendar, Edit2, FileDown, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
        {schedules.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleExportToCSV}>
            <FileDown className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        )}
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
    </Card>
  );
}
