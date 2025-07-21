import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../core/stores/authStore";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen
          name="Main"
          component={MainNavigator}
          options={{
            gestureEnabled: false, // Prevent going back to auth
          }}
        />
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{
            gestureEnabled: false, // Prevent going back when not authenticated
          }}
        />
      )}
    </Stack.Navigator>
  );
}
