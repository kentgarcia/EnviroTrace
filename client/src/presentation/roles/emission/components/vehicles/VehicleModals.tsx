import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/shared/ui/dialog";
import { VehicleForm } from "./VehicleForm";
import { Vehicle, VehicleFormInput } from "@/core/api/emission-service";
import { X } from "lucide-react";

interface VehicleModalsProps {
  // Add vehicle modal
  isAddModalOpen: boolean;
  onAddModalClose: () => void;
  onAddVehicle: (vehicle: VehicleFormInput) => void;

  // Edit vehicle modal
  isEditModalOpen: boolean;
  onEditModalClose: () => void;
  onEditVehicle: (vehicle: VehicleFormInput) => void;
  selectedVehicle: Vehicle | null;

  // Shared props
  isLoading: boolean;
  vehicleTypes: string[];
  engineTypes: string[];
  wheelCounts: string[];
  offices: string[];
  onRefreshOffices: () => void;
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
  onRefreshOffices,
}) => {
  // Prepare the initial values for edit form
  const getInitialValues = (): VehicleFormInput | undefined => {
    if (!selectedVehicle) return undefined;

    return {
      plateNumber: selectedVehicle.plate_number || "",
      chassisNumber: selectedVehicle.chassis_number || "",
      registrationNumber: selectedVehicle.registration_number || "",
      driverName: selectedVehicle.driver_name,
      contactNumber: selectedVehicle.contact_number || "",
      officeName: selectedVehicle.office?.name || "Unknown Office",
      vehicleType: selectedVehicle.vehicle_type,
      engineType: selectedVehicle.engine_type,
      wheels: selectedVehicle.wheels,
      description: selectedVehicle.description || "",
      yearAcquired: selectedVehicle.year_acquired,
    };
  };

  return (
    <>
      {/* Add Vehicle Modal */}
      <Dialog
        open={isAddModalOpen}
        onOpenChange={(open) => !open && onAddModalClose()}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
            <DialogDescription className="text-white/90">
              Enter the details of the new vehicle to add to the database.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <VehicleForm
              onSubmit={onAddVehicle}
              onCancel={onAddModalClose}
              isLoading={isLoading}
              vehicleTypes={vehicleTypes}
              engineTypes={engineTypes}
              wheelCounts={wheelCounts}
              offices={offices}
              onRefreshOffices={onRefreshOffices}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Modal */}
      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => !open && onEditModalClose()}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription className="text-white/90">
              Update the details of the vehicle.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <VehicleForm
              initialValues={getInitialValues()}
              onSubmit={onEditVehicle}
              onCancel={onEditModalClose}
              isLoading={isLoading}
              vehicleTypes={vehicleTypes}
              engineTypes={engineTypes}
              wheelCounts={wheelCounts}
              offices={offices}
              onRefreshOffices={onRefreshOffices}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
