
import React from 'react';
import { EmissionStatCards } from './EmissionStatCards';

// Define props that match the actual component
interface EmissionStatCardsWrapperProps {
  totalVehicles: any;
  testedVehicles: any;
  complianceRate: any;
  failRate: any;
}

export function EmissionStatCardsWrapper({ totalVehicles, testedVehicles, complianceRate, failRate }: EmissionStatCardsWrapperProps) {
  return (
    <EmissionStatCards 
      totalVehicles={totalVehicles}
      testedVehicles={testedVehicles}
      complianceRate={complianceRate}
      failRate={failRate}
    />
  );
}
