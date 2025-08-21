import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/presentation/components/shared/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/presentation/components/shared/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/shared/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/presentation/components/shared/ui/dialog";
import {
    Car,
    User,
    MapPin,
    Calendar,
    Plus,
    FileText,
    TestTube,
    Eye,
    Edit,
    ChevronDown,
    ChevronUp,
    Trash2,
    Save,
    AlertTriangle,
    Search,
    UserPlus,
    X
} from "lucide-react";
import { Record, Violation, Driver, OrderOfPayment, searchDrivers, getCommonPlacesOfApprehension, createDriver, updateDriver, fetchDriverById, searchOrdersOfPayment } from "@/core/api/belching-api";
import { toast } from "sonner";

// Driver form component for adding new drivers
const AddDriverForm: React.FC<{
    onSuccess: (driver: Driver) => void;
    onCancel: () => void;
}> = ({ onSuccess, onCancel }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        address: "",
        license_number: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.address.trim() || !formData.license_number.trim()) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);
        try {
            const newDriver = await createDriver({
                first_name: formData.first_name.trim(),
                middle_name: formData.middle_name.trim() || undefined,
                last_name: formData.last_name.trim(),
                address: formData.address.trim(),
                license_number: formData.license_number.trim(),
            });
            onSuccess(newDriver);
        } catch (error) {
            toast.error("Failed to create driver");
            console.error("Error creating driver:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Driver Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="add-firstName">First Name *</Label>
                        <Input
                            id="add-firstName"
                            value={formData.first_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                            placeholder="Enter first name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="add-middleName">Middle Name</Label>
                        <Input
                            id="add-middleName"
                            value={formData.middle_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, middle_name: e.target.value }))}
                            placeholder="Enter middle name (optional)"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="add-lastName">Last Name *</Label>
                        <Input
                            id="add-lastName"
                            value={formData.last_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                            placeholder="Enter last name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="add-licenseNumber">License Number *</Label>
                        <Input
                            id="add-licenseNumber"
                            value={formData.license_number}
                            onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                            placeholder="e.g., N01-12-123456"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="add-address">Address *</Label>
                    <Input
                        id="add-address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter complete address"
                        required
                    />
                </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Driver"}
                </Button>
            </DialogFooter>
        </form>
    );
};

// Driver form component for editing existing drivers
const EditDriverForm: React.FC<{
    driver: Driver;
    onSuccess: (driver: Driver) => void;
    onCancel: () => void;
}> = ({ driver, onSuccess, onCancel }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: driver.first_name,
        middle_name: driver.middle_name || "",
        last_name: driver.last_name,
        address: driver.address,
        license_number: driver.license_number,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.address.trim() || !formData.license_number.trim()) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);
        try {
            const updatedDriver = await updateDriver(driver.id, {
                first_name: formData.first_name.trim(),
                middle_name: formData.middle_name.trim() || undefined,
                last_name: formData.last_name.trim(),
                address: formData.address.trim(),
                license_number: formData.license_number.trim(),
            });
            onSuccess(updatedDriver);
        } catch (error) {
            toast.error("Failed to update driver");
            console.error("Error updating driver:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Edit Driver Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-firstName">First Name *</Label>
                        <Input
                            id="edit-firstName"
                            value={formData.first_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                            placeholder="Enter first name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-middleName">Middle Name</Label>
                        <Input
                            id="edit-middleName"
                            value={formData.middle_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, middle_name: e.target.value }))}
                            placeholder="Enter middle name (optional)"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-lastName">Last Name *</Label>
                        <Input
                            id="edit-lastName"
                            value={formData.last_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                            placeholder="Enter last name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-licenseNumber">License Number *</Label>
                        <Input
                            id="edit-licenseNumber"
                            value={formData.license_number}
                            onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                            placeholder="e.g., N01-12-123456"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="edit-address">Address *</Label>
                    <Input
                        id="edit-address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter complete address"
                        required
                    />
                </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Driver"}
                </Button>
            </DialogFooter>
        </form>
    );
};

interface RecordDetailsComponentProps {
    selectedRecord: Record | null;
    recordViolations: Violation[];
    violationSummary: any;
    isViolationsLoading: boolean;
    activeTab: "violations" | "history";
    onTabChange: (tab: "violations" | "history") => void;
    onAddViolation: () => void;
    onViewPayment: () => void;
    onPrintClearance: () => void;
    onAddToCECQueue: () => void;
    onUpdateRecord?: () => void;
    onDeleteRecord?: () => void;
}

