import React from 'react';
import { YearSelector } from './YearSelector';

interface YearSelectorWrapperProps {
  onYearChange: (year: any) => void;
  selectedYear: number;
  availableYears: number[];
  selectedQuarter?: number | "All";
  onQuarterChange?: (quarter: string) => void;
  showQuarters?: boolean;
}

export function YearSelectorWrapper({ onYearChange, selectedYear, availableYears, selectedQuarter = "All", onQuarterChange, showQuarters = false }: YearSelectorWrapperProps) {
  return <YearSelector 
    onYearChange={onYearChange} 
    selectedYear={selectedYear} 
    availableYears={availableYears}
    selectedQuarter={selectedQuarter}
    onQuarterChange={onQuarterChange}
    showQuarters={showQuarters}
  />;
}
