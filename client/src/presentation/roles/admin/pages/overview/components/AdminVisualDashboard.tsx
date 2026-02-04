import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import { UserActivityData } from "../logic/useAdminOverviewData";

interface AdminVisualDashboardProps {
    userActivityData?: UserActivityData[];
    isLoading?: boolean;
}

export const AdminVisualDashboard: React.FC<AdminVisualDashboardProps> = ({
    userActivityData = [],
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

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-32 rounded"></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6">
            {/* User Activity Trends */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium text-gray-900 dark:text-gray-100">User Activity Trends</CardTitle>
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
        </div>
    );
};