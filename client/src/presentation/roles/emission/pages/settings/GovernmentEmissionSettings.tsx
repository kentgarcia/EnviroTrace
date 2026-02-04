import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Label } from "@/presentation/components/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/shared/ui/select";
import { LayoutDashboard, CalendarDays, Palette } from "lucide-react";
import { useSettingsStore } from "@/core/hooks/useSettingsStore";
import { QuarterInfoEditor } from "@/presentation/roles/emission/components/quarterly/QuarterInfoEditor";
import { ThemeSelector } from "@/presentation/components/shared/settings/ThemeSelector";
import { FontSizeSelector } from "@/presentation/components/shared/settings/FontSizeSelector";

type SettingCategory = "general" | "quarterly-testing" | "appearance";

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
        },
        {
            id: "appearance" as const,
            label: "Appearance",
            icon: <Palette className="w-4 h-4" />,
            description: "Customize theme and display"
        }
    ];

    return (
        <div className="flex flex-col h-full page-bg">
            <div className="page-header-bg px-6 py-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage preferences for the Government Emission dashboard
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
                    <div className="p-4 space-y-1">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeCategory === category.id
                                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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

                <div className="flex-1 overflow-y-auto page-bg">
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

                    {activeCategory === "appearance" && (
                        <div className="p-6 max-w-4xl space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Appearance</CardTitle>
                                    <CardDescription>
                                        Customize the look and feel of the application
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <ThemeSelector />
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <FontSizeSelector />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GovernmentEmissionSettings;
