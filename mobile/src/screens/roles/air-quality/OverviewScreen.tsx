import React, { useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { Card, Title, Paragraph, Chip, Divider, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../components/icons/Icon";
import { useNavigation } from "@react-navigation/native";

import { useAirQualityDashboardData } from "../../../hooks/useAirQualityDashboardData";
import { useNetworkSync } from "../../../hooks/useNetworkSync";
import { useAuthStore } from "../../../core/stores/authStore";
import StatsCard from "../../../components/StatsCard";
import Svg, { Defs, LinearGradient, Stop, Rect, Line } from "react-native-svg";
import StandardHeader from "../../../components/layout/StandardHeader";

export default function OverviewScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { data, loading, refetch } = useAirQualityDashboardData();
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
        title="Air Quality Dashboard"
        chip={{ label: "Air Quality", iconName: "weather-windy" }}
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
        showsVerticalScrollIndicator={false}
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
                Air Quality Monitoring Dashboard
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
                style={[styles.syncChip, { backgroundColor: "rgba(255,255,255,0.15)" }]}
                textStyle={[styles.syncText, { color: "#FFFFFF" }]}
              >
                {isSyncing ? "Syncing..." : `Last sync: ${formatLastSync()}`}
              </Chip>
            </View>
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <Title style={styles.sectionTitle}>Air Quality Statistics</Title>
          <View style={styles.statsGrid}>
            <StatsCard
              title="Total Records"
              value={data?.totalRecords?.toString() || "0"}
              icon="clipboard-text"
              color="#4CAF50"
              loading={loading}
            />
            <StatsCard
              title="Total Violations"
              value={data?.totalViolations?.toString() || "0"}
              icon="alert-circle"
              color="#FF9800"
              loading={loading}
            />
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate("SmokeBelcher" as never)}
            >
              <View style={[styles.actionButton, { borderColor: colors.primary }]}>
                <Icon name="smoke-detector" size={24} color={colors.primary} />
              </View>
              <Paragraph style={styles.actionLabel}>Smoke Belcher</Paragraph>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate("FeeControl" as never)}
            >
              <View style={[styles.actionButton, { borderColor: colors.primary }]}>
                <Icon name="currency-usd" size={24} color={colors.primary} />
              </View>
              <Paragraph style={styles.actionLabel}>Fee Control</Paragraph>
            </TouchableOpacity>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Recent Activity Section */}
        <View style={styles.recentSection}>
          <Title style={styles.sectionTitle}>Recent Activity</Title>
          {data?.recentViolations && data.recentViolations.length > 0 ? (
            data.recentViolations.slice(0, 3).map((violation, index) => (
              <Card key={violation.id} style={styles.recentCard}>
                <Card.Content>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View>
                      <Paragraph style={{ fontWeight: "bold" }}>
                        Plate: {violation.plate_number || "N/A"}
                      </Paragraph>
                      <Paragraph style={{ fontSize: 12, color: "#666" }}>
                        Location: {violation.place_of_apprehension}
                      </Paragraph>
                      <Paragraph style={{ fontSize: 12, color: "#666" }}>
                        Date: {new Date(violation.date_of_apprehension).toLocaleDateString()}
                      </Paragraph>
                    </View>
                    <Chip
                      mode="outlined"
                      textStyle={{ fontSize: 10 }}
                      style={{ borderColor: "#FF5722" }}
                    >
                      Violation
                    </Chip>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.recentCard}>
              <Card.Content>
                <Paragraph style={{ textAlign: "center", color: "#666" }}>
                  No recent violations
                </Paragraph>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scrollContent: {
    padding: 16,
  },
  headerCard: {
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: "hidden",
  },
  headerBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    padding: 20,
    position: "relative",
    zIndex: 1,
  },
  welcomeSection: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  syncSection: {
    alignItems: "flex-start",
  },
  syncChip: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
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
    color: "#333",
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
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
});
