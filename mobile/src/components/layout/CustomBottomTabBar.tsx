import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../icons/Icon";

export default function CustomBottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { colors } = useTheme();

    // Check if Testing tab is active
    const currentRoute = state.routes[state.index];
    const isTestingActive = currentRoute.name === "Testing";

    // Check if any route has tabBarStyle with display: none
    const { options } = descriptors[currentRoute.key];
    const tabBarStyle = options.tabBarStyle as any;

    // Hide tab bar if display is set to none
    if (tabBarStyle?.display === "none") {
        return null;
    }

    return (
        <View style={styles.backgroundContainer}>
            <View style={styles.solidBackground} />
            <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
                <View style={styles.outerContainer}>
                    {/* Floating Action Button for Testing tab */}
                    {isTestingActive && (
                        <TouchableOpacity
                            style={styles.fab}
                            onPress={() => (navigation as any).navigate("Testing", { screen: "AddTest" })}
                            activeOpacity={0.8}
                        >
                            <Icon name="Plus" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}

                    <View style={styles.pillContainer}>
                        {state.routes.map((route, index) => {
                            const { options } = descriptors[route.key];
                            const label =
                                options.tabBarLabel !== undefined
                                    ? (options.tabBarLabel as string)
                                    : options.title !== undefined
                                        ? options.title
                                        : route.name;

                            const isFocused = state.index === index;

                            const onPress = () => {
                                const event = navigation.emit({
                                    type: "tabPress",
                                    target: route.key,
                                    canPreventDefault: true,
                                });

                                if (!isFocused && !event.defaultPrevented) {
                                    navigation.navigate(route.name, route.params);
                                }
                            };

                            const onLongPress = () => {
                                navigation.emit({
                                    type: "tabLongPress",
                                    target: route.key,
                                });
                            };

                            const IconComponent = options.tabBarIcon;
                            const iconColor = isFocused ? "#60A5FA" : "#9CA3AF";
                            const labelColor = isFocused ? "#60A5FA" : "#D1D5DB";
                            const size = 22;

                            return (
                                <TouchableOpacity
                                    key={route.key}
                                    accessibilityRole="button"
                                    accessibilityState={isFocused ? { selected: true } : {}}
                                    accessibilityLabel={options.tabBarAccessibilityLabel}
                                    onPress={onPress}
                                    onLongPress={onLongPress}
                                    style={[styles.tab, isFocused && styles.activeTab]}
                                    activeOpacity={0.7}
                                >
                                    {IconComponent ? (
                                        IconComponent({ focused: isFocused, color: iconColor, size })
                                    ) : null}
                                    <Text style={[styles.label, { color: labelColor }]}>
                                        {label as string}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    backgroundContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 24,
    },
    solidBackground: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#F8FAFC",
        height: 80,
    },
    safeArea: {
        backgroundColor: "transparent",
    },
    outerContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        alignItems: "center",
    },
    pillContainer: {
        flexDirection: "row",
        backgroundColor: "#111827",
        borderRadius: 48,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 4,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 68,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 32,
        paddingVertical: 10,
        gap: 4,
    },
    activeTab: {
        backgroundColor: "rgba(96, 165, 250, 0.2)",
    },
    label: {
        fontSize: 10,
        fontWeight: "600",
        marginTop: 2,
    },
    fab: {
        position: "absolute",
        top: 10, // Same vertical position as tabs (inside the pill)
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#02339C",
        alignItems: "center",
        justifyContent: "center",
        elevation: 16,
        zIndex: 1000,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});
