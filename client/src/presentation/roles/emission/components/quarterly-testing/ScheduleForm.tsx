import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/presentation/components/shared/ui/form';
import { Input } from '@/presentation/components/shared/ui/input';
import { Button } from '@/presentation/components/shared/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/presentation/components/shared/ui/select';

const formSchema = z.object({
    assigned_personnel: z.string().min(3, 'Personnel name must be at least 3 characters'),
    conducted_on: z.string(), // date string
    location: z.string().min(3, 'Location must be at least 3 characters'),
    quarter: z.number().min(1).max(4),
    year: z.number().min(2000).max(2100),
});

type FormValues = z.infer<typeof formSchema>;

interface ScheduleFormProps {
    initialValues?: any;
    onSubmit: (data: FormValues) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

export function ScheduleForm({
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting,
}: ScheduleFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialValues || {
            assigned_personnel: '',
            conducted_on: new Date().toISOString().split('T')[0],
            location: '',
            quarter: getCurrentQuarter(),
            year: new Date().getFullYear(),
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="assigned_personnel"
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

                <FormField
                    control={form.control}
                    name="conducted_on"
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

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter testing location" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="quarter"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quarter</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    defaultValue={String(field.value)}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select quarter" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="1">Q1</SelectItem>
                                        <SelectItem value="2">Q2</SelectItem>
                                        <SelectItem value="3">Q3</SelectItem>
                                        <SelectItem value="4">Q4</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Year</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : initialValues ? 'Update' : 'Create'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

// Helper function to get current quarter
function getCurrentQuarter(): number {
    const month = new Date().getMonth();
    return Math.floor(month / 3) + 1;
}
