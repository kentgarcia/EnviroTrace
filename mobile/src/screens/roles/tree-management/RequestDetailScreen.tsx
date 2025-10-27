import React, { useState, useEffect } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    Alert,
    TouchableOpacity,
} from "react-native";
import {
    Card,
    Title,
    Paragraph,
    Button,
    Chip,
    Divider,
    useTheme,
    IconButton,
    Portal,
    Modal,
    TextInput,
    Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../components/icons/Icon";
import { useNavigation, useRoute } from "@react-navigation/native";
import StandardHeader from "../../../components/layout/StandardHeader";

// Mock data - replace with actual API calls
const mockRequestDetails = {
    id: "1",
    request_number: "TM-PR-2025-001",
    request_type: "pruning",
    requester_name: "Maria Santos",
    property_address: "123 Rizal Ave., Manila, Philippines",
    status: "filed",
    request_date: "2025-01-15",
    trees_and_quantities: ["Acacia: 2 trees", "Mahogany: 1 tree"],
    inspectors: ["Inspector Rodriguez", "Inspector Santos"],
    notes: "Trees are blocking power lines and need immediate attention. Property owner has given consent for pruning work.",
    picture_links: [
        "https://example.com/tree1.jpg",
        "https://example.com/tree2.jpg",
    ],
    fee_record_id: "FEE-2025-001",
    created_at: "2025-01-15T09:30:00Z",
    updated_at: "2025-01-16T14:20:00Z",
};

export default function RequestDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { colors } = useTheme();
    const { requestId } = route.params as { requestId: string };

    const [request, setRequest] = useState(mockRequestDetails);
    const [loading, setLoading] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editField, setEditField] = useState<string>("");
    const [editValue, setEditValue] = useState<string>("");

    useEffect(() => {
        loadRequestDetails();
    }, [requestId]);

    const loadRequestDetails = async () => {
        try {
            setLoading(true);
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setRequest(mockRequestDetails);
        } catch (error) {
            console.error("Error loading request details:", error);
            Alert.alert("Error", "Failed to load request details");
        } finally {
            setLoading(false);
        }
    };

    const getRequestTypeLabel = (type: string) => {
        switch (type) {
            case "pruning": return "Tree Pruning";
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
            case "pruning": return "TreeDeciduous";
            case "cutting": return "TreeDeciduous";
            case "violation_complaint": return "AlertCircle";
            default: return "ClipboardList";
        }
    };

    const handleEditField = (field: string, currentValue: string) => {
        setEditField(field);
        setEditValue(currentValue);
        setEditModalVisible(true);
    };

    const handleSaveEdit = async () => {
        try {
            setLoading(true);
            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setRequest(prev => ({
                ...prev,
                [editField]: editValue,
            }));

            setEditModalVisible(false);
            Alert.alert("Success", "Request updated successfully");
        } catch (error) {
            console.error("Error updating request:", error);
            Alert.alert("Error", "Failed to update request");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = () => {
        const statusOptions = [
            { value: "filed", label: "Filed" },
            { value: "on_hold", label: "On Hold" },
            { value: "for_signature", label: "For Signature" },
            { value: "payment_pending", label: "Payment Pending" },
        ];

        const buttons = statusOptions.map(option => ({
            text: option.label,
            onPress: () => handleEditField("status", option.value),
        }));
        buttons.push({ text: "Cancel", onPress: () => { } });

        Alert.alert(
            "Change Status",
            "Select new status:",
            buttons
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading && !request) {
        return (
            <View style={styles.root}>
                <StandardHeader
                    title="Request Details"
                    titleSize={22}
                    showBack={true}
                    onBack={() => navigation.goBack()}
                />
                <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading request details...</Text>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <StandardHeader
                title="Request Details"
                titleSize={22}
                showBack={true}
                onBack={() => navigation.goBack()}
            />
            <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section */}
                    <View style={styles.section}>
                        <View style={styles.card}>
                            <View style={styles.cardContent}>
                                <View style={styles.headerSection}>
                                    <View style={styles.headerLeft}>
                                        <Icon
                                            name={getTypeIcon(request.request_type)}
                                            size={18}
                                            color="#111827"
                                            style={styles.headerIcon}
                                        />
                                        <View>
                                            <Text style={styles.requestNumber}>{request.request_number}</Text>
                                            <Text style={styles.requestType}>
                                                {getRequestTypeLabel(request.request_type)}
                                            </Text>
                                        </View>
                                    </View>
                                    <Chip
                                        style={[styles.statusChip, { backgroundColor: getStatusColor(request.status) + "20" }]}
                                        textStyle={[styles.statusChipText, { color: getStatusColor(request.status) }]}
                                    >
                                        {getStatusLabel(request.status)}
                                    </Chip>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Requester Information */}
                    <View style={styles.section}>
                        <View style={styles.card}>
                            <View style={styles.cardContent}>
                                <Text style={styles.sectionTitle}>Requester Information</Text>
                                <View style={styles.infoRow}>
                                    <Icon name="User" size={14} color="#6B7280" />
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Name</Text>
                                        <Text style={styles.infoValue}>{request.requester_name}</Text>
                                    </View>
                                </View>
                                <View style={styles.infoRow}>
                                    <Icon name="MapPin" size={14} color="#6B7280" />
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Property Address</Text>
                                        <Text style={styles.infoValue}>{request.property_address}</Text>
                                    </View>
                                </View>
                                <View style={styles.infoRow}>
                                    <Icon name="Calendar" size={14} color="#6B7280" />
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Request Date</Text>
                                        <Text style={styles.infoValue}>{formatDate(request.request_date)}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>                    {/* Trees and Quantities */}
                    {request.trees_and_quantities && request.trees_and_quantities.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.card}>
                                <View style={styles.cardContent}>
                                    <Text style={styles.sectionTitle}>Trees & Quantities</Text>
                                    {request.trees_and_quantities.map((tree, index) => (
                                        <View key={index} style={styles.treeItem}>
                                            <Icon name="TreeDeciduous" size={14} color="#22C55E" />
                                            <Text style={styles.treeText}>{tree}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Inspection Information */}
                    {request.inspectors && request.inspectors.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.card}>
                                <View style={styles.cardContent}>
                                    <Text style={styles.sectionTitle}>Inspection Information</Text>
                                    <View style={styles.inspectorsContainer}>
                                        {request.inspectors.map((inspector, index) => (
                                            <Chip key={index} style={styles.inspectorChip} textStyle={styles.inspectorChipText}>
                                                {inspector}
                                            </Chip>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Notes */}
                    {request.notes && (
                        <View style={styles.section}>
                            <View style={styles.card}>
                                <View style={styles.cardContent}>
                                    <Text style={styles.sectionTitle}>Notes</Text>
                                    <View style={styles.notesContainer}>
                                        <Icon name="FileText" size={14} color="#6B7280" />
                                        <Text style={styles.notesText}>{request.notes}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Fee Information */}
                    {request.fee_record_id && (
                        <View style={styles.section}>
                            <View style={styles.card}>
                                <View style={styles.cardContent}>
                                    <Text style={styles.sectionTitle}>Fee Information</Text>
                                    <View style={styles.infoRow}>
                                        <Icon name="Receipt" size={14} color="#6B7280" />
                                        <View style={styles.infoContent}>
                                            <Text style={styles.infoLabel}>Fee Record ID</Text>
                                            <Text style={styles.infoValue}>{request.fee_record_id}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Metadata */}
                    <View style={styles.section}>
                        <View style={styles.card}>
                            <View style={styles.cardContent}>
                                <Text style={styles.sectionTitle}>Request Information</Text>
                                <View style={styles.infoRow}>
                                    <Icon name="Clock" size={14} color="#6B7280" />
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Created</Text>
                                        <Text style={styles.infoValue}>{formatDate(request.created_at)}</Text>
                                    </View>
                                </View>
                                <View style={styles.infoRow}>
                                    <Icon name="RefreshCw" size={14} color="#6B7280" />
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Last Updated</Text>
                                        <Text style={styles.infoValue}>{formatDate(request.updated_at)}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Edit Modal */}
                <Portal>
                    <Modal
                        visible={editModalVisible}
                        onDismiss={() => setEditModalVisible(false)}
                        contentContainerStyle={styles.modalContent}
                    >
                        <Title style={styles.modalTitle}>Edit {editField.replace("_", " ")}</Title>
                        <TextInput
                            mode="outlined"
                            value={editValue}
                            onChangeText={setEditValue}
                            multiline={editField === "notes" || editField === "property_address"}
                            numberOfLines={editField === "notes" ? 4 : editField === "property_address" ? 3 : 1}
                            style={styles.textInput}
                        />
                        <View style={styles.modalActions}>
                            <Button mode="outlined" onPress={() => setEditModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button mode="contained" onPress={handleSaveEdit} loading={loading}>
                                Save
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    section: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    loadingText: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },
    card: {
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        elevation: 0,
    },
    cardContent: {
        padding: 16,
    },
    headerSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    headerIcon: {
        marginRight: 12,
    },
    requestNumber: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
        letterSpacing: -0.3,
    },
    requestType: {
        fontSize: 13,
        color: "#6B7280",
        marginTop: 2,
        fontWeight: "500",
    },
    statusChip: {
        height: 22,
        borderWidth: 1.5,
        borderRadius: 6,
    },
    statusChipText: {
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 0.2,
        marginVertical: 0,
        marginHorizontal: 0,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#111827",
        letterSpacing: -0.3,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 14,
    },
    infoContent: {
        marginLeft: 12,
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        color: "#6B7280",
        marginBottom: 4,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 14,
        color: "#111827",
        fontWeight: "500",
        lineHeight: 20,
    },
    treeItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        backgroundColor: "#F0FDF4",
        padding: 12,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: "#86EFAC",
    },
    treeText: {
        fontSize: 13,
        color: "#111827",
        marginLeft: 10,
        fontWeight: "600",
    },
    inspectorsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    inspectorChip: {
        marginRight: 8,
        marginBottom: 4,
        backgroundColor: "#EFF6FF",
        borderWidth: 1.5,
        borderColor: "#60A5FA",
        height: 28,
    },
    inspectorChipText: {
        fontSize: 12,
        fontWeight: "600",
        marginVertical: 0,
        marginHorizontal: 0,
    },
    picturesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    pictureItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F9FF",
        padding: 12,
        borderRadius: 10,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1.5,
        borderColor: "#60A5FA",
    },
    pictureText: {
        fontSize: 12,
        color: "#111827",
        marginLeft: 8,
        fontWeight: "600",
    },
    notesContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#F9FAFB",
        padding: 12,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
    },
    notesText: {
        fontSize: 13,
        color: "#111827",
        marginLeft: 12,
        flex: 1,
        lineHeight: 20,
        fontWeight: "500",
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        padding: 24,
        margin: 20,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
    },
    modalTitle: {
        fontSize: 19,
        fontWeight: "800",
        marginBottom: 16,
        textTransform: "capitalize",
        color: "#111827",
        letterSpacing: -0.4,
    },
    textInput: {
        marginBottom: 16,
        backgroundColor: "#FFFFFF",
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 8,
    },
});
