import React, { useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { Card, Text, Chip, Button } from "react-native-paper";
import Icon from "../../../components/icons/Icon";
import { useNavigation } from "@react-navigation/native";
import ScreenLayout from "../../../components/layout/ScreenLayout";
import { cardStyles } from "../../../styles/cardStyles";
import Svg, { Defs, LinearGradient, Stop, Rect, Line } from "react-native-svg";

import { useTreeManagementData } from "../../../hooks/useTreeManagementData";
import { useAuthStore } from "../../../core/stores/authStore";
import StatsCard from "../../../components/StatsCard";

export default function TreeManagementOverviewScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
    const { user } = useAuthStore();
    const { data, loading, refetch } = useTreeManagementData();
    const [headerDims, setHeaderDims] = useState({ width: 0, height: 0 });

    // Mock data - replace with actual API calls
    const dashboardStats = {
        totalRequests: data?.totalRequests || 145,
        pendingRequests: data?.pendingRequests || 23,
        completedThisMonth: data?.completedThisMonth || 18,
        totalTreesCut: data?.totalTreesCut || 67,
        totalTreesPruned: data?.totalTreesPruned || 124,
        totalComplaints: data?.totalComplaints || 15,
    };

    // Get user display name
    const getUserDisplayName = () => {
        if (user?.full_name) return user.full_name;
        if (user?.username) return user.username;
        return "User";
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refetch();
        } catch (error) {
            console.error("Refresh error:", error);
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <ScreenLayout
            header={{
                title: "Overview",
                subtitle: "Tree Management Dashboard",
                statusBarStyle: "dark",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderColor: "#E5E7EB",
                titleSize: 22,
                subtitleSize: 12,
                iconSize: 20,
            }}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#111827"]}
                        tintColor="#111827"
                    />
                }
            >
                    {/* Header Section */}
                    <View
                        style={styles.headerCard}
                        onLayout={(e) => setHeaderDims({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
                    >
                        {/* Gradient background with subtle grid */}
                        <View style={styles.headerBg}>
                            {headerDims.width > 0 && headerDims.height > 0 && (
                                <Svg width={headerDims.width} height={headerDims.height}>
                                    <Defs>
                                        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                            <Stop offset="0" stopColor="#111827" stopOpacity={1} />
                                            <Stop offset="1" stopColor="#111827" stopOpacity={0.85} />
                                        </LinearGradient>
                                    </Defs>
                                    <Rect x={0} y={0} width={headerDims.width} height={headerDims.height} fill="url(#grad)" />
                                    {/* Grid lines */}
                                    {Array.from({ length: Math.ceil(headerDims.width / 20) + 1 }).map((_, i) => (
                                        <Line
                                            key={`v-${i}`}
                                            x1={i * 20}
                                            y1={0}
                                            x2={i * 20}
                                            y2={headerDims.height}
                                            stroke="#FFFFFF"
                                            strokeOpacity={0.08}
                                            strokeWidth={1}
                                        />
                                    ))}
                                    {Array.from({ length: Math.ceil(headerDims.height / 20) + 1 }).map((_, i) => (
                                        <Line
                                            key={`h-${i}`}
                                            x1={0}
                                            y1={i * 20}
                                            x2={headerDims.width}
                                            y2={i * 20}
                                            stroke="#FFFFFF"
                                            strokeOpacity={0.08}
                                            strokeWidth={1}
                                        />
                                    ))}
                                </Svg>
                            )}
                        </View>

                        <View style={styles.headerContent}>
                            <View style={styles.welcomeSection}>
                                <Text style={styles.welcomeTitle}>
                                    Welcome, {getUserDisplayName()}
                                </Text>
                                <Text style={styles.welcomeSubtitle}>
                                    Tree Management Monitoring Dashboard
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Statistics Grid */}
                    <View style={styles.statsSection}>
                        <Text style={styles.sectionTitle}>Key Metrics</Text>
                        <View style={styles.statsGrid}>
                            <TouchableOpacity
                                style={styles.statCard}
                                onPress={() => navigation.navigate("TreeRequests" as never)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.statCardHeader}>
                                    <View style={[styles.statIconContainer, { backgroundColor: "#EEF2FF" }]}>
                                        <Icon name="ClipboardList" size={18} color="#111827" />
                                    </View>
                                    <View style={styles.statTrend}>
                                        <Icon name="TrendingUp" size={12} color="#10B981" />
                                        <Text style={styles.statTrendText}>+5%</Text>
                                    </View>
                                </View>
                                <View style={styles.statCardBody}>
                                    <Text style={styles.statValue}>{dashboardStats.totalRequests || 0}</Text>
                                    <Text style={styles.statLabel}>Total Requests</Text>
                                    <Text style={styles.statSubtitle}>All submissions</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.statCard}
                                onPress={() => navigation.navigate("TreeRequests" as never)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.statCardHeader}>
                                    <View style={[styles.statIconContainer, { backgroundColor: "#FEF3C7" }]}>
                                        <Icon name="Clock" size={18} color="#D97706" />
                                    </View>
                                    <View style={styles.statBadge}>
                                        <Text style={styles.statBadgeText}>Pending</Text>
                                    </View>
                                </View>
                                <View style={styles.statCardBody}>
                                    <Text style={styles.statValue}>{dashboardStats.pendingRequests || 0}</Text>
                                    <Text style={styles.statLabel}>Pending Requests</Text>
                                    <Text style={styles.statSubtitle}>Awaiting approval</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.statCard}
                                onPress={() => navigation.navigate("TreeRequests" as never)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.statCardHeader}>
                                    <View style={[styles.statIconContainer, { backgroundColor: "#DCFCE7" }]}>
                                        <Icon name="CheckCircle2" size={18} color="#059669" />
                                    </View>
                                    <View style={styles.statTrend}>
                                        <Icon name="TrendingUp" size={12} color="#10B981" />
                                        <Text style={styles.statTrendText}>+15%</Text>
                                    </View>
                                </View>
                                <View style={styles.statCardBody}>
                                    <Text style={styles.statValue}>{dashboardStats.completedThisMonth || 0}</Text>
                                    <Text style={styles.statLabel}>Completed</Text>
                                    <Text style={styles.statSubtitle}>This month</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.statCard}
                                onPress={() => navigation.navigate("TreeRequests" as never)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.statCardHeader}>
                                    <View style={[styles.statIconContainer, { backgroundColor: "#D1FAE5" }]}>
                                        <Icon name="TreePine" size={18} color="#047857" />
                                    </View>
                                    <View style={styles.statTrend}>
                                        <Icon name="TrendingUp" size={12} color="#10B981" />
                                        <Text style={styles.statTrendText}>+20%</Text>
                                    </View>
                                </View>
                                <View style={styles.statCardBody}>
                                    <Text style={styles.statValue}>{(dashboardStats.totalTreesCut + dashboardStats.totalTreesPruned) || 0}</Text>
                                    <Text style={styles.statLabel}>Trees Processed</Text>
                                    <Text style={styles.statSubtitle}>Cut & pruned</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.quickActionsSection}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <View style={styles.actionsRow}>
                            <View style={styles.actionItem}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => navigation.navigate("TreeInventory" as never)}
                                    activeOpacity={0.7}
                                >
                                    <Icon name="TreePalm" size={20} color="#111827" />
                                </TouchableOpacity>
                                <Text style={styles.actionTitle}>Inventory</Text>
                            </View>

                            <View style={styles.actionItem}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => navigation.navigate("MapView" as never)}
                                    activeOpacity={0.7}
                                >
                                    <Icon name="Map" size={20} color="#111827" />
                                </TouchableOpacity>
                                <Text style={styles.actionTitle}>Map</Text>
                            </View>

                            <View style={styles.actionItem}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => navigation.navigate("GreeningProjects" as never)}
                                    activeOpacity={0.7}
                                >
                                    <Icon name="Leaf" size={20} color="#111827" />
                                </TouchableOpacity>
                                <Text style={styles.actionTitle}>Projects</Text>
                            </View>

                            <View style={styles.actionItem}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => (navigation as any).navigate("TreeRequests", { screen: "AddRequest" })}
                                    activeOpacity={0.7}
                                >
                                    <Icon name="FilePlus" size={20} color="#111827" />
                                </TouchableOpacity>
                                <Text style={styles.actionTitle}>New Request</Text>
                            </View>
                        </View>
                    </View>

                    {/* Bottom spacing for floating navbar */}
                    <View style={styles.bottomSpacer} />
                </ScrollView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 28,
        paddingTop: 12,
    },

    // Header Section
    headerCard: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: "hidden",
    },
    headerBg: {
        ...StyleSheet.absoluteFillObject,
    },
    headerContent: {
        padding: 20,
    },
    welcomeSection: {
        marginBottom: 16,
    },
    welcomeTitle: {
        fontSize: 19,
        fontWeight: "800",
        color: "#FFFFFF",
        marginBottom: 4,
        letterSpacing: -0.4,
    },
    welcomeSubtitle: {
        fontSize: 13,
        color: "#E5E7EB",
        fontWeight: "500",
    },

    // Stats Section
    statsSection: {
        marginBottom: 24,
    },
    sectionTitle: cardStyles.sectionTitle,
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    statCard: {
        ...cardStyles.cardCompact,
        flex: 1,
        minWidth: "47%",
        borderRadius: 16,
    },
    statCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: "rgba(0, 0, 0, 0.05)",
    },
    statTrend: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        backgroundColor: "#DCFCE7",
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
    },
    statTrendText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#10B981",
        letterSpacing: -0.2,
    },
    statBadge: {
        backgroundColor: "#DCFCE7",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    statBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#059669",
        letterSpacing: 0.3,
        textTransform: "uppercase",
    },
    statCardBody: {
        gap: 3,
    },
    statValue: {
        fontSize: 28,
        fontWeight: "800",
        color: "#111827",
        letterSpacing: -1,
        lineHeight: 32,
    },
    statLabel: {
        fontSize: 13,
        color: "#1F2937",
        fontWeight: "700",
        letterSpacing: -0.2,
    },
    statSubtitle: {
        fontSize: 11,
        color: "#6B7280",
        fontWeight: "500",
        marginTop: 2,
    },

    // Quick Actions Section
    quickActionsSection: {
        marginBottom: 24,
    },
    actionsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    actionItem: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    actionButton: {
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        backgroundColor: "rgba(17, 24, 39, 0.1)",
        borderColor: "#E5E7EB",
    },
    actionTitle: {
        marginTop: 8,
        fontSize: 11,
        fontWeight: "600",
        textAlign: "center",
        color: "#1F2937",
        letterSpacing: -0.2,
    },
    // Bottom Spacer for floating navbar
    bottomSpacer: {
        height: 100,
    },
});
