import React from "react";
import StatCard from "@/presentation/components/shared/StatCard";
import { Users, UserCheck, Shield, Clock, Activity, AlertTriangle } from "lucide-react";
import { AdminKeyStatsData } from "../logic/useAdminOverviewData";

interface AdminStatsCardsProps {
    data: AdminKeyStatsData;
    isLoading?: boolean;
}

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({
    data,
    isLoading = false
}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 mb-6">
            <StatCard
                label="Total Users"
                value={data.totalUsers}
                Icon={Users}
                loading={isLoading}
            />
            <StatCard
                label="Active Users"
                value={data.activeUsers}
                Icon={UserCheck}
                loading={isLoading}
            />
            <StatCard
                label="Total Roles"
                value={data.totalRoles}
                Icon={Shield}
                loading={isLoading}
            />
            <StatCard
                label="System Uptime"
                value={data.systemUptime}
                Icon={Clock}
                loading={isLoading}
            />
            <StatCard
                label="Active Sessions"
                value={data.totalSessions}
                Icon={Activity}
                loading={isLoading}
            />
            <StatCard
                label="Failed Logins"
                value={data.failedLogins}
                Icon={AlertTriangle}
                loading={isLoading}
            />
        </div>
    );
};
