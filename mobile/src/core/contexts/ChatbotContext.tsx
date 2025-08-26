import React, { createContext, useContext, useState, useCallback } from "react";
import { ChatMessage } from "../api/chatbot-service";

interface ChatbotContextType {
    chatVisible: boolean;
    showChatbot: () => void;
    hideChatbot: () => void;
    toggleChatbot: () => void;
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    clearChat: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

interface ChatbotProviderProps {
    children: React.ReactNode;
}

export function ChatbotProvider({ children }: ChatbotProviderProps) {
    const [chatVisible, setChatVisible] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "assistant",
            content: "Hi! I'm your environmental monitoring assistant. How can I help you today?",
            timestamp: new Date(),
        },
    ]);

    const showChatbot = useCallback(() => {
        setChatVisible(true);
    }, []);

    const hideChatbot = useCallback(() => {
        setChatVisible(false);
    }, []);

    const toggleChatbot = useCallback(() => {
        setChatVisible((prev) => !prev);
    }, []);

    const clearChat = useCallback(() => {
        setMessages([
            {
                role: "assistant",
                content: "Hi! I'm your environmental monitoring assistant. How can I help you today?",
                timestamp: new Date(),
            },
        ]);
    }, []);

    const value: ChatbotContextType = {
        chatVisible,
        showChatbot,
        hideChatbot,
        toggleChatbot,
        messages,
        setMessages,
        clearChat,
    };

    return (
        <ChatbotContext.Provider value={value}>
            {children}
        </ChatbotContext.Provider>
    );
}

export function useChatbot() {
    const context = useContext(ChatbotContext);
    if (context === undefined) {
        throw new Error("useChatbot must be used within a ChatbotProvider");
    }
    return context;
}
