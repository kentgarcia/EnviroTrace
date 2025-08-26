import React from "react";
import {
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
} from "react-native";
import Icon from "../icons/Icon";

interface ChatbotFABProps {
    onPress: () => void;
    visible?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ChatbotFAB({ onPress, visible = true }: ChatbotFABProps) {
    if (!visible) return null;

    return (
        <TouchableOpacity
            style={styles.fab}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Icon name="message-circle" size={24} color="#fff" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: "absolute",
        bottom: 90, // Above bottom tab bar
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#2E7D32",
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        zIndex: 999,
    },
});
