import apiClient from "./api-client";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  data?: any; // For structured data responses
  actions?: ChatAction[]; // For interactive actions
}

export interface ChatAction {
  id: string;
  label: string;
  type: "button" | "confirmation" | "input";
  action: string;
  parameters?: any;
}

export interface DataQueryResult {
  type: "table" | "chart" | "summary" | "alert";
  title: string;
  data: any;
  metadata?: {
    totalRecords?: number;
    dateRange?: string;
    source?: string;
  };
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
  data?: DataQueryResult;
  actions?: ChatAction[];
}

class EnhancedChatbotService {
  private readonly endpoint = "/gemini";

  /**
   * Send a message to the chatbot and get a response
   */
  async sendMessage(message: string): Promise<ChatbotResponse> {
    try {
      // Check if this is a data query or control command
      const commandResult = await this.parseAndExecuteCommand(message);
      if (commandResult) {
        return commandResult;
      }

      // Otherwise, send to Gemini with enhanced context
      const request: GeminiTextRequest = {
        prompt: await this.buildEnhancedEnvironmentalPrompt(message),
        model: "gemini-2.0-flash-lite",
        max_tokens: 500,
        temperature: 0.7,
        stream: false,
      };

      const response = await apiClient.post<GeminiResponse>(
        `${this.endpoint}/text`,
        request
      );

      console.log("Gemini API response:", response.data);

      if (response.data.success && response.data.content) {
        return {
          response: response.data.content,
          success: true,
        };
      } else {
        console.warn(
          "Gemini API response missing content or success=false:",
          response.data
        );
        return {
          response: "I'm sorry, I couldn't process your request right now.",
          success: false,
          error: "API returned unsuccessful response",
        };
      }
    } catch (error: any) {
      console.error("Chatbot service error:", error);
      return this.handleError(error);
    }
  }

