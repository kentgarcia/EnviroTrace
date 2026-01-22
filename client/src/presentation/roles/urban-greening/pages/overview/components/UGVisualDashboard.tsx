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
    feeMonthly: Array<{ month: string; amount: number }>;
    plantingTypeData: Array<{ id: string; label: string; value: number }>;
    speciesData: Array<{ id: string; label: string; value: number }>;
    // Optional pre-aggregated data from dashboard API
    treeRequestTypeCounts?: Array<{ id: string; label: string; value: number }>;
    treeRequestStatusCounts?: Array<{ id: string; label: string; value: number }>;
    treeTypesBarPreset?: Array<{ id: string; label: string; value: number }>;
    ugMonthlyFromApi?: Array<{ month: number; label: string; total: number }>;
    saplingsMonthlyFromApi?: Array<{ month: number; label: string; total: number }>;
    // Fallback raw data (when not using the aggregated API)
    recentUg?: Array<any>;
    recentSaplings?: Array<any>;
    recentLoading?: boolean;
}

const UGVisualDashboard: React.FC<UGVisualDashboardProps> = ({
    feeMonthly,
    plantingTypeData,
    speciesData,
    // aggregated optional props
    treeRequestTypeCounts,
    treeRequestStatusCounts,
    treeTypesBarPreset,
    ugMonthlyFromApi,
    saplingsMonthlyFromApi,
    // fallbacks
    recentUg,
    recentSaplings,
    recentLoading,
}) => {
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
        const list = (treeReqs || []).filter((t: any) => t.request_date && new Date(t.request_date).getFullYear() === currentYear());
        const counts: Record<string, number> = {};
        for (const t of list) counts[t.request_type] = (counts[t.request_type] || 0) + 1;
        return Object.entries(counts).map(([id, value]) => ({ id, label: id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), value }));
    }, [treeReqs, treeRequestTypeCounts]);

    const treeStatusPieData = useMemo(() => {
        if (typeof treeRequestStatusCounts !== "undefined" && treeRequestStatusCounts) return treeRequestStatusCounts;
        const list = (treeReqs || []).filter((t: any) => t.request_date && new Date(t.request_date).getFullYear() === currentYear());
        const counts: Record<string, number> = {};
        for (const t of list) counts[t.status] = (counts[t.status] || 0) + 1;
        return Object.entries(counts).map(([id, value]) => ({ id, label: id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), value }));
    }, [treeReqs, treeRequestStatusCounts]);

    // Trees to be cut down/Prune - type of trees graph (best effort parsing trees_and_quantities[])
    const treeTypesBar = useMemo(() => {
        if (typeof treeTypesBarPreset !== "undefined" && treeTypesBarPreset) return treeTypesBarPreset;
        const list = (treeReqs || []).filter((t: any) => t.request_date && new Date(t.request_date).getFullYear() === currentYear());
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
    }, [treeReqs, treeTypesBarPreset]);

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
        if (ugMonthlyFromApi && ugMonthlyFromApi.length) {
            // Normalize to 12 months list directly from API
            return ugMonthlyFromApi.map((m) => ({
                key: `${currentYear()}-${String(m.month).padStart(2, "0")}`,
                label: m.label,
                total: Number(m.total || 0),
                lastDate: new Date(currentYear(), Math.max(0, m.month - 1), 1),
            }));
        }
        const map = new Map<string, { key: string; label: string; total: number; lastDate: Date }>();
        for (const p of recentUg || []) {
            const pd = (p as any)?.planting_date;
            if (!pd) continue;
            const d = new Date(pd);
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
        // Build full 12 months for current year, filling zeros where missing
        const year = currentYear();
        const full: { key: string; label: string; total: number; lastDate: Date }[] = [];
        for (let m = 0; m < 12; m++) {
            const d = new Date(year, m, 1);
            const key = monthKey(d);
            const label = monthLabel(d);
            const found = map.get(key);
            full.push(found ?? { key, label, total: 0, lastDate: d });
        }
        return full;
    }, [recentUg, ugMonthlyFromApi]);

    const saplingsMonthlyTable = useMemo(() => {
        if (saplingsMonthlyFromApi && saplingsMonthlyFromApi.length) {
            return saplingsMonthlyFromApi.map((m) => ({
                key: `${currentYear()}-${String(m.month).padStart(2, "0")}`,
                label: m.label,
                total: Number(m.total || 0),
                lastDate: new Date(currentYear(), Math.max(0, m.month - 1), 1),
            }));
        }
        const map = new Map<string, { key: string; label: string; total: number; lastDate: Date }>();
        for (const s of recentSaplings || []) {
            // Support both old SaplingCollection (collection_date) and new SaplingRequest (date_received)
            const cd = (s as any)?.collection_date || (s as any)?.date_received;
            if (!cd) continue;
            const d = new Date(cd);
            const key = monthKey(d);
            const label = monthLabel(d);
            // Support both old quantity_collected and new total_qty
            const qty = Number((s as any)?.quantity_collected || (s as any)?.total_qty || 0);
            const prev = map.get(key);
            if (prev) {
                prev.total += qty;
                if (d > prev.lastDate) prev.lastDate = d;
            } else {
                map.set(key, { key, label, total: qty, lastDate: d });
            }
        }
        // Build full 12 months for current year, filling zeros where missing
        const year = currentYear();
        const full: { key: string; label: string; total: number; lastDate: Date }[] = [];
        for (let m = 0; m < 12; m++) {
            const d = new Date(year, m, 1);
            const key = monthKey(d);
            const label = monthLabel(d);
            const found = map.get(key);
            full.push(found ?? { key, label, total: 0, lastDate: d });
        }
        return full;
    }, [recentSaplings, saplingsMonthlyFromApi]);

    // Sorting state for Recent Activity tables
    const [ugSortBy, setUgSortBy] = useState<"month" | "count">("month");
    const [ugDir, setUgDir] = useState<"asc" | "desc">("desc");
    const [saplingsSortBy, setSaplingsSortBy] = useState<"month" | "count">("month");
    const [saplingsDir, setSaplingsDir] = useState<"asc" | "desc">("desc");

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

    const sortedSaplingsMonthly = useMemo(() => {
        const arr = saplingsMonthlyTable.slice();
        arr.sort((a, b) => {
            if (saplingsSortBy === "month") {
                return saplingsDir === "asc" ? a.key.localeCompare(b.key) : b.key.localeCompare(a.key);
            }
            return saplingsDir === "asc" ? a.total - b.total : b.total - a.total;
        });
        return arr;
    }, [saplingsMonthlyTable, saplingsSortBy, saplingsDir]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">

            {/* Monthly Collected Fees: Area chart (left) + Table (right) */}
            <Card className="col-span-1 md:col-span-2 xl:col-span-2 2xl:col-span-2 overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <CardTitle className="text-base font-medium truncate">Monthly Collected Fees {currentYear()}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div className="h-[280px]">
                            <RechartsAreaChart
                                title=""
                                data={feesMonthly}
                                height={280}
                                color="#f59e0b"
                                categoryFormatter={toShortMonth}
                                noCard
                            />
                        </div>
                        <div className="overflow-x-auto">
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
                </CardContent>
            </Card>

            {/* Recent Activity (Monthly) with sorting */}
            <div className="col-span-1 md:col-span-1 xl:col-span-1 2xl:col-span-1">
                <Tabs defaultValue="ug">
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">Recent Activity (Monthly)</CardTitle>
                                <TabsList>
                                    <TabsTrigger value="ug">Urban Greening</TabsTrigger>
                                    <TabsTrigger value="saplings">Plant Saplings</TabsTrigger>
                                </TabsList>
                            </div>
                        </CardHeader>
                        <CardContent className="p-2">
                            <TabsContent value="ug">
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
                            </TabsContent>
                            <TabsContent value="saplings">
                                {recentLoading ? (
                                    <div className="h-24 bg-gray-100 rounded animate-pulse" />
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead
                                                    className="text-xs cursor-pointer"
                                                    onClick={() => {
                                                        if (saplingsSortBy === "month") setSaplingsDir((d) => (d === "asc" ? "desc" : "asc"));
                                                        else { setSaplingsSortBy("month"); setSaplingsDir("asc"); }
                                                    }}
                                                >
                                                    Month
                                                </TableHead>
                                                <TableHead
                                                    className="text-xs text-right cursor-pointer"
                                                    onClick={() => {
                                                        if (saplingsSortBy === "count") setSaplingsDir((d) => (d === "asc" ? "desc" : "asc"));
                                                        else { setSaplingsSortBy("count"); setSaplingsDir("asc"); }
                                                    }}
                                                >
                                                    Total Saplings
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sortedSaplingsMonthly.map((row) => (
                                                <TableRow key={row.key}>
                                                    <TableCell className="text-xs py-1">{row.label}</TableCell>
                                                    <TableCell className="text-xs py-1 text-right font-medium">{row.total}</TableCell>
                                                </TableRow>
                                            ))}
                                            {sortedSaplingsMonthly.length === 0 && (
                                                <TableRow>
                                                    <TableCell className="text-xs py-2 text-gray-500" colSpan={2}>No recent records</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </TabsContent>
                        </CardContent>
                    </Card>
                </Tabs>
            </div>

            <RechartsPieChart
                title={`Urban Greening Breakdown ${currentYear()}`}
                data={plantingTypeData}
                height={300}
                layout="square"
                legendAsList={true}
                showLabels={true}
                minSlicePctToLabel={7}
            />

            <div className="col-span-1 md:col-span-2 xl:col-span-2 2xl:col-span-2">
                <Tabs defaultValue="type">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <h3 className="text-base font-medium truncate">Tree Requests & Clearance Status {currentYear()}</h3>
                        </div>
                        <TabsList>
                            <TabsTrigger value="type">Requests by Type</TabsTrigger>
                            <TabsTrigger value="status">Clearance Status</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="type">
                        <RechartsPieChart
                            title="Requests by Type"
                            data={treeTypePieData}
                            height={320}
                            legendAsList
                            showLabels
                        />
                    </TabsContent>
                    <TabsContent value="status">
                        <RechartsPieChart
                            title="Clearance Status"
                            data={treeStatusPieData}
                            height={320}
                            legendAsList
                            showLabels
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Flora Data and Trees to Cut/Prune combined via tabs */}
            <div className="col-span-1 md:col-span-2 xl:col-span-2 2xl:col-span-2">
                <Tabs defaultValue="flora">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-muted-foreground h-4 w-4"><BarChart3 /></span>
                            <h3 className="text-base font-medium truncate">Flora vs Trees to Cut/Prune</h3>
                        </div>
                        <TabsList>
                            <TabsTrigger value="flora">Flora</TabsTrigger>
                            <TabsTrigger value="trees">Trees</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="flora">
                        <RechartsBarChart
                            title="Flora Data (Urban Greening)"
                            data={speciesData.slice(0, 12)}
                            height={300}
                            color={["#22c55e", "#4f46e5", "#f59e42", "#eab308", "#a3e635", "#818cf8"]}
                            insights={makeInsights(speciesData.slice(0, 12) as any)}
                        />
                    </TabsContent>
                    <TabsContent value="trees">
                        <RechartsBarChart
                            title="Trees to be Cut Down / Pruned (by Type)"
                            data={treeTypesBar}
                            height={300}
                            color={["#ef4444"]}
                            insights={makeInsights(treeTypesBar)}
                        />
                    </TabsContent>
                </Tabs>
            </div>


        </div>
    );
};

export default UGVisualDashboard;
