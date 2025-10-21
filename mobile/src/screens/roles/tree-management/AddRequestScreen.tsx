import React, { useMemo, useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import {
    TextInput,
    Button,
    HelperText,
    useTheme,
    Text,
    Chip,
    Portal,
    Modal,
    List,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import StandardHeader from "../../../components/layout/StandardHeader";
import Icon from "../../../components/icons/Icon";

function randomId() {
    // RFC4122-ish simple UUID v4 generator (sufficient for local IDs)
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

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
    created_at: string;
    updated_at: string;
}

export default function AddRequestScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation();

    const [requestType, setRequestType] = useState("");
    const [requesterName, setRequesterName] = useState("");
    const [propertyAddress, setPropertyAddress] = useState("");
    const [notes, setNotes] = useState("");
    const [treesAndQuantities, setTreesAndQuantities] = useState<string[]>([]);
    const [inspectors, setInspectors] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    // Modal states
    const [typeModalVisible, setTypeModalVisible] = useState(false);
    const [treeModalVisible, setTreeModalVisible] = useState(false);
    const [inspectorModalVisible, setInspectorModalVisible] = useState(false);
    const [newTreeEntry, setNewTreeEntry] = useState("");
    const [newInspector, setNewInspector] = useState("");

    const requestTypes = [
        { value: "pruning", label: "Tree Pruning", icon: "Scissors" },
        { value: "cutting", label: "Tree Cutting", icon: "Axe" },
        { value: "violation_complaint", label: "Violation/Complaint", icon: "AlertTriangle" },
    ];

    const isValid = useMemo(() => {
        return requestType.trim() && requesterName.trim() && propertyAddress.trim();
    }, [requestType, requesterName, propertyAddress]);

    const getRequestTypeLabel = (type: string) => {
        const requestTypeObj = requestTypes.find(rt => rt.value === type);
        return requestTypeObj ? requestTypeObj.label : type;
    };

    const addTreeEntry = () => {
        if (newTreeEntry.trim()) {
            setTreesAndQuantities([...treesAndQuantities, newTreeEntry.trim()]);
            setNewTreeEntry("");
            setTreeModalVisible(false);
        }
    };

    const removeTreeEntry = (index: number) => {
        setTreesAndQuantities(treesAndQuantities.filter((_, i) => i !== index));
    };

    const addInspector = () => {
        if (newInspector.trim()) {
            setInspectors([...inspectors, newInspector.trim()]);
            setNewInspector("");
            setInspectorModalVisible(false);
        }
    };

    const removeInspector = (index: number) => {
        setInspectors(inspectors.filter((_, i) => i !== index));
    };

    const onSave = async () => {
        if (!isValid) return;
        try {
            setSaving(true);
            const now = new Date().toISOString();

            // Generate request number
            const requestNumber = `TM-${requestType.substring(0, 2).toUpperCase()}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

            const request: LocalTreeRequest = {
                id: randomId(),
                request_number: requestNumber,
                request_type: requestType.trim(),
                requester_name: requesterName.trim(),
                property_address: propertyAddress.trim(),
                status: "filed",
                request_date: now.split('T')[0],
                trees_and_quantities: treesAndQuantities,
                inspectors: inspectors,
                notes: notes.trim(),
                sync_status: "pending",
                created_at: now,
                updated_at: now,
            };

            // TODO: Replace with actual database save when available
            // await database.saveTreeRequest(request);

            Alert.alert(
                "Success",
                `Tree management request ${requestNumber} has been submitted successfully`,
                [
                    {
                        text: "OK",
                        onPress: () => (navigation as any).goBack(),
                    },
                ]
            );
        } catch (e: any) {
            Alert.alert("Save failed", e?.message || "Could not save request.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.root}>
            <StandardHeader
                title="Add Request"
                titleSize={22}
                showBack

            />
            <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.section}>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Request Information</Text>

                            {/* Request Type */}
                            <Button
                                mode="outlined"
                                onPress={() => setTypeModalVisible(true)}
                                style={styles.input}
                                contentStyle={styles.buttonContent}
                                labelStyle={[styles.buttonLabel, !requestType && { color: '#999' }]}
                                icon={() => <Icon name="FileText" size={18} color="#111827" />}
                            >
                                {requestType ? getRequestTypeLabel(requestType) : "Select Request Type"}
                            </Button>
                            <HelperText type="error" visible={!requestType.trim()}>
                                Request type is required
                            </HelperText>

                            <TextInput
                                label="Requester Name"
                                value={requesterName}
                                onChangeText={setRequesterName}
                                mode="flat"
                                left={<TextInput.Icon icon={() => <Icon name="User" size={18} color="#111827" />} />}
                                style={styles.input}
                            />
                            <HelperText type="error" visible={!requesterName.trim()}>
                                Requester name is required
                            </HelperText>

                            <TextInput
                                label="Property Address"
                                value={propertyAddress}
                                onChangeText={setPropertyAddress}
                                mode="flat"
                                multiline
                                numberOfLines={2}
                                left={<TextInput.Icon icon={() => <Icon name="MapPin" size={18} color="#111827" />} />}
                                style={styles.input}
                            />
                            <HelperText type="error" visible={!propertyAddress.trim()}>
                                Property address is required
                            </HelperText>

                            <TextInput
                                label="Notes (Optional)"
                                value={notes}
                                onChangeText={setNotes}
                                mode="flat"
                                multiline
                                numberOfLines={3}
                                left={<TextInput.Icon icon={() => <Icon name="FileText" size={18} color="#111827" />} />}
                                style={styles.input}
                            />
                        </View>
                    </View>

                    {/* Trees and Quantities */}
                    <View style={styles.section}>
                        <View style={styles.card}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.cardTitle}>Trees & Quantities</Text>
                                <Button
                                    mode="contained-tonal"
                                    onPress={() => setTreeModalVisible(true)}
                                    compact
                                    icon={() => <Icon name="Plus" size={16} color="#111827" />}
                                    labelStyle={styles.addButtonLabel}
                                    contentStyle={styles.addButtonContent}
                                >
                                    Add Tree
                                </Button>
                            </View>

                            {treesAndQuantities.length > 0 ? (
                                <View style={styles.chipContainer}>
                                    {treesAndQuantities.map((tree, index) => (
                                        <Chip
                                            key={index}
                                            onClose={() => removeTreeEntry(index)}
                                            style={styles.chip}
                                        >
                                            {tree}
                                        </Chip>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.emptyText}>No trees added yet</Text>
                            )}
                        </View>
                    </View>

                    {/* Inspectors */}
                    <View style={styles.section}>
                        <View style={styles.card}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.cardTitle}>Assigned Inspectors</Text>
                                <Button
                                    mode="contained-tonal"
                                    onPress={() => setInspectorModalVisible(true)}
                                    compact
                                    icon={() => <Icon name="Plus" size={16} color="#111827" />}
                                    labelStyle={styles.addButtonLabel}
                                    contentStyle={styles.addButtonContent}
                                >
                                    Add Inspector
                                </Button>
                            </View>

                            {inspectors.length > 0 ? (
                                <View style={styles.chipContainer}>
                                    {inspectors.map((inspector, index) => (
                                        <Chip
                                            key={index}
                                            onClose={() => removeInspector(index)}
                                            style={styles.chip}
                                            icon={() => <Icon name="User" size={14} color="#111827" />}
                                        >
                                            {inspector}
                                        </Chip>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.emptyText}>No inspectors assigned yet</Text>
                            )}
                        </View>
                    </View>

                    <Button
                        mode="contained"
                        onPress={onSave}
                        loading={saving}
                        disabled={!isValid || saving}
                        style={styles.submitButton}
                        contentStyle={styles.submitButtonContent}
                    >
                        {saving ? "Submitting..." : "Submit Request"}
                    </Button>
                </ScrollView>
            </SafeAreaView>

            {/* Request Type Modal */}
            <Portal>
                <Modal
                    visible={typeModalVisible}
                    onDismiss={() => setTypeModalVisible(false)}
                    contentContainerStyle={styles.modalContainer}
                >
                    <Text style={styles.modalTitle}>Select Request Type</Text>
                    {requestTypes.map((type) => (
                        <List.Item
                            key={type.value}
                            title={type.label}
                            left={() => <Icon name={type.icon} size={24} color="#111827" />}
                            onPress={() => {
                                setRequestType(type.value);
                                setTypeModalVisible(false);
                            }}
                            style={styles.listItem}
                        />
                    ))}
                </Modal>
            </Portal>

            {/* Tree Entry Modal */}
            <Portal>
                <Modal
                    visible={treeModalVisible}
                    onDismiss={() => setTreeModalVisible(false)}
                    contentContainerStyle={styles.modalContainer}
                >
                    <Text style={styles.modalTitle}>Add Tree & Quantity</Text>
                    <TextInput
                        label="Tree type and quantity (e.g., Mango: 2)"
                        value={newTreeEntry}
                        onChangeText={setNewTreeEntry}
                        mode="outlined"
                        style={styles.modalInput}
                    />
                    <View style={styles.modalActions}>
                        <Button
                            mode="outlined"
                            onPress={() => {
                                setNewTreeEntry("");
                                setTreeModalVisible(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={addTreeEntry}
                            disabled={!newTreeEntry.trim()}
                        >
                            Add
                        </Button>
                    </View>
                </Modal>
            </Portal>

            {/* Inspector Modal */}
            <Portal>
                <Modal
                    visible={inspectorModalVisible}
                    onDismiss={() => setInspectorModalVisible(false)}
                    contentContainerStyle={styles.modalContainer}
                >
                    <Text style={styles.modalTitle}>Add Inspector</Text>
                    <TextInput
                        label="Inspector name"
                        value={newInspector}
                        onChangeText={setNewInspector}
                        mode="outlined"
                        style={styles.modalInput}
                    />
                    <View style={styles.modalActions}>
                        <Button
                            mode="outlined"
                            onPress={() => {
                                setNewInspector("");
                                setInspectorModalVisible(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={addInspector}
                            disabled={!newInspector.trim()}
                        >
                            Add
                        </Button>
                    </View>
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#FAFAFA",
    },
    safeArea: {
        flex: 1,
        backgroundColor: "#FAFAFA",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    section: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        padding: 16,
        elevation: 0,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
        letterSpacing: 0.3,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    input: {
        marginBottom: 8,
        marginTop: 8,
    },
    buttonContent: {
        height: 48,
        justifyContent: "flex-start",
    },
    buttonLabel: {
        fontSize: 16,
        textAlign: "left",
    },
    addButtonLabel: {
        fontSize: 13,
        fontWeight: "600",
    },
    addButtonContent: {
        height: 32,
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: "#6B7280",
        fontStyle: "italic",
    },
    submitButton: {
        marginTop: 24,
        marginHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#111827",
    },
    submitButtonContent: {
        height: 48,
    },
    modalContainer: {
        backgroundColor: "#FFFFFF",
        margin: 20,
        borderRadius: 12,
        padding: 20,
        maxHeight: "80%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 16,
        textAlign: "center",
        color: "#111827",
        letterSpacing: 0.3,
    },
    modalInput: {
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    listItem: {
        paddingVertical: 8,
    },
});
