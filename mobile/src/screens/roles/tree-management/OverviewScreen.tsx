import React, { useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { Card, Title, Paragraph, Chip, Divider, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../components/icons/Icon";
import { useNavigation } from "@react-navigation/native";
import StatsCard from "../../../components/StatsCard";
import StandardHeader from "../../../components/layout/StandardHeader";

export default function TreeManagementOverviewScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
    const { colors } = useTheme();

    // Mock data - replace with actual API calls
    const dashboardStats = {
        totalRequests: 145,
        pendingRequests: 23,
        completedThisMonth: 18,
        totalTreesCut: 67,
        totalTreesPruned: 124,
        totalComplaints: 15,
    };

    const recentRequests = [
        {
            id: "1",
            requestNumber: "TM-PR-2025-001",
            type: "pruning",
            requesterName: "Maria Santos",
            status: "filed",
            requestDate: "2025-01-15",
        },
        {
            id: "2",
            requestNumber: "TM-CT-2025-002",
            type: "cutting",
            requesterName: "Juan Cruz",
            status: "payment_pending",
            requestDate: "2025-01-14",
        },
        {
            id: "3",
            requestNumber: "TM-VC-2025-003",
            type: "violation_complaint",
            requesterName: "Lisa Garcia",
            status: "for_signature",
            requestDate: "2025-01-13",
        },
    ];

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            // Add API refresh logic here
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error("Refresh error:", error);
        } finally {
            setRefreshing(false);
        }
    };

    const getRequestTypeLabel = (type: string) => {
        switch (type) {
            case "pruning": return "Pruning";
            case "cutting": return "Tree Cutting";
            case "violation_complaint": return "Violation/Complaint";
            default: return type;
        }
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

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "filed": return "Filed";
            case "on_hold": return "On Hold";
            case "for_signature": return "For Signature";
            case "payment_pending": return "Payment Pending";
            default: return status;
        }
    };

    return (
        <>
            <StandardHeader
                title="Tree Management Dashboard"
                showBack={false}
            />
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {/* Quick Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statsRow}>
                            <StatsCard
                                title="Total Requests"
                                value={dashboardStats.totalRequests.toString()}
                                icon="assignment"
                                color="#2196F3"
                                style={styles.statCard}
                            />
                            <StatsCard
                                title="Pending"
                                value={dashboardStats.pendingRequests.toString()}
                                icon="schedule"
                                color="#FF9800"
                                style={styles.statCard}
                            />
                        </View>
                        <View style={styles.statsRow}>
                            <StatsCard
                                title="Completed This Month"
                                value={dashboardStats.completedThisMonth.toString()}
                                icon="check-circle"
                                color="#4CAF50"
                                style={styles.statCard}
                            />
                            <StatsCard
                                title="Trees Processed"
                                value={(dashboardStats.totalTreesCut + dashboardStats.totalTreesPruned).toString()}
                                icon="park"
                                color="#8BC34A"
                                style={styles.statCard}
                            />
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.cardTitle}>Quick Actions</Title>
                            <View style={styles.actionsContainer}>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                                    onPress={() => navigation.navigate("TreeRequests" as never)}
                                >
                                    <Icon name="add" size={24} color="#FFFFFF" />
                                    <Paragraph style={styles.actionButtonText}>New Request</Paragraph>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
                                    onPress={() => navigation.navigate("TreeRequests" as never)}
                                >
                                    <Icon name="list" size={24} color="#FFFFFF" />
                                    <Paragraph style={styles.actionButtonText}>View All</Paragraph>
                                </TouchableOpacity>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Request Type Breakdown */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.cardTitle}>Request Types</Title>
                            <View style={styles.breakdownContainer}>
                                <View style={styles.breakdownItem}>
                                    <Icon name="content-cut" size={20} color="#FF5722" />
                                    <Paragraph style={styles.breakdownLabel}>Pruning</Paragraph>
                                    <Paragraph style={styles.breakdownValue}>{dashboardStats.totalTreesPruned}</Paragraph>
                                </View>
                                <View style={styles.breakdownItem}>
                                    <Icon name="dangerous" size={20} color="#F44336" />
                                    <Paragraph style={styles.breakdownLabel}>Cutting</Paragraph>
                                    <Paragraph style={styles.breakdownValue}>{dashboardStats.totalTreesCut}</Paragraph>
                                </View>
                                <View style={styles.breakdownItem}>
                                    <Icon name="report" size={20} color="#FF9800" />
                                    <Paragraph style={styles.breakdownLabel}>Complaints</Paragraph>
                                    <Paragraph style={styles.breakdownValue}>{dashboardStats.totalComplaints}</Paragraph>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Recent Requests */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.cardHeader}>
                                <Title style={styles.cardTitle}>Recent Requests</Title>
                                <TouchableOpacity onPress={() => navigation.navigate("TreeRequests" as never)}>
                                    <Paragraph style={[styles.viewAllText, { color: colors.primary }]}>
                                        View All
                                    </Paragraph>
                                </TouchableOpacity>
                            </View>
                            <Divider style={styles.divider} />
                            {recentRequests.map((request, index) => (
                                <TouchableOpacity
                                    key={request.id}
                                    style={styles.requestItem}
                                    onPress={() => navigation.navigate("RequestDetail" as never, { requestId: request.id } as never)}
                                >
                                    <View style={styles.requestHeader}>
                                        <Paragraph style={styles.requestNumber}>{request.requestNumber}</Paragraph>
                                        <Chip
                                            style={[styles.statusChip, { backgroundColor: getStatusColor(request.status) + "20" }]}
                                            textStyle={[styles.statusChipText, { color: getStatusColor(request.status) }]}
                                        >
                                            {getStatusLabel(request.status)}
                                        </Chip>
                                    </View>
                                    <View style={styles.requestDetails}>
                                        <Paragraph style={styles.requestType}>{getRequestTypeLabel(request.type)}</Paragraph>
                                        <Paragraph style={styles.requesterName}>{request.requesterName}</Paragraph>
                                        <Paragraph style={styles.requestDate}>{request.requestDate}</Paragraph>
                                    </View>
                                    {index < recentRequests.length - 1 && <Divider style={styles.itemDivider} />}
                                </TouchableOpacity>
                            ))}
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
    statsContainer: {
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    statCard: {
        flex: 1,
        marginHorizontal: 4,
    },
    card: {
        marginBottom: 16,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: "500",
    },
    divider: {
        marginBottom: 12,
    },
    actionsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    actionButton: {
        flex: 1,
        alignItems: "center",
        padding: 16,
        borderRadius: 8,
        marginHorizontal: 8,
    },
    actionButtonText: {
        color: "#FFFFFF",
        fontWeight: "500",
        marginTop: 4,
    },
    breakdownContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    breakdownItem: {
        alignItems: "center",
        flex: 1,
    },
    breakdownLabel: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
    },
    breakdownValue: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 2,
    },
    requestItem: {
        paddingVertical: 8,
    },
    requestHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    requestNumber: {
        fontSize: 14,
        fontWeight: "600",
    },
    statusChip: {
        height: 24,
    },
    statusChipText: {
        fontSize: 10,
        fontWeight: "500",
    },
    requestDetails: {
        marginLeft: 4,
    },
    requestType: {
        fontSize: 13,
        fontWeight: "500",
        color: "#333",
    },
    requesterName: {
        fontSize: 12,
        color: "#666",
    },
    requestDate: {
        fontSize: 11,
        color: "#999",
    },
    itemDivider: {
        marginTop: 8,
    },
});
