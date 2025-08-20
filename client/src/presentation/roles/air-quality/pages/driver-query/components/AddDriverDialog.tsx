import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/presentation/components/shared/ui/dialog";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { User, Plus } from "lucide-react";
import { createDriver } from "@/core/api/belching-api";
import { toast } from "sonner";

interface AddDriverDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDriverCreated: () => void;
}

const AddDriverDialog: React.FC<AddDriverDialogProps> = ({
    open,
    onOpenChange,
    onDriverCreated,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        address: "",
        license_number: "",
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.address.trim() || !formData.license_number.trim()) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);

        try {
            await createDriver({
                first_name: formData.first_name.trim(),
                middle_name: formData.middle_name.trim() || undefined,
                last_name: formData.last_name.trim(),
                address: formData.address.trim(),
                license_number: formData.license_number.trim(),
            });

            toast.success("Driver created successfully!");
            onDriverCreated();
            handleClose();
        } catch (error) {
            toast.error("Failed to create driver. Please try again.");
            console.error("Error creating driver:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            first_name: "",
            middle_name: "",
            last_name: "",
            address: "",
            license_number: "",
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Add New Driver
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Driver Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Driver Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    value={formData.first_name}
                                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                                    placeholder="Enter first name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="middleName">Middle Name</Label>
                                <Input
                                    id="middleName"
                                    value={formData.middle_name}
                                    onChange={(e) => handleInputChange("middle_name", e.target.value)}
                                    placeholder="Enter middle name (optional)"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    value={formData.last_name}
                                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                                    placeholder="Enter last name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="licenseNumber">License Number *</Label>
                                <Input
                                    id="licenseNumber"
                                    value={formData.license_number}
                                    onChange={(e) => handleInputChange("license_number", e.target.value)}
                                    placeholder="e.g., N01-12-123456"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address *</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                                placeholder="Enter complete address"
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>Creating...</>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Driver
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddDriverDialog;
