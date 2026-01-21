import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import {
  Text,
  Chip,
  Button,
  Dialog,
  Portal,
  Divider,
  useTheme,
} from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "../../../../components/icons/Icon";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ScreenLayout from "../../../../components/layout/ScreenLayout";
import FloatingActionButton from "../../../../components/FloatingActionButton";
import { cardStyles } from "../../../../styles/cardStyles";

import {
  useVehicles,
  useFilterOptions,
  useOffices,
  Vehicle,
  VehicleFilters,
} from "../../../../core/api/emission-service";

type FilterValues = {
  vehicleType: string;
  engineType: string;
  office: string;
};

type DropdownOption = {
  label: string;
  value: string;
};

type FilterDialogProps = {
  visible: boolean;
  onDismiss: () => void;
  dropdownData: {
    vehicleTypes: DropdownOption[];
    engineTypes: DropdownOption[];
    offices: DropdownOption[];
  };
  initialValues: FilterValues;
  onApply: (filters: FilterValues) => void;
  renderRightIcon: (visible?: boolean) => React.ReactElement | null;
  renderItem: (item: DropdownOption, selected?: boolean) => React.ReactElement | null;
};

export default function VehiclesScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterVehicleType, setFilterVehicleType] = useState<string>("");
  const [filterEngineType, setFilterEngineType] = useState<string>("");
  const [filterOffice, setFilterOffice] = useState<string>("");

  // Build filters object for API
  const filters: VehicleFilters = useMemo(() => {
    const result: VehicleFilters = {};

    if (searchQuery) result.search = searchQuery;
    if (filterOffice) result.office_name = filterOffice;
    if (filterVehicleType) result.vehicle_type = filterVehicleType;
    if (filterEngineType) result.engine_type = filterEngineType;

    return result;
  }, [searchQuery, filterOffice, filterVehicleType, filterEngineType]);

  // Fetch data from API
  const {
    data: vehiclesData,
    isLoading,
    error,
    refetch,
  } = useVehicles(filters, 0, 1000);

  const {
    data: filterOptions,
    isLoading: isLoadingOptions,
  } = useFilterOptions();

  const { data: officesData } = useOffices();

  // Get vehicles array
  const vehicles = useMemo(() => {
    return vehiclesData?.vehicles || [];
  }, [vehiclesData]);

  // Get offices list
  const officesList = useMemo(() => {
    return officesData?.offices || [];
  }, [officesData]);

  // Extract unique filter options from API filter options
  const dropdownFilterOptions = useMemo(() => {
    const vehicleTypes = filterOptions?.vehicle_types || [];
    const engineTypes = filterOptions?.engine_types || [];
    const offices = filterOptions?.offices || [];

    return {
      vehicleTypes,
      engineTypes,
      offices,
    };
  }, [filterOptions]);

  // Format data for Dropdown component
  const dropdownData = useMemo(() => {
    return {
      vehicleTypes: [
        { label: "All Types", value: "" },
        ...dropdownFilterOptions.vehicleTypes.map((type) => ({ label: type, value: type })),
      ],
      engineTypes: [
        { label: "All Engines", value: "" },
        ...dropdownFilterOptions.engineTypes.map((type) => ({ label: type, value: type })),
      ],
      offices: [
        { label: "All Offices", value: "" },
        ...dropdownFilterOptions.offices.map((office) => ({ label: office, value: office })),
      ],
    };
  }, [dropdownFilterOptions]);

  // Filter vehicles based on office (client-side filtering if not already in API filters)
  const filteredVehicles = useMemo(() => {
    let filtered = vehicles;

    // Apply office filter if not already in API filters
    if (filterOffice && !filters.office_name) {
      filtered = filtered.filter(
        (vehicle) => vehicle.office?.name === filterOffice
      );
    }

    return filtered;
  }, [vehicles, filterOffice, filters.office_name]);

  // Optimized handlers using useCallback to prevent recreation on every render
  const handleApplyFilters = useCallback(
    (filters: FilterValues) => {
      setFilterVehicleType(filters.vehicleType);
      setFilterEngineType(filters.engineType);
      setFilterOffice(filters.office);
      setFilterModalVisible(false);
    },
    []
  );

  // Memoized render functions for Dropdown to prevent re-creation
  const renderChevronIcon = useCallback(
    (_visible?: boolean) => <Icon name="ChevronDown" size={18} color="#6B7280" />,
    []
  );

  const renderDropdownItem = useCallback(
    (item: DropdownOption) => (
      <View style={styles.dropdownItem}>
        <Text style={styles.dropdownItemText}>{item.label}</Text>
      </View>
    ),
    []
  );

  // Temporary filter states (in modal, before applying)
  const filterDialogInitialValues = useMemo(
    () => ({
      vehicleType: filterVehicleType,
      engineType: filterEngineType,
      office: filterOffice,
    }),
    [filterVehicleType, filterEngineType, filterOffice]
  );

  // Refetch data whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleVehiclePress = useCallback(
    (vehicle: Vehicle) => {
      (navigation as any).navigate("VehicleDetail", { vehicleId: vehicle.id });
    },
    [navigation]
  );

  const handleAddVehicle = () => {
    (navigation as any).navigate("AddVehicle");
  };

  const renderVehicleCard = useCallback(
    ({ item }: { item: Vehicle }) => (
      <VehicleCard vehicle={item} onPress={handleVehiclePress} />
    ),
    [handleVehiclePress]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Icon name="Car" size={48} color="#1E40AF" />
      </View>
      <Text style={styles.emptyTitle}>No vehicles found</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? "Try adjusting your search or filters"
          : "Add your first vehicle to start tracking emissions"}
      </Text>
      {!searchQuery && (
        <Button
          mode="contained"
          onPress={handleAddVehicle}
          style={styles.emptyButton}
          buttonColor="#1E40AF"
        >
          Add Vehicle
        </Button>
      )}
    </View>
  );

  return (
    <ScreenLayout
      header={{
        title: "Vehicles",
        subtitle: `${filteredVehicles.length} Total Fleet`,
                titleSize: 22,

        statusBarStyle: "dark",
        rightActionIcon: "RefreshCw",
        onRightActionPress: () => refetch(),
        showProfileAction: true,
      }}
    >
        {/* Search bar with filter button */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="Search" size={18} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search plate, driver, or type..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94A3B8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Icon name="X" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Icon name="Filter" size={20} color="#FFFFFF" />
            {(filterVehicleType || filterEngineType || filterOffice) && (
              <View style={styles.filterBadge} />
            )}
          </TouchableOpacity>
        </View>

        {/* Active filters */}
        {(filterVehicleType || filterEngineType || filterOffice) && (
          <View style={styles.activeFiltersContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeFiltersContent}
            >
              {filterVehicleType && (
                <Chip
                  compact
                  mode="flat"
                  onClose={() => setFilterVehicleType("")}
                  style={styles.activeFilterChip}
                  textStyle={styles.activeFilterText}
                >
                  {filterVehicleType}
                </Chip>
              )}
              {filterEngineType && (
                <Chip
                  compact
                  mode="flat"
                  onClose={() => setFilterEngineType("")}
                  style={styles.activeFilterChip}
                  textStyle={styles.activeFilterText}
                >
                  {filterEngineType}
                </Chip>
              )}
              {filterOffice && (
                <Chip
                  compact
                  mode="flat"
                  onClose={() => setFilterOffice("")}
                  style={styles.activeFilterChip}
                  textStyle={styles.activeFilterText}
                >
                  {filterOffice}
                </Chip>
              )}
              <TouchableOpacity
                onPress={() => {
                  setFilterVehicleType("");
                  setFilterEngineType("");
                  setFilterOffice("");
                }}
                style={styles.clearAllButton}
              >
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Vehicle count summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? "s" : ""}
            {searchQuery && " found"}
          </Text>
        </View>

        <FlatList
          data={filteredVehicles}
          renderItem={renderVehicleCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={onRefresh}
              colors={["#1E40AF"]}
              tintColor="#1E40AF"
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={15}
          windowSize={5}
        />

        <FloatingActionButton onPress={handleAddVehicle} />

      <FilterDialog
        visible={filterModalVisible}
        onDismiss={() => setFilterModalVisible(false)}
        dropdownData={dropdownData}
        initialValues={filterDialogInitialValues}
        onApply={handleApplyFilters}
        renderRightIcon={renderChevronIcon}
        renderItem={renderDropdownItem}
      />
    </ScreenLayout>
  );
}

// Memoized VehicleCard component for optimal FlatList performance
const VehicleCard = React.memo(
  ({
    vehicle,
    onPress,
  }: {
    vehicle: Vehicle;
    onPress: (vehicle: Vehicle) => void;
  }) => {
    const handlePress = useCallback(() => onPress(vehicle), [onPress, vehicle]);

    return (
      <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
        <View style={styles.vehicleCard}>
          {/* Header row with plate number */}
          <View style={styles.cardHeader}>
            <View style={styles.plateNumberContainer}>
              <Text style={styles.plateNumber}>
                {vehicle.plate_number ||
                  vehicle.chassis_number ||
                  vehicle.registration_number ||
                  "N/A"}
              </Text>
            </View>
          </View>

          {/* Compact Info Row */}
          <View style={styles.compactInfoRow}>
            <Text style={styles.driverName} numberOfLines={1}>{vehicle.driver_name}</Text>
            <Text style={styles.dotSeparator}>•</Text>
            <Text style={styles.vehicleType}>{vehicle.vehicle_type}</Text>
            <Text style={styles.dotSeparator}>•</Text>
            <Text style={styles.engineType}>{vehicle.engine_type}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  },

  (prevProps, nextProps) => {
    // Custom comparison for optimal re-rendering
    return (
      prevProps.vehicle.id === nextProps.vehicle.id &&
      prevProps.vehicle.plate_number === nextProps.vehicle.plate_number &&
      prevProps.vehicle.driver_name === nextProps.vehicle.driver_name &&
      prevProps.vehicle.vehicle_type === nextProps.vehicle.vehicle_type &&
      prevProps.vehicle.engine_type === nextProps.vehicle.engine_type &&
      prevProps.vehicle.wheels === nextProps.vehicle.wheels
    );
  }
);

const FilterDialog = React.memo(
  ({
    visible,
    onDismiss,
    dropdownData,
    initialValues,
    onApply,
    renderRightIcon,
    renderItem,
  }: FilterDialogProps) => {
    const [filters, setFilters] = useState<FilterValues>(initialValues);

    React.useEffect(() => {
      if (visible) {
        setFilters(initialValues);
      }
    }, [visible, initialValues]);

    const handleChange = useCallback(
      (key: keyof FilterValues) => (item: DropdownOption | any) => {
        setFilters((prev) => ({ ...prev, [key]: item.value }));
      },
      []
    );

    const renderOption = useCallback(
      (item: DropdownOption | any, selected?: boolean) =>
        renderItem(item as DropdownOption, selected),
      [renderItem]
    );

    const handleReset = useCallback(() => {
      setFilters({ vehicleType: "", engineType: "", office: "" });
    }, []);

    const handleApply = useCallback(() => {
      onApply(filters);
    }, [filters, onApply]);

    return (
      <Portal>
        <Dialog
          visible={visible}
          onDismiss={onDismiss}
          style={styles.dialog}
          dismissable
        >
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogTitleText}>Filter Vehicles</Text>
            <TouchableOpacity onPress={onDismiss}>
              <Icon name="X" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.dialogContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Vehicle Type</Text>
                <Dropdown
                  data={dropdownData.vehicleTypes}
                  labelField="label"
                  valueField="value"
                  placeholder="Select vehicle type"
                  value={filters.vehicleType}
                  onChange={handleChange("vehicleType")}
                  style={styles.dropdown}
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownSelectedText}
                  containerStyle={styles.dropdownContainer}
                  maxHeight={300}
                  renderRightIcon={renderRightIcon}
                  renderItem={renderOption}
                />
              </View>

              <Divider style={styles.divider} />

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Engine Type</Text>
                <Dropdown
                  data={dropdownData.engineTypes}
                  labelField="label"
                  valueField="value"
                  placeholder="Select engine type"
                  value={filters.engineType}
                  onChange={handleChange("engineType")}
                  style={styles.dropdown}
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownSelectedText}
                  containerStyle={styles.dropdownContainer}
                  maxHeight={300}
                  renderRightIcon={renderRightIcon}
                  renderItem={renderOption}
                />
              </View>

              <Divider style={styles.divider} />

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Office</Text>
                <Dropdown
                  data={dropdownData.offices}
                  labelField="label"
                  valueField="value"
                  placeholder="Select office"
                  value={filters.office}
                  onChange={handleChange("office")}
                  style={styles.dropdown}
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownSelectedText}
                  containerStyle={styles.dropdownContainer}
                  maxHeight={300}
                  renderRightIcon={renderRightIcon}
                  renderItem={renderOption}
                />
              </View>
            </ScrollView>
          </View>

          <Dialog.Actions style={styles.dialogActions}>
            <View style={styles.dialogActionsContent}>
              <Button
                mode="outlined"
                onPress={handleReset}
                style={styles.dialogButtonOutlined}
                textColor="#64748B"
              >
                Reset
              </Button>
              <Button
                mode="contained"
                onPress={handleApply}
                style={styles.dialogButtonContained}
                buttonColor="#1E40AF"
              >
                Apply Filters
              </Button>
            </View>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  }
);


