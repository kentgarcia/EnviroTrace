import React from "react";
import { Card, CardContent } from "./ui/card";

export interface StatCardColors {
    circleFill?: string; // Icon circle background
    circleBorder?: string; // Icon circle border
    iconColor?: string; // Icon color
    labelBg?: string; // Label background
    labelText?: string; // Label text color
    valueText?: string; // Value text color
    accentLeft?: string; // Bottom bar left color
    accentRight?: string; // Bottom bar right color
}

export interface StatCardProps {
    label: string;
    value?: number | string;
    loading?: boolean;
    className?: string;
    // Icon component (e.g., from lucide-react). Optional if loading.
    Icon?: React.ComponentType<{ className?: string; color?: string }>;
    colors?: StatCardColors;
}

const DEFAULTS: Required<StatCardColors> = {
    circleFill: "#0054A6",
    circleBorder: "#FFD200",
    iconColor: "#FFFFFF",
    labelBg: "#0054A6",
    labelText: "#FFFFFF",
    valueText: "#0054A6",
    accentLeft: "#FFD200",
    accentRight: "#ED1C24",
};

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value = 0,
    loading = false,
    className,
    Icon,
    colors,
}) => {
    const c = { ...DEFAULTS, ...(colors || {}) };

    return (
        <Card className={`${className} dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-850 dark:border-gray-700`}>
            <CardContent className="p-4">
                <div className={`flex items-center gap-4 ${loading ? "animate-pulse" : ""}`}>
                    <div
                        className="h-12 w-12 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: c.circleFill, border: `2px solid ${c.circleBorder}` }}
                    >
                        {loading ? (
                            <div className="h-6 w-6 rounded" style={{ backgroundColor: "rgba(255,255,255,0.35)" }} />
                        ) : (
                            Icon ? <Icon className="h-6 w-6" color={c.iconColor} /> : null
                        )}
                    </div>
                    <div className="flex-1">
                        {loading ? (
                            <>
                                <div className="h-5 w-24 rounded mb-2" style={{ backgroundColor: c.valueText, opacity: 0.15 }} />
                                <div className="h-6 w-16 rounded" style={{ backgroundColor: c.valueText, opacity: 0.15 }} />
                            </>
                        ) : (
                            <>
                                <span
                                    className="inline-block text-xs font-medium px-2 py-0.5 rounded transition-colors"
                                    style={{ 
                                        backgroundColor: c.labelBg, 
                                        color: c.labelText,
                                        opacity: 'var(--tw-bg-opacity, 1)'
                                    }}
                                >
                                    {label}
                                </span>
                                <div
                                    className="text-2xl font-bold leading-7 mt-1 transition-colors dark:opacity-90"
                                    style={{ color: c.valueText }}
                                >
                                    {typeof value === "number" ? value.toLocaleString() : value}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
            <div className="h-1 w-full flex">
                <div className="w-1/2 h-full" style={{ backgroundColor: c.accentLeft }} />
                <div className="w-1/2 h-full" style={{ backgroundColor: c.accentRight }} />
            </div>
        </Card>
    );
};

export default StatCard;
