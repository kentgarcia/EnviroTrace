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
        referenceNumber: initialData?.referenceNumber || "",
        type: initialData?.type || "inspection",
        amount: initialData?.amount || 0,
        payerName: initialData?.payerName || "",
        date: initialData?.date ? new Date(initialData.date) : new Date(),
        dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : new Date(),
        status: initialData?.status || "pending",
        orNumber: initialData?.orNumber || "",
        paymentDate: initialData?.paymentDate ? new Date(initialData.paymentDate) : null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.referenceNumber || !formData.payerName || formData.amount <= 0) {
            toast.error("Please fill in all required fields");
            return;
        }

        onSave({
            ...formData,
            date: formData.date.toISOString().split('T')[0],
            dueDate: formData.dueDate.toISOString().split('T')[0],
            paymentDate: formData.paymentDate ? formData.paymentDate.toISOString().split('T')[0] : undefined,
            id: initialData?.id || `FR-${Date.now()}`,
        });

        toast.success(mode === "add" ? "Fee record added successfully" : "Fee record updated successfully");
    };

    const isReadOnly = mode === "view";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="referenceNumber">Reference Number *</Label>
                    <Input
                        id="referenceNumber"
                        value={formData.referenceNumber}
                        onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                        placeholder="2025-FEE-001"
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
                            <SelectItem value="inspection">Inspection Fee</SelectItem>
                            <SelectItem value="cutting_permit">Cutting Permit</SelectItem>
                            <SelectItem value="pruning_permit">Pruning Permit</SelectItem>
                            <SelectItem value="violation_fine">Violation Fine</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="payerName">Payer Name *</Label>
                    <Input
                        id="payerName"
                        value={formData.payerName}
                        onChange={(e) => setFormData({ ...formData, payerName: e.target.value })}
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

            <div className="grid grid-cols-2 gap-4">        <div>
                <Label htmlFor="date">Fee Date</Label>
                <DatePicker
                    selected={formData.date}
                    onSelect={isReadOnly ? undefined : (date) => date && setFormData({ ...formData, date })}
                />
            </div>        <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <DatePicker
                        selected={formData.dueDate}
                        onSelect={isReadOnly ? undefined : (date) => date && setFormData({ ...formData, dueDate: date })}
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
                    <Label htmlFor="orNumber">OR Number</Label>
                    <Input
                        id="orNumber"
                        value={formData.orNumber}
                        onChange={(e) => setFormData({ ...formData, orNumber: e.target.value })}
                        placeholder="Official Receipt Number"
                        disabled={isReadOnly}
                    />
                </div>
            </div>

            {formData.status === "paid" && (
                <div>          <Label htmlFor="paymentDate">Payment Date</Label>
                    <DatePicker
                        selected={formData.paymentDate || undefined}
                        onSelect={isReadOnly ? undefined : (date) => setFormData({ ...formData, paymentDate: date || null })}
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
