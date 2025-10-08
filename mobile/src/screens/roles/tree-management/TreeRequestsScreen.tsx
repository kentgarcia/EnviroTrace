import React, { useState, useEffect } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    RefreshControl,
    FlatList,
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
            style={[styles.requestCard, { borderColor: `${colors.primary}26` }]}
            onPress={() => handleRequestPress(request)}
        >
            <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <View style={styles.requestInfo}>
                        <Title style={[styles.requestNumber, { color: colors.primary }]}>
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
        <>
            <StandardHeader
                title="Tree Requests"
               
            />
            <View style={styles.container}>
                {/* Search and Filter Section */}
                <View style={styles.searchSection}>
                    <Searchbar
                        placeholder="Search requests..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                        inputStyle={styles.searchInput}
                    />
                    <View style={styles.filterRow}>
                        <IconButton
                            icon="filter-list"
                            mode="contained-tonal"
                            onPress={() => setFilterModalVisible(true)}
                            style={[
                                styles.filterButton,
                                hasActiveFilters && { backgroundColor: colors.primary + "20" },
                            ]}
                            iconColor={hasActiveFilters ? colors.primary : undefined}
                        />
                        {hasActiveFilters && (
                            <Button mode="text" onPress={clearFilters} compact>
                                Clear Filters
                            </Button>
                        )}
                    </View>
                </View>

                {/* Requests List */}
                <FlatList
                    data={filteredRequests}
                    renderItem={renderRequestCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
                />

                {/* Floating Action Button */}
                <FAB
                    icon="add"
                    style={[styles.fab, { backgroundColor: colors.primary }]}
                    onPress={handleAddRequest}
                    label="Add Request"
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
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAFAFA",
    },
    searchSection: {
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    searchBar: {
        marginBottom: 8,
    },
    searchInput: {
        fontSize: 16,
    },
    filterRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    filterButton: {
        margin: 0,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    requestCard: {
        marginBottom: 12,
        borderRadius: 12,
    },
    cardContent: {
        padding: 16,
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
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2,
    },
    requesterName: {
        fontSize: 14,
        color: "#666666",
    },
    statusContainer: {
        alignItems: "flex-end",
        gap: 4,
    },
    pendingChip: {
        backgroundColor: "#FFF3E0",
    },
    statusChip: {
        height: 28,
    },
    chipText: {
        fontSize: 11,
        fontWeight: "500",
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
        fontSize: 13,
        color: "#666666",
        flex: 1,
        lineHeight: 18,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        paddingVertical: 64,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#666666",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: "#999999",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 24,
    },
    emptyButton: {
        paddingHorizontal: 24,
    },
    fab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
    },
    modalContainer: {
        backgroundColor: "#FFFFFF",
        margin: 20,
        borderRadius: 12,
        padding: 20,
        maxHeight: "80%",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 16,
        textAlign: "center",
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
    },
    filterChip: {
        marginBottom: 8,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 24,
    },
});
