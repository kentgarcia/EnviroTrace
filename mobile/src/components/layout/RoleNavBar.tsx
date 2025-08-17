import React from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, Chip, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../core/stores/authStore";
import Icon from "../icons/Icon";

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
        <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: colors.primary }]}>
            <Appbar.Header statusBarHeight={0} style={[styles.header, { backgroundColor: colors.primary }]}>
                {showBack ? (
                    <Appbar.BackAction color="#FFFFFF" onPress={onBack} />
                ) : (
                    // add a small left spacer so title aligns nicely when no back
                    <View style={{ width: 4 }} />
                )}

                <Appbar.Content
                    title={title ?? ""}
                    titleStyle={styles.title}
                    subtitle={subtitle ?? ""}
                    subtitleStyle={styles.subtitle}
                    color="#FFFFFF"
                />

                {showRoleChip && selectedDashboard ? (
                    <Chip
                        compact
                        style={styles.roleChip}
                        textStyle={styles.roleChipText}
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
                                color="#134E1B"
                            />
                        )}
                    >
                        {roleLabelMap[selectedDashboard] ?? selectedDashboard}
                    </Chip>
                ) : null}

                {rightContent}

                {/* Default actions: profile and switch dashboard */}
                <Appbar.Action
                    icon={() => <Icon name="account-circle" color="#FFFFFF" size={22} />}
                    accessibilityLabel="Profile"
                    onPress={() => {
                        // Placeholder for profile action. Can be overridden via rightContent prop in PageLayout.
                    }}
                />
                <Appbar.Action
                    icon={() => <Icon name="logout" color="#FFFFFF" size={22} />}
                    accessibilityLabel="Switch dashboard"
                    onPress={() => setSelectedDashboard(null)}
                />
            </Appbar.Header>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 0 },
    header: { elevation: 4 },
    title: { color: "#FFFFFF", fontWeight: "700" },
    subtitle: { color: "#E6F4EA" },
    roleChip: {
        backgroundColor: "#D1FAE5",
        marginRight: 8,
        height: 28,
    },
    roleChipText: { color: "#134E1B", fontSize: 12, fontWeight: "600" },
});
