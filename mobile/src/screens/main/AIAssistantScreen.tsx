import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    StatusBar,
    Image,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { enhancedChatbotService, ChatMessage, ChatAction } from "../../core/api/enhanced-chatbot-service";
import DataDisplay, { ActionButtons } from "../../components/chatbot/DataDisplay";
import Icon from "../../components/icons/Icon";
import MarkdownText from "../../components/MarkdownText";
import { useNavigation } from "@react-navigation/native";

export default function AIAssistantScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "assistant",
            content: "Hi! I'm your environmental monitoring assistant. I can help you access and control your environmental data. Try asking me about air quality, vehicles, or tree management!",
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: "user",
            content: inputText.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        setIsLoading(true);

        try {
            const response = await enhancedChatbotService.sendMessage(inputText.trim());
            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: response.response,
                timestamp: new Date(),
                actions: response.actions,
                data: response.data,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error: any) {
            const errorMessage: ChatMessage = {
                role: "assistant",
                content: `Sorry, I encountered an error: ${error.message || "Unknown error"}`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (action: ChatAction) => {
        setIsLoading(true);
        try {
            const response = await enhancedChatbotService.executeAction(action);
            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: response.response,
                timestamp: new Date(),
                actions: response.actions,
                data: response.data,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error: any) {
            const errorMessage: ChatMessage = {
                role: "assistant",
                content: `Sorry, I encountered an error: ${error.message || "Unknown error"}`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <View style={styles.root}>
                <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

                {/* Background Image - same as other screens */}
                <View style={styles.backgroundImageWrapper} pointerEvents="none">
                    <Image
                        source={require("../../../assets/images/bg_login.png")}
                        style={styles.backgroundImage}
                        resizeMode="cover"
                        accessibilityIgnoresInvertColors
                    />
                </View>

                <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Icon name="ChevronRight" size={20} color="#64748B" style={{ transform: [{ rotate: "180deg" }] }} />
                        </TouchableOpacity>
                        <View style={styles.headerCenter}>
                            <Image
                                source={require("../../../assets/images/logo_app.png")}
                                style={styles.headerLogo}
                                resizeMode="contain"
                            />
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.headerTitle}>AI Assistant</Text>
                                <View style={styles.headerStatus}>
                                    <View style={styles.headerStatusDot} />
                                    <Text style={styles.headerStatusText}>Online</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ width: 36 }} />
                    </View>

                    <KeyboardAvoidingView
                        style={styles.container}
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                    >
                        {/* Messages */}
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.messagesContainer}
                            contentContainerStyle={[styles.messagesContent, { paddingBottom: insets.bottom + 16 }]}
                            showsVerticalScrollIndicator={false}
                        >
                            {messages.map((msg, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.messageWrapper,
                                        msg.role === "user" ? styles.userMessageWrapper : styles.assistantMessageWrapper,
                                    ]}
                                >
                                    {msg.role === "assistant" && (
                                        <View style={styles.assistantAvatar}>
                                            <Icon name="Bot" size={18} color="#FFFFFF" />
                                        </View>
                                    )}
                                    <View
                                        style={[
                                            styles.messageBubble,
                                            msg.role === "user" ? styles.userBubble : styles.assistantBubble,
                                        ]}
                                    >
                                        {msg.role === "assistant" ? (
                                            <MarkdownText
                                                content={msg.content}
                                                style={styles.messageText}
                                            />
                                        ) : (
                                            <Text style={styles.messageText}>{msg.content}</Text>
                                        )}

                                        {msg.data && <DataDisplay data={msg.data} />}
                                        {msg.actions && msg.actions.length > 0 && (
                                            <ActionButtons actions={msg.actions} onActionPress={handleAction} />
                                        )}

                                        <Text style={styles.timestamp}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </Text>
                                    </View>
                                    {msg.role === "user" && (
                                        <View style={styles.userAvatar}>
                                            <Icon name="UserCircle" size={18} color="#FFFFFF" />
                                        </View>
                                    )}
                                </View>
                            ))}

                            {isLoading && (
                                <View style={styles.loadingWrapper}>
                                    <View style={styles.assistantAvatar}>
                                        <Icon name="Bot" size={18} color="#FFFFFF" />
                                    </View>
                                    <View style={styles.loadingBubble}>
                                        <ActivityIndicator size="small" color="#3B82F6" />
                                        <Text style={styles.loadingText}>Thinking...</Text>
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {/* Input Area */}
                        <View style={[styles.inputContainer, { paddingBottom: insets.bottom || 16 }]}>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    value={inputText}
                                    onChangeText={setInputText}
                                    placeholder="Ask me anything..."
                                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                    multiline
                                    maxLength={500}
                                    editable={!isLoading}
                                    onSubmitEditing={handleSend}
                                    blurOnSubmit={false}
                                />
                                <TouchableOpacity
                                    onPress={handleSend}
                                    disabled={!inputText.trim() || isLoading}
                                    style={[
                                        styles.sendButton,
                                        (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                                    ]}
                                >
                                    <Icon
                                        name="Send"
                                        size={20}
                                        color={!inputText.trim() || isLoading ? "rgba(255, 255, 255, 0.3)" : "#FFFFFF"}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    backgroundImageWrapper: {
        position: "absolute" as const,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    backgroundImage: {
        width: "100%",
        height: "100%",
        position: "absolute" as const,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 28,
        paddingVertical: 16,
        backgroundColor: "transparent",
    },
    backButton: {
        padding: 8,
        borderRadius: 10,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderWidth: 1,
        borderColor: "rgba(226, 232, 240, 0.5)",
    },
    headerCenter: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    headerLogo: {
        width: 44,
        height: 44,
    },
    headerTextContainer: {
        gap: 4,
    },
    headerTitle: {
        color: "#111827",
        fontSize: 18,
        fontWeight: "700",
    },
    headerStatus: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    headerStatusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#10B981",
    },
    headerStatusText: {
        color: "#6B7280",
        fontSize: 12,
        fontWeight: "600",
    },
    container: {
        flex: 1,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        gap: 16,
    },
    messageWrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
    },
    userMessageWrapper: {
        justifyContent: "flex-end",
    },
    assistantMessageWrapper: {
        justifyContent: "flex-start",
    },
    assistantAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#3A5A7A",
        alignItems: "center",
        justifyContent: "center",
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(58, 90, 122, 0.3)",
        alignItems: "center",
        justifyContent: "center",
    },
    messageBubble: {
        maxWidth: "75%",
        padding: 16,
        borderRadius: 20,
        gap: 8,
    },
    assistantBubble: {
        backgroundColor: "#FFFFFF",
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    userBubble: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderBottomRightRadius: 4,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
        color: "#0F172A",
    },
    timestamp: {
        fontSize: 11,
        color: "#94A3B8",
        marginTop: 4,
    },
    loadingWrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
    },
    loadingBubble: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    loadingText: {
        fontSize: 14,
        color: "#64748B",
    },
    inputContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 12,
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: "#111827",
        maxHeight: 100,
        paddingVertical: 0,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#3A5A7A",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    sendButtonDisabled: {
        backgroundColor: "#CBD5E1",
    },
});
