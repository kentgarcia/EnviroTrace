/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface MultiSeriesData {
    category: string;
    [key: string]: string | number; // For multiple series data
}

interface EChartsMultiBarChartProps {
    data: MultiSeriesData[];
    seriesConfig: Array<{
        key: string;
        name: string;
        color: string;
    }>;
    height?: number;
    valueFormatter?: (value: number) => string;
    categoryFormatter?: (category: string) => string;
}

export function EChartsMultiBarChart({
    data,
    seriesConfig,
    height = 300,
    valueFormatter = (value) => value.toString(),
    categoryFormatter = (category) => category,
}: EChartsMultiBarChartProps) {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let chart: echarts.ECharts | undefined;

        if (chartRef.current !== null) {
            chart = echarts.init(chartRef.current);

            // Extract categories
            const categories = data.map((item) => categoryFormatter(item.category));

            // Create series data
            const series = seriesConfig.map((config) => ({
                name: config.name,
                type: "bar" as const,
                data: data.map((item) => item[config.key] as number),
                itemStyle: {
                    color: config.color,
                },
                label: {
                    show: true,
                    position: "top" as const,
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#374151",
                    formatter: (params: any) => valueFormatter(params.value),
                },
                emphasis: {
                    focus: "series" as const,
                },
            }));

            const option: echarts.EChartsOption = {
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "shadow",
                    },
                    formatter: (params: any) => {
                        if (!params || params.length === 0) return "";
                        let result = `<strong>${params[0].axisValue}</strong><br/>`;
                        params.forEach((param: any) => {
                            result += `<span style="color: ${param.color};">●</span> ${param.seriesName}: ${valueFormatter(param.value)}<br/>`;
                        });
                        return result;
                    },
                },
                legend: {
                    data: seriesConfig.map((config) => config.name),
                    top: 0,
                    textStyle: {
                        color: "#374151",
                        fontSize: 12,
                    },
                },
                grid: {
                    left: "3%",
                    right: "4%",
                    bottom: "3%",
                    top: "15%",
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
                        fontSize: 12,
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
                        fontSize: 12,
                    },
                    splitLine: {
                        lineStyle: {
                            color: "#f3f4f6",
                        },
                    },
                },
                series: series,
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
    }, [data, seriesConfig, height, valueFormatter, categoryFormatter]);

    return <div ref={chartRef} style={{ width: "100%", height: `${height}px` }} />;
}
