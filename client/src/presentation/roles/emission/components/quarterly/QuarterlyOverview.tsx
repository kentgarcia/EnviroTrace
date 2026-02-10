import React, { useMemo } from "react";
import {
    Car,
    Target,
    CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Progress } from "@/presentation/components/shared/ui/progress";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { StatCard } from "@/presentation/components/shared/StatCard";
import { EChartsPieChart } from "@/presentation/components/shared/dashboard/EChartsPieChart";
import { EChartsBarChart } from "@/presentation/components/shared/dashboard/EChartsBarChart";
import { cn } from "@/core/utils/utils";
import { EmissionTest } from "@/core/api/emission-service";

type QuarterKey = "Q1" | "Q2" | "Q3" | "Q4";

interface QuarterAggregate {
    tested: number;
    passed: number;
    failed: number;
}

interface SummaryStats {
    totalVehicles: number;
    totalTested: number;
    totalPassed: number;
    totalFailed: number;
    totalUntested: number;
    byQuarter: Record<QuarterKey, QuarterAggregate>;
}

interface VehicleWithTests {
    tests: Record<QuarterKey, EmissionTest | null>;
}

interface OfficeGroup {
    office_id: string;
    office_name: string;
    vehicles: VehicleWithTests[];
}

interface QuarterlyOverviewProps {
    stats: SummaryStats;
    selectedYear: number;
    selectedQuarter: string;
    officeGroups: OfficeGroup[];
    selectedOffices: string[];
}

interface QuarterPerformance {
    key: QuarterKey;
    label: string;
    tested: number;
    passed: number;
    failed: number;
    pending: number;
    completionRate: number;
    passRate: number;
}

interface OfficePerformance {
    id: string;
    name: string;
    vehicleCount: number;
    expectedTests: number;
    completedTests: number;
    pendingTests: number;
    completionRate: number;
    passRate: number;
    passCount: number;
    failCount: number;
}

const quarterKeys: QuarterKey[] = ["Q1", "Q2", "Q3", "Q4"];

const formatPercent = (value: number) =>
    Number.isFinite(value) ? `${value.toFixed(1)}%` : "0.0%";

const formatNumber = (value: number) => value.toLocaleString();

