import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PieChartData {
    id: string;
    label: string;
    value: number;
}

interface EChartsPieChartProps {
    title: string;
    data: PieChartData[];
    height?: number;
    colors?: string[];
}

export function EChartsPieChart({
    title,
    data,
    height = 300,
    colors = ['#4f46e5', '#6366f1', '#818cf8', '#93c5fd', '#bfdbfe']
}: EChartsPieChartProps) {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize chart
        let chart: echarts.ECharts | undefined;

        if (chartRef.current !== null) {
            chart = echarts.init(chartRef.current);

            // Prepare data for ECharts format
            const chartData = data.map(item => ({
                name: item.label,
                value: item.value
            }));

            // Set chart options
            const options: echarts.EChartsOption = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    right: 10,
                    top: 'center',
                    type: 'scroll',
                    textStyle: {
                        fontSize: 12
                    }
                },
                series: [
                    {
                        name: title,
                        type: 'pie',
                        radius: ['40%', '70%'], // Donut chart
                        center: ['40%', '50%'],
                        avoidLabelOverlap: true,
                        itemStyle: {
                            borderRadius: 4,
                            borderColor: '#fff',
                            borderWidth: 2
                        },
                        label: {
                            show: false
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: '14',
                                fontWeight: 'bold'
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        data: chartData,
                        color: colors
                    }
                ]
            };

            // Apply options to chart
            chart.setOption(options);
        }

        // Handle resize
        const handleResize = () => {
            chart?.resize();
        };

        window.addEventListener('resize', handleResize);

        // Clean up
        return () => {
            chart?.dispose();
            window.removeEventListener('resize', handleResize);
        };
    }, [data, title, colors]);

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