import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  TextInput,
  Button,
  HelperText,
  Snackbar,
} from "react-native-paper";
import { useAuthStore } from "../../core/stores/authStore";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    if (error) {
      setShowSnackbar(true);
    }
  }, [error]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      return;
    }

    clearError();
    const success = await login(username.trim(), password);

    if (!success && error) {
      setShowSnackbar(true);
    }
  };

  const isFormValid = username.trim().length > 0 && password.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Title style={styles.logoText}>EPNRO</Title>
              <Paragraph style={styles.logoSubtext}>
                Environmental Protection
              </Paragraph>
            </View>
          </View>

          <Card style={styles.loginCard}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.title}>Government Emission</Title>
              <Paragraph style={styles.subtitle}>
                Sign in to access the emission monitoring system
              </Paragraph>

              <View style={styles.form}>
                <TextInput
                  label="Username"
                  value={username}
                  onChangeText={setUsername}
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                  textContentType="username"
                  style={styles.input}
                  disabled={isLoading}
                  error={!!error && !username.trim()}
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
                  disabled={isLoading}
                  error={!!error && !password.trim()}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />

                {error && (
                  <HelperText
                    type="error"
                    visible={true}
                    style={styles.errorText}
                  >
                    {error}
                  </HelperText>
                )}

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  disabled={!isFormValid || isLoading}
                  loading={isLoading}
                  style={styles.loginButton}
                  contentStyle={styles.loginButtonContent}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </View>

              <View style={styles.infoContainer}>
                <Paragraph style={styles.infoText}>
                  🔒 Secure access for government emission monitoring
                </Paragraph>
                <Paragraph style={styles.infoText}>
                  📱 Local-first data with offline capabilities
                </Paragraph>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={4000}
        action={{
          label: "Dismiss",
          onPress: () => {
            setShowSnackbar(false);
            clearError();
          },
        }}
      >
        {error || "Login failed"}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoPlaceholder: {
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  logoSubtext: {
    color: "#E8F5E8",
    fontSize: 12,
    textAlign: "center",
  },
  loginCard: {
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    padding: 24,
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#757575",
    marginBottom: 32,
    lineHeight: 20,
  },
  form: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#FAFAFA",
  },
  errorText: {
    marginTop: -8,
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  infoContainer: {
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  infoText: {
    fontSize: 12,
    color: "#757575",
    textAlign: "center",
    marginVertical: 2,
  },
});
