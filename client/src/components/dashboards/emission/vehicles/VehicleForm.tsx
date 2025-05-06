import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import { VehicleInput } from "@/hooks/vehicles/useVehicles";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormField
} from "@/components/ui/form";

// Form schema with validation
const vehicleSchema = z.object({
    plateNumber: z.string()
        .min(3, { message: "Plate number must be at least 3 characters" })
        .max(20, { message: "Plate number must be at most 20 characters" }),
    driverName: z.string()
        .min(3, { message: "Driver name must be at least 3 characters" })
        .max(100, { message: "Driver name must be at most 100 characters" }),
    contactNumber: z.string()
        .max(20, { message: "Contact number must be at most 20 characters" })
        .default("")
        .optional(),
    officeName: z.string()
        .min(2, { message: "Office name must be at least 2 characters" }),
    vehicleType: z.string()
        .min(2, { message: "Vehicle type must be at least 2 characters" }),
    engineType: z.string()
        .min(2, { message: "Engine type must be at least 2 characters" }),
    wheels: z.number()
        .int()
        .min(2, { message: "Wheels must be at least 2" })
        .max(18, { message: "Wheels must be at most 18" }),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
    initialValues?: VehicleInput;
    onSubmit: (values: VehicleInput) => void;
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
    offices
}) => {
    // Set default values
    const defaultValues: VehicleFormValues = {
        plateNumber: initialValues ? initialValues.plateNumber : "",
        driverName: initialValues ? initialValues.driverName : "",
        contactNumber: initialValues?.contactNumber || "",
        officeName: initialValues ? initialValues.officeName : (offices[0] || ""),
        vehicleType: initialValues ? initialValues.vehicleType : (vehicleTypes[0] || ""),
        engineType: initialValues ? initialValues.engineType : (engineTypes[0] || ""),
        wheels: initialValues ? initialValues.wheels : 4,
    };

    const form = useForm<VehicleFormValues>({
        defaultValues,
        resolver: zodResolver(vehicleSchema),
    });

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
                                    <Input
                                        {...field}
                                        list="office-list"
                                        placeholder="Type or select office"
                                    />
                                </FormControl>
                                <datalist id="office-list">
                                    {offices.map(office => (
                                        <option key={office} value={office} />
                                    ))}
                                </datalist>
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
                                    <Input
                                        {...field}
                                        list="vehicle-type-list"
                                        placeholder="Type or select vehicle type"
                                    />
                                </FormControl>
                                <datalist id="vehicle-type-list">
                                    {vehicleTypes.map(type => (
                                        <option key={type} value={type} />
                                    ))}
                                </datalist>
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
                                    <Input
                                        {...field}
                                        list="engine-type-list"
                                        placeholder="Type or select engine type"
                                    />
                                </FormControl>
                                <datalist id="engine-type-list">
                                    {engineTypes.map(type => (
                                        <option key={type} value={type} />
                                    ))}
                                </datalist>
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
                                        step={1}
                                        {...field}
                                        onChange={e => field.onChange(Math.max(2, Math.min(18, Number(e.target.value))))}
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
                    <Button type="submit" disabled={isLoading || form.formState.isSubmitting}>
                        {isLoading ? "Saving..." : initialValues ? "Update Vehicle" : "Add Vehicle"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};