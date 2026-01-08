import React from "react";
import { StyleSheet, TouchableOpacity, View, Platform } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "../icons/Icon";

export default function CustomBottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    // Check if any route has tabBarStyle with display: none
    const currentRoute = state.routes[state.index];
    const { options } = descriptors[currentRoute.key];
    const tabBarStyle = options.tabBarStyle as any;

    // Hide tab bar if display is set to none
    if (tabBarStyle?.display === "none") {
        return null;
    }

    return (
        <View style={[
            styles.container, 
            { 
                paddingBottom: Math.max(insets.bottom, 8),
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.outlineVariant,
            }
        ]}>
            <View style={styles.tabContainer}>
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
                    const iconColor = isFocused ? "#1E40AF" : "#94A3B8";
                    const labelColor = isFocused ? "#1E40AF" : "#94A3B8";

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.tab}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.iconContainer,
                                isFocused && { 
                                    backgroundColor: "#EFF6FF",
                                }
                            ]}>
                                {IconComponent ? (
                                    IconComponent({ focused: isFocused, color: iconColor, size: 22 })
                                ) : null}
                            </View>
                            <Text 
                                style={[
                                    styles.label, 
                                    { 
                                        color: labelColor,
                                        fontWeight: isFocused ? "800" : "600",
                                        opacity: isFocused ? 1 : 0.7
                                    }
                                ]}
                                numberOfLines={1}
                            >
                                {label as string}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 12,
        borderTopWidth: 1,
        backgroundColor: "#FFFFFF",
        borderTopColor: "#F1F5F9",
    },
    tabContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingHorizontal: 12,
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        minHeight: 68,
    },
    iconContainer: {
        width: 56,
        height: 32,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6,
    },
    label: {
        fontSize: 11,
        textAlign: "center",
        letterSpacing: -0.2,
    },
});
