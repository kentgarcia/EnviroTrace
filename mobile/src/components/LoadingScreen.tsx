import React from "react";
import { View, StyleSheet, Image, ImageBackground, StatusBar } from "react-native";
import { ActivityIndicator, Title, Paragraph } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export function LoadingScreen() {
  return (
    <ImageBackground
      source={require("../../assets/images/bg_login.png")}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.scrim} />
      <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoRow}>
              <Image
                source={require("../../assets/images/logo_munti.png")}
                style={styles.logoImage}
                resizeMode="contain"
                accessibilityLabel="MUNTI logo"
              />
              <Image
                source={require("../../assets/images/logo_epnro.png")}
                style={styles.logoImage}
                resizeMode="contain"
                accessibilityLabel="EPNRO logo"
              />
            </View>
          </View>

          <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />

          <Title style={styles.title}>Preparing your workspace</Title>
          <Paragraph style={styles.subtitle}>Securing session & loading dashboards…</Paragraph>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: "cover",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,14,30,0.55)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  logoContainer: {
    marginBottom: 48,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  logoImage: {
    width: 72,
    height: 72,
  },
  loader: {
    marginBottom: 28,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "#E5EEF9",
    fontSize: 15,
    textAlign: "center",
  },
});
