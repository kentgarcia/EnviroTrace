import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import Icon from "../components/icons/Icon";

import OverviewScreen from "../screens/roles/gov-emission/overview/OverviewScreen";
import VehiclesScreen from "../screens/roles/gov-emission/vehicles/VehiclesScreen";
import TestingScreen from "../screens/roles/gov-emission/test/TestingScreen";
import OfficesScreen from "../screens/roles/gov-emission/offices/OfficesScreen";
import ProfileScreen from "../screens/roles/gov-emission/profile/ProfileScreen";
import AboutScreen from "../screens/roles/gov-emission/profile/AboutScreen";
import HelpScreen from "../screens/roles/gov-emission/profile/HelpScreen";
import VehicleDetailScreen from "../screens/roles/gov-emission/vehicles/VehicleDetailScreen";
import AddVehicleScreen from "../screens/roles/gov-emission/vehicles/AddVehicleScreen";
import AddTestScreen from "../screens/roles/gov-emission/test/AddTestScreen";
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
        options={{
          title: "Vehicle Details",
        }}
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
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
    </Stack.Navigator>
  );
}

function OfficesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="OfficesList"
        component={OfficesScreen}
        options={{ title: "Government Offices" }}
      />
      <Stack.Screen
        name="VehicleDetail"
        component={VehicleDetailScreen}
        options={{
          title: "Vehicle Details",
        }}
      />
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
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "VehiclesList";
          return {
            title: "Vehicle Management",
            tabBarLabel: "Vehicles",
            headerShown: false,
            tabBarStyle: routeName === "VehicleDetail" || routeName === "AddVehicle"
              ? { display: "none" }
              : undefined,
          };
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Reset to root when tab is pressed
            navigation.navigate("Vehicles", { screen: "VehiclesList" });
          },
        })}
      />
      <Tab.Screen
        name="Testing"
        component={TestingStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "TestingList";
          return {
            title: "Emission Testing",
            tabBarLabel: "Testing",
            headerShown: false,
            tabBarStyle: routeName === "AddTest"
              ? { display: "none" }
              : undefined,
          };
        }}
      />
      <Tab.Screen
        name="Offices"
        component={OfficesStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "OfficesList";
          return {
            title: "Government Offices",
            tabBarLabel: "Offices",
            headerShown: false,
            tabBarStyle: routeName === "VehicleDetail"
              ? { display: "none" }
              : undefined,
          };
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "ProfileHome";
          return {
            title: "Profile & Settings",
            tabBarLabel: "Profile",
            headerShown: false,
            tabBarStyle: routeName === "OfflineData" || routeName === "SyncSettings"
              ? { display: "none" }
              : undefined,
          };
        }}
      />
    </Tab.Navigator>
  );
}
