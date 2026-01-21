import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Text, TextInput, ActivityIndicator, Button, HelperText, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WebView } from "react-native-webview";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "../../../components/icons/Icon";
import StandardHeader from "../../../components/layout/StandardHeader";
import TreeImagePicker from "../../../components/tree-management/TreeImagePicker";
import {
    treeInventoryApi,
    TreeInventoryCreate,
    TreeInventoryUpdate,
    TreeSpecies,
} from "../../../core/api/tree-inventory-api";

interface RouteParams {
    treeId?: string;
}

// Generate Leaflet HTML for map picker
const generateMapPickerHTML = (lat: number, lng: number, hasMarker: boolean) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; }
        #map { width: 100%; height: 100%; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var map = L.map('map').setView([${lat}, ${lng}], 16);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);
        
        ${hasMarker ? `
        var marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);
        
        marker.on('dragend', function(e) {
            var pos = e.target.getLatLng();
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'markerDragged',
                lat: pos.lat,
                lng: pos.lng
            }));
        });
        ` : ''}
        
        map.on('click', function(e) {
            if (!marker) {
                marker = L.marker([e.latlng.lat, e.latlng.lng], { draggable: true }).addTo(map);
                marker.on('dragend', function(e) {
                    var pos = e.target.getLatLng();
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'markerDragged',
                        lat: pos.lat,
                        lng: pos.lng
                    }));
                });
            } else {
                marker.setLatLng(e.latlng);
            }
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'locationSelected',
                lat: e.latlng.lat,
                lng: e.latlng.lng
            }));
        });
    </script>
