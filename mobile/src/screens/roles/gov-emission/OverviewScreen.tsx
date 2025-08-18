import React, { useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { Card, Title, Paragraph, Chip, Divider, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../components/icons/Icon";
import { useNavigation } from "@react-navigation/native";

import { useDashboardData } from "../../../hooks/useDashboardData";
import { useNetworkSync } from "../../../hooks/useNetworkSync";
import { useAuthStore } from "../../../core/stores/authStore";
import StatsCard from "../../../components/StatsCard";
import Svg, { Defs, LinearGradient, Stop, Rect, Line } from "react-native-svg";
import StandardHeader from "../../../components/layout/StandardHeader";

export default function OverviewScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { data, loading, refetch } = useDashboardData();
  const { syncData, isSyncing, lastSyncTime } = useNetworkSync();
  const { colors } = useTheme();
  const [headerDims, setHeaderDims] = useState({ width: 0, height: 0 });

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
    <>
      <StandardHeader
        title="Dashboard"
        chip={{ label: "Gov. Emission", iconName: "directions-car" }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
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
                    <Stop offset="0" stopColor={colors.primary} stopOpacity={1} />
                    <Stop offset="1" stopColor={colors.primary} stopOpacity={0.85} />
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
              <Title style={styles.welcomeTitle}>
                Welcome, {user?.full_name || user?.username || "User"}
              </Title>
              <Paragraph style={styles.welcomeSubtitle}>
                Government Emission Monitoring Dashboard
              </Paragraph>
            </View>

            <View style={styles.syncSection}>
              <Chip
                icon={(props) => (
                  <Icon
                    name={isSyncing ? "sync" : "cloud-done"}
                    color="#FFFFFF"
                    size={props?.size ?? 18}
                  />
                )}
                style={[styles.syncChip, { backgroundColor: colors.primary }]}
                textStyle={[styles.syncText, { color: "#FFFFFF" }]}
              >
                {isSyncing ? "Syncing..." : `Last sync: ${formatLastSync()}`}
              </Chip>
            </View>
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <Title style={styles.sectionTitle}>Overview Statistics</Title>
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

        <Divider style={styles.divider} />

        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          <View style={styles.actionRow}>
            <View style={styles.actionItem}>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => navigation.navigate("AddVehicle" as never)}
                style={[
                  styles.actionButton,
                  { backgroundColor: `${colors.primary}22`, borderColor: `${colors.primary}66` },
                ]}
                activeOpacity={0.7}
              >
                <Icon name="add-circle" size={22} color={colors.primary} />
              </TouchableOpacity>
              <Paragraph style={styles.actionLabel}>Add Vehicle</Paragraph>
            </View>

            <View style={styles.actionItem}>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => navigation.navigate("AddTest" as never)}
                style={[
                  styles.actionButton,
                  { backgroundColor: `${colors.primary}22`, borderColor: `${colors.primary}66` },
                ]}
                activeOpacity={0.7}
              >
                <Icon name="assignment" size={22} color={colors.primary} />
              </TouchableOpacity>
              <Paragraph style={styles.actionLabel}>Record Test</Paragraph>
            </View>

            <View style={styles.actionItem}>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => syncData()}
                style={[
                  styles.actionButton,
                  { backgroundColor: `${colors.primary}22`, borderColor: `${colors.primary}66` },
                ]}
                activeOpacity={0.7}
              >
                <Icon name="sync" size={22} color={colors.primary} />
              </TouchableOpacity>
              <Paragraph style={styles.actionLabel}>Sync Data</Paragraph>
            </View>

            <View style={styles.actionItem}>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => navigation.navigate("Offices" as never)}
                style={[
                  styles.actionButton,
                  { backgroundColor: `${colors.primary}22`, borderColor: `${colors.primary}66` },
                ]}
                activeOpacity={0.7}
              >
                <Icon name="business" size={22} color={colors.primary} />
              </TouchableOpacity>
              <Paragraph style={styles.actionLabel}>View Offices</Paragraph>
            </View>
          </View>
        </View>

        {/* Recent Activity Placeholder */}
        <View style={styles.recentSection}>
          <Title style={styles.sectionTitle}>Recent Activity</Title>
          <Card style={styles.recentCard}>
            <Card.Content>
              <Paragraph style={styles.recentText}>
                {data?.pendingSync > 0
                  ? `${data.pendingSync} items pending sync`
                  : "All data is synchronized"}
              </Paragraph>
              {data?.lastTestDate && (
                <Paragraph style={styles.recentSubtext}>
                  Last test recorded:{" "}
                  {new Date(data.lastTestDate).toLocaleDateString()}
                </Paragraph>
              )}
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
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
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#E5E7EB",
  },
  syncSection: {
    alignItems: "flex-start",
  },
  syncChip: {
    borderRadius: 16,
  },
  syncText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  divider: {
    marginVertical: 8,
  },
  quickActionsSection: {
    marginBottom: 16,
  },
  actionRow: {
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
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  actionLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  recentSection: {
    marginBottom: 16,
  },
  recentCard: {
    borderRadius: 12,
  },
  recentText: {
    fontSize: 14,
    color: "#424242",
  },
  recentSubtext: {
    fontSize: 12,
    color: "#757575",
    marginTop: 4,
  },
});
