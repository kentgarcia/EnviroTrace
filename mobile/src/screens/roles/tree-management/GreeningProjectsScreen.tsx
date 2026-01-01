import React, { useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { Card, Text, Chip, Searchbar, SegmentedButtons, Portal, Dialog, Button } from "react-native-paper";
import Icon from "../../../components/icons/Icon";
import ScreenLayout from "../../../components/layout/ScreenLayout";
import FloatingActionButton from "../../../components/FloatingActionButton";

interface GreeningProject {
  id: string;
  projectName: string;
  type: "replacement" | "new_planting";
  location: string;
  targetTrees: number;
  plantedTrees: number;
  status: "planning" | "in_progress" | "completed";
  startDate: string;
  targetDate: string;
  budget: number;
  species: string[];
}

export default function GreeningProjectsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "replacement" | "new_planting">("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const mockProjects: GreeningProject[] = [
    {
      id: "1",
      projectName: "City Hall Green Initiative",
      type: "new_planting",
      location: "City Hall Complex",
      targetTrees: 150,
      plantedTrees: 120,
      status: "in_progress",
      startDate: "2025-01-15",
      targetDate: "2025-12-31",
      budget: 500000,
      species: ["Narra", "Mahogany", "Acacia"],
    },
    {
      id: "2",
      projectName: "Riverside Replacement Program",
      type: "replacement",
      location: "Riverside Park",
      targetTrees: 75,
      plantedTrees: 75,
      status: "completed",
      startDate: "2024-10-01",
      targetDate: "2025-03-31",
      budget: 250000,
      species: ["Molave", "Talisay"],
    },
    {
      id: "3",
      projectName: "Barangay Greening Project",
      type: "new_planting",
      location: "Barangay 5",
      targetTrees: 200,
      plantedTrees: 45,
      status: "in_progress",
      startDate: "2025-06-01",
      targetDate: "2026-05-31",
      budget: 750000,
      species: ["Narra", "Ipil-ipil", "Mahogany", "Molave"],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return { bg: "#DCFCE7", text: "#059669" };
      case "in_progress":
        return { bg: "#DBEAFE", text: "#2563EB" };
      case "planning":
        return { bg: "#FEF3C7", text: "#D97706" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280" };
    }
  };

  const getTypeColor = (type: string) => {
    return type === "replacement"
      ? { bg: "#FEF3C7", text: "#D97706" }
      : { bg: "#DCFCE7", text: "#059669" };
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch =
      project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || project.type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: mockProjects.length,
    active: mockProjects.filter((p) => p.status === "in_progress").length,
    completed: mockProjects.filter((p) => p.status === "completed").length,
    totalPlanted: mockProjects.reduce((sum, p) => sum + p.plantedTrees, 0),
  };

  return (
    <ScreenLayout
      header={{
        title: "Greening Projects",
        subtitle: "Replacement & new planting initiatives",
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
                  <Icon name="FolderTree" size={20} color="#3B82F6" />
                </View>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total Projects</Text>
              </View>

              <View style={[styles.statCard, { flex: 1 }]}>
                <View style={[styles.statIcon, { backgroundColor: "#DBEAFE" }]}>
                  <Icon name="Construction" size={20} color="#2563EB" />
                </View>
                <Text style={styles.statValue}>{stats.active}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { flex: 1 }]}>
                <View style={[styles.statIcon, { backgroundColor: "#DCFCE7" }]}>
                  <Icon name="CheckCircle2" size={20} color="#10B981" />
                </View>
                <Text style={styles.statValue}>{stats.completed}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>

              <View style={[styles.statCard, { flex: 1 }]}>
                <View style={[styles.statIcon, { backgroundColor: "#F0FDF4" }]}>
                  <Icon name="TreePalm" size={20} color="#059669" />
                </View>
                <Text style={styles.statValue}>{stats.totalPlanted}</Text>
                <Text style={styles.statLabel}>Trees Planted</Text>
              </View>
            </View>
          </View>

          {/* Search and Filter */}
          <View style={styles.searchSection}>
            <Searchbar
              placeholder="Search projects or locations"
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={styles.searchInput}
              iconColor="#6B7280"
            />

            <SegmentedButtons
              value={filterType}
              onValueChange={(value) => setFilterType(value as any)}
              buttons={[
                { value: "all", label: "All" },
                { value: "replacement", label: "Replacement" },
                { value: "new_planting", label: "New Planting" },
              ]}
              style={styles.segmentedButtons}
            />
          </View>

          {/* Projects List */}
          <View style={styles.projectsList}>
            {filteredProjects.map((project) => {
              const statusColors = getStatusColor(project.status);
              const typeColors = getTypeColor(project.type);
              const progress = (project.plantedTrees / project.targetTrees) * 100;

              return (
                <TouchableOpacity key={project.id} style={styles.projectCard} activeOpacity={0.7}>
                  <View style={styles.projectHeader}>
                    <View style={styles.projectIconContainer}>
                      <Icon name="TreePalm" size={24} color="#059669" />
                    </View>
                    <View style={styles.projectInfo}>
                      <Text style={styles.projectName}>{project.projectName}</Text>
                      <Text style={styles.projectLocation}>{project.location}</Text>
                    </View>
                  </View>

                  <View style={styles.badgesRow}>
                    <Chip
                      style={[styles.typeChip, { backgroundColor: typeColors.bg }]}
                      textStyle={[styles.chipText, { color: typeColors.text }]}
                      compact
                    >
                      {project.type === "replacement" ? "Replacement" : "New Planting"}
                    </Chip>
                    <Chip
                      style={[styles.statusChip, { backgroundColor: statusColors.bg }]}
                      textStyle={[styles.chipText, { color: statusColors.text }]}
                      compact
                    >
                      {project.status.replace("_", " ")}
                    </Chip>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={styles.progressText}>
                        {project.plantedTrees} / {project.targetTrees} trees
                      </Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBar, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressPercentage}>{progress.toFixed(0)}%</Text>
                  </View>

                  <View style={styles.projectDetails}>
                    <View style={styles.detailRow}>
                      <Icon name="Calendar" size={14} color="#9CA3AF" />
                      <Text style={styles.detailText}>
                        {new Date(project.startDate).toLocaleDateString()} -{" "}
                        {new Date(project.targetDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="Banknote" size={14} color="#9CA3AF" />
                      <Text style={styles.detailText}>
                        Budget: ₱{project.budget.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="Leaf" size={14} color="#9CA3AF" />
                      <Text style={styles.detailText}>Species: {project.species.join(", ")}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

      <FloatingActionButton onPress={() => setShowAddDialog(true)} />

      {/* Add Project Dialog */}
      <Portal>
        <Dialog visible={showAddDialog} onDismiss={() => setShowAddDialog(false)} style={styles.dialog}>
          <Dialog.Title>New Greening Project</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Create a new urban greening project for tree replacement or new planting initiatives.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddDialog(false)}>Cancel</Button>
            <Button mode="contained" onPress={() => setShowAddDialog(false)}>
              Create Project
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
  segmentedButtons: {
    backgroundColor: "#FFFFFF",
  },
  projectsList: {
    gap: 12,
  },
  projectCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  projectIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  projectLocation: {
    fontSize: 13,
    color: "#6B7280",
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
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  progressText: {
    fontSize: 13,
    color: "#6B7280",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "right",
  },
  projectDetails: {
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
    flex: 1,
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
