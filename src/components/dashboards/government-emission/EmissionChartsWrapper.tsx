
import React from 'react';
import { EmissionCharts } from './EmissionCharts';

interface EmissionChartsWrapperProps {
  quarterlyData: any[];
}

export function EmissionChartsWrapper({ quarterlyData }: EmissionChartsWrapperProps) {
  return <EmissionCharts quarterlyData={quarterlyData} />;
}
