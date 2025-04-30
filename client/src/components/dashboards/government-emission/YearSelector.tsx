
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface YearSelectorProps {
  selectedYear: number;
  selectedQuarter?: number | "All";
  availableYears: number[];
  onYearChange: (year: string) => void;
  onQuarterChange?: (quarter: string) => void;
  showQuarters?: boolean;
}

export function YearSelector({
  selectedYear,
  selectedQuarter = "All", 
  availableYears,
  onYearChange,
  onQuarterChange,
  showQuarters = false
}: YearSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Year:</span>
        <Select value={selectedYear.toString()} onValueChange={onYearChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select year" />
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

      {showQuarters && onQuarterChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Quarter:</span>
          <Select 
            value={selectedQuarter.toString()} 
            onValueChange={onQuarterChange}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select quarter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Quarters</SelectItem>
              <SelectItem value="1">Q1</SelectItem>
              <SelectItem value="2">Q2</SelectItem>
              <SelectItem value="3">Q3</SelectItem>
              <SelectItem value="4">Q4</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
