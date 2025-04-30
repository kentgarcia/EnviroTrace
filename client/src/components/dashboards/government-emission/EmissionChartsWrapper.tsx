import React from 'react';
import { EmissionCharts } from './EmissionCharts';

interface EmissionChartsWrapperProps {
  quarterlyData: Array<{
    name: string;
    passed: number;
    failed: number;
    total: number;
  }>;
  engineTypeData: Array<{
    name: string;
    value: number;
  }>;
  wheelCountData: Array<{
    count: number;
    wheelCount: number;
  }>;
  selectedYear: number;
}

export function EmissionChartsWrapper({ 
  quarterlyData, 
  engineTypeData, 
  wheelCountData, 
  selectedYear 
}: EmissionChartsWrapperProps) {
  return (
    <EmissionCharts 
      quarterStats={quarterlyData} 
      engineTypeData={engineTypeData} 
      wheelCountData={wheelCountData} 
      selectedYear={selectedYear} 
    />
  );
}
