
import React from 'react';
import { OfficeComplianceTable } from './OfficeComplianceTable';

// Define the interface that matches the actual component props
interface OfficeComplianceTableWrapperProps {
  offices: any[]; // Using any[] to avoid type conflicts
  loading: boolean;
}

export function OfficeComplianceTableWrapper({ offices, loading }: OfficeComplianceTableWrapperProps) {
  return <OfficeComplianceTable offices={offices} loading={loading} />;
}
