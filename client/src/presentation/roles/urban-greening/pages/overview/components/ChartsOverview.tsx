import React from "react";
import { EChartsPieChart } from "@/presentation/components/shared/dashboard/EChartsPieChart";
import { EChartsBarChart } from "@/presentation/components/shared/dashboard/EChartsBarChart";

interface ChartsOverviewProps {
    requestStatusData: Array<{ id: string; label: string; value: number }>;
    requestTypeData: Array<{ id: string; label: string; value: number }>;
    urgencyData: Array<{ id: string; label: string; value: number }>;
    plantingTypeData: Array<{ id: string; label: string; value: number }>;
    speciesData: Array<{ id: string; label: string; value: number }>;
    isLoading: boolean;
}

export const ChartsOverview: React.FC<ChartsOverviewProps> = ({
    requestStatusData,
    requestTypeData,
    urgencyData,
    plantingTypeData,
    speciesData,
    isLoading,
}) => {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="space-y-4">
                    <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Middle Column - Pie Charts */}
            <div className="space-y-4">
                <EChartsPieChart
                    title="Request Status (2025)"
                    data={requestStatusData}
                    height={180}
                />
                <EChartsPieChart
                    title="Request Types (2025)"
                    data={requestTypeData}
                    height={180}
                />
            </div>

            {/* Right Column - Bar Charts */}
            <div className="space-y-4">
                <EChartsBarChart
                    title="Request Urgency Levels"
                    data={urgencyData}
                    height={180}
                    color={["#ef4444", "#f59e0b", "#22c55e", "#3b82f6"]}
                />
                {plantingTypeData.length > 0 && (
                    <EChartsPieChart
                        title="Urban Greening Breakdown"
                        data={plantingTypeData}
                        height={180}
                    />
                )}
                {speciesData.length > 0 && (
                    <EChartsBarChart
                        title="Species Planted"
                        data={speciesData.slice(0, 6)} // Show top 6 species
                        height={180}
                        color={[
                            "#22c55e",
                            "#4f46e5",
                            "#f59e42",
                            "#eab308",
                            "#a3e635",
                            "#818cf8",
                        ]}
                    />
                )}
            </div>
        </>
    );
};
