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
        <>
            <StandardHeader
                title="Statistics"
                showBack={true}
                onBack={() => navigation.goBack()}
            />
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.scrollView}>
                    {/* Overall Summary */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.cardTitle}>Overall Summary</Title>
                            <View style={styles.summaryGrid}>
                                <View style={styles.summaryItem}>
                                    <Paragraph style={styles.summaryValue}>
                                        {mockStatistics.total_requests}
                                    </Paragraph>
                                    <Paragraph style={styles.summaryLabel}>Total Requests</Paragraph>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Paragraph style={[styles.summaryValue, { color: "#FF9800" }]}>
                                        {mockStatistics.pending_requests}
                                    </Paragraph>
                                    <Paragraph style={styles.summaryLabel}>Pending</Paragraph>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Paragraph style={[styles.summaryValue, { color: "#4CAF50" }]}>
                                        {mockStatistics.completed_requests}
                                    </Paragraph>
                                    <Paragraph style={styles.summaryLabel}>Completed</Paragraph>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Paragraph style={[styles.summaryValue, { color: "#2196F3" }]}>
                                        {mockStatistics.in_progress_requests}
                                    </Paragraph>
                                    <Paragraph style={styles.summaryLabel}>In Progress</Paragraph>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Request Types Breakdown */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.cardTitle}>Request Types</Title>
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
                        </Card.Content>
                    </Card>

                    {/* Status Breakdown */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.cardTitle}>Request Status</Title>
                            <View style={styles.statusGrid}>
                                {Object.entries(mockStatistics.status_breakdown).map(([status, count]) => (
                                    <View key={status} style={styles.statusItem}>
                                        <View style={styles.statusHeader}>
                                            <Icon
                                                name={
                                                    status === "filed" ? "assignment" :
                                                        status === "on_hold" ? "pause" :
                                                            status === "for_signature" ? "edit" : "payment"
                                                }
                                                size={20}
                                                color={getStatusColor(status)}
                                            />
                                            <Paragraph style={styles.statusValue}>{count}</Paragraph>
                                        </View>
                                        <Paragraph style={styles.statusLabel}>
                                            {status === "filed" ? "Filed" :
                                                status === "on_hold" ? "On Hold" :
                                                    status === "for_signature" ? "For Signature" :
                                                        "Payment Pending"}
                                        </Paragraph>
                                    </View>
                                ))}
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Tree Species Processed */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.cardTitle}>Tree Species Processed</Title>
                            <View style={styles.speciesContainer}>
                                {Object.entries(mockStatistics.tree_species_processed)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([species, count]) => (
                                        <View key={species} style={styles.speciesItem}>
                                            <View style={styles.speciesHeader}>
                                                <Icon name="park" size={18} color="#4CAF50" />
                                                <Paragraph style={styles.speciesName}>
                                                    {species.charAt(0).toUpperCase() + species.slice(1)}
                                                </Paragraph>
                                                <Paragraph style={styles.speciesCount}>{count}</Paragraph>
                                            </View>
                                            <ProgressBar
                                                progress={count / Math.max(...Object.values(mockStatistics.tree_species_processed))}
                                                color="#4CAF50"
                                                style={styles.speciesProgressBar}
                                            />
                                        </View>
                                    ))}
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Inspector Workload */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.cardTitle}>Inspector Workload</Title>
                            <View style={styles.inspectorContainer}>
                                {mockStatistics.inspector_workload.map((inspector) => (
                                    <View key={inspector.name} style={styles.inspectorItem}>
                                        <View style={styles.inspectorHeader}>
                                            <Icon name="person" size={18} color={colors.primary} />
                                            <Paragraph style={styles.inspectorName}>{inspector.name}</Paragraph>
                                        </View>
                                        <View style={styles.inspectorStats}>
                                            <View style={styles.inspectorStatItem}>
                                                <Paragraph style={styles.inspectorStatValue}>
                                                    {inspector.assigned}
                                                </Paragraph>
                                                <Paragraph style={styles.inspectorStatLabel}>Assigned</Paragraph>
                                            </View>
                                            <View style={styles.inspectorStatItem}>
                                                <Paragraph style={[styles.inspectorStatValue, { color: "#4CAF50" }]}>
                                                    {inspector.completed}
                                                </Paragraph>
                                                <Paragraph style={styles.inspectorStatLabel}>Completed</Paragraph>
                                            </View>
                                            <View style={styles.inspectorStatItem}>
                                                <Paragraph style={[styles.inspectorStatValue, { color: "#FF9800" }]}>
                                                    {inspector.assigned - inspector.completed}
                                                </Paragraph>
                                                <Paragraph style={styles.inspectorStatLabel}>Pending</Paragraph>
                                            </View>
                                        </View>
                                        <ProgressBar
                                            progress={inspector.completed / inspector.assigned}
                                            color="#4CAF50"
                                            style={styles.inspectorProgressBar}
                                        />
                                        <Paragraph style={styles.completionRate}>
                                            {calculatePercentage(inspector.completed, inspector.assigned)}% completed
                                        </Paragraph>
                                    </View>
                                ))}
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Monthly Trends */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.cardTitle}>Monthly Trends</Title>
                            <View style={styles.trendsContainer}>
                                {mockStatistics.monthly_data.map((month) => (
                                    <View key={month.month} style={styles.monthItem}>
                                        <Paragraph style={styles.monthLabel}>{month.month}</Paragraph>
                                        <View style={styles.monthBars}>
                                            <View style={styles.monthBarContainer}>
                                                <View
                                                    style={[
                                                        styles.monthBar,
                                                        {
                                                            height: (month.requests / 30) * 60,
                                                            backgroundColor: colors.primary
                                                        }
                                                    ]}
                                                />
                                                <Paragraph style={styles.monthBarValue}>{month.requests}</Paragraph>
                                            </View>
                                            <View style={styles.monthBarContainer}>
                                                <View
                                                    style={[
                                                        styles.monthBar,
                                                        {
                                                            height: (month.completed / 30) * 60,
                                                            backgroundColor: "#4CAF50"
                                                        }
                                                    ]}
                                                />
                                                <Paragraph style={styles.monthBarValue}>{month.completed}</Paragraph>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.legendContainer}>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                                    <Paragraph style={styles.legendText}>Requests</Paragraph>
                                </View>
                                <View style={styles.legendItem}>
                                    <View style={[styles.legendColor, { backgroundColor: "#4CAF50" }]} />
                                    <Paragraph style={styles.legendText}>Completed</Paragraph>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Export/Action Buttons */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.cardTitle}>Actions</Title>
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
                        </Card.Content>
                    </Card>
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    card: {
        marginBottom: 16,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 16,
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
        fontSize: 24,
        fontWeight: "700",
        color: "#333",
    },
    summaryLabel: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
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
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
    },
    breakdownValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        marginBottom: 4,
    },
    percentageText: {
        fontSize: 12,
        color: "#666",
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
        padding: 12,
        backgroundColor: "#F8F9FA",
        borderRadius: 8,
    },
    statusHeader: {
        alignItems: "center",
        marginBottom: 8,
    },
    statusValue: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333",
        marginTop: 4,
    },
    statusLabel: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
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
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
        marginLeft: 8,
        flex: 1,
    },
    speciesCount: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    speciesProgressBar: {
        height: 4,
        borderRadius: 2,
    },
    inspectorContainer: {
        gap: 16,
    },
    inspectorItem: {
        backgroundColor: "#F8F9FA",
        padding: 12,
        borderRadius: 8,
    },
    inspectorHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    inspectorName: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
        marginLeft: 8,
    },
    inspectorStats: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 8,
    },
    inspectorStatItem: {
        alignItems: "center",
    },
    inspectorStatValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    inspectorStatLabel: {
        fontSize: 11,
        color: "#666",
    },
    inspectorProgressBar: {
        height: 4,
        borderRadius: 2,
        marginBottom: 4,
    },
    completionRate: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
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
        fontSize: 12,
        color: "#666",
        marginBottom: 8,
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
        width: 12,
        borderRadius: 2,
        marginBottom: 4,
    },
    monthBarValue: {
        fontSize: 10,
        color: "#666",
    },
    legendContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 16,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 2,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        color: "#666",
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
