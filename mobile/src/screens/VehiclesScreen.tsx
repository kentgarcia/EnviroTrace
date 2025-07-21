import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  FlatList,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Searchbar,
  Chip,
  FAB,
  Portal,
  Modal,
  List,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

import { database, LocalVehicle } from "../core/database/database";
import { useNetworkSync } from "../hooks/useNetworkSync";

export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<LocalVehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<LocalVehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<string>("");

  const navigation = useNavigation();
  const { syncData, isSyncing } = useNetworkSync();

  // Load vehicles from database
  const loadVehicles = async () => {
    try {
      setLoading(true);
      const vehicleList = await database.getVehicles({
        limit: 100,
        offset: 0,
      });
      setVehicles(vehicleList);
      setFilteredVehicles(vehicleList);
    } catch (error) {
      console.error("Error loading vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter vehicles based on search and filters
  useEffect(() => {
    let filtered = vehicles;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.driver_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          vehicle.plate_number
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          vehicle.vehicle_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply office filter
    if (selectedOffice) {
      filtered = filtered.filter(
        (vehicle) => vehicle.office_id === selectedOffice
      );
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchQuery, selectedOffice]);

  // Load data on mount
  useEffect(() => {
    loadVehicles();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadVehicles(), syncData()]);
    setRefreshing(false);
  };

  const handleVehiclePress = (vehicle: LocalVehicle) => {
    (navigation as any).navigate("VehicleDetail", { vehicleId: vehicle.id });
  };

  const handleAddVehicle = () => {
    (navigation as any).navigate("AddVehicle");
  };

  const renderVehicleCard = ({ item: vehicle }: { item: LocalVehicle }) => (
    <Card
      style={styles.vehicleCard}
      onPress={() => handleVehiclePress(vehicle)}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.vehicleInfo}>
            <Title style={styles.plateNumber}>{vehicle.plate_number}</Title>
            <Paragraph style={styles.driverName}>
              {vehicle.driver_name}
            </Paragraph>
          </View>
          <View style={styles.statusContainer}>
            {vehicle.sync_status === "pending" && (
              <Chip
                icon="sync"
                style={styles.pendingChip}
                textStyle={styles.chipText}
              >
                Pending
              </Chip>
            )}
            {vehicle.latest_test_result !== undefined && (
              <Chip
                icon={
                  vehicle.latest_test_result ? "check-circle" : "alert-circle"
                }
                style={[
                  styles.testResultChip,
                  {
                    backgroundColor: vehicle.latest_test_result
                      ? "#E8F5E8"
                      : "#FFEBEE",
                  },
                ]}
                textStyle={[
                  styles.chipText,
                  { color: vehicle.latest_test_result ? "#2E7D32" : "#D32F2F" },
                ]}
              >
                {vehicle.latest_test_result ? "Passed" : "Failed"}
              </Chip>
            )}
          </View>
        </View>

        <View style={styles.vehicleDetails}>
          <View style={styles.detailRow}>
            <Icon name="business" size={16} color="#757575" />
            <Paragraph style={styles.detailText}>
              {vehicle.office_name || "Unknown Office"}
            </Paragraph>
          </View>
          <View style={styles.detailRow}>
            <Icon name="directions-car" size={16} color="#757575" />
            <Paragraph style={styles.detailText}>
              {vehicle.vehicle_type} • {vehicle.engine_type} • {vehicle.wheels}{" "}
              wheels
            </Paragraph>
          </View>
          {vehicle.latest_test_date && (
            <View style={styles.detailRow}>
              <Icon name="event" size={16} color="#757575" />
              <Paragraph style={styles.detailText}>
                Last tested:{" "}
                {new Date(vehicle.latest_test_date).toLocaleDateString()}
              </Paragraph>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="directions-car" size={64} color="#BDBDBD" />
      <Title style={styles.emptyTitle}>No vehicles found</Title>
      <Paragraph style={styles.emptyText}>
        {searchQuery || selectedOffice
          ? "Try adjusting your search or filters"
          : "Add your first vehicle to get started"}
      </Paragraph>
      {!searchQuery && !selectedOffice && (
        <Button
          mode="contained"
          onPress={handleAddVehicle}
          style={styles.emptyButton}
        >
          Add Vehicle
        </Button>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search vehicles..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
        />
        <Button
          mode="outlined"
          onPress={() => setFilterModalVisible(true)}
          style={styles.filterButton}
          compact
        >
          Filter
        </Button>
      </View>

      {selectedOffice && (
        <View style={styles.activeFilters}>
          <Chip
            icon="business"
            onClose={() => setSelectedOffice("")}
            style={styles.activeFilterChip}
          >
            Office Filter
          </Chip>
        </View>
      )}

      <FlatList
        data={filteredVehicles}
        renderItem={renderVehicleCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isSyncing}
            onRefresh={onRefresh}
            colors={["#2E7D32"]}
            tintColor="#2E7D32"
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <Portal>
        <Modal
          visible={filterModalVisible}
          onDismiss={() => setFilterModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title>Filter Vehicles</Title>
          <List.Section>
            <List.Subheader>Office</List.Subheader>
            <List.Item
              title="All Offices"
              left={() => <List.Icon icon="business" />}
              onPress={() => {
                setSelectedOffice("");
                setFilterModalVisible(false);
              }}
              right={() =>
                !selectedOffice ? <List.Icon icon="check" /> : null
              }
            />
            {/* Add office options here - would load from database */}
          </List.Section>

          <Button
            mode="outlined"
            onPress={() => setFilterModalVisible(false)}
            style={styles.modalButton}
          >
            Close
          </Button>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddVehicle}
        label="Add Vehicle"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchbar: {
    flex: 1,
    elevation: 2,
  },
  searchInput: {
    fontSize: 14,
  },
  filterButton: {
    alignSelf: "center",
  },
  activeFilters: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  activeFilterChip: {
    marginRight: 8,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  vehicleCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  plateNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 4,
  },
  driverName: {
    fontSize: 14,
    color: "#424242",
  },
  statusContainer: {
    gap: 4,
  },
  pendingChip: {
    backgroundColor: "#FFF3E0",
  },
  testResultChip: {
    // backgroundColor set dynamically
  },
  chipText: {
    fontSize: 10,
    fontWeight: "500",
  },
  vehicleDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: "#757575",
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    color: "#424242",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 8,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalButton: {
    marginTop: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#2E7D32",
  },
});
