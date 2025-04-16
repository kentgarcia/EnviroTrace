import React from 'react';
import { EmissionStatCards } from './EmissionStatCards';

// Define props that match the actual component
interface EmissionStatCardsWrapperProps {
  totalVehicles: number;
  testedVehicles: number;
  passRate: number;
  officeDepartments: number;
  subtitle?: string;
}

export function EmissionStatCardsWrapper({ totalVehicles, testedVehicles, passRate, officeDepartments, subtitle }: EmissionStatCardsWrapperProps) {
  return (
    <EmissionStatCards 
      totalVehicles={totalVehicles}
      testedVehicles={testedVehicles}
      passRate={passRate}
      officeDepartments={officeDepartments}
      subtitle={subtitle}
    />
  );
}
