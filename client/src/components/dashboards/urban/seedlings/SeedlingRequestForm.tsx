import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { SeedlingRequestInput } from "@/hooks/urban/useSeedlingRequests";
import { Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Form schema for validation
const seedlingItemSchema = z.object({
    name: z.string().min(1, "Name is required"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

const seedlingRequestSchema = z.object({
    dateReceived: z.string().refine(
        (date) => {
            try {
                return !isNaN(new Date(date).getTime());
            } catch {
                return false;
            }
        },
        { message: "Please enter a valid date" }
    ),
    requesterName: z.string().min(2, "Requester name must be at least 2 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    notes: z.string().optional(),
    items: z.array(seedlingItemSchema).min(1, "At least one seedling item is required")
});

type SeedlingRequestFormValues = z.infer<typeof seedlingRequestSchema>;

interface SeedlingRequestFormProps {
    initialValues?: SeedlingRequestInput;
    onSubmit: (values: SeedlingRequestInput) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

export const SeedlingRequestForm: React.FC<SeedlingRequestFormProps> = ({
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting
}) => {
    // Set default values
    const defaultValues: SeedlingRequestFormValues = {
        dateReceived: initialValues?.dateReceived || format(new Date(), "yyyy-MM-dd"),
        requesterName: initialValues?.requesterName || "",
        address: initialValues?.address || "",
        notes: initialValues?.notes || "",
        items: initialValues?.items || [{ name: "", quantity: 1 }]
    };

    // Initialize form
    const form = useForm<SeedlingRequestFormValues>({
        resolver: zodResolver(seedlingRequestSchema),
        defaultValues,
    });

    // Handle form submission
    const handleSubmit = (values: SeedlingRequestFormValues) => {
        onSubmit(values);
    };

    // Add new seedling item
    const addItem = () => {
        const currentItems = form.getValues().items || [];
        form.setValue("items", [...currentItems, { name: "", quantity: 1 }]);
    };

    // Remove seedling item
    const removeItem = (index: number) => {
        const currentItems = form.getValues().items || [];
        if (currentItems.length > 1) {
            const newItems = [...currentItems];
            newItems.splice(index, 1);
            form.setValue("items", newItems);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Date Received */}
                <FormField
                    control={form.control}
                    name="dateReceived"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date Received</FormLabel>
                            <FormControl>
                                <Input
                                    type="date"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Requester Name */}
                <FormField
                    control={form.control}
                    name="requesterName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Requester Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter the name of the requestor"
                                    {...field}
                                />
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
                                <Input
                                    placeholder="Enter the address"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Seedling Items */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <FormLabel>Seedling Items</FormLabel>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addItem}
                            className="h-8"
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            Add Item
                        </Button>
                    </div>

                    {/* Display form error if items array is empty */}
                    {form.formState.errors.items?.message && (
                        <p className="text-sm font-medium text-destructive">
                            {form.formState.errors.items.message}
                        </p>
                    )}

                    {/* Items list */}
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            {form.watch("items")?.map((_, index) => (
                                <div key={index} className="flex gap-2 items-start">
                                    {/* Item Name */}
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl>
                                                    <Input
                                                        placeholder="Seedling variety/name"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Item Quantity */}
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem className="w-24">
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Remove button */}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem(index)}
                                        disabled={form.watch("items").length <= 1}
                                        className="mt-1"
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Notes */}
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Any additional information about the request"
                                    className="min-h-20"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Form Actions */}
                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : initialValues ? "Update Request" : "Add Request"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};