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
            screen: "OverviewScreen",
            color: colors.primary,
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
            screen: "AddRequest",
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
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                >
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => navigation.navigate(item.screen as never)}
                            style={styles.menuItemContainer}
                        >
                            <Card
                                mode="outlined"
                                style={[
                                    styles.menuCard,
                                    { borderColor: `${item.color}26` }
                                ]}
                            >
                                <Card.Content style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        <View
                                            style={[
                                                styles.iconContainer,
                                                { backgroundColor: `${item.color}15` }
                                            ]}
                                        >
                                            <Icon
                                                name={item.icon}
                                                size={28}
                                                color={item.color}
                                            />
                                        </View>
                                        <View style={styles.textContainer}>
                                            <Title style={[styles.menuTitle, { color: colors.onSurface }]}>
                                                {item.title}
                                            </Title>
                                            <Paragraph style={styles.menuDescription}>
                                                {item.description}
                                            </Paragraph>
                                        </View>
                                        <Icon
                                            name="chevron-right"
                                            size={20}
                                            color={colors.outline}
                                        />
                                    </View>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </>
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
    menuItemContainer: {
        marginBottom: 12,
    },
    menuCard: {
        borderRadius: 12,
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    textContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    menuDescription: {
        fontSize: 14,
        color: "#666666",
        lineHeight: 20,
    },
});
