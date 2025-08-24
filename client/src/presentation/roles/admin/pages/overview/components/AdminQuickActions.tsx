import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import {
    UserPlus,
    Settings,
    Download,
    Upload,
    RefreshCw,
    Shield,
    FileText,
    BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Button } from "@/presentation/components/shared/ui/button";

interface QuickActionProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    color: string;
}

const QuickActionCard: React.FC<QuickActionProps> = ({
    title,
    description,
    icon,
    onClick,
    color,
}) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer"
        onClick={onClick}
    >
        <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${color}`}>
                        {icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                        <p className="text-sm text-gray-600">{description}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </motion.div>
);

export const AdminQuickActions: React.FC = () => {
    const navigate = useNavigate();

    const quickActions = [
        {
            title: "Add New User",
            description: "Create a new user account and assign roles",
            icon: <UserPlus className="w-6 h-6 text-blue-600" />,
            onClick: () => navigate({ to: "/admin/user-management" }),
            color: "bg-blue-100",
        },
        {
            title: "System Settings",
            description: "Configure system preferences and parameters",
            icon: <Settings className="w-6 h-6 text-gray-600" />,
            onClick: () => navigate({ to: "/admin/settings" }),
            color: "bg-gray-100",
        },
        {
            title: "Export Data",
            description: "Download system data and reports",
            icon: <Download className="w-6 h-6 text-green-600" />,
            onClick: () => navigate({ to: "/admin/data" }),
            color: "bg-green-100",
        },
        {
            title: "Import Data",
            description: "Upload and import data into the system",
            icon: <Upload className="w-6 h-6 text-purple-600" />,
            onClick: () => navigate({ to: "/admin/data" }),
            color: "bg-purple-100",
        },
        {
            title: "Security Audit",
            description: "Review security logs and access controls",
            icon: <Shield className="w-6 h-6 text-red-600" />,
            onClick: () => navigate({ to: "/admin/security" }),
            color: "bg-red-100",
        },
        {
            title: "Activity Logs",
            description: "View system and user activity logs",
            icon: <FileText className="w-6 h-6 text-orange-600" />,
            onClick: () => navigate({ to: "/admin/logs" }),
            color: "bg-orange-100",
        },
        {
            title: "Generate Reports",
            description: "Create custom reports and analytics",
            icon: <BarChart3 className="w-6 h-6 text-indigo-600" />,
            onClick: () => navigate({ to: "/admin/data" }),
            color: "bg-indigo-100",
        },
        {
            title: "System Refresh",
            description: "Refresh system cache and data",
            icon: <RefreshCw className="w-6 h-6 text-emerald-600" />,
            onClick: () => {
                // Add refresh logic here
                window.location.reload();
            },
            color: "bg-emerald-100",
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                        <motion.div
                            key={action.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <QuickActionCard {...action} />
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
