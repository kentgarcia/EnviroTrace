import React from "react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Vehicle, VehicleInput } from "@/hooks/useVehicles";

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
    // Set default values - properly handling required fields
    const defaultValues: VehicleFormValues = {
        plateNumber: initialValues ? initialValues.plateNumber : "",
        driverName: initialValues ? initialValues.driverName : "",
        contactNumber: initialValues?.contactNumber || "",
        officeName: initialValues ? initialValues.officeName : (offices.length > 0 ? offices[0] : ""),
        vehicleType: initialValues ? initialValues.vehicleType : (vehicleTypes.length > 0 ? vehicleTypes[0] : ""),
        engineType: initialValues ? initialValues.engineType : (engineTypes.length > 0 ? engineTypes[0] : ""),
        wheels: initialValues ? initialValues.wheels : 4,
    };

    // Initialize form
    const form = useForm<VehicleFormValues>({
        resolver: zodResolver(vehicleSchema),
        defaultValues,
    });

    const handleSubmit = (values: VehicleFormValues) => {
        // Ensure that we're passing a valid VehicleInput object
        const vehicleData: VehicleInput = {
            plateNumber: values.plateNumber,
            driverName: values.driverName,
            contactNumber: values.contactNumber,
            officeName: values.officeName,
            vehicleType: values.vehicleType,
            engineType: values.engineType,
            wheels: values.wheels
        };
        onSubmit(vehicleData);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select office" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {offices.map(office => (
                                            <SelectItem key={office} value={office}>{office}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                {vehicleTypes.length > 0 ? (
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select vehicle type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {vehicleTypes.map(type => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <FormControl>
                                        <Input {...field} placeholder="e.g. Sedan, SUV, Truck" />
                                    </FormControl>
                                )}
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
                                {engineTypes.length > 0 ? (
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select engine type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {engineTypes.map(type => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <FormControl>
                                        <Input {...field} placeholder="e.g. Gas, Diesel, Electric" />
                                    </FormControl>
                                )}
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
                                {wheelCounts.length > 0 ? (
                                    <Select
                                        onValueChange={(value) => field.onChange(parseInt(value))}
                                        defaultValue={field.value.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select wheel count" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {wheelCounts.map(count => (
                                                <SelectItem key={count} value={count}>{count} wheels</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={2}
                                            max={18}
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : initialValues ? "Update Vehicle" : "Add Vehicle"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};