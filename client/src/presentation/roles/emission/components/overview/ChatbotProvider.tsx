import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type JSX,
} from "react";

interface ChatbotContextType {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  chatMinimized: boolean;
  setChatMinimized: (min: boolean) => void;
  chatHistory: { role: string; content: string | JSX.Element }[];
  setChatHistory: (
    h: { role: string; content: string | JSX.Element }[]
  ) => void;
  handleOpenChat: () => void;
  handleMinimizeChat: () => void;
  handleCloseChat: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const ChatbotProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { role: string; content: string | JSX.Element }[]
  >(() => {
    try {
      const saved = localStorage.getItem("gov-emission-chat-history");
      if (saved) {
        return JSON.parse(saved).map((msg: any) =>
          typeof msg.content === "string"
            ? msg
            : { ...msg, content: String(msg.content) }
        );
      }
    } catch {}
    return [{ role: "assistant", content: "How can I help you?" }];
  });

  useEffect(() => {
    localStorage.setItem(
      "gov-emission-chat-history",
      JSON.stringify(
        chatHistory.map((msg) =>
          typeof msg.content === "string"
            ? msg
            : { ...msg, content: String(msg.content) }
        )
      )
    );
  }, [chatHistory]);

  const handleOpenChat = () => {
    setChatOpen(true);
    setChatMinimized(false);
  };
  const handleMinimizeChat = () => {
    setChatMinimized(true);
    setChatOpen(false);
  };
  const handleCloseChat = () => {
    setChatOpen(false);
    setChatMinimized(false);
    setChatHistory([{ role: "assistant", content: "How can I help you?" }]);
    localStorage.removeItem("gov-emission-chat-history");
  };

  return (
    <ChatbotContext.Provider
      value={{
        chatOpen,
        setChatOpen,
        chatMinimized,
        setChatMinimized,
        chatHistory,
        setChatHistory,
        handleOpenChat,
        handleMinimizeChat,
        handleCloseChat,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};

export function useChatbot() {
  const ctx = useContext(ChatbotContext);
  if (!ctx) throw new Error("useChatbot must be used within a ChatbotProvider");
  return ctx;
}
