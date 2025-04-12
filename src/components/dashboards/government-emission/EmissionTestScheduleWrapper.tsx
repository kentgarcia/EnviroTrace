
import React from 'react';
import { EmissionTestSchedule } from './EmissionTestSchedule';

interface EmissionTestScheduleWrapperProps {
  schedules: any[];
}

export function EmissionTestScheduleWrapper({ schedules }: EmissionTestScheduleWrapperProps) {
  return <EmissionTestSchedule schedules={schedules} />;
}
