import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";

export interface GPSLocation {
    coords: {
        latitude: number;
        longitude: number;
        accuracy: number | null;
        altitude: number | null;
        altitudeAccuracy: number | null;
        heading: number | null;
        speed: number | null;
    };
    timestamp: number;
}

export interface UseGPSLocationResult {
    location: GPSLocation | null;
    accuracy: number | null;
    isAcquiring: boolean;
    hasPermission: boolean;
    error: string | null;
    requestPermission: () => Promise<boolean>;
    startTracking: () => Promise<void>;
    stopTracking: () => void;
}

export const useGPSLocation = (): UseGPSLocationResult => {
    const [location, setLocation] = useState<GPSLocation | null>(null);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [isAcquiring, setIsAcquiring] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const watchSubscription = useRef<Location.LocationSubscription | null>(null);

    const requestPermission = async (): Promise<boolean> => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            const granted = status === Location.PermissionStatus.GRANTED;
            setHasPermission(granted);
            
            if (!granted) {
                setError("Location permission denied");
            }
            
            return granted;
        } catch (err) {
            console.error("Error requesting location permission:", err);
            setError("Failed to request permission");
            return false;
        }
    };

    const startTracking = async () => {
        try {
            setIsAcquiring(true);
            setError(null);

            // Check permission first
            const permissionResult = await Location.getForegroundPermissionsAsync();
            if (permissionResult.status !== Location.PermissionStatus.GRANTED) {
                const granted = await requestPermission();
                if (!granted) {
                    setIsAcquiring(false);
                    return;
                }
            } else {
                setHasPermission(true);
            }

            let hasLocation = false;

            // Try to get last known location for faster response
            const lastKnown = await Location.getLastKnownPositionAsync();
            if (lastKnown) {
                setLocation(lastKnown);
                setAccuracy(lastKnown.coords.accuracy || null);
                hasLocation = true;
            }

            // Get current high-accuracy location
            try {
                const currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced, // Try balanced first for speed/reliability
                });

                setLocation(currentLocation);
                setAccuracy(currentLocation.coords.accuracy || null);
                hasLocation = true;
            } catch (posError) {
                console.warn("Initial position acquisition failed, falling back to watcher:", posError);
                // Don't fail completely, let the watcher try
            }

            // Only stop acquiring/loading state if we actually have a location
            // Otherwise keep spinning until the watcher gives us something
            if (hasLocation) {
                 setIsAcquiring(false);
            }

            // Start continuous updates
            if (watchSubscription.current) {
                watchSubscription.current.remove();
            }

            watchSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 5,
                },
                (newLocation) => {
                    setLocation(newLocation);
                    setAccuracy(newLocation.coords.accuracy || null);
                    setIsAcquiring(false); // Stop loading once we get a fix
                }
            );
        } catch (err) {
            console.error("Error acquiring location:", err);
            setError("Failed to acquire GPS location");
            setIsAcquiring(false);
        }
    };

    const stopTracking = () => {
        if (watchSubscription.current) {
            watchSubscription.current.remove();
            watchSubscription.current = null;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopTracking();
        };
    }, []);

    return {
        location,
        accuracy,
        isAcquiring,
        hasPermission,
        error,
        requestPermission,
        startTracking,
        stopTracking,
    };
};
