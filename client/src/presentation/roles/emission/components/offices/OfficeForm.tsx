import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/presentation/components/shared/ui/form";
import { Input } from "@/presentation/components/shared/ui/input";
import { Button } from "@/presentation/components/shared/ui/button";
import { Office } from "@/core/api/emission-service";

// Form schema with validation
const officeSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Office name must be at least 2 characters" })
        .max(100, { message: "Office name must not exceed 100 characters" }),
    address: z
        .string()
        .min(5, { message: "Address must be at least 5 characters" })
        .max(255, { message: "Address must not exceed 255 characters" })
        .optional()
        .or(z.literal("")),
    contact_number: z
        .string()
        .min(7, { message: "Contact number must be at least 7 characters" })
        .max(20, { message: "Contact number must not exceed 20 characters" })
        .optional()
        .or(z.literal("")),
    email: z
        .string()
        .email({ message: "Please enter a valid email address" })
        .max(100, { message: "Email must not exceed 100 characters" })
        .optional()
        .or(z.literal("")),
});

type OfficeFormValues = z.infer<typeof officeSchema>;

interface OfficeFormProps {
    initialValues?: Partial<Office>;
    onSubmit: (values: OfficeFormValues) => void;
    onCancel: () => void;
    isLoading: boolean;
}

export const OfficeForm: React.FC<OfficeFormProps> = ({
    initialValues,
    onSubmit,
    onCancel,
    isLoading,
}) => {
    // Set default values
    const defaultValues: OfficeFormValues = {
        name: initialValues?.name || "",
        address: initialValues?.address || "",
        contact_number: initialValues?.contact_number || "",
        email: initialValues?.email || "",
    };

    const form = useForm<OfficeFormValues>({
        defaultValues,
        resolver: zodResolver(officeSchema),
    });

    return (
        <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                {/* Office Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Office Name *</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="e.g. Department of Environment" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Address */}
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="e.g. 123 Main Street, City" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Contact Number */}
                <FormField
                    control={form.control}
                    name="contact_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Number</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="e.g. +63 2 1234 5678" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Email */}
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field} type="email" placeholder="e.g. office@government.ph" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
                                ? "Update Office"
                                : "Add Office"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
