import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Progress } from "@/presentation/components/shared/ui/progress";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { AirQualityDashboard } from "@/core/api/air-quality-api";

interface AirQualityDetailedStatsProps {
    dashboardData?: AirQualityDashboard;
    isLoading?: boolean;
}

const AirQualityDetailedStats: React.FC<AirQualityDetailedStatsProps> = ({
    dashboardData,
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

    if (!dashboardData) return null;

    const paymentEfficiency = dashboardData.total_violations > 0
        ? Math.round((dashboardData.paid_violations_driver / dashboardData.total_violations) * 100)
        : 0;

    const recentActivityTrend = dashboardData.recent_violations_count > 5 ? "up" : "down";

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Payment Compliance */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Payment Compliance</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        {dashboardData.paid_driver_percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">
                        {dashboardData.paid_violations_driver} of {dashboardData.total_violations} violations paid
                    </div>
                    <Progress value={dashboardData.paid_driver_percentage} className="h-2" />
                </CardContent>
            </Card>

            {/* Vehicle Types Distribution */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vehicle Types</CardTitle>
                    <div className="text-xs text-muted-foreground">
                        {dashboardData.vehicle_types.length} types
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {dashboardData.vehicle_types.slice(0, 3).map((vt, index) => (
                            <div key={vt.vehicle_type} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className={`text-xs ${index === 0 ? 'border-blue-200 text-blue-700' :
                                                index === 1 ? 'border-purple-200 text-purple-700' :
                                                    'border-orange-200 text-orange-700'
                                            }`}
                                    >
                                        {vt.vehicle_type}
                                    </Badge>
                                </div>
                                <span className="text-sm font-medium">{vt.count}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                    {recentActivityTrend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-red-600" />
                    ) : (
                        <TrendingDown className="h-4 w-4 text-green-600" />
                    )}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {dashboardData.recent_violations_count}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Violations in last 30 days
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                        {dashboardData.recent_records_count} new records added
                    </div>
                </CardContent>
            </Card>

            {/* Top Violation Location */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Top Violation Area</CardTitle>
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                    {dashboardData.top_violation_locations.length > 0 ? (
                        <>
                            <div className="text-lg font-bold text-orange-600">
                                {dashboardData.top_violation_locations[0].location}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {dashboardData.top_violation_locations[0].count} violations recorded
                            </div>
                        </>
                    ) : (
                        <div className="text-sm text-muted-foreground">No violations recorded</div>
                    )}
                </CardContent>
            </Card>

            {/* Payment Status Breakdown */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
                    <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {dashboardData.payment_status_distribution.map((status) => (
                            <div key={status.status} className="flex items-center justify-between text-sm">
                                <span className={`${status.status === 'Fully Paid' ? 'text-green-600' :
                                        status.status === 'Partially Paid' ? 'text-yellow-600' :
                                            'text-red-600'
                                    }`}>
                                    {status.status}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{status.count}</span>
                                    <span className="text-xs text-muted-foreground">
                                        ({status.percentage.toFixed(1)}%)
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* System Configuration */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Status</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Fee Categories</span>
                            <Badge variant="outline">{dashboardData.total_fees_configured}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span>Active Drivers</span>
                            <Badge variant="outline">{dashboardData.total_drivers}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span>Vehicle Records</span>
                            <Badge variant="outline">{dashboardData.total_records}</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AirQualityDetailedStats;
