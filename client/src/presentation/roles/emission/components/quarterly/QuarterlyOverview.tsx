import React, { useMemo } from "react";
import {
    TrendingUp,
    TrendingDown,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Car,
    Target,
    Award,
    Calendar,
    BarChart3,
    Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Progress } from "@/presentation/components/shared/ui/progress";
import { Badge } from "@/presentation/components/shared/ui/badge";
import StatCard from "@/presentation/components/shared/StatCard";

interface QuarterlyOverviewProps {
    stats: any;
    selectedYear: number;
    officeGroups: any[];
    selectedOffices: string[];
}

export const QuarterlyOverview: React.FC<QuarterlyOverviewProps> = ({
    stats,
    selectedYear,
    officeGroups,
    selectedOffices,
}) => {
    const quarterNames = ["Q1", "Q2", "Q3", "Q4"];

    // Calculate overall statistics
    const overallStats = useMemo(() => {
        const totalVehicles = officeGroups.reduce((total, office) => total + office.vehicles.length, 0);
        const totalTests = officeGroups.reduce((total, office) => {
            return total + office.vehicles.reduce((vehicleTotal: number, vehicle: any) => {
                return vehicleTotal + Object.values(vehicle.tests).filter(test => test !== null).length;
            }, 0);
        }, 0);

        const totalPassed = officeGroups.reduce((total, office) => {
            return total + office.vehicles.reduce((vehicleTotal: number, vehicle: any) => {
                return vehicleTotal + Object.values(vehicle.tests).filter((test: any) => test?.result === true).length;
            }, 0);
        }, 0);

        const totalFailed = officeGroups.reduce((total, office) => {
            return total + office.vehicles.reduce((vehicleTotal: number, vehicle: any) => {
                return vehicleTotal + Object.values(vehicle.tests).filter((test: any) => test?.result === false).length;
            }, 0);
        }, 0);

        const completionRate = totalVehicles > 0 ? (totalTests / (totalVehicles * 4)) * 100 : 0;
        const passRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;

        return {
            totalVehicles,
            totalTests,
            totalPassed,
            totalFailed,
            completionRate,
            passRate,
            notTested: (totalVehicles * 4) - totalTests,
        };
    }, [officeGroups]);

    // Calculate quarter-wise statistics
    const quarterStats = useMemo(() => {
        return quarterNames.map((quarter, index) => {
            const quarterIndex = index + 1;
            const quarterTests = officeGroups.reduce((total, office) => {
                return total + office.vehicles.filter((vehicle: any) => vehicle.tests[quarter] !== null).length;
            }, 0);

            const quarterPassed = officeGroups.reduce((total, office) => {
                return total + office.vehicles.filter((vehicle: any) => vehicle.tests[quarter]?.result === true).length;
            }, 0);

            const quarterFailed = officeGroups.reduce((total, office) => {
                return total + office.vehicles.filter((vehicle: any) => vehicle.tests[quarter]?.result === false).length;
            }, 0);

            const totalVehicles = officeGroups.reduce((total, office) => total + office.vehicles.length, 0);
            const completionRate = totalVehicles > 0 ? (quarterTests / totalVehicles) * 100 : 0;
            const passRate = quarterTests > 0 ? (quarterPassed / quarterTests) * 100 : 0;

            return {
                quarter,
                quarterIndex,
                tested: quarterTests,
                passed: quarterPassed,
                failed: quarterFailed,
                notTested: totalVehicles - quarterTests,
                completionRate,
                passRate,
            };
        });
    }, [officeGroups, quarterNames]);

    const CircularProgress: React.FC<{
        percentage: number;
        size?: number;
        strokeWidth?: number;
        color?: string;
        label?: string;
    }> = ({ percentage, size = 100, strokeWidth = 6, color = "#3B82F6", label }) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * Math.PI * 2;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
            <div className="flex flex-col items-center">
                <div className="relative">
                    <svg width={size} height={size} className="transform -rotate-90">
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="#F3F4F6"
                            strokeWidth={strokeWidth}
                            fill="none"
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={color}
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-900">
                            {Math.round(percentage)}%
                        </span>
                    </div>
                </div>
                {label && (
                    <span className="text-xs text-gray-600 mt-2 text-center">{label}</span>
                )}
            </div>
        );
    };

    const QuarterProgressCard: React.FC<{ quarterData: any }> = ({ quarterData }) => {
        const getStatusColor = (rate: number) => {
            if (rate >= 80) return "#10B981"; // green
            if (rate >= 60) return "#F59E0B"; // yellow
            return "#EF4444"; // red
        };

        return (
            <Card className="border border-gray-200 shadow-none bg-white">
                <CardContent className="p-4">
                    <div className="text-center space-y-3">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                            <Calendar className="h-4 w-4 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-900">{quarterData.quarter} {selectedYear}</h3>
                        </div>

                        <CircularProgress
                            percentage={quarterData.completionRate}
                            color={getStatusColor(quarterData.completionRate)}
                            label="Completion Rate"
                            size={90}
                        />

                        <div className="grid grid-cols-3 gap-2 text-center mt-3">
                            <div className="p-2 bg-green-50 rounded border border-green-200">
                                <div className="text-lg font-bold text-green-600">{quarterData.passed}</div>
                                <div className="text-xs text-green-700">Passed</div>
                            </div>
                            <div className="p-2 bg-red-50 rounded border border-red-200">
                                <div className="text-lg font-bold text-red-600">{quarterData.failed}</div>
                                <div className="text-xs text-red-700">Failed</div>
                            </div>
                            <div className="p-2 bg-gray-50 rounded border border-gray-200">
                                <div className="text-lg font-bold text-gray-600">{quarterData.notTested}</div>
                                <div className="text-xs text-gray-700">Pending</div>
                            </div>
                        </div>

                        <Badge variant={quarterData.completionRate >= 80 ? "default" : quarterData.completionRate >= 60 ? "secondary" : "destructive"}>
                            {quarterData.passRate.toFixed(1)}% Pass Rate
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            {/* Main Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 mb-6">
                <StatCard
                    label="Total Vehicles"
                    value={overallStats.totalVehicles}
                    Icon={Car}
                />
                <StatCard
                    label="Tests Completed"
                    value={overallStats.totalTests}
                    Icon={Target}
                />
                <StatCard
                    label="Tests Passed"
                    value={overallStats.totalPassed}
                    Icon={CheckCircle}
                />
                <StatCard
                    label="Tests Failed"
                    value={overallStats.totalFailed}
                    Icon={XCircle}
                />
                <StatCard
                    label="Pending Tests"
                    value={overallStats.notTested}
                    Icon={Clock}
                />
                <StatCard
                    label={`Completion Rate (${selectedYear})`}
                    value={`${overallStats.completionRate.toFixed(1)}%`}
                    Icon={BarChart3}
                />
            </div>

            {/* Annual Progress */}
            <Card className="border border-gray-200 shadow-none bg-white">
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5 text-gray-600" />
                        <CardTitle className="text-xl">Annual Testing Progress {selectedYear}</CardTitle>
                    </div>
                    <p className="text-gray-600 text-sm">
                        Overall performance summary
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="flex justify-center">
                            <CircularProgress
                                percentage={overallStats.completionRate}
                                size={140}
                                strokeWidth={8}
                                color={overallStats.completionRate >= 80 ? "#10B981" : overallStats.completionRate >= 60 ? "#F59E0B" : "#EF4444"}
                                label="Overall Completion"
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="bg-gray-50 p-4 rounded border border-gray-200">
                                <h4 className="text-base font-semibold text-gray-900 mb-3">Testing Summary</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Expected Tests:</span>
                                        <span className="font-medium">{overallStats.totalVehicles * 4}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Completed:</span>
                                        <span className="font-medium">{overallStats.totalTests}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Remaining:</span>
                                        <span className="font-medium">{overallStats.notTested}</span>
                                    </div>
                                    <hr className="border-gray-200" />
                                    <div className="flex justify-between">
                                        <span className="text-green-600">Passed:</span>
                                        <span className="font-medium text-green-700">{overallStats.totalPassed}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-red-600">Failed:</span>
                                        <span className="font-medium text-red-700">{overallStats.totalFailed}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quarterly Breakdown */}
            <Card className="border border-gray-200 shadow-none bg-white">
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-gray-600" />
                        <CardTitle className="text-xl">Quarterly Performance</CardTitle>
                    </div>
                    <p className="text-gray-600 text-sm">
                        Progress by quarter for {selectedYear}
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quarterStats.map((quarterData) => (
                            <QuarterProgressCard key={quarterData.quarter} quarterData={quarterData} />
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Office Details */}
            {selectedOffices.length > 0 && !selectedOffices.includes("all") && officeGroups.length > 0 && (
                <Card className="border border-gray-200 shadow-none bg-white">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-gray-600" />
                            <CardTitle className="text-xl">Office Details</CardTitle>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Detailed breakdown for selected office{selectedOffices.length > 1 ? 's' : ''}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {officeGroups.map((office) => (
                                <div key={office.office_id} className="bg-gray-50 border border-gray-200 rounded p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">{office.office_name}</h3>
                                        <Badge variant="outline">
                                            {office.vehicles.length} Vehicles
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {quarterNames.map((quarter) => {
                                            const quarterTests = office.vehicles.filter((v: any) => v.tests[quarter] !== null).length;
                                            const quarterPassed = office.vehicles.filter((v: any) => v.tests[quarter]?.result === true).length;
                                            const quarterFailed = office.vehicles.filter((v: any) => v.tests[quarter]?.result === false).length;
                                            const completionRate = office.vehicles.length > 0 ? (quarterTests / office.vehicles.length) * 100 : 0;

                                            return (
                                                <div key={quarter} className="bg-white p-3 rounded border border-gray-200 text-center">
                                                    <div className="font-medium text-gray-900 mb-2">{quarter}</div>
                                                    <CircularProgress
                                                        percentage={completionRate}
                                                        size={70}
                                                        strokeWidth={5}
                                                        color={completionRate >= 80 ? "#10B981" : completionRate >= 60 ? "#F59E0B" : "#EF4444"}
                                                    />
                                                    <div className="space-y-1 text-xs mt-2">
                                                        <div className="text-green-600">{quarterPassed} Passed</div>
                                                        <div className="text-red-600">{quarterFailed} Failed</div>
                                                        <div className="text-gray-500">{office.vehicles.length - quarterTests} Pending</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
