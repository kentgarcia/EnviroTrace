import React, { useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { Card, Text, Chip, Searchbar, Portal, Dialog, Button, DataTable } from "react-native-paper";
import Icon from "../../../components/icons/Icon";
import ScreenLayout from "../../../components/layout/ScreenLayout";
import FloatingActionButton from "../../../components/FloatingActionButton";

interface FeeRecord {
  id: string;
  requestId: string;
  requestType: "tree_cutting" | "tree_pruning" | "violation";
  applicant: string;
  amount: number;
  status: "pending" | "paid" | "waived" | "overdue";
  dueDate: string;
  paidDate?: string;
  receiptNumber?: string;
}

export default function FeeRecordsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const mockFees: FeeRecord[] = [
    {
      id: "1",
      requestId: "REQ-2025-001",
      requestType: "tree_cutting",
      applicant: "Juan Dela Cruz",
      amount: 5000,
      status: "paid",
      dueDate: "2025-12-20",
      paidDate: "2025-12-18",
      receiptNumber: "OR-2025-1234",
    },
    {
      id: "2",
      requestId: "REQ-2025-002",
      requestType: "tree_pruning",
      applicant: "Maria Santos",
      amount: 2500,
      status: "pending",
      dueDate: "2025-12-30",
    },
    {
      id: "3",
      requestId: "REQ-2025-003",
      requestType: "violation",
      applicant: "Pedro Garcia",
      amount: 10000,
      status: "overdue",
      dueDate: "2025-12-15",
    },
    {
      id: "4",
      requestId: "REQ-2025-004",
      requestType: "tree_cutting",
      applicant: "Ana Rodriguez",
      amount: 5000,
      status: "waived",
      dueDate: "2025-12-25",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return { bg: "#DCFCE7", text: "#059669" };
      case "pending":
        return { bg: "#FEF3C7", text: "#D97706" };
      case "overdue":
        return { bg: "#FEE2E2", text: "#DC2626" };
      case "waived":
        return { bg: "#E0E7FF", text: "#4F46E5" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280" };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "tree_cutting":
        return "Tree Cutting";
      case "tree_pruning":
        return "Tree Pruning";
      case "violation":
        return "Violation";
      default:
        return type;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const filteredFees = mockFees.filter((fee) => {
    const matchesSearch =
      fee.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterStatus || fee.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: mockFees.reduce((sum, fee) => sum + fee.amount, 0),
    collected: mockFees
      .filter((f) => f.status === "paid")
      .reduce((sum, fee) => sum + fee.amount, 0),
    pending: mockFees
      .filter((f) => f.status === "pending")
      .reduce((sum, fee) => sum + fee.amount, 0),
    overdue: mockFees
      .filter((f) => f.status === "overdue")
      .reduce((sum, fee) => sum + fee.amount, 0),
  };

  return (
    <ScreenLayout
      header={{
        title: "Fee Records",
        subtitle: "Manage fees and payments",
        statusBarStyle: "dark",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#E5E7EB",
        titleSize: 22,
        subtitleSize: 12,
        iconSize: 20,
      }}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
          {/* Stats Cards */}
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { flex: 1 }]}>
                <View style={[styles.statIcon, { backgroundColor: "#EFF6FF" }]}>
                  <Icon name="Banknote" size={20} color="#3B82F6" />
                </View>
                <Text style={styles.statValue}>₱{(stats.total / 1000).toFixed(1)}k</Text>
                <Text style={styles.statLabel}>Total Fees</Text>
              </View>

              <View style={[styles.statCard, { flex: 1 }]}>
                <View style={[styles.statIcon, { backgroundColor: "#DCFCE7" }]}>
                  <Icon name="CheckCircle2" size={20} color="#10B981" />
                </View>
                <Text style={styles.statValue}>₱{(stats.collected / 1000).toFixed(1)}k</Text>
                <Text style={styles.statLabel}>Collected</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { flex: 1 }]}>
                <View style={[styles.statIcon, { backgroundColor: "#FEF3C7" }]}>
                  <Icon name="Clock" size={20} color="#F59E0B" />
                </View>
                <Text style={styles.statValue}>₱{(stats.pending / 1000).toFixed(1)}k</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>

              <View style={[styles.statCard, { flex: 1 }]}>
                <View style={[styles.statIcon, { backgroundColor: "#FEE2E2" }]}>
                  <Icon name="AlertCircle" size={20} color="#DC2626" />
                </View>
                <Text style={styles.statValue}>₱{(stats.overdue / 1000).toFixed(1)}k</Text>
                <Text style={styles.statLabel}>Overdue</Text>
              </View>
            </View>
          </View>

          {/* Search and Filter */}
          <View style={styles.searchSection}>
            <Searchbar
              placeholder="Search by applicant, request ID, or receipt"
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={styles.searchInput}
              iconColor="#6B7280"
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              <Chip
                selected={filterStatus === null}
                onPress={() => setFilterStatus(null)}
                style={styles.filterChip}
                textStyle={styles.filterText}
              >
                All
              </Chip>
              <Chip
                selected={filterStatus === "paid"}
                onPress={() => setFilterStatus("paid")}
                style={styles.filterChip}
                textStyle={styles.filterText}
              >
                Paid
              </Chip>
              <Chip
                selected={filterStatus === "pending"}
                onPress={() => setFilterStatus("pending")}
                style={styles.filterChip}
                textStyle={styles.filterText}
              >
                Pending
              </Chip>
              <Chip
                selected={filterStatus === "overdue"}
                onPress={() => setFilterStatus("overdue")}
                style={styles.filterChip}
                textStyle={styles.filterText}
              >
                Overdue
              </Chip>
              <Chip
                selected={filterStatus === "waived"}
                onPress={() => setFilterStatus("waived")}
                style={styles.filterChip}
                textStyle={styles.filterText}
              >
                Waived
              </Chip>
            </ScrollView>
          </View>

          {/* Fee Records List */}
          <View style={styles.feesList}>
            {filteredFees.map((fee) => {
              const statusColors = getStatusColor(fee.status);
              return (
                <TouchableOpacity key={fee.id} style={styles.feeCard} activeOpacity={0.7}>
                  <View style={styles.feeHeader}>
                    <View style={styles.feeIconContainer}>
                      <Icon name="Banknote" size={24} color="#059669" />
                    </View>
                    <View style={styles.feeInfo}>
                      <Text style={styles.feeApplicant}>{fee.applicant}</Text>
                      <Text style={styles.feeRequestId}>{fee.requestId}</Text>
                    </View>
                    <View style={styles.feeAmount}>
                      <Text style={styles.amountText}>₱{fee.amount.toLocaleString()}</Text>
                    </View>
                  </View>

                  <View style={styles.badgesRow}>
                    <Chip
                      style={[styles.typeChip, { backgroundColor: "#F0F9FF" }]}
                      textStyle={[styles.chipText, { color: "#0EA5E9" }]}
                      compact
                    >
                      {getTypeLabel(fee.requestType)}
                    </Chip>
                    <Chip
                      style={[styles.statusChip, { backgroundColor: statusColors.bg }]}
                      textStyle={[styles.chipText, { color: statusColors.text }]}
                      compact
                    >
                      {fee.status}
                    </Chip>
                  </View>

                  <View style={styles.feeDetails}>
                    <View style={styles.detailRow}>
                      <Icon name="Calendar" size={14} color="#9CA3AF" />
                      <Text style={styles.detailText}>
                        Due: {new Date(fee.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                    {fee.paidDate && (
                      <View style={styles.detailRow}>
                        <Icon name="CheckCircle2" size={14} color="#059669" />
                        <Text style={styles.detailText}>
                          Paid: {new Date(fee.paidDate).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                    {fee.receiptNumber && (
                      <View style={styles.detailRow}>
                        <Icon name="Receipt" size={14} color="#9CA3AF" />
                        <Text style={styles.detailText}>Receipt: {fee.receiptNumber}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

      <FloatingActionButton onPress={() => setShowAddDialog(true)} />

      {/* Add Fee Dialog */}
      <Portal>
        <Dialog visible={showAddDialog} onDismiss={() => setShowAddDialog(false)} style={styles.dialog}>
          <Dialog.Title>Record New Fee</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Record a new fee for tree management requests or violations.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddDialog(false)}>Cancel</Button>
            <Button mode="contained" onPress={() => setShowAddDialog(false)}>
              Add Fee
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 16,
  },
  statsSection: {
    marginBottom: 20,
    gap: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    textAlign: "center",
  },
  searchSection: {
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 0,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    fontSize: 14,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: "#F3F4F6",
  },
  filterText: {
    fontSize: 13,
  },
  feesList: {
    gap: 12,
  },
  feeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  feeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  feeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  feeInfo: {
    flex: 1,
  },
  feeApplicant: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  feeRequestId: {
    fontSize: 13,
    color: "#6B7280",
  },
  feeAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  typeChip: {
    height: 28,
  },
  statusChip: {
    height: 28,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  feeDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: "#6B7280",
  },
  bottomSpacer: {
    height: 100,
  },
  dialog: {
    borderRadius: 16,
  },
  dialogText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
});
