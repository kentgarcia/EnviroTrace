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
      id: "about",
      icon: "Info",
      title: "About",
      description: "App version and information",
      onPress: () => (navigation as any).navigate("About"),
    },
    {
      id: "help",
      icon: "HelpCircle",
      title: "Help & Support",
      description: "Get help and support",
      onPress: () => (navigation as any).navigate("Help"),
    },
  ];

  return (
    <>
      <StandardHeader
        title="Profile & Settings"
        backgroundColor="rgba(255, 255, 255, 0.95)"
        statusBarStyle="dark"
        titleSize={22}
        subtitleSize={12}
        iconSize={20}
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
              icon={() => <Icon name="Shield" size={14} color="#111827" />}
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
                <Icon name="LayoutDashboard" size={18} color="#FFFFFF" />
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
                  <Icon name={item.icon as any} size={18} color="#111827" />
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
    backgroundColor: "#FFFFFF",
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
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: "#111827",
  },
  avatarLabel: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userName: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  roleChip: {
    backgroundColor: "rgba(17, 24, 39, 0.1)",
    height: 28,
    marginBottom: 12,
    elevation: 0,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  userEmail: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  quickActionsRow: {
    width: "100%",
    gap: 8,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  // Menu Section
  menuSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    marginBottom: 16,
    elevation: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(17, 24, 39, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  menuDescription: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
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
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#FEE2E2",
    paddingVertical: 14,
    gap: 8,
    elevation: 1,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#DC2626",
    letterSpacing: -0.2,
  },
});
