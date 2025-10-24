# Login Network Issues - Troubleshooting Guide

## Problem

Login works on some devices but fails with "Network error - Unable to reach the server" on others.

## Root Causes Identified

### 1. **Android Network Security Configuration**

- Android devices (especially Android 9+) have strict network security policies
- Without proper configuration, HTTPS connections may fail on certain devices
- Self-signed or expired certificates can cause SSL/TLS errors

### 2. **DNS Resolution Issues**

- Some networks/devices may have trouble resolving `envirotrace.onrender.com`
- Corporate networks or restrictive WiFi may block external connections

### 3. **Timeout Issues**

- Slow network connections may timeout before login completes
- Server cold starts on Render.com can take 30-60 seconds

## Fixes Applied

### ✅ 1. Improved Android Network Security

**File: `mobile/app.json`**

- Set `usesCleartextTraffic: false` (only allow HTTPS)
- Added `ACCESS_WIFI_STATE` permission
- Removed improper `networkSecurityConfig` (doesn't work in Expo config)

**File: `mobile/plugins/withNetworkSecurityConfig.js`**

- Created custom Expo config plugin
- Generates proper `network_security_config.xml` for Android
- Configures trust anchors for system and user certificates
- Allows localhost for development

### ✅ 2. Enhanced API Client

**File: `mobile/src/core/api/api-client.ts`**

- Added `Accept: application/json` header
- Increased redirect tolerance (maxRedirects: 5)
- Better status code validation
- Improved error messages with specific codes:
  - `ECONNABORTED` / `ETIMEDOUT` → Connection timeout
  - `ERR_NETWORK` → Network unreachable
  - `ENOTFOUND` → DNS resolution failed
  - SSL errors → Certificate issues
- Added `testConnection()` function for diagnostics
- More detailed logging in development mode

### ✅ 3. Improved Login Error Handling

**File: `mobile/src/core/stores/authStore.ts`**

- Added detailed logging at each step
- Explicit 30-second timeout for login requests
- Better error categorization:
  - Network errors vs authentication errors
  - User-friendly messages for each error type
- Logs API base URL for debugging

## Testing Steps

### 1. Clean Build

```bash
cd mobile
rm -rf android/
rm -rf node_modules/.cache
npx expo prebuild --clean
eas build --platform android --profile preview
```

### 2. Test on Device

```bash
# Install the new build
# Then test login with these scenarios:

# 1. Normal WiFi
# 2. Mobile data
# 3. Slow connection
# 4. After enabling airplane mode and re-enabling
```

### 3. Use Network Diagnostics

- Open the app
- Go to Profile → Network Diagnostics
- Check connection status before logging in

## Common Issues & Solutions

### Issue: "Connection timeout"

**Cause:** Server is cold-starting or network is slow
**Solution:**

- Wait 60 seconds and try again
- Check if server is up: https://envirotrace.onrender.com/api/healthcheck

### Issue: "Network error - Unable to reach the server"

**Causes:**

1. No internet connection
2. DNS resolution failure
3. Firewall/proxy blocking
4. SSL/TLS certificate issue

**Solutions:**

1. Check internet connectivity
2. Try mobile data instead of WiFi (or vice versa)
3. Disable VPN if active
4. Check Network Diagnostics screen

### Issue: "Secure connection failed"

**Cause:** SSL/TLS certificate validation failure
**Solution:**

- Ensure device date/time is correct
- Update Android system certificates
- Check if device has custom certificates installed

### Issue: Works on WiFi but not on Mobile Data

**Cause:** Mobile carrier may be blocking the connection
**Solution:**

- Check carrier APN settings
- Try different mobile network if available
- Use VPN to bypass carrier restrictions

### Issue: Works on Emulator but not Real Device

**Cause:** Emulator has different network configuration
**Solution:**

- Ensure real device is on same network
- Check device-specific security settings
- Review device logs: `adb logcat | grep -i network`

## Debugging Commands

### Check if server is reachable

```bash
# From your computer
curl -I https://envirotrace.onrender.com/api/healthcheck

# Expected output: HTTP 200 or 405 (Method Not Allowed is OK for GET)
```

### View device logs

```bash
# Connect device via USB
adb devices
adb logcat | grep -E "(NetworkError|ECONNREFUSED|ETIMEDOUT|SSL)"
```

### Test DNS resolution

```bash
nslookup envirotrace.onrender.com
```

### Check network from device

Use the Network Diagnostics screen in the app (Profile → Network Diagnostics)

## Environment Variables

Ensure `.env` file has correct values:

```env
EXPO_PUBLIC_API_URL=https://envirotrace.onrender.com/api/v1
EXPO_PUBLIC_API_TIMEOUT=30000
```

## Monitoring

### Console Logs to Watch

- `🌐 Using API URL:` - Confirms correct API endpoint
- `📱 Environment:` - Shows dev/production mode
- `🔐 Attempting login for user:` - Login initiated
- `📤 Sending login request...` - Request sent
- `✅ Login response received:` - Success
- `❌ Login error:` - Shows error details

### Success Indicators

```
🌐 Using API URL: https://envirotrace.onrender.com/api/v1
📱 Environment: Production
🔐 Attempting login for user: testuser
📍 API Base URL: https://envirotrace.onrender.com/api/v1
📤 Sending login request...
✅ POST /auth/login - 200
✅ Login response received: 200
Token stored successfully
Fetching user profile...
✅ GET /auth/me - 200
Profile fetched. User role: government_emission
Login completed successfully
```

## Next Steps if Issue Persists

1. **Collect Device Info:**

   - Android version
   - Device manufacturer/model
   - Network type (WiFi/Mobile)
   - Internet provider

2. **Get Network Diagnostics:**

   - Screenshot from Network Diagnostics screen
   - Console logs from login attempt

3. **Test Alternative Endpoints:**

   - Try accessing https://envirotrace.onrender.com in device browser
   - Check if other HTTPS sites work

4. **Consider Server Issues:**
   - Check Render.com dashboard
   - Review server logs
   - Verify SSL certificate is valid

## Additional Resources

- [Render.com Status](https://status.render.com/)
- [Android Network Security Config](https://developer.android.com/training/articles/security-config)
- [Expo Config Plugins](https://docs.expo.dev/guides/config-plugins/)
