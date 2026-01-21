import React from "react";
import { motion } from "framer-motion";
import {
    UserPlus,
    UserX,
    Settings,
    Shield,
    FileText,
    Database,
    AlertTriangle,
    Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";
import { Avatar, AvatarFallback } from "@/presentation/components/shared/ui/avatar";

interface ActivityItem {
    id: string;
    user: string;
    action: string;
    description: string;
    timestamp: string;
    type: "user" | "system" | "security" | "data";
    severity: "low" | "medium" | "high";
}

const getActivityConfig = (type: ActivityItem["type"]) => {
    switch (type) {
        case "user":
            return {
                icon: <UserPlus className="w-4 h-4" />,
                color: "bg-blue-100 text-blue-800",
            };
        case "system":
            return {
                icon: <Settings className="w-4 h-4" />,
                color: "bg-gray-100 text-gray-800",
            };
        case "security":
            return {
                icon: <Shield className="w-4 h-4" />,
                color: "bg-red-100 text-red-800",
            };
        case "data":
            return {
                icon: <Database className="w-4 h-4" />,
                color: "bg-green-100 text-green-800",
            };
    }
};

const getSeverityConfig = (severity: ActivityItem["severity"]) => {
    switch (severity) {
        case "low":
            return "border-l-green-400";
        case "medium":
            return "border-l-yellow-400";
        case "high":
            return "border-l-red-400";
    }
};

const ActivityRow: React.FC<{ activity: ActivityItem; index: number }> = ({ activity, index }) => {
    const activityConfig = getActivityConfig(activity.type);
    const severityBorder = getSeverityConfig(activity.severity);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border-l-4 ${severityBorder}`}
        >
            <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                    {activity.user.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.user}
                    </p>
                    <div className="flex items-center space-x-2">
                        <Badge className={`${activityConfig.color} flex items-center space-x-1`}>
                            {activityConfig.icon}
                            <span className="capitalize">{activity.type}</span>
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {activity.timestamp}
                        </span>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">{activity.action}</span>
                    {activity.description && ` - ${activity.description}`}
                </p>
            </div>
        </motion.div>
    );
};

export const RecentActivity: React.FC = () => {
    // Mock activity data - in real app, this would come from activity/audit log APIs
    const recentActivities: ActivityItem[] = [
        {
            id: "1",
            user: "John Admin",
            action: "Created new user",
            description: "Added Maria Santos with urban_greening role",
            timestamp: "2 min ago",
            type: "user",
            severity: "low",
        },
        {
            id: "2",
            user: "System",
            action: "Database backup",
            description: "Automated backup completed successfully",
            timestamp: "15 min ago",
            type: "system",
            severity: "low",
        },
        {
            id: "3",
            user: "Security Monitor",
            action: "Failed login attempt",
            description: "Multiple failed attempts from IP 192.168.1.100",
            timestamp: "32 min ago",
            type: "security",
            severity: "medium",
        },
        {
            id: "4",
            user: "Data Processor",
            action: "Bulk data import",
            description: "Imported 1,247 emission test records",
            timestamp: "1 hour ago",
            type: "data",
            severity: "low",
        },
        {
            id: "5",
            user: "Jane Admin",
            action: "Updated system settings",
            description: "Modified email notification preferences",
            timestamp: "2 hours ago",
            type: "system",
            severity: "low",
        },
        {
            id: "6",
            user: "Security Monitor",
            action: "Permission escalation",
            description: "User attempted unauthorized access to admin panel",
            timestamp: "3 hours ago",
            type: "security",
            severity: "high",
        },
        {
            id: "7",
            user: "System",
            action: "Scheduled maintenance",
            description: "System cache cleared and optimized",
            timestamp: "4 hours ago",
            type: "system",
            severity: "low",
        },
        {
            id: "8",
            user: "Bob Manager",
            action: "Role assignment",
            description: "Assigned urban_greening role to Sarah Lee",
            timestamp: "5 hours ago",
            type: "user",
            severity: "low",
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="text-xl font-semibold text-gray-900">Recent Activity</span>
                    <Badge className="bg-blue-100 text-blue-800">
                        Live
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {recentActivities.map((activity, index) => (
                        <ActivityRow key={activity.id} activity={activity} index={index} />
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        View All Activity Logs
                    </button>
                </div>
            </CardContent>
        </Card>
    );
};
