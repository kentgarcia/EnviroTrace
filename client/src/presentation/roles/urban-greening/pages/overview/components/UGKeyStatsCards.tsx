import React from "react";
import { useQuery } from "@tanstack/react-query";
import StatCard from "@/presentation/components/shared/StatCard";
import { Banknote, CreditCard, ClipboardList, Leaf } from "lucide-react";
import { fetchSaplingRequests } from "@/core/api/sapling-requests-api";
import { fetchUrbanGreeningPlantings } from "@/core/api/planting-api";

interface UGKeyStatsCardsProps {
    feeData: { totalFees: number; monthlyFees: Array<{ month: string; amount: number }> };
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

// Helper function to format currency
const formatCurrency = (amount: number): string => {
    return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
};

export const UGKeyStatsCards: React.FC<UGKeyStatsCardsProps> = ({ feeData }) => {
    const now = new Date();
    const currentMonthIdx = now.getMonth();
    const currentMonthName = monthNames[currentMonthIdx];
    const currentYear = now.getFullYear();

    const { data: saplingRequests, isLoading: saplingLoading } = useQuery({
        queryKey: ["sapling-requests-overview", currentYear],
        queryFn: () => fetchSaplingRequests(currentYear),
        staleTime: 5 * 60 * 1000,
    });

    const { data: ugPlantings, isLoading: ugLoading } = useQuery({
        queryKey: ["ug-plantings-overview", currentYear],
        queryFn: () => fetchUrbanGreeningPlantings({ limit: 10000 }),
        staleTime: 5 * 60 * 1000,
    });

    const saplingThisMonth = (saplingRequests || []).filter((r: any) => {
        const d = new Date(r.date_received);
        return d.getMonth() === currentMonthIdx;
    }).reduce((sum, r: any) => sum + (Number(r.total_qty) || 0), 0);

    const ugThisMonth = (ugPlantings || []).filter((p: any) => {
        const d = new Date(p.planting_date);
        return d.getMonth() === currentMonthIdx;
    }).reduce((sum, p: any) => sum + (Number(p.quantity_planted) || 0), 0);

    const feesThisYear = feeData?.totalFees || 0; // Treat tracked total as current year aggregate
    const feesThisMonth = feeData?.monthlyFees?.find((m) => m.month === currentMonthName)?.amount || 0;

    const loading = saplingLoading || ugLoading;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            <StatCard label={`Fees Collected (${currentYear})`} value={formatCurrency(feesThisYear)} Icon={Banknote} loading={false} />
            <StatCard label={`Fees Collected (${currentMonthName})`} value={formatCurrency(feesThisMonth)} Icon={CreditCard} loading={false} />
            <StatCard label={`Sapling Requests (${currentMonthName})`} value={saplingThisMonth} Icon={ClipboardList} loading={loading} />
            <StatCard label={`Urban Greening (${currentMonthName})`} value={ugThisMonth} Icon={Leaf} loading={loading} />
        </div>
    );
};

export default UGKeyStatsCards;
