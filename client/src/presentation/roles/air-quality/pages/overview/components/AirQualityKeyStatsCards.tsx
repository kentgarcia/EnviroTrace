import React from "react";
import StatCard from "@/presentation/components/shared/StatCard";
import { AlertTriangle, Car, Users, Banknote, ClipboardCheck, Clock } from "lucide-react";

interface AirQualityKeyStatsCardsProps {
    feeData: {
        totalFees: number;
        pendingPayments: number;
        recentViolations: number;
        totalViolations: number;
        totalRecords: number;
        totalDrivers: number;
    };
    isLoading?: boolean;
}

const AirQualityKeyStatsCards: React.FC<AirQualityKeyStatsCardsProps> = ({
    feeData,
    isLoading = false
}) => {
    const currentDate = new Date();
    const currentMonthName = currentDate.toLocaleDateString('en-US', { month: 'short' });
    const currentYear = currentDate.getFullYear();

    // Format currency
    const formatCurrency = (amount: number) => {
        return `₱${amount.toLocaleString()}`;
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 mb-6">
            <StatCard
                label="Total Violations"
                value={feeData.totalViolations}
                Icon={AlertTriangle}
                loading={isLoading}
            />
            <StatCard
                label="Vehicle Records"
                value={feeData.totalRecords}
                Icon={Car}
                loading={isLoading}
            />
            <StatCard
                label="Registered Drivers"
                value={feeData.totalDrivers}
                Icon={Users}
                loading={isLoading}
            />
            <StatCard
                label={`Fees Collected (${currentYear})`}
                value={formatCurrency(feeData.totalFees)}
                Icon={Banknote}
                loading={isLoading}
            />
            <StatCard
                label={`Recent Violations (${currentMonthName})`}
                value={feeData.recentViolations}
                Icon={ClipboardCheck}
                loading={isLoading}
            />
            <StatCard
                label="Pending Payments"
                value={feeData.pendingPayments}
                Icon={Clock}
                loading={isLoading}
            />
        </div>
    );
};

export default AirQualityKeyStatsCards;
