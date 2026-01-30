import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Text } from "react-native-paper";
import Icon from "../../../../components/icons/Icon";
import { useNavigation } from "@react-navigation/native";
import ScreenLayout from "../../../../components/layout/ScreenLayout";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Path,
  G,
  Rect,
} from "react-native-svg";
import { PieChart, StackedBarChart } from "react-native-chart-kit";

import { useDashboardData } from "../../../../hooks/useDashboardData";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function OverviewScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState<number | undefined>(
    undefined
  );
  const [showYearPicker, setShowYearPicker] = useState(false);
  
  const navigation = useNavigation();
  const { data, loading, error, refetch } = useDashboardData(selectedYear, selectedQuarter);

  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const complianceRate = Math.max(0, Math.min(100, Math.round(data?.complianceRate ?? 0)));
  const periodLabel = selectedQuarter ? `Q${selectedQuarter} ${selectedYear}` : `${selectedYear}`;
  const topOffice = data?.topPerformingOffice;
  const vehicleTypeData = data?.vehicleTypeDistribution;
  const engineTypeStackedData = data?.engineTypeStackedData;
  const hasEngineTypeData = Boolean(engineTypeStackedData?.data?.some((row) => row.some((value) => value > 0)));
  const lastUpdatedLabel = data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : undefined;

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

  const FilterChip = ({ 
    label, 
    active, 
    onPress 
  }: { 
    label: string; 
    active: boolean; 
    onPress: () => void; 
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.filterChip,
        active && styles.filterChipActive
      ]}
    >
      <Text style={[
        styles.filterChipText,
        active && styles.filterChipTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

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

  const StatCard = ({
    label,
    value,
    icon,
    color,
    bg,
  }: {
    label: string;
    value: number | string;
    icon: string;
    color: string;
    bg: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconBox, { backgroundColor: bg }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <View style={styles.statTextContainer}>
        <Text style={styles.statValue} numberOfLines={1} ellipsizeMode="tail">
          {value}
        </Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(30, 64, 175, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#1E40AF",
    },
  };

  return (
    <ScreenLayout
      header={{
        title: "Dashboard",
        subtitle: "Emission Management",
        statusBarStyle: "dark",
        showProfileAction: true,
                titleSize: 22,

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
            colors={["#1E40AF"]}
            tintColor="#1E40AF"
          />
        }
      >
        {/* Filters */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <FilterChip 
              label="All Year" 
              active={selectedQuarter === undefined} 
              onPress={() => setSelectedQuarter(undefined)} 
            />
            {[1, 2, 3, 4].map(q => (
              <FilterChip 
                key={q}
                label={`Q${q}`} 
                active={selectedQuarter === q} 
                onPress={() => setSelectedQuarter(q)} 
              />
            ))}
            <View style={styles.verticalDivider} />
            <TouchableOpacity
              onPress={() => setShowYearPicker(!showYearPicker)}
              style={[styles.filterChip, styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, styles.filterChipTextActive]}>
                {selectedYear}
              </Text>
              <Icon 
                name={showYearPicker ? "ChevronDown" : "ChevronRight"} 
                size={14} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Icon name="AlertTriangle" size={16} color="#DC2626" />
            <Text style={styles.errorBannerText}>Unable to load dashboard data. Pull to refresh.</Text>
          </View>
        )}

        {/* Year Picker Dropdown */}
        {showYearPicker && (
          <View style={styles.yearPickerContainer}>
            <Text style={styles.yearPickerTitle}>Select Year</Text>
            <View style={styles.yearOptionsGrid}>
              {yearOptions.map(year => (
                <TouchableOpacity
                  key={year}
                  onPress={() => {
                    setSelectedYear(year);
                    setShowYearPicker(false);
                  }}
                  style={[
                    styles.yearOption,
                    selectedYear === year && styles.yearOptionActive
                  ]}
                >
                  <Text style={[
                    styles.yearOptionText,
                    selectedYear === year && styles.yearOptionTextActive
                  ]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

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
              <Text style={styles.heroLabel}>Overall Compliance • {periodLabel}</Text>
              <Text style={styles.heroTitle}>Fleet Performance</Text>
              <View style={styles.heroBadge}>
                <Icon
                  name={loading ? "RefreshCw" : complianceRate >= 80 ? "TrendingUp" : complianceRate >= 60 ? "Activity" : "TrendingDown"}
                  size={14}
                  color="#FFFFFF"
                />
                <Text style={styles.heroBadgeText}>
                  {loading
                    ? "Loading data..."
                    : complianceRate >= 80
                    ? "Above Target"
                    : complianceRate >= 60
                    ? "On Track"
                    : "Needs Attention"}
                </Text>
              </View>
              {lastUpdatedLabel && (
                <Text style={styles.heroUpdated}>Updated {lastUpdatedLabel}</Text>
              )}
            </View>
            <ComplianceCircle percentage={loading ? 0 : complianceRate} />
          </View>
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.statsGridContainer}>
          <View style={styles.statsRow}>
            <StatCard
              label="Total Vehicles"
              value={data?.totalVehicles || 0}
              icon="Car"
              color="#1E40AF"
              bg="#EFF6FF"
            />
            <StatCard
              label="Government Offices"
              value={data?.totalOffices || data?.officeDepartments || 0}
              icon="Building2"
              color="#7C3AED"
              bg="#F5F3FF"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Passed Tests"
              value={data?.passedTests || 0}
              icon="CheckCircle"
              color="#16A34A"
              bg="#F0FDF4"
            />
            <StatCard
              label="Failed Tests"
              value={data?.failedTests || 0}
              icon="XCircle"
              color="#DC2626"
              bg="#FEF2F2"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Pending Tests"
              value={data?.pendingTests || 0}
              icon="Clock"
              color="#F59E0B"
              bg="#FFFBEB"
            />
            <StatCard
              label="Compliance Rate"
              value={`${complianceRate}%`}
              icon="BadgeCheck"
              color="#0EA5E9"
              bg="#ECFEFF"
            />
          </View>
        </View>

        {topOffice ? (
          <View style={styles.topOfficeCard}>
            <View style={styles.topOfficeHeader}>
              <Icon name="Award" size={18} color="#1E40AF" />
              <Text style={styles.topOfficeTitle}>Top Performing Office</Text>
            </View>
            <Text style={styles.topOfficeName}>{topOffice.name}</Text>
            <View style={styles.topOfficeMetrics}>
              <View style={styles.topOfficeMetric}>
                <Text style={styles.topOfficeMetricValue}>{topOffice.complianceRate}%</Text>
                <Text style={styles.topOfficeMetricLabel}>Compliance</Text>
              </View>
              <View style={styles.topOfficeMetric}>
                <Text style={styles.topOfficeMetricValue}>{topOffice.passedCount}</Text>
                <Text style={styles.topOfficeMetricLabel}>Passed</Text>
              </View>
              <View style={styles.topOfficeMetric}>
                <Text style={styles.topOfficeMetricValue}>{topOffice.vehicleCount}</Text>
                <Text style={styles.topOfficeMetricLabel}>Vehicles</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Charts Section */}
        
        {/* Vehicle Type Distribution */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Vehicle Type Distribution</Text>
          {vehicleTypeData && vehicleTypeData.length > 0 ? (
            <PieChart
              data={vehicleTypeData}
              width={SCREEN_WIDTH - 48}
              height={220}
              chartConfig={chartConfig}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[10, 0]}
              absolute
            />
          ) : (
            <Text style={styles.noDataText}>No vehicle type data available</Text>
          )}
        </View>

        {/* Engine Type Performance */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Engine Type Performance</Text>
          {engineTypeStackedData && hasEngineTypeData ? (
            <StackedBarChart
              data={engineTypeStackedData}
              width={SCREEN_WIDTH - 48}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              hideLegend={false}
            />
          ) : (
            <Text style={styles.noDataText}>No engine data available</Text>
          )}
        </View>

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
  heroUpdated: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 6,
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
  statsGridContainer: {
    marginBottom: 24,
    gap: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    minHeight: 72,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  noDataText: {
    color: "#94A3B8",
    fontStyle: "italic",
    marginVertical: 20,
  },
  bottomSpacer: {
    height: 100,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterScroll: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 4,
    alignSelf: "center",
  },
  yearPickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  yearPickerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  yearOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  yearOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  yearOptionActive: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
  },
  yearOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  yearOptionTextActive: {
    color: "#FFFFFF",
  },
  topOfficeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  topOfficeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topOfficeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  topOfficeName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E40AF",
  },
  topOfficeMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  topOfficeMetric: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
  },
  topOfficeMetricValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  topOfficeMetricLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 4,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 13,
    color: "#B91C1C",
    flex: 1,
  },
});


