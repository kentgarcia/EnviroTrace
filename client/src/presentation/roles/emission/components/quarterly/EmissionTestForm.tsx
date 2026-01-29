import React, { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/presentation/components/shared/ui/form";
import { Input } from "@/presentation/components/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/shared/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/presentation/components/shared/ui/radio-group";
import { Button } from "@/presentation/components/shared/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Loader2, Search } from "lucide-react";
import { EmissionTest } from "@/core/hooks/emission/useQuarterlyTesting";
import { Vehicle } from "@/core/api/emission-service";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/presentation/components/shared/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/presentation/components/shared/ui/popover";
import { cn } from "@/core/utils/utils";

// Form validation schema - Aligned with database schema
const testFormSchema = z.object({
  vehicleId: z.string().min(1, { message: "Vehicle must be selected" }),
  testDate: z.string().refine(
    (date) => {
      try {
        return new Date(date) instanceof Date;
      } catch {
        return false;
      }
    },
    { message: "Please enter a valid date" }
  ),
  year: z.coerce
    .number()
    .int()
    .min(2020, { message: "Year must be 2020 or later" }),
  quarter: z.coerce
    .number()
    .int()
    .min(1, { message: "Quarter must be between 1 and 4" })
    .max(4, { message: "Quarter must be between 1 and 4" }),
  result: z.union([z.boolean(), z.null()]).optional(),
  co_level: z.number().min(0).max(100).optional(),
  hc_level: z.number().min(0).max(10000).optional(),
  opacimeter_result: z.number().min(0).max(100).optional(),
  remarks: z.string().optional(),
  technician_name: z.string().min(3).optional(),
  testing_center: z.string().min(3).optional(),
});

type TestFormValues = z.infer<typeof testFormSchema>;

interface EmissionTestFormProps {
  initialValues?: EmissionTest;
  onSubmit: (values: TestFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  vehicles: Vehicle[];
  isLoadingVehicles: boolean;
  onSearchVehicle: (identifier: string) => Promise<Vehicle | null>;
  scheduleYear?: number;
  scheduleQuarter?: number;
}

export const EmissionTestForm: React.FC<EmissionTestFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  vehicles,
  isLoadingVehicles,
  onSearchVehicle,
  scheduleYear,
  scheduleQuarter,
}) => {
  // State for vehicle search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Vehicle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [open, setOpen] = useState(false);

  // Format incoming date for the form
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch (error) {
      return format(new Date(), "yyyy-MM-dd");
    }
  };  // Set default values - Aligned with database schema
  const defaultValues: TestFormValues = {
    vehicleId: initialValues?.vehicle_id || "",
    testDate: initialValues?.test_date
      ? formatDate(initialValues.test_date)
      : format(new Date(), "yyyy-MM-dd"),
    year: initialValues?.year || scheduleYear || new Date().getFullYear(),
    quarter:
      initialValues?.quarter ||
      scheduleQuarter ||
      Math.ceil((new Date().getMonth() + 1) / 3),
    result: initialValues?.result ?? null,
    co_level: initialValues?.co_level,
    hc_level: initialValues?.hc_level,
    opacimeter_result: initialValues?.opacimeter_result,
    remarks: initialValues?.remarks,
    technician_name: initialValues?.technician_name,
    testing_center: initialValues?.testing_center,
  };

  // Initialize form
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues,
  });

  // Determine if vehicle is Gasoline or Diesel
  const isGasoline = selectedVehicle?.engine_type?.toLowerCase().includes('gasoline');
  const isDiesel = selectedVehicle?.engine_type?.toLowerCase().includes('diesel');

  // Form submission
  const handleSubmit = (values: TestFormValues) => {
    onSubmit(values);
  };

  // Search for vehicle
  const handleSearchVehicle = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const vehicle = await onSearchVehicle(searchQuery);
      if (vehicle) {
        setSelectedVehicle(vehicle);
        form.setValue("vehicleId", vehicle.id);
        setSearchResults([vehicle]);
      } else {        // If exact match not found, filter from available vehicles
        const filteredVehicles = vehicles.filter(
          (v) =>
            v.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.driver_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filteredVehicles.slice(0, 10));
      }
    } catch (error) {
      console.error("Error searching vehicle:", error);
    } finally {
      setIsSearching(false);
    }
  };
  // Update selected vehicle when changed
  useEffect(() => {
    if (initialValues?.vehicle_id) {
      const vehicle = vehicles.find((v) => v.id === initialValues.vehicle_id);
      if (vehicle) {
        setSelectedVehicle(vehicle);
      }
    }
  }, [initialValues, vehicles]);

  // Update search results when vehicles change
  useEffect(() => {
    if (!isLoadingVehicles && vehicles.length > 0) {
      setSearchResults(vehicles.slice(0, 10));
    }
  }, [isLoadingVehicles, vehicles]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Vehicle Selection */}
        <FormField
          control={form.control}
          name="vehicleId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Vehicle</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >                      {field.value && selectedVehicle
                      ? `${selectedVehicle.plate_number} - ${selectedVehicle.driver_name}`
                      : "Search for a vehicle..."}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="flex items-center border-b px-3 py-2">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                      placeholder="Search by plate number or driver name"
                      className="border-0 focus-visible:ring-0"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSearchVehicle();
                        }
                      }}
                    />
                  </div>
                  <Command>
                    <CommandList>
                      {isSearching ? (
                        <CommandEmpty className="py-6 flex items-center justify-center">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Searching...
                        </CommandEmpty>
                      ) : (
                        <>
                          {searchResults.length === 0 && (
                            <CommandEmpty>No vehicles found.</CommandEmpty>
                          )}
                          <CommandGroup>
                            {searchResults.map((vehicle) => (
                              <CommandItem
                                key={vehicle.id}
                                onSelect={() => {
                                  form.setValue("vehicleId", vehicle.id);
                                  setSelectedVehicle(vehicle);
                                  setOpen(false);
                                }}
                                className="cursor-pointer"
                              >                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {vehicle.plate_number}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {vehicle.driver_name} - {vehicle.office?.name || "Unknown Office"}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Test Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Year */}
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="2020"
                    max="2030"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
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
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
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

        {/* Date */}
        <FormField
          control={form.control}
          name="testDate"
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

        {/* Emission Measurements */}
        {isGasoline && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="co_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CO Level (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 1.93"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hc_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HC Level (ppm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 1300"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {isDiesel && (
          <FormField
            control={form.control}
            name="opacimeter_result"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opacimeter Test Result (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 15.5"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="technician_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Technician Name - Optional</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., John Doe" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="testing_center"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Testing Center - Optional</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., LTO Testing Center" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remarks - Optional</FormLabel>
              <FormControl>
                <Input placeholder="Additional notes" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />        {/* Result */}
        <FormField
          control={form.control}
          name="result"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Test Result</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    if (value === "passed") field.onChange(true);
                    else if (value === "failed") field.onChange(false);
                    else field.onChange(null);
                  }}
                  defaultValue={
                    field.value === true ? "passed" :
                      field.value === false ? "failed" :
                        "not-tested"
                  }
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="not-tested" />
                    </FormControl>
                    <FormLabel className="font-normal text-gray-600">
                      Not Tested
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="passed" />
                    </FormControl>
                    <FormLabel className="font-normal text-green-600">
                      Passed
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="failed" />
                    </FormControl>
                    <FormLabel className="font-normal text-red-600">
                      Failed
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

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
                ? "Update Test"
                : "Add Test"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EmissionTestForm;
