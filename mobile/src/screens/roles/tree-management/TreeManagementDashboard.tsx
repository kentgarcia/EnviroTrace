import React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Title, Paragraph, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../components/icons/Icon";
import { useNavigation } from "@react-navigation/native";
import StandardHeader from "../../../components/layout/StandardHeader";

export default function TreeManagementDashboard() {
    const navigation = useNavigation();
    const { colors } = useTheme();

    const menuItems = [
        {
            title: "Dashboard Overview",
            description: "View summary and recent activities",
            icon: "dashboard",
            screen: "TreeManagementOverview",
            color: "#2196F3",
        },
        {
            title: "Tree Requests",
            description: "Manage tree pruning, cutting, and complaints",
            icon: "assignment",
            screen: "TreeRequests",
            color: "#4CAF50",
        },
        {
            title: "Add New Request",
            description: "Submit a new tree management request",
            icon: "add-circle",
            screen: "TreeRequests", // Will navigate to the stack and then to AddRequest
            color: "#FF9800",
        },
        {
            title: "Statistics & Reports",
            description: "View analytics and generate reports",
            icon: "bar-chart",
            screen: "Statistics",
            color: "#9C27B0",
        },
    ];

    return (
        <>
            <StandardHeader
                title="Tree Management"
                showBack={false}
            />
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.scrollView}>
                    <View style={styles.header}>
                        <Title style={styles.headerTitle}>Tree Management System</Title>
                        <Paragraph style={styles.headerSubtitle}>
                            Manage tree maintenance requests, inspections, and urban forestry activities
                        </Paragraph>
                    </View>

                    <View style={styles.menuContainer}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.menuItem}
                                onPress={() => navigation.navigate(item.screen as never)}
                            >
                                <Card style={styles.menuCard}>
                                    <Card.Content style={styles.menuCardContent}>
                                        <View style={[styles.iconContainer, { backgroundColor: item.color + "20" }]}>
                                            <Icon name={item.icon} size={24} color={item.color} />
                                        </View>
                                        <View style={styles.menuTextContainer}>
                                            <Title style={styles.menuTitle}>{item.title}</Title>
                                            <Paragraph style={styles.menuDescription}>{item.description}</Paragraph>
                                        </View>
                                        <Icon name="chevron-right" size={20} color="#999" />
                                    </Card.Content>
                                </Card>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Quick Stats */}
                    <Card style={styles.quickStatsCard}>
                        <Card.Content>
                            <Title style={styles.quickStatsTitle}>Quick Stats</Title>
                            <View style={styles.quickStatsContainer}>
                                <View style={styles.quickStatItem}>
                                    <Paragraph style={styles.quickStatValue}>24</Paragraph>
                                    <Paragraph style={styles.quickStatLabel}>Pending Requests</Paragraph>
                                </View>
                                <View style={styles.quickStatItem}>
                                    <Paragraph style={styles.quickStatValue}>12</Paragraph>
                                    <Paragraph style={styles.quickStatLabel}>This Week</Paragraph>
                                </View>
                                <View style={styles.quickStatItem}>
                                    <Paragraph style={styles.quickStatValue}>156</Paragraph>
                                    <Paragraph style={styles.quickStatLabel}>Total Processed</Paragraph>
                                </View>
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
    header: {
        marginBottom: 24,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#333",
        textAlign: "center",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginTop: 8,
        lineHeight: 20,
    },
    menuContainer: {
        marginBottom: 24,
    },
    menuItem: {
        marginBottom: 12,
    },
    menuCard: {
        elevation: 2,
    },
    menuCardContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    menuDescription: {
        fontSize: 13,
        color: "#666",
        lineHeight: 18,
    },
    quickStatsCard: {
        elevation: 2,
    },
    quickStatsTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 16,
    },
    quickStatsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    quickStatItem: {
        alignItems: "center",
    },
    quickStatValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#333",
    },
    quickStatLabel: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
        textAlign: "center",
    },
});
