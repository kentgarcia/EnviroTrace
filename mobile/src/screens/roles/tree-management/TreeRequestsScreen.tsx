import React, { useState, useEffect } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    RefreshControl,
    FlatList,
    TouchableOpacity,
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
    Divider,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../components/icons/Icon";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import StandardHeader from "../../../components/layout/StandardHeader";

// Mock data - replace with actual database/API calls
const mockRequests = [
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
    },
];

export default function TreeRequestsScreen() {
    const { colors } = useTheme();
    const [requests, setRequests] = useState(mockRequests);
    const [filteredRequests, setFilteredRequests] = useState(mockRequests);
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [selectedType, setSelectedType] = useState<string>("");

    const navigation = useNavigation();

    // Load requests from database/API
    const loadRequests = async () => {
        try {
            setLoading(true);
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
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
            filtered = filtered.filter((request) => request.status === selectedStatus);
        }

        // Apply type filter
        if (selectedType) {
            filtered = filtered.filter((request) => request.request_type === selectedType);
        }

        setFilteredRequests(filtered);
    }, [requests, searchQuery, selectedStatus, selectedType]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await loadRequests();
        } catch (error) {
            console.error("Refresh error:", error);
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadRequests();
        }, [])
    );

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
            default: return "#9E9E9E";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "filed": return "Filed";
            case "on_hold": return "On Hold";
            case "for_signature": return "For Signature";
            case "payment_pending": return "Payment Pending";
            default: return status;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "pruning": return "content-cut";
            case "cutting": return "dangerous";
            case "violation_complaint": return "report";
            default: return "assignment";
        }
    };

    const renderRequestItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate("RequestDetail" as never, { requestId: item.id } as never)}
        >
            <Card style={styles.requestCard}>
                <Card.Content>
                    <View style={styles.requestHeader}>
                        <View style={styles.requestHeaderLeft}>
                            <Icon
                                name={getTypeIcon(item.request_type)}
                                size={20}
                                color={colors.primary}
                                style={styles.typeIcon}
                            />
                            <View>
                                <Paragraph style={styles.requestNumber}>{item.request_number}</Paragraph>
                                <Paragraph style={styles.requestType}>
                                    {getRequestTypeLabel(item.request_type)}
                                </Paragraph>
                            </View>
                        </View>
                        <Chip
                            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + "20" }]}
                            textStyle={[styles.statusChipText, { color: getStatusColor(item.status) }]}
                        >
                            {getStatusLabel(item.status)}
                        </Chip>
                    </View>

                    <View style={styles.requestDetails}>
                        <View style={styles.detailRow}>
                            <Icon name="person" size={16} color="#666" />
                            <Paragraph style={styles.detailText}>{item.requester_name}</Paragraph>
                        </View>
                        <View style={styles.detailRow}>
                            <Icon name="location-on" size={16} color="#666" />
                            <Paragraph style={styles.detailText} numberOfLines={2}>
                                {item.property_address}
                            </Paragraph>
                        </View>
                        <View style={styles.detailRow}>
                            <Icon name="event" size={16} color="#666" />
                            <Paragraph style={styles.detailText}>{item.request_date}</Paragraph>
                        </View>
                        {item.trees_and_quantities && item.trees_and_quantities.length > 0 && (
                            <View style={styles.detailRow}>
                                <Icon name="park" size={16} color="#666" />
                                <Paragraph style={styles.detailText}>
                                    {item.trees_and_quantities.join(", ")}
                                </Paragraph>
                            </View>
                        )}
                    </View>

                    {item.notes && (
                        <>
                            <Divider style={styles.notesDivider} />
                            <View style={styles.notesSection}>
                                <Icon name="note" size={16} color="#666" />
                                <Paragraph style={styles.notesText} numberOfLines={2}>
                                    {item.notes}
                                </Paragraph>
                            </View>
                        </>
                    )}
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    const clearFilters = () => {
        setSelectedStatus("");
        setSelectedType("");
        setFilterModalVisible(false);
    };

    const applyFilters = () => {
        setFilterModalVisible(false);
    };

    return (
        <>
            <StandardHeader
                title="Tree Requests"
                showBack={true}
                onBack={() => navigation.goBack()}
            />
            <SafeAreaView style={styles.container}>
                <View style={styles.searchContainer}>
                    <Searchbar
                        placeholder="Search requests..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                    />
                    <IconButton
                        icon="filter-list"
                        size={24}
                        onPress={() => setFilterModalVisible(true)}
                        style={styles.filterButton}
                    />
                </View>

                {/* Active Filters */}
                {(selectedStatus || selectedType) && (
                    <View style={styles.activeFiltersContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {selectedStatus && (
                                <Chip
                                    onClose={() => setSelectedStatus("")}
                                    style={styles.filterChip}
                                >
                                    Status: {getStatusLabel(selectedStatus)}
                                </Chip>
                            )}
                            {selectedType && (
                                <Chip
                                    onClose={() => setSelectedType("")}
                                    style={styles.filterChip}
                                >
                                    Type: {getRequestTypeLabel(selectedType)}
                                </Chip>
                            )}
                        </ScrollView>
                    </View>
                )}

                <FlatList
                    data={filteredRequests}
                    renderItem={renderRequestItem}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />

                {/* Filter Modal */}
                <Portal>
                    <Modal
                        visible={filterModalVisible}
                        onDismiss={() => setFilterModalVisible(false)}
                        contentContainerStyle={styles.modalContent}
                    >
                        <Title style={styles.modalTitle}>Filter Requests</Title>

                        <View style={styles.filterSection}>
                            <Paragraph style={styles.filterLabel}>Status</Paragraph>
                            {["filed", "on_hold", "for_signature", "payment_pending"].map((status) => (
                                <List.Item
                                    key={status}
                                    title={getStatusLabel(status)}
                                    onPress={() => setSelectedStatus(selectedStatus === status ? "" : status)}
                                    left={() => (
                                        <Icon
                                            name={selectedStatus === status ? "radio-button-checked" : "radio-button-unchecked"}
                                            size={20}
                                            color={colors.primary}
                                        />
                                    )}
                                />
                            ))}
                        </View>

                        <View style={styles.filterSection}>
                            <Paragraph style={styles.filterLabel}>Request Type</Paragraph>
                            {["pruning", "cutting", "violation_complaint"].map((type) => (
                                <List.Item
                                    key={type}
                                    title={getRequestTypeLabel(type)}
                                    onPress={() => setSelectedType(selectedType === type ? "" : type)}
                                    left={() => (
                                        <Icon
                                            name={selectedType === type ? "radio-button-checked" : "radio-button-unchecked"}
                                            size={20}
                                            color={colors.primary}
                                        />
                                    )}
                                />
                            ))}
                        </View>

                        <View style={styles.modalActions}>
                            <Button mode="outlined" onPress={clearFilters} style={styles.modalButton}>
                                Clear
                            </Button>
                            <Button mode="contained" onPress={applyFilters} style={styles.modalButton}>
                                Apply
                            </Button>
                        </View>
                    </Modal>
                </Portal>

                <FAB
                    icon="add"
                    style={styles.fab}
                    onPress={() => navigation.navigate("AddRequest" as never)}
                />
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    searchContainer: {
        flexDirection: "row",
        padding: 16,
        alignItems: "center",
    },
    searchBar: {
        flex: 1,
        marginRight: 8,
    },
    filterButton: {
        margin: 0,
    },
    activeFiltersContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    filterChip: {
        marginRight: 8,
    },
    listContainer: {
        padding: 16,
        paddingTop: 0,
    },
    requestCard: {
        marginBottom: 12,
        elevation: 2,
    },
    requestHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    requestHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    typeIcon: {
        marginRight: 8,
    },
    requestNumber: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    requestType: {
        fontSize: 12,
        color: "#666",
    },
    statusChip: {
        height: 28,
    },
    statusChipText: {
        fontSize: 11,
        fontWeight: "500",
    },
    requestDetails: {
        marginTop: 8,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 6,
    },
    detailText: {
        fontSize: 13,
        color: "#666",
        marginLeft: 8,
        flex: 1,
    },
    notesDivider: {
        marginVertical: 8,
    },
    notesSection: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    notesText: {
        fontSize: 12,
        color: "#666",
        marginLeft: 8,
        fontStyle: "italic",
        flex: 1,
    },
    fab: {
        position: "absolute",
        bottom: 16,
        right: 16,
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        margin: 20,
        borderRadius: 8,
        maxHeight: "80%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 16,
    },
    filterSection: {
        marginBottom: 16,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 8,
        color: "#333",
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 16,
    },
    modalButton: {
        marginLeft: 8,
    },
});
