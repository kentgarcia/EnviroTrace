import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, RefreshControl, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { Text, Button, Divider, ActivityIndicator, Chip } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../../components/icons/Icon";
import StandardHeader from "../../../../components/layout/StandardHeader";
import { database, LocalEmissionTest, LocalVehicle } from "../../../../core/database/database";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useNetworkSync } from "../../../../hooks/useNetworkSync";

type TestWithVehicle = { test: LocalEmissionTest; vehicle: LocalVehicle | null };

export default function TestingScreen() {
  const navigation = useNavigation();
  const { syncData, isSyncing } = useNetworkSync();

  const now = new Date();
  const defaultQuarter = useMemo(() => Math.floor(now.getMonth() / 3) + 1, [now]);
  const defaultYear = useMemo(() => now.getFullYear(), [now]);
  const [quarter, setQuarter] = useState<number>(defaultQuarter);
  const [year, setYear] = useState<number>(defaultYear);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<TestWithVehicle[]>([]);
  const [expandedByOffice, setExpandedByOffice] = useState<Record<string, boolean>>({});

  const load = async () => {
    try {
      setLoading(true);
      const tests = await database.getEmissionTests({ quarter, year, limit: 500 });
      const vehicles = await Promise.all(
        tests.map(async (t) => ({ test: t, vehicle: await database.getVehicleById(t.vehicle_id) }))
      );
      setItems(vehicles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quarter, year]);

  useFocusEffect(
    React.useCallback(() => {
      load();
      return () => { };
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await syncData();
    await load();
    setRefreshing(false);
  };

  const groups = useMemo(() => {
    const map = new Map<string, { key: string; name: string; items: typeof items }>();
    for (const it of items) {
      const officeName = it.vehicle?.office_name || "Unknown Office";
      const officeId = it.vehicle?.office_id || `unknown:${officeName}`;
      const key = officeId;
      if (!map.has(key)) map.set(key, { key, name: officeName, items: [] as any });
      map.get(key)!.items.push(it);
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  useEffect(() => {
    setExpandedByOffice((prev) => {
      const next = { ...prev };
      for (const g of groups) if (next[g.key] === undefined) next[g.key] = true;
      return next;
    });
  }, [groups]);

  return (
    <>
      <StandardHeader
        title="Emission Testing"
        subtitle={`${items.length} Total Tests`}
        statusBarStyle="dark"
        backgroundColor="#F3F6FB"
        borderColor="#E2E8F0"
        rightActionIcon="RefreshCw"
        onRightActionPress={() => syncData()}
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
                    <Icon name="ChevronLeft" size={18} color="#02339C" />
                  </TouchableOpacity>
                  <View style={styles.yearDisplay}>
                    <Text style={styles.yearText}>{year}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setYear((y) => y + 1)}
                    style={styles.yearButton}
                    activeOpacity={0.7}
                  >
                    <Icon name="ChevronRight" size={18} color="#02339C" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#02339C" />
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
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#02339C"]}
                tintColor="#02339C"
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
                    <Icon name="Building2" size={20} color="#02339C" />
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
    backgroundColor: "#F3F6FB",
  },
  filterWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterSection: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 0,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
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
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  dropdown: {
    height: 44,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  dropdownSelectedText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  dropdownContainer: {
    borderRadius: 8,
    borderColor: "#E5E7EB",
    marginTop: 4,
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#1F2937",
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
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  yearDisplay: {
    flex: 1,
    alignItems: "center",
  },
  yearText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
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
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#02339C",
    borderRadius: 8,
    elevation: 0,
  },
  emptyButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 6,
  },
  scrollView: {
    flex: 1,
  },
  officeSection: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 0,
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
    gap: 10,
    flex: 1,
  },
  officeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  countBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#02339C",
  },
  testsList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  testItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  testInfo: {
    flex: 1,
    marginRight: 12,
  },
  plateNumber: {
    fontSize: 15,
    fontWeight: "600",
    color: "#02339C",
    marginBottom: 4,
  },
  vehicleType: {
    fontSize: 13,
    color: "#6B7280",
  },
  statusChip: {
    elevation: 0,
  },
  statusChipText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  divider: {
    backgroundColor: "#E5E7EB",
  },
  bottomSpacer: {
    height: 120,
  },
});
