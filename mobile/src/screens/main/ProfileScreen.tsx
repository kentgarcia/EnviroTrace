import React, { useState } from "react";
import { View, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, Portal, Dialog, Button } from "react-native-paper";
import Icon from "../../components/icons/Icon";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../core/stores/authStore";

const roleLabels: Record<string, string> = {
    government_emission: "Government Emission",
    tree_management: "Tree Management",
    admin: "Administrator",
};

const roleIcons: Record<string, string> = {
    government_emission: "Car",
    tree_management: "TreePalm",
    admin: "ShieldCheck",
};

export default function ProfileScreen() {
    const navigation = useNavigation();
    const { user, getUserRoles, logout } = useAuthStore();
    const insets = useSafeAreaInsets();
    const allRoles = getUserRoles().filter(r => r !== "air_quality");
    const [logoutVisible, setLogoutVisible] = useState(false);

    const handleLogout = async () => {
        setLogoutVisible(false);
        await logout();
    };

    return (
        <>
            <View style={styles.root}>
                <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

                {/* Background Image - same as login and dashboard selector */}
                <View style={styles.backgroundImageWrapper} pointerEvents="none">
                    <Image
                        source={require("../../../assets/images/bg_login.png")}
                        style={styles.backgroundImage}
                        resizeMode="cover"
                        accessibilityIgnoresInvertColors
                    />
                </View>

                <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Icon name="ChevronRight" size={20} color="#64748B" style={{ transform: [{ rotate: "180deg" }] }} />
                        </TouchableOpacity>
                        <View style={styles.headerCenter}>
                            <Image
                                source={require("../../../assets/images/logo_app.png")}
                                style={styles.appLogo}
                                resizeMode="contain"
                                accessibilityLabel="EnviroTrace"
                            />
                            <Text style={styles.appName}>EnviroTrace</Text>
                        </View>
                        <View style={{ width: 36 }} />
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + insets.bottom }]}
                    >
                        {/* Profile Header Card */}
                        <View style={styles.profileSection}>
                            <View style={styles.profileCard}>
                                <View style={styles.avatarContainer}>
                                    <View style={styles.avatarCircle}>
                                        <Icon name="UserCircle" size={48} color="#3A5A7A" />
                                    </View>
                                </View>
                                <View style={styles.profileInfo}>
                                    <Text style={styles.profileName}>
                                        {user?.full_name || "User"}
                                    </Text>
                                    {!!user?.email && (
                                        <View style={styles.emailRow}>
                                            <Icon name="Mail" size={14} color="#6B7280" />
                                            <Text style={styles.profileEmail}>{user.email}</Text>
                                        </View>
                                    )}
                                    <View style={styles.statusBadge}>
                                        <View style={styles.statusDot} />
                                        <Text style={styles.statusText}>Active</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Assigned Roles Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Icon name="LayoutDashboard" size={18} color="#111827" />
                                <Text style={styles.sectionTitle}>Dashboard Access</Text>
                            </View>
                            {allRoles.length > 0 ? (
                                <View style={styles.rolesContainer}>
                                    {allRoles.map((role) => (
                                        <View key={role} style={styles.roleItem}>
                                            <View style={styles.roleIconCircle}>
                                                <Icon
                                                    name={roleIcons[role] || "LayoutDashboard"}
                                                    size={20}
                                                    color="#FFFFFF"
                                                />
                                            </View>
                                            <View style={styles.roleDetails}>
                                                <Text style={styles.roleName}>
                                                    {roleLabels[role] || role}
                                                </Text>
                                                <Text style={styles.roleDescription}>
                                                    Full access granted
                                                </Text>
                                            </View>
                                            <Icon name="CheckCircle" size={18} color="#10B981" />
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.noRolesContainer}>
                                    <Text style={styles.noRolesText}>No roles assigned yet</Text>
                                </View>
                            )}
                        </View>

                        {/* Account Settings Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Icon name="Settings" size={18} color="#111827" />
                                <Text style={styles.sectionTitle}>Account Settings</Text>
                            </View>
                            <View style={styles.settingsContainer}>
                                <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
                                    <View style={styles.settingIconContainer}>
                                        <Icon name="Lock" size={18} color="#FFFFFF" />
                                    </View>
                                    <Text style={styles.settingText}>Change Password</Text>
                                    <Icon name="ChevronRight" size={18} color="#64748B" />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
                                    <View style={styles.settingIconContainer}>
                                        <Icon name="Bell" size={18} color="#FFFFFF" />
                                    </View>
                                    <Text style={styles.settingText}>Notifications</Text>
                                    <Icon name="ChevronRight" size={18} color="#64748B" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.settingItem}
                                    activeOpacity={0.7}
                                    onPress={() => (navigation as any).navigate("NetworkDiagnostics")}
                                >
                                    <View style={[styles.settingIconContainer, { backgroundColor: "#3B82F6" }]}>
                                        <Icon name="Activity" size={18} color="#FFFFFF" />
                                    </View>
                                    <Text style={styles.settingText}>Network Diagnostics</Text>
                                    <Icon name="ChevronRight" size={18} color="#64748B" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.settingItem}
                                    activeOpacity={0.7}
                                    onPress={() => setLogoutVisible(true)}
                                >
                                    <View style={[styles.settingIconContainer, { backgroundColor: "#EF4444" }]}>
                                        <Icon name="LogOut" size={18} color="#FFFFFF" />
                                    </View>
                                    <Text style={[styles.settingText, { color: "#EF4444" }]}>Sign Out</Text>
                                    <Icon name="ChevronRight" size={18} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={styles.footerVersionBadge}>
                            <Text style={styles.footerVersion}>v1.0.0</Text>
                        </View>
                    </View>
                </SafeAreaView>

                {/* Logout Confirmation Dialog */}
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
                                onPress={handleLogout}
                                style={styles.logoutButton}
                            >
                                Sign Out
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    backgroundImageWrapper: {
        position: "absolute" as const,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    backgroundImage: {
        width: "100%",
        height: "100%",
        position: "absolute" as const,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 28,
        paddingVertical: 16,
        backgroundColor: "transparent",
    },
    backButton: {
        padding: 8,
        borderRadius: 10,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderWidth: 1,
        borderColor: "rgba(226, 232, 240, 0.5)",
    },
    headerCenter: {
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
    scrollContent: {
        paddingHorizontal: 28,
        paddingTop: 20,
        gap: 24,
    },
    // Profile Section
    profileSection: {
        marginBottom: 8,
    },
    profileCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 20,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    avatarContainer: {
        alignItems: "center",
        marginBottom: 16,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#EFF6FF",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#BFDBFE",
    },
    profileInfo: {
        alignItems: "center",
        gap: 8,
    },
    profileName: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
        letterSpacing: -0.5,
    },
    emailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    profileEmail: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#F0FDF4",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#BBF7D0",
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#10B981",
    },
    statusText: {
        color: "#10B981",
        fontSize: 12,
        fontWeight: "600",
    },
    // Sections
    section: {
        gap: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        letterSpacing: -0.3,
    },
    // Roles Container
    rolesContainer: {
        gap: 12,
    },
    roleItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 16,
        gap: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    roleIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#3A5A7A",
        alignItems: "center",
        justifyContent: "center",
    },
    roleDetails: {
        flex: 1,
    },
    roleName: {
        fontSize: 16,
        color: "#111827",
        fontWeight: "700",
        marginBottom: 2,
        letterSpacing: -0.3,
    },
    roleDescription: {
        fontSize: 13,
        color: "#6B7280",
    },
    noRolesContainer: {
        alignItems: "center",
        paddingVertical: 24,
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    noRolesText: {
        textAlign: "center",
        color: "#9CA3AF",
        fontSize: 14,
        fontWeight: "500",
    },
    // Settings Container
    settingsContainer: {
        gap: 12,
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 16,
        gap: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    settingIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#3A5A7A",
        alignItems: "center",
        justifyContent: "center",
    },
    settingText: {
        flex: 1,
        fontSize: 16,
        color: "#111827",
        fontWeight: "600",
        letterSpacing: -0.3,
    },
    // Footer
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
    dialogActions: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        gap: 12,
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
