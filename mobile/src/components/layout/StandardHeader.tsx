import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
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
    showProfileAction?: boolean;
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
    showChangeDashboardAction = false,
    showProfileAction = true,
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
        <View style={[styles.safe, { backgroundColor }]}>
            <StatusBar style={statusBarStyle} backgroundColor="transparent" translucent />
            <View style={[styles.header, { backgroundColor, borderBottomColor: borderColor }]}>
                {/* Left Side - Back Button or Title */}
                <View style={styles.headerLeft}>
                    {showBack && (
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Icon
                                name="ChevronLeft"
                                size={iconSize - 2}
                                color="#1E293B"
                            />
                        </TouchableOpacity>
                    )}
                    {!showBack && title && (
                        <View>
                            <Text variant="headlineMedium" style={[styles.headerTitle, { fontSize: titleSize }]}>
                                {title}
                            </Text>
                            {subtitle && (
                                <View style={styles.subtitleContainer}>
                                    <View style={styles.subtitleDot} />
                                    <Text variant="bodySmall" style={[styles.headerSubtitle, { fontSize: subtitleSize }]}>
                                        {subtitle}
                                    </Text>
                                </View>
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
                            <Icon name={rightActionIcon} size={iconSize - 4} color="#1E293B" />
                        </TouchableOpacity>
                    )}

                    {showProfileAction && (
                        <TouchableOpacity
                            onPress={() => (navigation as any).navigate("Profile")}
                            style={styles.actionButton}
                        >
                            <Icon name="UserCircle" size={iconSize - 2} color="#2563EB" />
                        </TouchableOpacity>
                    )}

                    {showChangeDashboardAction && (
                        <TouchableOpacity
                            onPress={() => setSelectedDashboard(null)}
                            style={styles.actionButton}
                        >
                            <Icon name="LayoutDashboard" size={iconSize - 4} color="#1E293B" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
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
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: "transparent",
        borderBottomWidth: 1,
    },
    headerLeft: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    headerTitle: {
        color: "#0F172A",
        fontWeight: "800",
        fontSize: 28,
        letterSpacing: -0.8,
    },
    subtitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 2,
    },
    subtitleDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#2563EB",
    },
    headerSubtitle: {
        color: "#64748B",
        fontSize: 13,
        fontWeight: "600",
    },
    titleWithBack: {
        flex: 1,
    },
    titleText: {
        color: "#0F172A",
        fontWeight: "800",
        fontSize: 20,
        letterSpacing: -0.5,
    },
    subtitleText: {
        color: "#64748B",
        fontSize: 12,
        fontWeight: "500",
        marginTop: 1,
    },
    headerActions: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
});
