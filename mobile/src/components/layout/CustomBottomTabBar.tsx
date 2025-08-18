import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../icons/Icon";

export default function CustomBottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { colors } = useTheme();
    const [width, setWidth] = useState(0);
    const segmentWidth = useMemo(() => (state.routes.length > 0 ? width / state.routes.length : 0), [width, state.routes.length]);
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (segmentWidth > 0) {
            Animated.timing(translateX, {
                toValue: state.index * segmentWidth,
                duration: 220,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        }
    }, [state.index, segmentWidth, translateX]);

    // No crossfade between icon/label and FAB to avoid disturbing labels/icons

    return (
        <SafeAreaView edges={["bottom"]} style={[styles.safeArea, { backgroundColor: "#FFFFFF" }]}>
            <View
                style={[styles.container]}
                onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
            >
                {/* Sliding top primary indicator (hidden when Testing is active) */}
                {segmentWidth > 0 && state.routes[state.index]?.name !== "Testing" ? (
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            styles.activeBar,
                            { backgroundColor: colors.primary, width: segmentWidth, transform: [{ translateX }] },
                        ]}
                    />
                ) : null}
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

                    const color = isFocused ? colors.primary : "#9E9E9E";
                    const size = 22;
                    const IconComponent = options.tabBarIcon;

                    const isTesting = route.name === "Testing";

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={[styles.item, isTesting && styles.testingSlot]}
                        >
                            {/* Icon (hide for Testing to avoid duplicate with FAB; keep space) */}
                            <View style={styles.iconWrap}>
                                {!isTesting && IconComponent ? IconComponent({ focused: isFocused, color, size }) : null}
                            </View>
                            {/* Label */}
                            <Text style={[styles.label, { color }]}>{label as string}</Text>

                            {/* Center elevated Testing FAB and halo, without affecting icon/label layout */}
                            {isTesting ? (
                                <>
                                    {isFocused ? <View pointerEvents="none" style={styles.testingHalo} /> : null}
                                    <TouchableOpacity
                                        accessibilityRole="button"
                                        onPress={() =>
                                            isFocused
                                                ? (navigation as any).navigate("Testing", { screen: "AddTest" })
                                                : navigation.navigate("Testing")
                                        }
                                        style={styles.testingFab}
                                        activeOpacity={0.85}
                                    >
                                        <Icon name={isFocused ? "plus" : "assignment"} size={26} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </>
                            ) : null}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: "#FFFFFF",
        overflow: "visible",
    },
    container: {
        flexDirection: "row",
        height: 70,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#E0E0E0",
        backgroundColor: "#FFFFFF",
        position: "relative",
        overflow: "visible",
    },
    item: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    activeBar: {
        position: "absolute",
        top: 0,
        left: 0,
        height: 3,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
    iconWrap: { height: 26, justifyContent: "center" },
    label: { fontSize: 11, marginTop: 2, fontWeight: "600" },
    testingSlot: {},
    testingFab: {
        position: "absolute",
        top: -28,
        left: "50%",
        marginLeft: -28,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#003595",
        alignItems: "center",
        justifyContent: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        zIndex: 3,
    },
    testingHalo: {
        position: "absolute",
        top: -32,
        left: "50%",
        marginLeft: -32,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(0, 53, 149, 0.12)",
        zIndex: 2,
    },
});
