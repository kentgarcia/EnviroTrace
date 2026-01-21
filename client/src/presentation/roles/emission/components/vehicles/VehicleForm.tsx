import React, { useState } from "react";
import { Input } from "@/presentation/components/shared/ui/input";
import { Button } from "@/presentation/components/shared/ui/button";
import * as z from "zod";
import { VehicleFormInput } from "@/core/api/emission-service";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/presentation/components/shared/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/presentation/components/shared/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/presentation/components/shared/ui/popover";
import { Check, ChevronsUpDown, RefreshCw } from "lucide-react";
import { cn } from "@/core/utils/utils";

// Form schema with validation
const vehicleSchema = z.object({
  plateNumber: z
    .string()
    .min(3, { message: "Plate number must be at least 3 characters" })
    .max(20, { message: "Plate number must be at most 20 characters" })
    .optional()
    .or(z.literal("")),
  chassisNumber: z
    .string()
    .min(3, { message: "Chassis number must be at least 3 characters" })
    .max(100, { message: "Chassis number must be at most 100 characters" })
    .optional()
    .or(z.literal("")),
  registrationNumber: z
    .string()
    .min(3, { message: "Registration number must be at least 3 characters" })
    .max(100, { message: "Registration number must be at most 100 characters" })
    .optional()
    .or(z.literal("")),
  driverName: z
    .string()
    .min(3, { message: "Driver name must be at least 3 characters" })
    .max(100, { message: "Driver name must be at most 100 characters" }),
  contactNumber: z
    .string()
    .max(20, { message: "Contact number must be at most 20 characters" })
    .default("")
    .optional(),
  officeName: z
    .string()
    .min(2, { message: "Office name must be at least 2 characters" }),
  vehicleType: z
    .string()
    .min(2, { message: "Vehicle type must be at least 2 characters" }),
  engineType: z
    .string()
    .min(2, { message: "Engine type must be at least 2 characters" }),
  wheels: z
    .number()
    .int()
    .min(2, { message: "Wheels must be at least 2" })
    .max(18, { message: "Wheels must be at most 18" }),
  description: z
    .string()
    .max(500, { message: "Description must be at most 500 characters" })
    .optional()
    .or(z.literal("")),
  yearAcquired: z
    .number()
    .int()
    .min(1900, { message: "Year must be 1900 or later" })
    .max(2026, { message: "Year must be 2026 or earlier" })
    .optional(),
}).refine(
  (data) => data.plateNumber || data.chassisNumber || data.registrationNumber,
  {
    message: "At least one of Plate Number, Chassis Number, or Registration Number is required",
    path: ["plateNumber"],
  }
);

