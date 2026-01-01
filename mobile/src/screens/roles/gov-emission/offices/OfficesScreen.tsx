import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput } from "react-native";
import { Text, ActivityIndicator, Chip, Divider } from "react-native-paper";
import Icon from "../../../../components/icons/Icon";
import ScreenLayout from "../../../../components/layout/ScreenLayout";
import { database, LocalOffice, LocalVehicle } from "../../../../core/database/database";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { cardStyles } from "../../../../styles/cardStyles";

export default function OfficesScreen() {
  const navigation = useNavigation();

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
    <ScreenLayout
      header={{
        title: title,
        subtitle: selectedOffice
          ? `${filteredVehicles.length} ${filteredVehicles.length === 1 ? "Vehicle" : "Vehicles"}`
          : `${filteredOffices.length} ${filteredOffices.length === 1 ? "Office" : "Offices"}`,
        backgroundColor: "#2563EB",
        statusBarStyle: "light",
        titleColor: "#FFFFFF",
        subtitleColor: "rgba(255, 255, 255, 0.8)",
        borderColor: "transparent",
        showBack: !!selectedOffice,
        onBack: backToOffices,
        titleSize: 22,
        subtitleSize: 12,
        iconSize: 20,
      }}
    >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="Search" size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder={selectedOffice ? "Search vehicles..." : "Search offices..."}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icon name="X" size={18} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} tintColor="#2563EB" />}
          >
            {!selectedOffice ? (
              // Offices View
              filteredOffices.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Icon name="Building2" size={48} color="#CBD5E1" />
                  </View>
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
                      <Icon name="Building2" size={20} color="#2563EB" />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{office.name}</Text>
                      {office.address && <Text style={styles.cardSubtitle} numberOfLines={1}>{office.address}</Text>}
                      {office.contact_number && (
                        <View style={styles.cardRow}>
                          <Icon name="Phone" size={12} color="#94A3B8" />
                          <Text style={styles.cardDetail}>{office.contact_number}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.chevronContainer}>
                      <Icon name="ChevronRight" size={18} color="#CBD5E1" />
                    </View>
                  </TouchableOpacity>
                ))
              )
            ) : (
              // Vehicles View
              filteredVehicles.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Icon name="Car" size={48} color="#CBD5E1" />
                  </View>
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
                      <Icon name="Car" size={20} color="#2563EB" />
                    </View>
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{vehicle.plate_number}</Text>
                        {vehicle.latest_test_result !== null && (
                          <View
                            style={[
                              styles.statusBadge,
                              vehicle.latest_test_result ? styles.statusBadgePass : styles.statusBadgeFail,
                            ]}
                          >
                            <Text style={[styles.statusBadgeText, vehicle.latest_test_result ? styles.statusTextPass : styles.statusTextFail]}>
                              {vehicle.latest_test_result ? "Pass" : "Fail"}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.cardSubtitle}>{vehicle.driver_name || "Unknown driver"}</Text>
                      <View style={styles.cardRow}>
                        <Icon name="CircleDot" size={12} color="#94A3B8" />
                        <Text style={styles.cardDetail}>{vehicle.vehicle_type}</Text>
                      </View>
                    </View>
                    <View style={styles.chevronContainer}>
                      <Icon name="ChevronRight" size={18} color="#CBD5E1" />
                    </View>
                  </TouchableOpacity>
                ))
              )
            )}
            {/* Bottom spacer for safe area */}
            <View style={{ height: 120 }} />
          </ScrollView>
        )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    padding: 0,
    fontWeight: "500",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    gap: 14,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardDetail: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },
  chevronContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgePass: {
    backgroundColor: "#F0FDF4",
  },
  statusBadgeFail: {
    backgroundColor: "#FEF2F2",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  statusTextPass: {
    color: "#16A34A",
  },
  statusTextFail: {
    color: "#DC2626",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 20,
  },
});
