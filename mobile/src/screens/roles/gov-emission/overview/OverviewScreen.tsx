import React, { useState, useMemo } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Dimensions, Platform } from "react-native";
import { Text, Surface } from "react-native-paper";
import Icon from "../../../../components/icons/Icon";
import { useNavigation } from "@react-navigation/native";
import ScreenLayout from "../../../../components/layout/ScreenLayout";
import Svg, { Defs, LinearGradient, Stop, Circle, Path, G, Rect } from "react-native-svg";

import { useDashboardData } from "../../../../hooks/useDashboardData";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function OverviewScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { data, loading, refetch } = useDashboardData();

  const lastUpdated = useMemo(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [data]);

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

  // Circular Progress Component for Hero Card
  const ComplianceCircle = ({ percentage }: { percentage: number }) => {
    const size = 100;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={styles.circleContainer}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#FFFFFF"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
            />
          </G>
        </Svg>
        <View style={styles.circleTextContainer}>
          <Text style={styles.circlePercentage}>{percentage}%</Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenLayout
      header={{
        title: "Dashboard",
        subtitle: "Emission Management",
        statusBarStyle: "dark",
        backgroundColor: "#F8FAFC",
        showProfileAction: true,
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
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
      >
        {/* Hero KPI Card */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Reports" as never)}
          style={styles.heroCard}
        >
          <View style={styles.heroBg}>
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor="#1E40AF" stopOpacity={1} />
                  <Stop offset="1" stopColor="#3B82F6" stopOpacity={1} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#heroGrad)" />
              <Path
                d="M-20 120 Q 100 60 200 140 T 400 100"
                fill="none"
                stroke="white"
                strokeOpacity={0.1}
                strokeWidth={60}
              />
            </Svg>
          </View>
          
          <View style={styles.heroContent}>
            <View style={styles.heroInfo}>
              <Text style={styles.heroLabel}>Overall Compliance • Q4 2025</Text>
              <Text style={styles.heroTitle}>Fleet Performance</Text>
              <View style={styles.heroBadge}>
                <Icon name="TrendingUp" size={14} color="#FFFFFF" />
                <Text style={styles.heroBadgeText}>Above Target</Text>
              </View>
            </View>
            <ComplianceCircle percentage={data?.complianceRate || 0} />
          </View>
        </TouchableOpacity>

        {/* Secondary Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <View style={[styles.metricIconBox, { backgroundColor: "#EFF6FF" }]}>
              <Icon name="Car" size={22} color="#2563EB" />
            </View>
            <Text style={styles.metricValue}>{data?.totalVehicles || 0}</Text>
            <Text style={styles.metricLabel}>Total Fleet</Text>
          </View>
          
          <View style={styles.metricItem}>
            <View style={[styles.metricIconBox, { backgroundColor: "#F0F9FF" }]}>
              <Icon name="ClipboardCheck" size={22} color="#0EA5E9" />
            </View>
            <Text style={styles.metricValue}>{data?.testedVehicles || 0}</Text>
            <Text style={styles.metricLabel}>Tests Done</Text>
          </View>

          <View style={styles.metricItem}>
            <View style={[styles.metricIconBox, { backgroundColor: "#F5F3FF" }]}>
              <Icon name="Building2" size={22} color="#7C3AED" />
            </View>
            <Text style={styles.metricValue}>{data?.departments || 0}</Text>
            <Text style={styles.metricLabel}>Offices</Text>
          </View>
        </View>

        {/* Quick Actions Row */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.actionsRow}>
          {[
            { label: "Add", icon: "Plus", color: "#2563EB", bg: "#EFF6FF", route: "Vehicles", screen: "AddVehicle" },
            { label: "Test", icon: "ClipboardPlus", color: "#0EA5E9", bg: "#F0F9FF", route: "Testing", screen: "AddTest" },
            { label: "Reports", icon: "FileText", color: "#4F46E5", bg: "#EEF2FF", route: "Reports" },
            { label: "Offices", icon: "Building2", color: "#7C3AED", bg: "#F5F3FF", route: "Offices" },
          ].map((action, idx) => (
            <TouchableOpacity 
              key={idx}
              style={styles.actionItem}
              onPress={() => (navigation as any).navigate(action.route, action.screen ? { screen: action.screen } : undefined)}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.bg }]}>
                <Icon name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={styles.actionLabel} numberOfLines={1}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity / Latest Update */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Update</Text>
          <Text style={styles.lastSyncText}>Synced at {lastUpdated}</Text>
        </View>

        <Surface style={styles.activityCard} elevation={0}>
          <View style={styles.activityIcon}>
            <Icon name="Clock" size={24} color="#2563EB" />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>
              {data?.lastTestDate ? "Recent Emission Test" : "No Recent Activity"}
            </Text>
            <Text style={styles.activitySubtitle}>
              {data?.lastTestDate 
                ? `Last verification recorded on ${new Date(data.lastTestDate).toLocaleDateString()}`
                : "Start recording tests to see activity here."}
            </Text>
          </View>
          <Icon name="ChevronRight" size={20} color="#CBD5E1" />
        </Surface>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  heroCard: {
    height: 160,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
    backgroundColor: "#1E40AF",
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
  },
  heroInfo: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginVertical: 4,
    letterSpacing: -0.5,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 8,
    gap: 4,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  circleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  circleTextContainer: {
    position: "absolute",
  },
  circlePercentage: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  metricItem: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  metricIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
  },
  lastSyncText: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 16,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    paddingHorizontal: 0,
  },
  actionItem: {
    width: (SCREEN_WIDTH - 48 - 24) / 4, // Screen width minus horizontal padding (24*2) minus gaps, divided by 4
    alignItems: "center",
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
  },
  bottomSpacer: {
    height: 100,
  },
});



