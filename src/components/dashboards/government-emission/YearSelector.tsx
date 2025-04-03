
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface YearSelectorProps {
  selectedYear: number;
  availableYears: number[];
  onYearChange: (year: string) => void;
}

export function YearSelector({ 
  selectedYear, 
  availableYears, 
  onYearChange 
}: YearSelectorProps) {
  return (
    <Select value={selectedYear.toString()} onValueChange={onYearChange}>
      <SelectTrigger className="w-[180px]">
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
  );
}
