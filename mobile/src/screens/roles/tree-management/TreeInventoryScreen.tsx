import React, { useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { Card, Text, Chip, Searchbar, Portal, Dialog, Button, TextInput } from "react-native-paper";
import Icon from "../../../components/icons/Icon";
import ScreenLayout from "../../../components/layout/ScreenLayout";
import FloatingActionButton from "../../../components/FloatingActionButton";

interface TreeInventoryItem {
  id: string;
  species: string;
  commonName: string;
  location: string;
  latitude: number;
  longitude: number;
  height: number;
  diameter: number;
  condition: "excellent" | "good" | "fair" | "poor";
  plantedDate: string;
  lastInspection: string;
}

export default function TreeInventoryScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterCondition, setFilterCondition] = useState<string | null>(null);

  const mockTrees: TreeInventoryItem[] = [
    {
      id: "1",
      species: "Narra",
      commonName: "Philippine National Tree",
      location: "City Hall Park",
      latitude: 14.5995,
      longitude: 120.9842,
      height: 15.5,
      diameter: 45.2,
      condition: "excellent",
      plantedDate: "2020-03-15",
      lastInspection: "2025-12-01",
    },
    {
      id: "2",
      species: "Mahogany",
      commonName: "Philippine Mahogany",
      location: "Barangay Green Space",
      latitude: 14.6020,
      longitude: 120.9850,
      height: 12.3,
      diameter: 38.5,
      condition: "good",
      plantedDate: "2019-06-20",
      lastInspection: "2025-11-28",
    },
    {
      id: "3",
      species: "Molave",
      commonName: "Philippine Hardwood",
      location: "Municipal Plaza",
      latitude: 14.6005,
      longitude: 120.9830,
      height: 10.8,
      diameter: 32.1,
      condition: "fair",
      plantedDate: "2021-01-10",
      lastInspection: "2025-12-15",
    },
  ];

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent":
        return { bg: "#DCFCE7", text: "#059669" };
      case "good":
        return { bg: "#DBEAFE", text: "#2563EB" };
      case "fair":
        return { bg: "#FEF3C7", text: "#D97706" };
      case "poor":
        return { bg: "#FEE2E2", text: "#DC2626" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280" };
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1500);
  };

  const filteredTrees = mockTrees.filter((tree) => {
    const matchesSearch =
      tree.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tree.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tree.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterCondition || tree.condition === filterCondition;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: mockTrees.length,
    excellent: mockTrees.filter((t) => t.condition === "excellent").length,
    good: mockTrees.filter((t) => t.condition === "good").length,
    needsAttention: mockTrees.filter((t) => t.condition === "fair" || t.condition === "poor").length,
  };

  return (
    <ScreenLayout
      header={{
        title: "Tree Inventory",
        subtitle: "Central registry of all trees",
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
                  <Icon name="TreePalm" size={20} color="#3B82F6" />
                </View>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total Trees</Text>
              </View>

              <View style={[styles.statCard, { flex: 1 }]}>
                <View style={[styles.statIcon, { backgroundColor: "#DCFCE7" }]}>
                  <Icon name="CheckCircle2" size={20} color="#10B981" />
                </View>
                <Text style={styles.statValue}>{stats.excellent}</Text>
                <Text style={styles.statLabel}>Excellent</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { flex: 1 }]}>
                <View style={[styles.statIcon, { backgroundColor: "#DBEAFE" }]}>
                  <Icon name="Leaf" size={20} color="#2563EB" />
                </View>
                <Text style={styles.statValue}>{stats.good}</Text>
                <Text style={styles.statLabel}>Good Condition</Text>
              </View>

              <View style={[styles.statCard, { flex: 1 }]}>
                <View style={[styles.statIcon, { backgroundColor: "#FEF3C7" }]}>
                  <Icon name="AlertTriangle" size={20} color="#D97706" />
                </View>
                <Text style={styles.statValue}>{stats.needsAttention}</Text>
                <Text style={styles.statLabel}>Needs Attention</Text>
              </View>
            </View>
          </View>

          {/* Search and Filter */}
          <View style={styles.searchSection}>
            <Searchbar
              placeholder="Search by species, name, or location"
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={styles.searchInput}
              iconColor="#6B7280"
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              <Chip
                selected={filterCondition === null}
                onPress={() => setFilterCondition(null)}
                style={styles.filterChip}
                textStyle={styles.filterText}
              >
                All
              </Chip>
              <Chip
                selected={filterCondition === "excellent"}
                onPress={() => setFilterCondition("excellent")}
                style={styles.filterChip}
                textStyle={styles.filterText}
              >
                Excellent
              </Chip>
              <Chip
                selected={filterCondition === "good"}
                onPress={() => setFilterCondition("good")}
                style={styles.filterChip}
                textStyle={styles.filterText}
              >
                Good
              </Chip>
              <Chip
                selected={filterCondition === "fair"}
                onPress={() => setFilterCondition("fair")}
                style={styles.filterChip}
                textStyle={styles.filterText}
              >
                Fair
              </Chip>
              <Chip
                selected={filterCondition === "poor"}
                onPress={() => setFilterCondition("poor")}
                style={styles.filterChip}
                textStyle={styles.filterText}
              >
                Poor
              </Chip>
            </ScrollView>
          </View>

          {/* Tree List */}
          <View style={styles.treeList}>
            {filteredTrees.map((tree) => {
              const conditionColors = getConditionColor(tree.condition);
              return (
                <TouchableOpacity key={tree.id} style={styles.treeCard} activeOpacity={0.7}>
                  <View style={styles.treeHeader}>
                    <View style={styles.treeIconContainer}>
                      <Icon name="TreePalm" size={24} color="#059669" />
                    </View>
                    <View style={styles.treeInfo}>
                      <Text style={styles.treeSpecies}>{tree.species}</Text>
                      <Text style={styles.treeCommonName}>{tree.commonName}</Text>
                    </View>
                    <Chip
                      style={[styles.conditionChip, { backgroundColor: conditionColors.bg }]}
                      textStyle={[styles.conditionText, { color: conditionColors.text }]}
                      compact
                    >
                      {tree.condition}
                    </Chip>
                  </View>

                  <View style={styles.treeDetails}>
                    <View style={styles.detailRow}>
                      <Icon name="MapPin" size={14} color="#9CA3AF" />
                      <Text style={styles.detailText}>{tree.location}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="Ruler" size={14} color="#9CA3AF" />
                      <Text style={styles.detailText}>
                        Height: {tree.height}m • Diameter: {tree.diameter}cm
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="Calendar" size={14} color="#9CA3AF" />
                      <Text style={styles.detailText}>
                        Planted: {new Date(tree.plantedDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="ClipboardCheck" size={14} color="#9CA3AF" />
                      <Text style={styles.detailText}>
                        Last Inspection: {new Date(tree.lastInspection).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <FloatingActionButton onPress={() => setShowAddDialog(true)} />

      {/* Add Tree Dialog */}
      <Portal>
        <Dialog visible={showAddDialog} onDismiss={() => setShowAddDialog(false)} style={styles.dialog}>
          <Dialog.Title>Add Tree to Inventory</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Use the species management feature to add new trees to the inventory.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddDialog(false)}>Close</Button>
            <Button mode="contained" onPress={() => setShowAddDialog(false)}>
              Add Tree
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
  treeList: {
    gap: 12,
  },
  treeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  treeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  treeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  treeInfo: {
    flex: 1,
  },
  treeSpecies: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  treeCommonName: {
    fontSize: 13,
    color: "#6B7280",
  },
  conditionChip: {
    height: 28,
  },
  conditionText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  treeDetails: {
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
