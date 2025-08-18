import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { Title, Paragraph, ActivityIndicator, useTheme, Divider } from "react-native-paper";
import Icon from "../../../components/icons/Icon";
import StandardHeader from "../../../components/layout/StandardHeader";
import { database, LocalOffice, LocalVehicle } from "../../../core/database/database";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function OfficesScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offices, setOffices] = useState<LocalOffice[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<LocalOffice | null>(null);
  const [vehicles, setVehicles] = useState<LocalVehicle[]>([]);

  const loadOffices = async () => {
    try {
      setLoading(true);
      const data = await database.getOffices();
      setOffices(data);
    } finally {
      setLoading(false);
    }
  };

  const loadVehiclesForOffice = async (officeId: string) => {
    try {
      setLoading(true);
      const list = await database.getVehicles({ office_id: officeId, limit: 500 });
      setVehicles(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffices();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Reload the current view when returning to this tab
      if (selectedOffice) {
        loadVehiclesForOffice(selectedOffice.id);
      } else {
        loadOffices();
      }
      return () => { };
    }, [selectedOffice])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedOffice) {
      await loadVehiclesForOffice(selectedOffice.id);
    } else {
      await loadOffices();
    }
    setRefreshing(false);
  };

  const openOffice = (office: LocalOffice) => {
    setSelectedOffice(office);
    loadVehiclesForOffice(office.id);
  };

  const backToOffices = () => {
    setSelectedOffice(null);
    setVehicles([]);
  };

  const title = selectedOffice ? selectedOffice.name : "Government Offices";

  return (
    <>
      <StandardHeader
        title={title}
        chip={{ label: "Gov. Emission", iconName: "business" }}
        showBack={!!selectedOffice}
        onBack={backToOffices}
      />
      <View style={styles.container}>
        {loading && offices.length === 0 && !refreshing ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
            contentContainerStyle={styles.listContent}
          >
            {!selectedOffice ? (
              offices.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name="business" size={48} color="#BDBDBD" />
                  <Title style={styles.emptyTitle}>No offices found</Title>
                  <Paragraph style={styles.emptyText}>Sync or add offices to get started.</Paragraph>
                </View>
              ) : (
                offices.map((o) => (
                  <TouchableOpacity key={o.id} style={styles.card} activeOpacity={0.75} onPress={() => openOffice(o)}>
                    <View style={styles.cardRow}>
                      <View style={styles.cardIconWrap}>
                        <Icon name="business" size={18} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Title style={styles.cardTitle}>{o.name}</Title>
                        {o.address ? <Paragraph style={styles.cardSub}>{o.address}</Paragraph> : null}
                      </View>
                      <Icon name="chevron-right" size={18} color="#6B7280" />
                    </View>
                  </TouchableOpacity>
                ))
              )
            ) : vehicles.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="directions-car" size={48} color="#BDBDBD" />
                <Title style={styles.emptyTitle}>No vehicles</Title>
                <Paragraph style={styles.emptyText}>This office has no vehicles yet.</Paragraph>
              </View>
            ) : (
              vehicles.map((v, idx) => (
                <View key={v.id}>
                  <TouchableOpacity
                    style={styles.card}
                    activeOpacity={0.75}
                    onPress={() => (navigation as any).navigate("Vehicles", { screen: "VehicleDetail", params: { vehicleId: v.id } })}
                  >
                    <View style={styles.cardRow}>
                      <View style={[styles.cardIconWrap, { backgroundColor: "#EEF2FF", borderColor: "#E5E7EB" }]}>
                        <Icon name="directions-car" size={18} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Title style={styles.cardTitle}>{v.plate_number}</Title>
                        <Paragraph style={styles.cardSub}>{v.driver_name || "Unknown driver"}</Paragraph>
                      </View>
                      <Paragraph
                        style={
                          v.latest_test_result === null
                            ? styles.statusPending
                            : v.latest_test_result
                              ? styles.statusPass
                              : styles.statusFail
                        }
                      >
                        {v.latest_test_result === null ? "Pending" : v.latest_test_result ? "Passed" : "Failed"}
                      </Paragraph>
                      <Icon name="chevron-right" size={18} color="#6B7280" />
                    </View>
                  </TouchableOpacity>
                  {idx < vehicles.length - 1 ? <Divider /> : null}
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  listContent: { padding: 16 },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  cardSub: { fontSize: 12, color: "#6B7280" },
  emptyState: { alignItems: "center", padding: 24 },
  emptyTitle: { fontSize: 18, color: "#424242", marginTop: 10, marginBottom: 6 },
  emptyText: { fontSize: 13, color: "#757575", textAlign: "center", marginBottom: 10 },
  statusPass: { fontSize: 12, fontWeight: "700", color: "#2E7D32" },
  statusFail: { fontSize: 12, fontWeight: "700", color: "#D32F2F" },
  statusPending: { fontSize: 12, fontWeight: "700", color: "#6B7280" },
});
