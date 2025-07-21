import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialIcons";

// Screens - will create these next
import OverviewScreen from "../screens/OverviewScreen";
import VehiclesScreen from "../screens/VehiclesScreen";
import TestingScreen from "../screens/TestingScreen";
import OfficesScreen from "../screens/OfficesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import VehicleDetailScreen from "../screens/VehicleDetailScreen";
import AddVehicleScreen from "../screens/AddVehicleScreen";
import AddTestScreen from "../screens/AddTestScreen";

export type MainStackParamList = {
  Overview: undefined;
  Vehicles: undefined;
  Testing: undefined;
  Offices: undefined;
  Profile: undefined;
  VehicleDetail: { vehicleId: string };
  AddVehicle: undefined;
  AddTest: { vehicleId?: string };
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function VehiclesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="VehiclesList"
        component={VehiclesScreen}
        options={{ title: "Vehicles" }}
      />
      <Stack.Screen
        name="VehicleDetail"
        component={VehicleDetailScreen}
        options={{ title: "Vehicle Details" }}
      />
      <Stack.Screen
        name="AddVehicle"
        component={AddVehicleScreen}
        options={{
          title: "Add Vehicle",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}

function TestingStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TestingList"
        component={TestingScreen}
        options={{ title: "Emission Testing" }}
      />
      <Stack.Screen
        name="AddTest"
        component={AddTestScreen}
        options={{
          title: "Record Test",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "";

          switch (route.name) {
            case "Overview":
              iconName = "dashboard";
              break;
            case "Vehicles":
              iconName = "directions-car";
              break;
            case "Testing":
              iconName = "assignment";
              break;
            case "Offices":
              iconName = "business";
              break;
            case "Profile":
              iconName = "person";
              break;
            default:
              iconName = "help";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2E7D32",
        tabBarInactiveTintColor: "#9E9E9E",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E0E0E0",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerStyle: {
          backgroundColor: "#2E7D32",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen
        name="Overview"
        component={OverviewScreen}
        options={{
          title: "Dashboard",
          tabBarLabel: "Overview",
        }}
      />
      <Tab.Screen
        name="Vehicles"
        component={VehiclesStack}
        options={{
          title: "Vehicle Management",
          tabBarLabel: "Vehicles",
          headerShown: false, // VehiclesStack will handle its own headers
        }}
      />
      <Tab.Screen
        name="Testing"
        component={TestingStack}
        options={{
          title: "Emission Testing",
          tabBarLabel: "Testing",
          headerShown: false, // TestingStack will handle its own headers
        }}
      />
      <Tab.Screen
        name="Offices"
        component={OfficesScreen}
        options={{
          title: "Government Offices",
          tabBarLabel: "Offices",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile & Settings",
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}