</body>
</html>
    `;
};

// Default center - San Fernando, Pampanga
const DEFAULT_CENTER = { lat: 15.0287, lng: 120.688 };

export default function TreeFormScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { treeId } = (route.params as RouteParams) || {};
    const queryClient = useQueryClient();

    const isEditMode = !!treeId;

    // Form state
    const [commonName, setCommonName] = useState("");
    const [species, setSpecies] = useState("");
    const [status, setStatus] = useState("alive");
    const [health, setHealth] = useState("healthy");
    const [latitude, setLatitude] = useState<number | undefined>();
    const [longitude, setLongitude] = useState<number | undefined>();
    const [address, setAddress] = useState("");
    const [barangay, setBarangay] = useState("");
    const [heightMeters, setHeightMeters] = useState("");
    const [diameterCm, setDiameterCm] = useState("");
    const [plantedDate, setPlantedDate] = useState<Date | undefined>();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [managedBy, setManagedBy] = useState("");
    const [contactPerson, setContactPerson] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [notes, setNotes] = useState("");
    const [photos, setPhotos] = useState<string[]>([]);

    // Fetch tree data if editing
    const { data: treeData, isLoading: loadingTree } = useQuery({
        queryKey: ["tree", treeId],
        queryFn: () => treeInventoryApi.getTreeById(treeId!),
        enabled: isEditMode,
    });

    // Fetch species list
    const { data: speciesData, isLoading: loadingSpecies } = useQuery({
        queryKey: ["species"],
        queryFn: () => treeInventoryApi.getSpecies(),
    });

    // Populate form when editing
    useEffect(() => {
        if (treeData?.data) {
            const tree = treeData.data;
            setCommonName(tree.common_name || "");
            setSpecies(tree.species || "");
            setStatus(tree.status);
            setHealth(tree.health);
            setLatitude(tree.latitude);
            setLongitude(tree.longitude);
            setAddress(tree.address || "");
            setBarangay(tree.barangay || "");
            setHeightMeters(tree.height_meters?.toString() || "");
            setDiameterCm(tree.diameter_cm?.toString() || "");
            setPlantedDate(tree.planted_date ? new Date(tree.planted_date) : undefined);
            setManagedBy(tree.managed_by || "");
            setContactPerson(tree.contact_person || "");
            setContactNumber(tree.contact_number || "");
            setNotes(tree.notes || "");
            setPhotos(tree.photos || []);
        }
    }, [treeData]);

    // Create/Update mutations
    const createMutation = useMutation({
        mutationFn: (data: TreeInventoryCreate) => treeInventoryApi.createTree(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trees"] });
            Alert.alert("Success", "Tree added successfully!");
            navigation.goBack();
        },
        onError: (error: any) => {
            Alert.alert("Error", error.message || "Failed to create tree");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: TreeInventoryUpdate) =>
            treeInventoryApi.updateTree(treeId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trees"] });
            queryClient.invalidateQueries({ queryKey: ["tree", treeId] });
            Alert.alert("Success", "Tree updated successfully!");
            navigation.goBack();
        },
        onError: (error: any) => {
            Alert.alert("Error", error.message || "Failed to update tree");
        },
    });

    const renderChevronIcon = useCallback(
        () => <Icon name="ChevronDown" size={18} color="#6B7280" />,
        []
    );

    const renderDropdownItem = useCallback(
        (item: { label: string; value: string }) => (
            <View style={styles.dropdownItem}>
                <Text style={styles.dropdownItemText}>{item.label}</Text>
            </View>
        ),
        []
    );

    const handleMapMessage = useCallback((event: any) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === "locationSelected" || message.type === "markerDragged") {
                setLatitude(message.lat);
                setLongitude(message.lng);
            }
        } catch (error) {
            console.error("Error parsing map message:", error);
        }
    }, []);

    const handleSave = () => {
        // Validation
        if (!commonName.trim()) {
            Alert.alert("Validation Error", "Common name is required");
            return;
        }

        let formattedDate = undefined;
        if (plantedDate) {
            const year = plantedDate.getFullYear();
            const month = String(plantedDate.getMonth() + 1).padStart(2, '0');
            const day = String(plantedDate.getDate()).padStart(2, '0');
            formattedDate = `${year}-${month}-${day}`;
        }

        const data: TreeInventoryCreate | TreeInventoryUpdate = {
            common_name: commonName.trim(),
            species: species.trim() || undefined,
            status,
            health,
            latitude,
            longitude,
            address: address.trim() || undefined,
            barangay: barangay.trim() || undefined,
            height_meters: heightMeters ? parseFloat(heightMeters) : undefined,
            diameter_cm: diameterCm ? parseFloat(diameterCm) : undefined,
            planted_date: formattedDate,
            managed_by: managedBy.trim() || undefined,
            contact_person: contactPerson.trim() || undefined,
            contact_number: contactNumber.trim() || undefined,
            notes: notes.trim() || undefined,
            photos: photos.length > 0 ? photos : undefined,
        };

        if (isEditMode) {
            updateMutation.mutate(data as TreeInventoryUpdate);
        } else {
            createMutation.mutate(data as TreeInventoryCreate);
        }
    };

    const statusOptions = [
        { label: "🟢 Alive", value: "alive" },
        { label: "🔴 Cut", value: "cut" },
        { label: "⚫ Dead", value: "dead" },
        { label: "🔵 Replaced", value: "replaced" },
    ];

    const healthOptions = [
        { label: "💚 Healthy", value: "healthy" },
        { label: "💛 Needs Attention", value: "needs_attention" },
        { label: "🧡 Diseased", value: "diseased" },
        { label: "⚫ Dead", value: "dead" },
    ];

    const speciesOptions = (speciesData?.data || []).map((s: TreeSpecies) => ({
        label: s.common_name + (s.scientific_name ? ` (${s.scientific_name})` : ""),
        value: s.scientific_name || s.common_name,
    }));

    const mapCenter = latitude && longitude ? { lat: latitude, lng: longitude } : DEFAULT_CENTER;
    const hasMarker = !!latitude && !!longitude;

    if (loadingTree) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E40AF" />
                <Text style={styles.loadingText}>Loading tree data...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <StandardHeader
                title={isEditMode ? "Edit Tree" : "Add New Tree"}
                subtitle={isEditMode ? treeData?.data.tree_code : undefined}
                showBack
                onBack={() => navigation.goBack()}
                backgroundColor="#FFFFFF"
                titleSize={20}
                iconSize={20}
            />
            <SafeAreaView style={styles.container} edges={["bottom"]}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.keyboardAvoid}
                >
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Basic Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Basic Information</Text>

                            <View style={styles.field}>
                                <Text style={styles.label}>
                                    Common Name <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    mode="outlined"
                                    value={commonName}
                                    onChangeText={setCommonName}
                                    placeholder="e.g., Mango, Narra, Mahogany"
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                    textColor="#0F172A"
                                    placeholderTextColor="#94A3B8"
                                    left={<TextInput.Icon icon={() => <Icon name="Leaf" size={16} color="#64748B" />} />}
                                />
                            </View>

                            <View style={styles.field}>
                                <Text style={styles.label}>Species (Scientific Name)</Text>
                                <Dropdown
                                    data={speciesOptions}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select or search species"
                                    searchPlaceholder="Search species..."
                                    value={species}
                                    onChange={(item) => setSpecies(item.value)}
                                    search
                                    style={styles.dropdown}
                                    placeholderStyle={styles.dropdownPlaceholder}
                                    selectedTextStyle={styles.dropdownSelected}
                                    containerStyle={styles.dropdownContainer}
                                    disable={loadingSpecies}
                                    renderRightIcon={renderChevronIcon}
                                    renderItem={renderDropdownItem}
                                    activeColor="#EFF6FF"
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.field, styles.halfField]}>
                                    <Text style={styles.label}>Status</Text>
                                    <Dropdown
                                        data={statusOptions}
                                        labelField="label"
                                        valueField="value"
                                        value={status}
                                        onChange={(item) => setStatus(item.value)}
                                        style={styles.dropdown}
                                        placeholderStyle={styles.dropdownPlaceholder}
                                        selectedTextStyle={styles.dropdownSelected}
                                        containerStyle={styles.dropdownContainer}
                                        renderRightIcon={renderChevronIcon}
                                        renderItem={renderDropdownItem}
                                        activeColor="#EFF6FF"
                                    />
                                </View>

                                <View style={[styles.field, styles.halfField]}>
                                    <Text style={styles.label}>Health</Text>
                                    <Dropdown
                                        data={healthOptions}
                                        labelField="label"
                                        valueField="value"
                                        value={health}
                                        onChange={(item) => setHealth(item.value)}
                                        style={styles.dropdown}
                                        placeholderStyle={styles.dropdownPlaceholder}
                                        selectedTextStyle={styles.dropdownSelected}
                                        containerStyle={styles.dropdownContainer}
                                        renderRightIcon={renderChevronIcon}
                                        renderItem={renderDropdownItem}
                                        activeColor="#EFF6FF"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Location */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Location</Text>

                            <View style={styles.mapContainer}>
                                <WebView
                                    source={{
                                        html: generateMapPickerHTML(mapCenter.lat, mapCenter.lng, hasMarker),
                                    }}
                                    style={styles.map}
                                    onMessage={handleMapMessage}
                                    javaScriptEnabled
                                />
                            </View>

                            {hasMarker && (
                                <View style={styles.coordinatesContainer}>
                                    <Icon name="MapPin" size={16} color="#1E40AF" />
                                    <Text style={styles.coordinatesText}>
                                        {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.field}>
                                <Text style={styles.label}>Address</Text>
                                <TextInput
                                    mode="outlined"
                                    value={address}
                                    onChangeText={setAddress}
                                    placeholder="Street address"
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                    textColor="#0F172A"
                                    placeholderTextColor="#94A3B8"
                                    left={<TextInput.Icon icon={() => <Icon name="MapPin" size={16} color="#64748B" />} />}
                                />
                            </View>

                            <View style={styles.field}>
                                <Text style={styles.label}>Barangay</Text>
                                <TextInput
                                    mode="outlined"
                                    value={barangay}
                                    onChangeText={setBarangay}
                                    placeholder="Barangay name"
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                    textColor="#0F172A"
                                    placeholderTextColor="#94A3B8"
                                    left={<TextInput.Icon icon={() => <Icon name="Map" size={16} color="#64748B" />} />}
                                />
                            </View>
                        </View>

                        {/* Measurements */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Measurements</Text>

                            <View style={styles.row}>
                                <View style={[styles.field, styles.halfField]}>
                                    <Text style={styles.label}>Height (m)</Text>
                                    <TextInput
                                        mode="outlined"
                                        value={heightMeters}
                                        onChangeText={setHeightMeters}
                                        placeholder="0.00"
                                        keyboardType="decimal-pad"
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        textColor="#0F172A"
                                        placeholderTextColor="#94A3B8"
                                        left={<TextInput.Icon icon={() => <Icon name="ArrowUpCircle" size={16} color="#64748B" />} />}
                                    />
                                </View>

                                <View style={[styles.field, styles.halfField]}>
                                    <Text style={styles.label}>Diameter (cm)</Text>
                                    <TextInput
                                        mode="outlined"
                                        value={diameterCm}
                                        onChangeText={setDiameterCm}
                                        placeholder="0.00"
                                        keyboardType="decimal-pad"
                                        style={styles.input}
                                        outlineStyle={styles.inputOutline}
                                        textColor="#0F172A"
                                        placeholderTextColor="#94A3B8"
                                        left={<TextInput.Icon icon={() => <Icon name="Circle" size={16} color="#64748B" />} />}
                                    />
                                </View>
                            </View>

                            <View style={styles.field}>
                                <Text style={styles.label}>Planted Date</Text>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Icon name="Calendar" size={20} color="#64748B" />
                                    <Text style={styles.dateButtonText}>
                                        {plantedDate
                                            ? plantedDate.toLocaleDateString()
                                            : "Select date"}
                                    </Text>
                                </TouchableOpacity>

                                {showDatePicker && (
                                    <DateTimePicker
                                        value={plantedDate || new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setShowDatePicker(false);
                                            if (selectedDate) {
                                                setPlantedDate(selectedDate);
                                            }
                                        }}
                                    />
                                )}
                            </View>
                        </View>

                        {/* Management */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Management</Text>

                            <View style={styles.field}>
                                <Text style={styles.label}>Managed By</Text>
                                <TextInput
                                    mode="outlined"
                                    value={managedBy}
                                    onChangeText={setManagedBy}
                                    placeholder="Organization or department"
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                    textColor="#0F172A"
                                    placeholderTextColor="#94A3B8"
                                    left={<TextInput.Icon icon={() => <Icon name="Building" size={16} color="#64748B" />} />}
                                />
                            </View>

                            <View style={styles.field}>
                                <Text style={styles.label}>Contact Person</Text>
                                <TextInput
                                    mode="outlined"
                                    value={contactPerson}
                                    onChangeText={setContactPerson}
                                    placeholder="Name of contact person"
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                    textColor="#0F172A"
                                    placeholderTextColor="#94A3B8"
                                    left={<TextInput.Icon icon={() => <Icon name="User" size={16} color="#64748B" />} />}
                                />
                            </View>

                            <View style={styles.field}>
                                <Text style={styles.label}>Contact Number</Text>
                                <TextInput
                                    mode="outlined"
                                    value={contactNumber}
                                    onChangeText={setContactNumber}
                                    placeholder="+63 XXX XXX XXXX"
                                    keyboardType="phone-pad"
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                    textColor="#0F172A"
                                    placeholderTextColor="#94A3B8"
                                    left={<TextInput.Icon icon={() => <Icon name="Phone" size={16} color="#64748B" />} />}
                                />
                            </View>
                        </View>

                        {/* Photos */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Photos</Text>
                            <TreeImagePicker
                                images={photos}
                                onImagesChange={setPhotos}
                                maxImages={10}
                            />
                        </View>

                        {/* Notes */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Notes</Text>
                            <TextInput
                                mode="outlined"
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Additional information, observations, or remarks"
                                multiline
                                numberOfLines={4}
                                style={[styles.input, styles.textArea]}
                                outlineStyle={styles.inputOutline}
                                textColor="#0F172A"
                                placeholderTextColor="#94A3B8"
                                left={<TextInput.Icon icon={() => <Icon name="FileText" size={16} color="#64748B" />} />}
                            />
                        </View>

                        {/* Save Button */}
                        <View style={styles.buttonSection}>
                            <Button
                                mode="contained"
                                onPress={handleSave}
                                disabled={createMutation.isPending || updateMutation.isPending}
                                loading={createMutation.isPending || updateMutation.isPending}
                                style={styles.saveBtn}
                                buttonColor="#1E40AF"
                                labelStyle={styles.saveBtnLabel}
                            >
                                {isEditMode ? "Update Tree" : "Create Tree"}
                            </Button>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
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
        backgroundColor: "#F8FAFC",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: "#64748B",
    },
    keyboardAvoid: {
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
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "600",
        color: "#1E40AF",
        marginBottom: 16,
        paddingHorizontal: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    field: {
        marginBottom: 12,
    },
    halfField: {
        flex: 1,
    },
    thirdField: {
        flex: 1,
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 8,
    },
    required: {
        color: "#EF4444",
    },
    input: {
        backgroundColor: "#F8FAFC",
    },
    inputOutline: {
        borderColor: "#E2E8F0",
        borderRadius: 12,
        borderWidth: 1,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: "top",
    },
    dropdown: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 50,
    },
    dropdownPlaceholder: {
        fontSize: 14,
        color: "#94A3B8",
        fontWeight: "500",
    },
    dropdownSelected: {
        fontSize: 14,
        color: "#0F172A",
        fontWeight: "600",
    },
    dropdownContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        overflow: "hidden",
    },
    dropdownItem: {
        paddingHorizontal: 18,
        paddingVertical: 14,
    },
    dropdownItemText: {
        fontSize: 14,
        color: "#0F172A",
        fontWeight: "500",
    },
    mapContainer: {
        height: 250,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 12,
    },
    map: {
        flex: 1,
    },
    coordinatesContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        padding: 10,
        backgroundColor: "#EFF6FF",
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#DBEAFE",
    },
    coordinatesText: {
        fontSize: 12,
        fontFamily: "monospace",
        color: "#1E40AF",
        fontWeight: "600",
    },
    dateButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: "#F8FAFC",
    },
    dateButtonText: {
        fontSize: 14,
        color: "#0F172A",
        fontWeight: "500",
    },
    buttonSection: {
        marginTop: 8,
    },
    saveBtn: {
        borderRadius: 14,
        paddingVertical: 6,
    },
    saveBtnLabel: {
        fontSize: 16,
        fontWeight: "700",
        paddingVertical: 4,
    },
});
