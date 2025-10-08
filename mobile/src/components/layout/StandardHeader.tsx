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
                                size={24}
                                color="#475569"
                                style={{ transform: [{ rotate: "180deg" }] }}
                            />
                        </TouchableOpacity>
                    )}
                    {!showBack && title && (
                        <View>
                            <Text variant="headlineMedium" style={styles.headerTitle}>
                                {title}
                            </Text>
                            {subtitle && (
                                <Text variant="bodySmall" style={styles.headerSubtitle}>
                                    {subtitle}
                                </Text>
                            )}
                        </View>
                    )}
                    {showBack && title && (
                        <View style={styles.titleWithBack}>
                            <Text variant="titleLarge" style={styles.titleText}>
                                {title}
                            </Text>
                            {subtitle && (
                                <Text variant="bodySmall" style={styles.subtitleText}>
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
                            <Icon name={rightActionIcon} size={24} color="#475569" />
                        </TouchableOpacity>
                    )}

                    {showChangeDashboardAction && (
                        <TouchableOpacity
                            onPress={() => setSelectedDashboard(null)}
                            style={styles.actionButton}
                        >
                            <Icon name="LayoutDashboard" size={24} color="#475569" />
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
        paddingHorizontal: 20,
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
        borderRadius: 12,
        backgroundColor: "rgba(241, 245, 249, 0.8)",
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
        borderRadius: 12,
        backgroundColor: "rgba(241, 245, 249, 0.8)",
    },
});
