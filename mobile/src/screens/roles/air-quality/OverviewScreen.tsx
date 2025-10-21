import React, { useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Image } from "react-native";
import { Text, Chip } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../components/icons/Icon";
import { useNavigation } from "@react-navigation/native";

import { useAirQualityDashboardData } from "../../../hooks/useAirQualityDashboardData";
import { useNetworkSync } from "../../../hooks/useNetworkSync";
import { useAuthStore } from "../../../core/stores/authStore";
import Svg, { Defs, LinearGradient, Stop, Rect, Line } from "react-native-svg";
import StandardHeader from "../../../components/layout/StandardHeader";

export default function OverviewScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { data, loading, refetch } = useAirQualityDashboardData();
  const { syncData, isSyncing, lastSyncTime } = useNetworkSync();
  const [headerDims, setHeaderDims] = useState({ width: 0, height: 0 });

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.full_name) return user.full_name;
    if (user?.username) return user.username;
    return "User";
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), syncData()]);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return "Never";
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return lastSyncTime.toLocaleDateString();
  };

  return (
    <View style={styles.root}>
      {/* Background Image */}
      <View style={styles.backgroundImageWrapper} pointerEvents="none">
        <Image
          source={require("../../../../assets/images/bg_login.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </View>

      <StandardHeader
        title="Overview"
        subtitle="Air Quality Dashboard"
        statusBarStyle="dark"
        backgroundColor="rgba(255, 255, 255, 0.95)"
        borderColor="#E5E7EB"
        rightActionIcon="RefreshCw"
        onRightActionPress={() => syncData()}
        titleSize={22}
        subtitleSize={12}
        iconSize={20}
      />

      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
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
                  Air Quality Monitoring Dashboard
                </Text>
              </View>

              <View style={styles.syncSection}>
                <Chip
                  icon={(props) => (
                    <Icon
                      name={isSyncing ? "RefreshCw" : "CheckCircle2"}
                      color="#FFFFFF"
                      size={props?.size ?? 18}
                    />
                  )}
                  style={styles.syncChip}
                  textStyle={styles.syncText}
                >
                  {isSyncing ? "Syncing..." : `Last sync: ${formatLastSync()}`}
                </Chip>
              </View>
            </View>
          </View>

          {/* Statistics Grid */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Key Metrics</Text>
            <View style={styles.statsGrid}>
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => navigation.navigate("SmokeBelcher" as never)}
                activeOpacity={0.7}
              >
                <View style={styles.statCardHeader}>
                  <View style={[styles.statIconContainer, { backgroundColor: "#EEF2FF" }]}>
                    <Icon name="FileText" size={18} color="#111827" />
                  </View>
                  <View style={styles.statTrend}>
                    <Icon name="TrendingUp" size={12} color="#10B981" />
                    <Text style={styles.statTrendText}>+5%</Text>
                  </View>
                </View>
                <View style={styles.statCardBody}>
                  <Text style={styles.statValue}>{data?.totalRecords || 0}</Text>
                  <Text style={styles.statLabel}>Total Records</Text>
                  <Text style={styles.statSubtitle}>All monitoring data</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statCard}
                onPress={() => navigation.navigate("SmokeBelcher" as never)}
                activeOpacity={0.7}
              >
                <View style={styles.statCardHeader}>
                  <View style={[styles.statIconContainer, { backgroundColor: "#FEF3C7" }]}>
                    <Icon name="AlertTriangle" size={18} color="#D97706" />
                  </View>
                  <View style={[styles.statTrend, { backgroundColor: "#FEE2E2" }]}>
                    <Icon name="TrendingUp" size={12} color="#DC2626" />
                    <Text style={[styles.statTrendText, { color: "#DC2626" }]}>+8%</Text>
                  </View>
                </View>
                <View style={styles.statCardBody}>
                  <Text style={styles.statValue}>{data?.totalViolations || 0}</Text>
                  <Text style={styles.statLabel}>Total Violations</Text>
                  <Text style={styles.statSubtitle}>Reported cases</Text>
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
                  onPress={() => navigation.navigate("SmokeBelcher" as never)}
                  activeOpacity={0.7}
                >
                  <Icon name="Wind" size={20} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.actionTitle}>Smoke Belcher</Text>
              </View>

              <View style={styles.actionItem}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate("FeeControl" as never)}
                  activeOpacity={0.7}
                >
                  <Icon name="DollarSign" size={20} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.actionTitle}>Fee Control</Text>
              </View>

              <View style={styles.actionItem}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate("SmokeBelcher" as never)}
                  activeOpacity={0.7}
                >
                  <Icon name="FileText" size={20} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.actionTitle}>Records</Text>
              </View>

              <View style={styles.actionItem}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate("FeeControl" as never)}
                  activeOpacity={0.7}
                >
                  <Icon name="BarChart3" size={20} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.actionTitle}>Reports</Text>
              </View>
            </View>
          </View>

          {/* Bottom spacing for floating navbar */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backgroundImageWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
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
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  syncSection: {
    alignItems: "flex-start",
  },
  syncChip: {
    borderRadius: 16,
    elevation: 0,
    backgroundColor: "#111827",
  },
  syncText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Stats Section
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#1F2937",
    fontWeight: "700",
    marginBottom: 16,
    fontSize: 17,
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
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
