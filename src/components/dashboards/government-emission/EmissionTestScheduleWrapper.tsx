import React from 'react';
import { EmissionTestSchedule } from './EmissionTestSchedule';

interface EmissionTestScheduleWrapperProps {
  selectedYear: number;
  selectedQuarter?: number;
}

export function EmissionTestScheduleWrapper({ selectedYear, selectedQuarter }: EmissionTestScheduleWrapperProps) {
  return <EmissionTestSchedule selectedYear={selectedYear} selectedQuarter={selectedQuarter} />;
}
