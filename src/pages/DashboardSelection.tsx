
// This is a read-only file, so we'll create a component to wrap it instead
import React from 'react';
import { InstallPwaButton } from '@/components/layout/InstallPwaButton';
import DashboardSelection from './DashboardSelection.original';

const DashboardSelectionWrapper = () => {
  return (
    <div className="relative">
      <DashboardSelection />
      <div className="fixed bottom-4 right-4 z-50">
        <InstallPwaButton />
      </div>
    </div>
  );
};

export default DashboardSelectionWrapper;
