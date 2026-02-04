import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Palette } from "lucide-react";
import { ThemeSelector } from "@/presentation/components/shared/settings/ThemeSelector";
import { FontSizeSelector } from "@/presentation/components/shared/settings/FontSizeSelector";

type SettingCategory = "appearance";

const AdminSettings: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<SettingCategory>("appearance");

    const categories = [
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
                            Manage your preferences and application settings
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

export default AdminSettings;
