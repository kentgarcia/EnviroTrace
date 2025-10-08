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
  Linking,
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
    if (!isFormValid) {
      setSnackbarMessage("Enter your email and password to continue.");
      setShowSnackbar(true);
      return;
    }

    clearError();
    setSnackbarMessage(null);
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    setShowTransition(false);

    const success = await login(email.trim(), password);

    if (!success) {
      setSnackbarMessage(error || "Unable to sign in. Please try again.");
      setShowSnackbar(true);
      return;
    }

    try {
      await AsyncStorage.setItem("last_email", email.trim());
    } catch {
      // non-critical persistence failure
    }

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

    // Finalize after brief delay to let animation be perceived
    transitionTimeoutRef.current = setTimeout(() => {
      finalizeLogin();
    }, 1100);
  };

  const handleForgotPassword = () => {
    const url = "https://eco-dash.local/forgot-password";
    Linking.openURL(url).catch(() => {
      setSnackbarMessage("We couldn't open the password recovery page. Please try again shortly.");
      setShowSnackbar(true);
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.backgroundImageWrapper} pointerEvents="none">
        <Image
          source={require("../../../assets/images/bg_login.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </View>
      <View style={styles.backgroundGradient} pointerEvents="none" />
      <View style={styles.backgroundGlow} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="automatic"
          >
            <Animated.View style={[styles.heroSection, { opacity: formOpacity }]}>
              <View style={styles.heroLogosRow}>
                <Image
                  source={require("../../../assets/images/logo_epnro.png")}
                  style={styles.heroLogo}
                  resizeMode="contain"
                  accessibilityLabel="EPNRO logo"
                />
                <Image
                  source={require("../../../assets/images/logo_munti.png")}
                  style={styles.heroLogo}
                  resizeMode="contain"
                  accessibilityLabel="City partner logo"
                />
              </View>
              <Text style={styles.heroTitle} accessibilityRole="header">Welcome back</Text>
              <Text style={styles.heroSubtitle}>Monitor citywide emissions, track compliance in real time, and take action faster.</Text>
            </Animated.View>

            <Animated.View style={[styles.formCard, { opacity: formOpacity }]}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Sign in to continue</Text>
                <Text style={styles.formCaption}>Use your government-issued credentials</Text>
              </View>

              <View style={styles.formFields}>
                <TextInput
                  label="Email"
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
                  textColor="#072341"
                  placeholder="name@example.com"
                  placeholderTextColor="rgba(7,35,65,0.38)"
                  theme={{ colors: { primary: "#3B82F6", onSurfaceVariant: "#072341" } }}
                />

                <TextInput
                  label="Password"
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
                  textColor="#072341"
                  placeholder="••••••••"
                  placeholderTextColor="rgba(7,35,65,0.38)"
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword((prev) => !prev)}
                    />
                  }
                  theme={{ colors: { primary: "#3B82F6", onSurfaceVariant: "#072341" } }}
                />

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
                style={styles.primaryButton}
                contentStyle={styles.primaryButtonContent}
              >
                {isLoading ? "Signing In..." : "Continue"}
              </Button>

              <TouchableOpacity
                style={styles.forgotButton}
                disabled={isLoading}
                onPress={handleForgotPassword}
                accessibilityRole="button"
                accessibilityHint="Open password recovery"
              >
                <Text style={styles.forgotButtonText}>Forgot password?</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.bottomMeta}>
          <Text style={styles.bottomMetaText}>Secured by EPNRO • v1.0</Text>
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

      {showTransition && (
        <Animated.View style={[styles.transitionOverlay, { opacity: overlayOpacity }]}
          accessibilityLabel="Completing sign in" accessible>
          <Animated.View style={[styles.transitionContent, { transform: [{ scale: logosScale }] }]}>
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
            <ActivityIndicator size="large" color="#FFFFFF" style={styles.transitionLoader} />
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
    backgroundColor: "#050E1E",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  backgroundImageWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 14, 30, 0.72)", // lightened to reveal more of the background image
  },
  backgroundGlow: {
    position: "absolute",
    top: -SCREEN_WIDTH * 0.35,
    alignSelf: "center",
    width: SCREEN_WIDTH * 1.4,
    height: SCREEN_WIDTH * 1.4,
    borderRadius: SCREEN_WIDTH * 0.7,
    backgroundColor: "rgba(64, 123, 255, 0.22)",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 32,
    gap: 32,
  },
  heroSection: {
    alignItems: "center",
    gap: 18,
  },
  heroLogosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 28,
  },
  heroLogo: {
    width: 80,
    height: 80,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    color: "rgba(231, 239, 255, 0.84)",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },
  formCard: {
    position: "relative",
    padding: 28,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.1)", // slightly more transparent
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    gap: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 12,
  },
  formCardGlow: {
    position: "absolute",
    top: -24,
    left: 32,
    right: 32,
    height: 120,
    borderRadius: 60,
  },
  formHeader: {
    gap: 4,
  },
  formTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
  },
  formCaption: {
    color: "rgba(231, 239, 255, 0.72)",
    fontSize: 14,
  },
  formFields: {
    gap: 12,
  },
  input: {
    backgroundColor: "rgba(246, 248, 255, 0.85)",
  },
  inputOutline: {
    borderColor: "rgba(164, 189, 255, 0.5)",
  },
  errorText: {
    marginTop: -4,
  },
  primaryButton: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#3B82F6",
  },
  primaryButtonContent: {
    paddingVertical: 10,
  },
  forgotButton: {
    alignSelf: "center",
  },
  forgotButtonText: {
    color: "#E1EAFF",
    fontSize: 15,
    fontWeight: "500",
  },
  bottomMeta: {
    paddingVertical: 12,
    alignItems: "center",
  },
  bottomMetaText: {
    color: "rgba(200, 214, 255, 0.6)",
    fontSize: 12,
    letterSpacing: 0.8,
  },
  snackbar: {
    backgroundColor: "rgba(10, 20, 40, 0.92)",
    marginBottom: 24,
  },
  transitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 14, 30, 0.82)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  transitionContent: {
    alignItems: "center",
    gap: 24,
  },
  transitionLogosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 32,
  },
  transitionLogo: {
    width: 88,
    height: 88,
  },
  transitionLoader: {
    marginTop: 12,
  },
  transitionText: {
    color: "#F1F5FF",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.4,
    textAlign: "center",
  },
});
