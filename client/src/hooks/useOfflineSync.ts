import { useState, useEffect } from "react";
import { UserRole } from "@/integrations/types/userData";
import { useAuthStore } from "./useAuthStore";

interface CachedData<T> {
  data: T;
  timestamp: number;
}

// Custom hook for managing offline data synchronization
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingRequests, setPendingRequests] = useState<
    Array<{ url: string; method: string; body?: any }>
  >([]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log("App is online");
      setIsOnline(true);
      syncPendingRequests();
    };

    const handleOffline = () => {
      console.log("App is offline");
      setIsOnline(false);
    };

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "ONLINE_STATUS_CHANGE") {
        setIsOnline(event.data.payload.isOnline);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    navigator.serviceWorker.addEventListener(
      "message",
      handleServiceWorkerMessage
    );

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      navigator.serviceWorker.removeEventListener(
        "message",
        handleServiceWorkerMessage
      );
    };
  }, []);

  // Synchronize pending requests when we go back online
  const syncPendingRequests = async () => {
    if (!isOnline || pendingRequests.length === 0) return;

    setIsSyncing(true);

    const requestsCopy = [...pendingRequests];
    setPendingRequests([]);

    // Process each pending request
    try {
      await Promise.all(
        requestsCopy.map(async (req) => {
          try {
            const response = await fetch(req.url, {
              method: req.method,
              headers: {
                "Content-Type": "application/json",
              },
              body: req.body ? JSON.stringify(req.body) : undefined,
            });
            return response.ok;
          } catch (error) {
            console.error("Failed to sync request:", error);
            // Re-add failed requests to the queue
            setPendingRequests((prev) => [...prev, req]);
            return false;
          }
        })
      );
    } finally {
      setIsSyncing(false);
    }
  };

  // Add request to pending queue when offline
  const addPendingRequest = (url: string, method: string, body?: any) => {
    setPendingRequests((prev) => [...prev, { url, method, body }]);
  };

  // Get cached user roles from Zustand store
  const getCachedUserRoles = (): UserRole[] | null => {
    const roles = useAuthStore.getState().roles;
    return roles && roles.length > 0 ? roles : null;
  };

  // Wrapper for Supabase API calls that handles offline scenarios
  const safeSupabaseQuery = async <T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    cacheKey: string,
    expiryTimeMs = 24 * 60 * 60 * 1000 // 24 hours default
  ): Promise<{ data: T | null; error: any; fromCache: boolean }> => {
    // Try to get from cache first
    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData) as CachedData<T>;

        // If we're offline or data is fresh, use cache
        const isFresh = Date.now() - parsed.timestamp < expiryTimeMs;
        if (!isOnline || isFresh) {
          return { data: parsed.data, error: null, fromCache: true };
        }
      }
    } catch (error) {
      console.error(`Error reading from cache (${cacheKey}):`, error);
    }

    // If we're offline and have no cache, return empty data
    if (!isOnline) {
      return {
        data: null,
        error: new Error("Offline and no cached data available"),
        fromCache: false,
      };
    }

    // Fetch from network
    try {
      const result = await queryFn();

      // Cache successful responses
      if (result.data && !result.error) {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: result.data,
            timestamp: Date.now(),
          })
        );
      }

      return { ...result, fromCache: false };
    } catch (error) {
      console.error("API request failed:", error);
      return { data: null, error, fromCache: false };
    }
  };

  return {
    isOnline,
    isSyncing,
    pendingRequests,
    addPendingRequest,
    syncPendingRequests,
    getCachedUserRoles,
    safeSupabaseQuery,
  };
}
