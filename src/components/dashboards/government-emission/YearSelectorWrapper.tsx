import React from 'react';
import { YearSelector } from './YearSelector';

interface YearSelectorWrapperProps {
  onYearChange: (year: any) => void;
  selectedYear: number;
  availableYears: number[];
}

export function YearSelectorWrapper({ onYearChange, selectedYear, availableYears }: YearSelectorWrapperProps) {
  return <YearSelector 
    onYearChange={onYearChange} 
    selectedYear={selectedYear} 
    availableYears={availableYears}
  />;
}
