
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { useNavigate } from 'react-router-dom';

export const InstallPwaButton = () => {
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();
  const navigate = useNavigate();

  if (isInstalled) {
    return null; // Don't show any button if already installed
  }

  const handleInstall = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isInstallable) {
      // If we can prompt directly, do it
      const success = await promptInstall();
      if (!success) {
        // If user dismisses the prompt, navigate to the install page for more info
        navigate('/install-pwa');
      }
    } else {
      // If we can't prompt (iOS or other limitations), navigate to the install page
      navigate('/install-pwa');
    }
  };

  return (
    <Button 
      onClick={handleInstall}
      variant="outline" 
      size="sm"
      className="w-full mt-2 bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary"
    >
      <Download className="mr-2 h-4 w-4" />
      Install App
    </Button>
  );
};
