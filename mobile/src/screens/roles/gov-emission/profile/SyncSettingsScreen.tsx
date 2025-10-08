import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Title, Paragraph, Switch, Button, Divider, useTheme, Menu } from "react-native-paper";
import StandardHeader from "../../../../components/layout/StandardHeader";
import Icon from "../../../../components/icons/Icon";
import { useNetworkSync } from "../../../../hooks/useNetworkSync";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "sync_settings";

type SyncSettings = {
    autoSync: boolean;
    wifiOnly: boolean;
    intervalMinutes: number; // 5, 15, 30, 60
};

export default function SyncSettingsScreen() {
    const { colors } = useTheme();
    const { isSyncing, lastSyncTime, syncData } = useNetworkSync();
    const [settings, setSettings] = useState<SyncSettings>({ autoSync: true, wifiOnly: false, intervalMinutes: 15 });
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const raw = await AsyncStorage.getItem(SETTINGS_KEY);
                if (raw) setSettings(JSON.parse(raw));
            } catch { }
        };
        load();
    }, []);

    const save = async (next: Partial<SyncSettings>) => {
        const merged = { ...settings, ...next };
        setSettings(merged);
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    };

    return (
        <>
            <StandardHeader title="Sync Settings" showBack />
            <View style={styles.container}>
                <View style={styles.card}>
                    <Title style={styles.title}>Synchronization</Title>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Paragraph style={styles.rowTitle}>Auto Sync</Paragraph>
                            <Paragraph style={styles.sub}>Automatically sync in the background</Paragraph>
                        </View>
                        <Switch value={settings.autoSync} onValueChange={(v) => save({ autoSync: v })} />
                    </View>
                    <Divider />
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Paragraph style={styles.rowTitle}>Wi‑Fi Only</Paragraph>
                            <Paragraph style={styles.sub}>Sync only on Wi‑Fi connections</Paragraph>
                        </View>
                        <Switch value={settings.wifiOnly} onValueChange={(v) => save({ wifiOnly: v })} />
                    </View>
                    <Divider />
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Paragraph style={styles.rowTitle}>Sync Interval</Paragraph>
                            <Paragraph style={styles.sub}>{settings.intervalMinutes} minutes</Paragraph>
                        </View>
                        <Menu
                            visible={menuVisible}
                            onDismiss={() => setMenuVisible(false)}
                            anchor={
                                <Button mode="outlined" onPress={() => setMenuVisible(true)} style={styles.intervalBtn}>
                                    {settings.intervalMinutes} minutes
                                </Button>
                            }
                        >
                            {[5, 15, 30, 60].map((m) => (
                                <Menu.Item
                                    key={m}
                                    onPress={async () => {
                                        await save({ intervalMinutes: m });
                                        setMenuVisible(false);
                                    }}
                                    title={`${m} minutes`}
                                    trailingIcon={settings.intervalMinutes === m ? "check" : undefined}
                                />
                            ))}
                        </Menu>
                    </View>
                </View>

                <View style={styles.actions}>
                    <Button
                        mode="contained"
                        onPress={async () => await syncData()}
                        loading={isSyncing}
                        disabled={isSyncing}
                        icon={() => <Icon name="sync" size={16} color="#FFFFFF" />}
                    >
                        Sync Now
                    </Button>
                    <Paragraph style={styles.lastSync}>
                        Last sync: {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : "Never"}
                    </Paragraph>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: "#FAFAFA", flex: 1 },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 16,
        marginBottom: 16,
    },
    title: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 8 },
    row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
    rowTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
    sub: { fontSize: 12, color: "#6B7280" },
    intervalBtns: { flexDirection: "row", gap: 6 },
    intervalBtn: { borderColor: "#E5E7EB" },
    actions: { gap: 8 },
    lastSync: { fontSize: 12, color: "#6B7280", textAlign: "center" },
});
