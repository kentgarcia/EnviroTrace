import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SummaryStats {
    totalVehicles: number;
    totalTested: number;
    totalPassed: number;
    totalFailed: number;
    totalUntested: number;
    byQuarter: {
        Q1: { tested: number; passed: number; failed: number };
        Q2: { tested: number; passed: number; failed: number };
        Q3: { tested: number; passed: number; failed: number };
        Q4: { tested: number; passed: number; failed: number };
    };
}

interface QuarterlyTestingSummaryProps {
    stats: SummaryStats;
    selectedYear: number | null;
}

export const QuarterlyTestingSummary: React.FC<QuarterlyTestingSummaryProps> = ({
    stats,
    selectedYear,
}) => {
    const complianceRate = stats.totalVehicles > 0
        ? ((stats.totalPassed / stats.totalVehicles) * 100).toFixed(1)
        : "0";

    // Prepare data for quarterly breakdown chart
    const quarterlyData = [
        { quarter: 'Q1', passed: stats.byQuarter.Q1.passed, failed: stats.byQuarter.Q1.failed },
        { quarter: 'Q2', passed: stats.byQuarter.Q2.passed, failed: stats.byQuarter.Q2.failed },
        { quarter: 'Q3', passed: stats.byQuarter.Q3.passed, failed: stats.byQuarter.Q3.failed },
        { quarter: 'Q4', passed: stats.byQuarter.Q4.passed, failed: stats.byQuarter.Q4.failed },
    ];

    // Prepare data for pie chart
    const pieData = [
        { name: 'Passed', value: stats.totalPassed, color: '#10b981' },
        { name: 'Failed', value: stats.totalFailed, color: '#ef4444' },
        { name: 'Not Tested', value: stats.totalUntested, color: '#6b7280' }
    ];

    return (
        <div className="space-y-6 mb-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Vehicles */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalVehicles}</div>
                        <div className="text-xs text-muted-foreground">
                            {complianceRate}% compliance rate
                        </div>
                    </CardContent>
                </Card>

                {/* Tested Vehicles */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Tested Vehicles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTested}</div>
                        <div className="text-xs text-muted-foreground">
                            {stats.totalVehicles > 0 ? Math.round((stats.totalTested / stats.totalVehicles) * 100) : 0}% of total
                        </div>
                    </CardContent>
                </Card>

                {/* Passed Tests */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Passed Tests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.totalPassed}</div>
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            {stats.totalTested > 0 ? Math.round((stats.totalPassed / stats.totalTested) * 100) : 0}% pass rate
                        </Badge>
                    </CardContent>
                </Card>

                {/* Failed Tests */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Failed Tests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.totalFailed}</div>
                        <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                            {stats.totalTested > 0 ? Math.round((stats.totalFailed / stats.totalTested) * 100) : 0}% fail rate
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quarterly Breakdown Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quarterly Breakdown ({selectedYear})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={quarterlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="quarter" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="passed" fill="#10b981" name="Passed" />
                                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Test Results Distribution Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Test Results Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
