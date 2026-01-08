import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ScrollView,
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
import Icon from "../../../components/icons/Icon";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ScreenLayout from "../../../components/layout/ScreenLayout";
import FloatingActionButton from "../../../components/FloatingActionButton";
import { useQuery } from "@tanstack/react-query";
import { treeInventoryApi, TreeInventory, TreeFilters } from "../../../core/api/tree-inventory-api";

type FilterValues = {
  status: string;
  health: string;
};

type DropdownOption = {
  label: string;
  value: string;
};

type FilterDialogProps = {
  visible: boolean;
  onDismiss: () => void;
  dropdownData: {
    statuses: DropdownOption[];
    healthLevels: DropdownOption[];
  };
  initialValues: FilterValues;
  onApply: (filters: FilterValues) => void;
  renderRightIcon: (visible?: boolean) => React.ReactElement | null;
  renderItem: (item: DropdownOption, selected?: boolean) => React.ReactElement | null;
};

export default function TreeInventoryScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterHealth, setFilterHealth] = useState<string>("");

  // Build filters object for API
  const filters: TreeFilters = useMemo(() => {
    const result: TreeFilters = { limit: 500 }; // Backend max is 500
    if (searchQuery) result.search = searchQuery;
    if (filterStatus) result.status = filterStatus;
    if (filterHealth) result.health = filterHealth;
    return result;
  }, [searchQuery, filterStatus, filterHealth]);

  // Fetch data from API
  const {
    data: treesResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tree-inventory", filters],
    queryFn: async () => {
      try {
        console.log("Fetching trees with filters:", filters);
        const response = await treeInventoryApi.getTrees(filters);
        console.log("Tree inventory response:", response);
        console.log("Number of trees:", response?.data?.length || 0);
        return response;
      } catch (err) {
        console.error("Error fetching trees:", err);
        if (err instanceof Error) {
          console.error("Error message:", err.message);
        }
        throw err;
      }
    },
    staleTime: 60_000,
  });

  const trees = treesResponse?.data || [];
  
  // Log error if present
  React.useEffect(() => {
    if (error) {
      console.error("Query error:", error);
    }
  }, [error]);

  // Get filter options from data
  const dropdownData = useMemo(() => {
    return {
      statuses: [
        { label: "All Status", value: "" },
        { label: "Alive", value: "alive" },
        { label: "Cut", value: "cut" },
        { label: "Dead", value: "dead" },
        { label: "Replaced", value: "replaced" },
      ],
      healthLevels: [
        { label: "All Health", value: "" },
        { label: "Healthy", value: "healthy" },
        { label: "Needs Attention", value: "needs_attention" },
        { label: "Diseased", value: "diseased" },
        { label: "Dead", value: "dead" },
      ],
    };
  }, []);

  // Optimized handlers using useCallback
  const handleApplyFilters = useCallback(
    (filters: FilterValues) => {
      setFilterStatus(filters.status);
      setFilterHealth(filters.health);
      setFilterModalVisible(false);
    },
    []
  );

  // Memoized render functions for Dropdown
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

  const filterDialogInitialValues = useMemo(
    () => ({
      status: filterStatus,
      health: filterHealth,
    }),
    [filterStatus, filterHealth]
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

  const handleTreePress = useCallback(
    (tree: TreeInventory) => {
      (navigation as any).navigate("TreeDetail", { treeId: tree.id });
    },
    [navigation]
  );

  const handleAddTree = () => {
    navigation.navigate("TreeForm" as never);
  };

  const renderTreeCard = useCallback(
    ({ item }: { item: TreeInventory }) => (
      <TreeCard tree={item} onPress={handleTreePress} />
    ),
    [handleTreePress]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Icon name="TreePalm" size={48} color="#059669" />
      </View>
      <Text style={styles.emptyTitle}>
        {error ? "Error loading trees" : "No trees found"}
      </Text>
      <Text style={styles.emptyText}>
        {error
          ? `Failed to load tree inventory. Please check your connection and try again.`
          : searchQuery
          ? "Try adjusting your search or filters"
          : "Add your first tree to start tracking"}
      </Text>
      {error ? (
        <Button
          mode="contained"
          onPress={() => refetch()}
          style={styles.emptyButton}
          buttonColor="#DC2626"
        >
          Retry
        </Button>
      ) : !searchQuery ? (
        <Button
          mode="contained"
          onPress={handleAddTree}
          style={styles.emptyButton}
          buttonColor="#059669"
        >
          Add Tree
        </Button>
      ) : null}
    </View>
  );

  return (
    <ScreenLayout
      header={{
        title: "Tree Inventory",
        subtitle: isLoading ? "Loading..." : `${trees.length} Total Trees`,
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
            placeholder="Search by code, species, or location..."
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
          {(filterStatus || filterHealth) && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
      </View>

      {/* Active filters */}
      {(filterStatus || filterHealth) && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeFiltersContent}
          >
            {filterStatus && (
              <Chip
                compact
                mode="flat"
                onClose={() => setFilterStatus("")}
                style={styles.activeFilterChip}
                textStyle={styles.activeFilterText}
              >
                {filterStatus}
              </Chip>
            )}
            {filterHealth && (
              <Chip
                compact
                mode="flat"
                onClose={() => setFilterHealth("")}
                style={styles.activeFilterChip}
                textStyle={styles.activeFilterText}
              >
                {filterHealth.replace("_", " ")}
              </Chip>
            )}
            <TouchableOpacity
              onPress={() => {
                setFilterStatus("");
                setFilterHealth("");
              }}
              style={styles.clearAllButton}
            >
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Tree count summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          {trees.length} tree{trees.length !== 1 ? "s" : ""}
          {searchQuery && " found"}
        </Text>
      </View>

      <FlatList
        data={trees}
        renderItem={renderTreeCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={["#059669"]}
            tintColor="#059669"
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

      <FloatingActionButton onPress={handleAddTree} />

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

// Memoized TreeCard component for optimal FlatList performance
const TreeCard = React.memo(
  ({
    tree,
    onPress,
  }: {
    tree: TreeInventory;
    onPress: (tree: TreeInventory) => void;
  }) => {
    const handlePress = useCallback(() => onPress(tree), [onPress, tree]);

    const getHealthColor = (health: string) => {
      switch (health) {
        case "healthy":
          return { bg: "#DCFCE7", text: "#059669" };
        case "needs_attention":
          return { bg: "#FEF3C7", text: "#D97706" };
        case "diseased":
          return { bg: "#FEE2E2", text: "#DC2626" };
        case "dead":
          return { bg: "#F3F4F6", text: "#6B7280" };
        default:
          return { bg: "#F3F4F6", text: "#6B7280" };
      }
    };

    const healthColors = getHealthColor(tree.health);

    return (
      <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
        <View style={styles.treeCard}>
          {/* Header row with tree code */}
          <View style={styles.cardHeader}>
            <View style={styles.treeCodeContainer}>
              <Text style={styles.treeCode}>{tree.tree_code}</Text>
            </View>
            <Chip
              style={[styles.healthChip, { backgroundColor: healthColors.bg }]}
              textStyle={[styles.healthText, { color: healthColors.text }]}
              compact
            >
              {tree.health.replace("_", " ")}
            </Chip>
          </View>

          {/* Compact Info Row */}
          <View style={styles.compactInfoRow}>
            <Text style={styles.species} numberOfLines={1}>
              {tree.species}
            </Text>
            {tree.common_name && (
              <>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.commonName} numberOfLines={1}>
                  {tree.common_name}
                </Text>
              </>
            )}
          </View>

          {/* Location row */}
          {(tree.address || tree.barangay) && (
            <View style={styles.locationRow}>
              <Icon name="MapPin" size={12} color="#64748B" />
              <Text style={styles.locationText} numberOfLines={1}>
                {tree.address || tree.barangay}
              </Text>
            </View>
          )}

          {/* Details row */}
          <View style={styles.detailsRow}>
            {tree.height_meters && (
              <View style={styles.detailItem}>
                <Icon name="ArrowUpFromLine" size={12} color="#64748B" />
                <Text style={styles.detailText}>{tree.height_meters}m</Text>
              </View>
            )}
            {tree.diameter_cm && (
              <View style={styles.detailItem}>
                <Icon name="Circle" size={12} color="#64748B" />
                <Text style={styles.detailText}>{tree.diameter_cm}cm</Text>
              </View>
            )}
            <View style={styles.detailItem}>
              <Icon name="Leaf" size={12} color="#64748B" />
              <Text style={styles.detailText}>{tree.status}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },

  (prevProps, nextProps) => {
    return (
      prevProps.tree.id === nextProps.tree.id &&
      prevProps.tree.tree_code === nextProps.tree.tree_code &&
      prevProps.tree.health === nextProps.tree.health &&
      prevProps.tree.status === nextProps.tree.status
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
      setFilters({ status: "", health: "" });
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
            <Text style={styles.dialogTitleText}>Filter Trees</Text>
            <TouchableOpacity onPress={onDismiss}>
              <Icon name="X" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.dialogContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Status</Text>
                <Dropdown
                  data={dropdownData.statuses}
                  labelField="label"
                  valueField="value"
                  placeholder="Select status"
                  value={filters.status}
                  onChange={handleChange("status")}
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
                <Text style={styles.filterLabel}>Health</Text>
                <Dropdown
                  data={dropdownData.healthLevels}
                  labelField="label"
                  valueField="value"
                  placeholder="Select health level"
                  value={filters.health}
                  onChange={handleChange("health")}
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
                buttonColor="#059669"
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
    backgroundColor: "#059669",
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
    backgroundColor: "#10B981",
    borderWidth: 1.5,
    borderColor: "#059669",
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
    backgroundColor: "#059669",
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
    color: "#059669",
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
  treeCard: {
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
  treeCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  treeCode: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  healthChip: {
    height: 28,
  },
  healthText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  compactInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  species: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "700",
    maxWidth: "50%",
  },
  dotSeparator: {
    marginHorizontal: 4,
    color: "#CBD5E1",
    fontSize: 10,
  },
  commonName: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    flex: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    flex: 1,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "capitalize",
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
    backgroundColor: "#ECFDF5",
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

