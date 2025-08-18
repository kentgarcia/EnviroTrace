import React from "react";
import { ViewStyle } from "react-native";
import {
    // tabs & common
    LayoutDashboard,
    Car,
    ClipboardList,
    Building2,
    User,
    HelpCircle,
    // actions/status
    RefreshCw,
    CloudCheck,
    CheckCircle2,
    AlertCircle,
    CirclePlus,
    CalendarDays,
    ChevronRight,
    Database,
    Info,
    BarChart3,
    Check,
    Plus,
    TreePalm,
    Shield,
    ShieldCheck,
    LogOut,
    UserCircle,
    Wind,
    ClipboardPlus,
    Filter,
    X,
    Search,
    Phone,
} from "lucide-react-native";

const ICONS = {
    LayoutDashboard,
    Car,
    ClipboardList,
    Building2,
    User,
    HelpCircle,
    RefreshCw,
    CloudCheck,
    CheckCircle2,
    AlertCircle,
    CirclePlus,
    CalendarDays,
    ChevronRight,
    Database,
    Info,
    BarChart3,
    Check,
    Plus,
    TreePalm,
    Shield,
    ShieldCheck,
    LogOut,
    UserCircle,
    Wind,
    ClipboardPlus,
    Filter,
    X,
    Search,
    Phone,
} as const;

// Supported icon names mapping from existing MaterialIcons names to Lucide icons
const nameMap: Record<string, keyof typeof ICONS> = {
    // tabs
    dashboard: "LayoutDashboard",
    "directions-car": "Car",
    assignment: "ClipboardList",
    business: "Building2",
    person: "User",
    help: "HelpCircle",

    // common
    sync: "RefreshCw",
    "cloud-done": "CloudCheck",
    "check-circle": "CheckCircle2",
    "alert-circle": "AlertCircle",
    "add-circle": "CirclePlus",
    event: "CalendarDays",
    "chevron-right": "ChevronRight",
    storage: "Database",
    info: "Info",
    help_outline: "HelpCircle",
    "bar-chart": "BarChart3",
    check: "Check",
    plus: "Plus",
    car: "Car",
    tree: "TreePalm",
    shield: "Shield",
    "shield-check": "ShieldCheck",
    "view-dashboard": "LayoutDashboard",
    logout: "LogOut",
    "account-circle": "UserCircle",
    "weather-windy": "Wind",
    // extras used by code
    "assignment-add": "ClipboardPlus",
    filter: "Filter",
    "filter-variant": "Filter",
    search: "Search",
    magnify: "Search",
    close: "X",
    phone: "Phone",
};

export type IconName = keyof typeof nameMap | keyof typeof ICONS;

export interface IconProps {
    name: IconName;
    size?: number;
    color?: string;
    style?: ViewStyle;
}

export default function Icon({ name, size = 24, color = "#000", style }: IconProps) {
    // Allow direct Lucide names too
    const lucideName = (nameMap[name as string] || (name as keyof typeof ICONS)) as keyof typeof ICONS;
    const LucideIcon = ICONS[lucideName] as unknown as React.ComponentType<any>;

    if (!LucideIcon) {
        const Fallback = HelpCircle as any;
        return <Fallback size={size} color={color} style={style} />;
    }

    return <LucideIcon size={size} color={color} style={style} />;
}
