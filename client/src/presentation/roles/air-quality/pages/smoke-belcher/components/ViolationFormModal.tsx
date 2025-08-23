import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/presentation/components/shared/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/presentation/components/shared/ui/alert-dialog";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/shared/ui/select";
import { AlertTriangle, Calendar, MapPin, User, Search, Plus, Trash2, Edit } from "lucide-react";
import { ViolationFormData } from "../logic/useSmokeBelcherData";
import {
    AirQualityDriver,
    AirQualityViolation,
    searchAirQualityDrivers,
    createAirQualityDriver,
    fetchAirQualityDriverById,
    getCommonPlacesOfApprehension
} from "@/core/api/air-quality-api";
import { toast } from "sonner";

interface ViolationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ViolationFormData) => void;
    onDelete?: (violationId: number) => void;
    recordId: number | null;
    isSubmitting: boolean;
    isDeleting?: boolean;
    violation?: AirQualityViolation | null;
}

const ViolationFormModal: React.FC<ViolationFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    onDelete,
    recordId,
    isSubmitting,
    isDeleting = false,
    violation,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ViolationFormData>();

    // State
    const [driverSearchQuery, setDriverSearchQuery] = useState("");
    const [availableDrivers, setAvailableDrivers] = useState<AirQualityDriver[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<AirQualityDriver | null>(null);
    const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
    const [showAddDriverModal, setShowAddDriverModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [commonPlaces, setCommonPlaces] = useState<string[]>([]);

    // New driver form state
    const [newDriverForm, setNewDriverForm] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        address: "",
        license_number: "",
    });

    // Watch the selected driver_id
    const watchedDriverId = watch("driver_id");

    // Determine if we're in edit mode
    const isEditMode = !!violation;

    // Load common places on mount
    useEffect(() => {
        const loadCommonPlaces = async () => {
            try {
                const places = await getCommonPlacesOfApprehension();
                setCommonPlaces(places);
            } catch (error) {
                console.error("Error loading common places:", error);
            }
        };
        loadCommonPlaces();
    }, []);

    // Initialize form when violation prop changes (for edit mode)
    useEffect(() => {
        if (violation && isOpen) {
            // Set form values but start in view mode
            setValue("ordinance_infraction_report_no", violation.ordinance_infraction_report_no || "");
            setValue("smoke_density_test_result_no", violation.smoke_density_test_result_no || "");
            setValue("place_of_apprehension", violation.place_of_apprehension);
            setValue("date_of_apprehension", violation.date_of_apprehension);
            setValue("driver_id", violation.driver_id);
            setIsEditingMode(false); // Start in view mode

            // If there's a driver_id, fetch and set the driver
            if (violation.driver_id) {
                const loadDriverForEdit = async () => {
                    try {
                        const driver = await fetchAirQualityDriverById(violation.driver_id!);
                        setSelectedDriver(driver);
                    } catch (error) {
                        console.error("Error loading driver for edit mode:", error);
                        toast.error("Failed to load driver details");
                    }
                };
                loadDriverForEdit();
            }
        } else if (!violation && isOpen) {
            // Reset form for create mode
            reset();
            setSelectedDriver(null);
            setDriverSearchQuery("");
            setIsEditingMode(false);
        }
    }, [violation, isOpen, setValue, reset]);

    // Search drivers when query changes
    useEffect(() => {
        const searchDrivers = async () => {
            if (driverSearchQuery.trim().length < 2) {
                setAvailableDrivers([]);
                return;
            }

            setIsLoadingDrivers(true);
            try {
                const drivers = await searchAirQualityDrivers({
                    search: driverSearchQuery,
                    limit: 10
                });
                setAvailableDrivers(drivers);
            } catch (error) {
                console.error("Error searching drivers:", error);
                toast.error("Failed to search drivers");
            } finally {
                setIsLoadingDrivers(false);
            }
        };

        const timeoutId = setTimeout(searchDrivers, 300);
        return () => clearTimeout(timeoutId);
    }, [driverSearchQuery]);

    // Update selected driver when driver_id changes
    useEffect(() => {
        if (watchedDriverId && availableDrivers.length > 0) {
            const driver = availableDrivers.find(d => d.id === watchedDriverId);
            setSelectedDriver(driver || null);
        } else if (!watchedDriverId) {
            setSelectedDriver(null);
        }
    }, [watchedDriverId, availableDrivers]);

    const handleFormSubmit = (data: ViolationFormData) => {
        // For edit mode, we don't need record_id in the data
        if (!isEditMode && !recordId) return;

        // Validate that driver is selected
        if (!selectedDriver || !selectedDriver.id) {
            toast.error("Please select a driver before submitting");
            return;
        }

        const submitData = {
            ...data,
            driver_id: selectedDriver.id,
        };

        // Add record_id only for create mode
        if (!isEditMode && recordId) {
            (submitData as any).record_id = recordId;
        }

        onSubmit(submitData);
    };

    const handleClose = () => {
        reset();
        setSelectedDriver(null);
        setDriverSearchQuery("");
        setAvailableDrivers([]);
        setShowAddDriverModal(false);
        setShowDeleteConfirm(false);
        setIsEditingMode(false);
        setNewDriverForm({
            first_name: "",
            middle_name: "",
            last_name: "",
            address: "",
            license_number: "",
        });
        onClose();
    };

    const handleDelete = () => {
        if (violation && onDelete) {
            onDelete(violation.id);
        }
        setShowDeleteConfirm(false);
    };

    const handleEditToggle = () => {
        setIsEditingMode(!isEditingMode);
    };

    const handleSelectDriver = (driver: AirQualityDriver) => {
        setSelectedDriver(driver);
        setValue("driver_id", driver.id);
        setDriverSearchQuery('');
    };

    const handleClearDriver = () => {
        setSelectedDriver(null);
        setValue("driver_id", undefined);
        setDriverSearchQuery("");
    };

    const handleCreateNewDriver = async () => {
        try {
            if (!newDriverForm.first_name.trim() || !newDriverForm.last_name.trim() ||
                !newDriverForm.address.trim() || !newDriverForm.license_number.trim()) {
                toast.error("Please fill in all required fields");
                return;
            }

            const newDriver = await createAirQualityDriver({
                first_name: newDriverForm.first_name.trim(),
                middle_name: newDriverForm.middle_name.trim() || undefined,
                last_name: newDriverForm.last_name.trim(),
                address: newDriverForm.address.trim(),
                license_number: newDriverForm.license_number.trim(),
            });

            toast.success("Driver created successfully");
            handleSelectDriver(newDriver);
            setShowAddDriverModal(false);
            setNewDriverForm({
                first_name: "",
                middle_name: "",
                last_name: "",
                address: "",
                license_number: "",
            });
        } catch (error) {
            console.error("Error creating driver:", error);
            toast.error("Failed to create driver");
        }
    };

    const handleSelectPlace = (place: string) => {
        setValue("place_of_apprehension", place);
    };

    // Generate current date for default value
    const getCurrentDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    const isReadOnly = isEditMode && !isEditingMode;

    // Form content component to avoid duplication
    function FormContent() {
        return (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ordinance Infraction Report Number */}
                    <div>
                        <Label htmlFor="ordinance_infraction_report_no">
                            Ordinance Infraction Report No.
                        </Label>
                        <Input
                            id="ordinance_infraction_report_no"
                            placeholder="e.g. OIR-2024-001"
                            {...register("ordinance_infraction_report_no")}
                            className="mt-1"
                            readOnly={isReadOnly}
                        />
                    </div>

                    {/* Smoke Density Test Result Number */}
                    <div>
                        <Label htmlFor="smoke_density_test_result_no">
                            Smoke Density Test Result No.
                        </Label>
                        <Input
                            id="smoke_density_test_result_no"
                            placeholder="e.g. SDT-2024-001"
                            {...register("smoke_density_test_result_no")}
                            className="mt-1"
                            readOnly={isReadOnly}
                        />
                    </div>
                </div>

                {/* Driver Selection */}
                <div>
                    <Label className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Driver *
                    </Label>
                    <div className="mt-2">
                        {selectedDriver ? (
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                <div>
                                    <p className="font-medium">
                                        {selectedDriver.first_name} {selectedDriver.middle_name || ''} {selectedDriver.last_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        License: {selectedDriver.license_number}
                                    </p>
                                </div>
                                {!isReadOnly && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClearDriver}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        ) : !isReadOnly ? (
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            placeholder="Search for driver..."
                                            value={driverSearchQuery}
                                            onChange={(e) => setDriverSearchQuery(e.target.value)}
                                        />
                                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="default"
                                        onClick={() => setShowAddDriverModal(true)}
                                        className="flex items-center gap-1 whitespace-nowrap"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Driver
                                    </Button>
                                </div>

                                {/* Driver Results */}
                                {driverSearchQuery.length >= 2 && (
                                    <div className="border rounded-md max-h-48 overflow-y-auto">
                                        {isLoadingDrivers ? (
                                            <div className="py-4 text-center text-sm">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                                                Searching drivers...
                                            </div>
                                        ) : availableDrivers.length > 0 ? (
                                            <div className="py-1">
                                                {availableDrivers.map((driver) => (
                                                    <button
                                                        key={driver.id}
                                                        type="button"
                                                        className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                                                        onClick={() => handleSelectDriver(driver)}
                                                    >
                                                        <div>
                                                            <p className="font-medium">
                                                                {driver.first_name} {driver.middle_name || ''} {driver.last_name}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                License: {driver.license_number}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-4 text-center text-sm text-muted-foreground">
                                                No drivers found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-muted-foreground">No driver selected</div>
                        )}
                    </div>
                </div>

                {/* Place of Apprehension */}
                <div>
                    <Label htmlFor="place_of_apprehension" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Place of Apprehension *
                    </Label>
                    <Controller
                        name="place_of_apprehension"
                        control={control}
                        rules={{ required: "Place of apprehension is required" }}
                        render={({ field }) => (
                            <div className="mt-1">
                                {!isReadOnly ? (
                                    <div className="flex gap-2">
                                        <Input
                                            {...field}
                                            placeholder="Enter place of apprehension"
                                            className="flex-1"
                                        />
                                        {commonPlaces.length > 0 && (
                                            <Select onValueChange={handleSelectPlace}>
                                                <SelectTrigger className="w-[200px]">
                                                    <SelectValue placeholder="Quick select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {commonPlaces.map((place, index) => (
                                                        <SelectItem key={index} value={place}>
                                                            {place}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                ) : (
                                    <Input
                                        value={field.value || ""}
                                        readOnly
                                        className="bg-muted"
                                    />
                                )}
                                {errors.place_of_apprehension && (
                                    <p className="text-destructive text-sm mt-1">
                                        {errors.place_of_apprehension.message}
                                    </p>
                                )}
                            </div>
                        )}
                    />
                </div>

                {/* Date of Apprehension */}
                <div>
                    <Label htmlFor="date_of_apprehension" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date of Apprehension *
                    </Label>
                    <Input
                        id="date_of_apprehension"
                        type="date"
                        {...register("date_of_apprehension", {
                            required: "Date of apprehension is required",
                        })}
                        defaultValue={getCurrentDate()}
                        className="mt-1"
                        readOnly={isReadOnly}
                    />
                    {errors.date_of_apprehension && (
                        <p className="text-destructive text-sm mt-1">
                            {errors.date_of_apprehension.message}
                        </p>
                    )}
                </div>

                {/* Submit Button - only show in edit mode when editing or in create mode */}
                {((isEditMode && isEditingMode) || !isEditMode) && (
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : (isEditMode ? "Update Violation" : "Create Violation")}
                        </Button>
                    </DialogFooter>
                )}

                {/* View mode footer */}
                {isEditMode && !isEditingMode && (
                    <DialogFooter>
                        <div className="flex justify-between w-full">
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleEditToggle}
                                    className="flex items-center gap-1"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </Button>
                                <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            className="flex items-center gap-1"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Violation</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete this violation? This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? "Deleting..." : "Delete"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Close
                            </Button>
                        </div>
                    </DialogFooter>
                )}
            </>
        );
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            {isEditMode ? (isEditingMode ? "Edit Violation" : "View Violation") : "Record New Violation"}
                        </DialogTitle>
                    </DialogHeader>

                    {(isEditMode && isEditingMode) || !isEditMode ? (
                        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                            <FormContent />
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <FormContent />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add New Driver Modal */}
            <Dialog open={showAddDriverModal} onOpenChange={setShowAddDriverModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Driver</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="first_name">First Name *</Label>
                            <Input
                                id="first_name"
                                value={newDriverForm.first_name}
                                onChange={(e) => setNewDriverForm(prev => ({ ...prev, first_name: e.target.value }))}
                                placeholder="Enter first name"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="middle_name">Middle Name</Label>
                            <Input
                                id="middle_name"
                                value={newDriverForm.middle_name}
                                onChange={(e) => setNewDriverForm(prev => ({ ...prev, middle_name: e.target.value }))}
                                placeholder="Enter middle name"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="last_name">Last Name *</Label>
                            <Input
                                id="last_name"
                                value={newDriverForm.last_name}
                                onChange={(e) => setNewDriverForm(prev => ({ ...prev, last_name: e.target.value }))}
                                placeholder="Enter last name"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="address">Address *</Label>
                            <Input
                                id="address"
                                value={newDriverForm.address}
                                onChange={(e) => setNewDriverForm(prev => ({ ...prev, address: e.target.value }))}
                                placeholder="Enter address"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="license_number">License Number *</Label>
                            <Input
                                id="license_number"
                                value={newDriverForm.license_number}
                                onChange={(e) => setNewDriverForm(prev => ({ ...prev, license_number: e.target.value }))}
                                placeholder="Enter license number"
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowAddDriverModal(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleCreateNewDriver}>
                            Create Driver
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ViolationFormModal;
