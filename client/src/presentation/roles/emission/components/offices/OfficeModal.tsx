import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/presentation/components/shared/ui/dialog";
import { OfficeForm } from "./OfficeForm";
import { Office, useCreateOffice, useUpdateOffice } from "@/core/api/emission-service";

interface OfficeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    office?: Office | null;
    onSuccess?: () => void;
}

export function OfficeModal({
    open,
    onOpenChange,
    office,
    onSuccess
}: OfficeModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createOfficeMutation = useCreateOffice();
    const updateOfficeMutation = useUpdateOffice();

    const isEditMode = !!office;

    const handleSubmit = async (values: any) => {
        setIsSubmitting(true);
        try {
            if (isEditMode && office) {
                await updateOfficeMutation.mutateAsync({
                    id: office.id,
                    data: values
                });
            } else {
                await createOfficeMutation.mutateAsync(values);
            }

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error("Failed to save office:", error);
            // Error handling is done in the form component
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] p-0 border-none overflow-hidden rounded-xl">
                <DialogHeader className="bg-[#0033a0] p-6 m-0 border-none">
                    <DialogTitle className="text-white text-xl font-bold">
                        {isEditMode ? "Edit Office" : "Add New Office"}
                    </DialogTitle>
                    <DialogDescription className="text-blue-100/80 mt-1">
                        {isEditMode
                            ? "Update the office information below."
                            : "Fill in the details to create a new office."
                        }
                    </DialogDescription>
                </DialogHeader>
                <div className="p-6">
                    <OfficeForm
                        initialValues={office || undefined}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isLoading={isSubmitting}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
