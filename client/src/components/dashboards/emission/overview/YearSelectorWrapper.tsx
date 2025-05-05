import React from 'react';
import { YearSelector } from './YearSelector';

interface YearSelectorWrapperProps {
  onYearChange: (year: number) => void;
  selectedYear: number;
  availableYears: number[];
}

export function YearSelectorWrapper({ onYearChange, selectedYear, availableYears }: YearSelectorWrapperProps) {
  return <YearSelector
    onYearChange={(year) => onYearChange(parseInt(year, 10))}
    selectedYear={selectedYear}
    availableYears={availableYears}
  />;
}
