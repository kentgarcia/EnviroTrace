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
            case "pruning": return "content-cut";
            case "cutting": return "dangerous";
            case "violation_complaint": return "report";
            default: return "assignment";
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

        Alert.alert(
            "Change Status",
            "Select new status:",
            statusOptions.map(option => ({
                text: option.label,
                onPress: () => handleEditField("status", option.value),
            })).concat([{ text: "Cancel", style: "cancel" }])
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading && !request) {
        return (
            <>
                <StandardHeader
                    title="Request Details"
                    showBack={true}
                    onBack={() => navigation.goBack()}
                />
                <SafeAreaView style={styles.container}>
                    <View style={styles.loadingContainer}>
                        <Paragraph>Loading request details...</Paragraph>
                    </View>
                </SafeAreaView>
            </>
        );
    }

    return (
        <>
            <StandardHeader
                title="Request Details"
                showBack={true}
                onBack={() => navigation.goBack()}
            />
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.scrollView}>
                    {/* Header Card */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.headerSection}>
                                <View style={styles.headerLeft}>
                                    <Icon
                                        name={getTypeIcon(request.request_type)}
                                        size={24}
                                        color={colors.primary}
                                        style={styles.headerIcon}
                                    />
                                    <View>
                                        <Title style={styles.requestNumber}>{request.request_number}</Title>
                                        <Paragraph style={styles.requestType}>
                                            {getRequestTypeLabel(request.request_type)}
                                        </Paragraph>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={handleStatusChange}>
                                    <Chip
                                        style={[styles.statusChip, { backgroundColor: getStatusColor(request.status) + "20" }]}
                                        textStyle={[styles.statusChipText, { color: getStatusColor(request.status) }]}
                                    >
                                        {getStatusLabel(request.status)}
                                    </Chip>
                                </TouchableOpacity>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Requester Information */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.sectionHeader}>
                                <Title style={styles.sectionTitle}>Requester Information</Title>
                                <IconButton
                                    icon="edit"
                                    size={20}
                                    onPress={() => handleEditField("requester_name", request.requester_name)}
                                />
                            </View>
                            <View style={styles.infoRow}>
                                <Icon name="person" size={20} color="#666" />
                                <View style={styles.infoContent}>
                                    <Paragraph style={styles.infoLabel}>Name</Paragraph>
                                    <Paragraph style={styles.infoValue}>{request.requester_name}</Paragraph>
                                </View>
                            </View>
                            <View style={styles.infoRow}>
                                <Icon name="location-on" size={20} color="#666" />
                                <View style={styles.infoContent}>
                                    <Paragraph style={styles.infoLabel}>Property Address</Paragraph>
                                    <Paragraph style={styles.infoValue}>{request.property_address}</Paragraph>
                                </View>
                            </View>
                            <View style={styles.infoRow}>
                                <Icon name="event" size={20} color="#666" />
                                <View style={styles.infoContent}>
                                    <Paragraph style={styles.infoLabel}>Request Date</Paragraph>
                                    <Paragraph style={styles.infoValue}>{formatDate(request.request_date)}</Paragraph>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Trees and Quantities */}
                    {request.trees_and_quantities && request.trees_and_quantities.length > 0 && (
                        <Card style={styles.card}>
                            <Card.Content>
                                <View style={styles.sectionHeader}>
                                    <Title style={styles.sectionTitle}>Trees & Quantities</Title>
                                    <IconButton
                                        icon="edit"
                                        size={20}
                                        onPress={() => handleEditField("trees_and_quantities", request.trees_and_quantities.join(", "))}
                                    />
                                </View>
                                {request.trees_and_quantities.map((tree, index) => (
                                    <View key={index} style={styles.treeItem}>
                                        <Icon name="park" size={18} color="#4CAF50" />
                                        <Paragraph style={styles.treeText}>{tree}</Paragraph>
                                    </View>
                                ))}
                            </Card.Content>
                        </Card>
                    )}

                    {/* Inspection Information */}
                    {request.inspectors && request.inspectors.length > 0 && (
                        <Card style={styles.card}>
                            <Card.Content>
                                <View style={styles.sectionHeader}>
                                    <Title style={styles.sectionTitle}>Inspection Information</Title>
                                    <IconButton
                                        icon="edit"
                                        size={20}
                                        onPress={() => handleEditField("inspectors", request.inspectors.join(", "))}
                                    />
                                </View>
                                <View style={styles.inspectorsContainer}>
                                    {request.inspectors.map((inspector, index) => (
                                        <Chip key={index} style={styles.inspectorChip}>
                                            {inspector}
                                        </Chip>
                                    ))}
                                </View>
                            </Card.Content>
                        </Card>
                    )}

                    {/* Pictures */}
                    {request.picture_links && request.picture_links.length > 0 && (
                        <Card style={styles.card}>
                            <Card.Content>
                                <Title style={styles.sectionTitle}>Pictures</Title>
                                <View style={styles.picturesContainer}>
                                    {request.picture_links.map((link, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.pictureItem}
                                            onPress={() => {
                                                // Handle picture viewing
                                                Alert.alert("Picture", `View picture ${index + 1}`);
                                            }}
                                        >
                                            <Icon name="image" size={20} color={colors.primary} />
                                            <Paragraph style={styles.pictureText}>Picture {index + 1}</Paragraph>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </Card.Content>
                        </Card>
                    )}

                    {/* Notes */}
                    {request.notes && (
                        <Card style={styles.card}>
                            <Card.Content>
                                <View style={styles.sectionHeader}>
                                    <Title style={styles.sectionTitle}>Notes</Title>
                                    <IconButton
                                        icon="edit"
                                        size={20}
                                        onPress={() => handleEditField("notes", request.notes)}
                                    />
                                </View>
                                <View style={styles.notesContainer}>
                                    <Icon name="note" size={20} color="#666" />
                                    <Paragraph style={styles.notesText}>{request.notes}</Paragraph>
                                </View>
                            </Card.Content>
                        </Card>
                    )}

                    {/* Fee Information */}
                    {request.fee_record_id && (
                        <Card style={styles.card}>
                            <Card.Content>
                                <Title style={styles.sectionTitle}>Fee Information</Title>
                                <View style={styles.infoRow}>
                                    <Icon name="receipt" size={20} color="#666" />
                                    <View style={styles.infoContent}>
                                        <Paragraph style={styles.infoLabel}>Fee Record ID</Paragraph>
                                        <Paragraph style={styles.infoValue}>{request.fee_record_id}</Paragraph>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    )}

                    {/* Metadata */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.sectionTitle}>Request Information</Title>
                            <View style={styles.infoRow}>
                                <Icon name="access-time" size={20} color="#666" />
                                <View style={styles.infoContent}>
                                    <Paragraph style={styles.infoLabel}>Created</Paragraph>
                                    <Paragraph style={styles.infoValue}>{formatDate(request.created_at)}</Paragraph>
                                </View>
                            </View>
                            <View style={styles.infoRow}>
                                <Icon name="update" size={20} color="#666" />
                                <View style={styles.infoContent}>
                                    <Paragraph style={styles.infoLabel}>Last Updated</Paragraph>
                                    <Paragraph style={styles.infoValue}>{formatDate(request.updated_at)}</Paragraph>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
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
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        marginBottom: 16,
        elevation: 2,
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
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    requestType: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
    statusChip: {
        height: 32,
    },
    statusChipText: {
        fontSize: 12,
        fontWeight: "500",
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    infoContent: {
        marginLeft: 12,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
    },
    treeItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        backgroundColor: "#F8F9FA",
        padding: 8,
        borderRadius: 6,
    },
    treeText: {
        fontSize: 14,
        color: "#333",
        marginLeft: 8,
    },
    inspectorsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    inspectorChip: {
        marginRight: 8,
        marginBottom: 4,
    },
    picturesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    pictureItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        padding: 8,
        borderRadius: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    pictureText: {
        fontSize: 12,
        color: "#333",
        marginLeft: 6,
    },
    notesContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    notesText: {
        fontSize: 14,
        color: "#333",
        marginLeft: 12,
        flex: 1,
        lineHeight: 20,
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        margin: 20,
        borderRadius: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 16,
        textTransform: "capitalize",
    },
    textInput: {
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 8,
    },
});
