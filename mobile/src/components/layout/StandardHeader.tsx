import React from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, Chip, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Icon, { IconName } from "../icons/Icon";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../core/stores/authStore";

export interface StandardHeaderProps {
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    rightContent?: React.ReactNode;
    rightActionIcon?: IconName;
    onRightActionPress?: () => void;
    chip?: { label: string; iconName?: IconName } | null;
    statusBarStyle?: "light" | "dark";
    backgroundColor?: string;
    borderColor?: string;
    showChangeDashboardAction?: boolean;
}

export default function StandardHeader({
    title,
    subtitle,
    showBack = false,
    onBack,
    rightContent,
    rightActionIcon,
    onRightActionPress,
    chip,
    statusBarStyle = "dark",
    backgroundColor = "#FFFFFF",
    borderColor = "#E5E7EB",
    showChangeDashboardAction = true,
}: StandardHeaderProps) {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const { setSelectedDashboard } = useAuthStore();

    return (
        <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor }]}>
            <StatusBar style={statusBarStyle} backgroundColor={backgroundColor} />
            <Appbar.Header
                statusBarHeight={0}
                style={[styles.header, { backgroundColor, borderBottomColor: borderColor, borderBottomWidth: StyleSheet.hairlineWidth, paddingLeft: 0 }]}
            >
                {showBack ? (
                    <Appbar.BackAction
                        color={colors.primary}
                        onPress={onBack ?? (() => (navigation as any).goBack())}
                    />
                ) : null}

                {showBack ? (
                    <Appbar.Content
                        title={title ?? ""}
                        titleStyle={[styles.title, { color: colors.primary }]}
                        subtitle={subtitle ?? ""}
                        subtitleStyle={[styles.subtitle, { color: "#6B7280" }]}
                        style={styles.content}
                    />
                ) : (
                    <View style={styles.titleBlock}>
                        {!!title && (
                            <Text variant="titleLarge" style={[styles.title, { color: colors.primary, paddingLeft: 16 }]}>
                                {title}
                            </Text>
                        )}
                        {!!subtitle && (
                            <Text variant="bodySmall" style={[styles.subtitle, { color: "#6B7280" }]}>
                                {subtitle}
                            </Text>
                        )}
                    </View>
                )}

                {chip ? (
                    <Chip
                        compact
                        style={[styles.roleChip, { backgroundColor: "rgba(0, 53, 149, 0.10)" }]}
                        textStyle={[styles.roleChipText, { color: colors.primary }]}
                        icon={chip.iconName ? (() => <Icon name={chip.iconName as IconName} size={14} color={colors.primary} />) : undefined}
                    >
                        {chip.label}
                    </Chip>
                ) : null}

                {rightContent}

                {rightActionIcon ? (
                    <Appbar.Action
                        icon={() => <Icon name={rightActionIcon} color={colors.primary} size={22} />}
                        onPress={onRightActionPress}
                    />
                ) : null}

                {showChangeDashboardAction ? (
                    <Appbar.Action
                        icon={() => <Icon name="view-dashboard" color={colors.primary} size={22} />}
                        accessibilityLabel="Change dashboard"
                        onPress={() => setSelectedDashboard(null)}
                    />
                ) : null}
            </Appbar.Header>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 0 },
    header: { elevation: 0, shadowOpacity: 0 },
    title: { fontWeight: "700" },
    subtitle: {},
    content: { alignItems: "flex-start" },
    titleBlock: { flex: 1, alignItems: "flex-start", justifyContent: "center" },
    roleChip: {
        backgroundColor: "#D1FAE5",
        marginRight: 8,
        height: 28,
    },
    roleChipText: { color: "#134E1B", fontSize: 12, fontWeight: "600" },
});