  /**
   * Execute a chatbot action
   */
  async executeAction(action: ChatAction): Promise<any> {
    try {
      switch (action.action) {
        case "get_vehicle_data":
          return await this.getVehicleData(
            action.parameters?.query || "vehicle data"
          );
        case "get_tree_data":
          return await this.getTreeManagementData(
            action.parameters?.query || "tree management data"
          );
        case "get_dashboard_data":
          return await this.getDashboardData(
            action.parameters?.query || "dashboard data"
          );
        default:
          console.warn(`Unknown action: ${action.action}`);
          return {
            response: `Action "${action.label}" is not yet implemented.`,
            success: false,
          };
      }
    } catch (error: any) {
      console.error("Error executing action:", error);
      return {
        response: `Failed to execute action: ${action.label}`,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Parse user message and execute data/control commands
   */
  private async parseAndExecuteCommand(
    message: string
  ): Promise<ChatbotResponse | null> {
    const lowerMessage = message.toLowerCase();

    // Vehicle/Emission Commands
    if (
      this.matchesPattern(
        lowerMessage,
        ["show", "get", "find"],
        ["vehicle", "emission", "test", "car"]
      )
    ) {
      return await this.getVehicleData(message);
    }

    // Tree Management Commands
    if (
      this.matchesPattern(
        lowerMessage,
        ["show", "get", "list"],
        ["tree", "planting", "green", "urban"]
      )
    ) {
      return await this.getTreeManagementData(message);
    }

    // Dashboard/Overview Commands
    if (
      this.matchesPattern(lowerMessage, [
        "dashboard",
        "overview",
        "summary",
        "stats",
      ])
    ) {
      return await this.getDashboardData(message);
    }

    // Control Commands
    if (
      this.matchesPattern(
        lowerMessage,
        ["create", "add", "schedule", "update", "delete"],
        ["test", "record", "violation"]
      )
    ) {
      return await this.handleControlCommand(message);
    }

    // Search Commands
    if (
      this.matchesPattern(
        lowerMessage,
        ["search", "find"],
        ["plate", "driver", "vehicle", "record"]
      )
    ) {
      return await this.handleSearchCommand(message);
    }

    return null; // Not a recognized command
  }

  /**
   * Get vehicle/emission data
   */
  private async getVehicleData(message: string): Promise<ChatbotResponse> {
    try {
      const lowerMessage = message.toLowerCase();

      // Extract plate number if mentioned
      const plateMatch = message.match(/([A-Z0-9-]{6,10})/i);

      if (plateMatch) {
        const plateNumber = plateMatch[1];
        try {
          const response = await apiClient.get(
            `/emission/vehicles/search/plate/${plateNumber}`
          );
          const vehicle = response.data;

          return {
            response: `Found vehicle with plate number ${plateNumber}:`,
            success: true,
            data: {
              type: "summary",
              title: `Vehicle Details - ${plateNumber}`,
              data: vehicle,
              metadata: {
                source: "Vehicle Registry",
              },
            },
            actions: [
              {
                id: "view_test_history",
                label: "View Test History",
                type: "button",
                action: "get_vehicle_tests",
                parameters: { vehicleId: vehicle.id },
              },
              {
                id: "schedule_test",
                label: "Schedule New Test",
                type: "button",
                action: "schedule_emission_test",
                parameters: { vehicleId: vehicle.id },
              },
            ],
          };
        } catch (error) {
          return {
            response: `No vehicle found with plate number ${plateNumber}.`,
            success: false,
            error: "Vehicle not found",
          };
        }
      }

      if (lowerMessage.includes("test") || lowerMessage.includes("emission")) {
        const response = await apiClient.get("/emission/tests");
        const tests = response.data.tests || response.data;

        return {
          response: `Here are the recent emission tests. ${tests.length} total tests found.`,
          success: true,
          data: {
            type: "table",
            title: "Emission Tests",
            data: tests.slice(0, 10),
            metadata: {
              totalRecords: tests.length,
              source: "Emission Testing System",
            },
          },
        };
      }

      // Default: Get vehicles
      const response = await apiClient.get("/emission/vehicles");
      const vehicles = response.data.vehicles || response.data;

      return {
        response: `Here are the registered vehicles. ${vehicles.length} total vehicles found.`,
        success: true,
        data: {
          type: "table",
          title: "Registered Vehicles",
          data: vehicles.slice(0, 10),
          metadata: {
            totalRecords: vehicles.length,
            source: "Vehicle Registry",
          },
        },
      };
    } catch (error: any) {
      return {
        response:
          "I couldn't retrieve vehicle data at the moment. Please try again later.",
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get tree management data
   */
  private async getTreeManagementData(
    message: string
  ): Promise<ChatbotResponse> {
    try {
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes("pending")) {
        const response = await apiClient.get("/tree-management/pending/all");
        const requests = response.data;

        return {
          response: `Found ${requests.length} pending tree management requests:`,
          success: true,
          data: {
            type: "table",
            title: "Pending Tree Management Requests",
            data: requests,
            metadata: {
              totalRecords: requests.length,
              source: "Tree Management System",
            },
          },
        };
      }

      if (lowerMessage.includes("planting")) {
        const response = await apiClient.get("/planting");
        const plantings = response.data;

        return {
          response: `Here are the recent planting records:`,
          success: true,
          data: {
            type: "table",
            title: "Planting Records",
            data: plantings.slice(0, 10),
            metadata: {
              totalRecords: plantings.length,
              source: "Planting Management System",
            },
          },
        };
      }

      // Default: Get all tree management requests
      const response = await apiClient.get("/tree-management");
      const requests = response.data;

      return {
        response: `Here are the tree management requests. ${requests.length} total requests found.`,
        success: true,
        data: {
          type: "table",
          title: "Tree Management Requests",
          data: requests.slice(0, 10),
          metadata: {
            totalRecords: requests.length,
            source: "Tree Management System",
          },
        },
      };
    } catch (error: any) {
      return {
        response:
          "I couldn't retrieve tree management data at the moment. Please try again later.",
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get dashboard overview data
   */
  private async getDashboardData(message: string): Promise<ChatbotResponse> {
    try {
      const response = await apiClient.get("/dashboard/urban-greening");
      const dashboardData = response.data;

      return {
        response: "Here's your environmental monitoring dashboard overview:",
        success: true,
        data: {
          type: "summary",
          title: "Environmental Dashboard Overview",
          data: dashboardData,
          metadata: {
            source: "Dashboard API",
          },
        },
        actions: [
          {
            id: "detailed_emissions",
            label: "View Emission Details",
            type: "button",
            action: "get_vehicle_data",
          },
          {
            id: "detailed_trees",
            label: "View Tree Management",
            type: "button",
            action: "get_tree_data",
          },
        ],
      };
    } catch (error: any) {
      return {
        response:
          "I couldn't retrieve dashboard data at the moment. Please try again later.",
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle control commands (create, update, delete, schedule)
   */
  private async handleControlCommand(
    message: string
  ): Promise<ChatbotResponse> {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("schedule") && lowerMessage.includes("test")) {
      return {
        response:
          "I can help you schedule an emission test. Please provide the vehicle details:",
        success: true,
        actions: [
          {
            id: "schedule_form",
            label: "Open Scheduling Form",
            type: "input",
            action: "show_schedule_form",
          },
        ],
      };
    }

    return {
      response:
        "I can help you with various control operations. Please specify what you'd like to create, update, or schedule.",
      success: true,
      actions: [
        {
          id: "schedule_test",
          label: "Schedule Emission Test",
          type: "button",
          action: "schedule_emission_test",
        },
        {
          id: "create_violation",
          label: "Create Violation",
          type: "button",
          action: "create_violation_form",
        },
        {
          id: "update_record",
          label: "Update Record",
          type: "button",
          action: "update_record_form",
        },
      ],
    };
  }

  /**
   * Handle search commands
   */
  private async handleSearchCommand(message: string): Promise<ChatbotResponse> {
    const lowerMessage = message.toLowerCase();

    // Extract search terms
    const words = message.split(" ");
    const searchTerm = words[words.length - 1]; // Get the last word as search term

    try {
      return {
        response: `I can search for vehicles or records. Please specify what you'd like to search for.`,
        success: true,
      };
    } catch (error: any) {
      return {
        response: `Search failed. Please try again with a different search term.`,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Build enhanced environmental prompt with system context
   */
  private async buildEnhancedEnvironmentalPrompt(
    userMessage: string
  ): Promise<string> {
    // Get some basic system stats for context
    let systemContext = "";
    try {
      const dashboardResponse = await apiClient.get(
        "/dashboard/urban-greening"
      );
      const dashboardData = dashboardResponse.data;
      systemContext = `
Current System Status:
- Total active monitoring points: ${
        dashboardData.totalMonitoringPoints || "N/A"
      }
- Recent alerts: ${dashboardData.recentAlerts || "N/A"}
- System operational status: Active
`;
    } catch {
      systemContext = "System status: Operational";
    }

    return `You are an AI assistant for the Eco Dashboard Navigator, an environmental monitoring system for the Environmental Protection and Natural Resources Office (EPNRO).

${systemContext}

The system has THREE main modules:

**1. GOVERNMENT EMISSION CONTROL**
- Vehicle Registry: Track government vehicles and their emission test records
- Emission Testing: Record and manage emission test results (Passed/Failed)
- Test Scheduling: Schedule and track emission testing appointments
- Vehicle Search: Search by plate number, driver name, or office
- Statistics: Monitor pass rates, total tests, and compliance trends
- Commands: "show vehicles", "find vehicle [plate]", "emission tests", "vehicle stats"

**2. TREE MANAGEMENT**
- Request Management: Track tree pruning, cutting, and violation complaints
- Request Status: Filed, On Hold, For Signature, Payment Pending
- Inspector Assignment: Assign and track inspector workload
- Tree Records: Document tree species, quantities, and locations
- Permit Processing: Manage permits and fees
- Statistics: Monitor requests by type, status, and timeline
- Commands: "show tree requests", "tree management", "pruning requests", "tree stats"

**AVAILABLE COMMANDS:**
Core Data Access:
- "show vehicles" or "vehicle records" - Government vehicle registry
- "show tree management" or "tree requests" - Tree management requests
- "system statistics" or "stats" - Overall system overview

Search & Query:
- "find vehicle [plate_number]" - Search specific vehicle
- "find request [id]" - Search tree management request

Analysis & Reports:
- "generate report" - Create environmental summary
- "analyze trends" - Data trend analysis
- "dashboard overview" - System-wide summary

**YOUR CAPABILITIES:**
✅ Access real-time data from all three modules
✅ Search and filter records by various criteria
✅ Provide statistics and analytics
✅ Explain environmental regulations and compliance
✅ Guide users through system features
✅ Generate reports and insights

❌ Cannot create or modify records directly (guide users to proper screens)
❌ Cannot access user passwords or sensitive authentication data
❌ Cannot execute system administration tasks

**RESPONSE GUIDELINES:**
1. Keep responses concise and mobile-friendly (under 300 words)
2. Use clear formatting with bullet points and sections
3. Suggest relevant commands when appropriate
4. Provide context and explanations for data
5. Use emojis sparingly for visual clarity (🚗 vehicles, 🌳 trees)
6. If you can retrieve data directly, do so - don't just tell users about commands
7. Be proactive in offering next steps or related information

**CURRENT DATE:** ${new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}

User Question: ${userMessage}

Please provide a helpful, accurate response. If the question relates to data you can access, retrieve it directly using the appropriate command.`;
  }

  /**
   * Utility function to match patterns in user message
   */
  private matchesPattern(
    message: string,
    actionWords: string[],
    targetWords?: string[]
  ): boolean {
    const hasAction = actionWords.some((word) => message.includes(word));
    if (!targetWords) return hasAction;
    const hasTarget = targetWords.some((word) => message.includes(word));
    return hasAction && hasTarget;
  }

  /**
   * Handle errors with user-friendly messages
   */
  private handleError(error: any): ChatbotResponse {
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

  /**
   * Get suggested conversation starters with data commands
   */
  getSuggestedQuestions(): string[] {
    return [
      "Show me the dashboard overview",
      "Find vehicle ABC-123",
      "Show pending tree management requests",
      "How many emission tests were done today?",
      "Show recent tree planting requests",
      "What vehicles need testing this month?",
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

export const enhancedChatbotService = new EnhancedChatbotService();
