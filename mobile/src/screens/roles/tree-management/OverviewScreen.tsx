import React, { useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Dimensions } from "react-native";
import { Text } from "react-native-paper";
import Icon from "../../../components/icons/Icon";
import { useNavigation } from "@react-navigation/native";
import ScreenLayout from "../../../components/layout/ScreenLayout";
import Svg, { Defs, LinearGradient, Stop, Rect, Path, G, Circle } from "react-native-svg";
import { LineChart, PieChart, BarChart } from "react-native-chart-kit";

import { useTreeManagementData } from "../../../hooks/useTreeManagementData";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function TreeManagementOverviewScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [recentActivityTab, setRecentActivityTab] = useState<"ug" | "saplings">("ug");
    const [floraTreesTab, setFloraTreesTab] = useState<"flora" | "trees">("flora");
    const [treeRequestsTab, setTreeRequestsTab] = useState<"type" | "status">("type");
    
    const navigation = useNavigation();
    
    // Pass filters to hook
    const { data, loading, refetch } = useTreeManagementData({
        year: selectedYear,
        month: selectedMonth,
    });
    
    // Generate year options (last 5 years)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
    
    // Month options
    const monthOptions = [
        { label: "All Year", value: undefined },
        { label: "January", value: 1 },
        { label: "February", value: 2 },
        { label: "March", value: 3 },
        { label: "April", value: 4 },
        { label: "May", value: 5 },
        { label: "June", value: 6 },
        { label: "July", value: 7 },
        { label: "August", value: 8 },
        { label: "September", value: 9 },
        { label: "October", value: 10 },
        { label: "November", value: 11 },
        { label: "December", value: 12 },
    ];
    
    const getSelectedMonthLabel = () => {
        return monthOptions.find(m => m.value === selectedMonth)?.label || "All Year";
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

    // Calculate completion rate for hero card
    const completionRate = data.totalRequests > 0 
        ? Math.round((data.completedThisMonth / data.totalRequests) * 100)
        : 0;

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

    // Stat Card Component
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

    // Chart configurations
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

    // Format currency
    const formatCurrency = (amount: number | null | undefined): string => {
        const value = amount ?? 0;
        if (isNaN(value) || !isFinite(value)) {
            return "₱0.00";
        }
        return `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Prepare fee chart data
    const feeChartData = {
        labels: data.feeMonthly.length > 0 ? data.feeMonthly.map((m) => m.month) : ["Jan"],
        datasets: [{
            data: data.feeMonthly.length > 0 ? data.feeMonthly.map((m) => m.amount || 0.01) : [0.01],
        }],
    };

    // Prepare planting type pie chart
    const plantingPieData = data.plantingTypeData.map((item, index) => ({
        name: item.label,
        population: item.value,
        color: ["#22c55e", "#4f46e5", "#f59e42", "#eab308", "#a3e635", "#818cf8"][index % 6],
        legendFontColor: "#0F172A",
        legendFontSize: 11,
    }));

    // Prepare species bar chart
    const speciesBarData = {
        labels: data.speciesData.slice(0, 6).length > 0 
            ? data.speciesData.slice(0, 6).map((s) => s.label.slice(0, 8))
            : ["N/A"],
        datasets: [{
            data: data.speciesData.slice(0, 6).length > 0
                ? data.speciesData.slice(0, 6).map((s) => s.value || 0.01)
                : [0.01],
        }],
    };

    // Prepare tree request type pie
    const treeTypePieData = data.treeRequestTypeCounts.map((item, index) => ({
        name: item.label,
        population: item.value,
        color: ["#1E40AF", "#3B82F6", "#60A5FA", "#93C5FD"][index % 4],
        legendFontColor: "#0F172A",
        legendFontSize: 11,
    }));

    // Prepare tree request status pie
    const treeStatusPieData = data.treeRequestStatusCounts.map((item, index) => ({
        name: item.label,
        population: item.value,
        color: ["#16A34A", "#F59E0B", "#DC2626", "#64748B"][index % 4],
        legendFontColor: "#0F172A",
        legendFontSize: 11,
    }));

    // Prepare tree types bar chart
    const treeTypesBarData = {
        labels: data.treeTypesBar.slice(0, 5).length > 0
            ? data.treeTypesBar.slice(0, 5).map((t) => t.label.slice(0, 8))
            : ["N/A"],
        datasets: [{
            data: data.treeTypesBar.slice(0, 5).length > 0
                ? data.treeTypesBar.slice(0, 5).map((t) => t.value || 0.01)
                : [0.01],
        }],
    };

    return (
        <ScreenLayout
            header={{
                title: "Dashboard",
                subtitle: "Urban Greening & Tree Management",
                statusBarStyle: "dark",
                showProfileAction: true,
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
                        colors={["#1E40AF"]}
                        tintColor="#1E40AF"
                    />
                }
            >
                {/* Filters */}
                <View style={styles.filterContainer}>
                    <View style={styles.filterRow}>
                        <TouchableOpacity
                            onPress={() => {
                                setShowMonthPicker(!showMonthPicker);
                                setShowYearPicker(false);
                            }}
                            style={[styles.filterButton, styles.filterButtonMonth]}
                        >
                            <Icon name="Calendar" size={16} color="#1E40AF" />
                            <Text style={styles.filterButtonText}>
                                {getSelectedMonthLabel()}
                            </Text>
                            <Icon 
                                name={showMonthPicker ? "ChevronDown" : "ChevronRight"} 
                                size={14} 
                                color="#1E40AF" 
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setShowYearPicker(!showYearPicker);
                                setShowMonthPicker(false);
                            }}
                            style={[styles.filterButton, styles.filterButtonYear]}
                        >
                            <Icon name="CalendarDays" size={16} color="#FFFFFF" />
                            <Text style={[styles.filterButtonText, styles.filterButtonTextWhite]}>
                                {selectedYear}
                            </Text>
                            <Icon 
                                name={showYearPicker ? "ChevronDown" : "ChevronRight"} 
                                size={14} 
                                color="#FFFFFF" 
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Month Picker Dropdown */}
                {showMonthPicker && (
                    <View style={styles.pickerContainer}>
                        <Text style={styles.pickerTitle}>Select Period</Text>
                        <View style={styles.pickerOptionsGrid}>
                            {monthOptions.map(option => (
                                <TouchableOpacity
                                    key={option.label}
                                    onPress={() => {
                                        setSelectedMonth(option.value);
                                        setShowMonthPicker(false);
                                    }}
                                    style={[
                                        styles.pickerOption,
                                        selectedMonth === option.value && styles.pickerOptionActive
                                    ]}
                                >
                                    <Text style={[
                                        styles.pickerOptionText,
                                        selectedMonth === option.value && styles.pickerOptionTextActive
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Year Picker Dropdown */}
                {showYearPicker && (
                    <View style={styles.pickerContainer}>
                        <Text style={styles.pickerTitle}>Select Year</Text>
                        <View style={styles.pickerOptionsGrid}>
                            {yearOptions.map(year => (
                                <TouchableOpacity
                                    key={year}
                                    onPress={() => {
                                        setSelectedYear(year);
                                        setShowYearPicker(false);
                                    }}
                                    style={[
                                        styles.pickerOption,
                                        selectedYear === year && styles.pickerOptionActive
                                    ]}
                                >
                                    <Text style={[
                                        styles.pickerOptionText,
                                        selectedYear === year && styles.pickerOptionTextActive
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
                    onPress={() => navigation.navigate("TreeRequests" as never)}
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
                            <Text style={styles.heroLabel}>Performance • {data.currentYear}</Text>
                            <Text style={styles.heroTitle}>Urban Greening</Text>
                            <View style={styles.heroBadge}>
                                <Icon name="TrendingUp" size={14} color="#FFFFFF" />
                                <Text style={styles.heroBadgeText}>
                                    {completionRate >= 70 ? "On Track" : "Needs Attention"}
                                </Text>
                            </View>
                        </View>
                        <ComplianceCircle percentage={completionRate} />
                    </View>
                </TouchableOpacity>

                {/* Stats Grid */}
                <View style={styles.statsGridContainer}>
                    <View style={styles.statsRow}>
                        <StatCard
                            label={`Fees (${data.currentYear})`}
                            value={formatCurrency(data.feesCollectedYear ?? 0)}
                            icon="Banknote"
                            color="#1E40AF"
                            bg="#EFF6FF"
                        />
                        <StatCard
                            label={`Fees (${data.currentMonth})`}
                            value={formatCurrency(data.feesCollectedMonth ?? 0)}
                            icon="Banknote"
                            color="#059669"
                            bg="#ECFDF5"
                        />
                    </View>
                    <View style={styles.statsRow}>
                        <StatCard
                            label="Saplings (Month)"
                            value={data.saplingRequestsMonth ?? 0}
                            icon="Sprout"
                            color="#F59E0B"
                            bg="#FFFBEB"
                        />
                        <StatCard
                            label="Urban Greening"
                            value={data.urbanGreeningMonth ?? 0}
                            icon="Leaf"
                            color="#16A34A"
                            bg="#F0FDF4"
                        />
                    </View>
                    <View style={styles.statsRow}>
                        <StatCard
                            label="Total Requests"
                            value={data.totalRequests ?? 0}
                            icon="ClipboardList"
                            color="#7C3AED"
                            bg="#F5F3FF"
                        />
                        <StatCard
                            label="Pending"
                            value={data.pendingRequests ?? 0}
                            icon="Clock"
                            color="#DC2626"
                            bg="#FEF2F2"
                        />
                    </View>
                </View>

                {/* Monthly Collected Fees Chart */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Monthly Collected Fees {data.currentYear}</Text>
                    {data.feeMonthly.length > 0 ? (
                        <LineChart
                            data={feeChartData}
                            width={SCREEN_WIDTH - 48}
                            height={220}
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
                            }}
                            bezier
                            style={styles.chart}
                        />
                    ) : (
                        <Text style={styles.noDataText}>No fee data available</Text>
                    )}
                </View>

                {/* Recent Activity - Urban Greening & Saplings */}
                <View style={styles.chartContainer}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.chartTitle}>Recent Activity (Monthly)</Text>
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tab, recentActivityTab === "ug" && styles.tabActive]}
                                onPress={() => setRecentActivityTab("ug")}
                            >
                                <Text style={[styles.tabText, recentActivityTab === "ug" && styles.tabTextActive]}>
                                    UG
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, recentActivityTab === "saplings" && styles.tabActive]}
                                onPress={() => setRecentActivityTab("saplings")}
                            >
                                <Text style={[styles.tabText, recentActivityTab === "saplings" && styles.tabTextActive]}>
                                    Saplings
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <View style={styles.activityTable}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableHeaderText}>Month</Text>
                            <Text style={[styles.tableHeaderText, styles.tableHeaderRight]}>
                                Total {recentActivityTab === "ug" ? "Planted" : "Saplings"}
                            </Text>
                        </View>
                        {(recentActivityTab === "ug" ? data.ugMonthly : data.saplingsMonthly)
                            .filter((m) => m.total > 0)
                            .slice(0, 6)
                            .map((row, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={styles.tableCellMonth}>{row.label}</Text>
                                    <Text style={styles.tableCellValue}>{row.total}</Text>
                                </View>
                            ))}
                        {(recentActivityTab === "ug" ? data.ugMonthly : data.saplingsMonthly).filter((m) => m.total > 0).length === 0 && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No recent activity</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Urban Greening Breakdown */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Urban Greening Breakdown {data.currentYear}</Text>
                    {plantingPieData.length > 0 ? (
                        <PieChart
                            data={plantingPieData}
                            width={SCREEN_WIDTH - 48}
                            height={220}
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            center={[10, 0]}
                            absolute
                        />
                    ) : (
                        <Text style={styles.noDataText}>No planting data available</Text>
                    )}
                </View>

                {/* Tree Requests & Clearance Status */}
                <View style={styles.chartContainer}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.chartTitle}>Tree Requests & Clearance {data.currentYear}</Text>
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tab, treeRequestsTab === "type" && styles.tabActive]}
                                onPress={() => setTreeRequestsTab("type")}
                            >
                                <Text style={[styles.tabText, treeRequestsTab === "type" && styles.tabTextActive]}>
                                    Type
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, treeRequestsTab === "status" && styles.tabActive]}
                                onPress={() => setTreeRequestsTab("status")}
                            >
                                <Text style={[styles.tabText, treeRequestsTab === "status" && styles.tabTextActive]}>
                                    Status
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {treeRequestsTab === "type" && treeTypePieData.length > 0 && (
                        <PieChart
                            data={treeTypePieData}
                            width={SCREEN_WIDTH - 48}
                            height={220}
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            center={[10, 0]}
                            absolute
                        />
                    )}
                    {treeRequestsTab === "status" && treeStatusPieData.length > 0 && (
                        <PieChart
                            data={treeStatusPieData}
                            width={SCREEN_WIDTH - 48}
                            height={220}
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            center={[10, 0]}
                            absolute
                        />
                    )}
                    {((treeRequestsTab === "type" && treeTypePieData.length === 0) || 
                      (treeRequestsTab === "status" && treeStatusPieData.length === 0)) && (
                        <Text style={styles.noDataText}>No data available</Text>
                    )}
                </View>

                {/* Flora vs Trees to Cut/Prune */}
                <View style={styles.chartContainer}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.chartTitle}>Flora vs Trees</Text>
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tab, floraTreesTab === "flora" && styles.tabActive]}
                                onPress={() => setFloraTreesTab("flora")}
                            >
                                <Text style={[styles.tabText, floraTreesTab === "flora" && styles.tabTextActive]}>
                                    Flora
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, floraTreesTab === "trees" && styles.tabActive]}
                                onPress={() => setFloraTreesTab("trees")}
                            >
                                <Text style={[styles.tabText, floraTreesTab === "trees" && styles.tabTextActive]}>
                                    Trees
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {floraTreesTab === "flora" && data.speciesData.length > 0 && (
                        <BarChart
                            data={speciesBarData}
                            width={SCREEN_WIDTH - 48}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                            }}
                            style={styles.chart}
                            showValuesOnTopOfBars
                        />
                    )}
                    {floraTreesTab === "trees" && data.treeTypesBar.length > 0 && (
                        <BarChart
                            data={treeTypesBarData}
                            width={SCREEN_WIDTH - 48}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                            }}
                            style={styles.chart}
                            showValuesOnTopOfBars
                        />
                    )}
                    {((floraTreesTab === "flora" && data.speciesData.length === 0) || 
                      (floraTreesTab === "trees" && data.treeTypesBar.length === 0)) && (
                        <Text style={styles.noDataText}>No data available</Text>
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
    // Stats Grid
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
    // Charts
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
    chartHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        width: "100%",
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
    // Tabs
    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#F1F5F9",
        borderRadius: 8,
        padding: 2,
    },
    tab: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    tabActive: {
        backgroundColor: "#FFFFFF",
    },
    tabText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#64748B",
    },
    tabTextActive: {
        color: "#1E40AF",
    },
    // Activity Table
    activityTable: {
        marginTop: 8,
        width: "100%",
    },
    tableHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    tableHeaderText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#64748B",
        textTransform: "uppercase",
    },
    tableHeaderRight: {
        textAlign: "right",
    },
    tableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#F8FAFC",
    },
    tableCellMonth: {
        fontSize: 12,
        fontWeight: "500",
        color: "#0F172A",
    },
    tableCellValue: {
        fontSize: 12,
        fontWeight: "700",
        color: "#1E40AF",
    },
    emptyState: {
        paddingVertical: 32,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 12,
        fontWeight: "500",
        color: "#94A3B8",
    },
    // Filters
    filterContainer: {
        marginBottom: 16,
    },
    filterRow: {
        flexDirection: "row",
        gap: 12,
    },
    filterButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    filterButtonMonth: {
        backgroundColor: "#FFFFFF",
        borderColor: "#E2E8F0",
    },
    filterButtonYear: {
        backgroundColor: "#1E40AF",
        borderColor: "#1E40AF",
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1E40AF",
    },
    filterButtonTextWhite: {
        color: "#FFFFFF",
    },
    pickerContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    pickerTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 12,
    },
    pickerOptionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    pickerOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: "#F1F5F9",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        minWidth: "30%",
        alignItems: "center",
    },
    pickerOptionActive: {
        backgroundColor: "#1E40AF",
        borderColor: "#1E40AF",
    },
    pickerOptionText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#64748B",
    },
    pickerOptionTextActive: {
        color: "#FFFFFF",
    },

    bottomSpacer: {
        height: 100,
    },
});

