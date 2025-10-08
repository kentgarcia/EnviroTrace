import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "../components/icons/Icon";

// Air Quality Screens
import {
    AirQualityOverviewScreen,
    SmokeBelcherScreen,
    SmokeBelcherDetailsScreen,
    AddSmokeBelcherRecordScreen,
    FeeControlScreen,
} from "../screens/roles/air-quality";

// Import shared screens (profile, etc.)
import ProfileScreen from "../screens/roles/gov-emission/profile/ProfileScreen";
import OfflineDataScreen from "../screens/roles/gov-emission/profile/OfflineDataScreen";
import SyncSettingsScreen from "../screens/roles/gov-emission/profile/SyncSettingsScreen";
import CustomBottomTabBar from "../components/layout/CustomBottomTabBar";

export type AirQualityStackParamList = {
    AirQualityOverview: undefined;
    SmokeBelcher: undefined;
    FeeControl: undefined;
    Profile: undefined;
    // Detail screens
    SmokeBelcherDetails: { recordId: number };
    AddSmokeBelcherRecord: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function SmokeBelcherStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="SmokeBelcherList"
                component={SmokeBelcherScreen}
                options={{ title: "Smoke Belcher Records" }}
            />
            <Stack.Screen
                name="SmokeBelcherDetails"
                component={SmokeBelcherDetailsScreen}
                options={{ title: "Record Details" }}
            />
            <Stack.Screen
                name="AddSmokeBelcherRecord"
                component={AddSmokeBelcherRecordScreen}
                options={{ title: "Add Record" }}
            />
        </Stack.Navigator>
    );
}

function ProfileStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="ProfileMain"
                component={ProfileScreen}
                options={{ title: "Profile & Settings" }}
            />
            <Stack.Screen
                name="OfflineData"
                component={OfflineDataScreen}
                options={{ title: "Offline Data" }}
            />
            <Stack.Screen
                name="SyncSettings"
                component={SyncSettingsScreen}
                options={{ title: "Sync Settings" }}
            />
        </Stack.Navigator>
    );
}

export default function AirQualityNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomBottomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarStyle: {
                    backgroundColor: "#FFFFFF",
                    borderTopWidth: 1,
                    borderTopColor: "#E5E7EB",
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 65,
                },
                tabBarActiveTintColor: "#1976D2",
                tabBarInactiveTintColor: "#6B7280",
                tabBarIcon: ({ color, size, focused }) => {
                    return <Icon name="air" size={size} color={color} />;
                },
            }}
        >
            <Tab.Screen
                name="AirQualityOverview"
                component={AirQualityOverviewScreen}
                options={{
                    title: "Air Quality Dashboard",
                    tabBarLabel: "Overview",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="view-dashboard" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="SmokeBelcher"
                component={SmokeBelcherStack}
                options={{
                    title: "Smoke Belcher Records",
                    tabBarLabel: "Smoke Belcher",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="smoke-detector" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="FeeControl"
                component={FeeControlScreen}
                options={{
                    title: "Fee Control",
                    tabBarLabel: "Fees",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="currency-usd" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={{
                    title: "Profile & Settings",
                    tabBarLabel: "Profile",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