export const QuarterlyOverview: React.FC<QuarterlyOverviewProps> = ({
    stats,
    selectedYear,
    selectedQuarter,
    officeGroups,
    selectedOffices,
}) => {
    const safeQuarter = selectedQuarter || "all";
    const overview = useMemo(() => {
        const activeQuarters = safeQuarter === "all" ? quarterKeys : [safeQuarter as QuarterKey];
        const totalVehicles = officeGroups.reduce(
            (total, office) => total + office.vehicles.length,
            0
        );
        const expectedTests = totalVehicles * activeQuarters.length;

        const quarterTotals = quarterKeys.reduce(
            (acc, quarter) => {
                acc[quarter] = { tested: 0, passed: 0, failed: 0 };
                return acc;
            },
            {} as Record<QuarterKey, QuarterAggregate>
        );

        let totalTests = 0;
        let passCount = 0;
        let failCount = 0;

        const officeBreakdown: OfficePerformance[] = officeGroups.map((office) => {
            const vehicleCount = office.vehicles.length;
            const expected = vehicleCount * quarterKeys.length;

            let completed = 0;
            let officePass = 0;
            let officeFail = 0;

            office.vehicles.forEach((vehicle) => {
                quarterKeys.forEach((quarterKey) => {
                    if (!activeQuarters.includes(quarterKey)) {
                        return;
                    }

                    const test = vehicle.tests?.[quarterKey] ?? null;
                    if (!test) {
                        return;
                    }

                    totalTests += 1;
                    completed += 1;
                    quarterTotals[quarterKey].tested += 1;

                    if (test.result) {
                        passCount += 1;
                        officePass += 1;
                        quarterTotals[quarterKey].passed += 1;
                    } else {
                        failCount += 1;
                        officeFail += 1;
                        quarterTotals[quarterKey].failed += 1;
                    }
                });
            });

            const pending = Math.max(expected - completed, 0);
            const completionRate = expected > 0 ? (completed / expected) * 100 : 0;
            const passRate = completed > 0 ? (officePass / completed) * 100 : 0;

            return {
                id: office.office_id,
                name: office.office_name,
                vehicleCount,
                expectedTests: expected,
                completedTests: completed,
                pendingTests: pending,
                completionRate,
                passRate,
                passCount: officePass,
                failCount: officeFail,
            };
        });

        const completionRate = expectedTests > 0 ? (totalTests / expectedTests) * 100 : 0;
        const passRate = totalTests > 0 ? (passCount / totalTests) * 100 : 0;

        const quarterList: QuarterPerformance[] = quarterKeys.map((key) => {
            const q = quarterTotals[key];
            const qExpected = totalVehicles;
            const qPending = Math.max(qExpected - q.tested, 0);
            return {
                key,
                label: key === "Q1" ? "1st Quarter" : key === "Q2" ? "2nd Quarter" : key === "Q3" ? "3rd Quarter" : "4th Quarter",
                tested: q.tested,
                passed: q.passed,
                failed: q.failed,
                pending: qPending,
                completionRate: qExpected > 0 ? (q.tested / qExpected) * 100 : 0,
                passRate: q.tested > 0 ? (q.passed / q.tested) * 100 : 0,
            };
        });

        return {
            totalVehicles,
            expectedTests,
            totalTests,
            passCount,
            failCount,
            pendingCount: Math.max(expectedTests - totalTests, 0),
            completionRate,
            passRate,
            quarterList,
            officeBreakdown: officeBreakdown.sort((a, b) => b.completionRate - a.completionRate),
        };
    }, [officeGroups, safeQuarter]);

    const selectedOfficeLabel = useMemo(() => {
        if (selectedOffices.includes("all") || selectedOffices.length === 0) {
            return "All Offices";
        }
        if (selectedOffices.length === 1) {
            return officeGroups.find((o) => o.office_id === selectedOffices[0])?.office_name || "Selected Office";
        }
        return `${selectedOffices.length} Offices Selected`;
    }, [selectedOffices, officeGroups]);

    const pieData = [
        { id: "passed", label: "Passed", value: overview.passCount },
        { id: "failed", label: "Failed", value: overview.failCount },
        { id: "pending", label: "Pending", value: overview.pendingCount },
    ];

    const barData = overview.officeBreakdown.map(o => ({
        id: o.id,
        label: o.name,
        value: o.completionRate
    }));

    const barChartHeight = Math.max(350, barData.length * 32);

    return (
        <div className="space-y-8">
            {/* Top Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    label={safeQuarter === "all" ? "Annual Completion" : `${safeQuarter} Completion`} 
                    value={formatPercent(overview.completionRate)} 
                    Icon={Target}
                    colors={{
                        circleFill: "#0033a0",
                        labelBg: "#0033a0",
                        valueText: "#0033a0"
                    }}
                />
                <StatCard 
                    label={safeQuarter === "all" ? "Pass Rate" : `${safeQuarter} Pass Rate`} 
                    value={formatPercent(overview.passRate)} 
                    Icon={CheckCircle}
                    colors={{
                        circleFill: "#0033a0",
                        labelBg: "#0033a0",
                        valueText: "#0033a0"
                    }}
                />
                <StatCard 
                    label="Vehicles in Scope" 
                    value={formatNumber(overview.totalVehicles)} 
                    Icon={Car}
                    colors={{
                        circleFill: "#0033a0",
                        labelBg: "#0033a0",
                        valueText: "#0033a0"
                    }}
                />
                <StatCard 
                    label="Pending Tests" 
                    value={formatNumber(overview.pendingCount)} 
                    Icon={Target}
                    colors={{
                        circleFill: "#0033a0",
                        labelBg: "#0033a0",
                        valueText: "#0033a0",
                    }}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 sticky top-24">
                    <EChartsPieChart 
                        title={`Test Results ${safeQuarter === "all" ? "(All Quarters)" : `(${safeQuarter})`}`} 
                        data={pieData} 
                        colors={["#10b981", "#ee1c25", "#e2e8f0"]}
                        height={350}
                    />
                </div>
                <div className="lg:col-span-2">
                    <Card className="border-none shadow-sm bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
                        <CardHeader className="pb-0">
                            <CardTitle className="text-lg font-bold text-slate-900 dark:text-gray-100">
                                Office Completion Rates {safeQuarter === "all" ? "(All Quarters)" : `(${safeQuarter})`}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className={cn(
                                "w-full",
                                barData.length > 15 ? "max-h-[600px] overflow-y-auto" : ""
                            )}>
                                <EChartsBarChart 
                                    title="" 
                                    data={barData} 
                                    layout="horizontal"
                                    color="#0033a0"
                                    height={barChartHeight}
                                    valueFormatter={(v) => `${v.toFixed(1)}%`}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Quarterly Progress Section */}
            <div className="grid grid-cols-1 gap-8">
                <Card className="border-none shadow-sm bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-gray-100">Quarterly Performance</CardTitle>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Breakdown of testing progress by quarter</p>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                            {(safeQuarter === "all"
                                ? overview.quarterList
                                : overview.quarterList.filter((q) => q.key === safeQuarter)
                            ).map((q) => (
                                <div key={q.key} className="space-y-4 p-4 rounded-xl bg-slate-50/50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center border border-slate-200 dark:border-gray-700 shadow-sm">
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{q.key}</span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-800 dark:text-gray-200">{q.label}</div>
                                                <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                                                    {formatNumber(q.tested)} tested
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-slate-900 dark:text-gray-100">{formatPercent(q.completionRate)}</div>
                                            <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Done</div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="relative h-2 w-full bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                                            <div 
                                                className="h-full bg-[#10b981] transition-all duration-500" 
                                                style={{ width: `${(q.passed / overview.totalVehicles) * 100}%` }}
                                            />
                                            <div 
                                                className="h-full bg-[#ee1c25] transition-all duration-500" 
                                                style={{ width: `${(q.failed / overview.totalVehicles) * 100}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter">
                                            <div className="flex items-center gap-2 text-[#10b981]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                                                <span>{q.passed} Pass</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[#ee1c25]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#ee1c25]" />
                                                <span>{q.failed} Fail</span>
                                            </div>
                                            <div className="text-slate-400 dark:text-slate-500">
                                                {q.pending} Left
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
