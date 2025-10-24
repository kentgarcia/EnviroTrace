import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Android Version Detection and Compatibility Utilities
 */

export interface AndroidVersionInfo {
  version: number; // Android version (e.g., 10, 11, 12)
  apiLevel: number; // API level (e.g., 29, 30, 31)
  versionName: string; // Human-readable (e.g., "Android 10")
  hasNetworkSecurityIssues: boolean; // True if version requires special handling
  requiresNetworkConfig: boolean; // True if network security config is mandatory
  deviceInfo: {
    brand: string;
    model: string;
    osName: string;
    osVersion: string;
  };
}

/**
 * Get detailed Android version information
 */
export const getAndroidVersionInfo = (): AndroidVersionInfo | null => {
  if (Platform.OS !== "android") {
    return null;
  }

  const apiLevel = Platform.Version as number;
  const version = Math.floor(apiLevel / 10); // Rough estimate

  // More accurate version mapping
  let actualVersion = version;
  if (apiLevel >= 21 && apiLevel <= 22) actualVersion = 5; // Lollipop
  else if (apiLevel === 23) actualVersion = 6; // Marshmallow
  else if (apiLevel >= 24 && apiLevel <= 25) actualVersion = 7; // Nougat
  else if (apiLevel >= 26 && apiLevel <= 27) actualVersion = 8; // Oreo
  else if (apiLevel === 28) actualVersion = 9; // Pie
  else if (apiLevel === 29) actualVersion = 10; // Q
  else if (apiLevel === 30) actualVersion = 11; // R
  else if (apiLevel === 31) actualVersion = 12; // S
  else if (apiLevel >= 32 && apiLevel <= 33) actualVersion = 12.1; // S
  else if (apiLevel === 34) actualVersion = 14; // U

  return {
    version: actualVersion,
    apiLevel,
    versionName: `Android ${actualVersion}`,
    // Android 9+ (API 28+) has strict network security requirements
    hasNetworkSecurityIssues: apiLevel >= 28,
    requiresNetworkConfig: apiLevel >= 28,
    deviceInfo: {
      brand: Constants.deviceName || "Unknown",
      model: Constants.platform?.android?.model || "Unknown",
      osName: Platform.OS,
      osVersion: Platform.Version.toString(),
    },
  };
};

/**
 * Check if the current Android version is known to have network issues
 */
export const hasKnownNetworkIssues = (): boolean => {
  const info = getAndroidVersionInfo();
  if (!info) return false;

  // Android 9+ requires network security configuration
  return info.apiLevel >= 28;
};

/**
 * Get user-friendly message about Android version compatibility
 */
export const getVersionCompatibilityMessage = (): string => {
  const info = getAndroidVersionInfo();
  if (!info) {
    return "Not running on Android";
  }

  if (info.apiLevel >= 28) {
    return `${info.versionName} (API ${info.apiLevel}) - Requires network security configuration for HTTPS connections. This should be automatically handled by the app.`;
  } else if (info.apiLevel >= 23) {
    return `${info.versionName} (API ${info.apiLevel}) - Older Android version with more lenient network security. Should work without issues.`;
  } else {
    return `${info.versionName} (API ${info.apiLevel}) - Very old Android version. Some features may not work correctly.`;
  }
};

/**
 * Check if network security config is properly applied
 * Note: This can only be verified through actual network requests
 */
export const getNetworkSecurityStatus = (): {
  configured: boolean;
  message: string;
  recommendation?: string;
} => {
  const info = getAndroidVersionInfo();

  if (!info) {
    return {
      configured: true,
      message: "Not running on Android",
    };
  }

  if (info.apiLevel >= 28) {
    return {
      configured: true, // We assume it's configured via our plugin
      message: `Network security configuration is required for ${info.versionName}`,
      recommendation:
        "If experiencing connection issues, ensure the app was built with the network security plugin enabled.",
    };
  }

  return {
    configured: true,
    message:
      "Network security configuration not required for this Android version",
  };
};

/**
 * Get comprehensive device and version report for debugging
 */
export const getDeviceReport = (): string => {
  const info = getAndroidVersionInfo();

  if (!info) {
    return `Platform: ${Platform.OS}\nVersion: ${Platform.Version}`;
  }

  return `
📱 Device Information:
- Brand: ${info.deviceInfo.brand}
- Model: ${info.deviceInfo.model}
- OS: ${info.versionName}
- API Level: ${info.apiLevel}

🔒 Network Security:
- Requires Config: ${info.requiresNetworkConfig ? "Yes" : "No"}
- Has Known Issues: ${info.hasNetworkSecurityIssues ? "Yes" : "No"}

${getVersionCompatibilityMessage()}
  `.trim();
};
