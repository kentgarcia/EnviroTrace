import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Label } from "@/presentation/components/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/shared/ui/select";
import { LayoutDashboard, CalendarDays } from "lucide-react";
import { useSettingsStore } from "@/core/hooks/useSettingsStore";
import { QuarterInfoEditor } from "@/presentation/roles/emission/components/quarterly/QuarterInfoEditor";

type SettingCategory = "general" | "quarterly-testing";

const GovernmentEmissionSettings: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<SettingCategory>("general");
    const { rowsPerPage, setRowsPerPage } = useSettingsStore();
    const currentYear = new Date().getFullYear();
    const [quarterlyConfigYear, setQuarterlyConfigYear] = useState<number>(currentYear);

    const availableYears = useMemo(() => {
        const startYear = 2020;
        const endYear = currentYear + 1;
        const years: number[] = [];
        for (let year = endYear; year >= startYear; year--) {
            years.push(year);
        }
        return years;
    }, [currentYear]);

    const categories = [
        {
            id: "general" as const,
            label: "General",
            icon: <LayoutDashboard className="w-4 h-4" />,
            description: "Configure global preferences and defaults"
        },
        {
            id: "quarterly-testing" as const,
            label: "Quarterly Testing",
            icon: <CalendarDays className="w-4 h-4" />,
            description: "Schedule quarterly emission activities"
        }
    ];

    return (
        <div className="flex flex-col h-full bg-[#F9FBFC]">
            <div className="bg-white px-6 py-4 border-b border-gray-200 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Settings</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage preferences for the Government Emission dashboard
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
                    <div className="p-4 space-y-1">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeCategory === category.id
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                {category.icon}
                                <div className="text-left">
                                    <div>{category.label}</div>
                                    <p className="text-[11px] text-gray-500">{category.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-[#F9FBFC]">
                    {activeCategory === "general" && (
                        <div className="p-6 max-w-4xl space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Display Settings</CardTitle>
                                    <CardDescription>
                                        Choose how many records appear in tables by default.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Default Rows Per Page</Label>
                                        <div className="flex items-center gap-4">
                                            <Select value={rowsPerPage.toString()} onValueChange={(value) => setRowsPerPage(parseInt(value, 10))}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Select rows" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="10">10 rows</SelectItem>
                                                    <SelectItem value="20">20 rows</SelectItem>
                                                    <SelectItem value="50">50 rows</SelectItem>
                                                    <SelectItem value="100">100 rows</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-sm text-muted-foreground">
                                                Impacts vehicle, testing, and office tables.
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Changes apply immediately to the Vehicles and Offices directories.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeCategory === "quarterly-testing" && (
                        <div className="p-6 h-full flex flex-col gap-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-semibold tracking-tight">Quarterly Testing Configuration</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Manage quarterly schedules, assignments, and locations for emission tests.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Label className="text-sm text-gray-600">Year</Label>
                                    <Select
                                        value={quarterlyConfigYear.toString()}
                                        onValueChange={(value) => setQuarterlyConfigYear(parseInt(value, 10))}
                                    >
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableYears.map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                                <QuarterInfoEditor selectedYear={quarterlyConfigYear} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GovernmentEmissionSettings;
