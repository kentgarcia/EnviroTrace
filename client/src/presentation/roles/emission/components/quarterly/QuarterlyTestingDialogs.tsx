import React from "react";
import { Vehicle } from "@/core/api/emission-service";
import { EmissionTest, TestSchedule } from "@/core/hooks/emission/useQuarterlyTesting";
import { ScheduleForm } from "./ScheduleForm";
import { EmissionTestForm } from "./EmissionTestForm";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/presentation/components/shared/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/presentation/components/shared/ui/alert-dialog";

interface QuarterlyTestingDialogsProps {
    // Schedule dialogs
    isAddScheduleOpen: boolean;
    setIsAddScheduleOpen: (open: boolean) => void;
    isEditScheduleOpen: boolean;
    setIsEditScheduleOpen: (open: boolean) => void;
    isDeleteScheduleOpen: boolean;
    setIsDeleteScheduleOpen: (open: boolean) => void;
    scheduleToEdit: TestSchedule | null;
    setScheduleToEdit: (schedule: TestSchedule | null) => void;
    scheduleToDelete: TestSchedule | null;

    // Test dialogs
    isAddTestOpen: boolean;
    setIsAddTestOpen: (open: boolean) => void;
    isEditTestOpen: boolean;
    setIsEditTestOpen: (open: boolean) => void;
    isDeleteTestOpen: boolean;
    setIsDeleteTestOpen: (open: boolean) => void;
    testToEdit: EmissionTest | null;
    setTestToEdit: (test: EmissionTest | null) => void;
    testToDelete: EmissionTest | null;

    // Form data
    vehicles: Vehicle[];
    isLoadingVehicles: boolean;
    selectedSchedule: TestSchedule | null;
    isSubmitting: boolean;

    // Handlers
    onAddSchedule: (data: any) => Promise<void>;
    onEditSchedule: (data: any) => Promise<void>;
    onDeleteSchedule: () => Promise<void>;
    onAddTest: (data: any) => Promise<void>;
    onEditTest: (data: any) => Promise<void>;
    onDeleteTest: () => Promise<void>;
    onSearchVehicle: (query: string) => Promise<Vehicle | null>;
}

export const QuarterlyTestingDialogs: React.FC<QuarterlyTestingDialogsProps> = ({
    // Schedule dialog props
    isAddScheduleOpen,
    setIsAddScheduleOpen,
    isEditScheduleOpen,
    setIsEditScheduleOpen,
    isDeleteScheduleOpen,
    setIsDeleteScheduleOpen,
    scheduleToEdit,
    setScheduleToEdit,
    scheduleToDelete,

    // Test dialog props
    isAddTestOpen,
    setIsAddTestOpen,
    isEditTestOpen,
    setIsEditTestOpen,
    isDeleteTestOpen,
    setIsDeleteTestOpen,
    testToEdit,
    setTestToEdit,
    testToDelete,

    // Form data
    vehicles,
    isLoadingVehicles,
    selectedSchedule,
    isSubmitting,

    // Handlers
    onAddSchedule,
    onEditSchedule,
    onDeleteSchedule,
    onAddTest,
    onEditTest,
    onDeleteTest,
    onSearchVehicle,
}) => {
    return (
        <>
            {/* Schedule Dialogs */}
            <Dialog open={isAddScheduleOpen} onOpenChange={setIsAddScheduleOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Create Test Schedule</DialogTitle>
                        <DialogDescription>
                            Add a new quarterly emission testing schedule
                        </DialogDescription>
                    </DialogHeader>
                    <ScheduleForm
                        onSubmit={onAddSchedule}
                        onCancel={() => setIsAddScheduleOpen(false)}
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isEditScheduleOpen} onOpenChange={setIsEditScheduleOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Edit Test Schedule</DialogTitle>
                        <DialogDescription>
                            Update the details for this testing schedule
                        </DialogDescription>
                    </DialogHeader>
                    {scheduleToEdit && (
                        <ScheduleForm
                            initialValues={scheduleToEdit}
                            onSubmit={onEditSchedule}
                            onCancel={() => {
                                setIsEditScheduleOpen(false);
                                setScheduleToEdit(null);
                            }}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteScheduleOpen} onOpenChange={setIsDeleteScheduleOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Test Schedule</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this test schedule? This will also
                            remove all associated vehicle tests. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onDeleteSchedule}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Test Dialogs */}
            <Dialog open={isAddTestOpen} onOpenChange={setIsAddTestOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Add Vehicle Test</DialogTitle>
                        <DialogDescription>
                            Record a new vehicle emission test result
                        </DialogDescription>
                    </DialogHeader>
                    <EmissionTestForm
                        onSubmit={onAddTest}
                        onCancel={() => setIsAddTestOpen(false)}
                        isSubmitting={isSubmitting}
                        vehicles={vehicles}
                        isLoadingVehicles={isLoadingVehicles}
                        onSearchVehicle={onSearchVehicle}
                        scheduleYear={selectedSchedule?.year}
                        scheduleQuarter={selectedSchedule?.quarter}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isEditTestOpen} onOpenChange={setIsEditTestOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Edit Vehicle Test</DialogTitle>
                        <DialogDescription>
                            Update the vehicle emission test result
                        </DialogDescription>
                    </DialogHeader>
                    {testToEdit && (
                        <EmissionTestForm
                            initialValues={testToEdit}
                            onSubmit={onEditTest}
                            onCancel={() => {
                                setIsEditTestOpen(false);
                                setTestToEdit(null);
                            }}
                            isSubmitting={isSubmitting}
                            vehicles={vehicles}
                            isLoadingVehicles={isLoadingVehicles}
                            onSearchVehicle={onSearchVehicle}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteTestOpen} onOpenChange={setIsDeleteTestOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Vehicle Test</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this vehicle emission test? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onDeleteTest}
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
