const { withAndroidManifest, AndroidConfig } = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

/**
 * Custom Expo config plugin to create Android Network Security Configuration
 * This ensures HTTPS connections work properly on all Android devices
 */
function withNetworkSecurityConfig(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication =
      AndroidConfig.Manifest.getMainApplicationOrThrow(androidManifest);

    // Add network security config reference
    mainApplication.$["android:networkSecurityConfig"] =
      "@xml/network_security_config";

    // Create the network security config XML file
    const projectRoot = config.modRequest.projectRoot;
    const resDir = path.join(
      projectRoot,
      "android",
      "app",
      "src",
      "main",
      "res"
    );
    const xmlDir = path.join(resDir, "xml");

    // Ensure xml directory exists
    if (!fs.existsSync(xmlDir)) {
      fs.mkdirSync(xmlDir, { recursive: true });
    }

    // Create network_security_config.xml
    // This configuration is crucial for Android 9+ devices
    const networkSecurityConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- 
        Android 9+ (API 28+) requires explicit network security configuration
        Without this, HTTPS connections may fail on newer Android versions
    -->
    
    <!-- Base configuration - Trust system certificates for HTTPS -->
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <!-- System certificates (pre-installed on device) -->
            <certificates src="system" />
            <!-- User-added certificates (useful for corporate/testing environments) -->
            <certificates src="user" />
        </trust-anchors>
    </base-config>
    
    <!-- Production domains - HTTPS only, trust system + user certificates -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">envirotrace.onrender.com</domain>
        <domain includeSubdomains="true">render.com</domain>
        <domain includeSubdomains="true">onrender.com</domain>
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </domain-config>
    
    <!-- Development domains - Allow cleartext (HTTP) for localhost -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
        <domain includeSubdomains="true">192.168.0.0/16</domain>
    </domain-config>
</network-security-config>`;

    const configPath = path.join(xmlDir, "network_security_config.xml");
    fs.writeFileSync(configPath, networkSecurityConfig);

    return config;
  });
}

module.exports = withNetworkSecurityConfig;
