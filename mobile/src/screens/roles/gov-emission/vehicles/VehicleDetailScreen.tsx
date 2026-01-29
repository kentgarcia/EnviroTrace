import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, Button, Chip, ActivityIndicator, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "../../../../components/icons/Icon";
import StandardHeader from "../../../../components/layout/StandardHeader";
import { cardStyles } from "../../../../styles/cardStyles";
import {
  useVehicle,
  useEmissionTests,
  Vehicle,
  EmissionTest,
} from "../../../../core/api/emission-service";

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

  // Fetch vehicle and tests from API
  const {
    data: vehicle,
    isLoading: loadingVehicle,
    error: vehicleError,
  } = useVehicle(vehicleId || "");

  const {
    data: tests = [],
    isLoading: loadingTests,
  } = useEmissionTests(
    { vehicleId: vehicleId || "" },
    { enabled: !!vehicleId }
  );

  const loading = loadingVehicle || loadingTests;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StandardHeader
        title="Vehicle Details"
        showBack
        backgroundColor="#FFFFFF"
        statusBarStyle="dark"
        titleSize={20}
        iconSize={20}
      />
      <View style={styles.safeArea}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E40AF" />
          </View>
        ) : !vehicle ? (
          <View style={styles.emptyContainer}>
            <Icon name="AlertCircle" size={48} color="#64748B" />
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
                    <View style={styles.plateIconContainer}>
                      <Icon name="Car" size={24} color="#1E40AF" />
                    </View>
                    <Text style={styles.plateNumber}>
                      {vehicle.plate_number ||
                        vehicle.chassis_number ||
                        vehicle.registration_number ||
                        "N/A"}
                    </Text>
                    {!vehicle.plate_number && vehicle.chassis_number && (
                      <Text style={styles.plateLabel}>(Chassis Number)</Text>
                    )}
                    {!vehicle.plate_number && !vehicle.chassis_number && vehicle.registration_number && (
                      <Text style={styles.plateLabel}>(Registration Number)</Text>
                    )}
                  </View>

                  <View style={styles.infoGrid}>
                    {vehicle.plate_number && (
                      <View style={styles.infoRow}>
                        <View style={styles.infoIconContainer}>
                          <Icon name="Hash" size={14} color="#64748B" />
                        </View>
                        <View>
                          <Text style={styles.infoLabel}>Plate Number</Text>
                          <Text style={styles.infoValue}>{vehicle.plate_number}</Text>
                        </View>
                      </View>
                    )}

                    {vehicle.chassis_number && (
                      <View style={styles.infoRow}>
                        <View style={styles.infoIconContainer}>
                          <Icon name="Hash" size={14} color="#64748B" />
                        </View>
                        <View>
                          <Text style={styles.infoLabel}>Chassis Number</Text>
                          <Text style={styles.infoValue}>{vehicle.chassis_number}</Text>
                        </View>
                      </View>
                    )}

                    {vehicle.registration_number && (
                      <View style={styles.infoRow}>
                        <View style={styles.infoIconContainer}>
                          <Icon name="Hash" size={14} color="#64748B" />
                        </View>
                        <View>
                          <Text style={styles.infoLabel}>Registration Number</Text>
                          <Text style={styles.infoValue}>{vehicle.registration_number}</Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.infoRow}>
                      <View style={styles.infoIconContainer}>
                        <Icon name="User" size={14} color="#64748B" />
                      </View>
                      <View>
                        <Text style={styles.infoLabel}>Driver</Text>
                        <Text style={styles.infoValue}>{vehicle.driver_name}</Text>
                      </View>
                    </View>

                    {vehicle.contact_number && (
                      <View style={styles.infoRow}>
                        <View style={styles.infoIconContainer}>
                          <Icon name="Phone" size={14} color="#64748B" />
                        </View>
                        <View>
                          <Text style={styles.infoLabel}>Contact</Text>
                          <Text style={styles.infoValue}>{vehicle.contact_number}</Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.infoRow}>
                      <View style={styles.infoIconContainer}>
                        <Icon name="Building2" size={14} color="#64748B" />
                      </View>
                      <View>
                        <Text style={styles.infoLabel}>Office</Text>
                        <Text style={styles.infoValue}>{vehicle.office?.name || "Unknown"}</Text>
                      </View>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.infoIconContainer}>
                        <Icon name="Car" size={14} color="#64748B" />
                      </View>
                      <View>
                        <Text style={styles.infoLabel}>Vehicle Type</Text>
                        <Text style={styles.infoValue}>{vehicle.vehicle_type}</Text>
                      </View>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.infoIconContainer}>
                        <Icon name="Fuel" size={14} color="#64748B" />
                      </View>
                      <View>
                        <Text style={styles.infoLabel}>Engine</Text>
                        <Text style={styles.infoValue}>{vehicle.engine_type}</Text>
                      </View>
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.infoIconContainer}>
                        <Icon name="CirclePlus" size={14} color="#64748B" />
                      </View>
                      <View>
                        <Text style={styles.infoLabel}>Wheels</Text>
                        <Text style={styles.infoValue}>{vehicle.wheels}</Text>
                      </View>
                    </View>

                    {vehicle.year_acquired && (
                      <View style={styles.infoRow}>
                        <View style={styles.infoIconContainer}>
                          <Icon name="Calendar" size={14} color="#64748B" />
                        </View>
                        <View>
                          <Text style={styles.infoLabel}>Year Acquired</Text>
                          <Text style={styles.infoValue}>{vehicle.year_acquired}</Text>
                        </View>
                      </View>
                    )}

                    {vehicle.description && (
                      <View style={styles.infoRow}>
                        <View style={styles.infoIconContainer}>
                          <Icon name="FileText" size={14} color="#64748B" />
                        </View>
                        <View>
                          <Text style={styles.infoLabel}>Description</Text>
                          <Text style={styles.infoValue}>{vehicle.description}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Latest Test Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Latest Test Result</Text>
                <View style={styles.card}>
                  {vehicle.latest_test_result !== undefined && vehicle.latest_test_result !== null ? (
                    <View style={styles.latestTestHeader}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: vehicle.latest_test_result ? "#DCFCE7" : "#FEE2E2",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            {
                              color: vehicle.latest_test_result ? "#16A34A" : "#DC2626",
                            },
                          ]}
                        >
                          {vehicle.latest_test_result ? "Pass" : "Fail"}
                        </Text>
                      </View>
                      {vehicle.latest_test_date && (
                        <View style={styles.testDateContainer}>
                          <Icon name="Calendar" size={14} color="#64748B" />
                          <Text style={styles.testDate}>
                            {formatDate(vehicle.latest_test_date)}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.noTestContainer}>
                      <View style={styles.noTestIconContainer}>
                        <Icon name="FileQuestion" size={32} color="#64748B" />
                      </View>
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
                            {(test.co_level !== undefined || test.hc_level !== undefined || test.opacimeter_result !== undefined) && (
                              <Text style={styles.testLevels}>
                                {test.co_level !== undefined && `CO: ${test.co_level}%`}
                                {test.co_level !== undefined && test.hc_level !== undefined && ' • '}
                                {test.hc_level !== undefined && `HC: ${test.hc_level} ppm`}
                                {test.opacimeter_result !== undefined && `Opacimeter: ${test.opacimeter_result}%`}
                              </Text>
                            )}
                          </View>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor: test.result ? "#DCFCE7" : "#FEE2E2",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                {
                                  color: test.result ? "#16A34A" : "#DC2626",
                                },
                              ]}
                            >
                              {test.result ? "Pass" : "Fail"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Custom Bottom Action Bar */}
            <View style={styles.bottomBarContainer}>
              <SafeAreaView edges={["bottom"]} style={styles.bottomBarSafeArea}>
                <TouchableOpacity
                  style={styles.actionPill}
                  onPress={() => (navigation as any).navigate("Testing", { screen: "AddTest", params: { vehicleId } })}
                  activeOpacity={0.8}
                >
                  <Icon name="ClipboardPlus" size={22} color="#FFFFFF" />
                  <Text style={styles.actionLabel}>Record Emission Test</Text>
                </TouchableOpacity>
              </SafeAreaView>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  plateContainer: {
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 20,
    marginBottom: 20,
  },
  plateIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  plateNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  plateLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
  },
  infoGrid: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "600",
  },
  latestTestHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  testDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  testDate: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  noTestContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 12,
  },
  noTestIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  noTestText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "600",
  },
  testItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  testInfo: {
    flex: 1,
  },
  testDateText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  testQuarter: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  testLevels: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 4,
  },
  divider: {
    backgroundColor: "#F1F5F9",
  },
  bottomBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bottomBarSafeArea: {
    backgroundColor: "transparent",
  },
  actionPill: {
    flexDirection: "row",
    backgroundColor: "#1E40AF",
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 18,
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
