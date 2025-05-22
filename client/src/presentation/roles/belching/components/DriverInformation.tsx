import React from "react";
import { Button } from "@/presentation/components/shared/ui/button";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { DriverRecord } from "@/lib/api/driver-api";

interface DriverInformationProps {
    selectedDriver: DriverRecord | null;
    onEditDriver: () => void;
    onDeleteDriver: () => void;
    onAddDriverClick: () => void;
}

const DriverInformation: React.FC<DriverInformationProps> = ({
    selectedDriver,
    onEditDriver,
    onDeleteDriver,
    onAddDriverClick,
}) => {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'suspended': return 'bg-red-500';
            case 'warning': return 'bg-yellow-500';
            case 'active': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="bg-white rounded shadow p-6 relative h-full">
            <h3 className="text-md font-bold mb-4 text-blue-900">
                Driver Information
            </h3>
            {selectedDriver ? (
                <>
                    <Badge
                        className={`absolute top-4 right-4 ${getStatusColor(selectedDriver.status)}`}
                    >
                        {selectedDriver.status}
                    </Badge>
                    <div className="space-y-3">
                        <div>
                            <div className="text-xs text-gray-500">Driver Name</div>
                            <div className="font-semibold">{selectedDriver.name}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">License No.</div>
                            <div className="font-semibold">{selectedDriver.license_no}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Address</div>
                            <div className="font-semibold">{selectedDriver.address}</div>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={onEditDriver}
                            className="mr-2"
                        >
                            Edit Driver
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={onDeleteDriver}
                        >
                            Delete Driver
                        </Button>
                    </div>
                </>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <p>Select a driver from the search results to view details</p>
                    <Button
                        onClick={onAddDriverClick}
                        className="mt-4 bg-blue-700 text-white"
                    >
                        Add New Driver
                    </Button>
                </div>
            )}
        </div>
    );
};

export default DriverInformation;
