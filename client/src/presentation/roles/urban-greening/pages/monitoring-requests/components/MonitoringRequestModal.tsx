import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/presentation/components/shared/ui/dialog";
import MonitoringRequestForm from "./MonitoringRequestForm";
import { MonitoringRequestSubmission } from "../logic/useMonitoringRequests";

interface Coordinates {
    lat: number;
    lng: number;
}

interface MonitoringRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: "adding" | "editing";
    initialValues?: Partial<MonitoringRequestSubmission> & { status?: string };
    location: Coordinates;
    onLocationChange: (loc: Coordinates | null) => void;
    onSave: (data: MonitoringRequestSubmission, location: Coordinates, status: string) => void;
}

const MonitoringRequestModal: React.FC<MonitoringRequestModalProps> = ({
    isOpen,
    onClose,
    mode,
    initialValues,
    location,
    onLocationChange,
    onSave,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "adding" ? "Add New Monitoring Request" : "Edit Monitoring Request"}
                    </DialogTitle>
                </DialogHeader>
                <MonitoringRequestForm
                    mode={mode}
                    initialValues={initialValues}
                    location={location}
                    onLocationChange={onLocationChange}
                    onSave={onSave}
                    onCancel={onClose}
                />
            </DialogContent>
        </Dialog>
    );
};

export default MonitoringRequestModal;
