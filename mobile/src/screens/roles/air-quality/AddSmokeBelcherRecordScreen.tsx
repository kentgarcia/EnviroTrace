import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import {
    Title,
    Button,
    useTheme,
    Card,
    TextInput,
    HelperText,
    Divider
} from "react-native-paper";
import StandardHeader from "../../../components/layout/StandardHeader";
import { useNavigation } from "@react-navigation/native";
import { airQualityService } from "../../../core/api/air-quality-service";

interface FormData {
    plate_number: string;
    vehicle_type: string;
    transport_group: string;
    operator_company_name: string;
    operator_address: string;
    owner_first_name: string;
    owner_middle_name: string;
    owner_last_name: string;
    motor_no: string;
    motor_vehicle_name: string;
}

export default function AddSmokeBelcherRecordScreen() {
    const [formData, setFormData] = useState<FormData>({
        plate_number: "",
        vehicle_type: "",
        transport_group: "",
        operator_company_name: "",
        operator_address: "",
        owner_first_name: "",
        owner_middle_name: "",
        owner_last_name: "",
        motor_no: "",
        motor_vehicle_name: "",
    });

    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [loading, setLoading] = useState(false);
    const { colors } = useTheme();
    const navigation = useNavigation();

    const validateForm = () => {
        const newErrors: Partial<FormData> = {};

        // Required fields
        if (!formData.plate_number.trim()) {
            newErrors.plate_number = "Plate number is required";
        }
        if (!formData.vehicle_type.trim()) {
            newErrors.vehicle_type = "Vehicle type is required";
        }
        if (!formData.operator_company_name.trim()) {
            newErrors.operator_company_name = "Operator company name is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            Alert.alert("Validation Error", "Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            // Create the record data, filtering out empty optional fields
            const recordData = {
                plate_number: formData.plate_number.trim(),
                vehicle_type: formData.vehicle_type.trim(),
                operator_company_name: formData.operator_company_name.trim(),
                ...(formData.transport_group.trim() && { transport_group: formData.transport_group.trim() }),
                ...(formData.operator_address.trim() && { operator_address: formData.operator_address.trim() }),
                ...(formData.owner_first_name.trim() && { owner_first_name: formData.owner_first_name.trim() }),
                ...(formData.owner_middle_name.trim() && { owner_middle_name: formData.owner_middle_name.trim() }),
                ...(formData.owner_last_name.trim() && { owner_last_name: formData.owner_last_name.trim() }),
                ...(formData.motor_no.trim() && { motor_no: formData.motor_no.trim() }),
                ...(formData.motor_vehicle_name.trim() && { motor_vehicle_name: formData.motor_vehicle_name.trim() }),
            };

            await airQualityService.createRecord(recordData);

            Alert.alert(
                "Success",
                "Smoke belcher record created successfully",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.error("Error creating record:", error);
            Alert.alert("Error", "Failed to create record. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <StandardHeader
                title="Add Record"
                showBack={true}
               
            />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Vehicle Information */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Title style={styles.sectionTitle}>Vehicle Information</Title>

                        <TextInput
                            label="Plate Number *"
                            value={formData.plate_number}
                            onChangeText={(value) => updateField("plate_number", value)}
                            mode="outlined"
                            style={styles.input}
                            error={!!errors.plate_number}
                            autoCapitalize="characters"
                        />
                        <HelperText type="error" visible={!!errors.plate_number}>
                            {errors.plate_number}
                        </HelperText>

                        <TextInput
                            label="Vehicle Type *"
                            value={formData.vehicle_type}
                            onChangeText={(value) => updateField("vehicle_type", value)}
                            mode="outlined"
                            style={styles.input}
                            error={!!errors.vehicle_type}
                            placeholder="e.g., Jeepney, Bus, Tricycle"
                        />
                        <HelperText type="error" visible={!!errors.vehicle_type}>
                            {errors.vehicle_type}
                        </HelperText>

                        <TextInput
                            label="Transport Group"
                            value={formData.transport_group}
                            onChangeText={(value) => updateField("transport_group", value)}
                            mode="outlined"
                            style={styles.input}
                            placeholder="Optional"
                        />

                        <TextInput
                            label="Motor Number"
                            value={formData.motor_no}
                            onChangeText={(value) => updateField("motor_no", value)}
                            mode="outlined"
                            style={styles.input}
                            placeholder="Optional"
                        />

                        <TextInput
                            label="Motor Vehicle Name"
                            value={formData.motor_vehicle_name}
                            onChangeText={(value) => updateField("motor_vehicle_name", value)}
                            mode="outlined"
                            style={styles.input}
                            placeholder="Optional"
                        />
                    </Card.Content>
                </Card>

                <Divider style={styles.divider} />

                {/* Operator Information */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Title style={styles.sectionTitle}>Operator Information</Title>

                        <TextInput
                            label="Company Name *"
                            value={formData.operator_company_name}
                            onChangeText={(value) => updateField("operator_company_name", value)}
                            mode="outlined"
                            style={styles.input}
                            error={!!errors.operator_company_name}
                        />
                        <HelperText type="error" visible={!!errors.operator_company_name}>
                            {errors.operator_company_name}
                        </HelperText>

                        <TextInput
                            label="Operator Address"
                            value={formData.operator_address}
                            onChangeText={(value) => updateField("operator_address", value)}
                            mode="outlined"
                            style={styles.input}
                            multiline
                            numberOfLines={3}
                            placeholder="Optional"
                        />
                    </Card.Content>
                </Card>

                <Divider style={styles.divider} />

                {/* Owner Information */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Title style={styles.sectionTitle}>Owner Information</Title>

                        <TextInput
                            label="First Name"
                            value={formData.owner_first_name}
                            onChangeText={(value) => updateField("owner_first_name", value)}
                            mode="outlined"
                            style={styles.input}
                            placeholder="Optional"
                        />

                        <TextInput
                            label="Middle Name"
                            value={formData.owner_middle_name}
                            onChangeText={(value) => updateField("owner_middle_name", value)}
                            mode="outlined"
                            style={styles.input}
                            placeholder="Optional"
                        />

                        <TextInput
                            label="Last Name"
                            value={formData.owner_last_name}
                            onChangeText={(value) => updateField("owner_last_name", value)}
                            mode="outlined"
                            style={styles.input}
                            placeholder="Optional"
                        />
                    </Card.Content>
                </Card>

                <View style={styles.buttonContainer}>
                    <Button
                        mode="outlined"
                        onPress={() => navigation.goBack()}
                        style={styles.button}
                        disabled={loading}
                    >
                        Cancel
                    </Button>

                    <Button
                        mode="contained"
                        onPress={handleSave}
                        style={styles.button}
                        loading={loading}
                        disabled={loading}
                    >
                        Save Record
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    card: {
        marginBottom: 16,
        elevation: 2,
    },
    sectionTitle: {
        marginBottom: 16,
        fontSize: 18,
        fontWeight: "600",
    },
    input: {
        marginBottom: 8,
    },
    divider: {
        marginVertical: 8,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 24,
        gap: 16,
    },
    button: {
        flex: 1,
    },
});
