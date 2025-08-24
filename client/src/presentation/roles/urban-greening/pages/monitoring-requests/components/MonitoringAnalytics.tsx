import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/shared/ui/card';
import StatCard from '@/presentation/components/shared/StatCard';
import {
    TrendingUp, TrendingDown, CheckCircle, Activity, BarChart, PieChart
} from 'lucide-react';
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Cell, ComposedChart, Area, AreaChart, Pie
} from 'recharts';
import { MonitoringRequest } from '../logic/useMonitoringRequests';

interface MonitoringAnalyticsProps {
    requests: MonitoringRequest[];
    onTakeAction: (actionType: string, requests: MonitoringRequest[]) => void;
}

const MonitoringAnalytics: React.FC<MonitoringAnalyticsProps> = ({
    requests,
    onTakeAction
}) => {
    // Calculate analytics
    const totalRequests = requests.length;
    const livingCount = requests.filter(r => r.status?.toLowerCase() === 'living').length;
    const deadCount = requests.filter(r => r.status?.toLowerCase() === 'dead').length;
    const untrackedCount = requests.filter(r => r.status?.toLowerCase() === 'untracked').length;
    const replacedCount = requests.filter(r => r.status?.toLowerCase() === 'replaced').length;

    const survivalRate = totalRequests > 0 ? (livingCount / totalRequests) * 100 : 0;
    const needsActionCount = deadCount + untrackedCount;

    // Group by source type
    const urbanGreeningCount = requests.filter(r => r.source_type === 'urban_greening').length;
    const treeManagementCount = requests.filter(r => r.source_type === 'tree_management').length;

    // Chart data preparation
    const statusData = [
        { name: 'Living', value: livingCount, color: '#22c55e' },
        { name: 'Dead', value: deadCount, color: '#ef4444' },
        { name: 'Untracked', value: untrackedCount, color: '#6b7280' },
        { name: 'Replaced', value: replacedCount, color: '#3b82f6' }
    ];

    const sourceTypeData = [
        { name: 'Urban Greening', value: urbanGreeningCount, color: '#10b981' },
        { name: 'Tree Management', value: treeManagementCount, color: '#f59e0b' }
    ];

    // Monthly trend data (simulated based on request dates)
    const getMonthlyTrends = () => {
        const monthlyData: Record<string, { month: string; living: number; dead: number; total: number }> = {};

        requests.forEach(request => {
            if (request.date) {
                const date = new Date(request.date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = { month: monthName, living: 0, dead: 0, total: 0 };
                }

                monthlyData[monthKey].total += 1;
                if (request.status?.toLowerCase() === 'living') {
                    monthlyData[monthKey].living += 1;
                } else if (request.status?.toLowerCase() === 'dead') {
                    monthlyData[monthKey].dead += 1;
                }
            }
        });

        return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    };

    const monthlyTrends = getMonthlyTrends();

    return (
        <div className="space-y-6">
            {/* Key Metrics Overview - Using StatCard Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Survival Rate"
                    value={`${survivalRate.toFixed(1)}%`}
                    Icon={survivalRate >= 70 ? TrendingUp : TrendingDown}
                    colors={{
                        circleFill: survivalRate >= 70 ? "#22c55e" : "#ef4444",
                        circleBorder: "#FFD200",
                        iconColor: "#FFFFFF",
                        labelBg: survivalRate >= 70 ? "#22c55e" : "#ef4444",
                        labelText: "#FFFFFF",
                        valueText: survivalRate >= 70 ? "#22c55e" : "#ef4444",
                        accentLeft: "#FFD200",
                        accentRight: "#ED1C24",
                    }}
                />

                <StatCard
                    label="Needs Action"
                    value={needsActionCount}
                    Icon={Activity}
                    colors={{
                        circleFill: "#f59e0b",
                        circleBorder: "#FFD200",
                        iconColor: "#FFFFFF",
                        labelBg: "#f59e0b",
                        labelText: "#FFFFFF",
                        valueText: "#f59e0b",
                        accentLeft: "#FFD200",
                        accentRight: "#ED1C24",
                    }}
                />

                <StatCard
                    label="Living Plants"
                    value={livingCount}
                    Icon={CheckCircle}
                    colors={{
                        circleFill: "#22c55e",
                        circleBorder: "#FFD200",
                        iconColor: "#FFFFFF",
                        labelBg: "#22c55e",
                        labelText: "#FFFFFF",
                        valueText: "#22c55e",
                        accentLeft: "#FFD200",
                        accentRight: "#ED1C24",
                    }}
                />

                <StatCard
                    label="Total Monitored"
                    value={totalRequests}
                    Icon={Activity}
                    colors={{
                        circleFill: "#3b82f6",
                        circleBorder: "#FFD200",
                        iconColor: "#FFFFFF",
                        labelBg: "#3b82f6",
                        labelText: "#FFFFFF",
                        valueText: "#3b82f6",
                        accentLeft: "#FFD200",
                        accentRight: "#ED1C24",
                    }}
                />
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <PieChart className="h-5 w-5 text-blue-500 mr-2" />
                            Status Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Source Type Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <BarChart className="h-5 w-5 text-green-500 mr-2" />
                            Source Type Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={sourceTypeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#10b981" />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Trends Line Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-purple-500 mr-2" />
                        Monthly Monitoring Trends
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="total" fill="#e0e7ff" stroke="#6366f1" name="Total Requests" />
                                <Line type="monotone" dataKey="living" stroke="#22c55e" strokeWidth={3} name="Living" />
                                <Line type="monotone" dataKey="dead" stroke="#ef4444" strokeWidth={3} name="Dead" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Survival Rate Trend */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Activity className="h-5 w-5 text-orange-500 mr-2" />
                        Survival Rate Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyTrends.map(data => ({
                                ...data,
                                survivalRate: data.total > 0 ? (data.living / data.total) * 100 : 0
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Survival Rate']} />
                                <Area
                                    type="monotone"
                                    dataKey="survivalRate"
                                    stroke="#f59e0b"
                                    fill="#fef3c7"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MonitoringAnalytics;
