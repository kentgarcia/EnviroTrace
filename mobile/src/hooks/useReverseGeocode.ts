import { useState } from "react";
import axios from "axios";

export interface ReverseGeocodeResult {
    address: string;
    barangay: string;
    city: string;
    province: string;
    country: string;
}

export interface UseReverseGeocodeResult {
    result: ReverseGeocodeResult | null;
    isLoading: boolean;
    error: string | null;
    reverseGeocode: (latitude: number, longitude: number) => Promise<void>;
    reset: () => void;
}

export const useReverseGeocode = (): UseReverseGeocodeResult => {
    const [result, setResult] = useState<ReverseGeocodeResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reverseGeocode = async (latitude: number, longitude: number) => {
        try {
            setIsLoading(true);
            setError(null);

            // Use Nominatim API (OpenStreetMap)
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse`,
                {
                    params: {
                        format: "json",
                        lat: latitude,
                        lon: longitude,
                        zoom: 18,
                        addressdetails: 1,
                    },
                    headers: {
                        "User-Agent": "EnviroTrace-Mobile/1.0",
                    },
                }
            );

            const data = response.data;
            const addressData = data.address || {};

            // Extract address components
            const barangay =
                addressData.suburb ||
                addressData.neighbourhood ||
                addressData.village ||
                addressData.hamlet ||
                "";

            const city =
                addressData.city ||
                addressData.town ||
                addressData.municipality ||
                "";

            const province =
                addressData.state ||
                addressData.province ||
                addressData.region ||
                "";

            const country = addressData.country || "";

            // Build full address string
            const road = addressData.road || "";
            const houseNumber = addressData.house_number || "";
            const addressParts = [houseNumber, road, barangay, city, province]
                .filter(Boolean)
                .join(", ");

            setResult({
                address: addressParts || data.display_name || "",
                barangay,
                city,
                province,
                country,
            });

            setIsLoading(false);
        } catch (err) {
            console.error("Error reverse geocoding:", err);
            setError("Failed to get address from coordinates");
            setIsLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setError(null);
        setIsLoading(false);
    };

    return {
        result,
        isLoading,
        error,
        reverseGeocode,
        reset,
    };
};
