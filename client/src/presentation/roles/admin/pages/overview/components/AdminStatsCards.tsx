import React from "react";
import { useNavigate } from "@tanstack/react-router";
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
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 mb-6">
            <StatCard
                label="Total Users"
                value={data.totalUsers}
                Icon={Users}
                loading={isLoading}
                onClick={() => navigate({ to: "/admin/user-management" })}
            />
            <StatCard
                label="Active Users"
                value={data.activeUsers}
                Icon={UserCheck}
                loading={isLoading}
                onClick={() => navigate({ to: "/admin/user-management" })}
            />
            <StatCard
                label="Total Roles"
                value={data.totalRoles}
                Icon={Shield}
                loading={isLoading}
                onClick={() => navigate({ to: "/admin/permission-management" })}
            />
            <StatCard
                label="System Uptime"
                value={data.systemUptime}
                Icon={Clock}
                loading={isLoading}
                onClick={() => navigate({ to: "/admin/settings" })}
            />
            <StatCard
                label="Active Sessions"
                value={data.totalSessions}
                Icon={Activity}
                loading={isLoading}
                onClick={() => navigate({ to: "/admin/session-management" })}
            />
            <StatCard
                label="Failed Logins"
                value={data.failedLogins}
                Icon={AlertTriangle}
                loading={isLoading}
                onClick={() => navigate({ to: "/admin/audit-logs" })}
            />
        </div>
    );
};
