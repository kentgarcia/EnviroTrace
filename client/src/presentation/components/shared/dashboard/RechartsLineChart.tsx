/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
    ResponsiveContainer,
    LineChart as RLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    LabelList,
} from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/presentation/components/shared/ui/card";

export interface LineChartData {
    id: string;
    label: string;
    value: number;
    [key: string]: any;
}

export interface RechartsLineChartProps {
    title: string;
    data: LineChartData[];
    height?: number;
    color?: string;
    valueFormatter?: (value: number) => string;
    categoryFormatter?: (category: string) => string;
    showDots?: boolean;
    icon?: React.ReactNode;
    insights?: React.ReactNode;
}

const defaultFormatter = (v: number) => v.toString();
const defaultCat = (c: string) => c;

export const RechartsLineChart: React.FC<RechartsLineChartProps> = ({
    title,
    data,
    height = 300,
    color = "#0ea5e9",
    valueFormatter = defaultFormatter,
    categoryFormatter = defaultCat,
    showDots = true,
    icon,
    insights,
}) => {
    const truncate = (value: string) =>
        value.length > 15 ? value.substring(0, 12) + "..." : value;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2 min-w-0">
                    {icon && <span className="text-muted-foreground h-4 w-4">{icon}</span>}
                    <CardTitle className="text-base font-medium truncate">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent style={{ height }}>
                {insights && (
                    <div className="text-xs text-muted-foreground mb-2">{insights}</div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                    <RLineChart data={data} margin={{ top: 16, right: 16, bottom: 24, left: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="label"
                            tickFormatter={(v) => truncate(categoryFormatter(String(v)))}
                            interval={0}
                            angle={0}
                            dx={0}
                            dy={8}
                        />
                        <YAxis tickFormatter={valueFormatter as any} />
                        <Tooltip
                            cursor={{ stroke: "rgba(0,0,0,0.2)", strokeWidth: 1 }}
                            formatter={(v: any) => valueFormatter(Number(v))}
                            labelFormatter={(l) => categoryFormatter(String(l))}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            dot={showDots}
                            activeDot={{ r: 5 }}
                        >
                            <LabelList
                                dataKey="value"
                                position="top"
                                formatter={(v: any) => valueFormatter(Number(v))}
                                style={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 600 }}
                            />
                        </Line>
                    </RLineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default RechartsLineChart;
