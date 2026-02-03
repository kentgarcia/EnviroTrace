import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RechartsBarChart } from "@/presentation/components/shared/dashboard/RechartsBarChart";
import { RechartsPieChart } from "@/presentation/components/shared/dashboard/RechartsPieChart";
import { RechartsAreaChart } from "@/presentation/components/shared/dashboard/RechartsAreaChart";
import { BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/presentation/components/shared/ui/tabs";
import { fetchTreeManagementRequests } from "@/core/api/tree-management-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/presentation/components/shared/ui/table";

const monthLabelsShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];
const monthLabelsLong = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

function currentYear() {
    return new Date().getFullYear();
}

//

export interface UGVisualDashboardProps {
    selectedYear: number;
    selectedQuarter: string;
    feeMonthly: Array<{ month: string; amount: number }>;
    plantingTypeData: Array<{ id: string; label: string; value: number }>;
    speciesData: Array<{ id: string; label: string; value: number }>;
    // Optional pre-aggregated data from dashboard API
    treeRequestTypeCounts?: Array<{ id: string; label: string; value: number }>;
    treeRequestStatusCounts?: Array<{ id: string; label: string; value: number }>;
    treeTypesBarPreset?: Array<{ id: string; label: string; value: number }>;
    ugMonthlyFromApi?: Array<{ month: number; label: string; total: number }>;
    // Fallback raw data (when not using the aggregated API)
    recentUg?: Array<any>;
    recentLoading?: boolean;
}

