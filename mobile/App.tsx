import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import PaperIcon from "./src/components/icons/PaperIcon";
import { QueryClient, QueryClientProvider, focusManager } from "@tanstack/react-query";
import { AppState, AppStateStatus } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "./src/core/stores/authStore";
import { database } from "./src/core/database/database";
import smartCache from "./src/core/cache/smartCache";
import AppNavigator from "./src/navigation/AppNavigator";
import theme from "./src/core/theme/theme";
import { LoadingScreen } from "./src/components/LoadingScreen";
import { ChatbotProvider } from "./src/core/contexts/ChatbotContext";
import { useFonts } from "expo-font";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";

// Configure focus manager for React Query to work with React Native
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener("change", (state: AppStateStatus) => {
    handleFocus(state === "active");
  });
  return () => subscription.remove();
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes - data is fresh for 2 min
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory cache
      retry: 2,
      refetchOnWindowFocus: true, // Refetch when app comes to foreground
      refetchOnReconnect: true, // Refetch when network reconnects
      networkMode: "offlineFirst", // Return cached data first, then fetch
    },
  },
});

export default function App() {
  const { checkAuth, isLoading } = useAuthStore();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Initializing database...");
        await database.init();
        console.log("Database initialized successfully");

        // Clean up expired cache entries
        console.log("Cleaning up expired cache...");
        await smartCache.cleanup();

        console.log("Checking authentication...");
        await checkAuth();
        console.log("Authentication check completed");
      } catch (error) {
        console.error("App initialization error:", error);
      }
    };

    initializeApp();
  }, [checkAuth]);

  if (isLoading || !fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme} settings={{ icon: (props) => <PaperIcon {...props} /> }}>
        <ChatbotProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </ChatbotProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
