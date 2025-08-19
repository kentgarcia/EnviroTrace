import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface AirQualityVisualDashboardProps {
    monthlyViolations?: Array<{ month: string; amount: number }>;
    vehicleTypeData?: Array<{ id: string; label: string; value: number }>;
    paymentStatusData?: Array<{ id: string; label: string; value: number }>;
    locationData?: Array<{ id: string; label: string; value: number }>;
    recentViolations?: any[];
    recentRecords?: any[];
    recentLoading?: boolean;
}

const COLORS = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00",
    "#ff00ff", "#00ffff", "#ff0000", "#0000ff", "#ffff00"
];

const AirQualityVisualDashboard: React.FC<AirQualityVisualDashboardProps> = ({
    monthlyViolations = [],
    vehicleTypeData = [],
    paymentStatusData = [],
    locationData = [],
    recentViolations = [],
    recentRecords = [],
    recentLoading = false,
}) => {
    return (
        <div className="space-y-6">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Violations Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            Monthly Violations Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyViolations}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="amount" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Vehicle Type Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            Vehicle Type Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={vehicleTypeData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {vehicleTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Status and Top Locations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            Payment Status Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={paymentStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {paymentStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Violation Locations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            Top Violation Locations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={locationData.slice(0, 5)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Violations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            Recent Violations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentLoading ? (
                            <div className="space-y-2">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentViolations.slice(0, 5).map((violation, index) => (
                                    <div key={violation.id || index} className="border-b border-gray-200 pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {violation.ordinance_infraction_report_no || "No Report No."}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {violation.place_of_apprehension}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(violation.date_of_apprehension).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${violation.paid_driver && violation.paid_operator
                                                    ? "bg-green-100 text-green-800"
                                                    : violation.paid_driver || violation.paid_operator
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-red-100 text-red-800"
                                                    }`}>
                                                    {violation.paid_driver && violation.paid_operator
                                                        ? "Paid"
                                                        : violation.paid_driver || violation.paid_operator
                                                            ? "Partial"
                                                            : "Pending"
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Vehicle Records */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            Recent Vehicle Records
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentLoading ? (
                            <div className="space-y-2">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentRecords.slice(0, 5).map((record, index) => (
                                    <div key={record.id || index} className="border-b border-gray-200 pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {record.plate_number}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {record.vehicle_type} - {record.motor_vehicle_name || "N/A"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {record.operator_company_name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">
                                                    {new Date(record.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AirQualityVisualDashboard;
