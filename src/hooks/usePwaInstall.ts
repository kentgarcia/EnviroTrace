
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePwaInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    console.log('Checking PWA installability'); // Debug log
  
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.matchMedia('(display-mode: fullscreen)').matches || 
        (window.navigator as any).standalone === true) {
      console.log('App is already installed'); // Debug log
      setIsInstalled(true);
    }
  
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired'); // Debug log
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
  
    const handleAppInstalled = () => {
      console.log('App was installed'); // Debug log
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
  
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
  
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.log('Installation prompt not available');
      return false;
    }

    // Show the installation prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
    
    return choiceResult.outcome === 'accepted';
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    promptInstall
  };
};
