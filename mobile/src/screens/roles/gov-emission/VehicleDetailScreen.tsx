import React from "react";
import { View, StyleSheet } from "react-native";
import { Title, Paragraph, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../components/icons/Icon";

export default function VehicleDetailScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Icon name="directions-car" size={64} color="#2196F3" />
        <Title style={styles.title}>Vehicle Details</Title>
        <Paragraph style={styles.subtitle}>
          View detailed vehicle information and test history
        </Paragraph>
        <Button mode="contained" style={styles.button}>
          Record Test
        </Button>
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
  title: {
    fontSize: 24,
    color: "#2196F3",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    borderRadius: 8,
  },
});
