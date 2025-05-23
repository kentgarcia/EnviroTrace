import React, { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";

export const NetworkStatus: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        // Event listeners for online/offline status
        const handleOnline = () => {
            setIsOnline(true);
            toast.success("You are back online. Data will sync automatically.");
        };

        const handleOffline = () => {
            setIsOnline(false);
            toast.error(
                "You are offline. Changes will be saved locally and synced when you reconnect.",
                {
                    duration: 5000,
                }
            );
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Cleanup
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Only show the offline notification
    if (isOnline) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-red-100 text-red-800 px-3 py-2 rounded-md shadow-md flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Offline Mode</span>
        </div>
    );
};

export default NetworkStatus;
