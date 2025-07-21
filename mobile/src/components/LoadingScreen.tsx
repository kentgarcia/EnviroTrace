import React from "react";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator, Title, Paragraph } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export function LoadingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Title style={styles.logoText}>EPNRO</Title>
            <Paragraph style={styles.logoSubtext}>
              Environmental Protection
            </Paragraph>
          </View>
        </View>

        <ActivityIndicator size="large" color="#2E7D32" style={styles.loader} />

        <Title style={styles.title}>Government Emission</Title>
        <Paragraph style={styles.subtitle}>
          Initializing application...
        </Paragraph>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
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
  logoPlaceholder: {
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 24,
    paddingHorizontal: 48,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  logoSubtext: {
    color: "#E8F5E8",
    fontSize: 14,
    textAlign: "center",
  },
  loader: {
    marginBottom: 24,
  },
  title: {
    color: "#2E7D32",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "#757575",
    fontSize: 14,
    textAlign: "center",
  },
});
