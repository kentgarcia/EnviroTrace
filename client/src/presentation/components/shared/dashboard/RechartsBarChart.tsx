/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
    ResponsiveContainer,
    BarChart as RBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    LabelList,
} from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/presentation/components/shared/ui/card";

export interface BarChartData {
    id: string;
    label: string;
    value: number;
    [key: string]: any;
}

export interface RechartsBarChartProps {
    title: string;
    data: BarChartData[];
    height?: number;
    layout?: "vertical" | "horizontal"; // vertical: category on X; horizontal: category on Y
    color?: string | string[];
    valueFormatter?: (value: number) => string;
    categoryFormatter?: (category: string) => string;
    icon?: React.ReactNode;
    insights?: React.ReactNode;
}

const defaultFormatter = (v: number) => v.toString();
const defaultCat = (c: string) => c;

export const RechartsBarChart: React.FC<RechartsBarChartProps> = ({
    title,
    data,
    height = 300,
    layout = "vertical",
    color = "#4f46e5",
    valueFormatter = defaultFormatter,
    categoryFormatter = defaultCat,
    icon,
    insights,
}) => {
    const isHorizontal = layout === "horizontal";
    const palette = Array.isArray(color) ? color : [color];

    const truncate = (value: string) =>
        value.length > 18 ? value.substring(0, 16) + "..." : value;

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
                    <RBarChart
                        data={[...data].sort((a, b) => b.value - a.value)}
                        layout={isHorizontal ? "vertical" : "horizontal"}
                        margin={{ top: 16, right: 16, bottom: 24, left: 16 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        {isHorizontal ? (
                            <XAxis type="number" tickFormatter={valueFormatter as any} />
                        ) : (
                            <XAxis
                                dataKey="label"
                                type="category"
                                tickFormatter={(v) => truncate(categoryFormatter(String(v)))}
                                interval={0}
                                angle={0}
                                dx={0}
                                dy={8}
                            />
                        )}
                        {isHorizontal ? (
                            <YAxis
                                dataKey="label"
                                type="category"
                                tickFormatter={(v) => truncate(categoryFormatter(String(v)))}
                                width={120}
                            />
                        ) : (
                            <YAxis type="number" tickFormatter={valueFormatter as any} />
                        )}
                        <Tooltip
                            cursor={{ fill: "rgba(0,0,0,0.04)" }}
                            formatter={(v: any) => valueFormatter(Number(v))}
                            labelFormatter={(l) => categoryFormatter(String(l))}
                        />
                        <Bar dataKey="value" barSize={isHorizontal ? 24 : 20} radius={[4, 4, 0, 0]}>
                            {data
                                .slice()
                                .sort((a, b) => b.value - a.value)
                                .map((entry, index) => (
                                    <Cell
                                        key={`cell-${entry.id}`}
                                        fill={palette[index % palette.length]}
                                    />
                                ))}
                            <LabelList
                                dataKey="value"
                                position={isHorizontal ? "right" : "top"}
                                formatter={(v: any) => valueFormatter(Number(v))}
                                style={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 600 }}
                            />
                        </Bar>
                    </RBarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default RechartsBarChart;
