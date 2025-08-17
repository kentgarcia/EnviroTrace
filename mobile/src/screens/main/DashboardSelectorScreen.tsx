import React, { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, StatusBar } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Appbar, Card, Title, Paragraph, Chip, Avatar, useTheme, Portal, Dialog, Button } from "react-native-paper";
import { ImageBackground, View as RNView } from "react-native";
import { useAuthStore } from "../../core/stores/authStore";

const roleLabels: Record<string, string> = {
    admin: "Admin Dashboard",
    government_emission: "Government Emission",
    air_quality: "Air Quality",
    tree_management: "Tree Management",
};

export default function DashboardSelectorScreen() {
    const { user, getUserRoles, setSelectedDashboard, logout } = useAuthStore();
    const roles = useMemo(() => getUserRoles(), [getUserRoles]);
    const { colors } = useTheme();
    const [profileVisible, setProfileVisible] = useState(false);
    const [logoutVisible, setLogoutVisible] = useState(false);
    const insets = useSafeAreaInsets();

    const roleImageMap: Record<string, any> = {
        government_emission: require("../../../assets/images/bg_govemissions.jpg"),
        air_quality: require("../../../assets/images/bg_asbu.jpg"),
        tree_management: require("../../../assets/images/bg_envicompliance.jpg"),
        admin: require("../../../assets/images/bg_envicompliance.jpg"),
    };

    const handleSelect = async (role: string) => {
        await setSelectedDashboard(role);
    };

    return (
        <>
            <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
            <SafeAreaView style={[styles.headerSafeArea, { backgroundColor: colors.primary }]} edges={["top"]}>
                <Appbar.Header elevated statusBarHeight={0} style={{ backgroundColor: colors.primary }}>
                    <Appbar.Content title="Select dashboard" color="#FFFFFF" />
                    <Appbar.Action icon="account-circle" color="#FFFFFF" onPress={() => setProfileVisible(true)} accessibilityLabel="Profile" />
                    <Appbar.Action icon="logout" color="#FFFFFF" onPress={() => setLogoutVisible(true)} accessibilityLabel="Logout" />
                </Appbar.Header>
            </SafeAreaView>

            <SafeAreaView style={styles.container} edges={["left", "right"]}>
                <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 16 + insets.bottom }]}>
                    <Title style={[styles.title, { color: colors.primary }]}>Choose your dashboard</Title>
                    <Paragraph style={styles.subtitle}>
                        Welcome{user?.full_name ? `, ${user.full_name}` : ""}. Pick a dashboard to continue.
                    </Paragraph>

                    <View style={styles.rolesHeader}>
                        <Chip icon="shield-check" style={styles.rolesChip}>
                            {roles.length} role{roles.length === 1 ? "" : "s"} available
                        </Chip>
                    </View>

                    <View style={styles.grid}>
                        {roles.map((r) => {
                            const icon = r === "government_emission" ? "car" :
                                r === "tree_management" ? "tree" :
                                    r === "air_quality" ? "weather-windy" :
                                        r === "admin" ? "shield" : "view-dashboard";

                            const description = r === "government_emission"
                                ? "Vehicles, testing, and offices"
                                : r === "tree_management"
                                    ? "Urban greening and requests"
                                    : r === "air_quality"
                                        ? "Monitoring and AQ metrics"
                                        : r === "admin"
                                            ? "Admin tools and management"
                                            : undefined;

                            const bg = roleImageMap[r];
                            return (
                                <Card key={r} style={styles.roleCard} onPress={() => handleSelect(r)}>
                                    {bg ? (
                                        <ImageBackground source={bg} style={styles.roleBg} imageStyle={styles.roleBgImage}>
                                            <RNView style={styles.roleOverlay} />
                                            <RNView style={styles.roleContentOnBg}>
                                                <Avatar.Icon
                                                    size={32}
                                                    icon={icon}
                                                    color="#FFFFFF"
                                                    style={styles.roleIconOnBg}
                                                />
                                                <Title style={styles.roleTitleOnBg}>{roleLabels[r] ?? r}</Title>
                                                {!!description && (
                                                    <Paragraph style={styles.roleDescOnBg}>{description}</Paragraph>
                                                )}
                                            </RNView>
                                        </ImageBackground>
                                    ) : (
                                        <RNView style={[styles.roleBg, styles.roleBgFallback]}>
                                            <RNView style={styles.roleContent}>
                                                <Avatar.Icon
                                                    size={36}
                                                    icon={icon}
                                                    color={colors.primary}
                                                    style={styles.roleIcon}
                                                />
                                                <Title style={styles.roleTitle}>{roleLabels[r] ?? r}</Title>
                                                {!!description && (
                                                    <Paragraph style={styles.roleDesc}>{description}</Paragraph>
                                                )}
                                            </RNView>
                                        </RNView>
                                    )}
                                </Card>
                            );
                        })}
                    </View>

                    {roles.length === 0 && (
                        <Paragraph style={styles.noRoles}>No roles found for this account.</Paragraph>
                    )}
                </ScrollView>

                <Portal>
                    <Dialog visible={profileVisible} onDismiss={() => setProfileVisible(false)}>
                        <Dialog.Title>Profile</Dialog.Title>
                        <Dialog.Content>
                            {!!user?.full_name && <Paragraph style={{ marginBottom: 4 }}>{user.full_name}</Paragraph>}
                            {!!user?.email && <Paragraph>{user.email}</Paragraph>}
                            <Paragraph style={{ marginTop: 8, color: "#6B7280" }}>
                                Roles: {roles.length ? roles.join(", ") : "None"}
                            </Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setProfileVisible(false)}>Close</Button>
                        </Dialog.Actions>
                    </Dialog>

                    <Dialog visible={logoutVisible} onDismiss={() => setLogoutVisible(false)}>
                        <Dialog.Title>Logout</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph>Are you sure you want to logout?</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setLogoutVisible(false)}>Cancel</Button>
                            <Button
                                mode="contained"
                                onPress={async () => {
                                    setLogoutVisible(false);
                                    await logout();
                                }}
                            >
                                Logout
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FAFAFA" },
    headerSafeArea: { flex: 0 },
    content: { padding: 16 },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
    subtitle: { color: "#616161", marginBottom: 16 },
    rolesHeader: { alignItems: "flex-start", marginBottom: 12 },
    rolesChip: { backgroundColor: "#E8F0FF" },
    grid: {
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: 12,
    },
    roleCard: {
        width: "100%",
        borderRadius: 12,
    },
    roleBg: {
        height: 160,
        overflow: "hidden",
        borderRadius: 12,
    },
    roleBgImage: {
        borderRadius: 12,
    },
    roleOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    roleContentOnBg: {
        flex: 1,
        padding: 12,
        justifyContent: "flex-end",
        gap: 6,
    },
    roleIconOnBg: {
        backgroundColor: "rgba(255,255,255,0.2)",
        alignSelf: "flex-start",
    },
    roleTitleOnBg: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    roleDescOnBg: {
        color: "#E5E7EB",
        fontSize: 12,
    },
    roleBgFallback: {
        backgroundColor: "#F3F4F6",
    },
    roleContent: {
        flex: 1,
        padding: 12,
        justifyContent: "center",
        gap: 8,
    },
    roleIcon: {
        backgroundColor: "rgba(0,53,149,0.08)",
    },
    roleTitle: { fontSize: 16, fontWeight: "700" },
    roleDesc: { color: "#6B7280", fontSize: 12 },
    noRoles: { textAlign: "center", color: "#9E9E9E", marginTop: 12 },
});
