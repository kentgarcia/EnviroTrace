import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { 
    Text, 
    TextInput, 
    Button, 
    Switch, 
    HelperText, 
    ActivityIndicator 
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "../../../components/icons/Icon";
import StandardHeader from "../../../components/layout/StandardHeader";
import { treeInventoryApi, TreeSpeciesCreate } from "../../../core/api/tree-inventory-api";

// Schema definition matching backend
const speciesSchema = z.object({
    // Basic
    common_name: z.string().min(1, "Common name is required"),
    scientific_name: z.string().optional(),
    local_name: z.string().optional(),
    family: z.string().optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    
    // Status
    is_native: z.boolean().default(false),
    is_endangered: z.boolean().default(false),
    is_active: z.boolean().default(true),

    // Growth / Physical
    growth_speed_label: z.string().optional(),
    growth_rate_m_per_year: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
    
    wood_density_min: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
    wood_density_max: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
    wood_density_avg: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),

    avg_mature_height_min_m: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
    avg_mature_height_max_m: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
    avg_mature_height_avg_m: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),

    avg_trunk_diameter_min_cm: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
    avg_trunk_diameter_max_cm: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
    avg_trunk_diameter_avg_cm: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),

    // Carbon
    co2_absorbed_kg_per_year: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
    carbon_fraction: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
    
    co2_stored_mature_min_kg: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
    co2_stored_mature_max_kg: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
    co2_stored_mature_avg_kg: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),

    // Removal
    decay_years_min: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
    decay_years_max: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
    lumber_carbon_retention_pct: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
    burned_carbon_release_pct: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
});

type SpeciesFormData = z.output<typeof speciesSchema>;
type SpeciesFormInputs = z.input<typeof speciesSchema>;

type ScreenRouteProp = RouteProp<{
    SpeciesForm: { speciesId?: string };
}, "SpeciesForm">;

const GROWTH_SPEED_OPTIONS = [
    { label: 'Slow', value: 'Slow' },
    { label: 'Moderate', value: 'Moderate' },
    { label: 'Fast', value: 'Fast' },
];

