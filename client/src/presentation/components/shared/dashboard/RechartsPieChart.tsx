/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
    ResponsiveContainer,
    PieChart as RPieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    Sector,
} from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/presentation/components/shared/ui/card";

export interface PieDatum {
    id: string;
    label: string;
    value: number;
}

export interface RechartsPieChartProps {
    title: string;
    data: PieDatum[];
    height?: number;
    colors?: string[];
    icon?: React.ReactNode;
    insights?: React.ReactNode;
    noCard?: boolean; // render bare chart (no Card wrapper)
    legendAsList?: boolean; // show legend as a right-side list with values
    valueFormatter?: (v: number) => string;
    layout?: "auto" | "square" | "wide"; // layout hint; square -> bottom legend and no slice labels
    minSlicePctToLabel?: number; // do not render labels under this percentage
    innerRadius?: number;
    outerRadius?: number;
    showLabels?: boolean; // force labels on/off regardless of layout
}

const defaultColors = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#14b8a6",
    "#eab308",
    "#f97316",
];

export const RechartsPieChart: React.FC<RechartsPieChartProps> = ({
    title,
    data,
    height = 300,
    colors = defaultColors,
    icon,
    insights,
    noCard = false,
    legendAsList = true,
    valueFormatter,
    layout = "auto",
    minSlicePctToLabel = 5,
    innerRadius,
    outerRadius,
    showLabels,
}) => {
    const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1;

    const vf = valueFormatter || ((v: number) => `${v}`);

    const isSquare = layout === "square";
    const iRadius = innerRadius ?? (isSquare ? 50 : 60);
    const oRadius = outerRadius ?? (isSquare ? 70 : 80);
    const labelsOn = typeof showLabels === "boolean" ? showLabels : !isSquare;

    // Custom label renderer to ensure black labels, with threshold
    const renderLabel = (props: any) => {
        const { cx, cy, midAngle, outerRadius, payload } = props;
        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 16;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        const name = payload?.label as string;
        const value = Number(payload?.value || 0);
        const pct = Math.round((value / total) * 100);
        if (pct < minSlicePctToLabel) return null;
        return (
            <text x={x} y={y} fill="#111827" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={12} fontWeight={600}>
                {`${name} (${pct}%)`}
            </text>
        );
    };

    // Custom legend that lists items with values on the right
    const renderLegend = (props: any) => {
        const { payload } = props || {};
        const items = (payload || []).map((p: any) => ({
            color: p.color,
            label: p.payload?.label,
            value: p.payload?.value,
        }));
        return (
            <div className="flex flex-col gap-1 ml-4 min-w-[140px]">
                {items.map((it: any) => {
                    const pct = Math.round(((Number(it.value) || 0) / total) * 100);
                    return (
                        <div key={it.label} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: it.color }} />
                                <span className="truncate">{it.label}</span>
                            </div>
                            <span className="ml-2 tabular-nums text-muted-foreground">{vf(Number(it.value))} ({pct}%)</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Bottom legend renderer (grid) for square layout
    const renderLegendBottom = (props: any) => {
        const { payload } = props || {};
        const items = (payload || []).map((p: any) => ({
            color: p.color,
            label: p.payload?.label,
            value: p.payload?.value,
        }));
        return (
            <div className="grid grid-cols-2 gap-2 px-2">
                {items.map((it: any) => {
                    const pct = Math.round(((Number(it.value) || 0) / total) * 100);
                    return (
                        <div key={it.label} className="flex items-center justify-between text-sm min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: it.color }} />
                                <span className="truncate">{it.label}</span>
                            </div>
                            <span className="ml-2 tabular-nums text-muted-foreground">{vf(Number(it.value))} ({pct}%)</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const showRightLegend = legendAsList && !isSquare;
    const ChartInner = (
        <ResponsiveContainer width="100%" height="100%">
            <RPieChart margin={{ right: showRightLegend ? 140 : 16, bottom: isSquare ? 56 : 16 }}>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={iRadius}
                    outerRadius={oRadius}
                    paddingAngle={2}
                    labelLine={labelsOn}
                    label={labelsOn ? renderLabel : false}
                >
                    {data.map((entry, idx) => (
                        <Cell key={entry.id} fill={colors[idx % colors.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(v: any, _n: any, p: any) => [vf(Number(v)), p?.payload?.label]} />
                {showRightLegend ? (
                    <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        content={renderLegend as any}
                    />
                ) : (
                    <Legend verticalAlign="bottom" height={isSquare ? 64 : 36} content={isSquare ? (renderLegendBottom as any) : undefined} />
                )}
            </RPieChart>
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

export default RechartsPieChart;
