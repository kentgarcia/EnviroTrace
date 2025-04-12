
import React from 'react';
import { EmissionHistoryTrend } from './EmissionHistoryTrend';

interface EmissionHistoryTrendWrapperProps {
  historyData: any[];
}

export function EmissionHistoryTrendWrapper({ historyData }: EmissionHistoryTrendWrapperProps) {
  return <EmissionHistoryTrend historyData={historyData} />;
}
