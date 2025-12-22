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
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { enhancedChatbotService, ChatMessage, ChatAction } from "../../core/api/enhanced-chatbot-service";
import DataDisplay, { ActionButtons } from "../../components/chatbot/DataDisplay";
import Icon from "../../components/icons/Icon";

interface CommandOption {
    id: string;
    label: string;
    command: string;
    icon: string;
    description?: string;
}

export default function ChatbotScreen() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "assistant",
            content: "Hi! I'm your environmental monitoring assistant. I can help you access and control your environmental data. Try asking me about vehicles or tree management!",
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showCommandMenu, setShowCommandMenu] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const commandOptions: CommandOption[] = [
        {
            id: "vehicles",
            label: "Vehicle Data",
            command: "show vehicles",
            icon: "Car",
            description: "View registered vehicles",
        },
        {
            id: "trees",
            label: "Tree Management",
            command: "show tree management",
            icon: "TreePalm",
            description: "View tree inventory and health",
        },
        // Removed Air Quality-related commands per client request
    ];

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

    const handleCommandSelect = (command: CommandOption) => {
        setInputText(command.command);
        setShowCommandMenu(false);
    };

    const toggleCommandMenu = () => {
        setShowCommandMenu(!showCommandMenu);
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
                        <TouchableOpacity
                            style={styles.commandButton}
                            onPress={toggleCommandMenu}
                            disabled={isLoading}
                            activeOpacity={0.7}
                        >
                            <Icon
                                name="Slash"
                                size={22}
                                color={isLoading ? "#ccc" : "#3A5A7A"}
                            />
                        </TouchableOpacity>
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
                                name="Send"
                                size={20}
                                color={(!inputText.trim() || isLoading) ? "#ccc" : "#fff"}
                            />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>

                {/* Command Menu Modal */}
                <Modal
                    visible={showCommandMenu}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowCommandMenu(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowCommandMenu(false)}
                    >
                        <View style={styles.commandMenuContainer}>
                            <View style={styles.commandMenuHeader}>
                                <Icon name="Slash" size={20} color="#3A5A7A" />
                                <Text style={styles.commandMenuTitle}>Quick Commands</Text>
                                <TouchableOpacity onPress={() => setShowCommandMenu(false)}>
                                    <Icon name="X" size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView
                                style={styles.commandMenuScroll}
                                showsVerticalScrollIndicator={false}
                            >
                                {commandOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={styles.commandOption}
                                        onPress={() => handleCommandSelect(option)}
                                    >
                                        <View style={styles.commandOptionIcon}>
                                            <Icon name={option.icon} size={20} color="#3A5A7A" />
                                        </View>
                                        <View style={styles.commandOptionContent}>
                                            <Text style={styles.commandOptionLabel}>
                                                {option.label}
                                            </Text>
                                            {option.description && (
                                                <Text style={styles.commandOptionDescription}>
                                                    {option.description}
                                                </Text>
                                            )}
                                        </View>
                                        <Icon name="ChevronRight" size={16} color="#9CA3AF" />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>
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
    },
    suggestionText: {
        fontSize: 14,
        color: "#3A5A7A",
        fontWeight: "500",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        gap: 8,
    },
    commandButton: {
        backgroundColor: "#F0F9FF",
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#3A5A7A",
        flexShrink: 0,
    },
    textInput: {
        flex: 1,
        minHeight: 44,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        maxHeight: 100,
        fontSize: 15,
        color: "#111827",
        backgroundColor: "#FFFFFF",
    },
    sendButton: {
        backgroundColor: "#3A5A7A",
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    sendButtonDisabled: {
        backgroundColor: "#CBD5E1",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    commandMenuContainer: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "70%",
        paddingBottom: Platform.OS === "ios" ? 34 : 16,
    },
    commandMenuHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        gap: 12,
    },
    commandMenuTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    commandMenuScroll: {
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    commandOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: 12,
        gap: 12,
    },
    commandOptionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F0F9FF",
        alignItems: "center",
        justifyContent: "center",
    },
    commandOptionContent: {
        flex: 1,
    },
    commandOptionLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 4,
    },
    commandOptionDescription: {
        fontSize: 13,
        color: "#6B7280",
    },
});
