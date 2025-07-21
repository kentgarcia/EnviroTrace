import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "./src/core/stores/authStore";
import { database } from "./src/core/database/database";
import AppNavigator from "./src/navigation/AppNavigator";
import theme from "./src/core/theme/theme";
import { LoadingScreen } from "./src/components/LoadingScreen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Initializing database...");
        await database.init();
        console.log("Database initialized successfully");

        console.log("Checking authentication...");
        await checkAuth();
        console.log("Authentication check completed");
      } catch (error) {
        console.error("App initialization error:", error);
      }
    };

    initializeApp();
  }, [checkAuth]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </QueryClientProvider>
  );
}