const RecordDetailsComponent: React.FC<RecordDetailsComponentProps> = ({
    selectedRecord,
    recordViolations,
    violationSummary,
    isViolationsLoading,
    activeTab,
    onTabChange,
    onAddViolation,
    onViewPayment,
    onPrintClearance,
    onAddToCECQueue,
    onUpdateRecord,
    onDeleteRecord,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
    const [showViolationModal, setShowViolationModal] = useState(false);
    const [isEditingViolation, setIsEditingViolation] = useState(false);
    const [showDeleteViolationDialog, setShowDeleteViolationDialog] = useState(false);
    const [violationFormData, setViolationFormData] = useState({
        ordinance_infraction_report_no: "",
        smoke_density_test_result_no: "",
        place_of_apprehension: "",
        date_of_apprehension: "",
    });
    const [showAddViolationModal, setShowAddViolationModal] = useState(false);
    const [showAddDriverDialog, setShowAddDriverDialog] = useState(false);
    const [showEditDriverDialog, setShowEditDriverDialog] = useState(false);
    const [driverToEdit, setDriverToEdit] = useState<Driver | null>(null);

    // Add violation form state
    const [violationForm, setViolationForm] = useState({
        ordinance_infraction_report_no: "",
        smoke_density_test_result_no: "",
        place_of_apprehension: "",
        date_of_apprehension: "",
        driver_id: "",
    });
    const [driverSearch, setDriverSearch] = useState("");
    const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
    const [selectedDriverForViolation, setSelectedDriverForViolation] = useState<Driver | null>(null);
    const [commonPlaces, setCommonPlaces] = useState<string[]>([]);
    const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
    const [driverDetails, setDriverDetails] = useState<{ [key: string]: Driver }>({});
    const [orderOfPayments, setOrderOfPayments] = useState<OrderOfPayment[]>([]);
    const [violationOrderMap, setViolationOrderMap] = useState<{ [violationId: string]: OrderOfPayment }>({});

    // Fetch drivers when driver search changes
    useEffect(() => {
        if (driverSearch.trim()) {
            setIsLoadingDrivers(true);
            searchDrivers({ search: driverSearch, limit: 5 })
                .then((drivers) => {
                    // Include the selected driver in the list if it's not already there
                    const driversToShow = [...drivers];
                    if (selectedDriverForViolation && !drivers.find(d => d.id === selectedDriverForViolation.id)) {
                        driversToShow.unshift(selectedDriverForViolation);
                    }
                    setAvailableDrivers(driversToShow);
                })
                .finally(() => setIsLoadingDrivers(false));
        } else {
            // When search is empty, show only the selected driver if any
            setAvailableDrivers(selectedDriverForViolation ? [selectedDriverForViolation] : []);
        }
    }, [driverSearch, selectedDriverForViolation]);

    // Fetch common places on component mount
    useEffect(() => {
        getCommonPlacesOfApprehension().then(setCommonPlaces);
    }, []);

    // Form state for editing
    const [formData, setFormData] = useState({
        plateNumber: "",
        vehicleType: "",
        transportGroup: "",
        operatorCompanyName: "",
        operatorAddress: "",
        ownerFirstName: "",
        ownerMiddleName: "",
        ownerLastName: "",
        motorNo: "",
        motorVehicleName: "",
        recordStatus: ""
    });

    // Initialize form data when record changes or editing starts
    React.useEffect(() => {
        if (selectedRecord) {
            setFormData({
                plateNumber: selectedRecord.plate_number || "",
                vehicleType: selectedRecord.vehicle_type || "",
                transportGroup: selectedRecord.transport_group || "",
                operatorCompanyName: selectedRecord.operator_company_name || "",
                operatorAddress: selectedRecord.operator_address || "",
                ownerFirstName: selectedRecord.owner_first_name || "",
                ownerMiddleName: selectedRecord.owner_middle_name || "",
                ownerLastName: selectedRecord.owner_last_name || "",
                motorNo: selectedRecord.motor_no || "",
                motorVehicleName: selectedRecord.motor_vehicle_name || "",
                recordStatus: getStatusText(selectedRecord)
            });
        }
    }, [selectedRecord, isEditing]);

    const vehicleTypes = ["Bus", "Jeepney", "Truck", "Taxi", "Private", "UV Express", "Tricycle", "Motorcycle", "Van", "SUV"];
    const transportGroups = ["Metro Transit", "Quezon Ave TODA", "Freight Alliance", "Manila Taxi Corp", "Commonwealth Express", "Victory Liner", "Barangay Tricycle Operators", "Metro Cargo"];

    const getStatusColor = (record: Record | null) => {
        if (!record) return "bg-gray-100 text-gray-600";

        if (!recordViolations || recordViolations.length === 0) {
            return "bg-green-100 text-green-800";
        }

        // Check violation statuses to determine overall record status
        const violationStatuses = recordViolations.map(violation => getViolationStatus(violation));

        // If any violations are still APPREHENDED (no order of payment)
        if (violationStatuses.some(status => status === "APPREHENDED")) {
            return "bg-red-100 text-red-800";
        }

        // If all violations are NO OFFENSE (all orders paid)
        if (violationStatuses.every(status => status === "NO OFFENSE")) {
            return "bg-green-100 text-green-800";
        }

        // If all violations have orders but not all are paid (mix of CLEARED and NO OFFENSE)
        return "bg-yellow-100 text-yellow-800";
    };

    const getStatusText = (record: Record | null) => {
        if (!record) return "NO SELECTION";

        if (!recordViolations || recordViolations.length === 0) {
            return "NO VIOLATIONS";
        }

        // Check violation statuses to determine overall record status
        const violationStatuses = recordViolations.map(violation => getViolationStatus(violation));

        // If any violations are still APPREHENDED (no order of payment)
        if (violationStatuses.some(status => status === "APPREHENDED")) {
            return "VIOLATIONS PENDING";
        }

        // If all violations are NO OFFENSE (all orders paid)
        if (violationStatuses.every(status => status === "NO OFFENSE")) {
            return "NO VIOLATIONS";
        }

        // If all violations have orders but not all are paid (mix of CLEARED and NO OFFENSE)
        return "COMPLIANT";
    };

    const getOperatorOffenseLevel = (violationIndex: number) => {
        const offenseNumber = violationIndex + 1;

        // Handle special cases for ordinal numbers
        const remainder10 = offenseNumber % 10;
        const remainder100 = offenseNumber % 100;

        // Special cases for 11th, 12th, 13th
        if (remainder100 >= 11 && remainder100 <= 13) {
            return `${offenseNumber}th`;
        }

        // Regular ordinal suffixes
        if (remainder10 === 1) return `${offenseNumber}st`;
        if (remainder10 === 2) return `${offenseNumber}nd`;
        if (remainder10 === 3) return `${offenseNumber}rd`;
        return `${offenseNumber}th`;
    };

    const getDriverOffenseLevel = (violation: Violation) => {
        // In a real application, this would be calculated based on driver history across all records
        // For now, we'll simulate by using the driver_id to determine offense level
        if (!violation.driver_id) return "1st";

        // Simple simulation: use driver_id hash to determine offense level
        const driverIdNum = parseInt(violation.driver_id) || 1;
        const offenseNumber = (driverIdNum % 4) + 1; // Cycle between 1-4 for demo

        if (offenseNumber === 1) return "1st";
        if (offenseNumber === 2) return "2nd";
        if (offenseNumber === 3) return "3rd";
        return `${offenseNumber}th`;
    };

    const shouldShowFullDetails = selectedRecord && (isExpanded || isEditing);

    const handleSave = () => {
        // Validate required fields
        if (!formData.plateNumber.trim()) {
            toast.error("Plate number is required");
            return;
        }
        if (!formData.vehicleType.trim()) {
            toast.error("Vehicle type is required");
            return;
        }
        if (!formData.operatorCompanyName.trim()) {
            toast.error("Operator/Company name is required");
            return;
        }

        // Here you would typically call an API to update the record
        console.log("Saving record data:", formData);
        toast.success("Record updated successfully!");
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (onDeleteRecord) {
            onDeleteRecord();
            setShowDeleteDialog(false);
            toast.success("Record deleted successfully!");
        }
    };

    const handleEditViolation = () => {
        if (!selectedViolation) return;

        setViolationFormData({
            ordinance_infraction_report_no: selectedViolation.ordinance_infraction_report_no || "",
            smoke_density_test_result_no: selectedViolation.smoke_density_test_result_no || "",
            place_of_apprehension: selectedViolation.place_of_apprehension,
            date_of_apprehension: selectedViolation.date_of_apprehension,
        });
        setIsEditingViolation(true);
    };

    const handleCancelViolationEdit = () => {
        setIsEditingViolation(false);
        setViolationFormData({
            ordinance_infraction_report_no: "",
            smoke_density_test_result_no: "",
            place_of_apprehension: "",
            date_of_apprehension: "",
        });
    };

    const handleSaveViolationEdit = () => {
        if (!selectedViolation) return;

        // TODO: Implement actual save logic here
        toast.success("Violation updated successfully");
        setIsEditingViolation(false);
        setShowViolationModal(false);
    };

    const handleDeleteViolation = () => {
        setShowDeleteViolationDialog(true);
    };

    const handleConfirmDeleteViolation = () => {
        if (!selectedViolation) return;

        // TODO: Implement actual delete logic here
        toast.success("Violation deleted successfully");
        setShowDeleteViolationDialog(false);
        setShowViolationModal(false);
        setSelectedViolation(null);
    };

    const handleViolationFormChange = (field: string, value: string) => {
        setViolationFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Fetch driver details by ID
    const fetchDriverDetails = async (driverId: string) => {
        if (driverDetails[driverId]) return; // Already fetched

        try {
            const driver = await fetchDriverById(driverId);
            if (driver) {
                setDriverDetails(prev => ({
                    ...prev,
                    [driverId]: driver
                }));
            }
        } catch (error) {
            console.error("Error fetching driver details:", error);
        }
    };

    // Effect to fetch driver details for violations
    useEffect(() => {
        if (recordViolations) {
            recordViolations.forEach(violation => {
                if (violation.driver_id && !driverDetails[violation.driver_id]) {
                    fetchDriverDetails(violation.driver_id);
                }
            });
        }
    }, [recordViolations]);

    // Effect to fetch order of payments for violations
    useEffect(() => {
        const fetchOrdersForViolations = async () => {
            if (recordViolations && recordViolations.length > 0) {
                try {
                    // Fetch all orders and filter those that contain violations from this record
                    const allOrders = await searchOrdersOfPayment({});

                    // Create a map of violation ID to order of payment
                    const violationToOrderMap: { [violationId: string]: OrderOfPayment } = {};

                    allOrders.forEach(order => {
                        if (order.selected_violations && order.selected_violations.length > 0) {
                            order.selected_violations.forEach(violationId => {
                                if (recordViolations.some(v => v.id === violationId)) {
                                    violationToOrderMap[violationId] = order;
                                }
                            });
                        }
                    });

                    setViolationOrderMap(violationToOrderMap);
                    setOrderOfPayments(allOrders);
                } catch (error) {
                    console.error("Error fetching order of payments:", error);
                }
            }
        };

        fetchOrdersForViolations();
    }, [recordViolations]);

    // Function to get violation status
    const getViolationStatus = (violation: Violation): "APPREHENDED" | "CLEARED" | "NO OFFENSE" => {
        const order = violationOrderMap[violation.id];

        if (!order) {
            return "APPREHENDED"; // Has violations but no order of payment yet
        }

        if (order.status === "paid") {
            return "NO OFFENSE"; // Order has been paid and clearance can be printed
        }

        return "CLEARED"; // Order exists but not yet paid
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5" />
                            Vehicle Record Details
                        </CardTitle>
                        {selectedRecord && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center gap-1 ml-2"
                            >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                {isExpanded ? "Show Less" : "Show More"}
                            </Button>
                        )}
                    </div>
                    {selectedRecord && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(!isEditing)}
                                className="flex items-center gap-1"
                            >
                                <Edit className="h-4 w-4" />
                                {isEditing ? "Cancel Edit" : "Edit"}
                            </Button>
                            {onDeleteRecord && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="flex items-center gap-1"
                                    disabled={isEditing}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex gap-6">
                {/* Left Side - Vehicle Details Input (Maximized) */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Essential Vehicle Information - Always Visible */}
                    {!shouldShowFullDetails ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs font-medium text-muted-foreground">Plate Number</Label>
                                <div className="font-mono text-lg font-bold bg-muted p-2 rounded text-center">
                                    {selectedRecord?.plate_number || "—"}
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs font-medium text-muted-foreground">Vehicle Type</Label>
                                <Input
                                    value={selectedRecord?.vehicle_type || ""}
                                    placeholder="—"
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-medium text-muted-foreground">Operator Name</Label>
                                <Input
                                    value={selectedRecord?.operator_company_name || ""}
                                    placeholder="—"
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-medium text-muted-foreground">Operator Address</Label>
                                <Input
                                    value={selectedRecord?.operator_address || ""}
                                    placeholder="—"
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>
                        </div>
                    ) : (
                        /* Full Vehicle Information - Visible when viewing or editing */
                        <div className="space-y-6">
                            {/* Vehicle Information Section */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm border-b pb-2 text-muted-foreground">Vehicle Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs font-medium text-muted-foreground">
                                            Plate Number {isEditing && <span className="text-red-500">*</span>}
                                        </Label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.plateNumber}
                                                onChange={(e) => setFormData(prev => ({ ...prev, plateNumber: e.target.value }))}
                                                placeholder="Enter plate number"
                                                className="font-mono"
                                                required
                                            />
                                        ) : (
                                            <div className="font-mono text-lg font-bold bg-muted p-2 rounded text-center">
                                                {selectedRecord?.plate_number || "—"}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Label className="text-xs font-medium text-muted-foreground">
                                            Vehicle Type {isEditing && <span className="text-red-500">*</span>}
                                        </Label>
                                        {isEditing ? (
                                            <Select value={formData.vehicleType} onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleType: value }))}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select vehicle type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {vehicleTypes.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input
                                                value={selectedRecord?.vehicle_type || ""}
                                                placeholder="—"
                                                readOnly
                                                className="bg-muted"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground">Transport Group</Label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <Input
                                                value={formData.transportGroup}
                                                onChange={(e) => setFormData(prev => ({ ...prev, transportGroup: e.target.value }))}
                                                placeholder="Enter or select transport group"
                                                className="pr-10"
                                            />
                                            <Select value={formData.transportGroup} onValueChange={(value) => setFormData(prev => ({ ...prev, transportGroup: value }))}>
                                                <SelectTrigger className="absolute right-0 top-0 w-10 h-full border-0 bg-transparent">
                                                    <ChevronDown className="h-4 w-4" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {transportGroups.map((group) => (
                                                        <SelectItem key={group} value={group}>
                                                            {group}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ) : (
                                        <Input
                                            value={selectedRecord?.transport_group || ""}
                                            placeholder="—"
                                            readOnly
                                            className="bg-muted"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Operator Information Section */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm border-b pb-2 text-muted-foreground">Operator Information</h3>

                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Operator/Company Name {isEditing && <span className="text-red-500">*</span>}
                                    </Label>
                                    <Input
                                        value={isEditing ? formData.operatorCompanyName : selectedRecord?.operator_company_name || ""}
                                        onChange={isEditing ? (e) => setFormData(prev => ({ ...prev, operatorCompanyName: e.target.value })) : undefined}
                                        placeholder="—"
                                        readOnly={!isEditing}
                                        className={isEditing ? "" : "bg-muted"}
                                        required={isEditing}
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground">Company Address</Label>
                                    <Input
                                        value={isEditing ? formData.operatorAddress : selectedRecord?.operator_address || ""}
                                        onChange={isEditing ? (e) => setFormData(prev => ({ ...prev, operatorAddress: e.target.value })) : undefined}
                                        placeholder="—"
                                        readOnly={!isEditing}
                                        className={isEditing ? "" : "bg-muted"}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label className="text-xs font-medium text-muted-foreground">Owner First Name</Label>
                                        <Input
                                            value={isEditing ? formData.ownerFirstName : selectedRecord?.owner_first_name || ""}
                                            onChange={isEditing ? (e) => setFormData(prev => ({ ...prev, ownerFirstName: e.target.value })) : undefined}
                                            placeholder="—"
                                            readOnly={!isEditing}
                                            className={isEditing ? "" : "bg-muted"}
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs font-medium text-muted-foreground">Owner Middle Name</Label>
                                        <Input
                                            value={isEditing ? formData.ownerMiddleName : selectedRecord?.owner_middle_name || ""}
                                            onChange={isEditing ? (e) => setFormData(prev => ({ ...prev, ownerMiddleName: e.target.value })) : undefined}
                                            placeholder="—"
                                            readOnly={!isEditing}
                                            className={isEditing ? "" : "bg-muted"}
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs font-medium text-muted-foreground">Owner Last Name</Label>
                                        <Input
                                            value={isEditing ? formData.ownerLastName : selectedRecord?.owner_last_name || ""}
                                            onChange={isEditing ? (e) => setFormData(prev => ({ ...prev, ownerLastName: e.target.value })) : undefined}
                                            placeholder="—"
                                            readOnly={!isEditing}
                                            className={isEditing ? "" : "bg-muted"}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Motor Information Section */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm border-b pb-2 text-muted-foreground">Motor Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs font-medium text-muted-foreground">Motor No</Label>
                                        <Input
                                            value={isEditing ? formData.motorNo : selectedRecord?.motor_no || ""}
                                            onChange={isEditing ? (e) => setFormData(prev => ({ ...prev, motorNo: e.target.value })) : undefined}
                                            placeholder="—"
                                            readOnly={!isEditing}
                                            className={isEditing ? "" : "bg-muted"}
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs font-medium text-muted-foreground">Motor Vehicle No</Label>
                                        <Input
                                            value={isEditing ? formData.motorVehicleName : selectedRecord?.motor_vehicle_name || ""}
                                            onChange={isEditing ? (e) => setFormData(prev => ({ ...prev, motorVehicleName: e.target.value })) : undefined}
                                            placeholder="—"
                                            readOnly={!isEditing}
                                            className={isEditing ? "" : "bg-muted"}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Button for Editing Mode */}
                    {isEditing && (
                        <div className="flex justify-end">
                            <Button
                                variant="default"
                                onClick={handleSave}
                                size="sm"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    )}
                </div>

                {/* Right Side - Status and Actions */}
                <div className="w-80 flex flex-col gap-4">
                    {/* Record Status */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Record Status</Label>
                        <div className="flex justify-center">
                            {isEditing ? (
                                <Input
                                    value={formData.recordStatus}
                                    onChange={(e) => setFormData(prev => ({ ...prev, recordStatus: e.target.value }))}
                                    className={`text-center font-semibold ${getStatusColor(selectedRecord)}`}
                                />
                            ) : (
                                <Input
                                    value={getStatusText(selectedRecord)}
                                    readOnly
                                    className={`text-center font-semibold ${getStatusColor(selectedRecord)} border-0`}
                                />
                            )}
                        </div>
                    </div>

                    {/* Action Buttons - Side by Side */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                onClick={onAddToCECQueue}
                                size="sm"
                                disabled={!selectedRecord || isEditing}
                                className="justify-start text-xs"
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                CEC Queue
                            </Button>
                            <Button
                                variant="outline"
                                onClick={onPrintClearance}
                                size="sm"
                                disabled={!selectedRecord || isEditing}
                                className="justify-start text-xs"
                            >
                                <FileText className="h-3 w-3 mr-1" />
                                Print Clear.
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>

            {/* Bottom Section - Tabs for Violations and History */}
            <div className="border-t p-6">
                <Tabs
                    value={activeTab}
                    onValueChange={(value) => onTabChange(value as "violations" | "history")}
                    className="flex-1 flex flex-col"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="violations" className="flex items-center gap-2">
                            <TestTube className="h-4 w-4" />
                            Violations
                            {violationSummary?.totalViolations > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                    {violationSummary.totalViolations}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            History
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="violations" className="flex-1 space-y-4">
                        {/* Violation Header with Add Button */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Violation Records</h3>
                            <Button
                                variant="secondary"
                                onClick={() => setShowAddViolationModal(true)}
                                size="sm"
                                disabled={!selectedRecord || isEditing}
                                className="flex items-center gap-1"
                            >
                                <Plus className="h-4 w-4" />
                                Add Violation
                            </Button>
                        </div>
                        {/* Violation Summary */}
                        {violationSummary && selectedRecord && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground">Offense Level</Label>
                                    <div className="bg-muted p-2 rounded text-center font-medium">
                                        {violationSummary.offenseLevel}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground">Last Apprehension</Label>
                                    <div className="bg-muted p-2 rounded text-center font-medium">
                                        {violationSummary.lastDateApprehended
                                            ? new Date(violationSummary.lastDateApprehended).toLocaleDateString()
                                            : "None"
                                        }
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Violation List - Table Format */}
                        <div className="flex-1 border rounded">
                            {isViolationsLoading ? (
                                <div className="flex items-center justify-center p-8">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                        <p className="text-sm text-muted-foreground">Loading violations...</p>
                                    </div>
                                </div>
                            ) : !selectedRecord ? (
                                <div className="flex items-center justify-center p-8">
                                    <div className="text-center text-muted-foreground">
                                        <TestTube className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>Violation Records</p>
                                        <p className="text-xs">Select a vehicle to view violations</p>
                                    </div>
                                </div>
                            ) : recordViolations.length === 0 ? (
                                <div className="flex items-center justify-center p-8">
                                    <div className="text-center text-muted-foreground">
                                        <TestTube className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No violations recorded</p>
                                        <p className="text-xs">This vehicle has a clean record</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-h-64 overflow-y-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Operator Offense</TableHead>
                                                <TableHead>Date of Apprehension</TableHead>
                                                <TableHead>Place of Apprehension</TableHead>
                                                <TableHead>Driver Name</TableHead>
                                                <TableHead>Driver Offense</TableHead>
                                                <TableHead>Order of Payment</TableHead>
                                                <TableHead>Paid Driver</TableHead>
                                                <TableHead>Paid Operator</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recordViolations.map((violation, index) => {
                                                const connectedOrder = violationOrderMap[violation.id];
                                                const violationStatus = getViolationStatus(violation);

                                                return (
                                                    <TableRow
                                                        key={violation.id}
                                                        className="cursor-pointer hover:bg-muted/50"
                                                        onClick={() => {
                                                            setSelectedViolation(violation);
                                                            setShowViolationModal(true);
                                                        }}
                                                    >
                                                        <TableCell className="font-medium">
                                                            <Badge variant="outline" className="text-xs">
                                                                {getOperatorOffenseLevel(index)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{new Date(violation.date_of_apprehension).toLocaleDateString()}</TableCell>
                                                        <TableCell className="max-w-32 truncate" title={violation.place_of_apprehension}>
                                                            {violation.place_of_apprehension}
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {(() => {
                                                                if (violation.driver_id && driverDetails[violation.driver_id]) {
                                                                    const driver = driverDetails[violation.driver_id];
                                                                    return `${driver.first_name} ${driver.middle_name || ''} ${driver.last_name}`.trim();
                                                                } else if (violation.driver?.first_name) {
                                                                    return `${violation.driver.first_name} ${violation.driver.last_name}`;
                                                                }
                                                                return "—";
                                                            })()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="text-xs">
                                                                {getDriverOffenseLevel(violation)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {connectedOrder ? (
                                                                <div className="space-y-1">
                                                                    <div className="font-mono text-xs text-blue-600">
                                                                        {connectedOrder.control_number}
                                                                    </div>
                                                                    <Badge
                                                                        variant={connectedOrder.status === "paid" ? "default" : "secondary"}
                                                                        className="text-xs"
                                                                    >
                                                                        {connectedOrder.status.toUpperCase()}
                                                                    </Badge>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground text-xs">No Order</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={violation.paid_driver ? "default" : "destructive"} className="text-xs">
                                                                {violation.paid_driver ? "PAID" : "UNPAID"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={violation.paid_operator ? "default" : "destructive"} className="text-xs">
                                                                {violation.paid_operator ? "PAID" : "UNPAID"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={
                                                                    violationStatus === "NO OFFENSE" ? "default" :
                                                                        violationStatus === "CLEARED" ? "secondary" :
                                                                            "destructive"
                                                                }
                                                                className="text-xs"
                                                            >
                                                                {violationStatus}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="flex-1">
                        <div className="flex items-center justify-center p-8">
                            <div className="text-center text-muted-foreground">
                                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>History feature coming soon</p>
                                <p className="text-xs">View complete record history</p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Violation Modal */}
            <Dialog open={showViolationModal} onOpenChange={(open) => {
                setShowViolationModal(open);
                if (!open) {
                    setIsEditingViolation(false);
                    handleCancelViolationEdit();
                }
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditingViolation ? "Edit Violation" : "Violation Details"}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedViolation && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="font-medium">Offense Level</Label>
                                    <p className="text-muted-foreground">
                                        {getOperatorOffenseLevel(recordViolations.findIndex(v => v.id === selectedViolation.id))}
                                    </p>
                                </div>
                                <div>
                                    <Label className="font-medium">Date</Label>
                                    {isEditingViolation ? (
                                        <Input
                                            type="date"
                                            value={violationFormData.date_of_apprehension}
                                            onChange={(e) => handleViolationFormChange("date_of_apprehension", e.target.value)}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <p className="text-muted-foreground">
                                            {new Date(selectedViolation.date_of_apprehension).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <Label className="font-medium">Place of Apprehension</Label>
                                    {isEditingViolation ? (
                                        <Input
                                            value={violationFormData.place_of_apprehension}
                                            onChange={(e) => handleViolationFormChange("place_of_apprehension", e.target.value)}
                                            placeholder="Enter place of apprehension"
                                            className="mt-1"
                                        />
                                    ) : (
                                        <p className="text-muted-foreground">{selectedViolation.place_of_apprehension}</p>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <Label className="font-medium">Report No.</Label>
                                    {isEditingViolation ? (
                                        <Input
                                            value={violationFormData.ordinance_infraction_report_no}
                                            onChange={(e) => handleViolationFormChange("ordinance_infraction_report_no", e.target.value)}
                                            placeholder="Enter ordinance infraction report number"
                                            className="mt-1"
                                        />
                                    ) : (
                                        <p className="text-muted-foreground">
                                            {selectedViolation.ordinance_infraction_report_no || "N/A"}
                                        </p>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <Label className="font-medium">Test Result No.</Label>
                                    {isEditingViolation ? (
                                        <Input
                                            value={violationFormData.smoke_density_test_result_no}
                                            onChange={(e) => handleViolationFormChange("smoke_density_test_result_no", e.target.value)}
                                            placeholder="Enter smoke density test result number"
                                            className="mt-1"
                                        />
                                    ) : (
                                        <p className="text-muted-foreground">
                                            {selectedViolation.smoke_density_test_result_no || "N/A"}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label className="font-medium">Driver Payment</Label>
                                    <p className="text-muted-foreground">
                                        <Badge variant={selectedViolation.paid_driver ? "default" : "destructive"} className="text-xs">
                                            {selectedViolation.paid_driver ? "PAID" : "UNPAID"}
                                        </Badge>
                                    </p>
                                </div>
                                <div>
                                    <Label className="font-medium">Operator Payment</Label>
                                    <p className="text-muted-foreground">
                                        <Badge variant={selectedViolation.paid_operator ? "default" : "destructive"} className="text-xs">
                                            {selectedViolation.paid_operator ? "PAID" : "UNPAID"}
                                        </Badge>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        {isEditingViolation ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelViolationEdit}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSaveViolationEdit}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleEditViolation}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDeleteViolation}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Violation Modal */}
            <Dialog open={showAddViolationModal} onOpenChange={setShowAddViolationModal}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Violation</DialogTitle>
                        <DialogDescription>
                            Create a new violation record for this vehicle
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* 1. Current Vehicle Information */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                Current Vehicle Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                <div>
                                    <Label className="text-sm font-medium">Plate Number</Label>
                                    <p className="text-sm text-muted-foreground">{selectedRecord?.plate_number}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Operator/Company Name</Label>
                                    <p className="text-sm text-muted-foreground">{selectedRecord?.operator_company_name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Current Offense Level</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {violationSummary ? violationSummary.offenseLevel : "No previous violations"}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Date Last Apprehended</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {violationSummary?.lastDateApprehended
                                            ? new Date(violationSummary.lastDateApprehended).toLocaleDateString()
                                            : "N/A"
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Violation Information */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Violation Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="oir-number">OIR Number</Label>
                                    <Input
                                        id="oir-number"
                                        placeholder="Enter Ordinance Infraction Report Number"
                                        value={violationForm.ordinance_infraction_report_no}
                                        onChange={(e) => setViolationForm(prev => ({
                                            ...prev,
                                            ordinance_infraction_report_no: e.target.value
                                        }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="sdtr-number">SDTR Number</Label>
                                    <Input
                                        id="sdtr-number"
                                        placeholder="Enter Smoke Density Test Result Number"
                                        value={violationForm.smoke_density_test_result_no}
                                        onChange={(e) => setViolationForm(prev => ({
                                            ...prev,
                                            smoke_density_test_result_no: e.target.value
                                        }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="place-apprehension">Place of Apprehension *</Label>
                                    <div className="flex gap-2">
                                        <Select
                                            value={violationForm.place_of_apprehension}
                                            onValueChange={(value) => setViolationForm(prev => ({
                                                ...prev,
                                                place_of_apprehension: value
                                            }))}
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select common place..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {commonPlaces.map((place) => (
                                                    <SelectItem key={place} value={place}>
                                                        {place}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            placeholder="Or type custom location"
                                            value={violationForm.place_of_apprehension}
                                            onChange={(e) => setViolationForm(prev => ({
                                                ...prev,
                                                place_of_apprehension: e.target.value
                                            }))}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="date-apprehension">Date of Apprehension *</Label>
                                    <Input
                                        id="date-apprehension"
                                        type="date"
                                        value={violationForm.date_of_apprehension}
                                        onChange={(e) => setViolationForm(prev => ({
                                            ...prev,
                                            date_of_apprehension: e.target.value
                                        }))}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Driver Selection */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Select Driver
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="driver-search">Search Driver</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="driver-search"
                                                placeholder="Search by name or license number..."
                                                value={driverSearch}
                                                onChange={(e) => setDriverSearch(e.target.value)}
                                                className="pl-8"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowAddDriverDialog(true)}
                                            className="px-3"
                                        >
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Add Driver
                                        </Button>
                                    </div>
                                </div>

                                {isLoadingDrivers && (
                                    <p className="text-sm text-muted-foreground">Searching drivers...</p>
                                )}

                                {availableDrivers.length > 0 && (
                                    <div className="border rounded-lg">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Select</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>License Number</TableHead>
                                                    <TableHead>Address</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {availableDrivers.map((driver) => (
                                                    <TableRow
                                                        key={driver.id}
                                                        className={selectedDriverForViolation?.id === driver.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}
                                                    >
                                                        <TableCell>
                                                            <Button
                                                                variant={selectedDriverForViolation?.id === driver.id ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedDriverForViolation(driver);
                                                                    setViolationForm(prev => ({
                                                                        ...prev,
                                                                        driver_id: driver.id
                                                                    }));
                                                                }}
                                                            >
                                                                {selectedDriverForViolation?.id === driver.id ? "Selected" : "Select"}
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>
                                                            {`${driver.first_name} ${driver.middle_name || ''} ${driver.last_name}`.trim()}
                                                        </TableCell>
                                                        <TableCell>{driver.license_number}</TableCell>
                                                        <TableCell className="truncate max-w-[200px]" title={driver.address}>
                                                            {driver.address}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}

                                {driverSearch && !isLoadingDrivers && availableDrivers.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No drivers found. Try a different search term.</p>
                                )}

                                {/* Selected Driver Details */}
                                {selectedDriverForViolation && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Selected Driver Details
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setDriverToEdit(selectedDriverForViolation);
                                                    setShowEditDriverDialog(true);
                                                }}
                                                className="ml-auto text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit Driver
                                            </Button>
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <Label className="text-blue-700 font-medium">Full Name</Label>
                                                <p className="text-blue-800">
                                                    {`${selectedDriverForViolation.first_name} ${selectedDriverForViolation.middle_name || ''} ${selectedDriverForViolation.last_name}`.trim()}
                                                </p>
                                            </div>
                                            <div>
                                                <Label className="text-blue-700 font-medium">License Number</Label>
                                                <p className="text-blue-800">{selectedDriverForViolation.license_number}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label className="text-blue-700 font-medium">Address</Label>
                                                <p className="text-blue-800">{selectedDriverForViolation.address}</p>
                                            </div>
                                            <div>
                                                <Label className="text-blue-700 font-medium">Driver ID</Label>
                                                <p className="text-blue-800 font-mono">{selectedDriverForViolation.id}</p>
                                            </div>
                                            <div>
                                                <Label className="text-blue-700 font-medium">Registration Date</Label>
                                                <p className="text-blue-800">
                                                    {new Date(selectedDriverForViolation.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedDriverForViolation(null);
                                                setViolationForm(prev => ({
                                                    ...prev,
                                                    driver_id: ""
                                                }));
                                            }}
                                            className="mt-3 text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Clear Selection
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowAddViolationModal(false);
                                setViolationForm({
                                    ordinance_infraction_report_no: "",
                                    smoke_density_test_result_no: "",
                                    place_of_apprehension: "",
                                    date_of_apprehension: "",
                                    driver_id: "",
                                });
                                setDriverSearch("");
                                setSelectedDriverForViolation(null);
                                setAvailableDrivers([]);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (!violationForm.place_of_apprehension || !violationForm.date_of_apprehension) {
                                    toast.error("Please fill in all required fields");
                                    return;
                                }

                                // Call the original onAddViolation with the form data
                                onAddViolation();
                                toast.success("Violation added successfully");
                                setShowAddViolationModal(false);
                                setViolationForm({
                                    ordinance_infraction_report_no: "",
                                    smoke_density_test_result_no: "",
                                    place_of_apprehension: "",
                                    date_of_apprehension: "",
                                    driver_id: "",
                                });
                                setDriverSearch("");
                                setAvailableDrivers([]);
                            }}
                            disabled={!violationForm.place_of_apprehension || !violationForm.date_of_apprehension}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Violation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Confirm Delete
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this vehicle record? This action cannot be undone.
                            {selectedRecord && (
                                <div className="mt-2 p-2 bg-muted rounded text-sm">
                                    <strong>Plate Number:</strong> {selectedRecord.plate_number}<br />
                                    <strong>Vehicle Type:</strong> {selectedRecord.vehicle_type}<br />
                                    <strong>Operator:</strong> {selectedRecord.operator_company_name}
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Record
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Violation Confirmation Dialog */}
            <Dialog open={showDeleteViolationDialog} onOpenChange={setShowDeleteViolationDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Confirm Delete Violation
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this violation record? This action cannot be undone.
                            {selectedViolation && (
                                <div className="mt-2 p-2 bg-muted rounded text-sm">
                                    <strong>OIR Number:</strong> {selectedViolation.ordinance_infraction_report_no || "N/A"}<br />
                                    <strong>Place:</strong> {selectedViolation.place_of_apprehension}<br />
                                    <strong>Date:</strong> {new Date(selectedViolation.date_of_apprehension).toLocaleDateString()}
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteViolationDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDeleteViolation}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Violation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Driver Dialog */}
            <Dialog open={showAddDriverDialog} onOpenChange={setShowAddDriverDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Add New Driver
                        </DialogTitle>
                    </DialogHeader>
                    <AddDriverForm
                        onSuccess={(newDriver) => {
                            toast.success("Driver added successfully!");
                            setSelectedDriverForViolation(newDriver);
                            setViolationForm(prev => ({ ...prev, driver_id: newDriver.id }));
                            setShowAddDriverDialog(false);
                            // Refresh driver search if there's a search term
                            if (driverSearch.trim()) {
                                searchDrivers({ search: driverSearch, limit: 5 })
                                    .then((drivers) => {
                                        const driversToShow = [newDriver, ...drivers.filter(d => d.id !== newDriver.id)];
                                        setAvailableDrivers(driversToShow);
                                    });
                            } else {
                                setAvailableDrivers([newDriver]);
                            }
                        }}
                        onCancel={() => setShowAddDriverDialog(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Driver Dialog */}
            <Dialog open={showEditDriverDialog} onOpenChange={setShowEditDriverDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5" />
                            Edit Driver
                        </DialogTitle>
                    </DialogHeader>
                    {driverToEdit && (
                        <EditDriverForm
                            driver={driverToEdit}
                            onSuccess={(updatedDriver) => {
                                toast.success("Driver updated successfully!");
                                setSelectedDriverForViolation(updatedDriver);
                                setDriverToEdit(null);
                                setShowEditDriverDialog(false);
                                // Update the driver in available drivers list
                                setAvailableDrivers(prev =>
                                    prev.map(driver => driver.id === updatedDriver.id ? updatedDriver : driver)
                                );
                            }}
                            onCancel={() => {
                                setDriverToEdit(null);
                                setShowEditDriverDialog(false);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default RecordDetailsComponent;
