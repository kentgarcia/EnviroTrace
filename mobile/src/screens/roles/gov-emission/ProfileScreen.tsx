import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Title,
  Paragraph,
  Button,
  Card,
  List,
  Divider,
  Avatar,
  Chip,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../../core/stores/authStore";
import StandardHeader from "../../../components/layout/StandardHeader";
import { useNavigation } from "@react-navigation/native";
import Icon from "../../../components/icons/Icon";

export default function ProfileScreen() {
  const { user, logout, setSelectedDashboard } = useAuthStore();
  const { colors } = useTheme();
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <StandardHeader
        title="Profile & Settings"
        chip={{ label: "Gov. Emission", iconName: "person" }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Profile Hero */}
        <Card mode="outlined" style={[styles.card, { margin: 16 }]}
        >
          <Card.Content style={[styles.profileContent, { paddingVertical: 20 }]}>
            <View style={styles.avatarWrap}>
              <Avatar.Text
                size={80}
                label={user?.username?.charAt(0).toUpperCase() || "U"}
                style={[styles.avatar, { backgroundColor: colors.primary }]}
              />
            </View>
            <Title style={styles.userName}>{user?.full_name || user?.username || "User"}</Title>
            <Chip
              compact
              style={[styles.roleChip, { backgroundColor: "rgba(0, 53, 149, 0.10)" }]}
              textStyle={[styles.roleChipText, { color: colors.primary }]}
              icon={() => <Icon name="shield-check" size={14} color={colors.primary} />}
            >
              {user?.role || "Government Emission"}
            </Chip>
            {user?.email ? <Paragraph style={styles.userEmail}>{user.email}</Paragraph> : null}

            {/* Quick actions */}
            <View style={styles.quickRow}>
              <Button
                mode="outlined"
                style={styles.quickBtn}
                textColor={colors.primary}
                onPress={() => setSelectedDashboard(null)}
                icon={() => <Icon name="view-dashboard" size={16} color={colors.primary} />}
              >
                Switch Dashboard
              </Button>
              <Button
                mode="outlined"
                style={styles.quickBtn}
                textColor={colors.primary}
                onPress={() => (navigation as any).navigate("Profile", { screen: "OfflineData" })}
                icon={() => <Icon name="storage" size={16} color={colors.primary} />}
              >
                Offline Data
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Settings */}
        <Card mode="outlined" style={[styles.card, { marginHorizontal: 16 }]}
        >
          <List.Section>
            <List.Subheader style={styles.sectionHeader}>Settings</List.Subheader>
            <List.Item
              title="Sync Settings"
              description="Configure data synchronization"
              left={() => <Icon name="sync" size={18} color={colors.primary} />}
              right={() => <Icon name="chevron-right" size={18} color="#6B7280" />}
              onPress={() => (navigation as any).navigate("Profile", { screen: "SyncSettings" })}
              style={styles.listItem}
            />
            <Divider />
            <List.Item
              title="About"
              description="App version and information"
              left={() => <Icon name="info" size={18} color={colors.primary} />}
              right={() => <Icon name="chevron-right" size={18} color="#6B7280" />}
              onPress={() => { }}
              style={styles.listItem}
            />
            <Divider />
            <List.Item
              title="Help & Support"
              description="Get help and support"
              left={() => <Icon name="help" size={18} color={colors.primary} />}
              right={() => <Icon name="chevron-right" size={18} color="#6B7280" />}
              onPress={() => { }}
              style={styles.listItem}
            />
          </List.Section>
        </Card>

        {/* Sign out */}
        <View style={styles.logoutContainer}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            textColor="#D32F2F"
          >
            Sign Out
          </Button>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scrollView: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  profileContent: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatarWrap: {
    padding: 4,
    borderRadius: 44,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  avatar: {
    marginBottom: 0,
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  roleChip: { marginBottom: 6, height: 28 },
  roleChipText: { fontSize: 12, fontWeight: "600" },
  userEmail: {
    fontSize: 12,
    color: "#9E9E9E",
  },
  sectionHeader: { color: "#6B7280" },
  listItem: { paddingHorizontal: 12 },
  quickRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  quickBtn: { flex: 1, borderColor: "#E5E7EB", borderWidth: 1 },
  logoutContainer: {
    padding: 16,
    paddingTop: 24,
  },
  logoutButton: {
    borderRadius: 8,
    borderColor: "#D32F2F",
  },
});
