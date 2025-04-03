
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface YearSelectorProps {
  selectedYear: number;
  selectedQuarter?: number;
  availableYears: number[];
  onYearChange: (year: string) => void;
  onQuarterChange?: (quarter: string) => void;
  showQuarters?: boolean;
}

export function YearSelector({ 
  selectedYear,
  selectedQuarter,
  availableYears, 
  onYearChange,
  onQuarterChange,
  showQuarters = false
}: YearSelectorProps) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
        <div className="space-y-2">
          <Label htmlFor="year-select">Year</Label>
          <Select value={selectedYear.toString()} onValueChange={onYearChange}>
            <SelectTrigger id="year-select" className="w-[140px]">
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
        
        {showQuarters && onQuarterChange && (
          <div className="space-y-2">
            <Label htmlFor="quarter-select">Quarter</Label>
            <Select 
              value={selectedQuarter?.toString() || ""}
              onValueChange={onQuarterChange}
            >
              <SelectTrigger id="quarter-select" className="w-[140px]">
                <SelectValue placeholder="Select Quarter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Q1</SelectItem>
                <SelectItem value="2">Q2</SelectItem>
                <SelectItem value="3">Q3</SelectItem>
                <SelectItem value="4">Q4</SelectItem>
                <SelectItem value="">All Quarters</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
