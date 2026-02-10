import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Progress } from "@/presentation/components/shared/ui/progress";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Building2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/presentation/components/shared/ui/dialog";

interface EmissionDetailedStatsProps {
    data?: {
        totalVehicles: number;
        totalOffices: number;
        passedTests: number;
        failedTests: number;
        pendingTests: number;
        complianceRate: number;
        officeComplianceData: Array<{
            id: string;
            label: string;
            value: number;
            passedCount: number;
            vehicleCount: number;
        }>;
        topOffice?: {
            officeName: string;
            complianceRate: number;
            passedCount: number;
            vehicleCount: number;
        } | null;
        vehicleStatusList: Array<{
            id: string;
            plateNumber: string;
            driverName: string;
            officeName: string;
            result: "Passed" | "Failed" | "Pending";
            testDate?: string | null;
        }>;
        vehicleTypeBreakdown: Array<{
            type: string;
            count: number;
            passedCount: number;
        }>;
    };
    isLoading?: boolean;
}

const EmissionDetailedStats: React.FC<EmissionDetailedStatsProps> = ({
    data,
    isLoading = false
}) => {
    const [activeDialog, setActiveDialog] = useState<"efficiency" | "compliance" | "topOffice" | null>(null);
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-2 bg-gray-200 rounded w-full"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!data) return null;

    // Safe calculations with proper fallbacks
    const safeData = {
        totalVehicles: Math.max(data.totalVehicles || 0, 0),
        totalOffices: Math.max(data.totalOffices || 0, 0),
        passedTests: Math.max(data.passedTests || 0, 0),
        failedTests: Math.max(data.failedTests || 0, 0),
        pendingTests: Math.max(data.pendingTests || 0, 0),
        complianceRate: Math.max(Math.min(data.complianceRate || 0, 100), 0),
        officeComplianceData: data.officeComplianceData || []
    };

    const testingEfficiency = safeData.totalVehicles > 0
        ? Math.min(Math.max(Math.round(((safeData.passedTests + safeData.failedTests) / safeData.totalVehicles) * 100), 0), 100)
        : 0;

    const topOffice = data.topOffice
        ? {
            label: data.topOffice.officeName,
            value: data.topOffice.complianceRate,
            passedCount: data.topOffice.passedCount,
            vehicleCount: data.topOffice.vehicleCount,
        }
        : safeData.officeComplianceData.length > 0
            ? safeData.officeComplianceData.reduce((prev, current) =>
                ((prev?.value || 0) > (current?.value || 0)) ? prev : current
            )
            : null;

    const averageVehiclesPerOffice = safeData.totalOffices > 0
        ? Math.round(safeData.totalVehicles / safeData.totalOffices)
        : 0;

    const vehicleList = data.vehicleStatusList || [];
    const testedVehicleList = vehicleList.filter((vehicle) => vehicle.result !== "Pending");
    const topOfficeVehicleList = topOffice?.label
        ? vehicleList.filter((vehicle) => vehicle.officeName === topOffice.label)
        : [];

    const resultBadgeClass = (result: "Passed" | "Failed" | "Pending") => {
        if (result === "Passed") return "bg-emerald-100 text-emerald-700 border-emerald-200";
        if (result === "Failed") return "bg-rose-100 text-rose-700 border-rose-200";
        return "bg-slate-100 text-slate-600 border-slate-200";
    };

    return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Testing Efficiency */}
                <Card
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => setActiveDialog("efficiency")}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setActiveDialog("efficiency");
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Testing Efficiency</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{testingEfficiency}%</div>
                        <p className="text-xs text-muted-foreground mb-2">
                            {safeData.passedTests + safeData.failedTests} of {safeData.totalVehicles} vehicles tested
                        </p>
                        <Progress value={testingEfficiency} className="h-2" />
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                            <Badge variant="outline" className="text-green-600 border-green-600">
                                {safeData.pendingTests} pending
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Compliance Performance */}
                <Card
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => setActiveDialog("compliance")}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setActiveDialog("compliance");
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
                        {safeData.complianceRate >= 80 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${safeData.complianceRate >= 80 ? 'text-green-600' :
                            safeData.complianceRate >= 60 ? 'text-orange-600' : 'text-red-600'
                            }`}>
                            {safeData.complianceRate}%
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                            {safeData.passedTests} passed, {safeData.failedTests} failed
                        </p>
                        <Progress value={safeData.complianceRate} className="h-2" />
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                            <Badge
                                variant={safeData.complianceRate >= 80 ? "default" : "secondary"}
                                className={safeData.complianceRate >= 80 ? "bg-green-600" : ""}
                            >
                                {safeData.complianceRate >= 80 ? "Excellent" :
                                    safeData.complianceRate >= 60 ? "Good" : "Needs Improvement"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Performing Office */}
                <Card
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => setActiveDialog("topOffice")}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setActiveDialog("topOffice");
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Performing Office</CardTitle>
                        <Building2 className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-blue-600 mb-1">
                            {topOffice?.label || "No data"}
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                            {topOffice?.value || 0}%
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                            {topOffice?.passedCount || 0} of {topOffice?.vehicleCount || 0} vehicles passed
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                                {averageVehiclesPerOffice} avg vehicles/office
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={activeDialog === "efficiency"} onOpenChange={(open) => !open && setActiveDialog(null)}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Testing Efficiency</DialogTitle>
                            <DialogDescription>Coverage of tested vehicles in the selected period.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Tested Vehicles</span>
                                <span className="text-lg font-semibold">
                                    {safeData.passedTests + safeData.failedTests}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total Vehicles</span>
                                <span className="text-lg font-semibold">{safeData.totalVehicles}</span>
                            </div>
                            <Progress value={testingEfficiency} className="h-2" />
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Pending Tests</span>
                                <span className="font-medium">{safeData.pendingTests}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-3">
                                <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-slate-500">
                                    <span>Plate #</span>
                                    <span>Driver</span>
                                    <span>Office</span>
                                    <span>Result</span>
                                </div>
                                <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
                                    {vehicleList.map((vehicle) => (
                                        <div key={vehicle.id} className="grid grid-cols-4 gap-2 text-sm">
                                            <span className="truncate" title={vehicle.plateNumber}>{vehicle.plateNumber}</span>
                                            <span className="truncate" title={vehicle.driverName}>{vehicle.driverName}</span>
                                            <span className="truncate" title={vehicle.officeName}>{vehicle.officeName}</span>
                                            <Badge variant="outline" className={resultBadgeClass(vehicle.result)}>
                                                {vehicle.result}
                                            </Badge>
                                        </div>
                                    ))}
                                    {vehicleList.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No vehicles available.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={activeDialog === "compliance"} onOpenChange={(open) => !open && setActiveDialog(null)}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Overall Compliance</DialogTitle>
                            <DialogDescription>Pass rate across all vehicles in the selected period.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Compliance Rate</span>
                                <span className="text-lg font-semibold">{safeData.complianceRate}%</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                                    <p className="text-xs text-emerald-700">Passed</p>
                                    <p className="text-lg font-semibold text-emerald-700">{safeData.passedTests}</p>
                                </div>
                                <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-3">
                                    <p className="text-xs text-rose-700">Failed</p>
                                    <p className="text-lg font-semibold text-rose-700">{safeData.failedTests}</p>
                                </div>
                            </div>
                            <Progress value={safeData.complianceRate} className="h-2" />
                            <div className="border-t border-slate-200 pt-3">
                                <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-slate-500">
                                    <span>Plate #</span>
                                    <span>Driver</span>
                                    <span>Office</span>
                                    <span>Result</span>
                                </div>
                                <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
                                    {testedVehicleList.map((vehicle) => (
                                        <div key={vehicle.id} className="grid grid-cols-4 gap-2 text-sm">
                                            <span className="truncate" title={vehicle.plateNumber}>{vehicle.plateNumber}</span>
                                            <span className="truncate" title={vehicle.driverName}>{vehicle.driverName}</span>
                                            <span className="truncate" title={vehicle.officeName}>{vehicle.officeName}</span>
                                            <Badge variant="outline" className={resultBadgeClass(vehicle.result)}>
                                                {vehicle.result}
                                            </Badge>
                                        </div>
                                    ))}
                                    {testedVehicleList.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No tested vehicles for this period.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={activeDialog === "topOffice"} onOpenChange={(open) => !open && setActiveDialog(null)}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Top Performing Office</DialogTitle>
                            <DialogDescription>Highest compliance office for the selected period.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4">
                                <p className="text-xs text-blue-700">Office</p>
                                <p className="text-lg font-semibold text-blue-700">
                                    {topOffice?.label || "No data"}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-xs text-slate-500">Compliance Rate</p>
                                    <p className="text-lg font-semibold text-slate-800">{topOffice?.value || 0}%</p>
                                </div>
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-xs text-slate-500">Passed Vehicles</p>
                                    <p className="text-lg font-semibold text-slate-800">
                                        {topOffice?.passedCount || 0}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Total Vehicles</span>
                                <span className="font-medium">{topOffice?.vehicleCount || 0}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-3">
                                <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-slate-500">
                                    <span>Plate #</span>
                                    <span>Driver</span>
                                    <span>Office</span>
                                    <span>Result</span>
                                </div>
                                <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
                                    {topOfficeVehicleList.map((vehicle) => (
                                        <div key={vehicle.id} className="grid grid-cols-4 gap-2 text-sm">
                                            <span className="truncate" title={vehicle.plateNumber}>{vehicle.plateNumber}</span>
                                            <span className="truncate" title={vehicle.driverName}>{vehicle.driverName}</span>
                                            <span className="truncate" title={vehicle.officeName}>{vehicle.officeName}</span>
                                            <Badge variant="outline" className={resultBadgeClass(vehicle.result)}>
                                                {vehicle.result}
                                            </Badge>
                                        </div>
                                    ))}
                                    {topOfficeVehicleList.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No vehicles for this office.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        );
};

export default EmissionDetailedStats;
