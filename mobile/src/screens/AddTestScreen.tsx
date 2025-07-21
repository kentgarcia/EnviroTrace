import React from "react";
import { View, StyleSheet } from "react-native";
import { Title, Paragraph, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function AddTestScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Icon name="assignment-add" size={64} color="#FF9800" />
        <Title style={styles.title}>Record Test</Title>
        <Paragraph style={styles.subtitle}>
          Record a new emission test result
        </Paragraph>
        <Button mode="contained" style={styles.button}>
          Save Test
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
    color: "#FF9800",
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
