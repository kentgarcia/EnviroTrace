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
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../../components/icons/Icon";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import StandardHeader from "../../../../components/layout/StandardHeader";

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
  testResult: string;
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
    testResults: DropdownOption[];
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
  const [filterTestResult, setFilterTestResult] = useState<string>("");
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

    // For test results, we need to determine from actual vehicles
    const testResults = new Set<string>();
    vehicles.forEach((vehicle) => {
      if (vehicle.latest_test_result === true) {
        testResults.add("passed");
      } else if (vehicle.latest_test_result === false) {
        testResults.add("failed");
      } else {
        testResults.add("not-tested");
      }
    });

    return {
      vehicleTypes,
      engineTypes,
      offices,
      testResults: Array.from(testResults).sort(),
    };
  }, [filterOptions, vehicles]);

  // Format data for Dropdown component
  const dropdownData = useMemo(() => {
    const testResultLabels: Record<string, string> = {
      passed: "Passed",
      failed: "Failed",
      "not-tested": "Not Tested",
    };

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
      testResults: [
        { label: "All Results", value: "" },
        ...dropdownFilterOptions.testResults.map((result) => ({
          label: testResultLabels[result] || result,
          value: result,
        })),
      ],
    };
  }, [dropdownFilterOptions]);

  // Filter vehicles based on test result (client-side filtering since API doesn't support it)
  const filteredVehicles = useMemo(() => {
    let filtered = vehicles;

    // Apply test result filter (client-side)
    if (filterTestResult) {
      if (filterTestResult === "passed") {
        filtered = filtered.filter(
          (vehicle) => vehicle.latest_test_result === true
        );
      } else if (filterTestResult === "failed") {
        filtered = filtered.filter(
          (vehicle) => vehicle.latest_test_result === false
        );
      } else if (filterTestResult === "not-tested") {
        filtered = filtered.filter(
          (vehicle) => vehicle.latest_test_result === undefined || vehicle.latest_test_result === null
        );
      }
    }

    // Apply office filter if not already in API filters
    if (filterOffice && !filters.office_name) {
      filtered = filtered.filter(
        (vehicle) => vehicle.office?.name === filterOffice
      );
    }

    return filtered;
  }, [vehicles, filterTestResult, filterOffice, filters.office_name]);

  // Optimized handlers using useCallback to prevent recreation on every render
  const handleApplyFilters = useCallback(
    (filters: FilterValues) => {
      setFilterVehicleType(filters.vehicleType);
      setFilterEngineType(filters.engineType);
      setFilterTestResult(filters.testResult);
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
      testResult: filterTestResult,
      office: filterOffice,
    }),
    [filterVehicleType, filterEngineType, filterTestResult, filterOffice]
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
      <Icon name="Car" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No vehicles found</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? "Try adjusting your search"
          : "Add your first vehicle to get started"}
      </Text>
      {!searchQuery && (
        <Button
          mode="contained"
          onPress={handleAddVehicle}
          style={styles.emptyButton}
          buttonColor="#111827"
        >
          Add Vehicle
        </Button>
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      <StandardHeader
        title="Vehicles"
        subtitle={`${filteredVehicles.length} Total`}
        statusBarStyle="dark"
        backgroundColor="rgba(255, 255, 255, 0.95)"
        borderColor="#E5E7EB"
        rightActionIcon="RefreshCw"
        onRightActionPress={() => refetch()}
        titleSize={22}
        subtitleSize={12}
        iconSize={20}
      />

      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        {/* Search bar with filter button */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="Search" size={18} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by plate, driver, or type..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Icon name="X" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Icon name="Filter" size={20} color="#FFFFFF" />
            {(filterVehicleType || filterEngineType || filterTestResult || filterOffice) && (
              <View style={styles.filterBadge} />
            )}
          </TouchableOpacity>
        </View>

        {/* Active filters */}
        {(filterVehicleType || filterEngineType || filterTestResult || filterOffice) && (
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
              {filterTestResult && (
                <Chip
                  compact
                  mode="flat"
                  onClose={() => setFilterTestResult("")}
                  style={styles.activeFilterChip}
                  textStyle={styles.activeFilterText}
                >
                  {filterTestResult === "passed"
                    ? "Passed"
                    : filterTestResult === "failed"
                      ? "Failed"
                      : "Not Tested"}
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
                  setFilterTestResult("");
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
          <TouchableOpacity
            onPress={handleAddVehicle}
            style={styles.addButton}
          >
            <Icon name="Plus" size={16} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
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
              colors={["#111827"]}
              tintColor="#111827"
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
      </SafeAreaView>

      <FilterDialog
        visible={filterModalVisible}
        onDismiss={() => setFilterModalVisible(false)}
        dropdownData={dropdownData}
        initialValues={filterDialogInitialValues}
        onApply={handleApplyFilters}
        renderRightIcon={renderChevronIcon}
        renderItem={renderDropdownItem}
      />
    </View>
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

    // Calculate quarter and year from latest test date
    const testInfo = useMemo(() => {
      if (!vehicle.latest_test_date) return null;
      const date = new Date(vehicle.latest_test_date);
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const year = date.getFullYear();
      return { quarter, year };
    }, [vehicle.latest_test_date]);

    return (
      <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
        <View style={styles.vehicleCard}>
          {/* Header row with plate number and status */}
          <View style={styles.cardHeader}>
            <View style={styles.plateNumberContainer}>
              <Text style={styles.plateNumber}>{vehicle.plate_number}</Text>
            </View>
            {vehicle.latest_test_result !== undefined && vehicle.latest_test_result !== null && (
              <Chip
                compact
                icon={() => (
                  <Icon
                    name={
                      vehicle.latest_test_result ? "CheckCircle2" : "AlertCircle"
                    }
                    size={12}
                    color={vehicle.latest_test_result ? "#16A34A" : "#DC2626"}
                  />
                )}
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: vehicle.latest_test_result
                      ? "#DCFCE7"
                      : "#FEE2E2",
                  },
                ]}
                textStyle={[
                  styles.statusChipText,
                  { color: vehicle.latest_test_result ? "#16A34A" : "#DC2626" },
                ]}
              >
                {vehicle.latest_test_result ? "Pass" : "Fail"}
                {testInfo && ` • Q${testInfo.quarter} ${testInfo.year}`}
              </Chip>
            )}
          </View>

          {/* Driver name */}
          <Text style={styles.driverName}>{vehicle.driver_name}</Text>

          {/* Vehicle details in compact grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Icon name="Car" size={12} color="#6B7280" />
              <Text style={styles.detailText}>{vehicle.vehicle_type}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="Settings" size={12} color="#6B7280" />
              <Text style={styles.detailText}>{vehicle.engine_type}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="CirclePlus" size={12} color="#6B7280" />
              <Text style={styles.detailText}>{vehicle.wheels}w</Text>
            </View>
          </View>

          {/* Last test date if available */}
          {vehicle.latest_test_date && (
            <View style={styles.lastTestRow}>
              <Icon name="CalendarDays" size={11} color="#9CA3AF" />
              <Text style={styles.lastTestText}>
                {new Date(vehicle.latest_test_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
          )}
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
      prevProps.vehicle.wheels === nextProps.vehicle.wheels &&
      prevProps.vehicle.latest_test_result === nextProps.vehicle.latest_test_result &&
      prevProps.vehicle.latest_test_date === nextProps.vehicle.latest_test_date
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
      setFilters({ vehicleType: "", engineType: "", testResult: "", office: "" });
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

              <Divider style={styles.divider} />

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Test Result</Text>
                <Dropdown
                  data={dropdownData.testResults}
                  labelField="label"
                  valueField="value"
                  placeholder="Select test result"
                  value={filters.testResult}
                  onChange={handleChange("testResult")}
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
            <SafeAreaView edges={["bottom"]} style={styles.dialogActionsContent}>
              <Button
                mode="outlined"
                onPress={handleReset}
                style={styles.dialogButtonOutlined}
                textColor="#6B7280"
              >
                Reset
              </Button>
              <Button
                mode="contained"
                onPress={handleApply}
                style={styles.dialogButtonContained}
                buttonColor="#111827"
              >
                Apply Filters
              </Button>
            </SafeAreaView>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  }
);


const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    padding: 0,
    fontWeight: "500",
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#60A5FA",
  },
  activeFiltersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  activeFiltersContent: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  activeFilterChip: {
    backgroundColor: "#111827",
    borderWidth: 0,
  },
  activeFilterText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  summaryText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#111827",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  addButtonText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 32,
    flexGrow: 1,
  },
  vehicleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
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
    color: "#111827",
    letterSpacing: 0.2,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F59E0B",
  },
  statusChip: {
    height: 22,
    borderRadius: 6,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: "700",
    marginVertical: 0,
    marginHorizontal: 0,
  },
  driverName: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 8,
    fontWeight: "600",
  },
  detailsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  lastTestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  lastTestText: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 19,
    color: "#111827",
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
    fontWeight: "500",
  },
  emptyButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  dialog: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
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
    color: "#111827",
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
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  dropdown: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  dropdownSelectedText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  dropdownContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dropdownItem: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  radioLabel: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 8,
  },
  divider: {
    backgroundColor: "#E5E7EB",
    height: 1,
  },
  dialogActions: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
    paddingBottom: 0,
  },
  dialogActionsContent: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  dialogButtonOutlined: {
    flex: 1,
    borderRadius: 12,
    borderColor: "#D1D5DB",
    borderWidth: 1.5,
  },
  dialogButtonContained: {
    flex: 1,
    borderRadius: 12,
  },
});
