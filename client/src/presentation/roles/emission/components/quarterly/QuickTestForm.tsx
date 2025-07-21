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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {testToEdit ? "Edit" : "Add"} {quarterName} Test Result
                    </DialogTitle>
                    <DialogDescription>
                        Recording test result for {vehicle?.plate_number} ({vehicle?.driver_name}) - {quarterName} {year}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        {/* Test Result */}
                        <FormField
                            control={form.control}
                            name="result"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Test Result</FormLabel>
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
                                            <SelectItem value="true">
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                    Pass
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="false">
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                                    Fail
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
                                <FormItem>
                                    <FormLabel>Remarks (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any additional notes about this test..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : testToEdit ? "Update" : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}