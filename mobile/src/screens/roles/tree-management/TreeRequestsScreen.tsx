import React, { useState, useEffect } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    RefreshControl,
    FlatList,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import {
    Card,
    Title,
    Paragraph,
    Button,
    Chip,
    Portal,
    Dialog,
    Divider,
    useTheme,
    Text,
} from "react-native-paper";
import Icon from "../../../components/icons/Icon";
import { Dropdown } from "react-native-element-dropdown";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ScreenLayout from "../../../components/layout/ScreenLayout";
import { treeManagementService, TreeManagementRequest } from "../../../core/api/tree-management-service";

export default function TreeRequestsScreen() {
    const { colors } = useTheme();
    const [requests, setRequests] = useState<TreeManagementRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<TreeManagementRequest[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [selectedType, setSelectedType] = useState<string>("");

    const navigation = useNavigation();

    // Load requests from API
    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await treeManagementService.getRequests({ limit: 1000 });
            setRequests(data);
            setFilteredRequests(data);
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
        await loadRequests();
        setRefreshing(false);
    };

    const handleRequestPress = (request: TreeManagementRequest) => {
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

    const renderRequestCard = ({ item: request }: { item: TreeManagementRequest }) => (
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
                        <Chip
                            compact
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
                        <Icon name="MapPin" size={16} color="#757575" />
                        <Paragraph style={styles.detailText}>
                            {request.property_address}
                        </Paragraph>
                    </View>
                    <View style={styles.detailRow}>
                        <Icon name="TreeDeciduous" size={16} color="#757575" />
                        <Paragraph style={styles.detailText}>
                            {getRequestTypeLabel(request.request_type)} • {request.trees_and_quantities ? request.trees_and_quantities.join(", ") : "No trees specified"}
                        </Paragraph>
                    </View>
                    <View style={styles.detailRow}>
                        <Icon name="User" size={16} color="#757575" />
                        <Paragraph style={styles.detailText}>
                            {(request.inspectors && request.inspectors.length > 0)
                                ? `Inspectors: ${request.inspectors.join(", ")}`
                                : "No inspectors assigned"
                            }
                        </Paragraph>
                    </View>
                    {request.updated_at && (
                        <View style={styles.detailRow}>
                            <Icon name="Calendar" size={16} color="#757575" />
                            <Paragraph style={styles.detailText}>
                                Last updated:{" "}
                                {new Date(request.updated_at).toLocaleDateString()}
                            </Paragraph>
                        </View>
                    )}
                    {request.notes && (
                        <View style={styles.detailRow}>
                            <Icon name="FileText" size={16} color="#757575" />
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
            <Icon name="ClipboardList" size={64} color="#BDBDBD" />
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
        <ScreenLayout
            header={{
                title: "Tree Requests",
                subtitle: `${filteredRequests.length} Total`,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                statusBarStyle: "dark",
                borderColor: "#E5E7EB",
                titleSize: 22,
                subtitleSize: 12,
                iconSize: 20,
            }}
        >
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
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#111827"]}
                            tintColor="#111827"
                        />
                    }
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={<View style={{ height: 20 }} />}
                />

                {/* Filter Modal */}
                <Portal>
                    <Dialog
                        visible={filterModalVisible}
                        onDismiss={() => setFilterModalVisible(false)}
                        style={styles.dialog}
                        dismissable
                    >
                        <View style={styles.dialogHeader}>
                            <Text style={styles.dialogTitleText}>Filter Requests</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                                <Icon name="X" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dialogContent}>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Status Filter */}
                                <View style={styles.filterSection}>
                                    <Text style={styles.filterLabel}>Status</Text>
                                    <Dropdown
                                        data={[
                                            { label: "All Statuses", value: "" },
                                            { label: "Filed", value: "filed" },
                                            { label: "On Hold", value: "on_hold" },
                                            { label: "For Signature", value: "for_signature" },
                                            { label: "Payment Pending", value: "payment_pending" },
                                        ]}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Select status"
                                        value={selectedStatus}
                                        onChange={(item) => setSelectedStatus(item.value)}
                                        style={styles.dropdown}
                                        placeholderStyle={styles.dropdownPlaceholder}
                                        selectedTextStyle={styles.dropdownSelectedText}
                                        containerStyle={styles.dropdownContainer}
                                        maxHeight={300}
                                        renderRightIcon={() => (
                                            <Icon name="ChevronDown" size={20} color="#6B7280" />
                                        )}
                                        renderItem={(item) => (
                                            <View style={styles.dropdownItem}>
                                                <Text style={styles.dropdownItemText}>
                                                    {item.label}
                                                </Text>
                                            </View>
                                        )}
                                    />
                                </View>

                                <Divider style={styles.divider} />

                                {/* Type Filter */}
                                <View style={styles.filterSection}>
                                    <Text style={styles.filterLabel}>Request Type</Text>
                                    <Dropdown
                                        data={[
                                            { label: "All Types", value: "" },
                                            { label: "Pruning", value: "pruning" },
                                            { label: "Cutting", value: "cutting" },
                                            { label: "Violation Complaint", value: "violation_complaint" },
                                        ]}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Select request type"
                                        value={selectedType}
                                        onChange={(item) => setSelectedType(item.value)}
                                        style={styles.dropdown}
                                        placeholderStyle={styles.dropdownPlaceholder}
                                        selectedTextStyle={styles.dropdownSelectedText}
                                        containerStyle={styles.dropdownContainer}
                                        maxHeight={300}
                                        renderRightIcon={() => (
                                            <Icon name="ChevronDown" size={20} color="#6B7280" />
                                        )}
                                        renderItem={(item) => (
                                            <View style={styles.dropdownItem}>
                                                <Text style={styles.dropdownItemText}>
                                                    {item.label}
                                                </Text>
                                            </View>
                                        )}
                                    />
                                </View>
                            </ScrollView>
                        </View>

                        <Dialog.Actions style={styles.dialogActions}>
                            <View style={styles.dialogActionsContent}>
                                <Button
                                    mode="outlined"
                                    onPress={() => {
                                        clearFilters();
                                        setFilterModalVisible(false);
                                    }}
                                    style={styles.dialogButtonOutlined}
                                    textColor="#6B7280"
                                >
                                    Reset
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={() => setFilterModalVisible(false)}
                                    style={styles.dialogButtonContained}
                                    buttonColor="#111827"
                                >
                                    Apply Filters
                                </Button>
                            </View>
                        </Dialog.Actions>
                    </Dialog>
                    </Portal>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
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
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#111827",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    addButtonText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: -0.2,
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
        height: 22,
        borderWidth: 1.5,
        borderRadius: 6,
    },
    chipText: {
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 0.2,
        marginVertical: 0,
        marginHorizontal: 0,
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
    dialog: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        maxWidth: 500,
        alignSelf: "center",
        width: "90%",
    },
    dialogHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
    },
    dialogTitleText: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
        letterSpacing: -0.5,
    },
    dialogContent: {
        maxHeight: 400,
    },
    filterSection: {
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: "#374151",
        marginBottom: 10,
        letterSpacing: -0.2,
    },
    dropdown: {
        backgroundColor: "#F9FAFB",
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        minHeight: 48,
    },
    dropdownPlaceholder: {
        fontSize: 14,
        color: "#9CA3AF",
        fontWeight: "500",
    },
    dropdownSelectedText: {
        fontSize: 14,
        color: "#111827",
        fontWeight: "600",
    },
    dropdownContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    dropdownItem: {
        paddingHorizontal: 18,
        paddingVertical: 14,
    },
    dropdownItemText: {
        fontSize: 14,
        color: "#4B5563",
        fontWeight: "500",
    },
    divider: {
        backgroundColor: "#E5E7EB",
        height: 1,
    },
    dialogActions: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        gap: 12,
        paddingBottom: 0,
    },
    dialogActionsContent: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },
    dialogButtonOutlined: {
        flex: 1,
        borderRadius: 12,
        borderColor: "#D1D5DB",
        borderWidth: 1.5,
    },
    dialogButtonContained: {
        flex: 1,
        borderRadius: 12,
    },
});
