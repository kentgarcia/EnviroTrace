import React, { useState, useEffect } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
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
import { treeManagementService, TreeManagementRequest } from "../../../core/api/tree-management-service";

export default function StatisticsScreen() {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const [selectedPeriod, setSelectedPeriod] = useState("monthly");
    const [requests, setRequests] = useState<TreeManagementRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            setLoading(true);
            const data = await treeManagementService.getRequests({ limit: 1000 });
            setRequests(data);
        } catch (error) {
            console.error("Error loading statistics:", error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStatistics();
        setRefreshing(false);
    };

    // Calculate statistics from actual data
    const statistics = React.useMemo(() => {
        const total_requests = requests.length;
        const pending_requests = requests.filter(r => r.status === "filed").length;
        const in_progress_requests = requests.filter(r =>
            r.status === "on_hold" || r.status === "for_signature"
        ).length;
        const completed_requests = requests.filter(r => r.status === "payment_pending").length;

        // Request types breakdown
        const request_types = {
            pruning: requests.filter(r => r.request_type === "pruning").length,
            cutting: requests.filter(r => r.request_type === "cutting").length,
            violation_complaint: requests.filter(r => r.request_type === "violation_complaint").length,
        };

        // Status breakdown
        const status_breakdown = {
            filed: requests.filter(r => r.status === "filed").length,
            on_hold: requests.filter(r => r.status === "on_hold").length,
            for_signature: requests.filter(r => r.status === "for_signature").length,
            payment_pending: requests.filter(r => r.status === "payment_pending").length,
        };

        // Monthly data (last 6 months)
        const monthly_data = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthRequests = requests.filter(r => {
                const requestDate = new Date(r.request_date);
                return requestDate.getMonth() === monthDate.getMonth() &&
                    requestDate.getFullYear() === monthDate.getFullYear();
            });
            monthly_data.push({
                month: monthDate.toLocaleString('default', { month: 'short' }),
                requests: monthRequests.length,
                completed: monthRequests.filter(r => r.status === "payment_pending").length,
            });
        }

        // Inspector workload
        const inspectorMap = new Map<string, { assigned: number; completed: number }>();
        requests.forEach(r => {
            if (r.inspectors && r.inspectors.length > 0) {
                r.inspectors.forEach(inspector => {
                    if (!inspectorMap.has(inspector)) {
                        inspectorMap.set(inspector, { assigned: 0, completed: 0 });
                    }
                    const stats = inspectorMap.get(inspector)!;
                    stats.assigned++;
                    if (r.status === "payment_pending") {
                        stats.completed++;
                    }
                });
            }
        });

        const inspector_workload = Array.from(inspectorMap.entries())
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.assigned - a.assigned)
            .slice(0, 4);

        // Tree species processed
        const treeSpeciesMap = new Map<string, number>();
        requests.forEach(r => {
            if (r.trees_and_quantities && r.trees_and_quantities.length > 0) {
                r.trees_and_quantities.forEach(treeInfo => {
                    const treeName = treeInfo.split(':')[0].trim().toLowerCase();
                    treeSpeciesMap.set(treeName, (treeSpeciesMap.get(treeName) || 0) + 1);
                });
            }
        });

        const tree_species_processed = Object.fromEntries(
            Array.from(treeSpeciesMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
        );

        return {
            total_requests,
            pending_requests,
            completed_requests,
            in_progress_requests,
            monthly_data,
            request_types,
            tree_species_processed,
            inspector_workload,
            status_breakdown,
        };
    }, [requests]);

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
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#111827"]}
                            tintColor="#111827"
                        />
                    }
                >
                    {loading && requests.length === 0 ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Loading statistics...</Text>
                        </View>
                    ) : (
                        <>
                            {/* Overall Summary */}
                            <View style={styles.section}>
                                <View style={styles.card}>
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle}>Overall Summary</Text>
                                        <View style={styles.summaryGrid}>
                                            <View style={styles.summaryItem}>
                                                <Text style={styles.summaryValue}>
                                                    {statistics.total_requests}
                                                </Text>
                                                <Text style={styles.summaryLabel}>Total Requests</Text>
                                            </View>
                                            <View style={styles.summaryItem}>
                                                <Text style={[styles.summaryValue, { color: "#F59E0B" }]}>
                                                    {statistics.pending_requests}
                                                </Text>
                                                <Text style={styles.summaryLabel}>Pending</Text>
                                            </View>
                                            <View style={styles.summaryItem}>
                                                <Text style={[styles.summaryValue, { color: "#22C55E" }]}>
                                                    {statistics.completed_requests}
                                                </Text>
                                                <Text style={styles.summaryLabel}>Completed</Text>
                                            </View>
                                            <View style={styles.summaryItem}>
                                                <Text style={[styles.summaryValue, { color: "#60A5FA" }]}>
                                                    {statistics.in_progress_requests}
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
                                            {Object.entries(statistics.request_types).map(([type, count]) => (
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
                                                        progress={statistics.total_requests > 0 ? count / statistics.total_requests : 0}
                                                        color={getTypeColor(type)}
                                                        style={styles.progressBar}
                                                    />
                                                    <Paragraph style={styles.percentageText}>
                                                        {calculatePercentage(count, statistics.total_requests)}% of total
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
                                            {Object.entries(statistics.status_breakdown).map(([status, count]) => (
                                                <View key={status} style={styles.statusItem}>
                                                    <View style={styles.statusHeader}>
                                                        <Icon
                                                            name={
                                                                status === "filed" ? "FileText" :
                                                                    status === "on_hold" ? "Clock" :
                                                                        status === "for_signature" ? "Edit" : "DollarSign"
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
                                            {Object.entries(statistics.tree_species_processed)
                                                .sort(([, a], [, b]) => b - a)
                                                .map(([species, count]) => (
                                                    <View key={species} style={styles.speciesItem}>
                                                        <View style={styles.speciesHeader}>
                                                            <Icon name="TreeDeciduous" size={16} color="#22C55E" />
                                                            <Text style={styles.speciesName}>
                                                                {species.charAt(0).toUpperCase() + species.slice(1)}
                                                            </Text>
                                                            <Text style={styles.speciesCount}>{count}</Text>
                                                        </View>
                                                        <ProgressBar
                                                            progress={
                                                                Object.keys(statistics.tree_species_processed).length > 0
                                                                    ? count / Math.max(...Object.values(statistics.tree_species_processed))
                                                                    : 0
                                                            }
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
                            {statistics.inspector_workload.length > 0 && (
                                <View style={styles.section}>
                                    <View style={styles.card}>
                                        <View style={styles.cardContent}>
                                            <Text style={styles.cardTitle}>Inspector Workload</Text>
                                            <View style={styles.inspectorContainer}>
                                                {statistics.inspector_workload.map((inspector) => (
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
                                                            progress={inspector.assigned > 0 ? inspector.completed / inspector.assigned : 0}
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
                            )}

                            {/* Monthly Trends */}
                            <View style={styles.section}>
                                <View style={styles.card}>
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle}>Monthly Trends</Text>
                                        <View style={styles.trendsContainer}>
                                            {statistics.monthly_data.map((month) => {
                                                const maxRequests = Math.max(...statistics.monthly_data.map(m => m.requests), 1);
                                                return (
                                                    <View key={month.month} style={styles.monthItem}>
                                                        <Text style={styles.monthLabel}>{month.month}</Text>
                                                        <View style={styles.monthBars}>
                                                            <View style={styles.monthBarContainer}>
                                                                <View
                                                                    style={[
                                                                        styles.monthBar,
                                                                        {
                                                                            height: (month.requests / maxRequests) * 60,
                                                                            backgroundColor: "#111827"
                                                                        }
                                                                    ]}
                                                                />
                                                            </View>
                                                            <View style={styles.monthBarContainer}>
                                                                <View
                                                                    style={[
                                                                        styles.monthBar,
                                                                        {
                                                                            height: (month.completed / maxRequests) * 60,
                                                                            backgroundColor: "#22C55E"
                                                                        }
                                                                    ]}
                                                                />
                                                            </View>
                                                        </View>
                                                        <Text style={styles.monthBarValue}>{month.requests}</Text>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                        <View style={styles.legendContainer}>
                                            <View style={styles.legendItem}>
                                                <View style={[styles.legendColor, { backgroundColor: "#111827" }]} />
                                                <Text style={styles.legendText}>Total Requests</Text>
                                            </View>
                                            <View style={styles.legendItem}>
                                                <View style={[styles.legendColor, { backgroundColor: "#22C55E" }]} />
                                                <Text style={styles.legendText}>Completed</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </>
                    )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 64,
    },
    loadingText: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
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
