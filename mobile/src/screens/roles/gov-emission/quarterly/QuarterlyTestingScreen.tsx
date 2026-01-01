import React, { useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Card, Text, Chip, Searchbar, SegmentedButtons } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../../components/icons/Icon";
import StandardHeader from "../../../../components/layout/StandardHeader";
import { useNavigation } from "@react-navigation/native";

type QuarterType = "Q1" | "Q2" | "Q3" | "Q4";

export default function QuarterlyTestingScreen() {
  const navigation = useNavigation();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState<QuarterType>("Q4");
  const [searchQuery, setSearchQuery] = useState("");

  const quarters: QuarterType[] = ["Q1", "Q2", "Q3", "Q4"];

  const quarterPeriods = {
    Q1: "Jan - Mar",
    Q2: "Apr - Jun",
    Q3: "Jul - Sep",
    Q4: "Oct - Dec",
  };

  const mockData = {
    totalScheduled: 45,
    completed: 38,
    pending: 7,
    passRate: 84.2,
  };

  const mockSchedule = [
    {
      id: "1",
      plateNumber: "ABC-1234",
      department: "Department of Health",
      scheduledDate: "2025-12-28",
      status: "pending",
    },
    {
      id: "2",
      plateNumber: "XYZ-5678",
      department: "Department of Education",
      scheduledDate: "2025-12-27",
      status: "completed",
    },
    {
      id: "3",
      plateNumber: "DEF-9012",
      department: "Department of Transportation",
      scheduledDate: "2025-12-29",
      status: "pending",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return { bg: "#DCFCE7", text: "#059669" };
      case "pending":
        return { bg: "#FEF3C7", text: "#D97706" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280" };
    }
  };

  return (
    <View style={styles.root}>
      <StandardHeader
        title="Quarterly Testing"
        subtitle="Schedule and manage emission tests"
        statusBarStyle="light"
        backgroundColor="#2563EB"
        titleColor="#FFFFFF"
        subtitleColor="rgba(255, 255, 255, 0.8)"
        borderColor="transparent"
        titleSize={22}
        subtitleSize={12}
        rightActionIcon="Plus"
        onRightActionPress={() => (navigation as any).navigate("Testing", { screen: "AddTest", params: {} })}
      />

      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Year and Quarter Selector */}
          <View style={styles.selectorSection}>
            <View style={styles.yearSelector}>
              <TouchableOpacity
                style={styles.yearButton}
                onPress={() => setSelectedYear(selectedYear - 1)}
              >
                <Icon name="ChevronLeft" size={20} color="#64748B" />
              </TouchableOpacity>
              <Text style={styles.yearText}>{selectedYear}</Text>
              <TouchableOpacity
                style={styles.yearButton}
                onPress={() => setSelectedYear(selectedYear + 1)}
                disabled={selectedYear >= currentYear}
              >
                <Icon name="ChevronRight" size={20} color={selectedYear >= currentYear ? "#CBD5E1" : "#64748B"} />
              </TouchableOpacity>
            </View>

            <View style={styles.quarterButtons}>
              {quarters.map((quarter) => (
                <TouchableOpacity
                  key={quarter}
                  style={[
                    styles.quarterButton,
                    selectedQuarter === quarter && styles.quarterButtonActive,
                  ]}
                  onPress={() => setSelectedQuarter(quarter)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.quarterButtonText,
                      selectedQuarter === quarter && styles.quarterButtonTextActive,
                    ]}
                  >
                    {quarter}
                  </Text>
                  <Text
                    style={[
                      styles.quarterPeriod,
                      selectedQuarter === quarter && styles.quarterPeriodActive,
                    ]}
                  >
                    {quarterPeriods[quarter]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { flex: 1 }]}>
                <View style={[styles.statIcon, { backgroundColor: "#EFF6FF" }]}>
                  <Icon name="Calendar" size={18} color="#2563EB" />
                </View>
                <View>
                  <Text style={styles.statValue}>{mockData.totalScheduled}</Text>
                  <Text style={styles.statLabel}>Scheduled</Text>
                </View>
              </View>

              <View style={[styles.statCard, { flex: 1 }]}>
                <View style={[styles.statIcon, { backgroundColor: "#F0FDF4" }]}>
                  <Icon name="CheckCircle2" size={18} color="#16A34A" />
                </View>
                <View>
                  <Text style={styles.statValue}>{mockData.completed}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { flex: 1 }]}>
                <View style={[styles.statIcon, { backgroundColor: "#FFFBEB" }]}>
                  <Icon name="Clock" size={18} color="#D97706" />
                </View>
                <View>
                  <Text style={styles.statValue}>{mockData.pending}</Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>
              </View>

              <View style={[styles.statCard, { flex: 1 }]}>
                <View style={[styles.statIcon, { backgroundColor: "#F8FAFC" }]}>
                  <Icon name="TrendingUp" size={18} color="#64748B" />
                </View>
                <View>
                  <Text style={styles.statValue}>{mockData.passRate}%</Text>
                  <Text style={styles.statLabel}>Pass Rate</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchSection}>
            <Searchbar
              placeholder="Search plate or department"
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={styles.searchInput}
              iconColor="#64748B"
              placeholderTextColor="#94A3B8"
              elevation={0}
            />
          </View>

          {/* Schedule List */}
          <View style={styles.scheduleSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Test Schedule</Text>
              <Chip style={styles.countChip} textStyle={styles.countChipText}>
                {mockSchedule.length} Tests
              </Chip>
            </View>
            
            <View style={styles.scheduleList}>
              {mockSchedule.map((item) => {
                const statusColors = getStatusColor(item.status);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.scheduleItem}
                    activeOpacity={0.7}
                  >
                    <View style={styles.scheduleHeader}>
                      <View style={styles.plateContainer}>
                        <View style={styles.plateIcon}>
                          <Icon name="Car" size={14} color="#2563EB" />
                        </View>
                        <Text style={styles.plateNumber}>{item.plateNumber}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.scheduleBody}>
                      <View style={styles.infoRow}>
                        <Icon name="Building2" size={14} color="#94A3B8" />
                        <Text style={styles.infoText} numberOfLines={1}>{item.department}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Icon name="Calendar" size={14} color="#94A3B8" />
                        <Text style={styles.infoText}>
                          {new Date(item.scheduledDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.itemFooter}>
                      <TouchableOpacity style={styles.actionLink}>
                        <Text style={styles.actionLinkText}>View Details</Text>
                        <Icon name="ChevronRight" size={14} color="#2563EB" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  selectorSection: {
    marginBottom: 24,
  },
  yearSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 16,
  },
  yearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  yearText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  quarterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  quarterButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
  },
  quarterButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  quarterButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 2,
  },
  quarterButtonTextActive: {
    color: "#FFFFFF",
  },
  quarterPeriod: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  quarterPeriodActive: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  statsSection: {
    marginBottom: 24,
    gap: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  searchSection: {
    marginBottom: 24,
  },
  searchBar: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    height: 48,
  },
  searchInput: {
    fontSize: 14,
    minHeight: 0,
  },
  scheduleSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
  },
  countChip: {
    backgroundColor: "#F1F5F9",
    height: 24,
  },
  countChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  scheduleList: {
    gap: 12,
  },
  scheduleItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  plateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  plateIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  plateNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  scheduleBody: {
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  itemFooter: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionLinkText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
  bottomSpacer: {
    height: 100,
  },
});
