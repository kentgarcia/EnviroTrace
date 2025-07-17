import React from "react";
import { EChartsMultiBarChart } from "@/presentation/components/shared/dashboard/EChartsMultiBarChart";

const WheelCountBreakdown = ({ data, loading }: any) => {
    // Transform wheel count data for multi-series bar chart
    const wheelCountChartData = loading ? [] : data.wheelCountData.map((item: any) => ({
        category: item.label,
        passed: item.passed,
        failed: item.failed,
        untested: item.untested,
    }));

    const seriesConfig = [
        { key: "passed", name: "Passed", color: "#22c55e" },
        { key: "failed", name: "Failed", color: "#ef4444" },
        { key: "untested", name: "Untested", color: "#f59e0b" },
    ];

    return (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-base font-medium mb-4">Pass/Fail by Wheel Count</h3>
            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <div className="text-gray-500">Loading...</div>
                </div>
            ) : (
                <EChartsMultiBarChart
                    data={wheelCountChartData}
                    seriesConfig={seriesConfig}
                    height={380}
                    valueFormatter={(value: number) => value.toString()}
                />
            )}
        </div>
    );
};

export default WheelCountBreakdown;
