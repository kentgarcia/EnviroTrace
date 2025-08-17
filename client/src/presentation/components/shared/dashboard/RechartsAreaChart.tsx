/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
    ResponsiveContainer,
    AreaChart as RAreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/presentation/components/shared/ui/card";

export interface AreaChartData {
    id: string;
    label: string;
    value: number;
    [key: string]: any;
}

export interface RechartsAreaChartProps {
    title: string;
    data: AreaChartData[];
    height?: number;
    color?: string;
    gradientId?: string; // optional custom gradient id
    valueFormatter?: (value: number) => string;
    categoryFormatter?: (category: string) => string;
    icon?: React.ReactNode;
    insights?: React.ReactNode;
    noCard?: boolean;
}

const defaultFormatter = (v: number) => v.toString();
const defaultCat = (c: string) => c;

export const RechartsAreaChart: React.FC<RechartsAreaChartProps> = ({
    title,
    data,
    height = 300,
    color = "#22c55e",
    gradientId,
    valueFormatter = defaultFormatter,
    categoryFormatter = defaultCat,
    icon,
    insights,
    noCard = false,
}) => {
    const truncate = (value: string) =>
        value.length > 15 ? value.substring(0, 12) + "..." : value;

    const gid = gradientId || `grad-${Math.random().toString(36).slice(2, 9)}`;

    const ChartInner = (
        <ResponsiveContainer width="100%" height="100%">
            <RAreaChart data={data} margin={{ top: 16, right: 16, bottom: 24, left: 16 }}>
                <defs>
                    <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                    </linearGradient>
                </defs>
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
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    fillOpacity={1}
                    fill={`url(#${gid})`}
                />
            </RAreaChart>
        </ResponsiveContainer>
    );

    if (noCard) {
        return <div style={{ height }}>{ChartInner}</div>;
    }

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
                {ChartInner}
            </CardContent>
        </Card>
    );
};

export default RechartsAreaChart;
