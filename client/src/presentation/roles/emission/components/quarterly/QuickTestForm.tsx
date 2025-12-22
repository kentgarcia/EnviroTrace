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
        },
    });

    React.useEffect(() => {
        if (isOpen && testToEdit) {
            form.reset({
                result: testToEdit.result ?? false,
                remarks: testToEdit.remarks || "",
            });
        } else if (isOpen) {
            form.reset({
                result: false,
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
            remarks: data.remarks || "",
            // Set current date automatically
            test_date: new Date().toISOString().split('T')[0],
        };

        await onSubmit(submissionData);
        onClose();
    };

    const quarterName = `Q${quarter}`;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="text-xl font-bold text-slate-900">
                        {testToEdit ? "Edit" : "Record"} {quarterName} Result
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">
                        Vehicle: <span className="text-slate-900 font-bold">{vehicle?.plate_number || vehicle?.chassis_number || vehicle?.registration_number}</span>
                        <br />
                        Driver: <span className="text-slate-700">{vehicle?.driver_name || "N/A"}</span>
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 px-6 py-4">
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
                                            <SelectTrigger className="h-12 border-slate-200 focus:ring-blue-500">
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
                                className="font-bold text-xs uppercase tracking-wider text-slate-500"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-[#0033a0] hover:bg-[#002a80] font-bold text-xs uppercase tracking-wider px-8 shadow-lg shadow-blue-900/20"
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