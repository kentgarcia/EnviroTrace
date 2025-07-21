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

    const InfoCard: React.FC<{
        title: string;
        value: number | string;
        subtitle?: string;
        icon: React.ReactNode;
        color?: "green" | "red" | "blue" | "yellow" | "purple";
    }> = ({ title, value, subtitle, icon, color = "blue" }) => {
        const colorClasses = {
            green: "bg-green-50 border-green-200",
            red: "bg-red-50 border-red-200",
            blue: "bg-blue-50 border-blue-200",
            yellow: "bg-yellow-50 border-yellow-200",
            purple: "bg-purple-50 border-purple-200",
        };

        const iconColors = {
            green: "text-green-600",
            red: "text-red-600",
            blue: "text-blue-600",
            yellow: "text-yellow-600",
            purple: "text-purple-600",
        };

        const textColors = {
            green: "text-green-700",
            red: "text-red-700",
            blue: "text-blue-700",
            yellow: "text-yellow-700",
            purple: "text-purple-700",
        };

        return (
            <Card className={`border ${colorClasses[color]} ${colorClasses[color]} shadow-none`}>
                <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg bg-white ${iconColors[color]}`}>
                            {icon}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                                {title}
                            </p>
                            <p className={`text-3xl font-bold ${textColors[color]} mb-1`}>
                                {value}
                            </p>
                            {subtitle && (
                                <p className="text-sm text-gray-500">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

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

    const StatCard: React.FC<{
        title: string;
        value: number;
        subtitle?: string;
        icon: React.ReactNode;
        trend?: "up" | "down" | "neutral";
        color?: "green" | "red" | "blue" | "yellow";
    }> = ({ title, value, subtitle, icon, trend, color = "blue" }) => {
        const colorClasses = {
            green: "text-green-600 bg-green-50",
            red: "text-red-600 bg-red-50",
            blue: "text-blue-600 bg-blue-50",
            yellow: "text-yellow-600 bg-yellow-50",
        };

        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{title}</p>
                            <p className="text-3xl font-bold text-gray-900">{value}</p>
                            {subtitle && (
                                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                            )}
                        </div>
                        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                            {icon}
                        </div>
                    </div>
                    {trend && (
                        <div className="mt-4 flex items-center">
                            {trend === "up" && <TrendingUp className="h-4 w-4 text-green-500 mr-1" />}
                            {trend === "down" && <TrendingDown className="h-4 w-4 text-red-500 mr-1" />}
                            <span className={`text-sm ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600"}`}>
                                vs last quarter
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            {/* Main Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoCard
                    title="Total Vehicles"
                    value={overallStats.totalVehicles}
                    subtitle={selectedOffices.length > 0 && !selectedOffices.includes("all") ?
                        `in ${selectedOffices.length} selected office${selectedOffices.length > 1 ? 's' : ''}` :
                        "across all offices"}
                    icon={<Car className="h-6 w-6" />}
                    color="blue"
                />
                <InfoCard
                    title="Tests Completed"
                    value={overallStats.totalTests}
                    subtitle={`${overallStats.completionRate.toFixed(1)}% completion rate`}
                    icon={<Target className="h-6 w-6" />}
                    color="purple"
                />
                <InfoCard
                    title="Tests Passed"
                    value={overallStats.totalPassed}
                    subtitle={`${overallStats.passRate.toFixed(1)}% success rate`}
                    icon={<Award className="h-6 w-6" />}
                    color="green"
                />
                <InfoCard
                    title="Tests Failed"
                    value={overallStats.totalFailed}
                    subtitle="need attention"
                    icon={<AlertTriangle className="h-6 w-6" />}
                    color="red"
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
