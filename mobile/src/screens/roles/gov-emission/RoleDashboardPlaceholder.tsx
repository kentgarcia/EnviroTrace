import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Title, Paragraph, Button, Card } from "react-native-paper";
import { useAuthStore } from "../../../core/stores/authStore";

export default function RoleDashboardPlaceholder({ role }: { role: string }) {
    const { setSelectedDashboard } = useAuthStore();
    return (
        <SafeAreaView style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.title}>Coming soon</Title>
                    <Paragraph style={styles.text}>
                        The {role} dashboard isn't available in mobile yet. You can switch to another role.
                    </Paragraph>
                    <Button mode="contained" onPress={() => setSelectedDashboard(null)}>
                        Choose another dashboard
                    </Button>
                </Card.Content>
            </Card>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FAFAFA", padding: 16, justifyContent: "center" },
    card: { borderRadius: 12 },
    title: { fontSize: 22, fontWeight: "700", color: "#2E7D32", marginBottom: 8 },
    text: { color: "#616161", marginBottom: 16 },
});
