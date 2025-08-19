import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/presentation/components/shared/ui/dialog";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/shared/ui/select";
import { Loader2, Save, X } from "lucide-react";
import { createBelchingRecord } from "@/core/api/belching-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AddRecordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRecordCreated?: () => void;
}

const vehicleTypes = [
    "Bus",
    "Truck",
    "Jeepney",
    "Taxi",
    "Private",
    "Motorcycle",
    "Van",
    "SUV",
    "Sedan",
    "Pickup"
];

const AddRecordDialog: React.FC<AddRecordDialogProps> = ({
    open,
    onOpenChange,
    onRecordCreated
}) => {
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        // Vehicle Information
        plate_number: "",
        vehicle_type: "",
        custom_vehicle_type: "",
        transport_group: "",

        // Operator Information
        operator_company_name: "",
        operator_address: "",
        owner_first_name: "",
        owner_middle_name: "",
        owner_last_name: "",

        // Motor Information
        motor_no: "",
        motor_vehicle_name: ""
    });

    const createMutation = useMutation({
        mutationFn: createBelchingRecord,
        onSuccess: () => {
            toast.success("Vehicle record created successfully!");
            queryClient.invalidateQueries({ queryKey: ['belching-records'] });
            resetForm();
            onOpenChange(false);
            onRecordCreated?.();
        },
        onError: (error: any) => {
            toast.error("Failed to create vehicle record. Please try again.");
            console.error("Create record error:", error);
        }
    });

    const resetForm = () => {
        setFormData({
            plate_number: "",
            vehicle_type: "",
            custom_vehicle_type: "",
            transport_group: "",
            operator_company_name: "",
            operator_address: "",
            owner_first_name: "",
            owner_middle_name: "",
            owner_last_name: "",
            motor_no: "",
            motor_vehicle_name: ""
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.plate_number.trim()) {
            toast.error("Plate number is required");
            return;
        }

        if (!formData.vehicle_type.trim() && !formData.custom_vehicle_type.trim()) {
            toast.error("Vehicle type is required");
            return;
        }

        if (!formData.operator_company_name.trim()) {
            toast.error("Operator/Company name is required");
            return;
        }

        const finalVehicleType = formData.vehicle_type === "Custom"
            ? formData.custom_vehicle_type.trim()
            : formData.vehicle_type;

        const recordData = {
            plate_number: formData.plate_number.trim(),
            vehicle_type: finalVehicleType,
            transport_group: formData.transport_group.trim() || undefined,
            operator_company_name: formData.operator_company_name.trim(),
            operator_address: formData.operator_address.trim() || undefined,
            owner_first_name: formData.owner_first_name.trim() || undefined,
            owner_middle_name: formData.owner_middle_name.trim() || undefined,
            owner_last_name: formData.owner_last_name.trim() || undefined,
            motor_no: formData.motor_no.trim() || undefined,
            motor_vehicle_name: formData.motor_vehicle_name.trim() || undefined,
        };

        createMutation.mutate(recordData);
    };

    const handleClose = () => {
        if (!createMutation.isPending) {
            resetForm();
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Vehicle Record</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Vehicle Information Section */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Vehicle Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="plate_number">
                                    Plate Number <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="plate_number"
                                    placeholder="e.g., ABC-1234"
                                    value={formData.plate_number}
                                    onChange={(e) => setFormData(prev => ({ ...prev, plate_number: e.target.value }))}
                                    disabled={createMutation.isPending}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vehicle_type">
                                    Vehicle Type <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.vehicle_type}
                                    onValueChange={(value) => setFormData(prev => ({
                                        ...prev,
                                        vehicle_type: value,
                                        custom_vehicle_type: value === "Custom" ? prev.custom_vehicle_type : ""
                                    }))}
                                    disabled={createMutation.isPending}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select vehicle type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vehicleTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="Custom">Custom (Specify below)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {formData.vehicle_type === "Custom" && (
                            <div className="space-y-2">
                                <Label htmlFor="custom_vehicle_type">
                                    Custom Vehicle Type <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="custom_vehicle_type"
                                    placeholder="Enter custom vehicle type"
                                    value={formData.custom_vehicle_type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, custom_vehicle_type: e.target.value }))}
                                    disabled={createMutation.isPending}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="transport_group">Transport Group</Label>
                            <Input
                                id="transport_group"
                                placeholder="e.g., METRO MANILA BUS OPERATOR"
                                value={formData.transport_group}
                                onChange={(e) => setFormData(prev => ({ ...prev, transport_group: e.target.value }))}
                                disabled={createMutation.isPending}
                            />
                        </div>
                    </div>

                    {/* Operator Information Section */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Operator Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="operator_company_name">
                                Operator/Company Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="operator_company_name"
                                placeholder="Enter operator or company name"
                                value={formData.operator_company_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, operator_company_name: e.target.value }))}
                                disabled={createMutation.isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="operator_address">Company Address</Label>
                            <Input
                                id="operator_address"
                                placeholder="Enter company address"
                                value={formData.operator_address}
                                onChange={(e) => setFormData(prev => ({ ...prev, operator_address: e.target.value }))}
                                disabled={createMutation.isPending}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="owner_first_name">Owner First Name</Label>
                                <Input
                                    id="owner_first_name"
                                    placeholder="First name"
                                    value={formData.owner_first_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, owner_first_name: e.target.value }))}
                                    disabled={createMutation.isPending}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="owner_middle_name">Owner Middle Name</Label>
                                <Input
                                    id="owner_middle_name"
                                    placeholder="Middle name"
                                    value={formData.owner_middle_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, owner_middle_name: e.target.value }))}
                                    disabled={createMutation.isPending}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="owner_last_name">Owner Last Name</Label>
                                <Input
                                    id="owner_last_name"
                                    placeholder="Last name"
                                    value={formData.owner_last_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, owner_last_name: e.target.value }))}
                                    disabled={createMutation.isPending}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Motor Information Section */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Motor Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="motor_no">Motor No</Label>
                                <Input
                                    id="motor_no"
                                    placeholder="Enter motor number"
                                    value={formData.motor_no}
                                    onChange={(e) => setFormData(prev => ({ ...prev, motor_no: e.target.value }))}
                                    disabled={createMutation.isPending}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="motor_vehicle_name">Motor Vehicle No</Label>
                                <Input
                                    id="motor_vehicle_name"
                                    placeholder="Enter motor vehicle number"
                                    value={formData.motor_vehicle_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, motor_vehicle_name: e.target.value }))}
                                    disabled={createMutation.isPending}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={createMutation.isPending}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            {createMutation.isPending ? "Creating..." : "Create Record"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddRecordDialog;
