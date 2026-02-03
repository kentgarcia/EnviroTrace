import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/presentation/components/shared/ui/button";
import { useOverviewData } from "./logic/useOverviewData";
import UGKeyStatsCards from "./components/UGKeyStatsCards";
import UGVisualDashboard from "./components/UGVisualDashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/shared/ui/select";

const QUARTERS = [
    { value: "all", label: "All Quarters" },
    { value: "Q1", label: "Q1 (Jan-Mar)" },
    { value: "Q2", label: "Q2 (Apr-Jun)" },
    { value: "Q3", label: "Q3 (Jul-Sep)" },
    { value: "Q4", label: "Q4 (Oct-Dec)" },
];

const getYearOptions = (): number[] => {
    const currentYear = new Date().getFullYear();
    return [0, 1, 2, 3, 4].map(i => currentYear - i);
};

export const UrbanGreeningOverview: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedQuarter, setSelectedQuarter] = useState("all");
    
    const {
        dashboardData,
        isLoading,
        hasError,
    } = useOverviewData(parseInt(selectedYear), selectedQuarter);

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["ug-dashboard-aggregated", parseInt(selectedYear), selectedQuarter] });
    };

    return (
        <div className="flex flex-col h-full bg-[#F9FBFC]">
            <div className="bg-white px-6 py-3 border-b border-gray-200 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-900">Urban Greening Dashboard</h1>
                        <div className="flex items-center gap-3">
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-[120px] h-9">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getYearOptions().map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                                <SelectTrigger className="w-[150px] h-9">
                                    <SelectValue placeholder="Quarter" />
                                </SelectTrigger>
                                <SelectContent>
                                    {QUARTERS.map((q) => (
                                        <SelectItem key={q.value} value={q.value}>
                                            {q.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className="border border-gray-200 bg-white shadow-none rounded-lg h-9 w-9 flex items-center justify-center hover:bg-slate-50 transition-colors"
                            >
                                <RefreshCw className={`h-4 w-4 text-slate-600 ${isLoading ? "animate-spin" : ""}`} />
                            </Button>
                            <div className="text-xs text-gray-500">Updated {new Date().toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-[#F9FBFC] space-y-6">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                            <p className="mt-2 text-gray-600">Loading dashboard...</p>
                        </div>
                    ) : hasError ? (
                        <div className="text-center py-12 text-red-600">
                            <p>Error loading dashboard data. Please try again.</p>
                        </div>
                    ) : (
                        <>
                            {/* Key Stats */}
                            <UGKeyStatsCards
                                statCards={dashboardData?.stat_cards}
                                loading={false}
                            />

                            {/* Visualized Dashboard */}
                            <UGVisualDashboard
                                selectedYear={parseInt(selectedYear)}
                                selectedQuarter={selectedQuarter}
                                feeMonthly={dashboardData?.fee_monthly?.map(m => ({ month: m.label.slice(0, 3), amount: m.total })) || []}
                                plantingTypeData={dashboardData?.planting_type_data || []}
                                speciesData={dashboardData?.species_data || []}
                                treeRequestTypeCounts={dashboardData?.tree_request_type_counts}
                                treeRequestStatusCounts={dashboardData?.tree_request_status_counts}
                                treeTypesBarPreset={dashboardData?.tree_types_bar}
                                ugMonthlyFromApi={dashboardData?.ug_monthly}
                                recentLoading={false}
                            />
                        </>
                    )}
                </div>
            </div>
    );
};
