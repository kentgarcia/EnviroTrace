import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "../components/icons/Icon";

// Tree Management Screens
import {
    OverviewScreen,
    TreeRequestsScreen,
    RequestDetailScreen,
    AddRequestScreen,
    StatisticsScreen,
} from "../screens/roles/tree-management";

// Import shared screens (profile, etc.)
import ProfileScreen from "../screens/roles/gov-emission/profile/ProfileScreen";
import OfflineDataScreen from "../screens/roles/gov-emission/profile/OfflineDataScreen";
import SyncSettingsScreen from "../screens/roles/gov-emission/profile/SyncSettingsScreen";
import CustomBottomTabBar from "../components/layout/CustomBottomTabBar";

export type TreeManagementStackParamList = {
    TreeManagementOverview: undefined;
    TreeRequests: undefined;
    AddRequest: undefined;
    Statistics: undefined;
    Profile: undefined;
    RequestDetail: { requestId: string };
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TreeRequestsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="TreeRequestsList"
                component={TreeRequestsScreen}
                options={{ title: "Tree Requests" }}
            />
            <Stack.Screen
                name="RequestDetail"
                component={RequestDetailScreen}
                options={{ title: "Request Details" }}
            />
            <Stack.Screen
                name="AddRequest"
                component={AddRequestScreen}
                options={{
                    title: "Add Request",
                    presentation: "modal",
                }}
            />
        </Stack.Navigator>
    );
}

function StatisticsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="StatisticsList"
                component={StatisticsScreen}
                options={{ title: "Statistics & Reports" }}
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

export default function TreeManagementNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomBottomTabBar {...props} />}
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = "";

                    switch (route.name) {
                        case "TreeManagementOverview":
                            iconName = "dashboard";
                            break;
                        case "TreeRequests":
                            iconName = "assignment";
                            break;
                        case "Statistics":
                            iconName = "bar-chart";
                            break;
                        case "Profile":
                            iconName = "person";
                            break;
                        default:
                            iconName = "help";
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: "#003595",
                tabBarInactiveTintColor: "#9E9E9E",
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
                name="TreeManagementOverview"
                component={OverviewScreen}
                options={{
                    title: "Tree Management Dashboard",
                    tabBarLabel: "Overview",
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="TreeRequests"
                component={TreeRequestsStack}
                options={{
                    title: "Tree Requests",
                    tabBarLabel: "Requests",
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="Statistics"
                component={StatisticsStack}
                options={{
                    title: "Statistics & Reports",
                    tabBarLabel: "Statistics",
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
