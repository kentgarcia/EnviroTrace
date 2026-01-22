import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";
import { Label } from "@/presentation/components/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/shared/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/presentation/components/shared/ui/tabs";
import { Settings, TreePine, LayoutGrid, ListChecks, Sliders } from "lucide-react";
import StandardsConfiguration from "./components/StandardsConfiguration";
import DropdownOptionSettings from "./components/DropdownOptionSettings";
import { useSettingsStore } from "@/core/hooks/useSettingsStore";

type SettingCategory = "general" | "processing-standards" | "dropdown-options";

export default function UrbanGreeningSettings() {
    const [activeCategory, setActiveCategory] = useState<SettingCategory>("general");
    const { rowsPerPage, setRowsPerPage } = useSettingsStore();

    const categories = [
        {
            id: "general" as const,
            label: "General",
            icon: <LayoutGrid className="w-4 h-4" />,
            description: "General application settings"
        },
        {
            id: "processing-standards" as const,
            label: "Processing Standards",
            icon: <ListChecks className="w-4 h-4" />,
            description: "SLA and processing time configuration"
        },
        {
            id: "dropdown-options" as const,
            label: "Dropdown Options",
            icon: <Sliders className="w-4 h-4" />,
            description: "Form dropdown menus configuration"
        }
    ];

    return (
        <div className="flex flex-col h-full bg-[#F9FBFC]">
            {/* Header Section */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Settings</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage your preferences and application settings
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Categories */}
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
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Content - Specific Settings */}
                <div className="flex-1 overflow-y-auto bg-[#F9FBFC]">
                    {activeCategory === "general" && (
                        <div className="p-6 max-w-4xl space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Display Settings</CardTitle>
                                    <CardDescription>
                                        Configure how data is displayed across the application.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Default Rows Per Page</Label>
                                        <div className="flex items-center gap-4">
                                           <Select value={rowsPerPage.toString()} onValueChange={(val) => setRowsPerPage(parseInt(val))}>
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
                                                Set the default number of items shown in tables.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeCategory === "processing-standards" && (
                        <div className="p-6 h-full flex flex-col">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold tracking-tight">Processing Standards</h2>
                                <p className="text-muted-foreground">Manage service level agreements (SLA) and processing days.</p>
                            </div>
                            <StandardsConfiguration />
                        </div>
                    )}

                    {activeCategory === "dropdown-options" && (
                        <div className="p-6 h-full flex flex-col">
                             <div className="mb-6">
                                <h2 className="text-2xl font-semibold tracking-tight">Dropdown Options</h2>
                                <p className="text-muted-foreground">Configure dropdown values for different phases.</p>
                            </div>
                            <DropdownOptionSettings />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
