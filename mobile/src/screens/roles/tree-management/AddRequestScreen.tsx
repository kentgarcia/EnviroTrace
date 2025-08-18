import React, { useState } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    Alert,
} from "react-native";
import {
    Card,
    Title,
    Paragraph,
    Button,
    TextInput,
    Chip,
    useTheme,
    HelperText,
    Portal,
    Modal,
    List,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../components/icons/Icon";
import { useNavigation } from "@react-navigation/native";
import StandardHeader from "../../../components/layout/StandardHeader";

export default function AddRequestScreen() {
    const navigation = useNavigation();
    const { colors } = useTheme();

    const [formData, setFormData] = useState({
        request_type: "",
        requester_name: "",
        property_address: "",
        notes: "",
        trees_and_quantities: [] as string[],
        inspectors: [] as string[],
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [typeModalVisible, setTypeModalVisible] = useState(false);
    const [treeModalVisible, setTreeModalVisible] = useState(false);
    const [inspectorModalVisible, setInspectorModalVisible] = useState(false);
    const [newTreeEntry, setNewTreeEntry] = useState("");
    const [newInspector, setNewInspector] = useState("");

    const requestTypes = [
        { value: "pruning", label: "Tree Pruning", icon: "content-cut" },
        { value: "cutting", label: "Tree Cutting", icon: "dangerous" },
        { value: "violation_complaint", label: "Violation/Complaint", icon: "report" },
    ];

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.request_type) {
            newErrors.request_type = "Request type is required";
        }
        if (!formData.requester_name.trim()) {
            newErrors.requester_name = "Requester name is required";
        }
        if (!formData.property_address.trim()) {
            newErrors.property_address = "Property address is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Alert.alert("Validation Error", "Please fill in all required fields");
            return;
        }

        try {
            setLoading(true);

            // Generate request number (in real app, this would be done by backend)
            const requestNumber = `TM-${formData.request_type.substring(0, 2).toUpperCase()}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

            const requestData = {
                ...formData,
                request_number: requestNumber,
                request_date: new Date().toISOString().split('T')[0],
                status: "filed",
            };

            // Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            Alert.alert(
                "Success",
                `Tree management request ${requestNumber} has been submitted successfully`,
                [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            console.error("Error submitting request:", error);
            Alert.alert("Error", "Failed to submit request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleTypeSelect = (type: string) => {
        setFormData(prev => ({ ...prev, request_type: type }));
        setTypeModalVisible(false);
        setErrors(prev => ({ ...prev, request_type: "" }));
    };

    const addTreeEntry = () => {
        if (newTreeEntry.trim()) {
            setFormData(prev => ({
                ...prev,
                trees_and_quantities: [...prev.trees_and_quantities, newTreeEntry.trim()],
            }));
            setNewTreeEntry("");
            setTreeModalVisible(false);
        }
    };

    const removeTreeEntry = (index: number) => {
        setFormData(prev => ({
            ...prev,
            trees_and_quantities: prev.trees_and_quantities.filter((_, i) => i !== index),
        }));
    };

    const addInspector = () => {
        if (newInspector.trim()) {
            setFormData(prev => ({
                ...prev,
                inspectors: [...prev.inspectors, newInspector.trim()],
            }));
            setNewInspector("");
            setInspectorModalVisible(false);
        }
    };

    const removeInspector = (index: number) => {
        setFormData(prev => ({
            ...prev,
            inspectors: prev.inspectors.filter((_, i) => i !== index),
        }));
    };

    const getSelectedTypeLabel = () => {
        const selected = requestTypes.find(type => type.value === formData.request_type);
        return selected ? selected.label : "Select request type";
    };

    const getSelectedTypeIcon = () => {
        const selected = requestTypes.find(type => type.value === formData.request_type);
        return selected ? selected.icon : "assignment";
    };

    return (
        <>
            <StandardHeader
                title="New Tree Request"
                showBack={true}
                onBack={() => navigation.goBack()}
            />
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.scrollView}>
                    {/* Request Type */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.sectionTitle}>Request Type *</Title>
                            <Button
                                mode="outlined"
                                onPress={() => setTypeModalVisible(true)}
                                style={[
                                    styles.selectButton,
                                    errors.request_type && styles.errorBorder,
                                ]}
                                contentStyle={styles.selectButtonContent}
                                icon={getSelectedTypeIcon()}
                            >
                                {getSelectedTypeLabel()}
                            </Button>
                            {errors.request_type && (
                                <HelperText type="error">{errors.request_type}</HelperText>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Requester Information */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.sectionTitle}>Requester Information</Title>

                            <TextInput
                                mode="outlined"
                                label="Requester Name *"
                                value={formData.requester_name}
                                onChangeText={(text) => {
                                    setFormData(prev => ({ ...prev, requester_name: text }));
                                    setErrors(prev => ({ ...prev, requester_name: "" }));
                                }}
                                error={!!errors.requester_name}
                                style={styles.textInput}
                                left={<TextInput.Icon icon="person" />}
                            />
                            {errors.requester_name && (
                                <HelperText type="error">{errors.requester_name}</HelperText>
                            )}

                            <TextInput
                                mode="outlined"
                                label="Property Address *"
                                value={formData.property_address}
                                onChangeText={(text) => {
                                    setFormData(prev => ({ ...prev, property_address: text }));
                                    setErrors(prev => ({ ...prev, property_address: "" }));
                                }}
                                error={!!errors.property_address}
                                multiline
                                numberOfLines={3}
                                style={styles.textInput}
                                left={<TextInput.Icon icon="location-on" />}
                            />
                            {errors.property_address && (
                                <HelperText type="error">{errors.property_address}</HelperText>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Trees and Quantities */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.sectionHeader}>
                                <Title style={styles.sectionTitle}>Trees & Quantities</Title>
                                <Button
                                    mode="outlined"
                                    icon="add"
                                    onPress={() => setTreeModalVisible(true)}
                                    compact
                                >
                                    Add
                                </Button>
                            </View>

                            {formData.trees_and_quantities.length === 0 ? (
                                <Paragraph style={styles.emptyText}>
                                    No trees added yet. Tap "Add" to specify trees and quantities.
                                </Paragraph>
                            ) : (
                                <View style={styles.chipsContainer}>
                                    {formData.trees_and_quantities.map((tree, index) => (
                                        <Chip
                                            key={index}
                                            onClose={() => removeTreeEntry(index)}
                                            style={styles.chip}
                                        >
                                            {tree}
                                        </Chip>
                                    ))}
                                </View>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Inspectors */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.sectionHeader}>
                                <Title style={styles.sectionTitle}>Inspectors</Title>
                                <Button
                                    mode="outlined"
                                    icon="add"
                                    onPress={() => setInspectorModalVisible(true)}
                                    compact
                                >
                                    Add
                                </Button>
                            </View>

                            {formData.inspectors.length === 0 ? (
                                <Paragraph style={styles.emptyText}>
                                    No inspectors assigned yet. Tap "Add" to assign inspectors.
                                </Paragraph>
                            ) : (
                                <View style={styles.chipsContainer}>
                                    {formData.inspectors.map((inspector, index) => (
                                        <Chip
                                            key={index}
                                            onClose={() => removeInspector(index)}
                                            style={styles.chip}
                                            icon="person"
                                        >
                                            {inspector}
                                        </Chip>
                                    ))}
                                </View>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Notes */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.sectionTitle}>Notes</Title>
                            <TextInput
                                mode="outlined"
                                label="Additional notes (optional)"
                                value={formData.notes}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                                multiline
                                numberOfLines={4}
                                style={styles.textInput}
                                left={<TextInput.Icon icon="note" />}
                            />
                        </Card.Content>
                    </Card>

                    {/* Submit Button */}
                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={loading}
                        style={styles.submitButton}
                        contentStyle={styles.submitButtonContent}
                    >
                        Submit Request
                    </Button>
                </ScrollView>

                {/* Request Type Modal */}
                <Portal>
                    <Modal
                        visible={typeModalVisible}
                        onDismiss={() => setTypeModalVisible(false)}
                        contentContainerStyle={styles.modalContent}
                    >
                        <Title style={styles.modalTitle}>Select Request Type</Title>
                        {requestTypes.map((type) => (
                            <List.Item
                                key={type.value}
                                title={type.label}
                                onPress={() => handleTypeSelect(type.value)}
                                left={() => <Icon name={type.icon} size={24} color={colors.primary} />}
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
                        contentContainerStyle={styles.modalContent}
                    >
                        <Title style={styles.modalTitle}>Add Tree Entry</Title>
                        <TextInput
                            mode="outlined"
                            label="Tree species and quantity (e.g., Acacia: 2 trees)"
                            value={newTreeEntry}
                            onChangeText={setNewTreeEntry}
                            style={styles.modalTextInput}
                            placeholder="Mahogany: 1 tree"
                        />
                        <View style={styles.modalActions}>
                            <Button mode="outlined" onPress={() => setTreeModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button mode="contained" onPress={addTreeEntry}>
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
                        contentContainerStyle={styles.modalContent}
                    >
                        <Title style={styles.modalTitle}>Add Inspector</Title>
                        <TextInput
                            mode="outlined"
                            label="Inspector name"
                            value={newInspector}
                            onChangeText={setNewInspector}
                            style={styles.modalTextInput}
                            placeholder="Inspector Rodriguez"
                        />
                        <View style={styles.modalActions}>
                            <Button mode="outlined" onPress={() => setInspectorModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button mode="contained" onPress={addInspector}>
                                Add
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
    card: {
        marginBottom: 16,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    selectButton: {
        marginBottom: 8,
    },
    selectButtonContent: {
        justifyContent: "flex-start",
        paddingVertical: 8,
    },
    errorBorder: {
        borderColor: "#F44336",
    },
    textInput: {
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: "#666",
        fontStyle: "italic",
        textAlign: "center",
        paddingVertical: 16,
    },
    chipsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        marginBottom: 4,
    },
    submitButton: {
        marginTop: 8,
        marginBottom: 32,
    },
    submitButtonContent: {
        paddingVertical: 8,
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
    listItem: {
        paddingVertical: 8,
    },
    modalTextInput: {
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 8,
    },
});
