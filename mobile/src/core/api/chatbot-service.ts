import apiClient from "./api-client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface GeminiTextRequest {
  prompt: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface GeminiResponse {
  content: string;
  model_used: string;
  content_type: string;
  success: boolean;
  metadata?: any;
}

export interface ChatbotResponse {
  response: string;
  success: boolean;
  error?: string;
}

class ChatbotService {
  private readonly endpoint = "/gemini";

  /**
   * Send a message to the chatbot and get a response
   */
  async sendMessage(message: string): Promise<ChatbotResponse> {
    try {
      const request: GeminiTextRequest = {
        prompt: this.buildEnvironmentalPrompt(message),
        model: "gemini-2.0-flash-lite",
        max_tokens: 500,
        temperature: 0.7,
        stream: false,
      };

      const response = await apiClient.post<GeminiResponse>(
        `${this.endpoint}/text`,
        request
      );

      if (response.data.success) {
        return {
          response: response.data.content,
          success: true,
        };
      } else {
        return {
          response: "I'm sorry, I couldn't process your request right now.",
          success: false,
          error: "API returned unsuccessful response",
        };
      }
    } catch (error: any) {
      console.error("Chatbot service error:", error);

      let errorMessage =
        "I'm sorry, I'm having trouble connecting right now. Please try again later.";

      if (error.response?.status === 401) {
        errorMessage = "Please log in to use the chatbot feature.";
      } else if (error.response?.status === 429) {
        errorMessage =
          "I'm receiving too many requests. Please wait a moment and try again.";
      } else if (error.response?.data?.detail) {
        errorMessage = "I encountered an error while processing your request.";
      }

      return {
        response: errorMessage,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Build an environmental context prompt for better responses
   */
  private buildEnvironmentalPrompt(userMessage: string): string {
    return `You are an AI assistant specializing in environmental monitoring and management for the Eco Dashboard Navigator mobile app. 

Context: You're helping users with questions about:
- Air quality monitoring and data analysis
- Vehicle emissions testing and management
- Environmental compliance and regulations
- Tree management and urban greening
- Government emission monitoring systems
- Data interpretation and insights

User Question: ${userMessage}

Please provide a helpful, accurate, and concise response that focuses on environmental topics. If the question is not related to environmental matters, gently redirect the conversation back to environmental topics while still being helpful.

Keep your response conversational, informative, and under 300 words for mobile readability.`;
  }

  /**
   * Get suggested conversation starters
   */
  getSuggestedQuestions(): string[] {
    return [
      "How do I interpret air quality readings?",
      "What are normal emission levels for vehicles?",
      "How can I improve air quality in my area?",
      "What should I do if emission tests fail?",
      "How do trees help improve air quality?",
      "What are the health effects of poor air quality?",
    ];
  }

  /**
   * Validate message before sending
   */
  validateMessage(message: string): { isValid: boolean; error?: string } {
    if (!message || message.trim().length === 0) {
      return {
        isValid: false,
        error: "Please enter a message",
      };
    }

    if (message.length > 1000) {
      return {
        isValid: false,
        error: "Message is too long. Please keep it under 1000 characters.",
      };
    }

    return { isValid: true };
  }
}

export const chatbotService = new ChatbotService();
