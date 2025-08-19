import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/presentation/components/shared/ui/tabs";
import { Car, User, MapPin, Calendar, FileText, AlertTriangle } from "lucide-react";

interface VehicleRecord {
    id: string;
    plateNumber: string;
    vehicleType: string;
    operatorName: string;
    transportGroup: string;
    registrationDate: string;
    status: "active" | "suspended" | "expired";
    // Additional details
    engineNumber?: string;
    chassisNumber?: string;
    model?: string;
    yearManufactured?: string;
    fuelType?: string;
    address?: string;
    contactNumber?: string;
    lastInspection?: string;
}

interface RecordDetailsPanelProps {
    selectedRecord: VehicleRecord | null;
    activeTab: "details" | "history" | "violations";
    onTabChange: (tab: "details" | "history" | "violations") => void;
}

const RecordDetailsPanel: React.FC<RecordDetailsPanelProps> = ({
    selectedRecord,
    activeTab,
    onTabChange,
}) => {
    const getStatusColor = (status: string | undefined) => {
        switch (status) {
            case "active": return "default";
            case "suspended": return "secondary";
            case "expired": return "destructive";
            default: return "outline";
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        {selectedRecord?.plateNumber || "Vehicle Details"}
                    </CardTitle>
                    {selectedRecord ? (
                        <Badge variant={getStatusColor(selectedRecord.status)} className="capitalize">
                            {selectedRecord.status}
                        </Badge>
                    ) : (
                        <Badge variant="outline">No Selection</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Vehicle Type</p>
                        <p className="font-medium">{selectedRecord?.vehicleType || "—"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Transport Group</p>
                        <p className="font-medium">{selectedRecord?.transportGroup || "—"}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Operator Name</p>
                        <p className="font-medium">{selectedRecord?.operatorName || "—"}</p>
                    </div>
                </div>

                {/* Tabs for Details, History, and Violations */}
                <Tabs
                    value={activeTab}
                    onValueChange={(value) => onTabChange(value as "details" | "history" | "violations")}
                    className="flex-1 flex flex-col"
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="details" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Details
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            History
                        </TabsTrigger>
                        <TabsTrigger value="violations" className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Violations
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="flex-1 mt-4">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Engine Number</p>
                                    <p className="font-medium">{selectedRecord?.engineNumber || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Chassis Number</p>
                                    <p className="font-medium">{selectedRecord?.chassisNumber || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Model</p>
                                    <p className="font-medium">{selectedRecord?.model || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Year</p>
                                    <p className="font-medium">{selectedRecord?.yearManufactured || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Fuel Type</p>
                                    <p className="font-medium">{selectedRecord?.fuelType || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Registration Date</p>
                                    <p className="font-medium">{selectedRecord?.registrationDate || "—"}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Address</p>
                                <p className="font-medium">{selectedRecord?.address || "—"}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Contact Number</p>
                                <p className="font-medium">{selectedRecord?.contactNumber || "—"}</p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="flex-1 mt-4">
                        <div className="space-y-4">
                            {selectedRecord ? (
                                <div className="text-center text-muted-foreground py-8">
                                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Vehicle history for {selectedRecord.plateNumber}</p>
                                    <p className="text-sm">Including inspections, renewals, and maintenance records</p>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Vehicle History</p>
                                    <p className="text-sm">Select a vehicle to view history records</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="violations" className="flex-1 mt-4">
                        <div className="space-y-4">
                            {selectedRecord ? (
                                <div className="text-center text-muted-foreground py-8">
                                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Violation records for {selectedRecord.plateNumber}</p>
                                    <p className="text-sm">Including smoke belching violations and penalties</p>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Violation Records</p>
                                    <p className="text-sm">Select a vehicle to view violation records</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default RecordDetailsPanel;
