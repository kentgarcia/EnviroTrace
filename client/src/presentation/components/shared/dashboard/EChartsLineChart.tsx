/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface LineChartData {
    category: string;
    value: number;
    [key: string]: any; // For additional data points
}

interface EChartsLineChartProps {
    data: LineChartData[];
    height?: number;
    color?: string | string[];
    valueFormatter?: (value: number) => string;
    categoryFormatter?: (category: string) => string;
    showDataLabels?: boolean;
    customTooltip?: (params: any) => string;
}

export function EChartsLineChart({
    data,
    height = 300,
    color = "#22c55e",
    valueFormatter = (value) => value.toString(),
    categoryFormatter = (category) => category,
    showDataLabels = false,
    customTooltip,
}: EChartsLineChartProps) {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize chart
        let chart: echarts.ECharts | undefined;

        if (chartRef.current !== null) {
            chart = echarts.init(chartRef.current);

            // Extract categories and values
            const categories = data.map((item) => categoryFormatter(item.category));
            const values = data.map((item) => item.value);

            // Convert single color to array if needed
            const colors = Array.isArray(color) ? color : [color];

            const option: echarts.EChartsOption = {
                color: colors,
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "line",
                    },
                    formatter: customTooltip || ((params: any) => {
                        if (!params || params.length === 0) return "";
                        const data = params[0];
                        return `${data.axisValue}: ${valueFormatter(data.value)}`;
                    }),
                },
                grid: {
                    left: "3%",
                    right: "4%",
                    bottom: "3%",
                    containLabel: true,
                },
                xAxis: {
                    type: "category",
                    data: categories,
                    axisLine: {
                        lineStyle: {
                            color: "#e5e7eb",
                        },
                    },
                    axisLabel: {
                        color: "#6b7280",
                    },
                },
                yAxis: {
                    type: "value",
                    axisLine: {
                        lineStyle: {
                            color: "#e5e7eb",
                        },
                    },
                    axisLabel: {
                        color: "#6b7280",
                        formatter: valueFormatter,
                    },
                    splitLine: {
                        lineStyle: {
                            color: "#f3f4f6",
                        },
                    },
                },
                series: [
                    {
                        data: data.map((item, index) => ({
                            value: item.value,
                            data: item, // Store original data for tooltip
                        })),
                        type: "line",
                        smooth: true,
                        symbol: "circle",
                        symbolSize: 8,
                        lineStyle: {
                            width: 3,
                        },
                        label: showDataLabels
                            ? {
                                show: true,
                                position: "top",
                                formatter: (params: any) => valueFormatter(params.value),
                                color: "#374151",
                                fontSize: 12,
                                fontWeight: "bold",
                            }
                            : undefined,
                        emphasis: {
                            scale: 1.2,
                            focus: "series",
                        },
                    },
                ],
            };

            chart.setOption(option);

            // Handle window resize
            const handleResize = () => {
                chart?.resize();
            };

            window.addEventListener("resize", handleResize);

            return () => {
                window.removeEventListener("resize", handleResize);
                chart?.dispose();
            };
        }
    }, [data, height, color, valueFormatter, categoryFormatter, showDataLabels, customTooltip]);

    return <div ref={chartRef} style={{ width: "100%", height: `${height}px` }} />;
}
