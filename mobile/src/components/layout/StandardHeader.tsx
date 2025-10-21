import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
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
    statusBarStyle?: "light" | "dark";
    backgroundColor?: string;
    borderColor?: string;
    showChangeDashboardAction?: boolean;
    titleSize?: number;
    subtitleSize?: number;
    iconSize?: number;
}

export default function StandardHeader({
    title,
    subtitle,
    showBack = false,
    onBack,
    rightContent,
    rightActionIcon,
    onRightActionPress,
    statusBarStyle = "dark",
    backgroundColor = "transparent",
    borderColor = "transparent",
    showChangeDashboardAction = true,
    titleSize = 28,
    subtitleSize = 14,
    iconSize = 24,
}: StandardHeaderProps) {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const { setSelectedDashboard } = useAuthStore();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            (navigation as any).goBack();
        }
    };

    return (
        <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor }]}>
            <StatusBar style={statusBarStyle} backgroundColor="transparent" translucent />
            <View style={[styles.header, { backgroundColor, borderBottomColor: borderColor }]}>
                {/* Left Side - Back Button or Title */}
                <View style={styles.headerLeft}>
                    {showBack && (
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Icon
                                name="ChevronRight"
                                size={iconSize}
                                color="#475569"
                                style={{ transform: [{ rotate: "180deg" }] }}
                            />
                        </TouchableOpacity>
                    )}
                    {!showBack && title && (
                        <View>
                            <Text variant="headlineMedium" style={[styles.headerTitle, { fontSize: titleSize }]}>
                                {title}
                            </Text>
                            {subtitle && (
                                <Text variant="bodySmall" style={[styles.headerSubtitle, { fontSize: subtitleSize }]}>
                                    {subtitle}
                                </Text>
                            )}
                        </View>
                    )}
                    {showBack && title && (
                        <View style={styles.titleWithBack}>
                            <Text variant="titleLarge" style={[styles.titleText, { fontSize: titleSize }]}>
                                {title}
                            </Text>
                            {subtitle && (
                                <Text variant="bodySmall" style={[styles.subtitleText, { fontSize: subtitleSize }]}>
                                    {subtitle}
                                </Text>
                            )}
                        </View>
                    )}
                </View>

                {/* Right Side - Actions */}
                <View style={styles.headerActions}>
                    {rightContent}

                    {rightActionIcon && (
                        <TouchableOpacity onPress={onRightActionPress} style={styles.actionButton}>
                            <Icon name={rightActionIcon} size={iconSize} color="#475569" />
                        </TouchableOpacity>
                    )}

                    {showChangeDashboardAction && (
                        <TouchableOpacity
                            onPress={() => setSelectedDashboard(null)}
                            style={styles.actionButton}
                        >
                            <Icon name="LayoutDashboard" size={iconSize} color="#475569" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 0,
        backgroundColor: "transparent",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 28,
        paddingVertical: 16,
        backgroundColor: "transparent",
    },
    headerLeft: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    backButton: {
        padding: 8,
        borderRadius: 10,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderWidth: 1,
        borderColor: "rgba(226, 232, 240, 0.5)",
    },
    headerTitle: {
        color: "#1E293B",
        fontWeight: "700",
        fontSize: 28,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        color: "#64748B",
        fontSize: 14,
        marginTop: 2,
    },
    titleWithBack: {
        flex: 1,
    },
    titleText: {
        color: "#1E293B",
        fontWeight: "700",
        fontSize: 20,
    },
    subtitleText: {
        color: "#64748B",
        fontSize: 13,
        marginTop: 2,
    },
    headerActions: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    actionButton: {
        padding: 8,
        borderRadius: 10,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderWidth: 1,
        borderColor: "rgba(226, 232, 240, 0.5)",
    },
});
