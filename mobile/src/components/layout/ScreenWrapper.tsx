import React from "react";
import { View, StyleSheet } from "react-native";
import FloatingChatbot from "../chatbot/FloatingChatbot";
import ChatbotFAB from "../chatbot/ChatbotFAB";
import { useChatbot } from "../../core/contexts/ChatbotContext";

interface ScreenWrapperProps {
    children: React.ReactNode;
    showFAB?: boolean;
}

export default function ScreenWrapper({ children, showFAB = true }: ScreenWrapperProps) {
    const { chatVisible, showChatbot, hideChatbot } = useChatbot();

    return (
        <View style={styles.container}>
            {children}

            {/* Floating Action Button */}
            {showFAB && !chatVisible && (
                <ChatbotFAB onPress={showChatbot} />
            )}

            {/* Floating Chatbot */}
            <FloatingChatbot
                visible={chatVisible}
                onClose={hideChatbot}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
