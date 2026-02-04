import React from "react";
import { motion } from "framer-motion";
import {
    Activity,
    Users,
    Monitor,
    Shield,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";

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
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
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
            title: "Manage Users",
            description: "View and manage existing user accounts",
            icon: <Users className="w-6 h-6 text-green-600 dark:text-green-400" />,
            onClick: () => navigate({ to: "/admin/user-management" }),
            color: "bg-green-100 dark:bg-green-900/30",
        },
        {
            title: "Session Management",
            description: "Monitor and control user login sessions",
            icon: <Monitor className="w-6 h-6 text-orange-600 dark:text-orange-400" />,
            onClick: () => navigate({ to: "/admin/session-management" }),
            color: "bg-orange-100 dark:bg-orange-900/30",
        },
        {
            title: "Audit Logs",
            description: "View ISO-compliant system activity audit trail",
            icon: <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />,
            onClick: () => navigate({ to: "/admin/audit-logs" }),
            color: "bg-red-100 dark:bg-red-900/30",
        },
        {
            title: "View System Health",
            description: "Monitor system performance and health metrics",
            icon: <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
            onClick: () => {
                // Scroll to system health section on the same page
                const element = document.querySelector('[data-section="system-health"]');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            },
            color: "bg-purple-100 dark:bg-purple-900/30",
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
