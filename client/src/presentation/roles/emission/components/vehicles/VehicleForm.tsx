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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/core/utils/utils";

// Form schema with validation
const vehicleSchema = z.object({
  plateNumber: z
    .string()
    .min(3, { message: "Plate number must be at least 3 characters" })
    .max(20, { message: "Plate number must be at most 20 characters" }),
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
});

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
}) => {
  // Set default values
  const defaultValues: VehicleFormValues = {
    plateNumber: initialValues ? initialValues.plateNumber : "",
    driverName: initialValues ? initialValues.driverName : "",
    contactNumber: initialValues?.contactNumber || "",
    officeName: initialValues ? initialValues.officeName : offices[0] || "",
    vehicleType: initialValues
      ? initialValues.vehicleType
      : vehicleTypes[0] || "",
    engineType: initialValues ? initialValues.engineType : engineTypes[0] || "",
    wheels: initialValues ? initialValues.wheels : 4,
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
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Plate Number */}
        <FormField
          control={form.control}
          name="plateNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plate Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. ABC-123" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Driver Name */}
        <FormField
          control={form.control}
          name="driverName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Driver Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. John Doe" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Contact Number */}
        <FormField
          control={form.control}
          name="contactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. +63 912 345 6789" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Office */}
          <FormField
            control={form.control}
            name="officeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Office</FormLabel>
                <FormControl>
                  <Popover open={openOffice} onOpenChange={setOpenOffice}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openOffice}
                        className="w-full justify-between"
                      >
                        {field.value || "Select or type office..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
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
                        <CommandGroup>
                          {offices.map((office) => (
                            <CommandItem
                              key={office}
                              value={office}
                              onSelect={() => {
                                field.onChange(office);
                                setOpenOffice(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === office
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {office}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Vehicle Type */}
          <FormField
            control={form.control}
            name="vehicleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Type</FormLabel>
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
                        className="w-full justify-between"
                      >
                        {field.value || "Select or type vehicle type..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
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
                        <CommandGroup>
                          {vehicleTypes.map((type) => (
                            <CommandItem
                              key={type}
                              value={type}
                              onSelect={() => {
                                field.onChange(type);
                                setOpenVehicleType(false);
                              }}
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
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Engine Type */}
          <FormField
            control={form.control}
            name="engineType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Engine Type</FormLabel>
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
                        className="w-full justify-between"
                      >
                        {field.value || "Select or type engine type..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
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
                        <CommandGroup>
                          {engineTypes.map((type) => (
                            <CommandItem
                              key={type}
                              value={type}
                              onSelect={() => {
                                field.onChange(type);
                                setOpenEngineType(false);
                              }}
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
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Wheels */}
          <FormField
            control={form.control}
            name="wheels"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wheels</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={2}
                    max={18}
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        Math.max(2, Math.min(18, Number(e.target.value)))
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || form.formState.isSubmitting}
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
