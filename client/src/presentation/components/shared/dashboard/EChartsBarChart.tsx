/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/shared/ui/card";

interface BarChartData {
  id: string;
  label: string;
  value: number;
  [key: string]: any; // For additional data points
}

interface EChartsBarChartProps {
  title: string;
  data: BarChartData[];
  height?: number;
  layout?: "vertical" | "horizontal";
  color?: string | string[];
  valueFormatter?: (value: number) => string;
  categoryFormatter?: (category: string) => string;
}

export function EChartsBarChart({
  title,
  data,
  height = 300,
  layout = "vertical",
  color = "#4f46e5",
  valueFormatter = (value) => value.toString(),
  categoryFormatter = (category) => category,
}: EChartsBarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    // Initialize chart
    let chart: echarts.ECharts | undefined;

    if (chartRef.current !== null) {
      chart = echarts.init(chartRef.current);

      // Sort data by value for better visualization
      const sortedData = [...data].sort((a, b) => b.value - a.value);

      // Extract categories and values
      const categories = sortedData.map((item) =>
        categoryFormatter(item.label)
      );
      const values = sortedData.map((item) => item.value);

      // Determine if horizontal or vertical bar chart
      const isHorizontal = layout === "horizontal";

      // Set chart options
      const options: echarts.EChartsOption = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: (params: any) => {
            const param = params[0];
            return `${param.name}: ${valueFormatter(param.value)}`;
          },
        },
        grid: {
          left: isHorizontal ? "20%" : "3%",
          right: isHorizontal ? "15%" : "4%",
          bottom: isHorizontal ? "3%" : "20%",
          top: "15%",
          containLabel: true,
        },
        [isHorizontal ? "yAxis" : "xAxis"]: {
          type: "category",
          data: categories,
          axisLabel: {
            interval: 0,
            rotate: isHorizontal ? 0 : 30,
            color: isDark ? "#d1d5db" : "#374151",
            formatter: (value: string) => {
              // Truncate long labels
              return value.length > 15 ? value.substring(0, 12) + "..." : value;
            },
          },
          axisTick: {
            alignWithLabel: true,
          },
        },
        [isHorizontal ? "xAxis" : "yAxis"]: {
          type: "value",
          axisLabel: {
            color: isDark ? "#d1d5db" : "#374151",
          },
        },
        series: [
          {
            name: title,
            type: "bar",
            barWidth: isHorizontal ? "60%" : "40%",
            data: values,
            itemStyle: {
              color:
                typeof color === "string"
                  ? color
                  : (params: any) => {
                    // Cycle through colors if an array is provided
                    return color[params.dataIndex % color.length];
                  },
            },
            label: {
              show: true,
              position: isHorizontal ? "right" : "top",
              fontSize: 12,
              fontWeight: 600,
              color: isDark ? "#d1d5db" : "#374151",
              formatter: (params: any) => {
                return valueFormatter(params.value);
              },
              distance: 5,
            },
          },
        ],
      };

      // Apply options to chart
      chart.setOption(options);
    }

    // Handle resize
    const handleResize = () => {
      chart?.resize();
    };

    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      chart?.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [data, title, layout, color, valueFormatter, categoryFormatter, isDark]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} style={{ height: `${height}px` }} />
      </CardContent>
    </Card>
  );
}
