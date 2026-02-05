import React, { useCallback, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Portal, Dialog, Button, Text } from "react-native-paper";
import { useAuthStore } from "../../core/stores/authStore";
import Icon from "../../components/icons/Icon";
import { useNavigation } from "@react-navigation/native";
import ScreenLayout from "../../components/layout/ScreenLayout";
import { isAIAssistantEnabled } from "../../core/config/featureFlags";

const roleLabels: Record<string, string> = {
    government_emission: "Government Emission",
    urban_greening: "Urban Greening",
};

export default function DashboardSelectorScreen() {
    const navigation = useNavigation();
    const { getUserRoles, setSelectedDashboard, logout, permissions, isSuperAdmin } = useAuthStore();
    const allRoles = useMemo(() => getUserRoles(), [getUserRoles]);

    const hasAnyPermission = useCallback(
        (prefixes: string[]) => permissions.some((perm) => prefixes.some((p) => perm.startsWith(p))),
        [permissions]
    );

    const roles = useMemo(() => {
        if (isSuperAdmin) {
            return ["government_emission", "urban_greening"];
        }

        const roleSet = new Set(
            allRoles.filter((role) => role !== "admin" && role !== "super_admin")
        );

        const emissionPrefixes = ["office.", "vehicle.", "test.", "schedule."];
        const greeningPrefixes = [
            "tree_species.",
            "tree.",
            "tree_project.",
            "tree_request.",
            "monitoring_log.",
            "urban_project.",
            "planting.",
            "sapling_collection.",
            "fee.",
            "processing_standard.",
        ];

        if (hasAnyPermission(emissionPrefixes)) {
            roleSet.add("government_emission");
        }
        if (hasAnyPermission(greeningPrefixes)) {
            roleSet.add("urban_greening");
        }

        return Array.from(roleSet);
    }, [allRoles, hasAnyPermission, isSuperAdmin]);
    const [logoutVisible, setLogoutVisible] = useState(false);
    const insets = useSafeAreaInsets();

    const roleImageMap: Record<string, any> = {
        government_emission: require("../../../assets/images/bg_govemissions.jpg"),
        urban_greening: require("../../../assets/images/bg_envicompliance.jpg"),
    };

    const handleSelect = async (role: string) => {
        await setSelectedDashboard(role);
    };

    return (
        <>
            <ScreenLayout>
                {/* Header with Profile and Logout */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Image
                            source={require("../../../assets/images/logo_app.png")}
                            style={styles.appLogo}
                            resizeMode="contain"
                            accessibilityLabel="EnviroTrace"
                        />
                        <Text style={styles.appName}>EnviroTrace</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={() => (navigation as any).navigate('ProfileHome')} style={styles.headerButton}>
                            <Icon name="UserCircle" size={20} color="#64748B" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setLogoutVisible(true)} style={styles.headerButton}>
                            <Icon name="LogOut" size={20} color="#64748B" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + insets.bottom }]}
                >
                        {/* Welcome Section */}
                        <View style={styles.welcomeSection}>
                            <Text style={styles.welcomeTitle}>Select Dashboard</Text>
                            <Text style={styles.welcomeSubtitle}>
                                Choose your workflow to continue
                            </Text>
                        </View>

                        {/* AI Assistant Card */}
                        {isAIAssistantEnabled && (
                            <TouchableOpacity onPress={() => (navigation as any).navigate('AIAssistant')} activeOpacity={0.8}>
                                <View style={styles.aiCard}>
                                    <View style={styles.aiIconContainer}>
                                        <Icon name="Bot" size={24} color="#FFFFFF" />
                                    </View>
                                    <View style={styles.aiTextContainer}>
                                        <Text style={styles.aiTitle}>AI Assistant</Text>
                                        <View style={styles.aiStatus}>
                                            <View style={styles.statusDot} />
                                            <Text style={styles.statusText}>Online & Ready</Text>
                                        </View>
                                    </View>
                                    <Icon name="ChevronRight" size={20} color="#3A5A7A" />
                                </View>
                            </TouchableOpacity>
                        )}

                        {/* Dashboard Cards */}
                        <View style={styles.dashboardsSection}>
                            <Text style={styles.sectionTitle}>Your Dashboards</Text>
                            <View style={styles.grid}>
                                {roles.map((r) => {
                                    const icon = r === "government_emission" ? "Car" :
                                        r === "urban_greening" ? "TreePalm" : "LayoutDashboard";

                                    const description = r === "government_emission"
                                        ? "Vehicles, testing, and offices"
                                        : r === "urban_greening"
                                            ? "Urban greening and requests"
                                            : undefined;

                                    const bg = roleImageMap[r];
                                    return (
                                        <TouchableOpacity key={r} onPress={() => handleSelect(r)} activeOpacity={0.7}>
                                            <View style={styles.dashboardCard}>
                                                <View style={styles.dashboardIconContainer}>
                                                    <Icon name={icon as any} size={24} color="#FFFFFF" />
                                                </View>
                                                <View style={styles.dashboardTextContainer}>
                                                    <Text style={styles.dashboardTitle}>{roleLabels[r] ?? r}</Text>
                                                    {!!description && (
                                                        <Text style={styles.dashboardDesc}>{description}</Text>
                                                    )}
                                                </View>
                                                <Icon name="ChevronRight" size={20} color="#64748B" />
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {roles.length === 0 && (
                            <View style={styles.noRolesContainer}>
                                <Text style={styles.noRoles}>No dashboards assigned to your account.</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={styles.footerVersionBadge}>
                            <Text style={styles.footerVersion}>v1.0.0</Text>
                        </View>
                    </View>
            </ScreenLayout>

            <Portal>
                <Dialog visible={logoutVisible} onDismiss={() => setLogoutVisible(false)} style={styles.dialog}>
                    <View style={styles.dialogTitle}>
                        <View style={styles.logoutIconContainer}>
                            <Icon name="LogOut" size={32} color="#EF4444" />
                        </View>
                    </View>
                    <Dialog.Content style={styles.logoutContent}>
                        <Text style={styles.logoutTitle}>Sign out of your account?</Text>
                        <Text style={styles.logoutMessage}>
                            You'll need to sign in again to access your dashboards and data.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions style={styles.dialogActions}>
                        <Button
                            mode="outlined"
                            onPress={() => setLogoutVisible(false)}
                            style={styles.cancelButton}
                            labelStyle={styles.cancelButtonText}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            buttonColor="#EF4444"
                            onPress={async () => {
                                setLogoutVisible(false);
                                await logout();
                            }}
                            style={styles.logoutButton}
                        >
                            Sign Out
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 28,
        paddingVertical: 16,
        backgroundColor: "transparent",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    appLogo: {
        width: 40,
        height: 40,
    },
    appName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        letterSpacing: -0.5,
    },
    headerActions: {
        flexDirection: "row",
        gap: 8,
    },
    headerButton: {
        padding: 8,
        borderRadius: 10,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderWidth: 1,
        borderColor: "rgba(226, 232, 240, 0.5)",
    },
    scrollContent: {
        paddingHorizontal: 28,
        paddingTop: 20,
        gap: 24,
    },
    welcomeSection: {
        alignItems: "center",
        marginBottom: 8,
        paddingHorizontal: 16,
        width: "100%",
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 6,
        textAlign: "center",
        letterSpacing: -1,
    },
    welcomeSubtitle: {
        fontSize: 13,
        color: "#54779C",
        textAlign: "center",
        fontWeight: "600",
        letterSpacing: 0.5,
    },
    aiCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 18,
        gap: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    aiIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#3A5A7A",
        alignItems: "center",
        justifyContent: "center",
    },
    aiTextContainer: {
        flex: 1,
        gap: 4,
    },
    aiTitle: {
        color: "#111827",
        fontSize: 16,
        fontWeight: "700",
    },
    aiStatus: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#10B981",
    },
    statusText: {
        color: "#6B7280",
        fontSize: 12,
        fontWeight: "600",
    },
    dashboardsSection: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        letterSpacing: -0.3,
        marginBottom: 4,
    },
    grid: {
        gap: 12,
    },
    dashboardCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 18,
        gap: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    dashboardIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#3A5A7A",
        alignItems: "center",
        justifyContent: "center",
    },
    dashboardTextContainer: {
        flex: 1,
    },
    dashboardTitle: {
        color: "#111827",
        fontWeight: "700",
        fontSize: 16,
        marginBottom: 2,
        letterSpacing: -0.3,
    },
    dashboardDesc: {
        color: "#6B7280",
        fontSize: 13,
    },
    noRolesContainer: {
        alignItems: "center",
        paddingVertical: 32,
    },
    noRoles: {
        textAlign: "center",
        color: "#9CA3AF",
        fontSize: 14,
        fontWeight: "500",
    },
    footer: {
        paddingVertical: 16,
        paddingHorizontal: 28,
        alignItems: "center",
    },
    footerVersionBadge: {
        backgroundColor: "rgba(55, 65, 81, 0.9)",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
    },
    footerVersion: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 0.5,
    },
    // Dialog Styles
    dialog: {
        borderRadius: 24,
        backgroundColor: "#FFFFFF",
    },
    dialogTitle: {
        paddingTop: 28,
        paddingBottom: 12,
        alignItems: "center",
    },
    dialogActions: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        gap: 12,
    },
    logoutIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#FEE2E2",
        alignItems: "center",
        justifyContent: "center",
    },
    logoutContent: {
        paddingHorizontal: 24,
        gap: 12,
        paddingBottom: 8,
    },
    logoutTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0F172A",
        textAlign: "center",
    },
    logoutMessage: {
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 20,
    },
    cancelButton: {
        flex: 1,
        borderColor: "#E2E8F0",
        borderRadius: 12,
    },
    cancelButtonText: {
        color: "#64748B",
        fontWeight: "600",
    },
    logoutButton: {
        flex: 1,
        borderRadius: 12,
    },
});
