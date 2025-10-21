import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextInput, Button, HelperText, Snackbar, ActivityIndicator } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAuthStore } from "../../core/stores/authStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [showTransition, setShowTransition] = useState(false);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { login, isLoading, error, clearError, finalizeLogin } = useAuthStore();

  // Animation refs
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const logosScale = useRef(new Animated.Value(0.9)).current;
  const formOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setShowSnackbar(true);
    }
  }, [error]);

  useEffect(() => {
    (async () => {
      try {
        const lastEmail = await AsyncStorage.getItem("last_email");
        if (lastEmail) {
          setEmail(lastEmail);
        }
      } catch {
        // best-effort preload
      }
    })();
  }, []);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async () => {
    // Validate form inputs
    if (!isFormValid) {
      setSnackbarMessage("Please enter your email and password to continue.");
      setShowSnackbar(true);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setSnackbarMessage("Please enter a valid email address.");
      setShowSnackbar(true);
      return;
    }

    clearError();
    setSnackbarMessage(null);

    // Clean up any existing transition timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    setShowTransition(false);

    try {
      const success = await login(email.trim(), password);

      if (!success) {
        // Handle login failure with specific error message
        const errorMessage = error || "Unable to sign in. Please check your credentials and try again.";
        setSnackbarMessage(errorMessage);
        setShowSnackbar(true);
        return;
      }

      // Save email for convenience (non-critical)
      try {
        await AsyncStorage.setItem("last_email", email.trim());
      } catch (storageError) {
        // Silent failure - email won't be pre-filled next time
        console.warn("Failed to save email to storage:", storageError);
      }

      // Show transition animation
      setShowTransition(true);

      // Animate: fade out form, fade/scale in overlay
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logosScale, {
          toValue: 1,
          damping: 12,
          stiffness: 140,
          mass: 0.6,
          useNativeDriver: true,
        }),
      ]).start();

      // Finalize login after animation
      transitionTimeoutRef.current = setTimeout(() => {
        finalizeLogin();
      }, 1100);

    } catch (err) {
      // Catch any unexpected errors during login
      console.error("Login error:", err);
      setSnackbarMessage("An unexpected error occurred. Please try again.");
      setShowSnackbar(true);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Background Image */}
      <View style={styles.backgroundImageWrapper} pointerEvents="none">
        <Image
          source={require("../../../assets/images/bg_login.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </View>

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Partner Logos at Top */}
        <View style={styles.topPartnerLogos}>
          <Image
            source={require("../../../assets/images/logo_epnro.png")}
            style={styles.topPartnerLogo}
            resizeMode="contain"
            accessibilityLabel="EPNRO"
          />
          <View style={styles.topLogoDivider} />
          <Image
            source={require("../../../assets/images/logo_munti.png")}
            style={styles.topPartnerLogo}
            resizeMode="contain"
            accessibilityLabel="Muntinlupa"
          />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <Animated.View style={[styles.logoSection, { opacity: formOpacity }]}>
              <View style={styles.appLogoContainer}>
                <Image
                  source={require("../../../assets/images/logo_app.png")}
                  style={styles.appLogo}
                  resizeMode="contain"
                  accessibilityLabel="EnviroTrace"
                />
              </View>
              <Text style={styles.appName}>EnviroTrace</Text>
            </Animated.View>

            {/* Welcome Section */}
            <Animated.View style={[styles.welcomeSection, { opacity: formOpacity }]}>
              <Text style={styles.welcomeTitle} accessibilityRole="header">
                Welcome Back
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Monitor emissions · Track compliance · Take action
              </Text>
            </Animated.View>

            {/* Form Section */}
            <Animated.View style={[styles.formSection, { opacity: formOpacity }]}>
              <View style={styles.formFields}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    autoComplete="email"
                    textContentType="emailAddress"
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    disabled={isLoading}
                    error={!!error && !email.trim()}
                    textColor="#111827"
                    placeholder="you@example.com"
                    placeholderTextColor="#9CA3AF"
                    theme={{
                      colors: {
                        primary: "#54779C",
                        onSurfaceVariant: "#6B7280",
                        outline: "#E5E7EB"
                      }
                    }}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    textContentType="password"
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    disabled={isLoading}
                    error={!!error && !password.trim()}
                    textColor="#111827"
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    right={
                      <TextInput.Icon
                        icon={showPassword ? "eye-off" : "eye"}
                        onPress={() => setShowPassword((prev) => !prev)}
                        color="#6B7280"
                      />
                    }
                    theme={{
                      colors: {
                        primary: "#54779C",
                        onSurfaceVariant: "#6B7280",
                        outline: "#E5E7EB"
                      }
                    }}
                  />
                </View>

                {error && (
                  <HelperText type="error" visible style={styles.errorText}>
                    {error}
                  </HelperText>
                )}
              </View>

              <Button
                mode="contained"
                onPress={handleLogin}
                disabled={!isFormValid || isLoading}
                loading={isLoading}
                style={styles.signInButton}
                contentStyle={styles.signInButtonContent}
                labelStyle={styles.signInButtonLabel}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerVersionBadge}>
            <Text style={styles.footerVersion}>v1.0.0</Text>
          </View>
        </View>

        <Snackbar
          visible={showSnackbar}
          onDismiss={() => setShowSnackbar(false)}
          duration={4000}
          style={styles.snackbar}
          action={{
            label: "Dismiss",
            onPress: () => {
              setShowSnackbar(false);
              setSnackbarMessage(null);
              clearError();
            },
          }}
        >
          {snackbarMessage || error || "Login failed"}
        </Snackbar>
      </SafeAreaView>

      {/* Transition Overlay */}
      {showTransition && (
        <Animated.View
          style={[styles.transitionOverlay, { opacity: overlayOpacity }]}
          accessibilityLabel="Completing sign in"
          accessible
        >
          <Animated.View style={[styles.transitionContent, { transform: [{ scale: logosScale }] }]}>
            <Image
              source={require("../../../assets/images/logo_app.png")}
              style={styles.transitionAppLogo}
              resizeMode="contain"
              accessibilityLabel="EnviroTrace"
            />
            <View style={styles.transitionLogosRow}>
              <Image
                source={require("../../../assets/images/logo_epnro.png")}
                style={styles.transitionLogo}
                resizeMode="contain"
                accessibilityLabel="EPNRO logo"
              />
              <Image
                source={require("../../../assets/images/logo_munti.png")}
                style={styles.transitionLogo}
                resizeMode="contain"
                accessibilityLabel="City partner logo"
              />
            </View>
            <ActivityIndicator size="large" color="#54779C" style={styles.transitionLoader} />
            <Text style={styles.transitionText}>Preparing your dashboards…</Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backgroundImageWrapper: {
    position: "absolute" as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    position: "absolute" as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  topPartnerLogos: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  topPartnerLogo: {
    width: 32,
    height: 32,
    opacity: 0.6,
  },
  topLogoDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#E5E7EB",
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  // Logo Section
  logoSection: {
    alignItems: "center",
    marginBottom: 24,
    width: "100%",
  },
  appLogoContainer: {
    marginBottom: 12,
    padding: 4,
  },
  appLogo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
  },

  // Welcome Section
  welcomeSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
    width: "100%",
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: -1,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: "#54779C",
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // Form Section
  formSection: {
    width: "100%",
  },
  formFields: {
    gap: 18,
    marginBottom: 16,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F9FAFB",
    fontSize: 15,
  },
  inputOutline: {
    borderRadius: 14,
    borderWidth: 1.5,
  },
  errorText: {
    marginTop: -8,
    fontSize: 13,
  },

  // Sign In Button
  signInButton: {
    borderRadius: 14,
    backgroundColor: "#3A5A7A",
    marginTop: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  signInButtonContent: {
    paddingVertical: 14,
  },
  signInButtonLabel: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: "#FFFFFF",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  footerVersionBadge: {
    backgroundColor: "rgba(55, 65, 81, 0.9)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(55, 65, 81, 0.6)",
  },
  footerVersion: {
    fontSize: 10,
    color: "#F3F4F6",
    fontWeight: "600",
  },

  // Snackbar
  snackbar: {
    backgroundColor: "#1F2937",
    marginBottom: 24,
    marginHorizontal: 16,
  },

  // Transition Overlay
  transitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  transitionContent: {
    alignItems: "center",
    gap: 20,
  },
  transitionAppLogo: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  transitionLogosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  transitionLogo: {
    width: 64,
    height: 64,
    opacity: 0.7,
  },
  transitionLoader: {
    marginTop: 16,
  },
  transitionText: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
    textAlign: "center",
    marginTop: 8,
  },
});

