import React from "react";
import { View, StyleSheet } from "react-native";
import { Title, Paragraph, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function TestingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Icon name="assignment" size={64} color="#1976D2" />
        <Title style={styles.title}>Emission Testing</Title>
        <Paragraph style={styles.subtitle}>
          Manage emission test records and quarterly testing schedules
        </Paragraph>
        <Button mode="contained" style={styles.button}>
          Record New Test
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
    color: "#1976D2",
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