type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
  initialValues?: VehicleFormInput;
  onSubmit: (values: VehicleFormInput) => void;
  onCancel: () => void;
  isLoading: boolean;
  vehicleTypes: string[];
  engineTypes: string[];
  wheelCounts: string[];
  offices: string[];
  onRefreshOffices?: () => void;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading,
  vehicleTypes,
  engineTypes,
  wheelCounts,
  offices,
  onRefreshOffices,
}) => {
  // Set default values
  const defaultValues: VehicleFormValues = {
    plateNumber: initialValues?.plateNumber || "",
    chassisNumber: initialValues?.chassisNumber || "",
    registrationNumber: initialValues?.registrationNumber || "",
    driverName: initialValues ? initialValues.driverName : "",
    contactNumber: initialValues?.contactNumber || "",
    officeName: initialValues ? initialValues.officeName : offices[0] || "",
    vehicleType: initialValues
      ? initialValues.vehicleType
      : vehicleTypes[0] || "",
    engineType: initialValues ? initialValues.engineType : engineTypes[0] || "",
    wheels: initialValues ? initialValues.wheels : 4,
    description: initialValues?.description || "",
    yearAcquired: initialValues?.yearAcquired,
  };

  const form = useForm<VehicleFormValues>({
    defaultValues,
    resolver: zodResolver(vehicleSchema),
  });

  // State for popover open state
  const [openOffice, setOpenOffice] = useState(false);
  const [openVehicleType, setOpenVehicleType] = useState(false);
  const [openEngineType, setOpenEngineType] = useState(false);

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Plate Number */}
          <FormField
            control={form.control}
            name="plateNumber"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Plate Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. ABC-123" className="rounded-lg border-slate-200 focus:ring-[#0033a0] focus:border-[#0033a0]" />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
          {/* Chassis Number */}
          <FormField
            control={form.control}
            name="chassisNumber"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Chassis Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Optional" className="rounded-lg border-slate-200 focus:ring-[#0033a0] focus:border-[#0033a0]" />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
          {/* Registration Number */}
          <FormField
            control={form.control}
            name="registrationNumber"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Registration Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Optional" className="rounded-lg border-slate-200 focus:ring-[#0033a0] focus:border-[#0033a0]" />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
          {/* Driver Name */}
          <FormField
            control={form.control}
            name="driverName"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Driver Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. John Doe" className="rounded-lg border-slate-200 focus:ring-[#0033a0] focus:border-[#0033a0]" />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
          {/* Contact Number */}
          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Contact Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Optional" className="rounded-lg border-slate-200 focus:ring-[#0033a0] focus:border-[#0033a0]" />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          {/* Office */}
          <FormField
            control={form.control}
            name="officeName"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Office</FormLabel>
                   {onRefreshOffices && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRefreshOffices();
                      }}
                      className="h-5 w-5 p-0 hover:bg-transparent"
                      title="Refresh offices"
                    >
                      <RefreshCw className="h-3 w-3 text-slate-400 hover:text-[#0033a0]" />
                    </Button>
                  )}
                </div>
                <FormControl>
                  <Popover open={openOffice} onOpenChange={setOpenOffice}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openOffice}
                        className="w-full justify-between rounded-lg border-slate-200 text-slate-700 font-medium px-3"
                      >
                        <span className="truncate flex-1 text-left">
                          {field.value || "Select office..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0 rounded-xl border-slate-200 shadow-lg" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search or type office..."
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" &&
                              !offices.includes(e.currentTarget.value)
                            ) {
                              setOpenOffice(false);
                            }
                          }}
                        />
                        <CommandEmpty>
                          No office found. Press enter to use typed value.
                        </CommandEmpty>
                        <CommandGroup className="max-h-60 overflow-auto">
                          {offices.map((office) => (
                            <CommandItem
                              key={office}
                              value={office}
                              onSelect={() => {
                                field.onChange(office);
                                setOpenOffice(false);
                              }}
                              className="rounded-md"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 shrink-0",
                                  field.value === office
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <span className="truncate">{office}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
          {/* Vehicle Type */}
          <FormField
            control={form.control}
            name="vehicleType"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Vehicle Type</FormLabel>
                <FormControl>
                  <Popover
                    open={openVehicleType}
                    onOpenChange={setOpenVehicleType}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openVehicleType}
                        className="w-full justify-between rounded-lg border-slate-200 text-slate-700 font-medium"
                      >
                        {field.value || "Select type..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 rounded-xl border-slate-200 shadow-lg">
                      <Command>
                        <CommandInput
                          placeholder="Search or type vehicle type..."
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" &&
                              !vehicleTypes.includes(e.currentTarget.value)
                            ) {
                              setOpenVehicleType(false);
                            }
                          }}
                        />
                        <CommandEmpty>
                          No vehicle type found. Press enter to use typed value.
                        </CommandEmpty>
                        <CommandGroup className="max-h-60 overflow-auto">
                          {vehicleTypes.map((type) => (
                            <CommandItem
                              key={type}
                              value={type}
                              onSelect={() => {
                                field.onChange(type);
                                setOpenVehicleType(false);
                              }}
                              className="rounded-md"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === type
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {type}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
          {/* Engine Type */}
          <FormField
            control={form.control}
            name="engineType"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Engine Type</FormLabel>
                <FormControl>
                  <Popover
                    open={openEngineType}
                    onOpenChange={setOpenEngineType}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openEngineType}
                        className="w-full justify-between rounded-lg border-slate-200 text-slate-700 font-medium"
                      >
                        {field.value || "Select engine..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 rounded-xl border-slate-200 shadow-lg">
                      <Command>
                        <CommandInput
                          placeholder="Search or type engine type..."
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" &&
                              !engineTypes.includes(e.currentTarget.value)
                            ) {
                              setOpenEngineType(false);
                            }
                          }}
                        />
                        <CommandEmpty>
                          No engine type found. Press enter to use typed value.
                        </CommandEmpty>
                        <CommandGroup className="max-h-60 overflow-auto">
                          {engineTypes.map((type) => (
                            <CommandItem
                              key={type}
                              value={type}
                              onSelect={() => {
                                field.onChange(type);
                                setOpenEngineType(false);
                              }}
                              className="rounded-md"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === type
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {type}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
          {/* Wheels */}
          <FormField
            control={form.control}
            name="wheels"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Wheels</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={2}
                    max={18}
                    {...field}
                    className="rounded-lg border-slate-200 focus:ring-[#0033a0] focus:border-[#0033a0]"
                    onChange={(e) =>
                      field.onChange(
                        Math.max(2, Math.min(18, Number(e.target.value)))
                      )
                    }
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
          {/* Year Acquired */}
          <FormField
            control={form.control}
            name="yearAcquired"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Year Acquired</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1900}
                    max={2026}
                    {...field}
                    value={field.value || ""}
                    placeholder="Optional"
                    className="rounded-lg border-slate-200 focus:ring-[#0033a0] focus:border-[#0033a0]"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? Number(value) : undefined);
                    }}
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>
        {/* Description - Full Width */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Description (Optional)</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  placeholder="Additional notes or description about the vehicle..."
                  className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-[#0033a0] focus:border-[#0033a0] resize-none"
                />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="rounded-lg border-slate-200 text-slate-600 font-medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || form.formState.isSubmitting}
            className="rounded-lg bg-[#0033a0] hover:bg-[#00267a] text-white font-semibold px-6"
          >
            {isLoading
              ? "Saving..."
              : initialValues
                ? "Update Vehicle"
                : "Add Vehicle"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
