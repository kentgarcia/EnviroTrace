import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    LineChart,
    Line
} from "recharts";
import { UserActivityData, SystemHealthData, RecentActivityData } from "../logic/useAdminOverviewData";

interface AdminVisualDashboardProps {
    userActivityData?: UserActivityData[];
    systemHealthData?: SystemHealthData[];
    recentActivityData?: RecentActivityData[];
    isLoading?: boolean;
}

const COLORS = [
    "#22c55e", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6",
    "#ec4899", "#14b8a6", "#f97316", "#84cc16", "#6366f1"
];

export const AdminVisualDashboard: React.FC<AdminVisualDashboardProps> = ({
    userActivityData = [],
    systemHealthData = [],
    recentActivityData = [],
    isLoading = false
}) => {
    // Helper function to safely convert to number
    const safeNumber = (value: any, defaultValue: number = 0): number => {
        const num = Number(value);
        return isNaN(num) || !isFinite(num) ? defaultValue : Math.max(num, 0);
    };

    // Safe data processing
    const safeUserActivityData = userActivityData
        .filter(item => item && item.date)
        .map(item => ({
            date: String(item.date || 'Unknown'),
            logins: safeNumber(item.logins),
            registrations: safeNumber(item.registrations),
            activeUsers: safeNumber(item.activeUsers),
        }));

    const safeSystemHealthData = systemHealthData
        .filter(item => item && item.metric)
        .map(item => ({
            metric: String(item.metric || 'Unknown'),
            value: Math.min(Math.max(safeNumber(item.value), 0), 100), // Ensure 0-100 range
            status: item.status || 'good',
            fill: item.status === 'critical' ? '#ef4444' :
                item.status === 'warning' ? '#f59e0b' : '#22c55e'
        }));

    const safeRecentActivityData = recentActivityData
        .slice(0, 10) // Limit to recent 10 activities
        .map((item, index) => ({
            ...item,
            id: String(item.id || index),
            type: String(item.type || 'Unknown'),
            description: String(item.description || 'No description'),
            timestamp: String(item.timestamp || 'Unknown time'),
        }));

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <CardTitle className="animate-pulse bg-gray-200 h-4 w-32 rounded"></CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] animate-pulse bg-gray-100 rounded-lg"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Activity Trends */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium">User Activity Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={safeUserActivityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#666"
                                    fontSize={12}
                                />
                                <YAxis
                                    stroke="#666"
                                    fontSize={12}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="logins"
                                    stackId="1"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.6}
                                    name="Logins"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="registrations"
                                    stackId="1"
                                    stroke="#10b981"
                                    fill="#10b981"
                                    fillOpacity={0.6}
                                    name="Registrations"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="activeUsers"
                                    stackId="1"
                                    stroke="#f59e0b"
                                    fill="#f59e0b"
                                    fillOpacity={0.6}
                                    name="Active Users"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* System Health Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium">System Health Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={safeSystemHealthData} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    type="number"
                                    domain={[0, 100]}
                                    stroke="#666"
                                    fontSize={12}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="metric"
                                    stroke="#666"
                                    fontSize={12}
                                    width={80}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                    formatter={(value: any) => [`${value}%`, 'Usage']}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-base font-medium">Recent System Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                        {safeRecentActivityData.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <p>No recent activity to display</p>
                            </div>
                        ) : (
                            safeRecentActivityData.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-gray-900">
                                                {activity.type}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {activity.timestamp}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {activity.description}
                                        </p>
                                        {activity.user && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                by {activity.user}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};