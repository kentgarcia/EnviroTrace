import React from "react";
import { Search, Filter, X, Check } from "lucide-react";
import { Input } from "@/presentation/components/shared/ui/input";
import { Button } from "@/presentation/components/shared/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/presentation/components/shared/ui/dropdown-menu";
import { Office } from "@/core/api/emission-service";
import { cn } from "@/core/utils/utils";

interface QuarterlyTestingFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    selectedYear: number;
    availableYears: number[];
    onYearChange: (year: string) => void;
    selectedOffices: string[];
    offices: Office[];
    onOfficeChange: (officeIds: string[]) => void;
    compact?: boolean;
}

export const QuarterlyTestingFilters: React.FC<QuarterlyTestingFiltersProps> = ({
    search,
    onSearchChange,
    selectedYear,
    availableYears,
    onYearChange,
    selectedOffices,
    offices,
    onOfficeChange,
    compact = false,
}) => {
    const hasFilters = search || selectedOffices.length > 0 && !selectedOffices.includes("all");
    
    const clearFilters = () => {
        onSearchChange("");
        onOfficeChange(["all"]);
    };

    const getOfficeLabel = () => {
        if (selectedOffices.includes("all") || selectedOffices.length === 0) {
            return "All Offices";
        }
        if (selectedOffices.length === 1) {
            const office = offices.find(o => o.id === selectedOffices[0]);
            return office?.name || "1 Office";
        }
        // Show first office name + count
        const firstOffice = offices.find(o => o.id === selectedOffices[0]);
        return `${firstOffice?.name || "Office"} +${selectedOffices.length - 1}`;
    };

    const isOfficeSelected = (officeId: string) => {
        if (officeId === "all") {
            return selectedOffices.includes("all") || selectedOffices.length === 0;
        }
        return selectedOffices.includes(officeId);
    };

    const handleOfficeSelect = (officeId: string) => {
        if (officeId === "all") {
            onOfficeChange(["all"]);
        } else {
            const newSelection = selectedOffices.includes("all") 
                ? [officeId]
                : selectedOffices.includes(officeId)
                    ? selectedOffices.filter(id => id !== officeId)
                    : [...selectedOffices, officeId];
            
            if (newSelection.length === 0) {
                onOfficeChange(["all"]);
            } else {
                onOfficeChange(newSelection);
            }
        }
    };

    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search (left) */}
            <div className="relative flex items-center w-full lg:w-96">
                <Input
                    placeholder="Search by plate, driver, or office..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-700 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg h-10 text-sm transition-all"
                />
                <Search className="absolute left-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                {search && (
                    <button
                        onClick={() => onSearchChange("")}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Filters (right) */}
            <div className="flex flex-wrap gap-2 items-center lg:justify-end">
                {hasFilters && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFilters}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-gray-100 text-xs font-medium h-8 px-2"
                    >
                        Clear all
                    </Button>
                )}

                {/* Year Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-10 px-4 justify-between bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-700 shadow-none rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors min-w-[110px]"
                        >
                            <span className="truncate">{selectedYear}</span>
                            <Filter className="ml-2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 p-1">
                        {availableYears.map((year) => (
                            <DropdownMenuItem 
                                key={year} 
                                onClick={() => onYearChange(year.toString())} 
                                className="rounded-md cursor-pointer"
                            >
                                {year}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Offices Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-10 px-4 justify-between bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-700 shadow-none rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors min-w-[180px]"
                        >
                            <span className="truncate">{getOfficeLabel()}</span>
                            <Filter className="ml-2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-1 max-h-[300px] overflow-y-auto">
                        <DropdownMenuItem 
                            onClick={() => handleOfficeSelect("all")} 
                            className="rounded-md cursor-pointer flex items-center justify-between"
                        >
                            <span>All Offices</span>
                            {isOfficeSelected("all") && (
                                <Check className="h-4 w-4 text-[#0033a0]" />
                            )}
                        </DropdownMenuItem>
                        {offices.map((office) => (
                            <DropdownMenuItem 
                                key={office.id} 
                                onClick={() => handleOfficeSelect(office.id)} 
                                className={cn(
                                    "rounded-md cursor-pointer flex items-center justify-between",
                                    isOfficeSelected(office.id) && "bg-blue-50 dark:bg-blue-900/30"
                                )}
                            >
                                <span className="truncate">{office.name}</span>
                                {isOfficeSelected(office.id) && (
                                    <Check className="h-4 w-4 text-[#0033a0] flex-shrink-0 ml-2" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
