import React, { useMemo } from "react";
import {
    Sparkles,
    Clock,
    AlertTriangle,
    Users,
    Car,
    Target,
    CheckCircle,
    XCircle,
    BarChart3,
    Calendar,
    TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Progress } from "@/presentation/components/shared/ui/progress";
import { Badge } from "@/presentation/components/shared/ui/badge";
import StatCard from "@/presentation/components/shared/StatCard";
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
    officeGroups,
    selectedOffices,
}) => {
    const overview = useMemo(() => {
        const totalVehicles = officeGroups.reduce(
            (total, office) => total + office.vehicles.length,
            0
        );
        const expectedTests = totalVehicles * quarterKeys.length;

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

        const pendingCount = Math.max(expectedTests - totalTests, 0);
        const completionRate = expectedTests > 0 ? (totalTests / expectedTests) * 100 : 0;
        const passRate = totalTests > 0 ? (passCount / totalTests) * 100 : 0;

        const quarterList: QuarterPerformance[] = quarterKeys.map((quarterKey, index) => {
            const data = quarterTotals[quarterKey];
            const pending = Math.max(totalVehicles - data.tested, 0);
            const completion = totalVehicles > 0 ? (data.tested / totalVehicles) * 100 : 0;
            const passPercentage = data.tested > 0 ? (data.passed / data.tested) * 100 : 0;

            return {
                key: quarterKey,
                label: `Q${index + 1}`,
                tested: data.tested,
                passed: data.passed,
                failed: data.failed,
                pending,
                completionRate: completion,
                passRate: passPercentage,
            };
        });

        return {
            totalVehicles,
            expectedTests,
            totalTests,
            passCount,
            failCount,
            pendingCount,
            completionRate,
            passRate,
            quarterList,
            officeBreakdown,
        };
    }, [officeGroups]);

    const selectedOfficeLabel = useMemo(() => {
        if (selectedOffices.length === 0 || selectedOffices.includes("all")) {
            return "All offices";
        }

        const officeNames = selectedOffices
            .map((id) => officeGroups.find((office) => office.office_id === id)?.office_name)
            .filter(Boolean) as string[];

        if (officeNames.length === 0) {
            return `${selectedOffices.length} office${selectedOffices.length === 1 ? "" : "s"}`;
        }

        if (officeNames.length <= 2) {
            return officeNames.join(" • ");
        }

        return `${officeNames.slice(0, 2).join(" • ")} + ${officeNames.length - 2} more`;
    }, [selectedOffices, officeGroups]);

    const topOffice = useMemo(() => {
        return overview.officeBreakdown
            .filter((office) => office.expectedTests > 0)
            .slice()
            .sort((a, b) => b.completionRate - a.completionRate)[0] ?? null;
    }, [overview.officeBreakdown]);

    const laggingQuarter = useMemo(() => {
        return overview.quarterList
            .slice()
            .sort((a, b) => b.pending - a.pending)[0] ?? null;
    }, [overview.quarterList]);

    const strongestQuarter = useMemo(() => {
        return overview.quarterList
            .slice()
            .sort((a, b) => b.passRate - a.passRate)[0] ?? null;
    }, [overview.quarterList]);

    const statusState = useMemo(() => {
        if (overview.expectedTests === 0) {
            return {
                label: "No vehicles in view",
                message: "Adjust your filters or year to see testing progress.",
                tone: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
                Icon: Users,
            } as const;
        }

        if (overview.completionRate >= 85 && overview.passRate >= 80) {
            return {
                label: "On track",
                message: "Most required tests are complete and passing—keep up the great work!",
                tone: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
                Icon: Sparkles,
            } as const;
        }

        if (overview.completionRate >= 60) {
            return {
                label: "Making progress",
                message: "You're over halfway there. Focus on the remaining vehicles to stay compliant.",
                tone: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
                Icon: Clock,
            } as const;
        }

        return {
            label: "Needs attention",
            message: "A large portion of tests are still pending. Schedule inspections soon.",
            tone: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
            Icon: AlertTriangle,
        } as const;
    }, [overview.expectedTests, overview.completionRate, overview.passRate]);

    const insights = useMemo(() => {
        if (overview.expectedTests === 0) {
            return [
                "No vehicles were returned for the current filters.",
                "Select different offices or adjust the year to track testing progress.",
            ];
        }

        const items = [
            overview.pendingCount === 0
                ? "All scheduled tests for the year are complete."
                : `${formatNumber(overview.pendingCount)} test${overview.pendingCount === 1 ? "" : "s"} remain this year.`,
            overview.passRate > 0
                ? `${formatPercent(overview.passRate)} of completed tests are passing.`
                : "No tests have been recorded yet.",
        ];

        if (topOffice) {
            items.push(
                `${topOffice.name} is leading with ${formatPercent(topOffice.completionRate)} completion.`
            );
        }

        if (laggingQuarter) {
            items.push(
                `${laggingQuarter.label} has the largest backlog (${formatNumber(laggingQuarter.pending)} pending vehicles).`
            );
        }

        if (strongestQuarter) {
            items.push(
                `${strongestQuarter.label} holds the best pass rate at ${formatPercent(strongestQuarter.passRate)}.`
            );
        }

        return items;
    }, [overview, topOffice, laggingQuarter, strongestQuarter]);

    const showOfficeBreakdown =
        selectedOffices.length > 0 &&
        !selectedOffices.includes("all") &&
        overview.officeBreakdown.length > 0;

    const QuarterProgressCard: React.FC<{ data: QuarterPerformance }> = ({ data }) => {
        const tone =
            data.completionRate >= 80
                ? "text-emerald-600"
                : data.completionRate >= 60
                    ? "text-amber-600"
                    : "text-rose-600";

        return (
            <Card className="border border-slate-200 shadow-none bg-white">
                <CardContent className="space-y-4 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{data.label} {selectedYear}</span>
                        </div>
                        <Badge variant="outline" className={`${tone} border-current bg-transparent`}>{formatPercent(data.completionRate)} complete</Badge>
                    </div>
                    <div>
                        <Progress value={data.completionRate} className="h-2" />
                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatNumber(data.tested)} tested</span>
                            <span>{formatNumber(data.pending)} pending</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded-md bg-emerald-50 py-2">
                            <div className="text-sm font-semibold text-emerald-600">{formatNumber(data.passed)}</div>
                            <div className="text-muted-foreground">Passed</div>
                        </div>
                        <div className="rounded-md bg-rose-50 py-2">
                            <div className="text-sm font-semibold text-rose-600">{formatNumber(data.failed)}</div>
                            <div className="text-muted-foreground">Failed</div>
                        </div>
                        <div className="rounded-md bg-slate-50 py-2">
                            <div className="text-sm font-semibold text-slate-700">{formatNumber(data.pending)}</div>
                            <div className="text-muted-foreground">Pending</div>
                        </div>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">Pass rate: {formatPercent(data.passRate)}</div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <Card className="border border-slate-200 shadow-none bg-white">
                <CardHeader className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <CardTitle className="text-2xl font-semibold text-slate-900">
                            Overview for {selectedYear}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{selectedOfficeLabel}</p>
                    </div>
                    <Badge className={`flex items-center gap-1 text-sm ${statusState.tone}`}>
                        <statusState.Icon className="h-4 w-4" />
                        {statusState.label}
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <p className="text-sm text-muted-foreground max-w-3xl">{statusState.message}</p>

                    <div className="grid gap-6 xl:grid-cols-[minmax(220px,0.7fr)_minmax(260px,1fr)_minmax(250px,0.8fr)]">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
                            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Annual completion
                            </div>
                            <div className="mt-2 text-4xl font-semibold text-slate-900">
                                {formatPercent(overview.completionRate)}
                            </div>
                            <Progress value={overview.completionRate} className="mt-4 h-2" />
                            <div className="mt-3 text-xs text-muted-foreground">
                                {formatNumber(overview.totalTests)} of {formatNumber(overview.expectedTests)} tests completed
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="text-xs font-semibold uppercase text-muted-foreground">Vehicles tested</div>
                                <div className="mt-1 text-2xl font-semibold text-slate-900">{formatNumber(stats.totalTested)}</div>
                                <div className="text-xs text-muted-foreground">Have at least one quarter recorded</div>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="text-xs font-semibold uppercase text-muted-foreground">Fully compliant</div>
                                <div className="mt-1 text-2xl font-semibold text-emerald-600">{formatNumber(stats.totalPassed)}</div>
                                <div className="text-xs text-muted-foreground">Vehicles passing across their tests</div>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="text-xs font-semibold uppercase text-muted-foreground">Needs review</div>
                                <div className="mt-1 text-2xl font-semibold text-rose-600">{formatNumber(stats.totalFailed)}</div>
                                <div className="text-xs text-muted-foreground">Vehicles with a failed quarter</div>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="text-xs font-semibold uppercase text-muted-foreground">No tests yet</div>
                                <div className="mt-1 text-2xl font-semibold text-slate-700">{formatNumber(stats.totalUntested)}</div>
                                <div className="text-xs text-muted-foreground">Waiting for first inspection</div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                Key insights
                            </div>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                {insights.map((item, index) => (
                                    <li key={`${item}-${index}`} className="flex gap-2">
                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard label="Vehicles in scope" value={overview.totalVehicles} Icon={Car} />
                <StatCard
                    label="Tests completed"
                    value={`${formatNumber(overview.totalTests)} / ${formatNumber(overview.expectedTests)}`}
                    Icon={Target}
                />
                <StatCard
                    label="Completion rate"
                    value={formatPercent(overview.completionRate)}
                    Icon={BarChart3}
                />
                <StatCard
                    label="Pass rate"
                    value={formatPercent(overview.passRate)}
                    Icon={CheckCircle}
                />
                <StatCard
                    label="Tests failed"
                    value={overview.failCount}
                    Icon={XCircle}
                />
                <StatCard
                    label="Tests remaining"
                    value={overview.pendingCount}
                    Icon={Clock}
                />
            </div>

            <Card className="border border-slate-200 shadow-none bg-white">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-xl">Quarterly performance</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Track how each quarter is progressing for {selectedYear}.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {overview.quarterList.map((quarter) => (
                            <QuarterProgressCard key={quarter.key} data={quarter} />
                        ))}
                    </div>
                </CardContent>
            </Card>

            {showOfficeBreakdown && (
                <Card className="border border-slate-200 shadow-none bg-white">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-xl">Office breakdown</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Insight into each selected office's progress.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {overview.officeBreakdown.map((office) => (
                            <div
                                key={office.id}
                                className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm"
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="text-base font-semibold text-slate-900">{office.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {formatNumber(office.vehicleCount)} vehicle{office.vehicleCount === 1 ? "" : "s"} in scope
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-sm font-medium">
                                        {formatPercent(office.completionRate)} complete
                                    </Badge>
                                </div>
                                <div className="mt-3 grid gap-3 md:grid-cols-3">
                                    <div className="rounded-md border border-white bg-white/70 p-3 text-sm">
                                        <div className="text-xs uppercase text-muted-foreground">Completed tests</div>
                                        <div className="mt-1 text-lg font-semibold text-slate-900">
                                            {formatNumber(office.completedTests)} / {formatNumber(office.expectedTests)}
                                        </div>
                                    </div>
                                    <div className="rounded-md border border-white bg-white/70 p-3 text-sm">
                                        <div className="text-xs uppercase text-muted-foreground">Pending</div>
                                        <div className="mt-1 text-lg font-semibold text-slate-900">{formatNumber(office.pendingTests)}</div>
                                    </div>
                                    <div className="rounded-md border border-white bg-white/70 p-3 text-sm">
                                        <div className="text-xs uppercase text-muted-foreground">Pass rate</div>
                                        <div className="mt-1 text-lg font-semibold text-slate-900">{formatPercent(office.passRate)}</div>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                        {formatNumber(office.passCount)} passed tests
                                    </Badge>
                                    <Badge variant="secondary" className="bg-rose-100 text-rose-700">
                                        {formatNumber(office.failCount)} failed tests
                                    </Badge>
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                        {formatNumber(office.pendingTests)} pending
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
