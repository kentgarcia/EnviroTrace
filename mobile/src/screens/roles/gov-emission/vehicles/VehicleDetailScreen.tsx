import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, Button, Chip, ActivityIndicator, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "../../../../components/icons/Icon";
import StandardHeader from "../../../../components/layout/StandardHeader";
import { database, LocalVehicle, LocalEmissionTest } from "../../../../core/database/database";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
};

export default function VehicleDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const vehicleId: string | undefined = route?.params?.vehicleId;

  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<LocalVehicle | null>(null);
  const [tests, setTests] = useState<LocalEmissionTest[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const v = vehicleId ? await database.getVehicleById(vehicleId) : null;
        const t = vehicleId
          ? await database.getEmissionTests({ vehicle_id: vehicleId, limit: 10 })
          : [];
        if (!mounted) return;
        setVehicle(v);
        setTests(t);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [vehicleId]);

  return (
    <>
      <StandardHeader
        title="Vehicle Details"
        showBack
        backgroundColor="#F3F6FB"
        statusBarStyle="dark"
      />
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#02339C" />
          </View>
        ) : !vehicle ? (
          <View style={styles.emptyContainer}>
            <Icon name="AlertCircle" size={48} color="#6B7280" />
            <Text style={styles.emptyText}>Vehicle not found</Text>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Vehicle Information Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Vehicle Information</Text>
                <View style={styles.card}>
                  <View style={styles.plateContainer}>
                    <Text style={styles.plateNumber}>{vehicle.plate_number}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Icon name="User" size={16} color="#6B7280" />
                    <Text style={styles.infoLabel}>Driver:</Text>
                    <Text style={styles.infoValue}>{vehicle.driver_name}</Text>
                  </View>

                  {vehicle.contact_number && (
                    <View style={styles.infoRow}>
                      <Icon name="Phone" size={16} color="#6B7280" />
                      <Text style={styles.infoLabel}>Contact:</Text>
                      <Text style={styles.infoValue}>{vehicle.contact_number}</Text>
                    </View>
                  )}

                  <View style={styles.infoRow}>
                    <Icon name="Building2" size={16} color="#6B7280" />
                    <Text style={styles.infoLabel}>Office:</Text>
                    <Text style={styles.infoValue}>{vehicle.office_name}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Icon name="Car" size={16} color="#6B7280" />
                    <Text style={styles.infoLabel}>Vehicle Type:</Text>
                    <Text style={styles.infoValue}>{vehicle.vehicle_type}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Icon name="Fuel" size={16} color="#6B7280" />
                    <Text style={styles.infoLabel}>Engine:</Text>
                    <Text style={styles.infoValue}>{vehicle.engine_type}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Icon name="CircleDot" size={16} color="#6B7280" />
                    <Text style={styles.infoLabel}>Wheels:</Text>
                    <Text style={styles.infoValue}>{vehicle.wheels}</Text>
                  </View>
                </View>
              </View>

              {/* Latest Test Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Latest Test Result</Text>
                <View style={styles.card}>
                  {vehicle.latest_test_result !== undefined && vehicle.latest_test_result !== null ? (
                    <>
                      <View style={styles.latestTestHeader}>
                        <Chip
                          compact
                          style={[
                            styles.statusChip,
                            {
                              backgroundColor: vehicle.latest_test_result ? "#16A34A" : "#E72525",
                            },
                          ]}
                          textStyle={styles.statusChipText}
                        >
                          {vehicle.latest_test_result ? "Pass" : "Fail"}
                        </Chip>
                        {vehicle.latest_test_date && (
                          <Text style={styles.testDate}>
                            {formatDate(vehicle.latest_test_date)}
                          </Text>
                        )}
                      </View>
                    </>
                  ) : (
                    <View style={styles.noTestContainer}>
                      <Icon name="FileQuestion" size={32} color="#6B7280" />
                      <Text style={styles.noTestText}>No emission tests recorded</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Test History Section */}
              {tests.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Test History</Text>
                  <View style={styles.card}>
                    {tests.map((test, index) => (
                      <View key={test.id}>
                        {index > 0 && <Divider style={styles.divider} />}
                        <View style={styles.testItem}>
                          <View style={styles.testInfo}>
                            <Text style={styles.testDateText}>
                              {formatDate(test.test_date)}
                            </Text>
                            <Text style={styles.testQuarter}>
                              Q{test.quarter} {test.year}
                            </Text>
                          </View>
                          <Chip
                            compact
                            style={[
                              styles.statusChip,
                              {
                                backgroundColor: test.result ? "#16A34A" : "#E72525",
                              },
                            ]}
                            textStyle={styles.statusChipText}
                          >
                            {test.result ? "Pass" : "Fail"}
                          </Chip>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Custom Bottom Action Bar - Replicates Tab Bar Design */}
            <View style={styles.bottomBarContainer}>
              <View style={styles.bottomBarBackground} />
              <SafeAreaView edges={["bottom"]} style={styles.bottomBarSafeArea}>
                <View style={styles.bottomBarOuter}>
                  <TouchableOpacity
                    style={styles.actionPill}
                    onPress={() => (navigation as any).navigate("Testing", { screen: "AddTest", params: { vehicleId } })}
                    activeOpacity={0.8}
                  >
                    <Icon name="ClipboardPlus" size={24} color="#FFFFFF" />
                    <Text style={styles.actionLabel}>Record Emission Test</Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </View>
          </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra space for bottom action bar
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    elevation: 0,
  },
  plateContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 12,
    marginBottom: 12,
  },
  plateNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#02339C",
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: "#1F2937",
    flex: 1,
  },
  latestTestHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusChip: {
    elevation: 0,
  },
  statusChipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  testDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  noTestContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },
  noTestText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  testItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  testInfo: {
    flex: 1,
  },
  testDateText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 4,
  },
  testQuarter: {
    fontSize: 12,
    color: "#6B7280",
  },
  divider: {
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  // Bottom Action Bar - Replicates Tab Bar Design
  bottomBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 24,
  },
  bottomBarBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F8FAFC",
    height: 80,
  },
  bottomBarSafeArea: {
    backgroundColor: "transparent",
  },
  bottomBarOuter: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: "center",
  },
  actionPill: {
    flexDirection: "row",
    backgroundColor: "#111827",
    borderRadius: 48,
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 68,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
