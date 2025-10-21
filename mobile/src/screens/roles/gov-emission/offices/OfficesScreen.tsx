import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput } from "react-native";
import { Text, ActivityIndicator, Chip, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../../components/icons/Icon";
import StandardHeader from "../../../../components/layout/StandardHeader";
import { database, LocalOffice, LocalVehicle } from "../../../../core/database/database";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useNetworkSync } from "../../../../hooks/useNetworkSync";

export default function OfficesScreen() {
  const navigation = useNavigation();
  const { syncData, isSyncing } = useNetworkSync();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offices, setOffices] = useState<LocalOffice[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<LocalOffice | null>(null);
  const [vehicles, setVehicles] = useState<LocalVehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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
    await syncData();
    if (selectedOffice) {
      await loadVehiclesForOffice(selectedOffice.id);
    } else {
      await loadOffices();
    }
    setRefreshing(false);
  };

  const openOffice = (office: LocalOffice) => {
    setSelectedOffice(office);
    setSearchQuery("");
    loadVehiclesForOffice(office.id);
  };

  const backToOffices = () => {
    setSelectedOffice(null);
    setVehicles([]);
    setSearchQuery("");
  };

  // Filter offices/vehicles based on search
  const filteredOffices = useMemo(() => {
    if (!searchQuery.trim()) return offices;
    const query = searchQuery.toLowerCase();
    return offices.filter(
      (office) =>
        office.name.toLowerCase().includes(query) ||
        office.address?.toLowerCase().includes(query)
    );
  }, [offices, searchQuery]);

  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) return vehicles;
    const query = searchQuery.toLowerCase();
    return vehicles.filter(
      (vehicle) =>
        vehicle.plate_number.toLowerCase().includes(query) ||
        vehicle.driver_name?.toLowerCase().includes(query)
    );
  }, [vehicles, searchQuery]);

  const title = selectedOffice ? selectedOffice.name : "Government Offices";

  return (
    <>
      <StandardHeader
        title={title}
        subtitle={
          selectedOffice
            ? `${filteredVehicles.length} ${filteredVehicles.length === 1 ? "Vehicle" : "Vehicles"}`
            : `${filteredOffices.length} ${filteredOffices.length === 1 ? "Office" : "Offices"}`
        }
        backgroundColor="rgba(255, 255, 255, 0.95)"
        statusBarStyle="dark"
        showBack={!!selectedOffice}
        onBack={backToOffices}
        rightActionIcon="RefreshCw"
        onRightActionPress={() => syncData()}
        titleSize={22}
        subtitleSize={12}
        iconSize={20}
      />
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="Search" size={18} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder={selectedOffice ? "Search vehicles..." : "Search offices..."}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icon name="X" size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#111827" />
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#111827"]} tintColor="#111827" />}
          >
            {!selectedOffice ? (
              // Offices View
              filteredOffices.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name="Building2" size={64} color="#D1D5DB" />
                  <Text style={styles.emptyTitle}>
                    {searchQuery ? "No offices found" : "No offices available"}
                  </Text>
                  <Text style={styles.emptyText}>
                    {searchQuery ? "Try a different search term" : "Sync to load government offices"}
                  </Text>
                </View>
              ) : (
                filteredOffices.map((office) => (
                  <TouchableOpacity
                    key={office.id}
                    style={styles.card}
                    onPress={() => openOffice(office)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardIcon}>
                      <Icon name="Building2" size={22} color="#111827" />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{office.name}</Text>
                      {office.address && <Text style={styles.cardSubtitle}>{office.address}</Text>}
                      {office.contact_number && (
                        <View style={styles.cardRow}>
                          <Icon name="Phone" size={14} color="#6B7280" />
                          <Text style={styles.cardDetail}>{office.contact_number}</Text>
                        </View>
                      )}
                    </View>
                    <Icon name="ChevronRight" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                ))
              )
            ) : (
              // Vehicles View
              filteredVehicles.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name="Car" size={64} color="#D1D5DB" />
                  <Text style={styles.emptyTitle}>
                    {searchQuery ? "No vehicles found" : "No vehicles available"}
                  </Text>
                  <Text style={styles.emptyText}>
                    {searchQuery ? "Try a different search term" : "This office has no vehicles registered"}
                  </Text>
                </View>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={styles.card}
                    onPress={() => (navigation as any).navigate("VehicleDetail", { vehicleId: vehicle.id })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardIcon}>
                      <Icon name="Car" size={22} color="#111827" />
                    </View>
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{vehicle.plate_number}</Text>
                        {vehicle.latest_test_result !== null && (
                          <Chip
                            style={[
                              styles.statusChip,
                              vehicle.latest_test_result ? styles.statusChipPass : styles.statusChipFail,
                            ]}
                            textStyle={styles.statusChipText}
                          >
                            {vehicle.latest_test_result ? "Pass" : "Fail"}
                          </Chip>
                        )}
                      </View>
                      <Text style={styles.cardSubtitle}>{vehicle.driver_name || "Unknown driver"}</Text>
                      <View style={styles.cardRow}>
                        <Icon name="CircleDot" size={14} color="#6B7280" />
                        <Text style={styles.cardDetail}>{vehicle.vehicle_type}</Text>
                      </View>
                    </View>
                    <Icon name="ChevronRight" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                ))
              )
            )}
            {/* Bottom spacer for safe area */}
            <View style={{ height: 120 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    padding: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(17, 24, 39, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  cardContent: {
    flex: 1,
    gap: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  cardDetail: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  statusChip: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    elevation: 0,
  },
  statusChipPass: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1.5,
    borderColor: "#86EFAC",
  },
  statusChipFail: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },
});
