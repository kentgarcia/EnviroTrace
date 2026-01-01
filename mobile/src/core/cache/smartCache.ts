import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Network from "expo-network";

const CACHE_PREFIX = "app_cache_";
const CACHE_METADATA_KEY = "cache_metadata";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheMetadata {
  [key: string]: {
    lastUpdated: number;
    expiresAt: number;
  };
}

interface CacheOptions {
  /** Time in milliseconds before data is considered stale (default: 5 minutes) */
  staleTime?: number;
  /** Time in milliseconds before cached data expires completely (default: 24 hours) */
  maxAge?: number;
  /** Whether to return stale data while revalidating (default: true) */
  staleWhileRevalidate?: boolean;
}

const DEFAULT_OPTIONS: Required<CacheOptions> = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  staleWhileRevalidate: true,
};

/**
 * Smart caching utility that:
 * - Persists data to AsyncStorage
 * - Returns cached data immediately if available
 * - Automatically refreshes stale data in the background
 * - Falls back to cache when offline
 * - Cleans up expired entries
 */
export const smartCache = {
  /**
   * Get cached data for a key
   */
  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();
      
      // Check if completely expired
      if (entry.expiresAt < now) {
        await this.remove(key);
        return null;
      }
      
      return entry;
    } catch (error) {
      console.error(`[SmartCache] Error getting cache for ${key}:`, error);
      return null;
    }
  },

  /**
   * Set cached data for a key
   */
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    try {
      const opts = { ...DEFAULT_OPTIONS, ...options };
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const now = Date.now();
      
      const entry: CacheEntry<T> = {
        data,
        timestamp: now,
        expiresAt: now + opts.maxAge,
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
      
      // Update metadata
      await this.updateMetadata(key, now, entry.expiresAt);
    } catch (error) {
      console.error(`[SmartCache] Error setting cache for ${key}:`, error);
    }
  },

  /**
   * Remove cached data for a key
   */
  async remove(key: string): Promise<void> {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.error(`[SmartCache] Error removing cache for ${key}:`, error);
    }
  },

  /**
   * Check if cached data is stale
   */
  isStale(entry: CacheEntry<unknown>, staleTime: number = DEFAULT_OPTIONS.staleTime): boolean {
    return Date.now() - entry.timestamp > staleTime;
  },

  /**
   * Check if device is online
   */
  async isOnline(): Promise<boolean> {
    try {
      const networkState = await Network.getNetworkStateAsync();
      return networkState.isConnected === true && networkState.isInternetReachable !== false;
    } catch {
      return false;
    }
  },

  /**
   * Fetch data with smart caching strategy
   * - Returns cached data immediately if available
   * - Fetches fresh data if online and cache is stale
   * - Falls back to cached data when offline
   */
  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<{ data: T | null; isFromCache: boolean; isStale: boolean }> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const cached = await this.get<T>(key);
    const isOnline = await this.isOnline();
    
    // If we have cached data
    if (cached) {
      const isStale = this.isStale(cached, opts.staleTime);
      
      // If data is fresh, return it
      if (!isStale) {
        return { data: cached.data, isFromCache: true, isStale: false };
      }
      
      // If stale but offline, return stale cache
      if (!isOnline) {
        console.log(`[SmartCache] Offline - returning stale cache for ${key}`);
        return { data: cached.data, isFromCache: true, isStale: true };
      }
      
      // If stale and online, fetch fresh data
      // But if staleWhileRevalidate, return stale data immediately and revalidate in background
      if (opts.staleWhileRevalidate) {
        // Fire and forget - revalidate in background
        this.revalidate(key, fetcher, opts).catch((err) => {
          console.error(`[SmartCache] Background revalidation failed for ${key}:`, err);
        });
        return { data: cached.data, isFromCache: true, isStale: true };
      }
    }
    
    // No cache or not using staleWhileRevalidate - fetch fresh data
    if (!isOnline) {
      console.log(`[SmartCache] Offline and no cache for ${key}`);
      return { data: null, isFromCache: false, isStale: false };
    }
    
    try {
      const freshData = await fetcher();
      await this.set(key, freshData, opts);
      return { data: freshData, isFromCache: false, isStale: false };
    } catch (error) {
      console.error(`[SmartCache] Fetch error for ${key}:`, error);
      // Return stale cache on error if available
      if (cached) {
        return { data: cached.data, isFromCache: true, isStale: true };
      }
      throw error;
    }
  },

  /**
   * Revalidate (refresh) cached data in the background
   */
  async revalidate<T>(key: string, fetcher: () => Promise<T>, options: CacheOptions = {}): Promise<T | null> {
    try {
      const freshData = await fetcher();
      await this.set(key, freshData, options);
      console.log(`[SmartCache] Revalidated cache for ${key}`);
      return freshData;
    } catch (error) {
      console.error(`[SmartCache] Revalidation failed for ${key}:`, error);
      return null;
    }
  },

  /**
   * Invalidate cache for a key (mark it as stale, forcing next fetch to refresh)
   */
  async invalidate(key: string): Promise<void> {
    const cached = await this.get(key);
    if (cached) {
      // Set timestamp to 0 to force it to be stale
      cached.timestamp = 0;
      const cacheKey = `${CACHE_PREFIX}${key}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cached));
    }
  },

  /**
   * Clear all cached data
   */
  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`[SmartCache] Cleared ${cacheKeys.length} cache entries`);
    } catch (error) {
      console.error("[SmartCache] Error clearing cache:", error);
    }
  },

  /**
   * Clean up expired cache entries
   */
  async cleanup(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
      const now = Date.now();
      
      for (const cacheKey of cacheKeys) {
        try {
          const cached = await AsyncStorage.getItem(cacheKey);
          if (cached) {
            const entry: CacheEntry<unknown> = JSON.parse(cached);
            if (entry.expiresAt < now) {
              await AsyncStorage.removeItem(cacheKey);
              console.log(`[SmartCache] Cleaned up expired cache: ${cacheKey}`);
            }
          }
        } catch {
          // Remove corrupted entries
          await AsyncStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error("[SmartCache] Error during cleanup:", error);
    }
  },

  /**
   * Update cache metadata
   */
  async updateMetadata(key: string, lastUpdated: number, expiresAt: number): Promise<void> {
    try {
      const metadataStr = await AsyncStorage.getItem(CACHE_METADATA_KEY);
      const metadata: CacheMetadata = metadataStr ? JSON.parse(metadataStr) : {};
      
      metadata[key] = { lastUpdated, expiresAt };
      
      await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error("[SmartCache] Error updating metadata:", error);
    }
  },

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ totalEntries: number; totalSize: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
      
      let totalSize = 0;
      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return {
        totalEntries: cacheKeys.length,
        totalSize,
      };
    } catch (error) {
      console.error("[SmartCache] Error getting stats:", error);
      return { totalEntries: 0, totalSize: 0 };
    }
  },
};

export default smartCache;
