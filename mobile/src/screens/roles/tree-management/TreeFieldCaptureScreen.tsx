import React, { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
    Image,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "../../../components/icons/Icon";
import StandardHeader from "../../../components/layout/StandardHeader";
import GeotaggedCameraComponent from "../../../components/tree-management/GeotaggedCameraComponent";
import { useGPSLocation } from "../../../hooks/useGPSLocation";
import { useReverseGeocode } from "../../../hooks/useReverseGeocode";
import {
    treeInventoryApi,
    TreeInventoryCreate,
    TreeSpecies,
} from "../../../core/api/tree-inventory-api";

type Step = 1 | 2 | 3;

interface GeotaggedPhoto {
    uri: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
}

export default function TreeFieldCaptureScreen() {
    const navigation = useNavigation();
    const queryClient = useQueryClient();

    // Step management
    const [currentStep, setCurrentStep] = useState<Step>(1);

    // GPS Hook
    const {
        location: gpsLocation,
        accuracy: gpsAccuracy,
        isAcquiring: isAcquiringGPS,
        hasPermission: hasGPSPermission,
        error: gpsError,
        requestPermission: requestGPSPermission,
        startTracking: startGPSTracking,
        stopTracking: stopGPSTracking,
    } = useGPSLocation();

    // Reverse Geocoding Hook
    const {
        result: geocodeResult,
        isLoading: isGeocoding,
        reverseGeocode,
    } = useReverseGeocode();

    // Form state
    const [photos, setPhotos] = useState<GeotaggedPhoto[]>([]);
    const [uploadedPhotoUrls, setUploadedPhotoUrls] = useState<string[]>([]);
    const [commonName, setCommonName] = useState("");
    const [species, setSpecies] = useState("");
    const [status, setStatus] = useState("alive");
    const [health, setHealth] = useState("healthy");
    const [address, setAddress] = useState("");
    const [barangay, setBarangay] = useState("");
    const [heightMeters, setHeightMeters] = useState("");
    const [diameterCm, setDiameterCm] = useState("");
    const [ageYears, setAgeYears] = useState("");
    const [plantedDate, setPlantedDate] = useState<Date | undefined>();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [managedBy, setManagedBy] = useState("");
    const [notes, setNotes] = useState("");

    // Camera modal
    const [showCamera, setShowCamera] = useState(false);

    // Fetch species list
    const { data: speciesData, isLoading: loadingSpecies } = useQuery({
        queryKey: ["species"],
        queryFn: () => treeInventoryApi.getSpecies(),
    });

    // Auto-start GPS on mount
    useEffect(() => {
        const initGPS = async () => {
            const granted = await requestGPSPermission();
            if (granted) {
                await startGPSTracking();
            } else {
                Alert.alert(
                    "GPS Required",
                    "This field capture mode requires GPS to record tree locations accurately.",
                    [
                        { text: "Cancel", onPress: () => navigation.goBack() },
                        { text: "Retry", onPress: initGPS },
                    ]
                );
            }
        };
        initGPS();

        return () => {
            stopGPSTracking();
        };
    }, []);

    // Auto reverse geocode when GPS location acquired
    useEffect(() => {
        if (gpsLocation && !geocodeResult && currentStep === 1) {
            reverseGeocode(gpsLocation.coords.latitude, gpsLocation.coords.longitude);
        }
    }, [gpsLocation, currentStep]);

    // Auto-populate address fields from geocode result
    useEffect(() => {
        if (geocodeResult) {
            setAddress(geocodeResult.address);
            setBarangay(geocodeResult.barangay);
        }
    }, [geocodeResult]);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: TreeInventoryCreate) => treeInventoryApi.createTree(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["trees"] });
            const isQueued = response?.data && (response.data as any).queued === true;
            Alert.alert(isQueued ? "Queued" : "Success", isQueued
                ? "Tree saved to queue and will send when you have a connection."
                : "Tree registered successfully!", [
                {
                    text: "View on Map",
                    onPress: () => {
                        // Go back to main tabs - user can then switch to Map tab
                        navigation.goBack();
                        // Note: After going back, user should navigate to Map tab to see the new tree
                    },
                },
                {
                    text: "Add Another",
                    onPress: () => {
                        // Reset form
                        setCurrentStep(1);
                        setPhotos([]);
                        setUploadedPhotoUrls([]);
                        setCommonName("");
                        setSpecies("");
                        setStatus("alive");
                        setHealth("healthy");
                        setHeightMeters("");
                        setDiameterCm("");
                        setAgeYears("");
                        setPlantedDate(undefined);
                        setManagedBy("");
                        setNotes("");
                        startGPSTracking();
                    },
                },
                {
                    text: "Done",
                    onPress: () => navigation.goBack(),
                },
            ]);
        },
        onError: (error: any) => {
            Alert.alert("Error", error.message || "Failed to register tree");
        },
    });

    const handleCameraCapture = async (capturedPhoto: GeotaggedPhoto) => {
        setShowCamera(false);
        setPhotos((prev) => [...prev, capturedPhoto]);

        // Upload photo
        try {
            const formData = new FormData();
            formData.append("files", {
                uri: capturedPhoto.uri,
                type: "image/jpeg",
                name: `tree_${Date.now()}.jpg`,
            } as any);

            const response = await treeInventoryApi.uploadTreeImages(formData);
            if (response.data.uploaded && response.data.uploaded.length > 0) {
                const url = response.data.uploaded[0].url;
                setUploadedPhotoUrls((prev) => [...prev, url]);
                Alert.alert(
                    "Photo Added",
                    "Would you like to add another photo or proceed?",
                    [
                        { text: "Add Another", onPress: () => setShowCamera(true) },
                        { text: "Proceed", onPress: () => setCurrentStep(3) },
                    ]
                );
            }
        } catch (error) {
            console.error("Error uploading photo:", error);
            Alert.alert("Warning", "Photo captured but upload failed. You can retry later.");
        }
    };

    const handleNext = () => {
        if (currentStep === 1) {
            // Validate GPS
            if (!gpsLocation) {
                Alert.alert("GPS Required", "Please wait for GPS to acquire your location.");
                return;
            }
            if (gpsAccuracy && gpsAccuracy > 20) {
                Alert.alert(
                    "Poor GPS Accuracy",
                    `Current accuracy is ±${gpsAccuracy.toFixed(0)}m. For best results, move to an open area. Continue anyway?`,
                    [
                        { text: "Wait", style: "cancel" },
                        { text: "Continue", onPress: () => setCurrentStep(2) },
                    ]
                );
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Validate photo
            if (photos.length === 0) {
                Alert.alert("Photo Required", "Please take a photo of the tree.");
                return;
            }
            setCurrentStep(3);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((currentStep - 1) as Step);
        } else {
            Alert.alert(
                "Cancel Registration",
                "Are you sure you want to cancel tree registration?",
                [
                    { text: "No", style: "cancel" },
                    { text: "Yes", onPress: () => navigation.goBack() },
                ]
            );
        }
    };

    const handleSave = () => {
        // Validation
        if (!commonName.trim()) {
            Alert.alert("Validation Error", "Common name is required");
            return;
        }
        if (!gpsLocation) {
            Alert.alert("Validation Error", "GPS location is required");
            return;
        }
        // if (uploadedPhotoUrls.length === 0) {
        //     Alert.alert("Validation Error", "Photo upload is required");
        //     return;
        // }

        let formattedDate = undefined;
        if (plantedDate) {
            const year = plantedDate.getFullYear();
            const month = String(plantedDate.getMonth() + 1).padStart(2, '0');
            const day = String(plantedDate.getDate()).padStart(2, '0');
            formattedDate = `${year}-${month}-${day}`;
        }

        const data: TreeInventoryCreate = {
            common_name: commonName.trim(),
            species: species.trim() || undefined,
            status,
            health,
            latitude: gpsLocation.coords.latitude,
            longitude: gpsLocation.coords.longitude,
            address: address.trim() || undefined,
            barangay: barangay.trim() || undefined,
            height_meters: heightMeters ? parseFloat(heightMeters) : undefined,
            diameter_cm: diameterCm ? parseFloat(diameterCm) : undefined,
            age_years: ageYears ? parseInt(ageYears) : undefined,
            planted_date: formattedDate,
            managed_by: managedBy.trim() || undefined,
            notes: notes.trim() || undefined,
            photos: uploadedPhotoUrls,
        };

        createMutation.mutate(data);
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
        commonName: s.common_name,
    }));

    const handleSpeciesChange = (item: any) => {
        setSpecies(item.value);
        // Auto-populate common name if not already set
        if (!commonName && item.commonName) {
            setCommonName(item.commonName);
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            <View style={styles.stepItem}>
                <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}>
                    {currentStep > 1 ? (
                        <Icon name="Check" size={16} color="#FFFFFF" />
                    ) : (
                        <Text style={[styles.stepNumber, currentStep >= 1 && { color: "#FFFFFF" }]}>1</Text>
                    )}
                </View>
                <Text style={styles.stepLabel}>Location</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepItem}>
                <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive]}>
                    {currentStep > 2 ? (
                        <Icon name="Check" size={16} color="#FFFFFF" />
                    ) : (
                        <Text style={[styles.stepNumber, currentStep >= 2 && { color: "#FFFFFF" }]}>2</Text>
                    )}
                </View>
                <Text style={styles.stepLabel}>Photo</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepItem}>
                <View style={[styles.stepCircle, currentStep >= 3 && styles.stepCircleActive]}>
                    <Text style={[styles.stepNumber, currentStep >= 3 && { color: "#FFFFFF" }]}>3</Text>
                </View>
                <Text style={styles.stepLabel}>Details</Text>
            </View>
        </View>
    );

    const renderChevronIcon = () => <Icon name="ChevronDown" size={18} color="#64748B" />;

    const renderDropdownItem = (item: { label: string; value: string }) => (
        <View style={styles.dropdownItem}>
            <Text style={styles.dropdownItemText}>{item.label}</Text>
        </View>
    );

    const handleSkipPhoto = () => {
        Alert.alert(
            "Skip Photo?",
            "Are you sure you want to skip adding a photo? You can add one later.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Skip",
                    style: "default",
                    onPress: () => {
                        setPhotos([]);
                        setUploadedPhotoUrls([]);
                        setCurrentStep(3);
                    },
                },
            ]
        );
    };

    const renderStep1 = () => (
        <View style={styles.stepContent}>
            <View style={styles.instructionCard}>
                <Icon name="MapPin" size={48} color="#1E40AF" />
                <Text style={styles.instructionTitle}>Stand at Tree Location</Text>
                <Text style={styles.instructionText}>
                    Position yourself at the tree's location. The app will automatically capture GPS
                    coordinates.
                </Text>
            </View>

            <View style={styles.gpsCard}>
                {isAcquiringGPS ? (
                    <View style={styles.gpsAcquiring}>
                        <ActivityIndicator size="large" color="#1E40AF" />
                        <Text style={styles.gpsAcquiringText}>Acquiring GPS location...</Text>
                        <Text style={styles.gpsHint}>Please wait, this may take a moment</Text>
                    </View>
                ) : gpsLocation ? (
                    <View style={styles.gpsSuccess}>
                        <Icon name="CheckCircle2" size={32} color="#22c55e" />
                        <Text style={styles.gpsSuccessTitle}>Location Acquired</Text>
                        
                        <View style={styles.gpsDetails}>
                            <View style={styles.gpsDetailRow}>
                                <Text style={styles.gpsDetailLabel}>Coordinates:</Text>
                                <Text style={styles.gpsDetailValue}>
                                    {gpsLocation.coords.latitude.toFixed(6)}°N, {gpsLocation.coords.longitude.toFixed(6)}°E
                                </Text>
                            </View>
                            {gpsAccuracy && (
                                <View style={styles.gpsDetailRow}>
                                    <Text style={styles.gpsDetailLabel}>Accuracy:</Text>
                                    <Text style={[
                                        styles.gpsDetailValue,
                                        gpsAccuracy > 20 && { color: "#f97316" }
                                    ]}>
                                        ±{gpsAccuracy.toFixed(0)}m {gpsAccuracy > 20 && "⚠️"}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {isGeocoding ? (
                            <View style={styles.geocodingLoading}>
                                <ActivityIndicator size="small" color="#64748B" />
                                <Text style={styles.geocodingText}>Getting address...</Text>
                            </View>
                        ) : geocodeResult ? (
                            <View style={styles.addressPreview}>
                                <Icon name="MapPin" size={16} color="#64748B" />
                                <Text style={styles.addressText} numberOfLines={2}>
                                    {geocodeResult.address}
                                </Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={styles.refreshButton}
                            onPress={startGPSTracking}
                            disabled={isAcquiringGPS}
                        >
                            <Icon name="RefreshCw" size={16} color="#1E40AF" />
                            <Text style={styles.refreshButtonText}>Refresh Location</Text>
                        </TouchableOpacity>
                    </View>
                ) : gpsError ? (
                    <View style={styles.gpsError}>
                        <Icon name="XCircle" size={32} color="#ef4444" />
                        <Text style={styles.gpsErrorText}>{gpsError}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={startGPSTracking}
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
            </View>

            {gpsAccuracy && gpsAccuracy > 20 && (
                <View style={styles.warningCard}>
                    <Icon name="AlertTriangle" size={20} color="#f97316" />
                    <Text style={styles.warningText}>
                        GPS accuracy is low. For better results, move to an open area away from buildings.
                    </Text>
                </View>
            )}
        </View>
    );

    const renderStep2 = () => (
        <ScrollView style={styles.stepContent}>
            <View style={styles.instructionCard}>
                <Icon name="Camera" size={48} color="#1E40AF" />
                <Text style={styles.instructionTitle}>Capture Tree Photo</Text>
                <Text style={styles.instructionText}>
                    Take a clear photo of the tree. GPS coordinates will be embedded in the image.
                </Text>
            </View>

            {photos.length > 0 ? (
                <View style={styles.photoPreview}>
                    <Image source={{ uri: photos[photos.length - 1].uri }} style={styles.photoImage} />
                    <View style={styles.photoOverlay}>
                        <Text style={styles.photoCoords}>
                            📍 {photos[photos.length - 1].latitude.toFixed(6)}°N, {photos[photos.length - 1].longitude.toFixed(6)}°E
                        </Text>
                        <Text style={styles.photoAccuracy}>±{photos[photos.length - 1].accuracy.toFixed(0)}m</Text>
                    </View>
                    <View style={styles.photoActions}>
                        <TouchableOpacity
                            style={styles.addAnotherButton}
                            onPress={() => setShowCamera(true)}
                        >
                            <Icon name="Plus" size={18} color="#FFFFFF" />
                            <Text style={styles.addAnotherButtonText}>Add Another Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.proceedButton}
                            onPress={() => setCurrentStep(3)}
                        >
                            <Icon name="ArrowRight" size={18} color="#FFFFFF" />
                            <Text style={styles.proceedButtonText}>Proceed</Text>
                        </TouchableOpacity>
                    </View>
                    {photos.length > 1 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.photoThumbs}
                        >
                            {photos.map((item, index) => (
                                <Image
                                    key={`${item.timestamp}-${index}`}
                                    source={{ uri: item.uri }}
                                    style={styles.photoThumb}
                                />
                            ))}
                        </ScrollView>
                    )}
                </View>
            ) : (
                <View style={{ gap: 16 }}>
                    <TouchableOpacity
                        style={styles.captureButton}
                        onPress={() => setShowCamera(true)}
                    >
                        <Icon name="Camera" size={32} color="#FFFFFF" />
                        <Text style={styles.captureButtonText}>Open Camera</Text>
                    </TouchableOpacity>

                    <Button
                        mode="text"
                        onPress={handleSkipPhoto}
                        textColor="#64748B"
                        labelStyle={{ fontSize: 14, fontWeight: "600" }}
                    >
                        Skip Photo Setup
                    </Button>
                </View>
            )}
        </ScrollView>
    );

    const renderStep3 = () => (
        <ScrollView style={styles.stepContent} contentContainerStyle={styles.formContent}>
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
                        onChange={handleSpeciesChange}
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

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Location Details</Text>

                <View style={styles.gpsInfoBox}>
                    <Icon name="MapPin" size={16} color="#1E40AF" />
                    <Text style={styles.gpsInfoText}>
                        {gpsLocation?.coords.latitude.toFixed(6)}°N, {gpsLocation?.coords.longitude.toFixed(6)}°E
                    </Text>
                </View>

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

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Measurements (Optional)</Text>

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
                    <Text style={styles.label}>Age (years)</Text>
                    <TextInput
                        mode="outlined"
                        value={ageYears}
                        onChangeText={setAgeYears}
                        placeholder="0"
                        keyboardType="number-pad"
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        textColor="#0F172A"
                        placeholderTextColor="#94A3B8"
                        left={<TextInput.Icon icon={() => <Icon name="Calendar" size={16} color="#64748B" />} />}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Information</Text>

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
                    <Text style={styles.label}>Notes</Text>
                    <TextInput
                        mode="outlined"
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Additional observations or remarks"
                        multiline
                        numberOfLines={3}
                        style={[styles.input, styles.textArea]}
                        outlineStyle={styles.inputOutline}
                        textColor="#0F172A"
                        placeholderTextColor="#94A3B8"
                        left={<TextInput.Icon icon={() => <Icon name="FileText" size={16} color="#64748B" />} />}
                    />
                </View>
            </View>
        </ScrollView>
    );

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <StandardHeader
                title="Add Tree (Field Mode)"
                subtitle={`Step ${currentStep} of 3`}
                showBack
                onBack={handleBack}
                titleSize={22}
            />

            {renderStepIndicator()}

            <View style={styles.content}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
            </View>

            <View style={styles.footer}>
                {currentStep < 3 ? (
                    <Button
                        mode="contained"
                        onPress={handleNext}
                        disabled={(currentStep === 1 && !gpsLocation) || (currentStep === 2 && photos.length === 0)}
                        style={styles.nextButton}
                        contentStyle={{ height: 50, flexDirection: 'row-reverse' }}
                        labelStyle={styles.nextButtonText}
                        icon={({ size, color }) => <Icon name="ChevronRight" size={size} color={color} />} 
                        buttonColor="#1E40AF"
                    >
                        Continue
                    </Button>
                ) : (
                    <Button
                        mode="contained"
                        onPress={handleSave}
                        disabled={createMutation.isPending}
                        loading={createMutation.isPending}
                        style={styles.saveButton}
                        contentStyle={{ height: 50 }}
                        labelStyle={styles.saveButtonText}
                        icon={({ size, color }) => <Icon name="Save" size={size} color={color} />}
                        buttonColor="#22c55e"
                    >
                        Register Tree
                    </Button>
                )}
            </View>

            <Modal visible={showCamera} animationType="slide" presentationStyle="fullScreen">
                <GeotaggedCameraComponent
                    onCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                />
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    content: {
        flex: 1,
    },
    stepIndicator: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
        paddingHorizontal: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    stepItem: {
        alignItems: "center",
    },
    stepCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6,
    },
    stepCircleActive: {
        backgroundColor: "#1E40AF",
    },
    stepNumber: {
        fontSize: 16,
        fontWeight: "700",
        color: "#64748B",
    },
    stepLabel: {
        fontSize: 12,
        fontWeight: "500",
        color: "#64748B",
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: "#E2E8F0",
        marginHorizontal: 8,
        marginBottom: 22,
    },
    stepContent: {
        flex: 1,
        padding: 16,
    },
    formContent: {
        paddingBottom: 32,
    },
    instructionCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    instructionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0F172A",
        marginTop: 12,
        marginBottom: 8,
    },
    instructionText: {
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 20,
    },
    gpsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 24,
        minHeight: 200,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    gpsAcquiring: {
        alignItems: "center",
    },
    gpsAcquiringText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1E40AF",
        marginTop: 16,
    },
    gpsHint: {
        fontSize: 13,
        color: "#64748B",
        marginTop: 8,
    },
    gpsSuccess: {
        alignItems: "center",
        width: "100%",
    },
    gpsSuccessTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#22c55e",
        marginTop: 12,
        marginBottom: 16,
    },
    gpsDetails: {
        width: "100%",
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    gpsDetailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    gpsDetailLabel: {
        fontSize: 13,
        color: "#64748B",
        fontWeight: "500",
    },
    gpsDetailValue: {
        fontSize: 13,
        color: "#0F172A",
        fontWeight: "600",
        fontFamily: "monospace",
    },
    geocodingLoading: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    geocodingText: {
        fontSize: 12,
        color: "#64748B",
    },
    addressPreview: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#EFF6FF",
        padding: 10,
        borderRadius: 8,
        width: "100%",
        borderWidth: 1,
        borderColor: "#DBEAFE",
    },
    addressText: {
        flex: 1,
        fontSize: 12,
        color: "#1E40AF",
    },
    refreshButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#EFF6FF",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#1E40AF",
        marginTop: 12,
    },
    refreshButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1E40AF",
    },
    gpsError: {
        alignItems: "center",
    },
    gpsErrorText: {
        fontSize: 14,
        color: "#ef4444",
        marginTop: 12,
        textAlign: "center",
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: "#1E40AF",
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 12,
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 14,
    },
    warningCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#FEF3C7",
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    warningText: {
        flex: 1,
        fontSize: 12,
        color: "#92400E",
    },
    photoPreview: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    photoImage: {
        width: "100%",
        height: 300,
        borderRadius: 12,
        backgroundColor: "#F3F4F6",
    },
    photoOverlay: {
        position: "absolute",
        bottom: 76,
        left: 16,
        right: 16,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: 8,
        borderRadius: 8,
    },
    photoCoords: {
        fontSize: 11,
        color: "#FFFFFF",
        fontFamily: "monospace",
    },
    photoAccuracy: {
        fontSize: 10,
        color: "#D1D5DB",
        marginTop: 2,
    },
    photoActions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 12,
        width: "100%",
    },
    addAnotherButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#2563EB",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
    },
    addAnotherButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 13,
    },
    proceedButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#22c55e",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
    },
    proceedButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 13,
    },
    photoThumbs: {
        gap: 8,
        marginTop: 12,
    },
    photoThumb: {
        width: 72,
        height: 72,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    retakeButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#64748B",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: 12,
    },
    retakeButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 14,
    },
    captureButton: {
        backgroundColor: "#1E40AF",
        borderRadius: 16,
        paddingVertical: 48,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    captureButtonText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
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
        minHeight: 80,
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
    gpsInfoBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#EFF6FF",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#DBEAFE",
    },
    gpsInfoText: {
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
    footer: {
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    nextButton: {
        borderRadius: 14,
    },
    nextButtonDisabled: {
        backgroundColor: "#94A3B8",
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: "700",
    },
    saveButton: {
        borderRadius: 14,
    },
    saveButtonDisabled: {
        backgroundColor: "#94A3B8",
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "700",
    },
});
