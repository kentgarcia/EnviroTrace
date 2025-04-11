
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export const NetworkStatus = () => {
  const { isOnline, isSyncing } = useOfflineSync();
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Show banner when offline or syncing
    if (!isOnline || isSyncing) {
      setVisible(true);
    } else {
      // Add delay before hiding to allow for animation
      const timer = setTimeout(() => {
        setVisible(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, isSyncing]);

  // Only render if visible or in transitioning state
  if (!visible && isOnline && !isSyncing) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 w-full z-50 transition-all duration-300 flex items-center justify-center py-2 font-medium text-center",
      isOnline && !isSyncing ? "translate-y-[-100%]" : "translate-y-0",
      isOnline && isSyncing ? "bg-amber-500 text-amber-950" : "bg-red-500 text-white"
    )}>
      {isSyncing ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Syncing data...</span>
        </div>
      ) : !isOnline ? (
        <div className="flex items-center gap-2">
          <WifiOff className="h-4 w-4" />
          <span>You're offline – some features may not work</span>
        </div>
      ) : null}
    </div>
  );
};
