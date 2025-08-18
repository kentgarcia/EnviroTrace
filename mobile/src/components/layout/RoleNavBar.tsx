import React from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, Chip, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../core/stores/authStore";
import Icon from "../icons/Icon";
import { StatusBar } from "expo-status-bar";

export interface RoleNavBarProps {
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    rightContent?: React.ReactNode;
    showRoleChip?: boolean;
}

export default function RoleNavBar({
    title,
    subtitle,
    showBack = false,
    onBack,
    rightContent,
    showRoleChip = true,
}: RoleNavBarProps) {
    const { colors } = useTheme();
    const { selectedDashboard, setSelectedDashboard } = useAuthStore();

    const roleLabelMap: Record<string, string> = {
        admin: "Admin",
        government_emission: "Gov. Emission",
        air_quality: "Air Quality",
        tree_management: "Tree Management",
    };

    return (
        <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: "#FFFFFF" }]}>
            <StatusBar style="dark" backgroundColor="#FFFFFF" />
            <Appbar.Header
                statusBarHeight={0}
                style={[
                    styles.header,
                    {
                        backgroundColor: "#FFFFFF",
                        borderBottomColor: "#E5E7EB",
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        paddingLeft: 0,
                    },
                ]}
            >
                {showBack ? (
                    <Appbar.BackAction color={colors.primary} onPress={onBack} />
                ) : null}

                <Appbar.Content
                    title={title ?? ""}
                    titleStyle={[styles.title, { color: colors.primary }]}
                    subtitle={subtitle ?? ""}
                    subtitleStyle={[styles.subtitle, { color: "#6B7280" }]}
                    style={{ marginLeft: 0, alignItems: "flex-start" }}
                />

                {showRoleChip && selectedDashboard ? (
                    <Chip
                        compact
                        style={[styles.roleChip, { backgroundColor: "rgba(0, 53, 149, 0.10)" }]}
                        textStyle={[styles.roleChipText, { color: colors.primary }]}
                        icon={() => (
                            <Icon
                                name={
                                    selectedDashboard === "government_emission"
                                        ? "car"
                                        : selectedDashboard === "tree_management"
                                            ? "tree"
                                            : selectedDashboard === "air_quality"
                                                ? "weather-windy"
                                                : "shield"
                                }
                                size={14}
                                color={colors.primary}
                            />
                        )}
                    >
                        {roleLabelMap[selectedDashboard] ?? selectedDashboard}
                    </Chip>
                ) : null}

                {rightContent}

                {/* Change dashboard action */}
                <Appbar.Action
                    icon={() => <Icon name="view-dashboard" color={colors.primary} size={22} />}
                    accessibilityLabel="Change dashboard"
                    onPress={() => setSelectedDashboard(null)}
                />
            </Appbar.Header>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 0 },
    header: { elevation: 0, shadowOpacity: 0 },
    title: { fontWeight: "700" },
    subtitle: {},
    roleChip: {
        backgroundColor: "#D1FAE5",
        marginRight: 8,
        height: 28,
    },
    roleChipText: { color: "#134E1B", fontSize: 12, fontWeight: "600" },
});
