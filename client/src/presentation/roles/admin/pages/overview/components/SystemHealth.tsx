import React from "react";
import { motion } from "framer-motion";
import {
    CheckCircle,
    AlertTriangle,
    XCircle,
    Clock,
    Server,
    Database,
    Wifi,
    HardDrive,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/shared/ui/card";
import { Badge } from "@/presentation/components/shared/ui/badge";

interface SystemMetric {
    name: string;
    status: "healthy" | "warning" | "critical" | "maintenance";
    value: string;
    icon: React.ReactNode;
    description: string;
}

const getStatusConfig = (status: SystemMetric["status"]) => {
    switch (status) {
        case "healthy":
            return {
                icon: <CheckCircle className="w-4 h-4" />,
                color: "bg-green-100 text-green-800",
                text: "Healthy",
            };
        case "warning":
            return {
                icon: <AlertTriangle className="w-4 h-4" />,
                color: "bg-yellow-100 text-yellow-800",
                text: "Warning",
            };
        case "critical":
            return {
                icon: <XCircle className="w-4 h-4" />,
                color: "bg-red-100 text-red-800",
                text: "Critical",
            };
        case "maintenance":
            return {
                icon: <Clock className="w-4 h-4" />,
                color: "bg-blue-100 text-blue-800",
                text: "Maintenance",
            };
    }
};

const MetricRow: React.FC<{ metric: SystemMetric; index: number }> = ({ metric, index }) => {
    const statusConfig = getStatusConfig(metric.status);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
            <div className="flex items-center space-x-3">
                <div className="text-gray-500">{metric.icon}</div>
                <div>
                    <div className="text-sm font-medium text-gray-900">{metric.name}</div>
                    <div className="text-xs text-gray-500">{metric.description}</div>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{metric.value}</span>
                <Badge className={`${statusConfig.color} flex items-center space-x-1`}>
                    {statusConfig.icon}
                    <span>{statusConfig.text}</span>
                </Badge>
            </div>
        </motion.div>
    );
};

export const SystemHealth: React.FC = () => {
    // Mock system metrics - in real app, these would come from monitoring APIs
    const systemMetrics: SystemMetric[] = [
        {
            name: "API Server",
            status: "healthy",
            value: "Online",
            icon: <Server className="w-5 h-5" />,
            description: "Main application server",
        },
        {
            name: "Database",
            status: "healthy",
            value: "Connected",
            icon: <Database className="w-5 h-5" />,
            description: "PostgreSQL cluster",
        },
        {
            name: "Network",
            status: "warning",
            value: "85%",
            icon: <Wifi className="w-5 h-5" />,
            description: "Network performance",
        },
        {
            name: "Storage",
            status: "healthy",
            value: "67%",
            icon: <HardDrive className="w-5 h-5" />,
            description: "Disk space usage",
        },
    ];

    const overallHealth = systemMetrics.every(m => m.status === "healthy")
        ? "healthy"
        : systemMetrics.some(m => m.status === "critical")
            ? "critical"
            : "warning";

    const overallConfig = getStatusConfig(overallHealth);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="text-xl font-semibold text-gray-900">System Health</span>
                    <Badge className={`${overallConfig.color} flex items-center space-x-1`}>
                        {overallConfig.icon}
                        <span>{overallConfig.text}</span>
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {systemMetrics.map((metric, index) => (
                        <MetricRow key={metric.name} metric={metric} index={index} />
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t">
                    <div className="text-xs text-gray-500 mb-2">System Uptime</div>
                    <div className="text-2xl font-bold text-gray-900">99.9%</div>
                    <div className="text-xs text-gray-500">Last 30 days</div>
                </div>
            </CardContent>
        </Card>
    );
};
