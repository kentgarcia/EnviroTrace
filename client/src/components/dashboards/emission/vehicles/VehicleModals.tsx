import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { VehicleForm } from "./VehicleForm";
import { Vehicle, VehicleInput } from "@/hooks/useVehicles";

interface VehicleModalsProps {
    // Add vehicle modal
    isAddModalOpen: boolean;
    onAddModalClose: () => void;
    onAddVehicle: (vehicle: VehicleInput) => void;

    // Edit vehicle modal
    isEditModalOpen: boolean;
    onEditModalClose: () => void;
    onEditVehicle: (vehicle: VehicleInput) => void;
    selectedVehicle: Vehicle | null;

    // Shared props
    isLoading: boolean;
    vehicleTypes: string[];
    engineTypes: string[];
    wheelCounts: string[];
    offices: string[];
}

export const VehicleModals: React.FC<VehicleModalsProps> = ({
    isAddModalOpen,
    onAddModalClose,
    onAddVehicle,
    isEditModalOpen,
    onEditModalClose,
    onEditVehicle,
    selectedVehicle,
    isLoading,
    vehicleTypes,
    engineTypes,
    wheelCounts,
    offices,
}) => {
    // Prepare the initial values for edit form
    const getInitialValues = (): VehicleInput | undefined => {
        if (!selectedVehicle) return undefined;

        return {
            plateNumber: selectedVehicle.plateNumber,
            driverName: selectedVehicle.driverName,
            contactNumber: selectedVehicle.contactNumber,
            officeName: selectedVehicle.officeName,
            vehicleType: selectedVehicle.vehicleType,
            engineType: selectedVehicle.engineType,
            wheels: selectedVehicle.wheels,
        };
    };

    return (
        <>
            {/* Add Vehicle Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={(open) => !open && onAddModalClose()}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add New Vehicle</DialogTitle>
                        <DialogDescription>
                            Enter the details of the new vehicle to add to the database.
                        </DialogDescription>
                    </DialogHeader>
                    <VehicleForm
                        onSubmit={onAddVehicle}
                        onCancel={onAddModalClose}
                        isLoading={isLoading}
                        vehicleTypes={vehicleTypes}
                        engineTypes={engineTypes}
                        wheelCounts={wheelCounts}
                        offices={offices}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Vehicle Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => !open && onEditModalClose()}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Vehicle</DialogTitle>
                        <DialogDescription>
                            Update the details of the vehicle.
                        </DialogDescription>
                    </DialogHeader>
                    <VehicleForm
                        initialValues={getInitialValues()}
                        onSubmit={onEditVehicle}
                        onCancel={onEditModalClose}
                        isLoading={isLoading}
                        vehicleTypes={vehicleTypes}
                        engineTypes={engineTypes}
                        wheelCounts={wheelCounts}
                        offices={offices}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};