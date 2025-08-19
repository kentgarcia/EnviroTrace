import React from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/presentation/components/shared/ui/dialog";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/shared/ui/select";
import { Car, Plus } from "lucide-react";
import { RecordFormData } from "../logic/useSmokeBelcherData";

interface RecordFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: RecordFormData) => void;
    isSubmitting: boolean;
}

const RecordFormModal: React.FC<RecordFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<RecordFormData>();

    const vehicleType = watch("vehicle_type");

    const handleFormSubmit = (data: RecordFormData) => {
        onSubmit(data);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const vehicleTypes = [
        "Bus",
        "Truck",
        "Jeepney",
        "Taxi",
        "Private",
        "Motorcycle",
        "Van",
        "SUV",
        "Pickup",
        "Other"
    ];

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-green-500" />
                        Add New Vehicle Record
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    {/* Vehicle Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium border-b pb-2">Vehicle Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Plate Number */}
                            <div>
                                <Label htmlFor="plate_number">
                                    Plate Number *
                                </Label>
                                <Input
                                    id="plate_number"
                                    placeholder="e.g. ABC1234"
                                    {...register("plate_number", {
                                        required: "Plate number is required",
                                        pattern: {
                                            value: /^[A-Z0-9\-]+$/i,
                                            message: "Invalid plate number format"
                                        },
                                        minLength: {
                                            value: 3,
                                            message: "Plate number must be at least 3 characters"
                                        }
                                    })}
                                    className="mt-1 uppercase"
                                    style={{ textTransform: 'uppercase' }}
                                />
                                {errors.plate_number && (
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.plate_number.message}
                                    </p>
                                )}
                            </div>

                            {/* Vehicle Type */}
                            <div>
                                <Label htmlFor="vehicle_type">
                                    Vehicle Type *
                                </Label>
                                <Select onValueChange={(value) => setValue("vehicle_type", value)}>
                                    <SelectTrigger className="mt-1">
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
                                {errors.vehicle_type && (
                                    <p className="text-sm text-destructive mt-1">
                                        Vehicle type is required
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Transport Group */}
                            <div>
                                <Label htmlFor="transport_group">
                                    Transport Group
                                </Label>
                                <Input
                                    id="transport_group"
                                    placeholder="e.g. Metro Transit Coop"
                                    {...register("transport_group")}
                                    className="mt-1"
                                />
                            </div>

                            {/* Motor Number */}
                            <div>
                                <Label htmlFor="motor_no">
                                    Motor Number
                                </Label>
                                <Input
                                    id="motor_no"
                                    placeholder="e.g. ENG123456"
                                    {...register("motor_no")}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Motor Vehicle Name */}
                        <div>
                            <Label htmlFor="motor_vehicle_name">
                                Motor Vehicle Name/Model
                            </Label>
                            <Input
                                id="motor_vehicle_name"
                                placeholder="e.g. Hyundai County, Isuzu Elf"
                                {...register("motor_vehicle_name")}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {/* Operator Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium border-b pb-2">Operator Information</h3>

                        <div>
                            <Label htmlFor="operator_company_name">
                                Operator Company Name *
                            </Label>
                            <Input
                                id="operator_company_name"
                                placeholder="e.g. City Bus Lines Inc."
                                {...register("operator_company_name", {
                                    required: "Operator company name is required",
                                    minLength: {
                                        value: 3,
                                        message: "Company name must be at least 3 characters"
                                    }
                                })}
                                className="mt-1"
                            />
                            {errors.operator_company_name && (
                                <p className="text-sm text-destructive mt-1">
                                    {errors.operator_company_name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="operator_address">
                                Operator Address
                            </Label>
                            <Input
                                id="operator_address"
                                placeholder="e.g. 123 Main Street, Quezon City"
                                {...register("operator_address")}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {/* Owner Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium border-b pb-2">Owner Information (Optional)</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="owner_first_name">
                                    First Name
                                </Label>
                                <Input
                                    id="owner_first_name"
                                    placeholder="e.g. Juan"
                                    {...register("owner_first_name")}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="owner_middle_name">
                                    Middle Name
                                </Label>
                                <Input
                                    id="owner_middle_name"
                                    placeholder="e.g. Santos"
                                    {...register("owner_middle_name")}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="owner_last_name">
                                    Last Name
                                </Label>
                                <Input
                                    id="owner_last_name"
                                    placeholder="e.g. Dela Cruz"
                                    {...register("owner_last_name")}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Information Notice */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 text-blue-900">Important Information</h4>
                        <div className="text-sm text-blue-800 space-y-1">
                            <p>• All required fields must be completed before submitting</p>
                            <p>• Plate numbers will be automatically converted to uppercase</p>
                            <p>• Duplicate plate numbers will be rejected by the system</p>
                            <p>• You can add violations to this record after it's created</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Car className="h-4 w-4 mr-2" />
                                    Create Record
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RecordFormModal;
