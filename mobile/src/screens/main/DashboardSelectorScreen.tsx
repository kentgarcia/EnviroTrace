import React, { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, useTheme, Portal, Dialog, Button, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { View as RNView } from "react-native";
import { useAuthStore } from "../../core/stores/authStore";
import Icon from "../../components/icons/Icon";
import { useNavigation } from "@react-navigation/native";

const roleLabels: Record<string, string> = {
    government_emission: "Government Emission",
    air_quality: "Air Quality",
    tree_management: "Tree Management",
};

export default function DashboardSelectorScreen() {
    const navigation = useNavigation();
    const { user, getUserRoles, setSelectedDashboard, logout } = useAuthStore();
    const allRoles = useMemo(() => getUserRoles(), [getUserRoles]);
    // Filter out admin role for mobile app
    const roles = useMemo(() => allRoles.filter(role => role !== 'admin'), [allRoles]);
    const { colors } = useTheme();
    const [logoutVisible, setLogoutVisible] = useState(false);
    const insets = useSafeAreaInsets();

    const roleImageMap: Record<string, any> = {
        government_emission: require("../../../assets/images/bg_govemissions.jpg"),
        air_quality: require("../../../assets/images/bg_asbu.jpg"),
        tree_management: require("../../../assets/images/bg_envicompliance.jpg"),
    };

    const handleSelect = async (role: string) => {
        await setSelectedDashboard(role);
    };

    return (
        <>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
            <LinearGradient
                colors={["#F8FAFC", "#F1F5F9", "#E2E8F0"]}
                style={styles.gradientBackground}
                locations={[0, 0.55, 1]}
            />

            <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text variant="headlineMedium" style={styles.headerTitle}>Dashboard Hub</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={() => (navigation as any).navigate('ProfileHome')} style={styles.headerButton}>
                            <Icon name="UserCircle" size={24} color="#475569" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setLogoutVisible(true)} style={styles.headerButton}>
                            <Icon name="LogOut" size={24} color="#475569" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + insets.bottom }]}
                >
                    <Card style={styles.heroCard}>
                        <View style={styles.heroContent}>
                            <View style={styles.heroLogosRow}>
                                <Image
                                    source={require("../../../assets/images/logo_epnro.png")}
                                    style={styles.heroLogo}
                                    resizeMode="contain"
                                />
                                <Image
                                    source={require("../../../assets/images/logo_munti.png")}
                                    style={styles.heroLogo}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text variant="headlineMedium" style={styles.heroTitle}>Select your workflow</Text>
                            <Text variant="bodyMedium" style={styles.heroSubtitle}>
                                {roles.length ? `${roles.length} specialized experience${roles.length > 1 ? "s" : ""} ready to launch.` : "No assigned dashboards yet."}
                            </Text>
                            <View style={styles.heroMetaRow}>
                                <View style={styles.heroChipCustom}>
                                    <Icon name="ShieldCheck" size={14} color="#3B82F6" />
                                    <Text style={styles.heroChipText}>Secure Access</Text>
                                </View>
                                <View style={styles.heroChipCustom}>
                                    <Icon name="Clock" size={14} color="#3B82F6" />
                                    <Text style={styles.heroChipText}>Real-time data</Text>
                                </View>
                            </View>
                        </View>

                        {/* AI Assistant Integrated Section */}
                        <TouchableOpacity onPress={() => (navigation as any).navigate('AIAssistant')} activeOpacity={0.8}>
                            <LinearGradient
                                colors={["#3B82F6", "#2563EB"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.aiIntegratedSection}
                            >
                                <View style={styles.aiIntegratedContent}>
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
                                    <Icon name="ChevronRight" size={20} color="rgba(255, 255, 255, 0.8)" />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Card>

                    <View style={styles.grid}>
                        {roles.map((r) => {
                            const icon = r === "government_emission" ? "Car" :
                                r === "tree_management" ? "TreePalm" :
                                    r === "air_quality" ? "Wind" : "LayoutDashboard";

                            const description = r === "government_emission"
                                ? "Vehicles, testing, and offices"
                                : r === "tree_management"
                                    ? "Urban greening and requests"
                                    : r === "air_quality"
                                        ? "Monitoring and AQ metrics"
                                        : undefined;

                            const bg = roleImageMap[r];
                            return (
                                <Card key={r} style={styles.roleCard} mode="contained" onPress={() => handleSelect(r)}>
                                    <View style={styles.roleCardContent}>
                                        <View style={styles.roleIconContainer}>
                                            <Icon name={icon as any} size={24} color="#FFFFFF" />
                                        </View>
                                        <View style={styles.roleTextContainer}>
                                            <Text variant="titleMedium" style={styles.roleTitle}>{roleLabels[r] ?? r}</Text>
                                            {!!description && (
                                                <Text variant="bodySmall" style={styles.roleDesc}>{description}</Text>
                                            )}
                                        </View>
                                        <Icon name="ChevronRight" size={20} color="#94A3B8" />
                                    </View>
                                </Card>
                            );
                        })}
                    </View>

                    {roles.length === 0 && (
                        <Text variant="bodyMedium" style={styles.noRoles}>No roles found for this account.</Text>
                    )}
                </ScrollView>

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
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    gradientBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "transparent",
    },
    headerLeft: {
        flex: 1,
    },
    headerTitle: {
        color: "#1E293B",
        fontWeight: "700",
        fontSize: 28,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        color: "#64748B",
        marginTop: 2,
    },
    headerActions: {
        flexDirection: "row",
        gap: 8,
    },
    headerButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: "rgba(241, 245, 249, 0.8)",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 12,
        gap: 20,
    },
    heroCard: {
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        overflow: "hidden",
        elevation: 0,
    },
    heroContent: {
        padding: 28,
        gap: 20,
    },
    heroLogosRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
    },
    heroLogo: {
        width: 64,
        height: 64,
    },
    heroTitle: {
        color: "#1E293B",
        textAlign: "center",
        fontSize: 22,
        fontWeight: "600",
        letterSpacing: 0.3,
    },
    heroSubtitle: {
        color: "rgba(71, 85, 105, 0.85)",
        textAlign: "center",
        fontSize: 14,
        lineHeight: 22,
    },
    heroMetaRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
        flexWrap: "wrap",
    },
    heroChipCustom: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#EFF6FF",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },
    heroChipText: {
        color: "#1E40AF",
        fontSize: 11,
        fontWeight: "600",
    },
    grid: {
        flexDirection: "column",
        gap: 16,
    },
    roleCard: {
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        elevation: 0,
    },
    roleCardContent: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        gap: 16,
    },
    roleTextContainer: {
        flex: 1,
    },
    roleIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#3B82F6",
        alignItems: "center",
        justifyContent: "center",
    },
    roleTitle: {
        color: "#0F172A",
        fontWeight: "600",
        fontSize: 16,
        marginBottom: 2,
    },
    roleDesc: {
        color: "#64748B",
        fontSize: 13,
    },
    roleChevron: {
        backgroundColor: "transparent",
    },
    noRoles: {
        textAlign: "center",
        color: "rgba(100, 116, 139, 0.8)",
        marginTop: 24,
    },
    // Integrated AI Assistant
    aiIntegratedSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    aiIntegratedContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    aiIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        alignItems: "center",
        justifyContent: "center",
    },
    aiTextContainer: {
        flex: 1,
        gap: 4,
    },
    aiTitle: {
        color: "#FFFFFF",
        fontSize: 15,
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
        color: "rgba(255, 255, 255, 0.95)",
        fontSize: 11,
        fontWeight: "600",
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
    // Logout Dialog
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
    },
    cancelButtonText: {
        color: "#64748B",
    },
    logoutButton: {
        flex: 1,
    },
});
