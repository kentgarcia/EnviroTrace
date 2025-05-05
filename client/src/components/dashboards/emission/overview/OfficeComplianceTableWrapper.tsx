import React from 'react';
import { OfficeComplianceTable } from './OfficeComplianceTable';

// Define the interface that matches the actual component props
interface OfficeComplianceTableWrapperProps {
  complianceData: {
    officeName: string;
    vehicleCount: number;
    testedCount: number;
    passedCount: number;
    complianceRate: number;
  }[]; // Match the expected type for OfficeComplianceTable
  loading: boolean;
}

export function OfficeComplianceTableWrapper({ complianceData, loading }: OfficeComplianceTableWrapperProps) {
  return <OfficeComplianceTable complianceData={complianceData} />;
}
