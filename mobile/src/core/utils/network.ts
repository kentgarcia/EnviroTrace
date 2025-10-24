import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import Constants from "expo-constants";

/**
 * Network connectivity utilities for debugging and monitoring
 */

export const checkNetworkConnectivity = async (): Promise<{
  isConnected: boolean;
  type: string;
  details: any;
}> => {
  try {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      type: state.type,
      details: state.details,
    };
  } catch (error) {
    console.error("Error checking network connectivity:", error);
    return {
      isConnected: false,
      type: "unknown",
      details: null,
    };
  }
};

export const testAPIConnection = async (
  apiUrl?: string
): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  const baseUrl =
    apiUrl ||
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    "https://envirotrace.onrender.com/api/v1";

  console.log("🔍 Testing API connection to:", baseUrl);

  try {
    // First check network connectivity
    const networkStatus = await checkNetworkConnectivity();
    if (!networkStatus.isConnected) {
      return {
        success: false,
        message: "No internet connection detected",
        details: networkStatus,
      };
    }

    // Try to reach the API health endpoint
    // Note: baseUrl already includes /api/v1, so we need to go up to reach /api/healthcheck
    const healthUrl = baseUrl.replace("/api/v1", "/api/healthcheck");
    const response = await axios.get(healthUrl, {
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      message: "API connection successful",
      details: {
        status: response.status,
        data: response.data,
        networkStatus,
      },
    };
  } catch (error: any) {
    console.error("❌ API connection test failed:", error.message);

    let message = "API connection failed";
    if (error.code === "ECONNABORTED") {
      message = "Connection timeout - Server took too long to respond";
    } else if (error.code === "ERR_NETWORK") {
      message = "Network error - Unable to reach server";
    } else if (error.response) {
      message = `Server error: ${error.response.status}`;
    } else {
      message = `Connection error: ${error.message}`;
    }

    return {
      success: false,
      message,
      details: {
        error: error.message,
        code: error.code,
        url: baseUrl,
      },
    };
  }
};

/**
 * Subscribe to network state changes
 */
export const subscribeToNetworkChanges = (
  callback: (isConnected: boolean) => void
) => {
  const unsubscribe = NetInfo.addEventListener((state: any) => {
    console.log("🌐 Network state changed:", {
      connected: state.isConnected,
      type: state.type,
    });
    callback(state.isConnected ?? false);
  });

  return unsubscribe;
};

/**
 * Get detailed network diagnostics
 */
export const getNetworkDiagnostics = async () => {
  const apiUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    "https://envirotrace.onrender.com/api/v1";

  const networkStatus = await checkNetworkConnectivity();
  const apiTest = await testAPIConnection(apiUrl);

  return {
    timestamp: new Date().toISOString(),
    environment: __DEV__ ? "development" : "production",
    apiUrl,
    networkStatus,
    apiTest,
  };
};
