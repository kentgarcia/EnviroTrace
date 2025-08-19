import React from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/presentation/components/shared/ui/dialog";
import { Button } from "@/presentation/components/shared/ui/button";
import { Input } from "@/presentation/components/shared/ui/input";
import { Label } from "@/presentation/components/shared/ui/label";
import { Textarea } from "@/presentation/components/shared/ui/textarea";
import { AlertTriangle, Calendar, MapPin } from "lucide-react";
import { ViolationFormData } from "../logic/useSmokeBelcherData";

interface ViolationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ViolationFormData) => void;
    recordId: number | null;
    isSubmitting: boolean;
}

const ViolationFormModal: React.FC<ViolationFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    recordId,
    isSubmitting,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ViolationFormData>();

    const handleFormSubmit = (data: ViolationFormData) => {
        if (!recordId) return;

        onSubmit({
            ...data,
            record_id: recordId,
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    // Generate current date for default value
    const getCurrentDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Record New Violation
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
                            />
                        </div>
                    </div>

                    {/* Place of Apprehension */}
                    <div>
                        <Label htmlFor="place_of_apprehension" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Place of Apprehension *
                        </Label>
                        <Input
                            id="place_of_apprehension"
                            placeholder="e.g. EDSA Cubao, Commonwealth Avenue"
                            {...register("place_of_apprehension", {
                                required: "Place of apprehension is required",
                                minLength: {
                                    value: 3,
                                    message: "Place must be at least 3 characters long"
                                }
                            })}
                            className="mt-1"
                        />
                        {errors.place_of_apprehension && (
                            <p className="text-sm text-destructive mt-1">
                                {errors.place_of_apprehension.message}
                            </p>
                        )}
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
                            defaultValue={getCurrentDate()}
                            {...register("date_of_apprehension", {
                                required: "Date of apprehension is required",
                                validate: (value) => {
                                    const selectedDate = new Date(value);
                                    const today = new Date();
                                    today.setHours(23, 59, 59, 999); // End of today

                                    if (selectedDate > today) {
                                        return "Date cannot be in the future";
                                    }
                                    return true;
                                }
                            })}
                            className="mt-1"
                        />
                        {errors.date_of_apprehension && (
                            <p className="text-sm text-destructive mt-1">
                                {errors.date_of_apprehension.message}
                            </p>
                        )}
                    </div>

                    {/* Additional Information */}
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Additional Information</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>• Ensure all violation details are accurate before submitting</p>
                            <p>• Driver and operator payment status can be updated after creating the violation</p>
                            <p>• Violation will be automatically assigned the next offense level</p>
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
                            disabled={isSubmitting || !recordId}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Create Violation
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ViolationFormModal;
