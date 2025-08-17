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
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../../core/stores/authStore";

export default function ProfileScreen() {
  const { user, logout, setSelectedDashboard } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text
              size={80}
              label={user?.username?.charAt(0).toUpperCase() || "U"}
              style={styles.avatar}
            />
            <Title style={styles.userName}>
              {user?.full_name || user?.username || "User"}
            </Title>
            <Paragraph style={styles.userRole}>
              {user?.role || "Government Emission"}
            </Paragraph>
            <Paragraph style={styles.userEmail}>{user?.email}</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.menuCard}>
          <List.Section>
            <List.Subheader>Settings</List.Subheader>
            <List.Item
              title="Switch Dashboard"
              description="Choose a different role dashboard"
              left={(props) => <List.Icon {...props} icon="view-dashboard" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => setSelectedDashboard(null)}
            />
            <List.Item
              title="Sync Settings"
              description="Configure data synchronization"
              left={(props) => <List.Icon {...props} icon="sync" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => { }}
            />
            <List.Item
              title="Offline Data"
              description="Manage local data storage"
              left={(props) => <List.Icon {...props} icon="storage" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => { }}
            />
            <Divider />
            <List.Item
              title="About"
              description="App version and information"
              left={(props) => <List.Icon {...props} icon="info" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => { }}
            />
            <List.Item
              title="Help & Support"
              description="Get help and support"
              left={(props) => <List.Icon {...props} icon="help" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => { }}
            />
          </List.Section>
        </Card>

        <View style={styles.logoutContainer}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            buttonColor="#FFEBEE"
            textColor="#D32F2F"
          >
            Sign Out
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  profileCard: {
    margin: 16,
    borderRadius: 12,
  },
  profileContent: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatar: {
    backgroundColor: "#2E7D32",
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: "#9E9E9E",
  },
  menuCard: {
    marginHorizontal: 16,
    borderRadius: 12,
  },
  logoutContainer: {
    padding: 16,
    paddingTop: 24,
  },
  logoutButton: {
    borderRadius: 8,
    borderColor: "#D32F2F",
  },
});
