import React, { useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Image } from "react-native";
import { Card, Text, Chip, Button, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../../components/icons/Icon";
import { useNavigation } from "@react-navigation/native";
import StandardHeader from "../../../../components/layout/StandardHeader";
import Svg, { Defs, LinearGradient, Stop, Rect, Line } from "react-native-svg";

import { useDashboardData } from "../../../../hooks/useDashboardData";
import { useAuthStore } from "../../../../core/stores/authStore";
import StatsCard from "../../../../components/StatsCard";

export default function OverviewScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { data, loading, refetch, isFromCache } = useDashboardData();
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
      await refetch();
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return "Never";
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return formatDate(dateString);
  };

  return (
    <View style={styles.root}>
      {/* Background Image */}
      <View style={styles.backgroundImageWrapper} pointerEvents="none">
        <Image
          source={require("../../../../../assets/images/bg_login.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </View>

      <StandardHeader
        title="Overview"
        subtitle="Government Emission Dashboard"
        statusBarStyle="dark"
        backgroundColor="rgba(255, 255, 255, 0.95)"
        borderColor="#E5E7EB"
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
                <View style={styles.welcomeHeader}>
                  <Text style={styles.welcomeTitle}>
                    Welcome, {getUserDisplayName()}
                  </Text>
                  <View style={styles.headerBadges}>
                    {loading && (
                      <View style={styles.loadingBadge}>
                        <Icon name="RefreshCw" size={12} color="#FFFFFF" />
                      </View>
                    )}
                    {data?.pendingSyncCount > 0 && (
                      <Chip
                        icon={() => <Icon name="RefreshCw" size={12} color="#FFFFFF" />}
                        style={styles.syncChip}
                        textStyle={styles.syncChipText}
                      >
                        {data.pendingSyncCount} Pending
                      </Chip>
                    )}
                  </View>
                </View>
                <Text style={styles.welcomeSubtitle}>
                  Government Emission Monitoring Dashboard
                </Text>
              </View>
            </View>
          </View>

          {/* Statistics Grid */}
          <View style={styles.statsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Key Metrics</Text>
              {data?.lastTestDate && (
                <Text style={styles.lastUpdatedText}>
                  Last test: {getTimeAgo(data.lastTestDate)}
                </Text>
              )}
            </View>
            <View style={styles.statsGrid}>
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => navigation.navigate("Vehicles" as never)}
                activeOpacity={0.7}
              >
                <View style={styles.statCardHeader}>
                  <View style={[styles.statIconContainer, { backgroundColor: "#EEF2FF" }]}>
                    <Icon name="Car" size={18} color="#111827" />
                  </View>
                  <View style={styles.statTrend}>
                    <Icon name="TrendingUp" size={12} color="#10B981" />
                    <Text style={styles.statTrendText}>+12%</Text>
                  </View>
                </View>
                <View style={styles.statCardBody}>
                  <Text style={styles.statValue}>{data?.totalVehicles || 0}</Text>
                  <Text style={styles.statLabel}>Total Vehicles</Text>
                  <Text style={styles.statSubtitle}>Registered fleet</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statCard}
                onPress={() => navigation.navigate("Testing" as never)}
                activeOpacity={0.7}
              >
                <View style={styles.statCardHeader}>
                  <View style={[styles.statIconContainer, { backgroundColor: "#DCFCE7" }]}>
                    <Icon name="CheckCircle2" size={18} color="#059669" />
                  </View>
                  <View style={styles.statTrend}>
                    <Icon name="TrendingUp" size={12} color="#10B981" />
                    <Text style={styles.statTrendText}>+8%</Text>
                  </View>
                </View>
                <View style={styles.statCardBody}>
                  <Text style={styles.statValue}>{data?.testedVehicles || 0}</Text>
                  <Text style={styles.statLabel}>Tested Vehicles</Text>
                  <Text style={styles.statSubtitle}>This month</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statCard}
                onPress={() => navigation.navigate("Testing" as never)}
                activeOpacity={0.7}
              >
                <View style={styles.statCardHeader}>
                  <View style={[styles.statIconContainer, { backgroundColor: "#FEF3C7" }]}>
                    <Icon name="TrendingUp" size={18} color="#D97706" />
                  </View>
                  <View style={[styles.statTrend, { backgroundColor: "#FEE2E2" }]}>
                    <Icon name="TrendingDown" size={12} color="#DC2626" />
                    <Text style={[styles.statTrendText, { color: "#DC2626" }]}>-3%</Text>
                  </View>
                </View>
                <View style={styles.statCardBody}>
                  <Text style={styles.statValue}>{`${data?.complianceRate || 0}%`}</Text>
                  <Text style={styles.statLabel}>Compliance Rate</Text>
                  <Text style={styles.statSubtitle}>Pass rate average</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statCard}
                onPress={() => navigation.navigate("Offices" as never)}
                activeOpacity={0.7}
              >
                <View style={styles.statCardHeader}>
                  <View style={[styles.statIconContainer, { backgroundColor: "#EDE9FE" }]}>
                    <Icon name="Building2" size={18} color="#7C3AED" />
                  </View>
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}>Active</Text>
                  </View>
                </View>
                <View style={styles.statCardBody}>
                  <Text style={styles.statValue}>{data?.departments || 0}</Text>
                  <Text style={styles.statLabel}>Government Offices</Text>
                  <Text style={styles.statSubtitle}>Registered units</Text>
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
                  onPress={() => (navigation as any).navigate("Vehicles", { screen: "AddVehicle" })}
                  activeOpacity={0.7}
                >
                  <Icon name="Car" size={20} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.actionTitle}>Add Vehicle</Text>
              </View>

              <View style={styles.actionItem}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => (navigation as any).navigate("Testing", { screen: "AddTest", params: {} })}
                  activeOpacity={0.7}
                >
                  <Icon name="ClipboardPlus" size={20} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.actionTitle}>Record Test</Text>
              </View>

              <View style={styles.actionItem}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate("QuarterlyTesting" as never)}
                  activeOpacity={0.7}
                >
                  <Icon name="Calendar" size={20} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.actionTitle}>Quarterly</Text>
              </View>

              <View style={styles.actionItem}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate("Reports" as never)}
                  activeOpacity={0.7}
                >
                  <Icon name="FileText" size={20} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.actionTitle}>Reports</Text>
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.recentActivitySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Testing" as never)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <Card style={styles.activityCard} mode="outlined">
              {data?.recentTests && data.recentTests.length > 0 ? (
                data.recentTests.map((test, index) => (
                  <React.Fragment key={test.id}>
                    <TouchableOpacity 
                      style={styles.activityItem}
                      onPress={() => (navigation as any).navigate("Testing", { screen: "TestDetails", params: { testId: test.id } })}
                    >
                      <View style={[styles.activityIcon, { backgroundColor: test.result ? "#DCFCE7" : "#FEE2E2" }]}>
                        <Icon 
                          name={test.result ? "CheckCircle2" : "XCircle"} 
                          size={16} 
                          color={test.result ? "#059669" : "#DC2626"} 
                        />
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityTitle}>{test.vehicle_plate}</Text>
                        <Text style={styles.activitySubtitle}>
                          {test.result ? "Passed" : "Failed"} • {formatDate(test.test_date)}
                        </Text>
                      </View>
                      <Icon name="ChevronRight" size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                    {index < data.recentTests.length - 1 && <Divider style={styles.divider} />}
                  </React.Fragment>
                ))
              ) : (
                <View style={styles.emptyActivity}>
                  <Icon name="ClipboardList" size={32} color="#D1D5DB" />
                  <Text style={styles.emptyActivityText}>No recent tests recorded</Text>
                </View>
              )}
            </Card>
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
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
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
  welcomeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  headerBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  syncChip: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    height: 24,
  },
  syncChipText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
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
  sectionTitle: {
    color: "#1F2937",
    fontWeight: "700",
    marginBottom: 16,
    fontSize: 17,
    letterSpacing: -0.3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  lastUpdatedText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  viewAllText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "600",
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

  // Recent Activity Section
  recentActivitySection: {
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderColor: "#E5E7EB",
    borderWidth: 1.5,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  divider: {
    backgroundColor: "#F3F4F6",
    height: 1,
  },
  emptyActivity: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyActivityText: {
    marginTop: 8,
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },

  // Bottom Spacer for floating navbar
  bottomSpacer: {
    height: 100,
  },
});
