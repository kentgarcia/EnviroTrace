import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "../components/icons/Icon";

// Screens - will create these next
import OverviewScreen from "../screens/roles/gov-emission/OverviewScreen";
import VehiclesScreen from "../screens/roles/gov-emission/VehiclesScreen";
import TestingScreen from "../screens/roles/gov-emission/TestingScreen";
import OfficesScreen from "../screens/roles/gov-emission/OfficesScreen";
import ProfileScreen from "../screens/roles/gov-emission/ProfileScreen";
import OfflineDataScreen from "../screens/roles/gov-emission/OfflineDataScreen";
import SyncSettingsScreen from "../screens/roles/gov-emission/SyncSettingsScreen";
import VehicleDetailScreen from "../screens/roles/gov-emission/VehicleDetailScreen";
import AddVehicleScreen from "../screens/roles/gov-emission/AddVehicleScreen";
import AddTestScreen from "../screens/roles/gov-emission/AddTestScreen";
import CustomBottomTabBar from "../components/layout/CustomBottomTabBar";

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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="OfflineData" component={OfflineDataScreen} />
      <Stack.Screen name="SyncSettings" component={SyncSettingsScreen} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomBottomTabBar {...props} />}
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

          // Icon uses given color; our custom bar will pass theme primary for active
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#003595",
        tabBarInactiveTintColor: "#9E9E9E",
        // Style handled by custom bar
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerStyle: {
          backgroundColor: "#003595",
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
          headerShown: false,
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
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          title: "Profile & Settings",
          tabBarLabel: "Profile",
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
