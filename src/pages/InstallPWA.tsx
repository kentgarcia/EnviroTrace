
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Laptop, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the app is installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.matchMedia('(display-mode: fullscreen)').matches || 
        (window.navigator as any).standalone === true) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      // App is installed, update UI
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('App was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('Install button clicked'); // Debug log

    if (!deferredPrompt) {
      console.log('Installation prompt not available');
      return;
    }

    // Show the installation prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setDeferredPrompt(null);
    } else {
      console.log('User dismissed the install prompt');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Install Eco-Dash Navigator</h1>
        <p className="text-muted-foreground">
          Access your environmental data anytime, even without an internet connection
        </p>
      </div>

      <Card className="w-full shadow-lg border-primary/20">
        <CardHeader className="bg-gradient-to-r from-ems-green-500 to-ems-blue-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Download className="h-8 w-8" />
            Install Our App
          </CardTitle>
          <CardDescription className="text-white/80">
            Turn Eco-Dash into an app on your device
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 px-6">
          {isInstalled ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-ems-green-100 p-4 rounded-full mb-4">
                <Check className="h-12 w-12 text-ems-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">App Successfully Installed!</h3>
              <p className="mb-4 text-muted-foreground">
                You've already installed Eco-Dash Navigator as an app on your device.
              </p>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Return to Dashboard
              </Button>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">What is a Progressive Web App (PWA)?</h3>
                <p className="text-muted-foreground mb-4">
                  A Progressive Web App gives you an app-like experience with the convenience of not having to download from an app store. Install Eco-Dash Navigator directly to your home screen for quick access!
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-muted p-4 rounded-lg flex flex-col items-center text-center">
                  <Smartphone className="h-10 w-10 mb-2 text-ems-green-600" />
                  <h4 className="text-lg font-medium mb-1">Mobile Experience</h4>
                  <p className="text-sm text-muted-foreground">
                    Access from your phone's home screen without taking up much storage
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg flex flex-col items-center text-center">
                  <Laptop className="h-10 w-10 mb-2 text-ems-blue-600" />
                  <h4 className="text-lg font-medium mb-1">Desktop App</h4>
                  <p className="text-sm text-muted-foreground">
                    Use as a standalone app on your computer for a focused experience
                  </p>
                </div>
              </div>

              <div className="bg-accent p-4 rounded-md mb-6">
                <h3 className="text-lg font-medium mb-2">Key Benefits:</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Work offline when internet connection is unavailable</li>
                  <li>Faster loading times and performance</li>
                  <li>Receive important notifications (coming soon)</li>
                  <li>Seamless experience across all your devices</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-lg">
          {!isInstalled && (
            <>
              <p className="text-sm text-muted-foreground text-center sm:text-left">
                {deferredPrompt ? 
                  "Click the button to install Eco-Dash Navigator on your device." : 
                  "For iOS: Tap the share button and select 'Add to Home Screen'"}
              </p>
              <Button 
                className="px-6 gap-2 w-full sm:w-auto"
                onClick={handleInstallClick}
                disabled={false}
              >
                <Download className="h-4 w-4" />
                Install App
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default InstallPWA;
