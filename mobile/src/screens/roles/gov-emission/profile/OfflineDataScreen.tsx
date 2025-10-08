import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { Title, Paragraph, Button, Divider, useTheme } from "react-native-paper";
import StandardHeader from "../../../../components/layout/StandardHeader";
import Icon from "../../../../components/icons/Icon";
import { database } from "../../../../core/database/database";

export default function OfflineDataScreen() {
    const { colors } = useTheme();
    const [stats, setStats] = useState({ totalVehicles: 0, totalTests: 0, totalOffices: 0, pendingSync: 0 });
    const [loading, setLoading] = useState(false);

    const loadStats = async () => {
        const s = await database.getDashboardStats();
        setStats(s);
    };

    useEffect(() => {
        loadStats();
    }, []);

    const confirmClear = () => {
        Alert.alert(
            "Clear offline data",
            "This will remove all locally cached offices, vehicles, and tests. This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await database.clearAllData();
                            await loadStats();
                            Alert.alert("Done", "All local data cleared.");
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <>
            <StandardHeader title="Offline Data" showBack />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <Title style={styles.title}>Local Storage Overview</Title>
                    <View style={styles.row}><Paragraph>Total Offices</Paragraph><Paragraph>{stats.totalOffices}</Paragraph></View>
                    <Divider />
                    <View style={styles.row}><Paragraph>Total Vehicles</Paragraph><Paragraph>{stats.totalVehicles}</Paragraph></View>
                    <Divider />
                    <View style={styles.row}><Paragraph>Total Tests</Paragraph><Paragraph>{stats.totalTests}</Paragraph></View>
                    <Divider />
                    <View style={styles.row}><Paragraph>Pending Sync</Paragraph><Paragraph>{stats.pendingSync}</Paragraph></View>
                </View>

                <View style={styles.actions}>
                    <Button
                        mode="outlined"
                        onPress={loadStats}
                        style={styles.actionBtn}
                        icon={() => <Icon name="refresh-cw" size={16} color={colors.primary} />}
                    >
                        Refresh Stats
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={confirmClear}
                        style={styles.actionBtn}
                        textColor="#D32F2F"
                        icon={() => <Icon name="alert-circle" size={16} color="#D32F2F" />}
                        loading={loading}
                        disabled={loading}
                    >
                        Clear Local Data
                    </Button>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: "#FAFAFA" },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 16,
        marginBottom: 16,
    },
    title: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 8 },
    row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
    actions: { flexDirection: "row", gap: 8 },
    actionBtn: { flex: 1, borderColor: "#E5E7EB" },
});
