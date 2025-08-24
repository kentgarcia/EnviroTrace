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

interface EmissionVisualDashboardProps {
    quarterlyData?: Array<{ quarter: string; passed: number; failed: number; pending: number }>;
    vehicleTypeData?: Array<{ id: string; label: string; value: number; color?: string }>;
    officeComplianceData?: Array<{ id: string; label: string; value: number }>;
    engineTypeData?: Array<{ type: string; count: number; passedCount: number }>;
    monthlyTrendsData?: Array<{ month: string; tests: number; compliance: number }>;
}

const COLORS = [
    "#22c55e", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6",
    "#ec4899", "#14b8a6", "#f97316", "#84cc16", "#6366f1"
];

const EmissionVisualDashboard: React.FC<EmissionVisualDashboardProps> = ({
    quarterlyData = [],
    vehicleTypeData = [],
    officeComplianceData = [],
    engineTypeData = [],
    monthlyTrendsData = [],
}) => {
    // Helper function to safely convert to number
    const safeNumber = (value: any, defaultValue: number = 0): number => {
        const num = Number(value);
        return isNaN(num) || !isFinite(num) ? defaultValue : Math.max(num, 0);
    };

    // Safe data processing to avoid NaN values with comprehensive validation
    const safeQuarterlyData = quarterlyData
        .filter(item => item && item.quarter)
        .map(item => ({
            quarter: String(item.quarter || 'Q1'),
            passed: safeNumber(item.passed),
            failed: safeNumber(item.failed),
            pending: safeNumber(item.pending),
        }))
        .filter(item => item.passed >= 0 && item.failed >= 0 && item.pending >= 0);

    const safeVehicleTypeData = vehicleTypeData
        .filter(item => item && item.label)
        .map(item => ({
            id: String(item.id || 'unknown'),
            label: String(item.label || 'Unknown'),
            value: safeNumber(item.value),
            color: item.color || COLORS[0],
        }))
        .filter(item => item.value > 0);

    const safeOfficeComplianceData = officeComplianceData
        .filter(item => item && item.label)
        .map(item => ({
            id: String(item.id || 'unknown'),
            label: String(item.label || 'Unknown Office'),
            value: Math.min(Math.max(safeNumber(item.value), 0), 100), // Ensure 0-100 range
        }))
        .filter(item => item.value >= 0 && item.value <= 100);

    const safeEngineTypeData = engineTypeData
        .filter(item => item && item.type)
        .map(item => ({
            type: String(item.type || 'Unknown'),
            count: safeNumber(item.count),
            passedCount: safeNumber(item.passedCount),
        }))
        .filter(item => item.count >= 0 && item.passedCount >= 0 && item.passedCount <= item.count);

    const safeMonthlyTrendsData = monthlyTrendsData
        .filter(item => item && item.month)
        .map(item => ({
            month: String(item.month || 'Jan'),
            tests: safeNumber(item.tests),
            compliance: Math.min(Math.max(safeNumber(item.compliance), 0), 100), // Ensure 0-100 range
        }))
        .filter(item => item.tests >= 0 && item.compliance >= 0 && item.compliance <= 100);

    // Provide fallback data if all arrays are empty
    const fallbackQuarterly = safeQuarterlyData.length === 0 ? [
        { quarter: 'Q1', passed: 0, failed: 0, pending: 0 },
        { quarter: 'Q2', passed: 0, failed: 0, pending: 0 },
        { quarter: 'Q3', passed: 0, failed: 0, pending: 0 },
        { quarter: 'Q4', passed: 0, failed: 0, pending: 0 },
    ] : safeQuarterlyData;

    const fallbackMonthly = safeMonthlyTrendsData.length === 0 ? [
        { month: 'Jan', tests: 0, compliance: 0 },
        { month: 'Feb', tests: 0, compliance: 0 },
        { month: 'Mar', tests: 0, compliance: 0 },
    ] : safeMonthlyTrendsData;

    return (
        <div className="space-y-6">
            {/* Top Row: Monthly Trends and Vehicle Type Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Testing Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            Monthly Testing Trends
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={fallbackMonthly}>
                                <defs>
                                    <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis
                                    domain={[0, 'dataMax + 10']}
                                    allowDataOverflow={false}
                                    type="number"
                                />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="tests"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorTests)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="compliance"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorCompliance)"
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
                                        data={safeVehicleTypeData.length > 0 ? safeVehicleTypeData : [{ id: 'no-data', label: 'No Data', value: 1, color: '#e5e7eb' }]}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ label, percent }) => safeVehicleTypeData.length > 0 ? `${label}: ${(percent * 100).toFixed(0)}%` : 'No Data'}
                                    >
                                        {(safeVehicleTypeData.length > 0 ? safeVehicleTypeData : [{ id: 'no-data', label: 'No Data', value: 1, color: '#e5e7eb' }]).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-2">
                                {safeVehicleTypeData.length > 0 ? safeVehicleTypeData.map((entry, index) => (
                                    <div key={entry.id} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }}
                                        />
                                        <span className="text-sm text-gray-600">
                                            {entry.label}: {entry.value}
                                        </span>
                                    </div>
                                )) : (
                                    <div className="text-sm text-gray-500">No data available</div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row: Quarterly Comparison and Office Compliance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quarterly Test Results */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            Quarterly Test Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={fallbackQuarterly}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="quarter" />
                                <YAxis
                                    domain={[0, 'dataMax + 10']}
                                    allowDataOverflow={false}
                                    type="number"
                                />
                                <Tooltip />
                                <Bar dataKey="passed" fill="#22c55e" name="Passed" />
                                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                                <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Office Compliance Ranking */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            Office Compliance Ranking
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={safeOfficeComplianceData.length > 0 ? safeOfficeComplianceData : [{ id: 'no-data', label: 'No Data', value: 0 }]} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" domain={[0, 100]} />
                                <YAxis dataKey="label" type="category" width={80} />
                                <Tooltip formatter={(value) => [`${value}%`, 'Compliance Rate']} />
                                <Bar
                                    dataKey="value"
                                    fill="#3b82f6"
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Engine Type Analysis */}
            {safeEngineTypeData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            Engine Type Performance Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={safeEngineTypeData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="type" />
                                <YAxis
                                    domain={[0, 'dataMax + 5']}
                                    allowDataOverflow={false}
                                    type="number"
                                />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8b5cf6" name="Total Vehicles" />
                                <Bar dataKey="passedCount" fill="#22c55e" name="Passed Tests" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default EmissionVisualDashboard;
