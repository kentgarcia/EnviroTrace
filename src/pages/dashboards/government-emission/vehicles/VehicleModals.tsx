import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Vehicle, EmissionTest } from "./types";
import { useForm } from "react-hook-form";

/**
 * Props for VehicleModals component.
 */
export interface VehicleModalsProps {
  viewModalOpen: boolean;
  setViewModalOpen: (open: boolean) => void;
  selectedVehicle: Vehicle | null;
  editModalOpen: boolean;
  setEditModalOpen: (open: boolean) => void;
  editFormData: any;
  setEditFormData: (data: any) => void;
  handleSaveEdit: () => void;
  addModalOpen: boolean;
  setAddModalOpen: (open: boolean) => void;
  addFormData: any;
  setAddFormData: (data: any) => void;
  handleAddVehicle: () => void;
  vehicleTestHistory?: EmissionTest[];
  testHistoryLoading?: boolean;
}

/**
 * Modals for viewing, editing, and adding vehicles in the government emission dashboard.
 *
 * @param props - VehicleModalsProps
 * @returns React component
 */
export const VehicleModals: React.FC<VehicleModalsProps> = ({
  viewModalOpen, setViewModalOpen, selectedVehicle,
  editModalOpen, setEditModalOpen, editFormData, setEditFormData, handleSaveEdit,
  addModalOpen, setAddModalOpen, addFormData, setAddFormData, handleAddVehicle,
  vehicleTestHistory = [], testHistoryLoading = false
}) => {
  // React Hook Form for Add Vehicle
  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm({
    defaultValues: addFormData
  });

  React.useEffect(() => {
    if (addModalOpen) {
      reset(addFormData);
    }
  }, [addModalOpen, addFormData, reset]);

  const onAddSubmit = (data: any) => {
    setAddFormData(data);
    handleAddVehicle();
  };

  // React Hook Form for Edit Vehicle
  const { register: editRegister, handleSubmit: handleEditSubmit, reset: editReset, setValue: editSetValue, watch: editWatch, formState: { errors: editErrors } } = useForm({
    defaultValues: editFormData
  });

  React.useEffect(() => {
    if (editModalOpen) {
      editReset(editFormData);
    }
  }, [editModalOpen, editFormData, editReset]);

  const onEditSubmit = (data: any) => {
    setEditFormData(data);
    handleSaveEdit();
  };

  return (
    <>
      {/* View Vehicle Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vehicle Details</DialogTitle>
            <DialogDescription>Complete information about this vehicle</DialogDescription>
          </DialogHeader>
          {selectedVehicle && (
            <>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Plate Number</Label>
                  <p className="font-medium">{selectedVehicle.plate_number}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Office</Label>
                  <p className="font-medium">{selectedVehicle.office_name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Driver</Label>
                  <p className="font-medium">{selectedVehicle.driver_name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Contact Number</Label>
                  <p className="font-medium">{selectedVehicle.contact_number || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Vehicle Type</Label>
                  <p className="font-medium">{selectedVehicle.vehicle_type}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Engine Type</Label>
                  <p className="font-medium">{selectedVehicle.engine_type}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Wheel Count</Label>
                  <p className="font-medium">{selectedVehicle.wheels}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Latest Test Date</Label>
                  <p className="font-medium">{selectedVehicle.latest_test_date ? selectedVehicle.latest_test_date : "Not tested"}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-muted-foreground">Test Result</Label>
                  <p>
                    {selectedVehicle.latest_test_result === null ? (
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Not tested</span>
                    ) : selectedVehicle.latest_test_result ? (
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Passed</span>
                    ) : (
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Failed</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Test History</h3>
                {testHistoryLoading ? (
                  <div className="text-muted-foreground">Loading test history...</div>
                ) : vehicleTestHistory.length === 0 ? (
                  <div className="text-muted-foreground">No test history found for this vehicle.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border">
                      <thead>
                        <tr>
                          <th className="px-2 py-1 border">Date</th>
                          <th className="px-2 py-1 border">Year</th>
                          <th className="px-2 py-1 border">Quarter</th>
                          <th className="px-2 py-1 border">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicleTestHistory.map(test => (
                          <tr key={test.id}>
                            <td className="px-2 py-1 border">{test.test_date ? new Date(test.test_date).toLocaleDateString() : "-"}</td>
                            <td className="px-2 py-1 border">{test.year}</td>
                            <td className="px-2 py-1 border">{test.quarter}</td>
                            <td className="px-2 py-1 border">
                              {test.result === null ? (
                                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">N/A</span>
                              ) : test.result ? (
                                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Pass</span>
                              ) : (
                                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Fail</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>Close</Button>
            <Button onClick={() => {
              setViewModalOpen(false);
              if (selectedVehicle) setEditModalOpen(true);
            }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Vehicle Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>Make changes to this vehicle's information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit(onEditSubmit)}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_plate_number">Plate Number</Label>
                <Input id="edit_plate_number" {...editRegister("plate_number", { required: true })} />
                {editErrors.plate_number && <span className="text-red-500 text-xs">Required</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_office_name">Office Name</Label>
                <Input id="edit_office_name" {...editRegister("office_name", { required: true })} />
                {editErrors.office_name && <span className="text-red-500 text-xs">Required</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_driver_name">Driver Name</Label>
                <Input id="edit_driver_name" {...editRegister("driver_name", { required: true })} />
                {editErrors.driver_name && <span className="text-red-500 text-xs">Required</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_contact_number">Contact Number</Label>
                <Input id="edit_contact_number" {...editRegister("contact_number")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_vehicle_type">Vehicle Type</Label>
                <Input id="edit_vehicle_type" {...editRegister("vehicle_type", { required: true })} />
                {editErrors.vehicle_type && <span className="text-red-500 text-xs">Required</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_engine_type">Engine Type</Label>
                <Select value={editWatch("engine_type")} onValueChange={val => editSetValue("engine_type", val)}>
                  <SelectTrigger id="edit_engine_type">
                    <SelectValue placeholder="Select engine type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gas">Gas</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                  </SelectContent>
                </Select>
                {editErrors.engine_type && <span className="text-red-500 text-xs">Required</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_wheels">Wheels</Label>
                <Select value={editWatch("wheels")?.toString()} onValueChange={val => editSetValue("wheels", parseInt(val))}>
                  <SelectTrigger id="edit_wheels">
                    <SelectValue placeholder="Select wheels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
                {editErrors.wheels && <span className="text-red-500 text-xs">Required</span>}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setEditModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Add Vehicle Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
            <DialogDescription>Enter details for the new vehicle</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onAddSubmit)}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add_plate_number">Plate Number</Label>
                <Input id="add_plate_number" {...register("plate_number", { required: true })} />
                {errors.plate_number && <span className="text-red-500 text-xs">Required</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_office_name">Office Name</Label>
                <Input id="add_office_name" {...register("office_name", { required: true })} />
                {errors.office_name && <span className="text-red-500 text-xs">Required</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_driver_name">Driver Name</Label>
                <Input id="add_driver_name" {...register("driver_name", { required: true })} />
                {errors.driver_name && <span className="text-red-500 text-xs">Required</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_contact_number">Contact Number</Label>
                <Input id="add_contact_number" {...register("contact_number")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_vehicle_type">Vehicle Type</Label>
                <Input id="add_vehicle_type" {...register("vehicle_type", { required: true })} />
                {errors.vehicle_type && <span className="text-red-500 text-xs">Required</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_engine_type">Engine Type</Label>
                <Select value={watch("engine_type")} onValueChange={val => setValue("engine_type", val)}>
                  <SelectTrigger id="add_engine_type">
                    <SelectValue placeholder="Select engine type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gas">Gas</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                  </SelectContent>
                </Select>
                {errors.engine_type && <span className="text-red-500 text-xs">Required</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_wheels">Wheels</Label>
                <Select value={watch("wheels")?.toString()} onValueChange={val => setValue("wheels", parseInt(val))}>
                  <SelectTrigger id="add_wheels">
                    <SelectValue placeholder="Select wheels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
                {errors.wheels && <span className="text-red-500 text-xs">Required</span>}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)}>Cancel</Button>
              <Button type="submit">Add Vehicle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
