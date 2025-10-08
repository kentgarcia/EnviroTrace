import React, { useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { Card, Text, Chip, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../../components/icons/Icon";
import { useNavigation } from "@react-navigation/native";
import StandardHeader from "../../../../components/layout/StandardHeader";

import { useDashboardData } from "../../../../hooks/useDashboardData";
import { useNetworkSync } from "../../../../hooks/useNetworkSync";
import { useAuthStore } from "../../../../core/stores/authStore";
import StatsCard from "../../../../components/StatsCard";

export default function OverviewScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { data, loading, refetch } = useDashboardData();
  const { syncData, isSyncing, lastSyncTime } = useNetworkSync();

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

  const syncChipLabel = isSyncing ? "Syncing" : `Synced ${formatLastSync()}`;

  return (
    <View style={styles.root}>
      <StandardHeader
        title="Dashboard"
        subtitle="Government Emission"
        statusBarStyle="dark"
        backgroundColor="#F3F6FB"
        borderColor="#E2E8F0"
        rightActionIcon="RefreshCw"
        onRightActionPress={() => syncData()}
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
              colors={["#02339C"]}
              tintColor="#02339C"
            />
          }
        >
          {/* Welcome Card */}
          <Card style={styles.welcomeCard} elevation={0}>
            <View style={styles.welcomeBackdrop} />
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeHeaderRow}>
                <Chip
                  icon={() => (
                    <Icon
                      name={isSyncing ? "RefreshCw" : "CloudCheck"}
                      size={16}
                      color={isSyncing ? "#02339C" : "#0F9D58"}
                    />
                  )}
                  style={styles.welcomeChip}
                  textStyle={styles.welcomeChipText}
                >
                  {syncChipLabel}
                </Chip>
              </View>

              <Text variant="headlineSmall" style={styles.welcomeTitle}>
                Welcome back, {user?.full_name || user?.username || "team"}
              </Text>
              <Text style={styles.welcomeDescription}>
                Track inspections, compliance health, and priority actions from a single, modern workspace.
              </Text>

              <View style={styles.welcomeInsightRow}>
                <View style={styles.welcomeInsightBlock}>
                  <Text style={styles.insightValue}>{`${data?.complianceRate ?? 0}%`}</Text>
                  <Text style={styles.insightLabel}>Compliance Rate</Text>
                </View>
                <View style={styles.insightDivider} />
                <View style={styles.welcomeInsightBlock}>
                  <Text style={styles.insightValue}>{data?.pendingSync ?? 0}</Text>
                  <Text style={styles.insightLabel}>Pending Sync</Text>
                </View>
              </View>

              <View style={styles.welcomeActions}>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate("Testing" as never)}
                  textColor="#FFFFFF"
                  style={styles.primaryAction}
                  contentStyle={styles.primaryActionContent}
                  buttonColor="#011F63"
                >
                  Monitor Tests
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate("Vehicles" as never)}
                  textColor="#FFFFFF"
                  style={styles.secondaryAction}
                  contentStyle={styles.secondaryActionContent}
                >
                  Vehicle Overview
                </Button>
              </View>
            </View>
          </Card>

          {/* Statistics Grid */}
          <View style={styles.statsSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Overview Statistics</Text>
            <View style={styles.statsGrid}>
              <StatsCard
                title="Total Vehicles"
                value={data?.totalVehicles || 0}
                icon="directions-car"
                loading={loading}
                onPress={() => navigation.navigate("Vehicles" as never)}
              />
              <StatsCard
                title="Tested Vehicles"
                value={data?.testedVehicles || 0}
                icon="check-circle"
                loading={loading}
                onPress={() => navigation.navigate("Testing" as never)}
              />
              <StatsCard
                title="Compliance Rate"
                value={`${data?.complianceRate || 0}%`}
                icon="bar-chart"
                loading={loading}
                onPress={() => navigation.navigate("Testing" as never)}
              />
              <StatsCard
                title="Departments"
                value={data?.departments || 0}
                icon="business"
                loading={loading}
                onPress={() => navigation.navigate("Offices" as never)}
              />
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Quick Actions</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.roundActionsRow}
            >
              {[
                {
                  key: "AddVehicle",
                  title: "Add Vehicle",
                  caption: "Register fleets",
                  icon: "Car" as const,
                  bubbleStyle: styles.roundActionPrimary,
                  iconColor: "#02339C",
                  onPress: () => navigation.navigate("AddVehicle" as never),
                },
                {
                  key: "AddTest",
                  title: "Record Test",
                  caption: "Log results",
                  icon: "ClipboardPlus" as const,
                  bubbleStyle: styles.roundActionYellow,
                  iconColor: "#02339C",
                  onPress: () => navigation.navigate("AddTest" as never),
                },
                {
                  key: "Vehicles",
                  title: "Directory",
                  caption: "Compliance view",
                  icon: "LayoutDashboard" as const,
                  bubbleStyle: styles.roundActionRed,
                  iconColor: "#E72525",
                  onPress: () => navigation.navigate("Vehicles" as never),
                },
                {
                  key: "Offices",
                  title: "Offices",
                  caption: "Inspection teams",
                  icon: "Building2" as const,
                  bubbleStyle: styles.roundActionPrimarySoft,
                  iconColor: "#02339C",
                  onPress: () => navigation.navigate("Offices" as never),
                },
              ].map(action => (
                <TouchableOpacity
                  key={action.key}
                  onPress={action.onPress}
                  activeOpacity={0.85}
                  style={styles.roundAction}
                >
                  <View style={[styles.roundActionBubble, action.bubbleStyle]}>
                    <Icon name={action.icon} size={26} color={action.iconColor} />
                  </View>
                  <Text style={styles.roundActionLabel}>{action.title}</Text>
                  <Text style={styles.roundActionCaption}>{action.caption}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Recent Activity */}
          <View style={styles.recentSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Recent Activity</Text>
            <Card style={styles.recentCard} elevation={0}>
              <View style={styles.recentContent}>
                <View style={styles.recentIconWrapper}>
                  <Icon
                    name={data?.pendingSync > 0 ? "AlertCircle" : "CheckCircle2"}
                    size={24}
                    color={data?.pendingSync > 0 ? "#F59E0B" : "#10B981"}
                  />
                </View>
                <View style={styles.recentTextContainer}>
                  <Text style={styles.recentText}>
                    {data?.pendingSync > 0
                      ? `${data.pendingSync} items pending sync`
                      : "All data is synchronized"}
                  </Text>
                  {data?.lastTestDate && (
                    <Text style={styles.recentSubtext}>
                      Last test: {new Date(data.lastTestDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
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
    backgroundColor: "#F3F6FB",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F6FB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  // Welcome Card
  welcomeCard: {
    borderRadius: 24,
    backgroundColor: "#02339C",
    marginBottom: 24,
    overflow: "hidden",
    position: "relative",
  },
  welcomeBackdrop: {
    position: "absolute",
    top: -80,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 207, 1, 0.18)",
  },
  welcomeContent: {
    padding: 24,
    gap: 24,
  },
  welcomeHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 6,
  },
  welcomeChipText: {
    color: "#02339C",
    fontSize: 12,
    fontWeight: "600",
  },
  welcomeTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  welcomeDescription: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 14,
    lineHeight: 20,
  },
  welcomeInsightRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  welcomeInsightBlock: {
    flex: 1,
  },
  insightValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  insightLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
  },
  insightDivider: {
    width: 1,
    height: "60%",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  welcomeActions: {
    flexDirection: "row",
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#011F63",
    elevation: 0,
  },
  primaryActionContent: {
    paddingVertical: 4,
  },
  secondaryAction: {
    flex: 1,
    borderRadius: 14,
    borderColor: "rgba(255, 255, 255, 0.6)",
    elevation: 0,
  },
  secondaryActionContent: {
    paddingVertical: 4,
  },

  // Stats Section
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#011F63",
    fontWeight: "700",
    marginBottom: 16,
    fontSize: 18,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  // Quick Actions
  quickActionsSection: {
    marginBottom: 24,
  },
  roundActionsRow: {
    flexDirection: "row",
    gap: 16,
    paddingRight: 8,
  },
  roundAction: {
    width: 108,
    alignItems: "center",
    gap: 10,
  },
  roundActionBubble: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  roundActionPrimary: {
    backgroundColor: "rgba(2, 51, 156, 0.12)",
  },
  roundActionPrimarySoft: {
    backgroundColor: "rgba(2, 51, 156, 0.08)",
  },
  roundActionYellow: {
    backgroundColor: "rgba(255, 207, 1, 0.2)",
  },
  roundActionRed: {
    backgroundColor: "rgba(231, 37, 37, 0.18)",
  },
  roundActionLabel: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  roundActionCaption: {
    color: "#64748B",
    fontSize: 12,
    textAlign: "center",
  },

  // Recent Activity
  recentSection: {
    marginBottom: 24,
  },
  recentCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  recentContent: {
    flexDirection: "row",
    padding: 20,
    gap: 16,
    alignItems: "center",
  },
  recentIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  recentTextContainer: {
    flex: 1,
  },
  recentText: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
  },
  recentSubtext: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  // Bottom Spacer for floating navbar
  bottomSpacer: {
    height: 100,
  },
});
