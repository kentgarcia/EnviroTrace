import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/presentation/components/shared/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/presentation/components/shared/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/presentation/components/shared/ui/form";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Input } from "@/presentation/components/shared/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/presentation/components/shared/ui/select";
import { Vehicle, EmissionTest } from "@/core/api/emission-service";

const testFormSchema = z.object({
    result: z.boolean(),
    test_date: z.string(),
    co_level: z.number().min(0).max(100).optional(),
    hc_level: z.number().min(0).max(10000).optional(),
    remarks: z.string().optional(),
});

type TestFormValues = z.infer<typeof testFormSchema>;

interface QuickTestFormProps {
    isOpen: boolean;
    onClose: () => void;
    vehicle: Vehicle | null;
    quarter: number;
    year: number | null;
    testToEdit: EmissionTest | null;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting: boolean;
}

export function QuickTestForm({
    isOpen,
    onClose,
    vehicle,
    quarter,
    year,
    testToEdit,
    onSubmit,
    isSubmitting,
}: QuickTestFormProps) {
    const form = useForm<TestFormValues>({
        resolver: zodResolver(testFormSchema),
        defaultValues: {
            result: testToEdit?.result || false,
            test_date: testToEdit?.test_date ? new Date(testToEdit.test_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            co_level: testToEdit?.co_level,
            hc_level: testToEdit?.hc_level,
            remarks: testToEdit?.remarks,
        },
    });

    React.useEffect(() => {
        if (isOpen && testToEdit) {
            form.reset({
                result: testToEdit.result ?? false,
                test_date: testToEdit.test_date ? new Date(testToEdit.test_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                co_level: testToEdit.co_level,
                hc_level: testToEdit.hc_level,
                remarks: testToEdit.remarks || "",
            });
        } else if (isOpen) {
            form.reset({
                result: false,
                test_date: new Date().toISOString().split('T')[0],
                co_level: undefined,
                hc_level: undefined,
                remarks: "",
            });
        }
    }, [isOpen, testToEdit, form]);

    const handleSubmit = async (data: TestFormValues) => {
        if (!vehicle || !year) return;

        const submissionData = {
            vehicle_id: vehicle.id,
            quarter,
            year,
            result: data.result,
            test_date: data.test_date,
            co_level: data.co_level,
            hc_level: data.hc_level,
            remarks: data.remarks || "",
        };

        await onSubmit(submissionData);
        onClose();
    };

    const quarterName = `Q${quarter}`;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {testToEdit ? "Edit" : "Record"} {quarterName} Result
                    </DialogTitle>
                    <DialogDescription className="text-white/90 font-medium">
                        Vehicle: <span className="text-white font-bold">{vehicle?.plate_number || vehicle?.chassis_number || vehicle?.registration_number}</span>
                        <br />
                        Driver: <span className="text-white/95">{vehicle?.driver_name || "N/A"}</span>
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        {/* Test Result */}
                        <FormField
                            control={form.control}
                            name="result"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Test Outcome</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(value === "true")}
                                        value={field.value.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select test result" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="true" className="focus:bg-emerald-50 focus:text-emerald-700">
                                                <div className="flex items-center py-1">
                                                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-3 shadow-sm shadow-emerald-200"></div>
                                                    <span className="font-bold">PASSED</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="false" className="focus:bg-rose-50 focus:text-rose-700">
                                                <div className="flex items-center py-1">
                                                    <div className="w-2.5 h-2.5 bg-rose-500 rounded-full mr-3 shadow-sm shadow-rose-200"></div>
                                                    <span className="font-bold">FAILED</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Test Date */}
                        <FormField
                            control={form.control}
                            name="test_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Test Date</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            className="h-10 border-slate-200 focus:ring-blue-500"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Emission Measurements */}
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="co_level"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">CO Level</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="h-10 border-slate-200 focus:ring-blue-500"
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
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">HC Level</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="h-10 border-slate-200 focus:ring-blue-500"
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

                        {/* Remarks */}
                        <FormField
                            control={form.control}
                            name="remarks"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Additional Remarks</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter any observations or reasons for failure..."
                                            className="resize-none min-h-[100px] border-slate-200 focus:ring-blue-500 bg-slate-50/50 focus:bg-white transition-all"
                                            {...field}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="bg-slate-50 px-6 py-4 -mx-6 -mb-6 mt-4 border-t border-slate-100">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : testToEdit ? "Update Result" : "Save Result"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}