const UGVisualDashboard: React.FC<UGVisualDashboardProps> = ({
    selectedYear,
    selectedQuarter,
    feeMonthly,
    plantingTypeData,
    speciesData,
    // aggregated optional props
    treeRequestTypeCounts,
    treeRequestStatusCounts,
    treeTypesBarPreset,
    ugMonthlyFromApi,
    // fallbacks
    recentUg,
    recentLoading,
}) => {
    // Helper to get quarter months
    const getQuarterMonths = (quarter: string): number[] => {
        switch (quarter) {
            case "Q1": return [0, 1, 2]; // Jan-Mar
            case "Q2": return [3, 4, 5]; // Apr-Jun
            case "Q3": return [6, 7, 8]; // Jul-Sep
            case "Q4": return [9, 10, 11]; // Oct-Dec
            default: return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // All
        }
    };
    // Queries
    const shouldFetchTreeReqs = !(treeRequestTypeCounts || treeRequestStatusCounts || treeTypesBarPreset);
    const { data: treeReqs } = useQuery({
        queryKey: ["viz-tree-requests"],
        queryFn: fetchTreeManagementRequests,
        staleTime: 5 * 60 * 1000,
        enabled: shouldFetchTreeReqs,
    });

    // Helper to render shorter month labels on the fees chart
    const toShortMonth = (label: string) => {
        const idx = monthLabelsLong.indexOf(label);
        return idx >= 0 ? monthLabelsShort[idx] : label.slice(0, 3);
    };


    // Fees monthly from provided data
    const feesMonthly = useMemo(() => {
        const byMonth: Record<string, number> = {};
        for (const m of feeMonthly || []) byMonth[m.month] = m.amount;
        return Array.from({ length: 12 }, (_, i) => {
            const short = monthLabelsShort[i];
            const long = monthLabelsLong[i];
            return { id: short, label: long, value: byMonth[short] || 0 };
        });
    }, [feeMonthly]);

    // Re-implement tree pies using either provided aggregates or client-side fallback
    const treeTypePieData = useMemo(() => {
        if (typeof treeRequestTypeCounts !== "undefined" && treeRequestTypeCounts) return treeRequestTypeCounts;
        const quarterMonths = getQuarterMonths(selectedQuarter);
        const list = (treeReqs || []).filter((t: any) => {
            if (!t.request_date) return false;
            const d = new Date(t.request_date);
            const year = d.getFullYear();
            const month = d.getMonth();
            return year === selectedYear && quarterMonths.includes(month);
        });
        const counts: Record<string, number> = {};
        for (const t of list) counts[t.request_type] = (counts[t.request_type] || 0) + 1;
        return Object.entries(counts).map(([id, value]) => ({ id, label: id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), value }));
    }, [treeReqs, treeRequestTypeCounts, selectedYear, selectedQuarter]);

    const treeStatusPieData = useMemo(() => {
        if (typeof treeRequestStatusCounts !== "undefined" && treeRequestStatusCounts) return treeRequestStatusCounts;
        const quarterMonths = getQuarterMonths(selectedQuarter);
        const list = (treeReqs || []).filter((t: any) => {
            if (!t.request_date) return false;
            const d = new Date(t.request_date);
            const year = d.getFullYear();
            const month = d.getMonth();
            return year === selectedYear && quarterMonths.includes(month);
        });
        const counts: Record<string, number> = {};
        for (const t of list) counts[t.status] = (counts[t.status] || 0) + 1;
        return Object.entries(counts).map(([id, value]) => ({ id, label: id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), value }));
    }, [treeReqs, treeRequestStatusCounts, selectedYear, selectedQuarter]);

    // Trees to be cut down/Prune - type of trees graph (best effort parsing trees_and_quantities[])
    const treeTypesBar = useMemo(() => {
        if (typeof treeTypesBarPreset !== "undefined" && treeTypesBarPreset) return treeTypesBarPreset;
        const quarterMonths = getQuarterMonths(selectedQuarter);
        const list = (treeReqs || []).filter((t: any) => {
            if (!t.request_date) return false;
            const d = new Date(t.request_date);
            const year = d.getFullYear();
            const month = d.getMonth();
            return year === selectedYear && quarterMonths.includes(month);
        });
        const counts: Record<string, number> = {};
        for (const t of list) {
            const arr: any[] = t.trees_and_quantities || [];
            for (const raw of arr) {
                const s = String(raw);
                // Try patterns like "Narrah:3", "Acacia - 2", or "Acacia (2)"
                const match = s.match(/([A-Za-z\s]+)[^0-9]*([0-9]+)/);
                if (match) {
                    const name = match[1].trim();
                    const qty = Number(match[2] || 1);
                    counts[name] = (counts[name] || 0) + (qty || 1);
                } else {
                    const name = s.trim();
                    counts[name] = (counts[name] || 0) + 1;
                }
            }
        }
        const entries = Object.entries(counts).map(([label, value]) => ({ id: label, label, value }));
        // Top 10
        entries.sort((a, b) => b.value - a.value);
        return entries.slice(0, 10);
    }, [treeReqs, treeTypesBarPreset, selectedYear, selectedQuarter]);

    // Helpers for insights (Total and Peak)
    const makeInsights = (data: Array<{ label: string; value: number }>) => {
        const total = data.reduce((s, d) => s + (d.value || 0), 0);
        const peak = data.reduce((max, d) => (d.value > max.value ? d : max), { label: "-", value: 0 });
        return `Total: ${total} • Peak: ${peak.label} (${peak.value})`;
    };

    // Recent activity monthly aggregation (inline, replaces separate component)
    // Use full month name only in Recent Activity labels (no year shown)
    const monthLabel = (d: Date) => d.toLocaleString(undefined, { month: "long" });
    const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const ugMonthlyTable = useMemo(() => {
        const quarterMonths = getQuarterMonths(selectedQuarter);
        if (ugMonthlyFromApi && ugMonthlyFromApi.length) {
            return ugMonthlyFromApi
                .filter(m => quarterMonths.includes(m.month - 1))
                .map((m) => ({
                    key: `${selectedYear}-${String(m.month).padStart(2, "0")}`,
                    label: m.label,
                    total: Number(m.total || 0),
                    lastDate: new Date(selectedYear, Math.max(0, m.month - 1), 1),
                }));
        }
        const map = new Map<string, { key: string; label: string; total: number; lastDate: Date }>();
        for (const p of recentUg || []) {
            const pd = (p as any)?.planting_date;
            if (!pd) continue;
            const d = new Date(pd);
            if (d.getFullYear() !== selectedYear || !quarterMonths.includes(d.getMonth())) continue;
            const key = monthKey(d);
            const label = monthLabel(d);
            const qty = Number((p as any)?.quantity_planted || 0);
            const prev = map.get(key);
            if (prev) {
                prev.total += qty;
                if (d > prev.lastDate) prev.lastDate = d;
            } else {
                map.set(key, { key, label, total: qty, lastDate: d });
            }
        }
        // Build months for selected quarter
        const full: { key: string; label: string; total: number; lastDate: Date }[] = [];
        for (const m of quarterMonths) {
            const d = new Date(selectedYear, m, 1);
            const key = monthKey(d);
            const label = monthLabel(d);
            const found = map.get(key);
            full.push(found ?? { key, label, total: 0, lastDate: d });
        }
        return full;
    }, [recentUg, ugMonthlyFromApi, selectedYear, selectedQuarter]);



    // Sorting state for Recent Activity tables
    const [ugSortBy, setUgSortBy] = useState<"month" | "count">("month");
    const [ugDir, setUgDir] = useState<"asc" | "desc">("desc");

    const sortedUgMonthly = useMemo(() => {
        const arr = ugMonthlyTable.slice();
        arr.sort((a, b) => {
            if (ugSortBy === "month") {
                return ugDir === "asc" ? a.key.localeCompare(b.key) : b.key.localeCompare(a.key);
            }
            return ugDir === "asc" ? a.total - b.total : b.total - a.total;
        });
        return arr;
    }, [ugMonthlyTable, ugSortBy, ugDir]);



    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">

            {/* Monthly Collected Fees: Area chart (left) + Table (right) */}
            <Card className="col-span-1 md:col-span-2 xl:col-span-2 2xl:col-span-2 overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <CardTitle className="text-base font-medium truncate">Monthly Collected Fees {selectedYear}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    {recentLoading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="h-[280px] bg-gray-100 rounded animate-pulse" />
                            <div className="h-[280px] bg-gray-100 rounded animate-pulse" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                            <div className="h-[280px] min-w-0">
                                <RechartsAreaChart
                                    title=""
                                    data={feesMonthly}
                                    height={280}
                                    color="#f59e0b"
                                    categoryFormatter={toShortMonth}
                                    noCard
                                />
                            </div>
                            <div className="overflow-x-auto min-w-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs">Month</TableHead>
                                            <TableHead className="text-xs text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {feesMonthly.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell className="text-xs py-1">{row.label}</TableCell>
                                                <TableCell className="text-xs py-1 text-right tabular-nums">{row.value}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Monthly Urban Greening Activity */}
            <Card className="col-span-1">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Monthly Urban Greening</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                    {recentLoading ? (
                        <div className="h-24 bg-gray-100 rounded animate-pulse" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead
                                        className="text-xs cursor-pointer"
                                        onClick={() => {
                                            if (ugSortBy === "month") setUgDir((d) => (d === "asc" ? "desc" : "asc"));
                                            else { setUgSortBy("month"); setUgDir("asc"); }
                                        }}
                                    >
                                        Month
                                    </TableHead>
                                    <TableHead
                                        className="text-xs text-right cursor-pointer"
                                        onClick={() => {
                                            if (ugSortBy === "count") setUgDir((d) => (d === "asc" ? "desc" : "asc"));
                                            else { setUgSortBy("count"); setUgDir("asc"); }
                                        }}
                                    >
                                        Total Planted
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedUgMonthly.map((row) => (
                                    <TableRow key={row.key}>
                                        <TableCell className="text-xs py-1">{row.label}</TableCell>
                                        <TableCell className="text-xs py-1 text-right font-medium">{row.total}</TableCell>
                                    </TableRow>
                                ))}
                                {sortedUgMonthly.length === 0 && (
                                    <TableRow>
                                        <TableCell className="text-xs py-2 text-gray-500" colSpan={2}>No recent records</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Urban Greening Projects Plant Distribution */}
            <Card className="col-span-1">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">UG Projects Plant Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    {recentLoading ? (
                        <div className="h-[280px] bg-gray-100 rounded animate-pulse" />
                    ) : (
                        <div className="h-[280px]">
                            <RechartsPieChart
                                title=""
                                data={plantingTypeData}
                                height={280}
                                showLabels
                                noCard
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="col-span-1 md:col-span-2 xl:col-span-2 2xl:col-span-2">
                <Tabs defaultValue="type">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <h3 className="text-base font-medium truncate">Tree Requests & Clearance Status {selectedYear}</h3>
                        </div>
                        <TabsList>
                            <TabsTrigger value="type">Requests by Type</TabsTrigger>
                            <TabsTrigger value="status">Clearance Status</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="type">
                        {recentLoading ? (
                            <div className="h-[320px] bg-gray-100 rounded animate-pulse" />
                        ) : (
                            <RechartsPieChart
                                title="Requests by Type"
                                data={treeTypePieData}
                                height={320}
                                legendAsList
                                showLabels
                            />
                        )}
                    </TabsContent>
                    <TabsContent value="status">
                        {recentLoading ? (
                            <div className="h-[320px] bg-gray-100 rounded animate-pulse" />
                        ) : (
                            <RechartsPieChart
                                title="Clearance Status"
                                data={treeStatusPieData}
                                height={320}
                                legendAsList
                                showLabels
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Flora Data - Urban Greening Only */}
            <Card className="col-span-1 md:col-span-2 xl:col-span-2 2xl:col-span-2">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <CardTitle className="text-base font-medium truncate">Flora Data (Urban Greening) {selectedYear}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    {recentLoading ? (
                        <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
                    ) : (
                        <RechartsBarChart
                            title=""
                            data={speciesData.slice(0, 12)}
                            height={300}
                            color={["#22c55e", "#4f46e5", "#f59e42", "#eab308", "#a3e635", "#818cf8"]}
                            insights={makeInsights(speciesData.slice(0, 12) as any)}
                            noCard
                        />
                    )}
                </CardContent>
            </Card>


        </div>
    );
};

export default UGVisualDashboard;
