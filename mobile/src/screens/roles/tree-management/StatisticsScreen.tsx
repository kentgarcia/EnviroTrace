import React, { useState } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import {
    Card,
    Title,
    Paragraph,
    Chip,
    Divider,
    useTheme,
    Button,
    ProgressBar,
    Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../components/icons/Icon";
import { useNavigation } from "@react-navigation/native";
import StandardHeader from "../../../components/layout/StandardHeader";

// Mock data for tree management statistics
const mockStatistics = {
    total_requests: 156,
    pending_requests: 23,
    completed_requests: 98,
    in_progress_requests: 35,
    monthly_data: [
        { month: "Jan", requests: 12, completed: 8 },
        { month: "Feb", requests: 18, completed: 15 },
        { month: "Mar", requests: 25, completed: 20 },
        { month: "Apr", requests: 22, completed: 18 },
        { month: "May", requests: 30, completed: 25 },
        { month: "Jun", requests: 28, completed: 22 },
    ],
    request_types: {
        pruning: 89,
        cutting: 45,
        violation_complaint: 22,
    },
    tree_species_processed: {
        acacia: 45,
        mahogany: 32,
        mango: 28,
        narra: 15,
        balete: 12,
        others: 24,
    },
    inspector_workload: [
        { name: "Inspector Rodriguez", assigned: 12, completed: 8 },
        { name: "Inspector Santos", assigned: 15, completed: 12 },
        { name: "Inspector Dela Cruz", assigned: 10, completed: 9 },
        { name: "Inspector Martinez", assigned: 8, completed: 6 },
    ],
    status_breakdown: {
        filed: 23,
        on_hold: 8,
        for_signature: 12,
        payment_pending: 15,
    },
};

export default function StatisticsScreen() {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const [selectedPeriod, setSelectedPeriod] = useState("monthly");

    const calculatePercentage = (value: number, total: number) => {
        return ((value / total) * 100).toFixed(1);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "filed": return "#2196F3";
            case "on_hold": return "#9E9E9E";
            case "for_signature": return "#9C27B0";
            case "payment_pending": return "#FF9800";
            default: return "#9E9E9E";
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "pruning": return "#4CAF50";
            case "cutting": return "#F44336";
            case "violation_complaint": return "#FF9800";
            default: return "#9E9E9E";
        }
    };

    return (
        <View style={styles.root}>
            <StandardHeader
                title="Statistics"
                titleSize={22}
                showBack={true}
                onBack={() => navigation.goBack()}
            />
            <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Overall Summary */}
                    <View style={styles.section}>
                        <View style={styles.card}>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Overall Summary</Text>
                                <View style={styles.summaryGrid}>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryValue}>
                                            {mockStatistics.total_requests}
                                        </Text>
                                        <Text style={styles.summaryLabel}>Total Requests</Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={[styles.summaryValue, { color: "#F59E0B" }]}>
                                            {mockStatistics.pending_requests}
                                        </Text>
                                        <Text style={styles.summaryLabel}>Pending</Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={[styles.summaryValue, { color: "#22C55E" }]}>
                                            {mockStatistics.completed_requests}
                                        </Text>
                                        <Text style={styles.summaryLabel}>Completed</Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={[styles.summaryValue, { color: "#60A5FA" }]}>
                                            {mockStatistics.in_progress_requests}
                                        </Text>
                                        <Text style={styles.summaryLabel}>In Progress</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Request Types Breakdown */}
                    <View style={styles.section}>
                        <View style={styles.card}>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Request Types</Text>
                                <View style={styles.breakdownContainer}>
                                    {Object.entries(mockStatistics.request_types).map(([type, count]) => (
                                        <View key={type} style={styles.breakdownItem}>
                                            <View style={styles.breakdownHeader}>
                                                <View style={styles.breakdownLabelContainer}>
                                                    <View
                                                        style={[
                                                            styles.colorIndicator,
                                                            { backgroundColor: getTypeColor(type) }
                                                        ]}
                                                    />
                                                    <Paragraph style={styles.breakdownLabel}>
                                                        {type === "pruning" ? "Pruning" :
                                                            type === "cutting" ? "Tree Cutting" :
                                                                "Violations/Complaints"}
                                                    </Paragraph>
                                                </View>
                                                <Paragraph style={styles.breakdownValue}>{count}</Paragraph>
                                            </View>
                                            <ProgressBar
                                                progress={count / mockStatistics.total_requests}
                                                color={getTypeColor(type)}
                                                style={styles.progressBar}
                                            />
                                            <Paragraph style={styles.percentageText}>
                                                {calculatePercentage(count, mockStatistics.total_requests)}% of total
                                            </Paragraph>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Status Breakdown */}
                    <View style={styles.section}>
                        <View style={styles.card}>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Request Status</Text>
                                <View style={styles.statusGrid}>
                                    {Object.entries(mockStatistics.status_breakdown).map(([status, count]) => (
                                        <View key={status} style={styles.statusItem}>
                                            <View style={styles.statusHeader}>
                                                <Icon
                                                    name={
                                                        status === "filed" ? "FileText" :
                                                            status === "on_hold" ? "PauseCircle" :
                                                                status === "for_signature" ? "PenTool" : "CreditCard"
                                                    }
                                                    size={18}
                                                    color={getStatusColor(status)}
                                                />
                                                <Text style={styles.statusValue}>{count}</Text>
                                            </View>
                                            <Text style={styles.statusLabel}>
                                                {status === "filed" ? "Filed" :
                                                    status === "on_hold" ? "On Hold" :
                                                        status === "for_signature" ? "For Signature" :
                                                            "Payment Pending"}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Tree Species Processed */}
                    <View style={styles.section}>
                        <View style={styles.card}>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Tree Species Processed</Text>
                                <View style={styles.speciesContainer}>
                                    {Object.entries(mockStatistics.tree_species_processed)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([species, count]) => (
                                            <View key={species} style={styles.speciesItem}>
                                                <View style={styles.speciesHeader}>
                                                    <Icon name="Trees" size={16} color="#22C55E" />
                                                    <Text style={styles.speciesName}>
                                                        {species.charAt(0).toUpperCase() + species.slice(1)}
                                                    </Text>
                                                    <Text style={styles.speciesCount}>{count}</Text>
                                                </View>
                                                <ProgressBar
                                                    progress={count / Math.max(...Object.values(mockStatistics.tree_species_processed))}
                                                    color="#22C55E"
                                                    style={styles.speciesProgressBar}
                                                />
                                            </View>
                                        ))}
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Inspector Workload */}
                    <View style={styles.section}>
                        <View style={styles.card}>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Inspector Workload</Text>
                                <View style={styles.inspectorContainer}>
                                    {mockStatistics.inspector_workload.map((inspector) => (
                                        <View key={inspector.name} style={styles.inspectorItem}>
                                            <View style={styles.inspectorHeader}>
                                                <Icon name="User" size={16} color="#111827" />
                                                <Text style={styles.inspectorName}>{inspector.name}</Text>
                                            </View>
                                            <View style={styles.inspectorStats}>
                                                <View style={styles.inspectorStatItem}>
                                                    <Text style={styles.inspectorStatValue}>
                                                        {inspector.assigned}
                                                    </Text>
                                                    <Text style={styles.inspectorStatLabel}>Assigned</Text>
                                                </View>
                                                <View style={styles.inspectorStatItem}>
                                                    <Text style={[styles.inspectorStatValue, { color: "#22C55E" }]}>
                                                        {inspector.completed}
                                                    </Text>
                                                    <Text style={styles.inspectorStatLabel}>Completed</Text>
                                                </View>
                                                <View style={styles.inspectorStatItem}>
                                                    <Text style={[styles.inspectorStatValue, { color: "#F59E0B" }]}>
                                                        {inspector.assigned - inspector.completed}
                                                    </Text>
                                                    <Text style={styles.inspectorStatLabel}>Pending</Text>
                                                </View>
                                            </View>
                                            <ProgressBar
                                                progress={inspector.completed / inspector.assigned}
                                                color="#22C55E"
                                                style={styles.inspectorProgressBar}
                                            />
                                            <Text style={styles.completionRate}>
                                                {calculatePercentage(inspector.completed, inspector.assigned)}% completed
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Monthly Trends */}
                    <View style={styles.section}>
                        <View style={styles.card}>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Monthly Trends</Text>
                                <View style={styles.trendsContainer}>
                                    {mockStatistics.monthly_data.map((month) => (
                                        <View key={month.month} style={styles.monthItem}>
                                            <Text style={styles.monthLabel}>{month.month}</Text>
                                            <View style={styles.monthBars}>
                                                <View style={styles.monthBarContainer}>
                                                    <View
                                                        style={[
                                                            styles.monthBar,
                                                            {
                                                                height: (month.requests / 30) * 60,
                                                                backgroundColor: "#111827"
                                                            }
                                                        ]}
                                                    />
                                                    <Text style={styles.monthBarValue}>{month.requests}</Text>
                                                </View>
                                                <View style={styles.monthBarContainer}>
                                                    <View
                                                        style={[
                                                            styles.monthBar,
                                                            {
                                                                height: (month.completed / 30) * 60,
                                                                backgroundColor: "#22C55E"
                                                            }
                                                        ]}
                                                    />
                                                    <Text style={styles.monthBarValue}>{month.completed}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                                <View style={styles.legendContainer}>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendColor, { backgroundColor: "#111827" }]} />
                                        <Text style={styles.legendText}>Requests</Text>
                                    </View>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendColor, { backgroundColor: "#22C55E" }]} />
                                        <Text style={styles.legendText}>Completed</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Export/Action Buttons */}
                    <View style={styles.section}>
                        <View style={styles.card}>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>Actions</Text>
                                <View style={styles.actionButtonsContainer}>
                                    <Button
                                        mode="outlined"
                                        icon="download"
                                        onPress={() => {
                                            // Handle export functionality
                                        }}
                                        style={styles.actionButton}
                                    >
                                        Export Report
                                    </Button>
                                    <Button
                                        mode="outlined"
                                        icon="refresh"
                                        onPress={() => {
                                            // Handle refresh functionality
                                        }}
                                        style={styles.actionButton}
                                    >
                                        Refresh Data
                                    </Button>
                                </View>
                            </View>
                        </View>
                    </View>
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
    safeArea: {
        flex: 1,
        backgroundColor: "transparent",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    section: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    card: {
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        elevation: 0,
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 16,
        color: "#111827",
        letterSpacing: -0.3,
    },
    summaryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    summaryItem: {
        width: "48%",
        alignItems: "center",
        marginBottom: 16,
    },
    summaryValue: {
        fontSize: 28,
        fontWeight: "800",
        color: "#111827",
        letterSpacing: -0.5,
    },
    summaryLabel: {
        fontSize: 11,
        color: "#6B7280",
        marginTop: 6,
        fontWeight: "600",
    },
    breakdownContainer: {
        gap: 16,
    },
    breakdownItem: {
        marginBottom: 8,
    },
    breakdownHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    breakdownLabelContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    colorIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    breakdownLabel: {
        fontSize: 13,
        color: "#111827",
        fontWeight: "600",
    },
    breakdownValue: {
        fontSize: 15,
        fontWeight: "700",
        color: "#111827",
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        marginBottom: 6,
    },
    percentageText: {
        fontSize: 11,
        color: "#6B7280",
        fontWeight: "500",
    },
    statusGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    statusItem: {
        width: "48%",
        alignItems: "center",
        marginBottom: 16,
        padding: 16,
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
    },
    statusHeader: {
        alignItems: "center",
        marginBottom: 8,
    },
    statusValue: {
        fontSize: 24,
        fontWeight: "700",
        color: "#111827",
        marginTop: 6,
        letterSpacing: -0.4,
    },
    statusLabel: {
        fontSize: 11,
        color: "#6B7280",
        textAlign: "center",
        fontWeight: "600",
    },
    speciesContainer: {
        gap: 12,
    },
    speciesItem: {
        marginBottom: 8,
    },
    speciesHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    speciesName: {
        fontSize: 13,
        color: "#111827",
        fontWeight: "600",
        marginLeft: 10,
        flex: 1,
    },
    speciesCount: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
    },
    speciesProgressBar: {
        height: 6,
        borderRadius: 3,
    },
    inspectorContainer: {
        gap: 16,
    },
    inspectorItem: {
        backgroundColor: "#F9FAFB",
        padding: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
    },
    inspectorHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    inspectorName: {
        fontSize: 13,
        fontWeight: "600",
        color: "#111827",
        marginLeft: 10,
    },
    inspectorStats: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 10,
    },
    inspectorStatItem: {
        alignItems: "center",
    },
    inspectorStatValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
        letterSpacing: -0.3,
    },
    inspectorStatLabel: {
        fontSize: 10,
        color: "#6B7280",
        fontWeight: "600",
        marginTop: 2,
    },
    inspectorProgressBar: {
        height: 6,
        borderRadius: 3,
        marginBottom: 6,
    },
    completionRate: {
        fontSize: 11,
        color: "#6B7280",
        textAlign: "center",
        fontWeight: "500",
    },
    trendsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 16,
    },
    monthItem: {
        alignItems: "center",
    },
    monthLabel: {
        fontSize: 11,
        color: "#6B7280",
        marginBottom: 8,
        fontWeight: "600",
    },
    monthBars: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 4,
    },
    monthBarContainer: {
        alignItems: "center",
    },
    monthBar: {
        width: 14,
        borderRadius: 3,
        marginBottom: 4,
    },
    monthBarValue: {
        fontSize: 10,
        color: "#6B7280",
        fontWeight: "600",
    },
    legendContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 16,
        paddingTop: 8,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    legendColor: {
        width: 14,
        height: 14,
        borderRadius: 3,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
        color: "#6B7280",
        fontWeight: "600",
    },
    actionButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 8,
    },
});
