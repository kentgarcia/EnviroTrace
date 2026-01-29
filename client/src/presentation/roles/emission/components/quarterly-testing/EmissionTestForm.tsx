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
import { EmissionTest, Vehicle } from '@/core/api/emission-service';
import { Combobox } from "@/presentation/components/shared/ui/combobox";
import { Switch } from "@/presentation/components/shared/ui/switch";
import { Label } from "@/presentation/components/shared/ui/label";

const formSchema = z.object({
    vehicle_id: z.string().uuid(),
    test_date: z.string(),
    result: z.boolean(),
    co_level: z.number().min(0).max(100).optional(),
    hc_level: z.number().min(0).max(10000).optional(),
    opacimeter_result: z.number().min(0).max(100).optional(),
    remarks: z.string().optional(),
    technician_name: z.string().min(3).optional(),
    testing_center: z.string().min(3).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EmissionTestFormProps {
    initialValues?: Partial<EmissionTest>;
    onSubmit: (data: FormValues) => void;
    onCancel: () => void;
    isSubmitting: boolean;
    vehicles: Vehicle[];
    isLoadingVehicles: boolean;
    onSearchVehicle: (term: string) => Promise<Vehicle | null>;
    scheduleYear?: number;
    scheduleQuarter?: number;
}

export function EmissionTestForm({
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting,
    vehicles,
    isLoadingVehicles,
    onSearchVehicle,
    scheduleYear,
    scheduleQuarter,
}: EmissionTestFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            vehicle_id: initialValues?.vehicle_id || '',
            test_date: initialValues?.test_date
                ? new Date(initialValues.test_date).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
            result: initialValues?.result ?? false,
            co_level: initialValues?.co_level || 0,
            hc_level: initialValues?.hc_level || 0,
            opacimeter_result: initialValues?.opacimeter_result || 0,
            remarks: initialValues?.remarks || '',
            technician_name: initialValues?.technician_name || '',
            testing_center: initialValues?.testing_center || '',
        },
    });

    const vehicleOptions = vehicles.map(v => ({
        label: `${v.plate_number} - ${v.driver_name}`,
        value: v.id,
    }));

    // Get selected vehicle to determine fuel type
    const selectedVehicleId = form.watch('vehicle_id');
    const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
    const isGasoline = selectedVehicle?.engine_type?.toLowerCase().includes('gasoline');
    const isDiesel = selectedVehicle?.engine_type?.toLowerCase().includes('diesel');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="vehicle_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Vehicle</FormLabel>
                            <FormControl>
                                <Combobox
                                    items={vehicleOptions}
                                    value={field.value}
                                    onChange={(value) => field.onChange(value)}
                                    placeholder="Search by plate number"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="test_date"
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
                    name="result"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <Label>Test Result (Pass/Fail)</Label>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {isGasoline && (
                    <div className="grid grid-cols-2 gap-4">
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
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
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
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
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
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="technician_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Technician Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
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
                            <FormLabel>Testing Center</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="remarks"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Remarks</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
