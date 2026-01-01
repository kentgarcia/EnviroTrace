import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Icon, { IconName } from "./icons/Icon";

export interface FloatingActionButtonProps {
    /** Icon name to display */
    icon?: IconName;
    /** Icon size (default: 24) */
    iconSize?: number;
    /** Icon color (default: #FFFFFF) */
    iconColor?: string;
    /** Background color (default: #111827) */
    backgroundColor?: string;
    /** On press handler */
    onPress: () => void;
    /** Bottom position (default: 90) */
    bottom?: number;
    /** Right position (default: 28) */
    right?: number;
}

/**
 * Floating Action Button component for quick actions
 * Positioned absolutely at the bottom right of the screen
 */
export default function FloatingActionButton({
    icon = "Plus",
    iconSize = 24,
    iconColor = "#FFFFFF",
    backgroundColor = "#111827",
    onPress,
    bottom = 90,
    right = 28,
}: FloatingActionButtonProps) {
    return (
        <TouchableOpacity
            style={[
                styles.fab,
                {
                    backgroundColor,
                    bottom,
                    right,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Icon name={icon} size={iconSize} color={iconColor} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: "absolute",
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        elevation: 6,
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
    },
});
