import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/presentation/components/shared/ui/dialog";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Edit, Trash2, Save, X, User } from "lucide-react";
import { Driver } from "@/core/api/belching-api";
import { DriverFormData } from "../logic/useDriverQueryData";
import { toast } from "sonner";

interface DriverDetailsComponentProps {
    selectedDriver: Driver | null;
    onCreateDriver: (driverData: DriverFormData) => void;
    onUpdateDriver: (driverId: string, driverData: Partial<DriverFormData>) => void;
    onDeleteDriver: (driverId: string) => void;
}

const DriverDetailsComponent: React.FC<DriverDetailsComponentProps> = ({
    selectedDriver,
    onCreateDriver,
    onUpdateDriver,
    onDeleteDriver,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [formData, setFormData] = useState<DriverFormData>({
        first_name: "",
        middle_name: "",
        last_name: "",
        address: "",
        license_number: "",
    });

    // Reset form when selected driver changes
    useEffect(() => {
        if (selectedDriver) {
            setFormData({
                first_name: selectedDriver.first_name,
                middle_name: selectedDriver.middle_name || "",
                last_name: selectedDriver.last_name,
                address: selectedDriver.address,
                license_number: selectedDriver.license_number,
            });
            setIsEditing(false);
        } else {
            setFormData({
                first_name: "",
                middle_name: "",
                last_name: "",
                address: "",
                license_number: "",
            });
            setIsEditing(false);
        }
    }, [selectedDriver]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        if (selectedDriver) {
            setFormData({
                first_name: selectedDriver.first_name,
                middle_name: selectedDriver.middle_name || "",
                last_name: selectedDriver.last_name,
                address: selectedDriver.address,
                license_number: selectedDriver.license_number,
            });
        }
        setIsEditing(false);
    };

    const handleSave = () => {
        if (!selectedDriver) return;

        // Validation
        if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.address.trim() || !formData.license_number.trim()) {
            toast.error("Please fill in all required fields");
            return;
        }

        onUpdateDriver(selectedDriver.id, formData);
        setIsEditing(false);
        toast.success("Driver updated successfully");
    };

    const handleDelete = () => {
        if (!selectedDriver) return;

        onDeleteDriver(selectedDriver.id);
        setShowDeleteDialog(false);
        toast.success("Driver deleted successfully");
    };

    const handleInputChange = (field: keyof DriverFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (!selectedDriver) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Driver Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <User className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg">Select a driver to view details</p>
                        <p className="text-sm">Choose a driver from the search results to see their information</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Driver Details
                    </CardTitle>
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button onClick={handleSave} size="sm">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save
                                </Button>
                                <Button onClick={handleCancelEdit} variant="outline" size="sm">
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button onClick={handleEdit} variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                <Button
                                    onClick={() => setShowDeleteDialog(true)}
                                    variant="destructive"
                                    size="sm"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
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
                                disabled={!isEditing}
                                className={!isEditing ? "bg-muted" : ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="middleName">Middle Name</Label>
                            <Input
                                id="middleName"
                                value={formData.middle_name}
                                onChange={(e) => handleInputChange("middle_name", e.target.value)}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-muted" : ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                                id="lastName"
                                value={formData.last_name}
                                onChange={(e) => handleInputChange("last_name", e.target.value)}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-muted" : ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="licenseNumber">License Number *</Label>
                            <Input
                                id="licenseNumber"
                                value={formData.license_number}
                                onChange={(e) => handleInputChange("license_number", e.target.value)}
                                disabled={!isEditing}
                                className={!isEditing ? "bg-muted" : ""}
                                placeholder="e.g., N01-12-123456"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                            placeholder="Complete address"
                        />
                    </div>
                </div>

                {/* Record Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Record Information</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm text-muted-foreground">Created</Label>
                            <p className="text-sm">{new Date(selectedDriver.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <Label className="text-sm text-muted-foreground">Last Updated</Label>
                            <p className="text-sm">{new Date(selectedDriver.updated_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </CardContent>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Driver</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Are you sure you want to delete this driver?</p>
                        <div className="mt-2 p-3 bg-muted rounded-md">
                            <p className="font-medium">
                                {`${selectedDriver.first_name} ${selectedDriver.middle_name || ""} ${selectedDriver.last_name}`.trim()}
                            </p>
                            <p className="text-sm text-muted-foreground">{selectedDriver.license_number}</p>
                        </div>
                        <p className="mt-2 text-sm text-destructive">
                            This action cannot be undone.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            Delete Driver
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default DriverDetailsComponent;
