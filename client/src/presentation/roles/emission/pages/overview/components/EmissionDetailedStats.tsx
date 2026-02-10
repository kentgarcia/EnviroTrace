import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Progress } from "@/presentation/components/shared/ui/progress";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Building2 } from "lucide-react";

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
        : 0; return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Testing Efficiency */}
                <Card>
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
                <Card>
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
                <Card>
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
            </div>
        );
};

export default EmissionDetailedStats;
