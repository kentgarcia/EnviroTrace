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
    Image,
    Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { enhancedChatbotService, ChatMessage, ChatAction } from "../../core/api/enhanced-chatbot-service";
import { vehicleService } from "../../core/api/vehicle-service";
import { treeManagementService } from "../../core/api/tree-management-service";
import DataDisplay, { ActionButtons } from "../../components/chatbot/DataDisplay";
import Icon from "../../components/icons/Icon";
import MarkdownText from "../../components/MarkdownText";
import { useNavigation } from "@react-navigation/native";
import ScreenLayout from "../../components/layout/ScreenLayout";

interface CommandOption {
    id: string;
    label: string;
    icon: string;
    description?: string;
    action: () => Promise<void>;
}

export default function AIAssistantScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
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

    const executeGeminiCommand = async (query: string) => {
        try {
            const response = await enhancedChatbotService.sendMessage(query);
            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: response.response,
                timestamp: new Date(),
                actions: response.actions,
                data: response.data,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error: any) {
            throw new Error(`Failed to process request: ${error.message}`);
        }
    };

    const executeVehiclesCommand = async () => {
        try {
            const vehicles = await vehicleService.getRecentVehicles({ limit: 10 });
            const stats = await vehicleService.getVehicleStats();

            const message: ChatMessage = {
                role: "assistant",
                content: `**Government Vehicle Records**\n\n📊 **Statistics:**\n- Total Vehicles: ${stats.total_vehicles}\n- Total Offices: ${stats.total_offices}\n- Total Tests: ${stats.total_tests}\n- Pass Rate: ${stats.pass_rate.toFixed(1)}%`,
                timestamp: new Date(),
                data: {
                    type: "table",
                    title: "Recent Vehicles",
                    data: vehicles.slice(0, 5),
                    metadata: {
                        totalRecords: stats.total_vehicles,
                        source: "Government Vehicles",
                    },
                },
            };
            setMessages((prev) => [...prev, message]);
        } catch (error: any) {
            throw new Error(`Failed to fetch vehicle data: ${error.message}`);
        }
    };

    const executeTreesCommand = async () => {
        try {
            const requests = await treeManagementService.getRecentRequests({ limit: 10 });
            const stats = await treeManagementService.getTreeStats();

            const message: ChatMessage = {
                role: "assistant",
                content: `**Tree Management Overview**\n\n🌳 **Statistics:**\n- Total Requests: ${stats.total_requests}\n- Filed: ${stats.filed}\n- On Hold: ${stats.on_hold}\n- Pruning: ${stats.by_type.pruning}\n- Cutting: ${stats.by_type.cutting}`,
                timestamp: new Date(),
                data: {
                    type: "table",
                    title: "Recent Tree Management Requests",
                    data: requests.slice(0, 5),
                    metadata: {
                        totalRecords: stats.total_requests,
                        source: "Tree Management",
                    },
                },
            };
            setMessages((prev) => [...prev, message]);
        } catch (error: any) {
            throw new Error(`Failed to fetch tree management data: ${error.message}`);
        }
    };

    // Air Quality commands removed per client request

    // Air Quality violations command removed

    // Air Quality fee command removed

    const executeStatsCommand = async () => {
        try {
            const vehicleStats = await vehicleService.getVehicleStats();
            const treeStats = await treeManagementService.getTreeStats();

            const message: ChatMessage = {
                role: "assistant",
                content: `**System Statistics Overview**\n\n📊 **Government Vehicles:**\n- Total Vehicles: ${vehicleStats.total_vehicles}\n- Total Tests: ${vehicleStats.total_tests}\n- Pass Rate: ${vehicleStats.pass_rate.toFixed(1)}%\n\n🌳 **Tree Management:**\n- Total Requests: ${treeStats.total_requests}\n- Filed: ${treeStats.filed}\n- On Hold: ${treeStats.on_hold}\n\nAll systems operational and collecting data.`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, message]);
        } catch (error: any) {
            throw new Error(`Failed to fetch statistics: ${error.message}`);
        }
    };

    const commandOptions: CommandOption[] = [
        {
            id: "vehicles",
            label: "Vehicle Records",
            icon: "Car",
            description: "View government vehicles",
            action: executeVehiclesCommand,
        },
        {
            id: "trees",
            label: "Tree Management",
            icon: "TreePalm",
            description: "View tree management requests",
            action: executeTreesCommand,
        },
        // Air Quality-related actions removed per client request
        {
            id: "stats",
            label: "System Statistics",
            icon: "BarChart3",
            description: "View overall statistics",
            action: executeStatsCommand,
        },
        {
            id: "report",
            label: "Generate Report",
            icon: "FileText",
            description: "Create environmental report",
            action: () => executeGeminiCommand("generate environmental report"),
        },
    ];

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

    const handleCommandSelect = async (command: CommandOption) => {
        setShowCommandMenu(false);
        setIsLoading(true);

        // Add a user message indicating which command was selected
        const userMessage: ChatMessage = {
            role: "user",
            content: command.label,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        try {
            await command.action();
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

    const toggleCommandMenu = () => {
        setShowCommandMenu(!showCommandMenu);
    };

    return (
        <>
            <ScreenLayout>
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
                                <TouchableOpacity
                                    style={styles.commandButton}
                                    onPress={toggleCommandMenu}
                                    disabled={isLoading}
                                    activeOpacity={0.7}
                                >
                                    <Icon
                                        name="Slash"
                                        size={22}
                                        color={isLoading ? "rgba(255, 255, 255, 0.3)" : "#FFFFFF"}
                                    />
                                </TouchableOpacity>
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
            </ScreenLayout>

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
        </>
    );
}

const styles = StyleSheet.create({
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
        alignItems: "center",
        gap: 8,
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    commandButton: {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "rgba(59, 130, 246, 0.3)",
        flexShrink: 0,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: "#111827",
        minHeight: 40,
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
