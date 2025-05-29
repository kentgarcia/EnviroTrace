import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/presentation/components/shared/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/presentation/components/shared/ui/form";
import { Input } from "@/presentation/components/shared/ui/input";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Separator } from "@/presentation/components/shared/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/shared/ui/dialog";
import { TestSchedule } from "@/core/hooks/emission/useQuarterlyTesting";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/presentation/components/shared/ui/popover";
import { Calendar } from "@/presentation/components/shared/ui/calendar";
import { cn } from "@/core/utils/utils";

// Form validation schema
const scheduleFormSchema = z.object({
  year: z.coerce
    .number()
    .int()
    .min(2020, { message: "Year must be 2020 or later" })
    .max(2030, { message: "Year must be 2030 or earlier" }),
  quarter: z.coerce
    .number()
    .int()
    .min(1, { message: "Quarter must be between 1 and 4" })
    .max(4, { message: "Quarter must be between 1 and 4" }),
  assignedPersonnel: z.string().min(3, {
    message: "Personnel name must be at least 3 characters",
  }),
  location: z.string().min(3, {
    message: "Location must be at least 3 characters",
  }),
  conductedOn: z.string().refine(
    (date) => {
      try {
        return new Date(date) instanceof Date;
      } catch {
        return false;
      }
    },
    { message: "Please enter a valid date" }
  ),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

interface ScheduleFormProps {
  initialValues?: TestSchedule;
  onSubmit: (values: ScheduleFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  // Current year for default value
  const currentYear = new Date().getFullYear();

  // Generate available years (current year ± 2 years)
  const availableYears = [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2,
  ];

  // Format incoming date for the form
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch (error) {
      return "";
    }
  };
  // Set default values - convert snake_case backend data to camelCase for form
  const defaultValues: ScheduleFormValues = {
    year: initialValues?.year || currentYear,
    quarter: initialValues?.quarter || 1,
    assignedPersonnel: initialValues?.assigned_personnel || "",
    location: initialValues?.location || "",
    conductedOn: initialValues?.conducted_on
      ? formatDate(initialValues.conducted_on)
      : format(new Date(), "yyyy-MM-dd"),
  };

  // Initialize form
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues,
  });

  // Form submission
  const handleSubmit = (values: ScheduleFormValues) => {
    onSubmit(values);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialValues ? "Edit Test Schedule" : "Create New Test Schedule"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Year */}
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(parseInt(value, 10))
                      }
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quarter */}
              <FormField
                control={form.control}
                name="quarter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quarter</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(parseInt(value, 10))
                      }
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Quarter" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                        <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                        <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                        <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Personnel */}
            <FormField
              control={form.control}
              name="assignedPersonnel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Personnel</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter personnel name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Location</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter testing location" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="conductedOn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialValues
                    ? "Update Schedule"
                    : "Create Schedule"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleForm;
