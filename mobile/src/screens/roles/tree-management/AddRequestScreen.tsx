import React, { useMemo, useState } from "react";
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import {
    TextInput,
    Button,
    HelperText,
    useTheme,
    Text,
} from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import { useNavigation } from "@react-navigation/native";
import { cardStyles } from "../../../styles/cardStyles";
import ScreenLayout from "../../../components/layout/ScreenLayout";
import Icon from "../../../components/icons/Icon";
import { treeManagementService, TreeManagementRequestCreate } from "../../../core/api/tree-management-service";

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

    // Internal structured state for Trees & Quantities
    const [treeEntries, setTreeEntries] = useState<{ name: string; quantity: string }[]>([]);

    const requestTypes = [
        { value: "pruning", label: "Tree Pruning" },
        { value: "cutting", label: "Tree Cutting" },
        { value: "violation_complaint", label: "Violation/Complaint" },
    ];

    const isValid = useMemo(() => {
        return requestType.trim() && requesterName.trim() && propertyAddress.trim();
    }, [requestType, requesterName, propertyAddress]);

    const removeTreeEntry = (index: number) => {
        setTreeEntries(treeEntries.filter((_, i) => i !== index));
    };

    const removeInspector = (index: number) => {
        setInspectors(inspectors.filter((_, i) => i !== index));
    };

    const onSave = async () => {
        if (!isValid) return;
        try {
            setSaving(true);

            // Compose trees_and_quantities from structured entries
            const composedTrees = treeEntries
                .filter(e => e.name.trim() !== "")
                .map(e => `${e.name.trim()}: ${e.quantity && !isNaN(Number(e.quantity)) ? e.quantity : 0}`);

            const requestData: TreeManagementRequestCreate = {
                request_type: requestType.trim() as "pruning" | "cutting" | "violation_complaint",
                requester_name: requesterName.trim(),
                property_address: propertyAddress.trim(),
                status: "filed",
                request_date: new Date().toISOString().split('T')[0],
                trees_and_quantities: composedTrees,
                inspectors: inspectors.filter(i => i.trim() !== ""),
                notes: notes.trim() || null,
            };

            const createdRequest = await treeManagementService.createRequest(requestData);

            Alert.alert(
                "Success",
                `Tree management request ${createdRequest.request_number} has been submitted successfully`,
                [
                    {
                        text: "OK",
                        onPress: () => (navigation as any).goBack(),
                    },
                ]
            );
        } catch (e: any) {
            console.error("Save error:", e);
            Alert.alert(
                "Save failed",
                e?.response?.data?.detail || e?.message || "Could not save request. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScreenLayout
            header={{
                title: "Add Request",
                titleSize: 22,
                subtitleSize: 12,
                iconSize: 20,
                showBack: true,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderColor: "#E5E7EB",
            }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Request Information Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Request Information</Text>

                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Request Type *</Text>
                                <Dropdown
                                    data={requestTypes}
                                    value={requestType}
                                    onChange={(item) => setRequestType(item.value)}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select request type"
                                    style={styles.dropdown}
                                    selectedTextStyle={styles.dropdownSelectedText}
                                    placeholderStyle={styles.dropdownPlaceholder}
                                    containerStyle={styles.dropdownContainer}
                                    itemTextStyle={styles.dropdownItemText}
                                    itemContainerStyle={styles.dropdownItem}
                                    renderLeftIcon={() => (
                                        <Icon name="FileText" size={16} color="#6B7280" style={{ marginRight: 8 }} />
                                    )}
                                />
                                <HelperText type="error" visible={!requestType.trim()}>
                                    Request type is required
                                </HelperText>
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Requester Name *</Text>
                                <TextInput
                                    value={requesterName}
                                    onChangeText={setRequesterName}
                                    mode="outlined"
                                    placeholder="Enter requester name"
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                    left={<TextInput.Icon icon={() => <Icon name="User" size={16} color="#6B7280" />} />}
                                />
                                <HelperText type="error" visible={!requesterName.trim()}>
                                    Requester name is required
                                </HelperText>
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Property Address *</Text>
                                <TextInput
                                    value={propertyAddress}
                                    onChangeText={setPropertyAddress}
                                    mode="outlined"
                                    placeholder="Enter property address"
                                    multiline
                                    numberOfLines={2}
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                    left={<TextInput.Icon icon={() => <Icon name="MapPin" size={16} color="#6B7280" />} />}
                                />
                                <HelperText type="error" visible={!propertyAddress.trim()}>
                                    Property address is required
                                </HelperText>
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Notes (Optional)</Text>
                                <TextInput
                                    value={notes}
                                    onChangeText={setNotes}
                                    mode="outlined"
                                    placeholder="Enter additional notes"
                                    multiline
                                    numberOfLines={3}
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                    left={<TextInput.Icon icon={() => <Icon name="FileText" size={16} color="#6B7280" />} />}
                                />
                            </View>
                        </View>

                        {/* Trees and Quantities */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Trees & Quantities</Text>
                            </View>

                            {treeEntries.length > 0 ? (
                                <View style={styles.treeEntriesContainer}>
                                    {treeEntries.map((entry, index) => (
                                        <View key={index} style={styles.treeEntryRow}>
                                            <View style={styles.treeNameInput}>
                                                <TextInput
                                                    value={entry.name}
                                                    onChangeText={(text) => {
                                                        const updated = [...treeEntries];
                                                        updated[index] = { ...updated[index], name: text };
                                                        setTreeEntries(updated);
                                                    }}
                                                    mode="outlined"
                                                    placeholder="Tree species (e.g., Narra, Mahogany)"
                                                    style={styles.input}
                                                    outlineStyle={styles.inputOutline}
                                                />
                                            </View>
                                            <View style={styles.treeQuantityInput}>
                                                <TextInput
                                                    value={entry.quantity}
                                                    onChangeText={(text) => {
                                                        const val = text.replace(/[^0-9]/g, "");
                                                        const updated = [...treeEntries];
                                                        updated[index] = { ...updated[index], quantity: val };
                                                        setTreeEntries(updated);
                                                    }}
                                                    mode="outlined"
                                                    placeholder="Qty"
                                                    keyboardType="number-pad"
                                                    style={styles.input}
                                                    outlineStyle={styles.inputOutline}
                                                />
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => removeTreeEntry(index)}
                                                style={styles.removeButton}
                                                activeOpacity={0.7}
                                            >
                                                <Icon name="X" size={18} color="#DC2626" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.emptyState}>
                                    <Icon name="TreePalm" size={24} color="#9CA3AF" />
                                    <Text style={styles.emptyText}>No trees added yet</Text>
                                </View>
                            )}

                            <Button
                                mode="outlined"
                                onPress={() => setTreeEntries([...treeEntries, { name: "", quantity: "" }])}
                                style={styles.addButton}
                                icon={() => <Icon name="Plus" size={16} color="#111827" />}
                                textColor="#111827"
                            >
                                Add Tree Species
                            </Button>
                        </View>

                        {/* Inspectors */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Assigned Inspectors</Text>
                            </View>

                            {inspectors.length > 0 ? (
                                <View style={styles.inspectorContainer}>
                                    {inspectors.map((inspector, index) => (
                                        <View key={index} style={styles.inspectorRow}>
                                            <View style={styles.inspectorNameInput}>
                                                <TextInput
                                                    value={inspector}
                                                    onChangeText={(text) => {
                                                        const newInspectors = [...inspectors];
                                                        newInspectors[index] = text;
                                                        setInspectors(newInspectors);
                                                    }}
                                                    mode="outlined"
                                                    placeholder="Enter inspector name"
                                                    style={styles.input}
                                                    outlineStyle={styles.inputOutline}
                                                    left={<TextInput.Icon icon={() => <Icon name="User" size={16} color="#6B7280" />} />}
                                                />
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => removeInspector(index)}
                                                style={styles.removeButton}
                                                activeOpacity={0.7}
                                            >
                                                <Icon name="X" size={18} color="#DC2626" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.emptyState}>
                                    <Icon name="User" size={24} color="#9CA3AF" />
                                    <Text style={styles.emptyText}>No inspectors assigned yet</Text>
                                </View>
                            )}

                            <Button
                                mode="outlined"
                                onPress={() => setInspectors([...inspectors, ""])}
                                style={styles.addButton}
                                icon={() => <Icon name="Plus" size={16} color="#111827" />}
                                textColor="#111827"
                            >
                                Add Inspector
                            </Button>
                        </View>

                        {/* Save Button */}
                        <View style={styles.buttonSection}>
                            <Button
                                mode="contained"
                                onPress={onSave}
                                loading={saving}
                                disabled={!isValid || saving}
                                style={styles.saveBtn}
                                buttonColor="#111827"
                                labelStyle={styles.saveBtnLabel}
                            >
                                {saving ? "Submitting..." : "Submit Request"}
                            </Button>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        ...cardStyles.sectionTitle,
        fontSize: 16,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    inputWrapper: {
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: "700",
        color: "#374151",
        marginBottom: 8,
        letterSpacing: -0.2,
    },
    input: {
        backgroundColor: "#FFFFFF",
    },
    inputOutline: {
        borderColor: "#E5E7EB",
        borderRadius: 12,
        borderWidth: 1.5,
    },
    dropdown: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        minHeight: 56,
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
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        marginTop: 4,
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
    treeEntriesContainer: {
        marginBottom: 16,
    },
    treeEntryRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    treeNameInput: {
        flex: 1,
    },
    treeQuantityInput: {
        width: 80,
    },
    inspectorContainer: {
        marginBottom: 16,
    },
    inspectorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    inspectorNameInput: {
        flex: 1,
    },
    removeButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: "#FEF2F2",
        justifyContent: "center",
        alignItems: "center",
    },
    addButton: {
        borderRadius: 8,
        borderColor: "#E5E7EB",
        borderWidth: 1.5,
        borderStyle: "dashed",
    },
    emptyState: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 12,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 14,
        color: "#9CA3AF",
        fontWeight: "500",
    },
    buttonSection: {
        marginTop: 8,
    },
    saveBtn: {
        borderRadius: 12,
        paddingVertical: 6,
    },
    saveBtnLabel: {
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: -0.2,
    },
});
