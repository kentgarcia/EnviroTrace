
import { useState, useEffect } from 'react';

// Define the type for the Electron API
interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  // Add more API methods as needed
}

// Declare the window with Electron API
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export function useElectron() {
  const [isElectron, setIsElectron] = useState<boolean>(false);
  const [appVersion, setAppVersion] = useState<string | null>(null);

  useEffect(() => {
    // Check if running in Electron
    const isRunningInElectron = window.electronAPI !== undefined;
    setIsElectron(isRunningInElectron);

    // Get app version if running in Electron
    if (isRunningInElectron && window.electronAPI) {
      window.electronAPI.getAppVersion()
        .then(version => setAppVersion(version))
        .catch(err => console.error('Failed to get app version:', err));
    }
  }, []);

  return {
    isElectron,
    appVersion,
    electronAPI: window.electronAPI
  };
}
