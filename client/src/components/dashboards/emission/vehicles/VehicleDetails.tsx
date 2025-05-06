import React, { useState } from "react";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Vehicle, EmissionTest } from "@/hooks/vehicles/useVehicles";
import { useQuery } from "@apollo/client";
import { GET_EMISSION_TESTS, GET_VEHICLE_SUMMARY } from "@/lib/emission-api";

interface VehicleDetailsProps {
    vehicle: Vehicle | null;
    isOpen: boolean;
    onClose: () => void;
}

export const VehicleDetails: React.FC<VehicleDetailsProps> = ({
    vehicle,
    isOpen,
    onClose
}) => {
    const [activeTab, setActiveTab] = useState("info");

    // Fetch full vehicle details (with driverHistory) when modal is open
    const { data: vehicleData, loading: isVehicleLoading } = useQuery(GET_VEHICLE_SUMMARY, {
        variables: { id: vehicle?.id },
        skip: !isOpen || !vehicle || vehicle.id.startsWith('pending-'),
        fetchPolicy: "network-only"
    });
    const fullVehicle = vehicleData?.vehicleSummary || vehicle;
    const driverHistory = fullVehicle?.driverHistory || [];

    // Fetch vehicle test history using Apollo Client
    const { data, loading: isLoading } = useQuery(GET_EMISSION_TESTS, {
        variables: {
            filters: {
                vehicleId: vehicle?.id
            }
        },
        skip: !isOpen || !vehicle || vehicle.id.startsWith('pending-'),
        fetchPolicy: "network-only"
    });

    // Extract test history from the query result
    const testHistory = data?.emissionTests || [];

    if (!vehicle) return null;

    const isPendingVehicle = vehicle.id.startsWith('pending-');

    // Helper to parse Postgres timestamp with timezone
    function parsePgTimestamp(dateString: string) {
        if (!dateString) return null;
        // Replace first space with T
        let isoString = dateString.replace(' ', 'T');
        // Fix timezone: convert +08 or -08 to +08:00 or -08:00
        isoString = isoString.replace(/([+-]\d{2})(?!:)/, '$1:00');
        return new Date(isoString);
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">{vehicle?.plateNumber}</DialogTitle>
                    <DialogDescription>
                        Vehicle Details
                        {vehicle?.id.startsWith('pending-') && (
                            <Badge variant="outline" className="ml-2 text-yellow-600 bg-yellow-50">
                                Pending Sync
                            </Badge>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="info">Vehicle Information</TabsTrigger>
                        <TabsTrigger value="history" disabled={vehicle?.id.startsWith('pending-')}>Test History</TabsTrigger>
                        <TabsTrigger value="drivers" disabled={vehicle?.id.startsWith('pending-')}>Driver History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500">Plate Number</h3>
                                <p>{vehicle.plateNumber}</p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500">Driver Name</h3>
                                <p>{vehicle.driverName}</p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                                <p>{vehicle.contactNumber || "Not provided"}</p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500">Office</h3>
                                <p>{vehicle.officeName}</p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500">Vehicle Type</h3>
                                <p>{vehicle.vehicleType}</p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500">Engine Type</h3>
                                <p>{vehicle.engineType}</p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500">Wheels</h3>
                                <p>{vehicle.wheels}</p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500">Latest Test Date</h3>
                                <p>{vehicle.latestTestDate ? (isNaN(parsePgTimestamp(vehicle.latestTestDate as string)?.getTime() ?? NaN) ? "Invalid date" : format(parsePgTimestamp(vehicle.latestTestDate as string)!, 'MMM dd, yyyy')) : "Not tested"}</p>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-gray-500">Latest Test Result</h3>
                                <p>
                                    {vehicle.latestTestResult === null || vehicle.latestTestResult === undefined ? (
                                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                            Not tested
                                        </Badge>
                                    ) : vehicle.latestTestResult ? (
                                        <Badge variant="outline" className="bg-green-100 text-green-800">
                                            Passed
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-red-100 text-red-800">
                                            Failed
                                        </Badge>
                                    )}
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="history">
                        {isPendingVehicle ? (
                            <div className="text-center py-6 text-gray-500">
                                Test history will be available after syncing this vehicle.
                            </div>
                        ) : isLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        ) : testHistory.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                                No test history available for this vehicle.
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Test Date</TableHead>
                                            <TableHead>Period</TableHead>
                                            <TableHead>Result</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {testHistory.map((test) => (
                                            <TableRow key={test.id}>
                                                <TableCell>{test.testDate && !isNaN(parsePgTimestamp(test.testDate as string)?.getTime() ?? NaN) ? format(parsePgTimestamp(test.testDate as string)!, 'MMM dd, yyyy') : "Invalid date"}</TableCell>
                                                <TableCell>Q{test.quarter}, {test.year}</TableCell>
                                                <TableCell>
                                                    {test.result ? (
                                                        <Badge variant="outline" className="bg-green-100 text-green-800">
                                                            Passed
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-red-100 text-red-800">
                                                            Failed
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="drivers">
                        {isVehicleLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        ) : driverHistory.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                                No driver history available for this vehicle.
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Driver Name</TableHead>
                                            <TableHead>Changed At</TableHead>
                                            <TableHead>Changed By</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {driverHistory.map((entry, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{entry.driverName}</TableCell>
                                                <TableCell>{format(new Date(Number(entry.changedAt)), 'MMM dd, yyyy HH:mm')}</TableCell>
                                                <TableCell>{entry.changedBy || '—'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};