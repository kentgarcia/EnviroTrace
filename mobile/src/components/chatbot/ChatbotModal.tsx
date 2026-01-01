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
    Dimensions,
    Animated,
    Easing,
    Vibration,
} from "react-native";
import { Portal, Dialog, useTheme, IconButton, Surface } from "react-native-paper";
import { enhancedChatbotService, ChatMessage, ChatAction } from "../../core/api/enhanced-chatbot-service";
import DataDisplay, { ActionButtons } from "./DataDisplay";
import Icon from "../icons/Icon";
import MarkdownText from "../MarkdownText";

interface ChatbotModalProps {
    visible: boolean;
    onDismiss: () => void;
}

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

export default function ChatbotModal({ visible, onDismiss }: ChatbotModalProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "assistant",
            content: "Hi! I'm your environmental monitoring assistant. I can help you with vehicle emissions and tree management. Ask me anything!",
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const { colors } = useTheme();

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const messageAnimations = useRef<{ [key: number]: Animated.Value }>({}).current;
    const typingAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    useEffect(() => {
        if (isTyping) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(typingAnimation, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(typingAnimation, {
                        toValue: 0,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            typingAnimation.stopAnimation();
            typingAnimation.setValue(0);
        }
    }, [isTyping]);

    const animateMessage = (index: number) => {
        if (!messageAnimations[index]) {
            messageAnimations[index] = new Animated.Value(0);
        }

        Animated.timing(messageAnimations[index], {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.back(1.2)),
            useNativeDriver: true,
        }).start();
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const sendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: "user",
            content: inputText.trim(),
            timestamp: new Date(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInputText("");
        setIsLoading(true);
        setIsTyping(true);

        // Animate the new user message
        animateMessage(newMessages.length - 1);
        scrollToBottom();

        // Add haptic feedback
        Vibration.vibrate(50);

        try {
            const response = await enhancedChatbotService.sendMessage(inputText.trim());

            setIsTyping(false);

            const botMessage: ChatMessage = {
                role: "assistant",
                content: response.response,
                timestamp: new Date(),
                actions: response.actions,
                data: response.data,
            };

            const finalMessages = [...newMessages, botMessage];
            setMessages(finalMessages);

            // Animate the new bot message
            animateMessage(finalMessages.length - 1);
            scrollToBottom();
        } catch (error) {
            setIsTyping(false);
            console.error("Chat error:", error);
            Alert.alert("Error", "Failed to send message. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const executeAction = async (action: ChatAction) => {
        try {
            const result = await enhancedChatbotService.executeAction(action);

            const actionMessage: ChatMessage = {
                role: "assistant",
                content: `Action "${action.label}" executed successfully!`,
                timestamp: new Date(),
                data: result,
            };

            const newMessages = [...messages, actionMessage];
            setMessages(newMessages);
            animateMessage(newMessages.length - 1);
            scrollToBottom();
        } catch (error) {
            console.error("Action execution error:", error);
            Alert.alert("Error", `Failed to execute action: ${action.label}`);
        }
    };

    const renderMessage = (message: ChatMessage, index: number) => {
        const isUser = message.role === "user";
        const isLast = index === messages.length - 1;

        if (!messageAnimations[index]) {
            messageAnimations[index] = new Animated.Value(0);
            animateMessage(index);
        }

        const animatedStyle = {
            opacity: messageAnimations[index],
            transform: [
                {
                    translateY: messageAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                    }),
                },
                {
                    scale: messageAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                    }),
                },
            ],
        };

        return (
            <Animated.View key={index} style={[animatedStyle]}>
                <View style={[
                    styles.messageContainer,
                    isUser ? styles.userMessageContainer : styles.botMessageContainer,
                    isLast && styles.lastMessage
                ]}>
                    {!isUser && (
                        <View style={styles.botAvatar}>
                            <Icon name="psychology" size={16} color="#FFFFFF" />
                        </View>
                    )}

                    <View style={[
                        styles.messageBubble,
                        isUser ? styles.userBubble : styles.botBubble,
                    ]}>
                        <MarkdownText
                            content={message.content}
                            style={[
                                styles.messageText,
                                isUser ? styles.userText : styles.botText,
                            ]}
                            linkStyle={{ color: isUser ? '#BBDEFB' : '#1E88E5' }}
                        />

                        <Text style={[
                            styles.timestamp,
                            isUser ? styles.userTimestamp : styles.botTimestamp,
                        ]}>
                            {message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Text>
                    </View>

                    {isUser && (
                        <View style={styles.userAvatar}>
                            <Icon name="person" size={16} color="#FFFFFF" />
                        </View>
                    )}
                </View>

                {/* Actions */}
                {message.actions && message.actions.length > 0 && (
                    <View style={styles.actionsContainer}>
                        <ActionButtons
                            actions={message.actions}
                            onActionPress={executeAction}
                        />
                    </View>
                )}

                {/* Data Display */}
                {message.data && (
                    <View style={styles.dataContainer}>
                        <DataDisplay data={message.data} />
                    </View>
                )}
            </Animated.View>
        );
    };

    const renderTypingIndicator = () => {
        if (!isTyping) return null;

        const dotOpacity1 = typingAnimation.interpolate({
            inputRange: [0, 0.33, 0.66, 1],
            outputRange: [0.3, 1, 0.3, 0.3],
        });

        const dotOpacity2 = typingAnimation.interpolate({
            inputRange: [0, 0.33, 0.66, 1],
            outputRange: [0.3, 0.3, 1, 0.3],
        });

        const dotOpacity3 = typingAnimation.interpolate({
            inputRange: [0, 0.33, 0.66, 1],
            outputRange: [0.3, 0.3, 0.3, 1],
        });

        return (
            <View style={styles.typingContainer}>
                <View style={styles.botAvatar}>
                    <Icon name="psychology" size={16} color="#FFFFFF" />
                </View>
                <View style={styles.typingBubble}>
                    <View style={styles.typingDots}>
                        <Animated.View style={[styles.typingDot, { opacity: dotOpacity1 }]} />
                        <Animated.View style={[styles.typingDot, { opacity: dotOpacity2 }]} />
                        <Animated.View style={[styles.typingDot, { opacity: dotOpacity3 }]} />
                    </View>
                </View>
            </View>
        );
    };

    return (
        <Portal>
            <Dialog
                visible={visible}
                onDismiss={onDismiss}
                style={styles.dialogContainer}
                dismissable={true}
            >
                <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
                    <Surface style={styles.chatContainer} elevation={5}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <View style={styles.headerAvatar}>
                                    <Icon name="psychology" size={24} color="#FFFFFF" />
                                </View>
                                <View>
                                    <Text style={styles.headerTitle}>Environmental Assistant</Text>
                                    <Text style={styles.headerSubtitle}>
                                        {isTyping ? "Typing..." : "Online"}
                                    </Text>
                                </View>
                            </View>

                            <IconButton
                                icon="close"
                                size={24}
                                iconColor="#666666"
                                onPress={onDismiss}
                                style={styles.closeButton}
                            />
                        </View>

                        {/* Messages */}
                        <KeyboardAvoidingView
                            style={styles.messagesContainer}
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                        >
                            <ScrollView
                                ref={scrollViewRef}
                                style={styles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                                onContentSizeChange={scrollToBottom}
                            >
                                {messages.map((message, index) => renderMessage(message, index))}
                                {renderTypingIndicator()}
                            </ScrollView>

                            {/* Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={inputText}
                                        onChangeText={setInputText}
                                        placeholder="Ask about environmental data..."
                                        placeholderTextColor="#999999"
                                        multiline
                                        maxLength={1000}
                                        editable={!isLoading}
                                        onSubmitEditing={sendMessage}
                                        blurOnSubmit={false}
                                    />

                                    <TouchableOpacity
                                        style={[
                                            styles.sendButton,
                                            (!inputText.trim() || isLoading) && styles.sendButtonDisabled
                                        ]}
                                        onPress={sendMessage}
                                        disabled={!inputText.trim() || isLoading}
                                        activeOpacity={0.7}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                        ) : (
                                            <Icon name="send" size={20} color="#FFFFFF" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </Surface>
                </Animated.View>
            </Dialog>
        </Portal>
    );
}

const styles = StyleSheet.create({
    dialogContainer: {
        backgroundColor: 'transparent',
        margin: 0,
        padding: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        width: screenWidth * 0.95,
        height: screenHeight * 0.8,
        backgroundColor: 'transparent',
    },
    chatContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#F8F9FA',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#003595',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    closeButton: {
        margin: 0,
    },
    messagesContainer: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 16,
    },
    messageContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginVertical: 4,
        alignItems: 'flex-end',
    },
    userMessageContainer: {
        justifyContent: 'flex-end',
    },
    botMessageContainer: {
        justifyContent: 'flex-start',
    },
    lastMessage: {
        marginBottom: 8,
    },
    botAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#003595',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    messageBubble: {
        maxWidth: screenWidth * 0.7,
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    userBubble: {
        backgroundColor: '#003595',
        borderBottomRightRadius: 4,
    },
    botBubble: {
        backgroundColor: '#F3F4F6',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 4,
    },
    userText: {
        color: '#FFFFFF',
    },
    botText: {
        color: '#1F2937',
    },
    timestamp: {
        fontSize: 12,
        opacity: 0.7,
    },
    userTimestamp: {
        color: '#FFFFFF',
        textAlign: 'right',
    },
    botTimestamp: {
        color: '#6B7280',
    },
    typingContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginVertical: 4,
        alignItems: 'flex-end',
    },
    typingBubble: {
        backgroundColor: '#F3F4F6',
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginLeft: 8,
    },
    typingDots: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#6B7280',
        marginHorizontal: 1,
    },
    actionsContainer: {
        marginHorizontal: 56,
        marginTop: 8,
        marginBottom: 4,
    },
    dataContainer: {
        marginHorizontal: 56,
        marginTop: 8,
        marginBottom: 4,
    },
    inputContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        paddingVertical: 8,
        minHeight: 48,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        lineHeight: 22,
        color: '#1F2937',
        maxHeight: 100,
        paddingVertical: 8,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#003595',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    sendButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
});
