import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { SeedlingRequestForm } from "./SeedlingRequestForm";
import { SeedlingRequestDetails } from "./SeedlingRequestDetails";
import { SeedlingRequest, SeedlingRequestInput } from "@/hooks/urban/useSeedlingRequests";

interface SeedlingRequestModalsProps {
    // Add request modal
    isAddModalOpen: boolean;
    onAddModalClose: () => void;
    onAddRequest: (request: SeedlingRequestInput) => void;

    // Edit request modal
    isEditModalOpen: boolean;
    onEditModalClose: () => void;
    onEditRequest: (request: SeedlingRequestInput) => void;

    // View request modal
    isViewModalOpen: boolean;
    onViewModalClose: () => void;

    // Delete request dialog
    isDeleteDialogOpen: boolean;
    onDeleteDialogClose: () => void;
    onDeleteRequest: () => void;

    // Shared props
    selectedRequest: SeedlingRequest | null;
    isSubmitting: boolean;
}

export const SeedlingRequestModals: React.FC<SeedlingRequestModalsProps> = ({
    // Add modal props
    isAddModalOpen,
    onAddModalClose,
    onAddRequest,

    // Edit modal props
    isEditModalOpen,
    onEditModalClose,
    onEditRequest,

    // View modal props
    isViewModalOpen,
    onViewModalClose,

    // Delete dialog props
    isDeleteDialogOpen,
    onDeleteDialogClose,
    onDeleteRequest,

    // Shared props
    selectedRequest,
    isSubmitting,
}) => {
    // Prepare initial values for edit form
    const getInitialValues = (): SeedlingRequestInput | undefined => {
        if (!selectedRequest) return undefined;

        return {
            dateReceived: selectedRequest.dateReceived,
            requesterName: selectedRequest.requesterName,
            address: selectedRequest.address,
            notes: selectedRequest.notes,
            items: selectedRequest.items,
        };
    };

    return (
        <>
            {/* Add Request Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={(open) => !open && onAddModalClose()}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add New Seedling Request</DialogTitle>
                        <DialogDescription>
                            Enter the details of the seedling request.
                        </DialogDescription>
                    </DialogHeader>
                    <SeedlingRequestForm
                        onSubmit={onAddRequest}
                        onCancel={onAddModalClose}
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Request Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => !open && onEditModalClose()}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Seedling Request</DialogTitle>
                        <DialogDescription>
                            Update the details of the seedling request.
                        </DialogDescription>
                    </DialogHeader>
                    <SeedlingRequestForm
                        initialValues={getInitialValues()}
                        onSubmit={onEditRequest}
                        onCancel={onEditModalClose}
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>

            {/* View Request Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={(open) => !open && onViewModalClose()}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Seedling Request Details</DialogTitle>
                    </DialogHeader>
                    <SeedlingRequestDetails request={selectedRequest} />
                </DialogContent>
            </Dialog>

            {/* Delete Request Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => !open && onDeleteDialogClose()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the seedling request
                            {selectedRequest && ` for "${selectedRequest.requesterName}"`} and remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={onDeleteDialogClose}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onDeleteRequest}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};