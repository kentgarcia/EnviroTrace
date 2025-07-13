import React, { useState } from "react";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { Button } from "@/presentation/components/shared/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/presentation/components/shared/ui/select";
import { DatePicker } from "@/presentation/components/shared/ui/date-picker";
import { Checkbox } from "@/presentation/components/shared/ui/checkbox";
import { toast } from "sonner";

interface InspectionReportFormProps {
    mode: "add" | "edit" | "view";
    initialData?: any;
    onSave: (data: any) => void;
    onCancel: () => void;
}

const InspectionReportForm: React.FC<InspectionReportFormProps> = ({
    mode,
    initialData,
    onSave,
    onCancel,
}) => {
    const [formData, setFormData] = useState({
        reportNumber: initialData?.reportNumber || "",
        inspectorName: initialData?.inspectorName || "",
        date: initialData?.date ? new Date(initialData.date) : new Date(),
        location: initialData?.location || "",
        type: initialData?.type || "pruning",
        status: initialData?.status || "pending",
        findings: initialData?.findings || "",
        recommendations: initialData?.recommendations || "",
        followUpRequired: initialData?.followUpRequired || false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.reportNumber || !formData.inspectorName || !formData.location) {
            toast.error("Please fill in all required fields");
            return;
        }

        onSave({
            ...formData,
            date: formData.date.toISOString().split('T')[0],
            id: initialData?.id || `IR-${Date.now()}`,
        });

        toast.success(mode === "add" ? "Report added successfully" : "Report updated successfully");
    };

    const isReadOnly = mode === "view";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="reportNumber">Report Number *</Label>
                    <Input
                        id="reportNumber"
                        value={formData.reportNumber}
                        onChange={(e) => setFormData({ ...formData, reportNumber: e.target.value })}
                        placeholder="2025-IR-001"
                        disabled={isReadOnly}
                    />
                </div>
                <div>
                    <Label htmlFor="inspectorName">Inspector Name *</Label>
                    <Input
                        id="inspectorName"
                        value={formData.inspectorName}
                        onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                        placeholder="Enter inspector name"
                        disabled={isReadOnly}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">        <div>
                <Label htmlFor="date">Inspection Date</Label>
                <DatePicker
                    selected={formData.date}
                    onSelect={isReadOnly ? undefined : (date) => date && setFormData({ ...formData, date })}
                />
            </div>
                <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Enter location"
                        disabled={isReadOnly}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="type">Inspection Type</Label>
                    <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                        disabled={isReadOnly}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pruning">Pruning</SelectItem>
                            <SelectItem value="cutting">Tree Cutting</SelectItem>
                            <SelectItem value="violation">Violation</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
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
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Label htmlFor="findings">Findings</Label>
                <Textarea
                    id="findings"
                    value={formData.findings}
                    onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                    placeholder="Describe the findings from the inspection"
                    rows={3}
                    disabled={isReadOnly}
                />
            </div>

            <div>
                <Label htmlFor="recommendations">Recommendations</Label>
                <Textarea
                    id="recommendations"
                    value={formData.recommendations}
                    onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                    placeholder="Enter recommendations based on findings"
                    rows={3}
                    disabled={isReadOnly}
                />
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="followUpRequired"
                    checked={formData.followUpRequired}
                    onCheckedChange={(checked) => setFormData({ ...formData, followUpRequired: !!checked })}
                    disabled={isReadOnly}
                />
                <Label htmlFor="followUpRequired">Follow-up required</Label>
            </div>

            {!isReadOnly && (
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {mode === "add" ? "Add Report" : "Save Changes"}
                    </Button>
                </div>
            )}
        </form>
    );
};

export default InspectionReportForm;
