/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { RecentTestsTable } from './RecentTestsTable';

interface RecentTestsTableWrapperProps {
  recentTests: any[];
}

export function RecentTestsTableWrapper({ recentTests }: RecentTestsTableWrapperProps) {
  return <RecentTestsTable recentTests={recentTests} />;
}
