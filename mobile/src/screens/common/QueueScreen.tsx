import React, { useCallback, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import ScreenLayout from "../../components/layout/ScreenLayout";
import Icon from "../../components/icons/Icon";
import {
  QueueItem,
  QueueRole,
  listQueue,
  removeQueueItem,
  sendQueueForRole,
  sendQueueItem,
} from "../../core/queue/offlineQueue";

interface QueueScreenProps {
  route: { params?: { role?: QueueRole } };
}

const roleLabel = (role: QueueRole) =>
  role === "government_emission" ? "Government Emission" : "Urban Greening";

export default function QueueScreen({ route }: QueueScreenProps) {
  const role = route.params?.role ?? "government_emission";
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingIds, setSendingIds] = useState<Record<string, boolean>>({});

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listQueue(role);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useFocusEffect(
    useCallback(() => {
      loadQueue();
    }, [loadQueue])
  );

  const handleSendAll = async () => {
    if (items.length === 0) return;
    setSendingAll(true);
    try {
      const results = await sendQueueForRole(role);
      const sent = results.filter((r) => r.success).length;
      const failed = results.length - sent;
      await loadQueue();
      Alert.alert(
        "Queue sent",
        `${sent} item(s) sent${failed ? `, ${failed} failed` : ""}.`
      );
    } finally {
      setSendingAll(false);
    }
  };

  const handleSendOne = async (item: QueueItem) => {
    setSendingIds((prev) => ({ ...prev, [item.id]: true }));
    try {
      const result = await sendQueueItem(item);
      await loadQueue();
      if (!result.success) {
        Alert.alert("Send failed", "Unable to send this item right now.");
      }
    } finally {
      setSendingIds((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const handleDelete = async (item: QueueItem) => {
    Alert.alert("Remove item?", "This will delete the queued entry.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await removeQueueItem(item.id);
          await loadQueue();
        },
      },
    ]);
  };

  return (
    <ScreenLayout
      header={{
        title: "Queue",
        subtitle: roleLabel(role),
        statusBarStyle: "dark",
        showProfileAction: true,
        titleSize: 22,
      }}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Pending Actions</Text>
          <TouchableOpacity
            style={[styles.sendAllButton, items.length === 0 && styles.disabledButton]}
            onPress={handleSendAll}
            disabled={items.length === 0 || sendingAll}
          >
            {sendingAll ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="Send" size={14} color="#FFFFFF" />
                <Text style={styles.sendAllText}>Send All</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#1E40AF" />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="Inbox" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>No queued items yet.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>{item.action}</Text>
                    <Text style={styles.cardStatus}>{item.status}</Text>
                  </View>
                  <Text style={styles.cardMeta}>{new Date(item.createdAt).toLocaleString()}</Text>
                </View>
                {item.error && <Text style={styles.cardError}>{item.error}</Text>}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSendOne(item)}
                    disabled={sendingIds[item.id]}
                  >
                    {sendingIds[item.id] ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Icon name="Send" size={14} color="#FFFFFF" />
                        <Text style={styles.actionText}>Send</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item)}
                  >
                    <Icon name="Trash2" size={14} color="#FFFFFF" />
                    <Text style={styles.actionText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  sendAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#1E40AF",
  },
  sendAllText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  disabledButton: {
    backgroundColor: "#94A3B8",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    gap: 4,
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
  },
  cardStatus: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1E40AF",
    textTransform: "uppercase",
  },
  cardMeta: {
    fontSize: 12,
    color: "#64748B",
  },
  cardError: {
    fontSize: 12,
    color: "#DC2626",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#2563EB",
  },
  deleteButton: {
    backgroundColor: "#DC2626",
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
});
