import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import Icon from "../icons/Icon";
import { enhancedChatbotService, ChatMessage, ChatAction } from "../../core/api/enhanced-chatbot-service";
import DataDisplay, { ActionButtons } from "./DataDisplay";

interface FloatingChatbotProps {
    visible: boolean;
    onClose: () => void;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const CHAT_HEIGHT = SCREEN_HEIGHT * 0.7;
const CHAT_WIDTH = SCREEN_WIDTH - 32;

export default function FloatingChatbot({ visible, onClose }: FloatingChatbotProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "assistant",
            content: "Hi! I can help you with vehicle emissions and tree management data. Ask me anything!",
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    const scrollViewRef = useRef<ScrollView>(null);
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const minimizeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            // Slide up animation
            Animated.spring(slideAnim, {
                toValue: SCREEN_HEIGHT - CHAT_HEIGHT - 50,
                useNativeDriver: true,
                tension: 65,
                friction: 8,
            }).start();
        } else {
            // Slide down animation
            Animated.spring(slideAnim, {
                toValue: SCREEN_HEIGHT,
                useNativeDriver: true,
                tension: 65,
                friction: 8,
            }).start();
        }
    }, [visible]);

    useEffect(() => {
        // Auto-scroll to bottom when new messages are added
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    const handleMinimize = () => {
        setIsMinimized(!isMinimized);
        Animated.spring(minimizeAnim, {
            toValue: isMinimized ? 1 : 0.1,
            useNativeDriver: true,
            tension: 65,
            friction: 8,
        }).start();
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const validation = enhancedChatbotService.validateMessage(inputText);
        if (!validation.isValid) {
            return;
        }

        const userMessage: ChatMessage = {
            role: "user",
            content: inputText.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        setIsLoading(true);

        try {
            const response = await enhancedChatbotService.sendMessage(userMessage.content);

            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: response.response,
                timestamp: new Date(),
                data: response.data,
                actions: response.actions,
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Failed to send message:", error);

            const errorMessage: ChatMessage = {
                role: "assistant",
                content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessage = (message: ChatMessage, index: number) => {
        const isUser = message.role === "user";
        const isSystem = message.role === "system";

        return (
            <View key={index} style={styles.messageWrapper}>
                <View
                    style={[
                        styles.messageContainer,
                        isUser ? styles.userMessage : styles.assistantMessage,
                        isSystem && styles.systemMessage,
                    ]}
                >
                    <View
                        style={[
                            styles.messageBubble,
                            isUser ? styles.userBubble : styles.assistantBubble,
                            isSystem && styles.systemBubble,
                        ]}
                    >
                        <Text
                            style={[
                                styles.messageText,
                                isUser ? styles.userText : styles.assistantText,
                                isSystem && styles.systemText,
                            ]}
                        >
                            {message.content}
                        </Text>
                    </View>
                </View>

                {/* Display data if available */}
                {message.data && (
                    <DataDisplay
                        data={message.data}
                        onActionPress={handleActionPress}
                    />
                )}

                {/* Display action buttons if available */}
                {message.actions && message.actions.length > 0 && (
                    <ActionButtons
                        actions={message.actions}
                        onActionPress={handleActionPress}
                    />
                )}
            </View>
        );
    };

    const handleActionPress = async (action: ChatAction) => {
        console.log("Action pressed:", action);

        const systemMessage: ChatMessage = {
            role: "system",
            content: `Executing: ${action.label}...`,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, systemMessage]);
        setIsLoading(true);

        try {
            let response;
            switch (action.action) {
                case "get_vehicle_data":
                    response = await enhancedChatbotService.sendMessage("show vehicles");
                    break;
                case "get_tree_data":
                    response = await enhancedChatbotService.sendMessage("show tree management");
                    break;
                default:
                    response = {
                        response: `Action "${action.label}" executed successfully.`,
                        success: true
                    };
            }

            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: response.response,
                timestamp: new Date(),
                data: response.data,
                actions: response.actions,
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Action execution failed:", error);

            const errorMessage: ChatMessage = {
                role: "assistant",
                content: `Failed to execute "${action.label}". Please try again.`,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <Animated.View
                style={[
                    styles.chatWindow,
                    {
                        transform: [{ scaleY: minimizeAnim }],
                    },
                ]}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Icon name="bot" size={20} color="#fff" />
                    <Text style={styles.headerTitle}>Environmental Assistant</Text>
                    <View style={styles.headerButtons}>
                        {isLoading && (
                            <ActivityIndicator
                                size="small"
                                color="#fff"
                                style={styles.loadingIndicator}
                            />
                        )}
                        <TouchableOpacity onPress={handleMinimize} style={styles.headerButton}>
                            <Icon
                                name={isMinimized ? "maximize-2" : "minimize-2"}
                                size={16}
                                color="#fff"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                            <Icon name="x" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {!isMinimized && (
                    <>
                        {/* Messages */}
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.messagesContainer}
                            contentContainerStyle={styles.messagesContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {messages.map(renderMessage)}
                        </ScrollView>

                        {/* Input */}
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            keyboardVerticalOffset={0}
                        >
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    value={inputText}
                                    onChangeText={setInputText}
                                    placeholder="Ask me about environmental data..."
                                    placeholderTextColor="#999"
                                    multiline
                                    maxLength={1000}
                                    editable={!isLoading}
                                    onSubmitEditing={handleSendMessage}
                                    blurOnSubmit={false}
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.sendButton,
                                        (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                                    ]}
                                    onPress={handleSendMessage}
                                    disabled={!inputText.trim() || isLoading}
                                >
                                    <Icon
                                        name="send"
                                        size={16}
                                        color={(!inputText.trim() || isLoading) ? "#ccc" : "#fff"}
                                    />
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </>
                )}
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 16,
        right: 16,
        zIndex: 1000,
        elevation: 1000,
    },
    chatWindow: {
        height: CHAT_HEIGHT,
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#2E7D32",
    },
    headerTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        marginLeft: 8,
    },
    headerButtons: {
        flexDirection: "row",
        alignItems: "center",
    },
    loadingIndicator: {
        marginRight: 8,
    },
    headerButton: {
        padding: 4,
        marginLeft: 8,
    },
    messagesContainer: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    messagesContent: {
        padding: 12,
        paddingBottom: 8,
    },
    messageWrapper: {
        marginBottom: 12,
    },
    messageContainer: {},
    userMessage: {
        alignItems: "flex-end",
    },
    assistantMessage: {
        alignItems: "flex-start",
    },
    systemMessage: {
        alignItems: "center",
    },
    messageBubble: {
        maxWidth: "80%",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
    },
    userBubble: {
        backgroundColor: "#2E7D32",
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        backgroundColor: "#fff",
        borderBottomLeftRadius: 4,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    systemBubble: {
        backgroundColor: "#e3f2fd",
        borderRadius: 16,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    userText: {
        color: "#fff",
    },
    assistantText: {
        color: "#333",
    },
    systemText: {
        color: "#1976d2",
        fontStyle: "italic",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        maxHeight: 80,
        fontSize: 14,
        backgroundColor: "#f9f9f9",
    },
    sendButton: {
        backgroundColor: "#2E7D32",
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    sendButtonDisabled: {
        backgroundColor: "#e0e0e0",
    },
});
