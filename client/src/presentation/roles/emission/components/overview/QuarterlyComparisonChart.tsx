import React from "react";
import { EChartsMultiBarChart } from "@/presentation/components/shared/dashboard/EChartsMultiBarChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { useQuarterlyComparison } from "@/core/hooks/emissions/useQuarterlyComparison";

interface QuarterlyComparisonChartProps {
    selectedYear: number;
}

const QuarterlyComparisonChart: React.FC<QuarterlyComparisonChartProps> = ({
    selectedYear,
}) => {
    const { data, loading, error } = useQuarterlyComparison(selectedYear);

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Quarterly Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-red-600 text-sm">
                        Error loading quarterly comparison data
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Transform data for the multi-series bar chart
    const chartData = data.map((quarter) => ({
        category: quarter.quarter,
        passed: quarter.passed_vehicles,
        failed: quarter.failed_vehicles,
        untested: quarter.untested_vehicles,
    }));

    const seriesConfig = [
        { key: "passed", name: "Passed", color: "#22c55e" },
        { key: "failed", name: "Failed", color: "#ef4444" },
        { key: "untested", name: "Untested", color: "#f59e0b" },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quarterly Vehicle Testing Comparison ({selectedYear})</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-gray-500">Loading quarterly data...</div>
                    </div>
                ) : (
                    <EChartsMultiBarChart
                        data={chartData}
                        seriesConfig={seriesConfig}
                        height={380}
                        valueFormatter={(value: number) => value.toString()}
                    />
                )}
            </CardContent>
        </Card>
    );
};

export default QuarterlyComparisonChart;
