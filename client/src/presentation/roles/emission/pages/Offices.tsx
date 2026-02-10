import { useState, useCallback, useMemo } from "react";
import { Input } from "@/presentation/components/shared/ui/input";
import { Card } from "@/presentation/components/shared/ui/card";
import { StatCard } from "@/presentation/components/shared/StatCard";
import { Button } from "@/presentation/components/shared/ui/button";
import { Search, RefreshCw, FileSpreadsheet, Plus, Building2, CheckCircle2, BarChart3 } from "lucide-react";
import { YearSelector } from "@/presentation/roles/emission/components/offices/YearSelector";
import { OfficeComplianceTable } from "@/presentation/roles/emission/components/offices/OfficeComplianceTable";
import { OfficeModal } from "@/presentation/roles/emission/components/offices/OfficeModal";
import { useOffices, OfficeWithCompliance } from "@/core/hooks/offices/useOffices";
import { PERMISSIONS } from "@/core/utils/permissions";
import { useAuthStore } from "@/core/hooks/auth/useAuthStore";

export default function OfficesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<OfficeWithCompliance | null>(null);
  const canCreateOffice = useAuthStore((state) => state.hasPermission(PERMISSIONS.OFFICE.CREATE));
  const canUpdateOffice = useAuthStore((state) => state.hasPermission(PERMISSIONS.OFFICE.UPDATE));
  const canViewTests = useAuthStore((state) => state.hasPermission(PERMISSIONS.TEST.VIEW));
  const canViewVehicles = useAuthStore((state) => state.hasPermission(PERMISSIONS.VEHICLE.VIEW));

  const {
    officeData,
    isLoading,
    errorMessage,
    filters,
    handleFilterChange,
    refetch,
    summaryStats,
  } = useOffices();

  // Generate available years for the YearSelector (current year and 5 years back)
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - i);
  }, []);

  // Memoize handlers to prevent them from being recreated on every render
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFilterChange({ searchTerm: e.target.value });
    },
    [handleFilterChange]
  );

  const handleYearChange = useCallback(
    (yearStr: string) => {
      handleFilterChange({ year: parseInt(yearStr, 10) });
    },
    [handleFilterChange]
  );

  const handleQuarterChange = useCallback(
    (quarterStr: string) => {
      if (quarterStr === "all") {
        handleFilterChange({ quarter: undefined });
      } else {
        handleFilterChange({ quarter: parseInt(quarterStr, 10) });
      }
    },
    [handleFilterChange]
  );
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleAddOffice = useCallback(() => {
    if (!canCreateOffice) return;
    setEditingOffice(null);
    setIsModalOpen(true);
  }, [canCreateOffice]);

  const handleEditOffice = useCallback((office: OfficeWithCompliance) => {
    if (!canUpdateOffice) return;
    setEditingOffice(office);
    setIsModalOpen(true);
  }, [canUpdateOffice]);

  const handleModalSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
          
          {/* Header Section */}
          <div className="w-full flex flex-col flex-1 overflow-hidden">
            <div className="page-header-bg sticky top-0 z-10">
              <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
                <div className="shrink-0">
                  <h1 className="text-xl font-semibold tracking-tight">
                    Government Offices
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage and monitor compliance across all government agencies
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-none rounded-lg h-9 w-9 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 text-slate-600 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-none rounded-lg h-9 w-9 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-slate-600" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Body Section */}
            <div className="flex-1 overflow-y-auto page-bg">
              <div className="p-8">


                <div className="space-y-8 mt-0 outline-none">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    <StatCard
                      label="Total Offices"
                      value={summaryStats.totalOffices}
                      Icon={Building2}
                      colors={{
                        circleFill: "#0033a0",
                        labelBg: "#0033a0",
                        valueText: "#0033a0",
                      }}
                    />
                    <StatCard
                      label="Compliant Offices"
                      value={summaryStats.totalCompliant}
                      Icon={CheckCircle2}
                      colors={{
                        circleFill: "#0033a0",
                        labelBg: "#0033a0",
                        valueText: "#0033a0",
                      }}
                    />
                    <StatCard
                      label="Overall Compliance"
                      value={`${summaryStats.overallComplianceRate}%`}
                      Icon={BarChart3}
                      colors={{
                        circleFill: "#0033a0",
                        labelBg: "#0033a0",
                        valueText: "#0033a0",
                      }}
                    />
                  </div>

                  <Card className="border border-slate-200 dark:border-gray-700 shadow-none rounded-xl bg-white dark:bg-gray-900 overflow-hidden">
                    {/* Controls Row: Search left, Filters right */}
                    <div className="px-6 pt-6 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-gray-700">
                      {/* Search (left) */}
                      <div className="relative flex items-center w-full lg:w-96">
                        <Input
                          placeholder="Search offices by name or location..."
                          value={filters.searchTerm || ""}
                          onChange={handleSearchChange}
                          className="pl-9 bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg h-10 text-sm transition-all"
                        />
                        <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                      </div>
                      
                      {/* Filters (right) */}
                      <div className="flex flex-wrap gap-2 items-center lg:justify-end">
                        <YearSelector
                          selectedYear={filters.year ?? new Date().getFullYear()}
                          availableYears={availableYears}
                          onYearChange={handleYearChange}
                          selectedQuarter={filters.quarter}
                          onQuarterChange={handleQuarterChange}
                        />
                        {canCreateOffice && (
                          <Button
                            onClick={handleAddOffice}
                            className="bg-[#0033a0] hover:bg-[#002a80] text-white border-none shadow-none rounded-lg px-4 h-9 text-sm font-medium transition-colors"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Office
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      <OfficeComplianceTable
                        officeData={officeData}
                        errorMessage={errorMessage || undefined}
                        year={filters.year}
                        onEdit={canUpdateOffice ? handleEditOffice : undefined}
                        canEdit={canUpdateOffice}
                        canViewTests={canViewTests}
                        canViewVehicles={canViewVehicles}
                      />
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
      </div>

      {/* Office Modal */}
      {(canCreateOffice || canUpdateOffice) && (
        <OfficeModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          office={editingOffice}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
}
