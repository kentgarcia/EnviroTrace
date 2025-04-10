
import { useState, useEffect } from 'react';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export const PwaBanner = () => {
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();
  const [showBanner, setShowBanner] = useState(false);
  const navigate = useNavigate();
  
  // Show banner after a short delay to avoid showing on page load, but only if it's installable
  useEffect(() => {
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        // Check if user has previously dismissed the banner
        const dismissed = localStorage.getItem('pwa-banner-dismissed');
        if (!dismissed) {
          setShowBanner(true);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);
  
  const handleClose = () => {
    setShowBanner(false);
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-banner-dismissed', new Date().toString());
    setTimeout(() => {
      localStorage.removeItem('pwa-banner-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };
  
  const handleInstall = async () => {
    if (isInstallable) {
      await promptInstall();
      setShowBanner(false);
    } else {
      navigate('/install-pwa');
      setShowBanner(false);
    }
  };
  
  if (!showBanner || isInstalled) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="p-2 rounded-lg bg-primary shadow-lg sm:p-3">
          <div className="flex items-center justify-between flex-wrap">
            <div className="w-0 flex-1 flex items-center">
              <span className="flex p-2 rounded-lg bg-primary-foreground/20">
                <Download className="h-6 w-6 text-white" aria-hidden="true" />
              </span>
              <p className="ml-3 font-medium text-white truncate">
                <span className="md:hidden">Install this app on your device!</span>
                <span className="hidden md:inline">Install Eco-Dash Navigator as an app for faster access and offline capabilities</span>
              </p>
            </div>
            <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
              <Button 
                onClick={handleInstall}
                className="flex items-center justify-center bg-white text-primary hover:bg-gray-100 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium"
              >
                Install App
              </Button>
            </div>
            <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
              <button
                type="button"
                onClick={handleClose}
                className="-mr-1 flex p-2 rounded-md hover:bg-primary-foreground/20 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
