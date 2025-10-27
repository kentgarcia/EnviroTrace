import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, RefreshControl, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { Text, Button, Divider, ActivityIndicator, Chip } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../../components/icons/Icon";
import StandardHeader from "../../../../components/layout/StandardHeader";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  useEmissionTests,
  useVehicles,
  EmissionTest,
  Vehicle,
} from "../../../../core/api/emission-service";

type TestWithVehicle = { test: EmissionTest; vehicle: Vehicle | null };

export default function TestingScreen() {
  const navigation = useNavigation();

  const now = new Date();
  const defaultQuarter = useMemo(() => Math.floor(now.getMonth() / 3) + 1, [now]);
  const defaultYear = useMemo(() => now.getFullYear(), [now]);
  const [quarter, setQuarter] = useState<number>(defaultQuarter);
  const [year, setYear] = useState<number>(defaultYear);

  const [expandedByOffice, setExpandedByOffice] = useState<Record<string, boolean>>({});

  // Fetch tests and vehicles from API
  const {
    data: tests = [],
    isLoading: loadingTests,
    refetch: refetchTests,
  } = useEmissionTests(
    { quarter, year },
    {
      enabled: true, // Always enabled
      refetchOnMount: true, // Refetch when component mounts
      staleTime: 0, // Consider data stale immediately so it refetches on param change
    }
  );

  const {
    data: vehiclesData,
    isLoading: loadingVehicles,
  } = useVehicles({}, 0, 1000);

  const vehicles = useMemo(() => vehiclesData?.vehicles || [], [vehiclesData]);

  const loading = loadingTests || loadingVehicles;

  // Combine tests with vehicle data
  const items = useMemo<TestWithVehicle[]>(() => {
    return tests.map((test) => ({
      test,
      vehicle: vehicles.find((v) => v.id === test.vehicle_id) || null,
    }));
  }, [tests, vehicles]);

  const onRefresh = async () => {
    await refetchTests();
  };

  const groups = useMemo(() => {
    const map = new Map<string, { key: string; name: string; items: typeof items }>();
    for (const it of items) {
      const officeName = it.vehicle?.office?.name || "Unknown Office";
      const officeId = it.vehicle?.office_id || `unknown:${officeName}`;
      const key = officeId;
      if (!map.has(key)) map.set(key, { key, name: officeName, items: [] as any });
      map.get(key)!.items.push(it);
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  useEffect(() => {
    setExpandedByOffice((prev) => {
      const newKeys = groups.filter(g => prev[g.key] === undefined);
      if (newKeys.length === 0) return prev; // No changes, return same reference

      const next = { ...prev };
      for (const g of newKeys) next[g.key] = true;
      return next;
    });
  }, [groups]);

  return (
    <>
      <StandardHeader
        title="Emission Testing"
        subtitle={`${items.length} Total Tests`}
        statusBarStyle="dark"
        backgroundColor="rgba(255, 255, 255, 0.95)"
        borderColor="#E5E7EB"
        rightActionIcon="RefreshCw"
        onRightActionPress={() => refetchTests()}
        titleSize={22}
        subtitleSize={12}
        iconSize={20}
      />

      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        {/* Filter Section */}
        <View style={styles.filterWrapper}>
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Testing Period</Text>

            {/* Quarter and Year on Same Row */}
            <View style={styles.periodRow}>
              {/* Quarter Dropdown */}
              <View style={styles.quarterDropdownContainer}>
                <Text style={styles.inputLabel}>Quarter</Text>
                <Dropdown
                  data={[
                    { label: "Q1", value: 1 },
                    { label: "Q2", value: 2 },
                    { label: "Q3", value: 3 },
                    { label: "Q4", value: 4 },
                  ]}
                  value={quarter}
                  onChange={(item) => setQuarter(item.value)}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Quarter"
                  style={styles.dropdown}
                  selectedTextStyle={styles.dropdownSelectedText}
                  placeholderStyle={styles.dropdownPlaceholder}
                  containerStyle={styles.dropdownContainer}
                  itemTextStyle={styles.dropdownItemText}
                  renderLeftIcon={() => (
                    <Icon name="Calendar" size={16} color="#6B7280" style={{ marginRight: 8 }} />
                  )}
                />
              </View>

              {/* Year Controls */}
              <View style={styles.yearControlContainer}>
                <Text style={styles.inputLabel}>Year</Text>
                <View style={styles.yearRow}>
                  <TouchableOpacity
                    onPress={() => setYear((y) => y - 1)}
                    style={styles.yearButton}
                    activeOpacity={0.7}
                  >
                    <Icon name="ChevronLeft" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.yearDisplay}>
                    <Text style={styles.yearText}>{year}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setYear((y) => y + 1)}
                    style={styles.yearButton}
                    activeOpacity={0.7}
                  >
                    <Icon name="ChevronRight" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#111827" />
          </View>
        ) : groups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="ClipboardList" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Tests This Period</Text>
            <Text style={styles.emptyText}>
              No emission tests recorded for Q{quarter} {year}
            </Text>
            <Button
              mode="contained"
              onPress={() => (navigation as any).navigate("Vehicles")}
              style={styles.emptyButton}
              labelStyle={styles.emptyButtonLabel}
              icon={() => <Icon name="Plus" size={20} color="#FFFFFF" />}
            >
              Record New Test
            </Button>
          </View>
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={onRefresh}
                colors={["#111827"]}
                tintColor="#111827"
              />
            }
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {groups.map((group) => (
              <View key={group.key} style={styles.officeSection}>
                {/* Office Header */}
                <TouchableOpacity
                  style={styles.officeHeader}
                  onPress={() =>
                    setExpandedByOffice((prev) => ({ ...prev, [group.key]: !prev[group.key] }))
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.officeHeaderLeft}>
                    <Icon name="Building2" size={18} color="#111827" />
                    <Text style={styles.officeName}>{group.name}</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>{group.items.length}</Text>
                    </View>
                  </View>
                  <Icon
                    name="ChevronDown"
                    size={20}
                    color="#6B7280"
                    style={{
                      transform: [{ rotate: expandedByOffice[group.key] ? "0deg" : "-90deg" }],
                    }}
                  />
                </TouchableOpacity>

                {/* Office Tests List */}
                {expandedByOffice[group.key] && (
                  <View style={styles.testsList}>
                    {group.items.map((item, idx) => (
                      <View key={item.test.id}>
                        <View style={styles.testItem}>
                          <View style={styles.testInfo}>
                            <Text style={styles.plateNumber}>
                              {item.vehicle?.plate_number || "Unknown"}
                            </Text>
                            <Text style={styles.vehicleType}>
                              {item.vehicle?.vehicle_type || "N/A"} • {item.vehicle?.engine_type || "N/A"}
                            </Text>
                          </View>
                          <Chip
                            compact
                            style={[
                              styles.statusChip,
                              {
                                backgroundColor:
                                  item.test.result === null
                                    ? "#F59E0B"
                                    : item.test.result
                                      ? "#16A34A"
                                      : "#E72525",
                              },
                            ]}
                            textStyle={styles.statusChipText}
                          >
                            {item.test.result === null ? "Pending" : item.test.result ? "Pass" : "Fail"}
                          </Chip>
                        </View>
                        {idx < group.items.length - 1 && <Divider style={styles.divider} />}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
            <View style={styles.bottomSpacer} />
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
  filterWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  filterSection: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  filterTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  periodRow: {
    flexDirection: "row",
    gap: 12,
  },
  quarterDropdownContainer: {
    flex: 1,
  },
  yearControlContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  dropdown: {
    height: 44,
    borderColor: "#E5E7EB",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  dropdownPlaceholder: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  dropdownSelectedText: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
  },
  dropdownContainer: {
    borderRadius: 10,
    borderColor: "#E5E7EB",
    marginTop: 4,
  },
  dropdownItemText: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "500",
  },
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
  },
  yearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  yearDisplay: {
    flex: 1,
    alignItems: "center",
  },
  yearText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 28,
    fontWeight: "500",
  },
  emptyButton: {
    backgroundColor: "#111827",
    borderRadius: 12,
    elevation: 2,
    paddingHorizontal: 8,
  },
  emptyButtonLabel: {
    fontSize: 15,
    fontWeight: "700",
    paddingVertical: 6,
    letterSpacing: -0.2,
  },
  scrollView: {
    flex: 1,
  },
  officeSection: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  officeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  officeHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  officeName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    letterSpacing: -0.2,
  },
  countBadge: {
    backgroundColor: "#111827",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  testsList: {
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  testItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  testInfo: {
    flex: 1,
    marginRight: 12,
  },
  plateNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  vehicleType: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  statusChip: {
    elevation: 0,
  },
  statusChipText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  divider: {
    backgroundColor: "#E5E7EB",
  },
  bottomSpacer: {
    height: 120,
  },
});