const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    padding: 0,
    fontWeight: "600",
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#60A5FA",
    borderWidth: 1.5,
    borderColor: "#1E40AF",
  },
  activeFiltersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  activeFiltersContent: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  activeFilterChip: {
    backgroundColor: "#1E40AF",
    borderWidth: 0,
    borderRadius: 8,
    height: 28,
  },
  activeFilterText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  clearAllButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  clearAllText: {
    fontSize: 11,
    color: "#1E40AF",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  summaryText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "700",
  },
  listContainer: {
    padding: 16,
    paddingTop: 4,
    paddingBottom: 100,
    flexGrow: 1,
  },
  vehicleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  plateNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  plateNumber: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  compactInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  driverName: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "700",
    maxWidth: "45%",
  },
  dotSeparator: {
    marginHorizontal: 4,
    color: "#CBD5E1",
    fontSize: 10,
  },
  vehicleType: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  engineType: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 30,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    color: "#0F172A",
    marginBottom: 12,
    fontWeight: "800",
  },
  emptyText: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    fontWeight: "600",
  },
  emptyButton: {
    borderRadius: 14,
    paddingHorizontal: 24,
    height: 48,
    justifyContent: "center",
  },
  dialog: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    maxWidth: 500,
    alignSelf: "center",
    width: "90%",
  },
  dialogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  dialogTitleText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  dialogContent: {
    maxHeight: 400,
  },
  filterSection: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 10,
  },
  dropdown: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600",
  },
  dropdownSelectedText: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
  },
  dropdownContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dropdownItem: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },
  divider: {
    backgroundColor: "#F1F5F9",
    height: 1,
  },
  dialogActions: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  dialogActionsContent: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  dialogButtonOutlined: {
    flex: 1,
    borderRadius: 14,
    borderColor: "#E2E8F0",
    borderWidth: 1,
  },
  dialogButtonContained: {
    flex: 1,
    borderRadius: 14,
  },
});
