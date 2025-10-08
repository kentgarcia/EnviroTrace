import React, { useState } from "react";
import { View, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, Card, Divider, Portal, Dialog, Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "../../components/icons/Icon";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../core/stores/authStore";

const roleLabels: Record<string, string> = {
    government_emission: "Government Emission",
    air_quality: "Air Quality",
    tree_management: "Tree Management",
    admin: "Administrator",
};

const roleIcons: Record<string, string> = {
    government_emission: "Car",
    air_quality: "Wind",
    tree_management: "TreePalm",
    admin: "ShieldCheck",
};

export default function ProfileScreen() {
    const navigation = useNavigation();
    const { user, getUserRoles, logout } = useAuthStore();
    const insets = useSafeAreaInsets();
    const allRoles = getUserRoles();
    const [logoutVisible, setLogoutVisible] = useState(false);

    const handleLogout = async () => {
        setLogoutVisible(false);
        await logout();
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
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="ChevronRight" size={24} color="#475569" style={{ transform: [{ rotate: "180deg" }] }} />
                    </TouchableOpacity>
                    <Text variant="headlineSmall" style={styles.headerTitle}>Profile</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + insets.bottom }]}
                >
                    {/* Profile Header Card with Gradient Background */}
                    <Card style={styles.profileCard} elevation={0}>
                        <LinearGradient
                            colors={["#3B82F6", "#2563EB"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.profileGradient}
                        >
                            <View style={styles.profileHeader}>
                                <View style={styles.avatarContainer}>
                                    <View style={styles.avatarCircle}>
                                        <Icon name="UserCircle" size={56} color="#FFFFFF" />
                                    </View>
                                </View>
                                <View style={styles.profileInfo}>
                                    <Text variant="headlineMedium" style={styles.profileName}>
                                        {user?.full_name || "User"}
                                    </Text>
                                    {!!user?.email && (
                                        <View style={styles.emailRow}>
                                            <Icon name="MessageCircle" size={16} color="rgba(255, 255, 255, 0.85)" />
                                            <Text style={styles.profileEmail}>{user.email}</Text>
                                        </View>
                                    )}
                                    <View style={styles.statusBadge}>
                                        <View style={styles.statusDot} />
                                        <Text style={styles.statusText}>Active Account</Text>
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                    </Card>

                    {/* Quick Stats Row */}
                    <View style={styles.statsRow}>
                        <Card style={styles.statCard} elevation={0}>
                            <View style={styles.statContent}>
                                <View style={[styles.statIconContainer, { backgroundColor: "#EFF6FF" }]}>
                                    <Icon name="Shield" size={20} color="#3B82F6" />
                                </View>
                                <Text style={styles.statValue}>{allRoles.length}</Text>
                                <Text style={styles.statLabel}>Active Roles</Text>
                            </View>
                        </Card>
                        <Card style={styles.statCard} elevation={0}>
                            <View style={styles.statContent}>
                                <View style={[styles.statIconContainer, { backgroundColor: "#F0FDF4" }]}>
                                    <Icon name="ShieldCheck" size={20} color="#10B981" />
                                </View>
                                <Text style={styles.statValue}>Verified</Text>
                                <Text style={styles.statLabel}>Account Status</Text>
                            </View>
                        </Card>
                    </View>

                    {/* Assigned Roles Card */}
                    <Card style={styles.card} elevation={0}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardTitleRow}>
                                <View style={styles.titleIconContainer}>
                                    <Icon name="LayoutDashboard" size={20} color="#FFFFFF" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text variant="titleMedium" style={styles.cardTitle}>Dashboard Access</Text>
                                    <Text style={styles.cardSubtitle}>Your assigned workflows</Text>
                                </View>
                            </View>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.cardContent}>
                            {allRoles.length > 0 ? (
                                <View style={styles.rolesContainer}>
                                    {allRoles.map((role, index) => (
                                        <View key={role}>
                                            <View style={styles.roleItem}>
                                                <View style={styles.roleIconCircle}>
                                                    <Icon
                                                        name={roleIcons[role] || "LayoutDashboard"}
                                                        size={20}
                                                        color="#3B82F6"
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
                                                <Icon name="ChevronRight" size={20} color="#CBD5E1" />
                                            </View>
                                            {index < allRoles.length - 1 && <Divider style={styles.roleDivider} />}
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.noRolesText}>No roles assigned yet</Text>
                            )}
                        </View>
                    </Card>

                    {/* Account Settings Card */}
                    <Card style={styles.card} elevation={0}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardTitleRow}>
                                <View style={[styles.titleIconContainer, { backgroundColor: "#8B5CF6" }]}>
                                    <Icon name="Settings" size={20} color="#FFFFFF" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text variant="titleMedium" style={styles.cardTitle}>Account Settings</Text>
                                    <Text style={styles.cardSubtitle}>Manage your account</Text>
                                </View>
                            </View>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.cardContent}>
                            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
                                <View style={styles.settingLeft}>
                                    <View style={styles.settingIconContainer}>
                                        <Icon name="Lock" size={18} color="#64748B" />
                                    </View>
                                    <Text style={styles.settingText}>Change Password</Text>
                                </View>
                                <Icon name="ChevronRight" size={20} color="#CBD5E1" />
                            </TouchableOpacity>
                            <Divider style={styles.roleDivider} />
                            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
                                <View style={styles.settingLeft}>
                                    <View style={styles.settingIconContainer}>
                                        <Icon name="Bell" size={18} color="#64748B" />
                                    </View>
                                    <Text style={styles.settingText}>Notifications</Text>
                                </View>
                                <Icon name="ChevronRight" size={20} color="#CBD5E1" />
                            </TouchableOpacity>
                            <Divider style={styles.roleDivider} />
                            <TouchableOpacity
                                style={styles.settingItem}
                                activeOpacity={0.7}
                                onPress={() => setLogoutVisible(true)}
                            >
                                <View style={styles.settingLeft}>
                                    <View style={[styles.settingIconContainer, { backgroundColor: "#FEE2E2" }]}>
                                        <Icon name="LogOut" size={18} color="#EF4444" />
                                    </View>
                                    <Text style={[styles.settingText, { color: "#EF4444" }]}>Sign Out</Text>
                                </View>
                                <Icon name="ChevronRight" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    </Card>
                </ScrollView>
            </SafeAreaView>

            {/* Logout Confirmation Dialog */}
            <Portal>
                <Dialog visible={logoutVisible} onDismiss={() => setLogoutVisible(false)} style={styles.dialog}>
                    <View style={styles.dialogContent}>
                        <View style={styles.dialogIconContainer}>
                            <Icon name="LogOut" size={32} color="#EF4444" />
                        </View>
                        <Dialog.Title style={styles.dialogTitle}>Sign Out</Dialog.Title>
                        <Dialog.Content>
                            <Text style={styles.dialogText}>
                                Are you sure you want to sign out? You'll need to log in again to access your dashboards.
                            </Text>
                        </Dialog.Content>
                        <Dialog.Actions style={styles.dialogActions}>
                            <Button
                                onPress={() => setLogoutVisible(false)}
                                style={styles.dialogButton}
                                labelStyle={styles.cancelButtonLabel}
                            >
                                Cancel
                            </Button>
                            <Button
                                onPress={handleLogout}
                                style={[styles.dialogButton, styles.logoutButton]}
                                labelStyle={styles.logoutButtonLabel}
                            >
                                Sign Out
                            </Button>
                        </Dialog.Actions>
                    </View>
                </Dialog>
            </Portal>
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
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: "rgba(241, 245, 249, 0.8)",
    },
    headerTitle: {
        color: "#1E293B",
        fontWeight: "700",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        gap: 16,
    },

    // Profile Header Card Styles
    profileCard: {
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#BFDBFE",
        overflow: "hidden",
    },
    profileGradient: {
        padding: 24,
    },
    profileHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
    },
    avatarContainer: {
        borderRadius: 60,
        padding: 4,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    avatarCircle: {
        width: 104,
        height: 104,
        borderRadius: 52,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: "rgba(255, 255, 255, 0.3)",
    },
    profileInfo: {
        flex: 1,
        gap: 8,
    },
    profileName: {
        color: "#FFFFFF",
        fontWeight: "700",
    },
    emailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    profileEmail: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.85)",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)",
        alignSelf: "flex-start",
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#FFFFFF",
    },
    statusText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },

    // Stats Row Styles
    statsRow: {
        flexDirection: "row",
        gap: 12,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    statContent: {
        padding: 20,
        alignItems: "center",
        gap: 8,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    statValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0F172A",
    },
    statLabel: {
        fontSize: 12,
        color: "#64748B",
        textAlign: "center",
    },

    // Card Styles
    card: {
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    cardHeader: {
        padding: 20,
        paddingBottom: 16,
    },
    cardTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    titleIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#3B82F6",
        alignItems: "center",
        justifyContent: "center",
    },
    cardTitle: {
        color: "#0F172A",
        fontWeight: "700",
    },
    cardSubtitle: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 2,
    },
    divider: {
        backgroundColor: "#E2E8F0",
    },
    cardContent: {
        padding: 20,
        paddingTop: 16,
    },

    // Roles List Styles
    rolesContainer: {
        gap: 0,
    },
    roleItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
    },
    roleIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#EFF6FF",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },
    roleDetails: {
        flex: 1,
        gap: 2,
    },
    roleName: {
        fontSize: 15,
        color: "#0F172A",
        fontWeight: "600",
    },
    roleDescription: {
        fontSize: 12,
        color: "#64748B",
    },
    roleDivider: {
        backgroundColor: "#F1F5F9",
    },
    noRolesText: {
        fontSize: 14,
        color: "#94A3B8",
        fontStyle: "italic",
        textAlign: "center",
        paddingVertical: 8,
    },

    // Settings Styles
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
    },
    settingLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    settingIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#F8FAFC",
        alignItems: "center",
        justifyContent: "center",
    },
    settingText: {
        fontSize: 15,
        color: "#0F172A",
        fontWeight: "500",
    },

    // Dialog Styles
    dialog: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
    },
    dialogContent: {
        alignItems: "center",
    },
    dialogIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#FEE2E2",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 24,
        marginBottom: 16,
    },
    dialogTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0F172A",
        textAlign: "center",
    },
    dialogText: {
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
    dialogButton: {
        borderRadius: 12,
        paddingVertical: 4,
    },
    cancelButtonLabel: {
        color: "#64748B",
        fontWeight: "600",
    },
    logoutButton: {
        backgroundColor: "#EF4444",
    },
    logoutButtonLabel: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
});
