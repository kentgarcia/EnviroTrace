import React, { useMemo, useState, useEffect } from "react";
import { View, StyleSheet, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Text } from "react-native";
import { Button, TextInput as PaperInput, Chip, ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "../../../../components/icons/Icon";
import StandardHeader from "../../../../components/layout/StandardHeader";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuthStore } from "../../../../core/stores/authStore";
import PlateCaptureCameraComponent from "../../../../components/camera/PlateCaptureCameraComponent";
import { PlateRecognitionService, VehicleSearchResponse, PlateRecognitionResponse } from "../../../../core/api/plate-recognition-service";
import {
  useVehicle,
  useVehicles,
  useAddEmissionTest,
  EmissionTestInput,
  Vehicle,
} from "../../../../core/api/emission-service";

export default function AddTestScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { user } = useAuthStore();
  const vehicleId: string | undefined = route?.params?.vehicleId;

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [quarter, setQuarter] = useState("" + (Math.floor((new Date().getMonth()) / 3) + 1));
  const [year, setYear] = useState("" + new Date().getFullYear());
  const [result, setResult] = useState<"pass" | "fail" | "unknown">("pass");
  const [remarks, setRemarks] = useState("");

  // Plate recognition states
  const [showCamera, setShowCamera] = useState(false);
  const [recognizedVehicle, setRecognizedVehicle] = useState<VehicleSearchResponse | null>(null);
  const [plateNumber, setPlateNumber] = useState("");
  const [isProcessingPlate, setIsProcessingPlate] = useState(false);
  const [plateSearchManual, setPlateSearchManual] = useState(false);

  // Vehicle suggestions for autocomplete
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch vehicles for suggestions
  const { data: vehiclesData } = useVehicles({ search: plateNumber }, 0, 5);
  const vehicleSuggestions = useMemo(() => vehiclesData?.vehicles || [], [vehiclesData]);

  // Fetch pre-selected vehicle if vehicleId is provided
  const { data: preSelectedVehicle } = useVehicle(vehicleId || "");

  // Add test mutation
  const addTestMutation = useAddEmissionTest();

  // Quarter dropdown data
  const quarterData = [
    { label: "Q1 (Jan-Mar)", value: "1" },
    { label: "Q2 (Apr-Jun)", value: "2" },
    { label: "Q3 (Jul-Sep)", value: "3" },
    { label: "Q4 (Oct-Dec)", value: "4" },
  ];

  // Update vehicle suggestions when plate number changes
  useEffect(() => {
    if (plateNumber.trim().length >= 2) {
      setShowSuggestions(vehicleSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [plateNumber, vehicleSuggestions]);

  // Determine the effective vehicle ID (from route param or recognized vehicle)
  const effectiveVehicleId = vehicleId || recognizedVehicle?.id;

  const isValid = useMemo(() => {
    return effectiveVehicleId && date && quarter && year;
  }, [effectiveVehicleId, date, quarter, year]);

  const onSave = async () => {
    if (!isValid) return;

    try {
      const testData: EmissionTestInput = {
        vehicle_id: effectiveVehicleId!,
        test_date: new Date(date).toISOString(),
        quarter: parseInt(quarter, 10),
        year: parseInt(year, 10),
        result: result === "unknown" ? null : result === "pass",
        remarks: remarks || undefined,
      };

      await addTestMutation.mutateAsync(testData);

      Alert.alert("Success", "Test record saved successfully", [
        {
          text: "OK",
          onPress: () => (navigation as any).goBack(),
        },
      ]);
    } catch (e: any) {
      Alert.alert("Save failed", e?.response?.data?.detail || e?.message || "Could not save test.");
    }
  };

  const handlePlateCapture = async (imageData: string, mimeType: string) => {
    setIsProcessingPlate(true);
    try {
      console.log("Starting plate recognition...");

      // Add timeout to prevent indefinite hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 30000)
      );

      const recognitionPromise = PlateRecognitionService.recognizePlate({
        image_data: imageData,
        mime_type: mimeType,
      });

      const response = await Promise.race([recognitionPromise, timeoutPromise]) as PlateRecognitionResponse;

      console.log("Plate recognition response:", response);

      if (response.plate_number === null || response.plate_number === undefined) {
        // No plate was detected
        Alert.alert(
          "No License Plate Detected",
          response.message || "Could not detect a license plate in the image. Please try again with a clearer photo.",
          [
            {
              text: "Try Again",
              onPress: () => setShowCamera(true),
            },
            {
              text: "Search Manually",
              onPress: () => setPlateSearchManual(true),
            },
            { text: "Cancel" },
          ]
        );
        return;
      }

      if (response.vehicle_exists && response.vehicle_details) {
        // Map the vehicle details to match VehicleSearchResponse interface
        const vehicleDetails: VehicleSearchResponse = {
          ...response.vehicle_details,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setRecognizedVehicle(vehicleDetails);
        setPlateNumber(response.plate_number);
        Alert.alert(
          "Vehicle Found!",
          `License plate "${response.plate_number}" belongs to vehicle driven by ${response.vehicle_details.driver_name}.\n\nConfidence: ${Math.round(response.confidence * 100)}%`,
          [{ text: "OK" }]
        );
      } else {
        setPlateNumber(response.plate_number);

        if (response.suggest_creation) {
          // Suggest creating a new vehicle record
          Alert.alert(
            "Vehicle Not Found",
            `License plate "${response.plate_number}" was detected but this vehicle is not registered in the system.\n\nWould you like to register this vehicle?`,
            [
              {
                text: "Register Vehicle",
                onPress: () => {
                  // Store plate info and navigate to AddVehicle screen
                  // The AddVehicleScreen can use useRoute to get params
                  (navigation.navigate as any)("AddVehicle", {
                    plateNumber: response.plate_number,
                    fromPlateRecognition: "true"
                  });
                },
              },
              {
                text: "Search Manually",
                onPress: () => setPlateSearchManual(true),
              },
              { text: "Cancel" },
            ]
          );
        } else {
          Alert.alert(
            "Vehicle Not Found",
            `Recognized plate number: "${response.plate_number}"\n\nThis vehicle is not registered in the system. Please ensure the vehicle is registered before adding tests.`,
            [
              {
                text: "Register Vehicle",
                onPress: () => {
                  (navigation.navigate as any)("AddVehicle", {
                    plateNumber: response.plate_number,
                    fromPlateRecognition: "true"
                  });
                },
              },
              {
                text: "Search Manually",
                onPress: () => setPlateSearchManual(true),
              },
              { text: "Cancel" },
            ]
          );
        }
      }
    } catch (error: any) {
      console.error("Plate recognition error:", error);

      let errorMessage = "Could not recognize the license plate. Please try again or search manually.";

      if (error?.message === "Request timeout") {
        errorMessage = "The request took too long to complete. Please check your internet connection and try again.";
      } else if (error?.response?.status === 404) {
        // Handle 404 errors specifically - likely no plate detected
        const detail = error?.response?.data?.detail || "";
        if (detail.includes("AI response:")) {
          errorMessage = `No license plate detected in the image.\n\n${detail}\n\nTips:\n• Ensure the plate is clearly visible and well-lit\n• Try getting closer to the vehicle\n• Make sure the plate fills most of the camera frame`;
        } else {
          errorMessage = "No license plate was detected in the image. Please try:\n\n• Getting closer to the vehicle\n• Ensuring good lighting\n• Making sure the plate is clearly visible";
        }
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert(
        "Recognition Failed",
        errorMessage,
        [
          {
            text: "Search Manually",
            onPress: () => setPlateSearchManual(true),
          },
          { text: "Retry", onPress: () => setShowCamera(true) },
        ]
      );
    } finally {
      setIsProcessingPlate(false);
      setShowCamera(false);
    }
  };

  const handleManualPlateSearch = async () => {
    const cleanPlateNumber = plateNumber.trim().toUpperCase();
    if (!cleanPlateNumber) {
      Alert.alert("Error", "Please enter a plate number to search.");
      return;
    }

    setIsProcessingPlate(true);
    setShowSuggestions(false); // Hide suggestions during search
    try {
      const vehicle = await PlateRecognitionService.searchVehicleByPlate(cleanPlateNumber);
      if (vehicle) {
        setRecognizedVehicle(vehicle);
        setPlateNumber(cleanPlateNumber); // Update with formatted version
        Alert.alert(
          "Vehicle Found!",
          `Vehicle with plate "${cleanPlateNumber}" found.\n\nDriver: ${vehicle.driver_name}`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Vehicle Not Found",
          `No vehicle found with plate number "${cleanPlateNumber}". Please check the plate number or ensure the vehicle is registered.`,
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      console.error("Manual search error:", error);
      Alert.alert(
        "Search Failed",
        error?.response?.data?.detail || error?.message || "Could not search for the vehicle.",
        [{ text: "OK" }]
      );
    } finally {
      setIsProcessingPlate(false);
      setPlateSearchManual(false);
    }
  };

  const clearVehicleSelection = () => {
    setRecognizedVehicle(null);
    setPlateNumber("");
  };

  const handleSelectSuggestion = (vehicle: Vehicle) => {
    // Map Vehicle to VehicleSearchResponse
    const vehicleResponse: VehicleSearchResponse = {
      id: vehicle.id,
      plate_number: vehicle.plate_number,
      driver_name: vehicle.driver_name,
      contact_number: vehicle.contact_number,
      engine_type: vehicle.engine_type,
      vehicle_type: vehicle.vehicle_type,
      wheels: vehicle.wheels,
      office_id: vehicle.office_id,
      office_name: vehicle.office?.name,
      latest_test_result: vehicle.latest_test_result,
      latest_test_date: vehicle.latest_test_date || undefined,
      created_at: vehicle.created_at,
      updated_at: vehicle.updated_at,
    };
    setRecognizedVehicle(vehicleResponse);
    setPlateNumber(vehicle.plate_number);
    setShowSuggestions(false);
    setPlateSearchManual(false);
  };

  return (
    <>
      <StandardHeader
        title="Record Emission Test"
        showBack
        backgroundColor="rgba(255, 255, 255, 0.95)"
        statusBarStyle="dark"
        titleSize={22}
        subtitleSize={12}
        iconSize={20}
      />
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Vehicle Selection Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Selection</Text>

            {!vehicleId && !recognizedVehicle ? (
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.primaryActionButton}
                  onPress={() => setShowCamera(true)}
                  activeOpacity={0.7}
                  disabled={isProcessingPlate}
                >
                  <View style={styles.actionButtonIcon}>
                    <Icon name="Camera" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.actionButtonContent}>
                    <Text style={styles.actionButtonTitle}>Scan License Plate</Text>
                    <Text style={styles.actionButtonSubtitle}>Use camera to recognize plate</Text>
                  </View>
                  <Icon name="ChevronRight" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={styles.secondaryActionButton}
                  onPress={() => setPlateSearchManual(true)}
                  activeOpacity={0.7}
                  disabled={isProcessingPlate}
                >
                  <View style={styles.secondaryActionIcon}>
                    <Icon name="Search" size={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.actionButtonContent}>
                    <Text style={styles.secondaryActionTitle}>Search Manually</Text>
                    <Text style={styles.secondaryActionSubtitle}>Enter plate number</Text>
                  </View>
                  <Icon name="ChevronRight" size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Processing Indicator */}
                {isProcessingPlate && (
                  <View style={styles.processingContainer}>
                    <ActivityIndicator size="small" color="#111827" />
                    <Text style={styles.processingText}>Processing...</Text>
                  </View>
                )}
              </View>
            ) : recognizedVehicle ? (
              <View style={styles.card}>
                <View style={styles.selectedVehicleCard}>
                  <View style={styles.vehicleIconContainer}>
                    <Icon name="Car" size={28} color="#111827" />
                  </View>
                  <View style={styles.selectedVehicleInfo}>
                    <View style={styles.plateRow}>
                      <Icon name="Hash" size={16} color="#6B7280" />
                      <Text style={styles.plateNumber}>{recognizedVehicle.plate_number}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Icon name="User" size={14} color="#6B7280" />
                      <Text style={styles.infoText}>{recognizedVehicle.driver_name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Icon name="Car" size={14} color="#6B7280" />
                      <Text style={styles.infoText}>
                        {recognizedVehicle.vehicle_type} • {recognizedVehicle.engine_type}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.changeButton}
                    onPress={clearVehicleSelection}
                    activeOpacity={0.7}
                  >
                    <Icon name="X" size={20} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.card}>
                {preSelectedVehicle ? (
                  <View style={styles.selectedVehicleCard}>
                    <View style={styles.vehicleIconContainer}>
                      <Icon name="Car" size={28} color="#02339C" />
                    </View>
                    <View style={styles.selectedVehicleInfo}>
                      <View style={styles.plateRow}>
                        <Icon name="Hash" size={16} color="#6B7280" />
                        <Text style={styles.plateNumber}>{preSelectedVehicle.plate_number}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Icon name="User" size={14} color="#6B7280" />
                        <Text style={styles.infoText}>{preSelectedVehicle.driver_name || "Unknown driver"}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Icon name="Car" size={14} color="#6B7280" />
                        <Text style={styles.infoText}>
                          {preSelectedVehicle.vehicle_type} • {preSelectedVehicle.engine_type}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.preSelectedInfo}>
                    <Icon name="CheckCircle" size={20} color="#16A34A" />
                    <Text style={styles.preSelectedText}>Using pre-selected vehicle</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Test Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Details</Text>
            <View style={styles.card}>
              {/* Date Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Test Date</Text>
                <View style={styles.inputContainer}>
                  <Icon name="Calendar" size={18} color="#6B7280" />
                  <PaperInput
                    value={date}
                    onChangeText={setDate}
                    placeholder="YYYY-MM-DD"
                    style={styles.textInput}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    mode="flat"
                  />
                </View>
              </View>

              {/* Quarter and Year Row */}
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Quarter</Text>
                  <View style={styles.dropdownContainer}>
                    <Dropdown
                      data={quarterData}
                      labelField="label"
                      valueField="value"
                      value={quarter}
                      onChange={(item) => setQuarter(item.value)}
                      placeholder="Select Quarter"
                      style={styles.dropdown}
                      placeholderStyle={styles.dropdownPlaceholder}
                      selectedTextStyle={styles.dropdownSelectedText}
                      itemTextStyle={styles.dropdownItemText}
                      containerStyle={styles.dropdownListContainer}
                      activeColor="#EEF2FF"
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Year</Text>
                  <View style={styles.inputContainer}>
                    <PaperInput
                      value={year}
                      onChangeText={setYear}
                      placeholder="YYYY"
                      keyboardType="number-pad"
                      maxLength={4}
                      style={styles.textInput}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      mode="flat"
                    />
                  </View>
                </View>
              </View>

              {/* Result Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Test Result</Text>
                <View style={styles.resultChips}>
                  <TouchableOpacity
                    style={[
                      styles.resultChip,
                      result === "pass" && styles.resultChipPass,
                    ]}
                    onPress={() => setResult("pass")}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="CheckCircle"
                      size={16}
                      color={result === "pass" ? "#16A34A" : "#6B7280"}
                    />
                    <Text
                      style={[
                        styles.resultChipText,
                        result === "pass" && styles.resultChipTextActive,
                      ]}
                    >
                      Pass
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.resultChip,
                      result === "fail" && styles.resultChipFail,
                    ]}
                    onPress={() => setResult("fail")}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="XCircle"
                      size={16}
                      color={result === "fail" ? "#DC2626" : "#6B7280"}
                    />
                    <Text
                      style={[
                        styles.resultChipText,
                        result === "fail" && styles.resultChipTextActive,
                      ]}
                    >
                      Fail
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.resultChip,
                      result === "unknown" && styles.resultChipUnknown,
                    ]}
                    onPress={() => setResult("unknown")}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="HelpCircle"
                      size={16}
                      color={result === "unknown" ? "#F59E0B" : "#6B7280"}
                    />
                    <Text
                      style={[
                        styles.resultChipText,
                        result === "unknown" && styles.resultChipTextActive,
                      ]}
                    >
                      Unknown
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remarks Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Remarks (Optional)</Text>
                <View style={[styles.inputContainer, styles.textareaContainer]}>
                  <PaperInput
                    value={remarks}
                    onChangeText={setRemarks}
                    placeholder="Add any additional notes..."
                    multiline
                    numberOfLines={4}
                    style={[styles.textInput, styles.textarea]}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    mode="flat"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!isValid || addTestMutation.isPending) && styles.saveButtonDisabled,
            ]}
            onPress={onSave}
            disabled={!isValid || addTestMutation.isPending}
            activeOpacity={0.7}
          >
            {addTestMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Icon name="Save" size={20} color="#FFFFFF" />
            )}
            <Text style={styles.saveButtonText}>
              {addTestMutation.isPending ? "Saving..." : "Save Test Record"}
            </Text>
          </TouchableOpacity>

          {/* Bottom Spacer */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Camera Modal */}
        <Modal
          visible={showCamera}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <PlateCaptureCameraComponent
            onCapture={handlePlateCapture}
            onClose={() => setShowCamera(false)}
            isProcessing={isProcessingPlate}
          />
        </Modal>

        {/* Manual Search Modal */}
        <Modal
          visible={plateSearchManual}
          animationType="slide"
          transparent
          onRequestClose={() => setPlateSearchManual(false)}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Search Vehicle by Plate Number</Text>

              <View style={styles.modalInputContainer}>
                <PaperInput
                  value={plateNumber}
                  onChangeText={setPlateNumber}
                  placeholder="e.g., ABC123, XYZ789"
                  autoCapitalize="characters"
                  maxLength={20}
                  autoFocus
                  returnKeyType="search"
                  onSubmitEditing={handleManualPlateSearch}
                  style={styles.modalInput}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  mode="flat"
                />
              </View>

              {/* Suggestions List */}
              {showSuggestions && vehicleSuggestions.length > 0 && (
                <ScrollView style={styles.suggestionsContainer} keyboardShouldPersistTaps="handled">
                  {vehicleSuggestions.map((vehicle) => (
                    <TouchableOpacity
                      key={vehicle.id}
                      style={styles.suggestionItem}
                      onPress={() => handleSelectSuggestion(vehicle)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.suggestionContent}>
                        <View style={styles.suggestionIconContainer}>
                          <Icon name="Car" size={20} color="#02339C" />
                        </View>
                        <View style={styles.suggestionTextContainer}>
                          <Text style={styles.suggestionPlate}>{vehicle.plate_number}</Text>
                          <Text style={styles.suggestionDriver}>{vehicle.driver_name}</Text>
                        </View>
                      </View>
                      <Icon name="ChevronRight" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setPlateSearchManual(false)}
                  disabled={isProcessingPlate}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalSearchButton,
                    (!plateNumber.trim() || isProcessingPlate) && styles.modalSearchButtonDisabled,
                  ]}
                  onPress={handleManualPlateSearch}
                  disabled={!plateNumber.trim() || isProcessingPlate}
                  activeOpacity={0.7}
                >
                  {isProcessingPlate ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSearchText}>Search</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Section Styles
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  // Card Styles
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },

  // Primary Action Button (Scan Plate)
  primaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  actionButtonSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },

  // Divider
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "700",
  },

  // Secondary Action Button (Manual Search)
  secondaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    padding: 16,
    gap: 12,
  },
  secondaryActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  secondaryActionSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },

  // Processing Indicator
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
  },
  processingText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },

  // Selected Vehicle Card
  selectedVehicleCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  vehicleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(17, 24, 39, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(17, 24, 39, 0.15)",
  },
  selectedVehicleInfo: {
    flex: 1,
    gap: 6,
  },
  plateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  plateNumber: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  changeButton: {
    padding: 8,
  },

  // Pre-selected Vehicle
  preSelectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  preSelectedText: {
    fontSize: 13,
    color: "#16A34A",
    fontWeight: "700",
  },

  // Input Styles
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: "transparent",
    fontSize: 14,
    color: "#111827",
    paddingHorizontal: 0,
    height: 44,
    fontWeight: "500",
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  textareaContainer: {
    alignItems: "flex-start",
    paddingVertical: 0,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },

  // Dropdown Styles
  dropdownContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    height: 44,
    justifyContent: "center",
  },
  dropdown: {
    height: 44,
  },
  dropdownPlaceholder: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  dropdownSelectedText: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
  },
  dropdownItemText: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "500",
  },
  dropdownListContainer: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    marginTop: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Result Chips
  resultChips: {
    flexDirection: "row",
    gap: 8,
  },
  resultChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
    gap: 6,
  },
  resultChipPass: {
    backgroundColor: "#DCFCE7",
    borderColor: "#16A34A",
    borderWidth: 2,
  },
  resultChipFail: {
    backgroundColor: "#FEE2E2",
    borderColor: "#DC2626",
    borderWidth: 2,
  },
  resultChipUnknown: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
    borderWidth: 2,
  },
  resultChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },
  resultChipTextActive: {
    color: "#111827",
  },

  // Save Button
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  modalInputContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  modalInput: {
    backgroundColor: "transparent",
    fontSize: 15,
    fontWeight: "500",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#F3F6FB",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
  },
  modalSearchButton: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSearchButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.6,
  },
  modalSearchText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },

  // Suggestions Styles
  suggestionsContainer: {
    maxHeight: 250,
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  suggestionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  suggestionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(17, 24, 39, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionPlate: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  suggestionDriver: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
});
