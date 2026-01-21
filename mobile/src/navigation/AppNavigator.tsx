import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, StyleSheet } from "react-native";
import { useAuthStore } from "../core/stores/authStore";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import TreeManagementNavigator from "./TreeManagementNavigator";
import DashboardSelectorScreen from "../screens/main/DashboardSelectorScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import AIAssistantScreen from "../screens/main/AIAssistantScreen";
import NetworkDiagnosticsScreen from "../screens/NetworkDiagnosticsScreen";

const Stack = createNativeStackNavigator();
const SelectorStack = createNativeStackNavigator();

function DashboardSelectorNavigator() {
  return (
    <SelectorStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <SelectorStack.Screen name="DashboardSelectorMain" component={DashboardSelectorScreen} />
      <SelectorStack.Screen name="ProfileHome" component={ProfileScreen} />
      <SelectorStack.Screen name="AIAssistant" component={AIAssistantScreen} />
      <SelectorStack.Screen name="NetworkDiagnostics" component={NetworkDiagnosticsScreen} />
    </SelectorStack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, selectedDashboard } = useAuthStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{
            gestureEnabled: false, // Prevent going back when not authenticated
          }}
        />
      ) : !selectedDashboard ? (
        <Stack.Screen
          name="DashboardSelector"
          component={DashboardSelectorNavigator}
          options={{
            gestureEnabled: false,
          }}
        />
      ) : selectedDashboard === "government_emission" ? (
        <Stack.Screen
          name="Main"
          component={MainNavigator}
          options={{
            gestureEnabled: false, // Prevent going back to selector
          }}
        />
      ) : selectedDashboard === "urban_greening" ? (
        <Stack.Screen
          name="TreeManagement"
          component={TreeManagementNavigator}
          options={{
            gestureEnabled: false, // Prevent going back to selector
          }}
        />
      ) : (
        <Stack.Screen
          name="DashboardSelector"
          component={DashboardSelectorNavigator}
          options={{
            gestureEnabled: false,
          }}
        />
      )}
    </Stack.Navigator>
  );
}
