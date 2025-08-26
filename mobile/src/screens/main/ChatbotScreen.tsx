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
        <SafeAreaView style={styles.container}>
            <StatusBar style="auto" />

            {/* Header */}
            <View style={styles.header}>
                <Icon name="bot" size={24} color="#2E7D32" />
                <Text style={styles.headerTitle}>Environmental Assistant</Text>
                <View style={styles.headerRight}>
                    {isLoading && <ActivityIndicator size="small" color="#2E7D32" />}
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginLeft: 12,
    },
    headerRight: {
        width: 24,
        alignItems: "center",
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
        borderRadius: 18,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
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
    timestamp: {
        fontSize: 12,
        marginTop: 4,
    },
    userTimestamp: {
        color: "rgba(255, 255, 255, 0.7)",
        textAlign: "right",
    },
    assistantTimestamp: {
        color: "#999",
    },
    systemTimestamp: {
        color: "#1976d2",
        textAlign: "center",
    },
    suggestionsContainer: {
        marginTop: 8,
    },
    suggestionsTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
        marginBottom: 12,
    },
    suggestionButton: {
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    suggestionText: {
        fontSize: 14,
        color: "#2E7D32",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 12,
        maxHeight: 100,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
    },
    sendButton: {
        backgroundColor: "#2E7D32",
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    sendButtonDisabled: {
        backgroundColor: "#e0e0e0",
    },
});
