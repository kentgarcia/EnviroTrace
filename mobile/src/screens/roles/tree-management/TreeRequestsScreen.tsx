import React, { useState, useEffect } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    RefreshControl,
    FlatList,
    TouchableOpacity,
    TextInput,
} from "react-native";
import {
    Card,
    Title,
    Paragraph,
    Button,
    Searchbar,
    Chip,
    FAB,
    Portal,
    Modal,
    List,
    IconButton,
    useTheme,
    Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../components/icons/Icon";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import StandardHeader from "../../../components/layout/StandardHeader";

import { useNetworkSync } from "../../../hooks/useNetworkSync";

// Mock data structure for tree requests
interface LocalTreeRequest {
    id: string;
    request_number: string;
    request_type: string;
    requester_name: string;
    property_address: string;
    status: string;
    request_date: string;
    trees_and_quantities: string[];
    inspectors: string[];
    notes: string;
    sync_status?: string;
    latest_update_date?: string;
}

export default function TreeRequestsScreen() {
    const { colors } = useTheme();
    const [requests, setRequests] = useState<LocalTreeRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<LocalTreeRequest[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [selectedType, setSelectedType] = useState<string>("");

    const navigation = useNavigation();
    const { syncData, isSyncing } = useNetworkSync();

    // Mock data - replace with actual database/API calls
    const mockRequests: LocalTreeRequest[] = [
        {
            id: "1",
            request_number: "TM-PR-2025-001",
            request_type: "pruning",
            requester_name: "Maria Santos",
            property_address: "123 Rizal Ave., Manila",
            status: "filed",
            request_date: "2025-01-15",
            trees_and_quantities: ["Acacia: 2", "Mahogany: 1"],
            inspectors: ["Inspector Rodriguez"],
            notes: "Trees blocking power lines",
            sync_status: "synced",
            latest_update_date: "2025-01-15",
        },
        {
            id: "2",
            request_number: "TM-CT-2025-002",
            request_type: "cutting",
            requester_name: "Juan Cruz",
            property_address: "456 Mabini Ave., Manila",
            status: "payment_pending",
            request_date: "2025-01-14",
            trees_and_quantities: ["Narra: 1"],
            inspectors: ["Inspector Santos"],
            notes: "Dead tree posing safety risk",
            sync_status: "pending",
            latest_update_date: "2025-01-14",
        },
        {
            id: "3",
            request_number: "TM-VC-2025-003",
            request_type: "violation_complaint",
            requester_name: "Lisa Garcia",
            property_address: "789 Del Pilar St., Makati",
            status: "for_signature",
            request_date: "2025-01-13",
            trees_and_quantities: ["Mango: 3"],
            inspectors: ["Inspector Dela Cruz", "Inspector Martinez"],
            notes: "Unauthorized tree cutting complaint",
            sync_status: "synced",
            latest_update_date: "2025-01-13",
        },
        {
            id: "4",
            request_number: "TM-PR-2025-004",
            request_type: "pruning",
            requester_name: "Robert Tan",
            property_address: "321 Quezon Blvd., Quezon City",
            status: "on_hold",
            request_date: "2025-01-12",
            trees_and_quantities: ["Balete: 1", "Acacia: 2"],
            inspectors: [],
            notes: "Waiting for property owner consent",
            sync_status: "synced",
            latest_update_date: "2025-01-12",
        },
    ];

    // Load requests from database
    const loadRequests = async () => {
        try {
            setLoading(true);
            // Replace with actual database call when available
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
            setRequests(mockRequests);
            setFilteredRequests(mockRequests);
        } catch (error) {
            console.error("Error loading tree requests:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter requests based on search and filters
    useEffect(() => {
        let filtered = requests;

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(
                (request) =>
                    request.requester_name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    request.request_number
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    request.property_address
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
            );
        }

        // Apply status filter
        if (selectedStatus) {
            filtered = filtered.filter(
                (request) => request.status === selectedStatus
            );
        }

        // Apply type filter
        if (selectedType) {
            filtered = filtered.filter(
                (request) => request.request_type === selectedType
            );
        }

        setFilteredRequests(filtered);
    }, [requests, searchQuery, selectedStatus, selectedType]);

    // Load data on mount
    useEffect(() => {
        loadRequests();
    }, []);

    // Reload when returning to this screen
    useFocusEffect(
        React.useCallback(() => {
            loadRequests();
            return () => { };
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadRequests(), syncData()]);
        setRefreshing(false);
    };

    const handleRequestPress = (request: LocalTreeRequest) => {
        (navigation as any).navigate("RequestDetail", { requestId: request.id });
    };

    const handleAddRequest = () => {
        (navigation as any).navigate("AddRequest");
    };

    const getRequestTypeLabel = (type: string) => {
        switch (type) {
            case "pruning": return "Pruning";
            case "cutting": return "Tree Cutting";
            case "violation_complaint": return "Violation/Complaint";
            default: return type;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "filed": return "#2196F3";
            case "on_hold": return "#9E9E9E";
            case "for_signature": return "#9C27B0";
            case "payment_pending": return "#FF9800";
            case "completed": return "#4CAF50";
            default: return "#9E9E9E";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "filed": return "Filed";
            case "on_hold": return "On Hold";
            case "for_signature": return "For Signature";
            case "payment_pending": return "Payment Pending";
            case "completed": return "Completed";
            default: return status;
        }
    };

    const renderRequestCard = ({ item: request }: { item: LocalTreeRequest }) => (
        <Card
            mode="outlined"
            style={styles.requestCard}
            onPress={() => handleRequestPress(request)}
        >
            <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <View style={styles.requestInfo}>
                        <Title style={styles.requestNumber}>
                            {request.request_number}
                        </Title>
                        <Paragraph style={styles.requesterName}>
                            {request.requester_name}
                        </Paragraph>
                    </View>
                    <View style={styles.statusContainer}>
                        {request.sync_status === "pending" && (
                            <Chip
                                compact
                                icon="sync"
                                style={styles.pendingChip}
                                textStyle={styles.chipText}
                            >
                                Pending
                            </Chip>
                        )}
                        <Chip
                            compact
                            icon={
                                request.status === "completed" ? "check-circle" :
                                    request.status === "on_hold" ? "pause-circle" : "schedule"
                            }
                            style={[
                                styles.statusChip,
                                {
                                    backgroundColor: `${getStatusColor(request.status)}20`,
                                },
                            ]}
                            textStyle={[
                                styles.chipText,
                                { color: getStatusColor(request.status) },
                            ]}
                        >
                            {getStatusLabel(request.status)}
                        </Chip>
                    </View>
                </View>

                <View style={styles.requestDetails}>
                    <View style={styles.detailRow}>
                        <Icon name="location-on" size={16} color="#757575" />
                        <Paragraph style={styles.detailText}>
                            {request.property_address}
                        </Paragraph>
                    </View>
                    <View style={styles.detailRow}>
                        <Icon name="park" size={16} color="#757575" />
                        <Paragraph style={styles.detailText}>
                            {getRequestTypeLabel(request.request_type)} • {request.trees_and_quantities.join(", ")}
                        </Paragraph>
                    </View>
                    <View style={styles.detailRow}>
                        <Icon name="people" size={16} color="#757575" />
                        <Paragraph style={styles.detailText}>
                            {request.inspectors.length > 0
                                ? `Inspectors: ${request.inspectors.join(", ")}`
                                : "No inspectors assigned"
                            }
                        </Paragraph>
                    </View>
                    {request.latest_update_date && (
                        <View style={styles.detailRow}>
                            <Icon name="event" size={16} color="#757575" />
                            <Paragraph style={styles.detailText}>
                                Last updated:{" "}
                                {new Date(request.latest_update_date).toLocaleDateString()}
                            </Paragraph>
                        </View>
                    )}
                    {request.notes && (
                        <View style={styles.detailRow}>
                            <Icon name="note" size={16} color="#757575" />
                            <Paragraph style={styles.detailText} numberOfLines={2}>
                                {request.notes}
                            </Paragraph>
                        </View>
                    )}
                </View>
            </Card.Content>
        </Card>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="assignment" size={64} color="#BDBDBD" />
            <Title style={styles.emptyTitle}>No requests found</Title>
            <Paragraph style={styles.emptyText}>
                {searchQuery || selectedStatus || selectedType
                    ? "Try adjusting your search or filters"
                    : "Add your first tree management request"}
            </Paragraph>
            {!searchQuery && !selectedStatus && !selectedType && (
                <Button
                    mode="contained"
                    onPress={handleAddRequest}
                    style={styles.emptyButton}
                >
                    Add Request
                </Button>
            )}
        </View>
    );

    const clearFilters = () => {
        setSelectedStatus("");
        setSelectedType("");
        setSearchQuery("");
    };

    const hasActiveFilters = selectedStatus || selectedType;

    return (
        <View style={styles.root}>
            <StandardHeader
                title="Tree Requests"
                subtitle={`${filteredRequests.length} Total`}
                backgroundColor="rgba(255, 255, 255, 0.95)"
                statusBarStyle="dark"
                borderColor="#E5E7EB"
                rightActionIcon="RefreshCw"
                onRightActionPress={() => syncData()}
                titleSize={22}
                subtitleSize={12}
                iconSize={20}
            />

            <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
                {/* Search bar with filter button */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Icon name="Search" size={18} color="#6B7280" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search requests..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#9CA3AF"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <Icon name="X" size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setFilterModalVisible(true)}
                    >
                        <Icon name="Filter" size={20} color="#FFFFFF" />
                        {hasActiveFilters && (
                            <View style={styles.filterBadge} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Active filters */}
                {hasActiveFilters && (
                    <View style={styles.activeFiltersContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.activeFiltersContent}
                        >
                            {selectedStatus && (
                                <Chip
                                    compact
                                    mode="flat"
                                    onClose={() => setSelectedStatus("")}
                                    style={styles.activeFilterChip}
                                    textStyle={styles.activeFilterText}
                                >
                                    {getStatusLabel(selectedStatus)}
                                </Chip>
                            )}
                            {selectedType && (
                                <Chip
                                    compact
                                    mode="flat"
                                    onClose={() => setSelectedType("")}
                                    style={styles.activeFilterChip}
                                    textStyle={styles.activeFilterText}
                                >
                                    {getRequestTypeLabel(selectedType)}
                                </Chip>
                            )}
                            <TouchableOpacity
                                onPress={clearFilters}
                                style={styles.clearAllButton}
                            >
                                <Text style={styles.clearAllText}>Clear All</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                )}

                {/* Request count summary */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryText}>
                        {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""}
                        {searchQuery && " found"}
                    </Text>
                    <TouchableOpacity
                        onPress={handleAddRequest}
                        style={styles.addButton}
                    >
                        <Icon name="Plus" size={16} color="#FFFFFF" />
                        <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                </View>

                {/* Requests List */}
                <FlatList
                    data={filteredRequests}
                    renderItem={renderRequestCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing || isSyncing}
                            onRefresh={onRefresh}
                            colors={["#111827"]}
                            tintColor="#111827"
                        />
                    }
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
                />

                {/* Filter Modal */}
                <Portal>
                    <Modal
                        visible={filterModalVisible}
                        onDismiss={() => setFilterModalVisible(false)}
                        contentContainerStyle={styles.modalContainer}
                    >
                        <Title style={styles.modalTitle}>Filter Requests</Title>

                        {/* Status Filter */}
                        <List.Subheader>Status</List.Subheader>
                        <View style={styles.chipContainer}>
                            {["filed", "on_hold", "for_signature", "payment_pending", "completed"].map((status) => (
                                <Chip
                                    key={status}
                                    selected={selectedStatus === status}
                                    onPress={() =>
                                        setSelectedStatus(selectedStatus === status ? "" : status)
                                    }
                                    style={styles.filterChip}
                                >
                                    {getStatusLabel(status)}
                                </Chip>
                            ))}
                        </View>

                        {/* Type Filter */}
                        <List.Subheader>Request Type</List.Subheader>
                        <View style={styles.chipContainer}>
                            {["pruning", "cutting", "violation_complaint"].map((type) => (
                                <Chip
                                    key={type}
                                    selected={selectedType === type}
                                    onPress={() =>
                                        setSelectedType(selectedType === type ? "" : type)
                                    }
                                    style={styles.filterChip}
                                >
                                    {getRequestTypeLabel(type)}
                                </Chip>
                            ))}
                        </View>

                        <View style={styles.modalActions}>
                            <Button
                                mode="outlined"
                                onPress={() => {
                                    clearFilters();
                                    setFilterModalVisible(false);
                                }}
                            >
                                Clear All
                            </Button>
                            <Button
                                mode="contained"
                                onPress={() => setFilterModalVisible(false)}
                            >
                                Apply
                            </Button>
                        </View>
                    </Modal>
                </Portal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    safeArea: {
        flex: 1,
        backgroundColor: "transparent",
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: "500",
        color: "#111827",
        paddingVertical: 0,
        marginLeft: 8,
    },
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: "#111827",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    filterBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#60A5FA",
    },
    activeFiltersContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        backgroundColor: "#FFFFFF",
    },
    activeFiltersContent: {
        gap: 8,
        paddingRight: 16,
    },
    activeFilterChip: {
        height: 32,
        backgroundColor: "#EFF6FF",
        borderWidth: 1.5,
        borderColor: "#60A5FA",
    },
    activeFilterText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#1E40AF",
    },
    clearAllButton: {
        paddingHorizontal: 12,
    },
    clearAllText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#DC2626",
    },
    summaryContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    summaryText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6B7280",
        letterSpacing: -0.2,
    },
    addButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#111827",
        borderRadius: 10,
    },
    addButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    listContainer: {
        padding: 16,
        paddingTop: 8,
    },
    requestCard: {
        marginBottom: 12,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        elevation: 0,
    },
    cardContent: {
        padding: 14,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    requestInfo: {
        flex: 1,
    },
    requestNumber: {
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 2,
        color: "#111827",
        letterSpacing: -0.3,
    },
    requesterName: {
        fontSize: 13,
        color: "#6B7280",
        fontWeight: "500",
    },
    statusContainer: {
        alignItems: "flex-end",
        gap: 4,
    },
    pendingChip: {
        backgroundColor: "#FEF3C7",
        borderWidth: 1.5,
        borderColor: "#FCD34D",
    },
    statusChip: {
        height: 26,
        borderWidth: 1.5,
    },
    chipText: {
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    requestDetails: {
        gap: 6,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
    },
    detailText: {
        fontSize: 12,
        color: "#6B7280",
        flex: 1,
        lineHeight: 18,
        fontWeight: "500",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        paddingVertical: 64,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1F2937",
        marginTop: 16,
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    emptyText: {
        fontSize: 13,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 24,
        fontWeight: "500",
    },
    emptyButton: {
        paddingHorizontal: 24,
        backgroundColor: "#111827",
    },
    fab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: "#111827",
    },
    modalContainer: {
        backgroundColor: "#FFFFFF",
        margin: 20,
        borderRadius: 16,
        padding: 24,
        maxHeight: "80%",
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
    },
    modalTitle: {
        fontSize: 19,
        fontWeight: "800",
        marginBottom: 16,
        textAlign: "center",
        color: "#111827",
        letterSpacing: -0.4,
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
    },
    filterChip: {
        marginBottom: 8,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 24,
    },
});
