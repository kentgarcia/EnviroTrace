import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, RefreshControl, ScrollView, TouchableOpacity } from "react-native";
import { Title, Paragraph, Button, Divider, ActivityIndicator, useTheme, IconButton, Chip } from "react-native-paper";
import Icon from "../../../components/icons/Icon";
import StandardHeader from "../../../components/layout/StandardHeader";
import { database, LocalEmissionTest, LocalVehicle } from "../../../core/database/database";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

export default function TestingScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const now = new Date();
  const defaultQuarter = useMemo(() => Math.floor(now.getMonth() / 3) + 1, [now]);
  const defaultYear = useMemo(() => now.getFullYear(), [now]);
  const [quarter, setQuarter] = useState<number>(defaultQuarter);
  const [year, setYear] = useState<number>(defaultYear);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<Array<{ test: LocalEmissionTest; vehicle: LocalVehicle | null }>>([]);
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
      <StandardHeader title="Emission Testing" chip={{ label: "Gov. Emission", iconName: "assignment" }} />

      <View style={styles.headerBox}>
        <Title style={styles.headerTitle}>Testing Period</Title>
        <Paragraph style={styles.headerSubtitle}>Q{quarter} • {year}</Paragraph>
        <View style={styles.controlsRow}>
          <View style={styles.quarterRow}>
            {[1, 2, 3, 4].map((q) => (
              <Chip
                key={q}
                compact
                onPress={() => setQuarter(q)}
                style={[styles.quarterChip, q === quarter && { backgroundColor: colors.primary }]}
                textStyle={[styles.quarterChipText, q === quarter && { color: "#FFFFFF" }]}
              >
                Q{q}
              </Chip>
            ))}
          </View>
          <View style={styles.yearStepper}>
            <IconButton
              mode="contained-tonal"
              size={20}
              icon={() => (
                <Icon name="chevron-right" size={18} color={colors.primary} style={{ transform: [{ scaleX: -1 }] }} />
              )}
              containerColor={`${colors.primary}1A`}
              onPress={() => setYear((y) => y - 1)}
              style={{ margin: 0 }}
            />
            <Paragraph style={styles.yearText}>{year}</Paragraph>
            <IconButton
              mode="contained-tonal"
              size={20}
              icon={() => <Icon name="chevron-right" size={18} color={colors.primary} />}
              containerColor={`${colors.primary}1A`}
              onPress={() => setYear((y) => y + 1)}
              style={{ margin: 0 }}
            />
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : groups.length === 0 ? (
        <View style={[styles.emptyState, { padding: 24 }]}>
          <Icon name="assignment" size={48} color="#BDBDBD" />
          <Title style={styles.emptyTitle}>No tests this period</Title>
          <Paragraph style={styles.emptyText}>Record your first test to see vehicles here.</Paragraph>
          <Button mode="contained" onPress={() => (navigation as any).navigate("Vehicles")}>
            Record New Test
          </Button>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
          }
          contentContainerStyle={styles.listContent}
        >
          {groups.map((g) => (
            <View key={g.key} style={styles.officeSection}>
              <TouchableOpacity
                style={styles.officeHeader}
                onPress={() => setExpandedByOffice((prev) => ({ ...prev, [g.key]: !prev[g.key] }))}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                  <Icon name="business" size={18} color={colors.primary} />
                  <Title style={styles.officeTitle}>{g.name}</Title>
                  <Paragraph style={styles.officeCount}>({g.items.length})</Paragraph>
                </View>
                <Icon
                  name="chevron-right"
                  size={18}
                  color="#6B7280"
                  style={{ transform: [{ rotate: expandedByOffice[g.key] ? "90deg" : "0deg" }] }}
                />
              </TouchableOpacity>
              {expandedByOffice[g.key] && (
                <View style={styles.officeList}>
                  {g.items.map((it, idx) => (
                    <View key={it.test.id}>
                      <View style={styles.row}>
                        <Paragraph style={[styles.plateText, { color: colors.primary }]}>
                          {it.vehicle?.plate_number || "Unknown Plate"}
                        </Paragraph>
                        <Paragraph
                          style={
                            it.test.result === null
                              ? styles.statusPending
                              : it.test.result
                                ? styles.statusPass
                                : styles.statusFail
                          }
                        >
                          {it.test.result === null ? "Pending" : it.test.result ? "Passed" : "Failed"}
                        </Paragraph>
                      </View>
                      {idx < g.items.length - 1 && <Divider />}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerBox: { padding: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  headerSubtitle: { fontSize: 13, color: "#374151" },
  controlsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  quarterRow: { flexDirection: "row", gap: 8 },
  quarterChip: { backgroundColor: "#F3F4F6" },
  quarterChipText: { fontSize: 12, fontWeight: "600", color: "#374151" },
  yearStepper: { flexDirection: "row", alignItems: "center", gap: 6 },
  yearText: { fontSize: 14, fontWeight: "700", color: "#111827", width: 60, textAlign: "center" },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { padding: 16, paddingTop: 8 },
  officeSection: { marginBottom: 12, borderRadius: 10, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB" },
  officeHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 10 },
  officeTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  officeCount: { fontSize: 12, color: "#6B7280" },
  officeList: { paddingHorizontal: 12, paddingBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
  plateText: { fontSize: 13, fontWeight: "700" },
  statusPass: { fontSize: 12, fontWeight: "700", color: "#2E7D32" },
  statusFail: { fontSize: 12, fontWeight: "700", color: "#D32F2F" },
  statusPending: { fontSize: 12, fontWeight: "700", color: "#6B7280" },
  emptyState: { alignItems: "center" },
  emptyTitle: { fontSize: 18, color: "#424242", marginTop: 10, marginBottom: 6 },
  emptyText: { fontSize: 13, color: "#757575", textAlign: "center", marginBottom: 10 },
});
