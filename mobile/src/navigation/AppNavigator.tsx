import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../core/stores/authStore";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import DashboardSelectorScreen from "../screens/main/DashboardSelectorScreen";
import RoleDashboardPlaceholder from "../screens/roles/gov-emission/RoleDashboardPlaceholder";

const Stack = createNativeStackNavigator();

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
          component={DashboardSelectorScreen}
          options={{
            gestureEnabled: false,
          }}
        />
      ) : selectedDashboard === "government_emission" || selectedDashboard === "admin" ? (
        <Stack.Screen
          name="Main"
          component={MainNavigator}
          options={{
            gestureEnabled: false, // Prevent going back to selector
          }}
        />
      ) : (
        <Stack.Screen
          name="RolePlaceholder"
          // @ts-ignore - simple wrapper for now
          children={() => <RoleDashboardPlaceholder role={selectedDashboard as string} />}
          options={{
            gestureEnabled: false,
          }}
        />
      )}
    </Stack.Navigator>
  );
}
