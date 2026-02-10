import React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/presentation/components/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/presentation/components/shared/ui/dropdown-menu";

interface YearSelectorProps {
  selectedYear: number;
  availableYears: number[];
  onYearChange: (year: string) => void;
  selectedQuarter?: number;
  onQuarterChange: (quarter: string) => void;
}

export const YearSelector: React.FC<YearSelectorProps> = ({
  selectedYear,
  availableYears,
  onYearChange,
  selectedQuarter,
  onQuarterChange,
}) => {
  const getQuarterLabel = () => {
    if (!selectedQuarter) return "All Quarters";
    const quarterLabelMap: Record<number, string> = {
      1: "Q1 (Jan-Mar)",
      2: "Q2 (Apr-Jun)",
      3: "Q3 (Jul-Sep)",
      4: "Q4 (Oct-Dec)",
    };
    return quarterLabelMap[selectedQuarter] || `Q${selectedQuarter}`;
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
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

      {/* Quarter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-10 px-4 justify-between bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-700 shadow-none rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors min-w-[130px]"
          >
            <span className="truncate">{getQuarterLabel()}</span>
            <Filter className="ml-2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 p-1">
          <DropdownMenuItem 
            onClick={() => onQuarterChange("all")} 
            className="rounded-md cursor-pointer"
          >
            All Quarters
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onQuarterChange("1")} 
            className="rounded-md cursor-pointer"
          >
            Q1 (Jan-Mar)
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onQuarterChange("2")} 
            className="rounded-md cursor-pointer"
          >
            Q2 (Apr-Jun)
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onQuarterChange("3")} 
            className="rounded-md cursor-pointer"
          >
            Q3 (Jul-Sep)
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onQuarterChange("4")} 
            className="rounded-md cursor-pointer"
          >
            Q4 (Oct-Dec)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
