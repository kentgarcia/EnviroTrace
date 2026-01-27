import React from "react";
import StatCard from "@/presentation/components/shared/StatCard";
import { Banknote, CreditCard, ClipboardList, Leaf } from "lucide-react";
import type { StatCardData } from "@/core/api/dashboard-api";

interface UGKeyStatsCardsProps {
    statCards?: StatCardData;
    loading?: boolean;
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

// Helper function to format currency
const formatCurrency = (amount: number): string => {
    return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
};

export const UGKeyStatsCards: React.FC<UGKeyStatsCardsProps> = ({ statCards, loading = false }) => {
    const now = new Date();
    const currentMonthIdx = now.getMonth();
    const currentMonthName = monthNames[currentMonthIdx];
    const currentYear = now.getFullYear();

    const feesThisYear = statCards?.fees_yearly_total || 0;
    const feesThisMonth = statCards?.fees_monthly_total || 0;
    const saplingThisMonth = statCards?.sapling_requests_monthly_total || 0;
    const ugThisMonth = statCards?.urban_greening_monthly_total || 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            <StatCard label={`Fees Collected (${currentYear})`} value={formatCurrency(feesThisYear)} Icon={Banknote} loading={loading} />
            <StatCard label={`Fees Collected (${currentMonthName})`} value={formatCurrency(feesThisMonth)} Icon={CreditCard} loading={loading} />
            <StatCard label={`Sapling Requests (${currentMonthName})`} value={saplingThisMonth} Icon={ClipboardList} loading={loading} />
            <StatCard label={`Urban Greening (${currentMonthName})`} value={ugThisMonth} Icon={Leaf} loading={loading} />
        </div>
    );
};

export default UGKeyStatsCards;
