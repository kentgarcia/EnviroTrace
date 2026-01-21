import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, RefreshControl, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { Text, Button, Divider, ActivityIndicator, Chip } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "../../../../components/icons/Icon";
import ScreenLayout from "../../../../components/layout/ScreenLayout";
import FloatingActionButton from "../../../../components/FloatingActionButton";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { cardStyles } from "../../../../styles/cardStyles";
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
    <ScreenLayout
      header={{
        title: "Emission Testing",
        subtitle: `${items.length} Total Tests Recorded`,
                titleSize: 22,

        statusBarStyle: "dark",
        rightActionIcon: "RefreshCw",
        onRightActionPress: () => refetchTests(),
        showProfileAction: true,
      }}
    >
        {/* Filter Section */}
        <View style={styles.filterWrapper}>
          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Icon name="Calendar" size={18} color="#1E40AF" />
              <Text style={styles.filterTitle}>Testing Period</Text>
            </View>

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
            <ActivityIndicator size="large" color="#1E40AF" />
          </View>
        ) : groups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Icon name="ClipboardList" size={48} color="#1E40AF" />
            </View>
            <Text style={styles.emptyTitle}>No Tests This Period</Text>
            <Text style={styles.emptyText}>
              No emission tests recorded for Q{quarter} {year}
            </Text>
            <Button
              mode="contained"
              onPress={() => (navigation as any).navigate("Vehicles")}
              style={styles.emptyButton}
              labelStyle={styles.emptyButtonLabel}
              buttonColor="#1E40AF"
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
                colors={["#1E40AF"]}
                tintColor="#1E40AF"
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
                    <View style={styles.officeIconContainer}>
                      <Icon name="Building2" size={18} color="#1E40AF" />
                    </View>
                    <Text style={styles.officeName}>{group.name}</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>{group.items.length}</Text>
                    </View>
                  </View>
                  <Icon
                    name="ChevronDown"
                    size={20}
                    color="#64748B"
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
                              {item.vehicle?.plate_number ||
                                item.vehicle?.chassis_number ||
                                item.vehicle?.registration_number ||
                                "Unknown"}
                            </Text>
                            <View style={styles.vehicleInfoRow}>
                              <Icon name="Car" size={12} color="#64748B" />
                              <Text style={styles.vehicleType}>
                                {item.vehicle?.vehicle_type || "N/A"} • {item.vehicle?.engine_type || "N/A"}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor:
                                  item.test.result === null
                                    ? "#FEF3C7"
                                    : item.test.result
                                      ? "#DCFCE7"
                                      : "#FEE2E2",
                              },
                            ]}
                          >
                            <Text 
                              style={[
                                styles.statusBadgeText,
                                {
                                  color:
                                    item.test.result === null
                                      ? "#D97706"
                                      : item.test.result
                                        ? "#16A34A"
                                        : "#DC2626",
                                }
                              ]}
                            >
                              {item.test.result === null ? "Pending" : item.test.result ? "Pass" : "Fail"}
                            </Text>
                          </View>
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

        <FloatingActionButton
          onPress={() => (navigation as any).navigate("AddTest")}
        />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  filterWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
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
    color: "#64748B",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dropdown: {
    height: 44,
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
  },
  dropdownSelectedText: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
  },
  dropdownContainer: {
    borderRadius: 12,
    borderColor: "#E2E8F0",
    marginTop: 4,
    overflow: "hidden",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#0F172A",
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
    borderRadius: 10,
    backgroundColor: "#1E40AF",
    alignItems: "center",
    justifyContent: "center",
  },
  yearDisplay: {
    flex: 1,
    alignItems: "center",
  },
  yearText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  scrollView: {
    flex: 1,
  },
  officeSection: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
  },
  officeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  officeHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  officeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  officeName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },
  countBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  testsList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  testItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  testInfo: {
    flex: 1,
    marginRight: 12,
  },
  plateNumber: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  vehicleInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  vehicleType: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  divider: {
    backgroundColor: "#F1F5F9",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 30,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
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
  emptyButtonLabel: {
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 6,
  },
  bottomSpacer: {
    height: 120,
  },
});
