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
import TreeInventoryScreen from "../screens/roles/tree-management/TreeInventoryScreen";
import TreeDetailScreen from "../screens/roles/tree-management/TreeDetailScreen";
import TreeFormScreen from "../screens/roles/tree-management/TreeFormScreen";
import GreeningProjectsScreen from "../screens/roles/tree-management/GreeningProjectsScreen";
import FeeRecordsScreen from "../screens/roles/tree-management/FeeRecordsScreen";
import MapViewScreen from "../screens/roles/tree-management/MapViewScreen";
import CameraScreen from "../screens/roles/tree-management/CameraScreen";

// Import shared screens (profile, etc.)
import ProfileScreen from "../screens/roles/gov-emission/profile/ProfileScreen";
import CustomBottomTabBar from "../components/layout/BottomTabBar";

export type TreeManagementStackParamList = {
    MainTabs: undefined;
    Profile: undefined;
    TreeManagementOverview: undefined;
    TreeInventory: undefined;
    TreeDetail: { treeId: string };
    TreeForm: { treeId?: string };
    MapView: undefined;
    Camera: undefined;
    TreeRequests: undefined;
    GreeningProjects: undefined;
    FeeRecords: undefined;
    AddRequest: undefined;
    Statistics: undefined;
    RequestDetail: { requestId: string };
};

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
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

function MainTabs() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomBottomTabBar {...props} />}
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = "";

                    switch (route.name) {
                        case "TreeManagementOverview":
                            iconName = "LayoutDashboard";
                            break;
                        case "TreeInventory":
                            iconName = "TreeDeciduous";
                            break;
                        case "MapView":
                            iconName = "MapPin";
                            break;
                        case "Camera":
                            iconName = "Camera";
                            break;
                        case "TreeRequests":
                            iconName = "FileText";
                            break;
                        case "GreeningProjects":
                            iconName = "Leaf";
                            break;
                        case "FeeRecords":
                            iconName = "Banknote";
                            break;
                        default:
                            iconName = "HelpCircle";
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
                    title: "Urban Greening Dashboard",
                    tabBarLabel: "Overview",
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="TreeInventory"
                component={TreeInventoryScreen}
                options={{
                    title: "Tree Inventory",
                    tabBarLabel: "Inventory",
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="MapView"
                component={MapViewScreen}
                options={{
                    title: "Map View",
                    tabBarLabel: "Map",
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="Camera"
                component={CameraScreen}
                options={{
                    title: "Camera",
                    tabBarLabel: "Camera",
                    headerShown: false,
                }}
            />
        </Tab.Navigator>
    );
}

export default function TreeManagementNavigator() {
    return (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
            <RootStack.Screen name="MainTabs" component={MainTabs} />
            <RootStack.Screen
                name="TreeDetail"
                component={TreeDetailScreen}
                options={{
                    headerShown: false,
                }}
            />
            <RootStack.Screen
                name="TreeForm"
                component={TreeFormScreen}
                options={{
                    headerShown: false,
                }}
            />
            <RootStack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    presentation: "modal",
                    headerShown: false,
                }}
            />
        </RootStack.Navigator>
    );
}
