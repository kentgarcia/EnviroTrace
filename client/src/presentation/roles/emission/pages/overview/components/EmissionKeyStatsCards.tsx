import React from "react";
import StatCard from "@/presentation/components/shared/StatCard";
import { Car, Building2, CheckCircle, XCircle, Clock, BarChart3 } from "lucide-react";

interface EmissionKeyStatsCardsProps {
    data: {
        totalVehicles: number;
        totalOffices: number;
        passedTests: number;
        failedTests: number;
        pendingTests: number;
        complianceRate: number;
    };
    isLoading?: boolean;
}

const EmissionKeyStatsCards: React.FC<EmissionKeyStatsCardsProps> = ({
    data,
    isLoading = false
}) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 mb-6">
            <StatCard
                label="Total Vehicles"
                value={data.totalVehicles}
                Icon={Car}
                loading={isLoading}
            />
            <StatCard
                label="Government Offices"
                value={data.totalOffices}
                Icon={Building2}
                loading={isLoading}
            />
            <StatCard
                label="Passed Tests"
                value={data.passedTests}
                Icon={CheckCircle}
                loading={isLoading}
            />
            <StatCard
                label="Failed Tests"
                value={data.failedTests}
                Icon={XCircle}
                loading={isLoading}
            />
            <StatCard
                label="Pending Tests"
                value={data.pendingTests}
                Icon={Clock}
                loading={isLoading}
            />
            <StatCard
                label={`Compliance Rate (${currentYear})`}
                value={`${data.complianceRate}%`}
                Icon={BarChart3}
                loading={isLoading}
            />
        </div>
    );
};

export default EmissionKeyStatsCards;
