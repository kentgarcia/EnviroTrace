import React, { useState } from "react";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Button } from "@/presentation/components/shared/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/presentation/components/shared/ui/select";
import { DatePicker } from "@/presentation/components/shared/ui/date-picker";
import { toast } from "sonner";

interface FeeRecordFormProps {
    mode: "add" | "edit" | "view";
    initialData?: any;
    onSave: (data: any) => void;
    onCancel: () => void;
}

const FeeRecordForm: React.FC<FeeRecordFormProps> = ({
    mode,
    initialData,
    onSave,
    onCancel,
}) => {
    const [formData, setFormData] = useState({
        reference_number: initialData?.reference_number || "",
        type: initialData?.type || "cutting_permit",
        amount: initialData?.amount || 0,
        payer_name: initialData?.payer_name || "",
        date: initialData?.date ? new Date(initialData.date) : new Date(),
        due_date: initialData?.due_date ? new Date(initialData.due_date) : new Date(),
        status: initialData?.status || "pending",
        or_number: initialData?.or_number || "",
        payment_date: initialData?.payment_date ? new Date(initialData.payment_date) : null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.reference_number || !formData.payer_name || formData.amount <= 0) {
            toast.error("Please fill in all required fields");
            return;
        }

        onSave({
            ...formData,
            date: formData.date.toISOString().split('T')[0],
            due_date: formData.due_date.toISOString().split('T')[0],
            payment_date: formData.payment_date ? formData.payment_date.toISOString().split('T')[0] : undefined,
            id: initialData?.id || `FR-${Date.now()}`,
        });

        toast.success(mode === "add" ? "Fee record added successfully" : "Fee record updated successfully");
    };

    const isReadOnly = mode === "view";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="reference_number">Reference Number *</Label>
                    <Input
                        id="reference_number"
                        value={formData.reference_number}
                        onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                        placeholder="UG-CP-2025-001"
                        disabled={isReadOnly}
                    />
                </div>
                <div>
                    <Label htmlFor="type">Fee Type</Label>
                    <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                        disabled={isReadOnly}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cutting_permit">Cutting Permit</SelectItem>
                            <SelectItem value="pruning_permit">Pruning Permit</SelectItem>
                            <SelectItem value="violation_fine">Violation Fine</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="payer_name">Payer Name *</Label>
                    <Input
                        id="payer_name"
                        value={formData.payer_name}
                        onChange={(e) => setFormData({ ...formData, payer_name: e.target.value })}
                        placeholder="Enter payer name"
                        disabled={isReadOnly}
                    />
                </div>
                <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        disabled={isReadOnly}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="date">Fee Date</Label>
                    <DatePicker
                        selected={formData.date}
                        onSelect={isReadOnly ? undefined : (date) => date && setFormData({ ...formData, date })}
                    />
                </div>
                <div>
                    <Label htmlFor="due_date">Due Date</Label>
                    <DatePicker
                        selected={formData.due_date}
                        onSelect={isReadOnly ? undefined : (date) => date && setFormData({ ...formData, due_date: date })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                        disabled={isReadOnly}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="or_number">OR Number</Label>
                    <Input
                        id="or_number"
                        value={formData.or_number}
                        onChange={(e) => setFormData({ ...formData, or_number: e.target.value })}
                        placeholder="Official Receipt Number"
                        disabled={isReadOnly}
                    />
                </div>
            </div>

            {formData.status === "paid" && (
                <div>
                    <Label htmlFor="payment_date">Payment Date</Label>
                    <DatePicker
                        selected={formData.payment_date || undefined}
                        onSelect={isReadOnly ? undefined : (date) => setFormData({ ...formData, payment_date: date || null })}
                    />
                </div>
            )}

            {!isReadOnly && (
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {mode === "add" ? "Add Fee Record" : "Save Changes"}
                    </Button>
                </div>
            )}
        </form>
    );
};

export default FeeRecordForm;
