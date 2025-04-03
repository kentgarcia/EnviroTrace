
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface EmissionScheduleProps {
  year: number;
  quarter: number;
  onScheduleChange: () => void;
}

const formSchema = z.object({
  assignedPersonnel: z.string().min(3, "Personnel name is required"),
  location: z.string().min(3, "Location is required"),
  conductedOn: z.date({ required_error: "Please select a date" }),
});

type FormValues = z.infer<typeof formSchema>;

export function EmissionTestSchedule({ year, quarter, onScheduleChange }: EmissionScheduleProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [schedule, setSchedule] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assignedPersonnel: "",
      location: "",
    },
  });

  // Fetch schedule for this year and quarter
  useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("emission_test_schedules")
          .select("*")
          .eq("year", year)
          .eq("quarter", quarter)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        setSchedule(data || null);
        
        if (data) {
          form.reset({
            assignedPersonnel: data.assigned_personnel,
            location: data.location,
            conductedOn: new Date(data.conducted_on),
          });
        } else {
          form.reset({
            assignedPersonnel: "",
            location: "",
            conductedOn: undefined,
          });
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
        toast.error("Failed to load schedule information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();

    // Set up real-time subscription for schedule changes
    const channel = supabase
      .channel('emission-schedule-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'emission_test_schedules',
        filter: `year=eq.${year},quarter=eq.${quarter}`
      }, payload => {
        if (payload.new) {
          setSchedule(payload.new);
          form.reset({
            assignedPersonnel: payload.new.assigned_personnel,
            location: payload.new.location,
            conductedOn: new Date(payload.new.conducted_on),
          });
        } else if (payload.eventType === 'DELETE') {
          setSchedule(null);
          form.reset({
            assignedPersonnel: "",
            location: "",
            conductedOn: undefined,
          });
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [year, quarter, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    
    try {
      if (schedule) {
        // Update existing schedule
        const { error } = await supabase
          .from("emission_test_schedules")
          .update({
            assigned_personnel: values.assignedPersonnel,
            location: values.location,
            conducted_on: values.conductedOn.toISOString().split("T")[0],
            updated_at: new Date(),
          })
          .eq("id", schedule.id);

        if (error) throw error;
        toast.success("Schedule updated successfully");
      } else {
        // Create new schedule
        const { error } = await supabase
          .from("emission_test_schedules")
          .insert({
            year,
            quarter,
            assigned_personnel: values.assignedPersonnel,
            location: values.location,
            conducted_on: values.conductedOn.toISOString().split("T")[0],
          });

        if (error) throw error;
        toast.success("Schedule created successfully");
      }
      
      onScheduleChange();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Failed to save schedule");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Quarter {quarter} Testing Schedule</CardTitle>
            <CardDescription>Manage emission testing schedule for {year} Q{quarter}</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                {schedule ? "Edit Schedule" : "Create Schedule"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {schedule ? "Edit" : "Create"} Emission Test Schedule
                </DialogTitle>
                <DialogDescription>
                  Set up the testing schedule for {year} Q{quarter}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="assignedPersonnel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Personnel</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter personnel name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter test location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="conductedOn"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Test Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : schedule ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year/Quarter</TableHead>
                <TableHead>Personnel</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{year} Q{quarter}</TableCell>
                <TableCell>{schedule.assigned_personnel}</TableCell>
                <TableCell>{schedule.location}</TableCell>
                <TableCell>
                  {new Date(schedule.conducted_on).toLocaleDateString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>No schedule has been set for this quarter.</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => setIsDialogOpen(true)}
            >
              Create Schedule
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
