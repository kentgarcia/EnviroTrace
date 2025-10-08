import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from "react-native";
import { Button, Avatar, Chip } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../../../core/stores/authStore";
import StandardHeader from "../../../../components/layout/StandardHeader";
import { useNavigation } from "@react-navigation/native";
import Icon from "../../../../components/icons/Icon";

export default function ProfileScreen() {
  const { user, logout, setSelectedDashboard } = useAuthStore();
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    {
      id: "offline-data",
      icon: "Database",
      title: "Offline Data",
      description: "View and manage offline data",
      onPress: () => (navigation as any).navigate("OfflineData"),
    },
    {
      id: "sync-settings",
      icon: "RefreshCw",
      title: "Sync Settings",
      description: "Configure data synchronization",
      onPress: () => (navigation as any).navigate("SyncSettings"),
    },
    {
      id: "about",
      icon: "Info",
      title: "About",
      description: "App version and information",
      onPress: () => { },
    },
    {
      id: "help",
      icon: "HelpCircle",
      title: "Help & Support",
      description: "Get help and support",
      onPress: () => { },
    },
  ];

  return (
    <>
      <StandardHeader
        title="Profile & Settings"
        backgroundColor="#F3F6FB"
        statusBarStyle="dark"
      />
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Avatar.Text
                size={80}
                label={user?.username?.charAt(0).toUpperCase() || "U"}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
            </View>
            <Text style={styles.userName}>
              {user?.full_name || user?.username || "User"}
            </Text>
            <Chip
              style={styles.roleChip}
              textStyle={styles.roleChipText}
              icon={() => <Icon name="Shield" size={14} color="#02339C" />}
            >
              {user?.role || "Government Emission"}
            </Chip>
            {user?.email && (
              <View style={styles.emailRow}>
                <Icon name="Mail" size={14} color="#6B7280" />
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => setSelectedDashboard(null)}
                activeOpacity={0.7}
              >
                <Icon name="LayoutDashboard" size={20} color="#02339C" />
                <Text style={styles.quickActionText}>Switch Dashboard</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Settings</Text>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.menuItemLast,
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconContainer}>
                  <Icon name={item.icon as any} size={20} color="#02339C" />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
                <Icon name="ChevronRight" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Sign Out Button */}
          <View style={styles.signOutContainer}>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Icon name="LogOut" size={20} color="#DC2626" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Spacer */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F6FB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Profile Card
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    elevation: 0,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: "#02339C",
  },
  avatarLabel: {
    fontSize: 32,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  roleChip: {
    backgroundColor: "#EEF2FF",
    height: 28,
    marginBottom: 12,
    elevation: 0,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#02339C",
    lineHeight: 14,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
  },
  quickActionsRow: {
    width: "100%",
    gap: 8,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F6FB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#02339C",
  },
  // Menu Section
  menuSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
    elevation: 0,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 13,
    color: "#6B7280",
  },
  // Sign Out
  signOutContainer: {
    marginBottom: 16,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    paddingVertical: 14,
    gap: 8,
    elevation: 0,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
  },
});