export default function SpeciesFormScreen() {
    const navigation = useNavigation();
    const route = useRoute<ScreenRouteProp>();
    const queryClient = useQueryClient();
    const speciesId = route.params?.speciesId;
    const isEditMode = !!speciesId;

    const { control, handleSubmit, setValue, formState: { errors } } = useForm<SpeciesFormInputs, any, SpeciesFormData>({
        resolver: zodResolver(speciesSchema),
        defaultValues: {
            is_native: false,
            is_endangered: false,
            is_active: true,
        } as any,
    });

    // Fetch existing data if editing
    const { data: speciesData, isLoading: isLoadingData } = useQuery({
        queryKey: ["tree-species", speciesId],
        queryFn: () => treeInventoryApi.getSpeciesById(speciesId!),
        enabled: isEditMode,
    });
    
    useEffect(() => {
        if (speciesData && speciesData.data) {
             const species = speciesData.data as any; // Cast to access all fields
             if (species) {
                 // Basic
                 setValue("common_name", species.common_name);
                 setValue("scientific_name", species.scientific_name || "");
                 setValue("local_name", species.local_name || "");
                 setValue("family", species.family || "");
                 setValue("description", species.description || "");
                 setValue("notes", species.notes || "");
                 
                 // Status
                 setValue("is_native", species.is_native || false);
                 setValue("is_endangered", species.is_endangered || false);
                 setValue("is_active", species.is_active !== false);

                 // Growth
                 setValue("growth_speed_label", species.growth_speed_label || "");
                 setValue("growth_rate_m_per_year", species.growth_rate_m_per_year ? String(species.growth_rate_m_per_year) : "");
                 
                 // Wood Density
                 setValue("wood_density_min", species.wood_density_min ? String(species.wood_density_min) : "");
                 setValue("wood_density_max", species.wood_density_max ? String(species.wood_density_max) : "");
                 setValue("wood_density_avg", species.wood_density_avg ? String(species.wood_density_avg) : "");

                 // Height
                 setValue("avg_mature_height_min_m", species.avg_mature_height_min_m ? String(species.avg_mature_height_min_m) : "");
                 setValue("avg_mature_height_max_m", species.avg_mature_height_max_m ? String(species.avg_mature_height_max_m) : "");
                 setValue("avg_mature_height_avg_m", species.avg_mature_height_avg_m ? String(species.avg_mature_height_avg_m) : "");

                 // Diameter
                 setValue("avg_trunk_diameter_min_cm", species.avg_trunk_diameter_min_cm ? String(species.avg_trunk_diameter_min_cm) : "");
                 setValue("avg_trunk_diameter_max_cm", species.avg_trunk_diameter_max_cm ? String(species.avg_trunk_diameter_max_cm) : "");
                 setValue("avg_trunk_diameter_avg_cm", species.avg_trunk_diameter_avg_cm ? String(species.avg_trunk_diameter_avg_cm) : "");

                 // Carbon
                 setValue("co2_absorbed_kg_per_year", species.co2_absorbed_kg_per_year ? String(species.co2_absorbed_kg_per_year) : "");
                 setValue("carbon_fraction", species.carbon_fraction ? String(species.carbon_fraction) : "");
                 setValue("co2_stored_mature_min_kg", species.co2_stored_mature_min_kg ? String(species.co2_stored_mature_min_kg) : "");
                 setValue("co2_stored_mature_max_kg", species.co2_stored_mature_max_kg ? String(species.co2_stored_mature_max_kg) : "");
                 setValue("co2_stored_mature_avg_kg", species.co2_stored_mature_avg_kg ? String(species.co2_stored_mature_avg_kg) : "");

                 // Removal
                 setValue("decay_years_min", species.decay_years_min ? String(species.decay_years_min) : "");
                 setValue("decay_years_max", species.decay_years_max ? String(species.decay_years_max) : "");
                 setValue("lumber_carbon_retention_pct", species.lumber_carbon_retention_pct ? String(species.lumber_carbon_retention_pct) : "");
                 setValue("burned_carbon_release_pct", species.burned_carbon_release_pct ? String(species.burned_carbon_release_pct) : "");
             }
        }
    }, [speciesData, setValue]);

    const createMutation = useMutation({
        mutationFn: (data: SpeciesFormData) => treeInventoryApi.createSpecies(data as any),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tree-species"] });
            Alert.alert("Success", "Species created successfully", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        },
        onError: (error: any) => {
            Alert.alert("Error", error.message || "Failed to create species");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: SpeciesFormData) => treeInventoryApi.updateSpecies(speciesId!, data as any),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tree-species"] });
            Alert.alert("Success", "Species updated successfully", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        },
        onError: (error: any) => {
            Alert.alert("Error", error.message || "Failed to update species");
        },
    });

    const onSubmit = (data: SpeciesFormData) => {
        if (isEditMode) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const renderMinMaxAvgInput = (label: string, unit: string, minName: any, maxName: any, avgName: any, iconName: string = "Ruler") => (
        <View style={styles.fieldGroup}>
            <Text style={styles.groupLabel}>{label} ({unit})</Text>
            <View style={styles.triInputRow}>
                <View style={styles.triInputContainer}>
                    <Controller
                        control={control}
                        name={minName}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                mode="outlined"
                                value={String(value || "")}
                                onChangeText={onChange}
                                placeholder="Min"
                                keyboardType="numeric"
                                style={styles.inputSmall}
                                outlineStyle={styles.inputOutline}
                                textColor="#0F172A"
                                placeholderTextColor="#94A3B8"
                            />
                        )}
                    />
                    <Text style={styles.inputSubLabel}>Min</Text>
                </View>
                <View style={styles.triInputContainer}>
                    <Controller
                        control={control}
                        name={maxName}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                mode="outlined"
                                value={String(value || "")}
                                onChangeText={onChange}
                                placeholder="Max"
                                keyboardType="numeric"
                                style={styles.inputSmall}
                                outlineStyle={styles.inputOutline}
                                textColor="#0F172A"
                                placeholderTextColor="#94A3B8"
                            />
                        )}
                    />
                    <Text style={styles.inputSubLabel}>Max</Text>
                </View>
                <View style={styles.triInputContainer}>
                    <Controller
                        control={control}
                        name={avgName}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                mode="outlined"
                                value={String(value || "")}
                                onChangeText={onChange}
                                placeholder="Avg"
                                keyboardType="numeric"
                                style={styles.inputSmall}
                                outlineStyle={styles.inputOutline}
                                textColor="#0F172A"
                                placeholderTextColor="#94A3B8"
                            />
                        )}
                    />
                    <Text style={styles.inputSubLabel}>Avg</Text>
                </View>
            </View>
        </View>
    );

    const isLoading = createMutation.isPending || updateMutation.isPending || (isEditMode && isLoadingData);

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <StandardHeader
                title={isEditMode ? "Edit Species" : "Add Species"}
                onBack={() => navigation.goBack()}
                backgroundColor="#FFFFFF"
            />
            
            {isLoading && isEditMode && !speciesData ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1E40AF" />
                </View>
            ) : (
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.content}>
                        {/* BASIC INFORMATION */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Basic Information</Text>
                            
                            <View style={styles.field}>
                                <Text style={styles.label}>Common Name <Text style={styles.required}>*</Text></Text>
                                <Controller
                                    control={control}
                                    name="common_name"
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            mode="outlined"
                                            value={value}
                                            onChangeText={onChange}
                                            placeholder="e.g., Narra"
                                            style={styles.input}
                                            outlineStyle={styles.inputOutline}
                                            textColor="#0F172A"
                                            error={!!errors.common_name}
                                            left={<TextInput.Icon icon={() => <Icon name="Leaf" size={16} color="#64748B" />} />}
                                        />
                                    )}
                                />
                                {errors.common_name && <HelperText type="error">{errors.common_name.message}</HelperText>}
                            </View>

                            <View style={styles.field}>
                                <Text style={styles.label}>Scientific Name</Text>
                                <Controller
                                    control={control}
                                    name="scientific_name"
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            mode="outlined"
                                            value={value}
                                            onChangeText={onChange}
                                            placeholder="e.g., Pterocarpus indicus"
                                            style={[styles.input, styles.italic]}
                                            outlineStyle={styles.inputOutline}
                                            textColor="#0F172A"
                                            left={<TextInput.Icon icon={() => <Icon name="Book" size={16} color="#64748B" />} />}
                                        />
                                    )}
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.field, styles.halfField]}>
                                    <Text style={styles.label}>Local Name</Text>
                                    <Controller
                                        control={control}
                                        name="local_name"
                                        render={({ field: { onChange, value } }) => (
                                            <TextInput
                                                mode="outlined"
                                                value={value}
                                                onChangeText={onChange}
                                                style={styles.input}
                                                outlineStyle={styles.inputOutline}
                                                textColor="#0F172A"
                                            />
                                        )}
                                    />
                                </View>
                                <View style={[styles.field, styles.halfField]}>
                                    <Text style={styles.label}>Family</Text>
                                    <Controller
                                        control={control}
                                        name="family"
                                        render={({ field: { onChange, value } }) => (
                                            <TextInput
                                                mode="outlined"
                                                value={value}
                                                onChangeText={onChange}
                                                style={styles.input}
                                                outlineStyle={styles.inputOutline}
                                                textColor="#0F172A"
                                            />
                                        )}
                                    />
                                </View>
                            </View>

                            <View style={styles.field}>
                                <Text style={styles.label}>Description</Text>
                                <Controller
                                    control={control}
                                    name="description"
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            mode="outlined"
                                            value={value}
                                            onChangeText={onChange}
                                            multiline
                                            numberOfLines={3}
                                            style={[styles.input, styles.textArea]}
                                            outlineStyle={styles.inputOutline}
                                            textColor="#0F172A"
                                        />
                                    )}
                                />
                            </View>

                            <View style={styles.switchRowContainer}>
                                <View style={styles.switchItem}>
                                    <Text style={styles.switchLabel}>Native</Text>
                                    <Controller
                                        control={control}
                                        name="is_native"
                                        render={({ field: { onChange, value } }) => (
                                            <Switch value={value} onValueChange={onChange} color="#166534" />
                                        )}
                                    />
                                </View>
                                <View style={styles.switchItem}>
                                    <Text style={styles.switchLabel}>Endangered</Text>
                                    <Controller
                                        control={control}
                                        name="is_endangered"
                                        render={({ field: { onChange, value } }) => (
                                            <Switch value={value} onValueChange={onChange} color="#991B1B" />
                                        )}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* PHYSICAL DATA */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Physical / Growth Data</Text>

                            <View style={styles.row}>
                                <View style={[styles.field, styles.halfField]}>
                                    <Text style={styles.label}>Growth Speed</Text>
                                    <Controller
                                        control={control}
                                        name="growth_speed_label"
                                        render={({ field: { onChange, value } }) => (
                                            <Dropdown
                                                data={GROWTH_SPEED_OPTIONS}
                                                labelField="label"
                                                valueField="value"
                                                value={value}
                                                onChange={(item) => onChange(item.value)}
                                                style={styles.dropdown}
                                                placeholderStyle={styles.dropdownPlaceholder}
                                                selectedTextStyle={styles.dropdownSelected}
                                                placeholder="Select..."
                                            />
                                        )}
                                    />
                                </View>
                                <View style={[styles.field, styles.halfField]}>
                                    <Text style={styles.label}>Rate (m/yr)</Text>
                                    <Controller
                                        control={control}
                                        name="growth_rate_m_per_year"
                                        render={({ field: { onChange, value } }) => (
                                            <TextInput
                                                mode="outlined"
                                                value={String(value || "")}
                                                onChangeText={onChange}
                                                keyboardType="numeric"
                                                style={styles.input}
                                                outlineStyle={styles.inputOutline}
                                            />
                                        )}
                                    />
                                </View>
                            </View>

                            {renderMinMaxAvgInput("Mature Height", "m", "avg_mature_height_min_m", "avg_mature_height_max_m", "avg_mature_height_avg_m")}
                            {renderMinMaxAvgInput("Trunk Diameter", "cm", "avg_trunk_diameter_min_cm", "avg_trunk_diameter_max_cm", "avg_trunk_diameter_avg_cm")}
                            {renderMinMaxAvgInput("Wood Density", "g/cm³", "wood_density_min", "wood_density_max", "wood_density_avg")}
                        </View>

                        {/* CARBON DATA */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: '#059669' }]}>Carbon / CO₂ Data</Text>

                            <View style={styles.row}>
                                <View style={[styles.field, styles.halfField]}>
                                    <Text style={styles.label}>CO₂ Absorp. (kg/yr)</Text>
                                    <Controller
                                        control={control}
                                        name="co2_absorbed_kg_per_year"
                                        render={({ field: { onChange, value } }) => (
                                            <TextInput
                                                mode="outlined"
                                                value={String(value || "")}
                                                onChangeText={onChange}
                                                keyboardType="numeric"
                                                style={styles.input}
                                                outlineStyle={styles.inputOutline}
                                                left={<TextInput.Icon icon={() => <Icon name="Wind" size={16} color="#059669" />} />}
                                            />
                                        )}
                                    />
                                </View>
                                <View style={[styles.field, styles.halfField]}>
                                    <Text style={styles.label}>Carbon Fraction</Text>
                                    <Controller
                                        control={control}
                                        name="carbon_fraction"
                                        render={({ field: { onChange, value } }) => (
                                            <TextInput
                                                mode="outlined"
                                                value={String(value || "")}
                                                onChangeText={onChange}
                                                keyboardType="numeric"
                                                placeholder="0-1"
                                                style={styles.input}
                                                outlineStyle={styles.inputOutline}
                                            />
                                        )}
                                    />
                                </View>
                            </View>

                            {renderMinMaxAvgInput("CO₂ Stored (Mature)", "kg", "co2_stored_mature_min_kg", "co2_stored_mature_max_kg", "co2_stored_mature_avg_kg")}
                        </View>

                        {/* REMOVAL IMPACT */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: '#DC2626' }]}>Removal Impact</Text>
                            
                            <View style={styles.row}>
                                <View style={[styles.field, styles.halfField]}>
                                    <Text style={styles.label}>Lumber Ret. (0-1)</Text>
                                    <Controller
                                        control={control}
                                        name="lumber_carbon_retention_pct"
                                        render={({ field: { onChange, value } }) => (
                                            <TextInput
                                                mode="outlined"
                                                value={String(value || "")}
                                                onChangeText={onChange}
                                                keyboardType="numeric"
                                                placeholder="e.g. 0.8"
                                                style={styles.input}
                                                outlineStyle={styles.inputOutline}
                                            />
                                        )}
                                    />
                                </View>
                                <View style={[styles.field, styles.halfField]}>
                                    <Text style={styles.label}>Burn Release (0-1)</Text>
                                    <Controller
                                        control={control}
                                        name="burned_carbon_release_pct"
                                        render={({ field: { onChange, value } }) => (
                                            <TextInput
                                                mode="outlined"
                                                value={String(value || "")}
                                                onChangeText={onChange}
                                                keyboardType="numeric"
                                                placeholder="e.g. 1.0"
                                                style={styles.input}
                                                outlineStyle={styles.inputOutline}
                                            />
                                        )}
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.groupLabel}>Decay Years Range</Text>
                                <View style={styles.row}>
                                    <View style={[styles.field, styles.halfField]}>
                                        <Controller
                                            control={control}
                                            name="decay_years_min"
                                            render={({ field: { onChange, value } }) => (
                                                <TextInput
                                                    mode="outlined"
                                                    value={String(value || "")}
                                                    onChangeText={onChange}
                                                    placeholder="Min"
                                                    keyboardType="numeric"
                                                    style={styles.input}
                                                    outlineStyle={styles.inputOutline}
                                                />
                                            )}
                                        />
                                    </View>
                                    <View style={[styles.field, styles.halfField]}>
                                        <Controller
                                            control={control}
                                            name="decay_years_max"
                                            render={({ field: { onChange, value } }) => (
                                                <TextInput
                                                    mode="outlined"
                                                    value={String(value || "")}
                                                    onChangeText={onChange}
                                                    placeholder="Max"
                                                    keyboardType="numeric"
                                                    style={styles.input}
                                                    outlineStyle={styles.inputOutline}
                                                />
                                            )}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* NOTES */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Notes</Text>
                            <Controller
                                control={control}
                                name="notes"
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        mode="outlined"
                                        value={value}
                                        onChangeText={onChange}
                                        multiline
                                        numberOfLines={3}
                                        placeholder="Additional notes..."
                                        style={[styles.input, styles.textArea]}
                                        outlineStyle={styles.inputOutline}
                                        textColor="#0F172A"
                                    />
                                )}
                            />
                        </View>

                        <View style={styles.footer}>
                            <Button 
                                mode="contained" 
                                onPress={handleSubmit(onSubmit)}
                                loading={createMutation.isPending || updateMutation.isPending}
                                style={styles.submitButton}
                                contentStyle={{ height: 50 }}
                                icon={() => <Icon name="Save" size={20} color="#FFF" />}
                            >
                                {isEditMode ? "Update Species" : "Create Species"}
                            </Button>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    section: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderColor: "#E2E8F0",
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "600",
        color: "#1E40AF",
        marginBottom: 16,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    field: {
        marginBottom: 12,
    },
    fieldGroup: {
        marginBottom: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    groupLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#475569",
        marginBottom: 8,
    },
    halfField: {
        flex: 1,
    },
    row: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 8,
    },
    triInputRow: {
        flexDirection: "row",
        gap: 8,
    },
    triInputContainer: {
        flex: 1,
    },
    inputSubLabel: {
        fontSize: 10,
        color: "#64748B",
        textAlign: "center",
        marginTop: 4,
    },
    required: {
        color: "#EF4444",
    },
    input: {
        backgroundColor: "#F8FAFC",
    },
    inputSmall: {
        backgroundColor: "#F8FAFC",
        height: 40,
        fontSize: 13,
    },
    inputOutline: {
        borderColor: "#E2E8F0",
        borderRadius: 12,
        borderWidth: 1,
    },
    italic: {
        fontStyle: "italic",
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: "top",
    },
    dropdown: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
    },
    dropdownPlaceholder: {
        fontSize: 14,
        color: "#94A3B8",
    },
    dropdownSelected: {
        fontSize: 14,
        color: "#0F172A",
    },
    switchRowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
        gap: 16,
    },
    switchItem: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    switchLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#334155",
    },
    footer: {
        marginTop: 12,
    },
    submitButton: {
        backgroundColor: "#1E40AF",
        borderRadius: 14,
    },
});
