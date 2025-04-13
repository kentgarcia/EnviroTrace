
import React from 'react';
import { useElectron } from '@/hooks/useElectron';
import { Badge } from '@/components/ui/badge';

export function ElectronInfo() {
  const { isElectron, appVersion } = useElectron();

  if (!isElectron) return null;

  return (
    <div className="fixed bottom-4 right-4 flex items-center space-x-2 bg-background/80 backdrop-blur-sm p-2 rounded-md shadow-sm border">
      <Badge variant="outline">Desktop App v{appVersion || '?.?.?'}</Badge>
    </div>
  );
}
