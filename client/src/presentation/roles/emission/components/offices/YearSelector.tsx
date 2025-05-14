import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/shared/ui/select";
import { Label } from "@/presentation/components/shared/ui/label";

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
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="grid gap-1.5">
        <Label htmlFor="year">Year</Label>
        <Select value={selectedYear.toString()} onValueChange={onYearChange}>
          <SelectTrigger id="year" className="w-32">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="quarter">Quarter</Label>
        <Select
          value={selectedQuarter?.toString() || "all"}
          onValueChange={onQuarterChange}
        >
          <SelectTrigger id="quarter" className="w-32">
            <SelectValue placeholder="Select Quarter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Quarters</SelectItem>
            <SelectItem value="1">Q1</SelectItem>
            <SelectItem value="2">Q2</SelectItem>
            <SelectItem value="3">Q3</SelectItem>
            <SelectItem value="4">Q4</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
