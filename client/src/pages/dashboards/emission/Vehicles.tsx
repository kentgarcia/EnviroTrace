import React, { useState, lazy, Suspense } from "react";
import { format } from "date-fns";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useVehicles, Vehicle, VehicleInput } from "@/hooks/useVehicles";
import { VehicleTable, VehicleTableSkeleton } from "@/components/dashboards/emission/vehicles/VehicleTable";
import { VehicleFilterPanel } from "@/components/dashboards/emission/vehicles/VehicleFilters";
import { VehicleModals } from "@/components/dashboards/emission/vehicles/VehicleModals";
import { VehicleDetails } from "@/components/dashboards/emission/vehicles/VehicleDetails";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NetworkStatus } from "@/components/layout/NetworkStatus";

export default function Vehicles() {
    // State for modals and dialogs
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

    // Get vehicles data and actions from our custom hook
    const {
        vehicles,
        isLoading,
        isOffline,
        error,
        filters,
        setFilter,
        resetFilters,
        vehicleTypes,
        engineTypes,
        wheelCounts,
        offices,
        addVehicle,
        editVehicle,
        removeVehicle
    } = useVehicles();

    // Handle viewing vehicle details
    const handleViewVehicle = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setViewModalOpen(true);
    };

    // Handle editing vehicle
    const handleEditVehicle = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setEditModalOpen(true);
    };

    // Handle deleting vehicle confirmation
    const handleDeleteConfirm = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setDeleteDialogOpen(true);
    };

    // Handle saving edited vehicle
    const handleSaveEdit = async (vehicleData: VehicleInput) => {
        if (!selectedVehicle) return;

        // Check for duplicate plate number
        const duplicate = vehicles.find(v =>
            v.plateNumber.toLowerCase() === vehicleData.plateNumber.toLowerCase() &&
            v.id !== selectedVehicle.id
        );

        if (duplicate) {
            toast.error("A vehicle with this plate number already exists");
            return;
        }

        const success = await editVehicle(selectedVehicle.id, vehicleData);
        if (success) {
            setEditModalOpen(false);
            setSelectedVehicle(null);
        }
    };

    // Handle adding new vehicle
    const handleAddVehicle = async (vehicleData: VehicleInput) => {
        // Check for duplicate plate number
        const duplicate = vehicles.find(v =>
            v.plateNumber.toLowerCase() === vehicleData.plateNumber.toLowerCase()
        );

        if (duplicate) {
            toast.error("A vehicle with this plate number already exists");
            return;
        }

        const success = await addVehicle(vehicleData);
        if (success) {
            setAddModalOpen(false);
        }
    };

    // Handle deleting vehicle
    const handleDeleteVehicle = async () => {
        if (!selectedVehicle) return;

        const success = await removeVehicle(selectedVehicle.id);
        if (success) {
            setDeleteDialogOpen(false);
            setSelectedVehicle(null);
        }
    };

    // Export vehicles to CSV
    const handleExportToCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Plate Number,Office,Driver,Vehicle Type,Engine Type,Wheels,Contact,Latest Test,Test Result\n";

        vehicles.forEach(vehicle => {
            const testDate = vehicle.latestTestDate
                ? format(new Date(vehicle.latestTestDate), 'yyyy-MM-dd')
                : "Not Tested";

            const testResult = vehicle.latestTestResult === null
                ? "Not Tested"
                : vehicle.latestTestResult
                    ? "Passed"
                    : "Failed";

            csvContent += `"${vehicle.plateNumber}","${vehicle.officeName}","${vehicle.driverName}","${vehicle.vehicleType}","${vehicle.engineType}","${vehicle.wheels}","${vehicle.contactNumber || ''}","${testDate}","${testResult}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `vehicles_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Vehicle data exported successfully");
    };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar dashboardType="government-emission" />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <DashboardNavbar dashboardTitle="Government Vehicles" />
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold">Vehicles Database</h1>
                                <p className="text-muted-foreground">
                                    Manage and view all government vehicles in the system
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleExportToCSV}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Export to CSV
                                </Button>
                                <Button onClick={() => setAddModalOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Vehicle
                                </Button>
                            </div>
                        </div>

                        {/* Offline Mode Notice */}
                        {isOffline && (
                            <Alert className="mb-4 bg-yellow-50 text-yellow-800 border-yellow-200">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Offline Mode</AlertTitle>
                                <AlertDescription>
                                    You're currently working offline. Changes will be saved locally and synced when you're back online.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Error Notice */}
                        {error && (
                            <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    There was a problem loading the vehicles data. Please try again later.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Main Content */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle>Vehicles List</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Filters */}
                                <VehicleFilterPanel
                                    filters={filters}
                                    setFilter={setFilter}
                                    resetFilters={resetFilters}
                                    vehicleTypes={vehicleTypes}
                                    engineTypes={engineTypes}
                                    wheelCounts={wheelCounts}
                                    offices={offices}
                                />

                                {/* Vehicle Table */}
                                <Suspense fallback={<VehicleTableSkeleton />}>
                                    <VehicleTable
                                        vehicles={vehicles}
                                        isLoading={isLoading}
                                        isOffline={isOffline}
                                        onView={handleViewVehicle}
                                        onEdit={handleEditVehicle}
                                        onDelete={handleDeleteConfirm}
                                    />
                                </Suspense>
                            </CardContent>
                        </Card>

                        {/* Modals and Dialogs */}
                        <VehicleModals
                            isAddModalOpen={addModalOpen}
                            onAddModalClose={() => setAddModalOpen(false)}
                            onAddVehicle={handleAddVehicle}
                            isEditModalOpen={editModalOpen}
                            onEditModalClose={() => {
                                setEditModalOpen(false);
                                setSelectedVehicle(null);
                            }}
                            onEditVehicle={handleSaveEdit}
                            selectedVehicle={selectedVehicle}
                            isLoading={isLoading}
                            vehicleTypes={vehicleTypes}
                            engineTypes={engineTypes}
                            wheelCounts={wheelCounts}
                            offices={offices}
                        />

                        <VehicleDetails
                            vehicle={selectedVehicle}
                            isOpen={viewModalOpen}
                            onClose={() => {
                                setViewModalOpen(false);
                                setSelectedVehicle(null);
                            }}
                        />

                        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the vehicle
                                        {selectedVehicle && ` (${selectedVehicle.plateNumber})`} and remove its data from the system.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setSelectedVehicle(null)}>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteVehicle}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
            <NetworkStatus />
        </SidebarProvider>
    );
}