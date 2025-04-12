
import React from 'react';
import { YearSelector } from './YearSelector';

interface YearSelectorWrapperProps {
  onYearChange: (year: any) => void;
  selectedYear: number;
}

export function YearSelectorWrapper({ onYearChange, selectedYear }: YearSelectorWrapperProps) {
  return <YearSelector onYearChange={onYearChange} selectedYear={selectedYear} />;
}
