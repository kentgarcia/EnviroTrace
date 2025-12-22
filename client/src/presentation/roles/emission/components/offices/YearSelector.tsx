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
    return `Q${selectedQuarter}`;
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Year Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-10 px-4 justify-between bg-white border-slate-200 shadow-none rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors min-w-[110px]"
          >
            <span className="truncate">{selectedYear}</span>
            <Filter className="ml-2 h-3.5 w-3.5 text-slate-400" />
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
            className="h-10 px-4 justify-between bg-white border-slate-200 shadow-none rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors min-w-[130px]"
          >
            <span className="truncate">{getQuarterLabel()}</span>
            <Filter className="ml-2 h-3.5 w-3.5 text-slate-400" />
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
            Q1
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onQuarterChange("2")} 
            className="rounded-md cursor-pointer"
          >
            Q2
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onQuarterChange("3")} 
            className="rounded-md cursor-pointer"
          >
            Q3
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onQuarterChange("4")} 
            className="rounded-md cursor-pointer"
          >
            Q4
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
