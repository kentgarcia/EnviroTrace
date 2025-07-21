import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Surface,
  Divider,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

import { useDashboardData } from "../hooks/useDashboardData";
import { useNetworkSync } from "../hooks/useNetworkSync";
import { useAuthStore } from "../core/stores/authStore";
import StatsCard from "../components/StatsCard";

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2E7D32"]}
            tintColor="#2E7D32"
          />
        }
      >
        {/* Header Section */}
        <Surface style={styles.headerCard} elevation={2}>
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
                icon={isSyncing ? "sync" : "cloud-done"}
                style={[
                  styles.syncChip,
                  { backgroundColor: isSyncing ? "#FFF3E0" : "#E8F5E8" },
                ]}
                textStyle={[
                  styles.syncText,
                  { color: isSyncing ? "#F57C00" : "#2E7D32" },
                ]}
              >
                {isSyncing ? "Syncing..." : `Last sync: ${formatLastSync()}`}
              </Chip>
            </View>
          </View>
        </Surface>

        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <Title style={styles.sectionTitle}>Overview Statistics</Title>
          <View style={styles.statsGrid}>
            <StatsCard
              title="Total Vehicles"
              value={data?.totalVehicles || 0}
              icon="directions-car"
              color="#2196F3"
              loading={loading}
              onPress={() => navigation.navigate("Vehicles" as never)}
            />
            <StatsCard
              title="Tested Vehicles"
              value={data?.testedVehicles || 0}
              icon="check-circle"
              color="#4CAF50"
              loading={loading}
              onPress={() => navigation.navigate("Testing" as never)}
            />
            <StatsCard
              title="Compliance Rate"
              value={`${data?.complianceRate || 0}%`}
              icon="bar-chart"
              color="#FF9800"
              loading={loading}
              onPress={() => navigation.navigate("Testing" as never)}
            />
            <StatsCard
              title="Departments"
              value={data?.departments || 0}
              icon="business"
              color="#9C27B0"
              loading={loading}
              onPress={() => navigation.navigate("Offices" as never)}
            />
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          <View style={styles.actionGrid}>
            <Card
              style={styles.actionCard}
              onPress={() => navigation.navigate("AddVehicle" as never)}
            >
              <Card.Content style={styles.actionContent}>
                <Icon name="add-circle" size={32} color="#2E7D32" />
                <Paragraph style={styles.actionText}>Add Vehicle</Paragraph>
              </Card.Content>
            </Card>

            <Card
              style={styles.actionCard}
              onPress={() => navigation.navigate("AddTest" as never)}
            >
              <Card.Content style={styles.actionContent}>
                <Icon name="assignment" size={32} color="#1976D2" />
                <Paragraph style={styles.actionText}>Record Test</Paragraph>
              </Card.Content>
            </Card>

            <Card style={styles.actionCard} onPress={() => syncData()}>
              <Card.Content style={styles.actionContent}>
                <Icon name="sync" size={32} color="#FF9800" />
                <Paragraph style={styles.actionText}>Sync Data</Paragraph>
              </Card.Content>
            </Card>

            <Card
              style={styles.actionCard}
              onPress={() => navigation.navigate("Offices" as never)}
            >
              <Card.Content style={styles.actionContent}>
                <Icon name="business" size={32} color="#9C27B0" />
                <Paragraph style={styles.actionText}>View Offices</Paragraph>
              </Card.Content>
            </Card>
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
    </SafeAreaView>
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
    backgroundColor: "#FFFFFF",
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
    color: "#2E7D32",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#757575",
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
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    marginBottom: 12,
    borderRadius: 12,
  },
  actionContent: {
    alignItems: "center",
    paddingVertical: 16,
  },
  actionText: {
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
