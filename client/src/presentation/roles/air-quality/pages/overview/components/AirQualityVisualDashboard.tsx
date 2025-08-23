import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

interface AirQualityVisualDashboardProps {
    monthlyViolations?: Array<{ month: string; amount: number }>;
    vehicleTypeData?: Array<{ id: string; label: string; value: number }>;
    paymentStatusData?: Array<{ id: string; label: string; value: number }>;
    locationData?: Array<{ id: string; label: string; value: number }>;
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
}) => {
    return (
        <div className="space-y-6">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Violations Area Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            Monthly Violations Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={monthlyViolations}>
                                <defs>
                                    <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorViolations)"
                                />
                            </AreaChart>
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
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width="60%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={vehicleTypeData}
                                        cx="50%"
                                        cy="50%"
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
                            <div className="flex-1 space-y-2">
                                {vehicleTypeData.map((entry, index) => (
                                    <div key={entry.id} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        ></div>
                                        <span className="text-sm text-gray-700 flex-1">{entry.label}</span>
                                        <span className="text-sm font-medium text-gray-900">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
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
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width="60%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={paymentStatusData}
                                        cx="50%"
                                        cy="50%"
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
                            <div className="flex-1 space-y-2">
                                {paymentStatusData.map((entry, index) => (
                                    <div key={entry.id} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        ></div>
                                        <span className="text-sm text-gray-700 flex-1">{entry.label}</span>
                                        <span className="text-sm font-medium text-gray-900">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
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
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width="60%" height={250}>
                                <BarChart data={locationData.slice(0, 5)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" hide />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-2">
                                {locationData.slice(0, 5).map((entry, index) => (
                                    <div key={entry.id} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full bg-blue-500"
                                        ></div>
                                        <span className="text-sm text-gray-700 flex-1">{entry.label}</span>
                                        <span className="text-sm font-medium text-gray-900">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AirQualityVisualDashboard;
