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
    Alert,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { enhancedChatbotService, ChatMessage, ChatAction } from "../../core/api/enhanced-chatbot-service";
import DataDisplay, { ActionButtons } from "../../components/chatbot/DataDisplay";
import Icon from "../../components/icons/Icon";

export default function ChatbotScreen() {
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

    const suggestedQuestions = enhancedChatbotService.getSuggestedQuestions();

    useEffect(() => {
        // Auto-scroll to bottom when new messages are added
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const validation = enhancedChatbotService.validateMessage(inputText);
        if (!validation.isValid) {
            Alert.alert("Invalid Message", validation.error);
            return;
        }

        const userMessage: ChatMessage = {
            role: "user",
            content: inputText.trim(),
            timestamp: new Date(),
        };

        // Add user message immediately
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

            if (!response.success) {
                console.warn("Chatbot response was not successful:", response.error);
            }
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

    const handleActionPress = async (action: ChatAction) => {
        // Handle action button presses
        console.log("Action pressed:", action);

        // Add a system message showing the action
        const systemMessage: ChatMessage = {
            role: "system",
            content: `Executing: ${action.label}...`,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, systemMessage]);
        setIsLoading(true);

        try {
            // Execute the action based on its type
            let response;
            switch (action.action) {
                case "get_air_quality_data":
                    response = await enhancedChatbotService.sendMessage("show air quality data");
                    break;
                case "get_vehicle_data":
                    response = await enhancedChatbotService.sendMessage("show vehicles");
                    break;
                case "get_tree_data":
                    response = await enhancedChatbotService.sendMessage("show tree management");
                    break;
                case "analyze_air_quality_trends":
                    response = await enhancedChatbotService.sendMessage("analyze air quality trends");
                    break;
                case "get_air_quality_violations":
                    response = await enhancedChatbotService.sendMessage("show air quality violations");
                    break;
                case "generate_air_quality_report":
                    response = {
                        response: "Air quality report generation initiated. You'll receive the report via email shortly.",
                        success: true
                    };
                    break;
                case "schedule_emission_test":
                    response = {
                        response: "Opening emission test scheduling form...",
                        success: true
                    };
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

    const handleSuggestedQuestion = (question: string) => {
        setInputText(question);
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
                        <Text
                            style={[
                                styles.timestamp,
                                isUser ? styles.userTimestamp : styles.assistantTimestamp,
                                isSystem && styles.systemTimestamp,
                            ]}
                        >
                            {message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
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

    const renderSuggestedQuestions = () => {
        if (messages.length > 1) return null; // Only show on first load

        return (
            <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Suggested questions:</Text>
                {suggestedQuestions.map((question, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.suggestionButton}
                        onPress={() => handleSuggestedQuestion(question)}
                    >
                        <Text style={styles.suggestionText}>{question}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.root}>
            <StatusBar style="dark" />
            <View style={styles.backgroundImageWrapper}>
                <Image
                    source={require("../../../assets/images/bg_login.png")}
                    style={styles.backgroundImage}
                />
            </View>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerCenter}>
                        <Image
                            source={require("../../../assets/images/logo_app.png")}
                            style={styles.headerLogo}
                            resizeMode="contain"
                        />
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>Environmental Assistant</Text>
                            <View style={styles.headerStatus}>
                                {isLoading && <ActivityIndicator size="small" color="#3A5A7A" />}
                                {!isLoading && (
                                    <>
                                        <View style={styles.headerStatusDot} />
                                        <Text style={styles.headerStatusText}>Ready</Text>
                                    </>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                <KeyboardAvoidingView
                    style={styles.chatContainer}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                >
                    {/* Messages */}
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.messagesContainer}
                        contentContainerStyle={styles.messagesContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {messages.map(renderMessage)}
                        {renderSuggestedQuestions()}
                    </ScrollView>

                    {/* Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Ask me about environmental monitoring..."
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
                                size={20}
                                color={(!inputText.trim() || isLoading) ? "#ccc" : "#fff"}
                            />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
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
    chatContainer: {
        flex: 1,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        paddingBottom: 8,
    },
    messageWrapper: {
        marginBottom: 16,
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 18,
    },
    userBubble: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderBottomRightRadius: 4,
        borderWidth: 1,
        borderColor: "#E5E7EB",
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
    systemBubble: {
        backgroundColor: "rgba(226, 232, 240, 0.5)",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: "#0F172A",
    },
    assistantText: {
        color: "#0F172A",
    },
    systemText: {
        color: "#64748B",
        fontStyle: "italic",
    },
    timestamp: {
        fontSize: 11,
        marginTop: 4,
    },
    userTimestamp: {
        color: "#94A3B8",
        textAlign: "right",
    },
    assistantTimestamp: {
        color: "#94A3B8",
    },
    systemTimestamp: {
        color: "#94A3B8",
        textAlign: "center",
    },
    suggestionsContainer: {
        marginTop: 8,
    },
    suggestionsTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#64748B",
        marginBottom: 12,
    },
    suggestionButton: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    suggestionText: {
        fontSize: 14,
        color: "#3A5A7A",
        fontWeight: "500",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 12,
        maxHeight: 100,
        fontSize: 15,
        color: "#111827",
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    sendButton: {
        backgroundColor: "#3A5A7A",
        width: 44,
        height: 44,
        borderRadius: 22,
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
