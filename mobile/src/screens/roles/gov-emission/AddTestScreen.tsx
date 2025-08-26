import React, { useMemo, useState } from "react";
import { View, StyleSheet, Alert, Modal, KeyboardAvoidingView, Platform } from "react-native";
import { Title, Paragraph, Button, TextInput, useTheme, HelperText, Card, Chip, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../components/icons/Icon";
import StandardHeader from "../../../components/layout/StandardHeader";
import { useNavigation, useRoute } from "@react-navigation/native";
import { database, LocalEmissionTest } from "../../../core/database/database";
import { useAuthStore } from "../../../core/stores/authStore";
import PlateCaptureCameraComponent from "../../../components/camera/PlateCaptureCameraComponent";
import { PlateRecognitionService, VehicleSearchResponse, PlateRecognitionResponse } from "../../../core/api/plate-recognition-service";

function randomId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function AddTestScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { user } = useAuthStore();
  const vehicleId: string | undefined = route?.params?.vehicleId;

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [quarter, setQuarter] = useState("" + (Math.floor((new Date().getMonth()) / 3) + 1));
  const [year, setYear] = useState("" + new Date().getFullYear());
  const [result, setResult] = useState<"pass" | "fail" | "unknown">("pass");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  // Plate recognition states
  const [showCamera, setShowCamera] = useState(false);
  const [recognizedVehicle, setRecognizedVehicle] = useState<VehicleSearchResponse | null>(null);
  const [plateNumber, setPlateNumber] = useState("");
  const [isProcessingPlate, setIsProcessingPlate] = useState(false);
  const [plateSearchManual, setPlateSearchManual] = useState(false);

  // Determine the effective vehicle ID (from route param or recognized vehicle)
  const effectiveVehicleId = vehicleId || recognizedVehicle?.id;

  const isValid = useMemo(() => {
    return effectiveVehicleId && date && quarter && year;
  }, [effectiveVehicleId, date, quarter, year]);

  const onSave = async () => {
    if (!isValid) return;
    try {
      setSaving(true);
      const now = new Date().toISOString();
      const test: LocalEmissionTest = {
        id: randomId(),
        vehicle_id: effectiveVehicleId!,
        test_date: new Date(date).toISOString(),
        quarter: parseInt(quarter, 10),
        year: parseInt(year, 10),
        result: result === "unknown" ? null : result === "pass",
        remarks: remarks || undefined,
        created_by: user?.id || "local",
        created_at: now,
        updated_at: now,
        sync_status: "pending",
      };
      await database.saveEmissionTest(test);
      (navigation as any).goBack();
    } catch (e: any) {
      Alert.alert("Save failed", e?.message || "Could not save test.");
    } finally {
      setSaving(false);
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

  return (
    <>
      <StandardHeader
        title="Record Test"
        showBack
        chip={{ label: "Gov. Emission", iconName: "assignment" }}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.formWrap}>
          <Card mode="outlined" style={[styles.card, { borderColor: `${colors.primary}26` }]}>
            <Card.Content style={styles.cardContent}>

              {/* Vehicle Selection Section */}
              <Paragraph style={styles.section}>Vehicle Selection</Paragraph>

              {!vehicleId && !recognizedVehicle && (
                <View style={styles.vehicleSelection}>
                  <Button
                    mode="contained"
                    onPress={() => setShowCamera(true)}
                    icon={() => <Icon name="camera" size={20} color="white" />}
                    style={styles.plateButton}
                    disabled={isProcessingPlate}
                  >
                    Scan License Plate
                  </Button>

                  <View style={styles.orDivider}>
                    <Divider style={styles.dividerLine} />
                    <Paragraph style={styles.orText}>OR</Paragraph>
                    <Divider style={styles.dividerLine} />
                  </View>

                  <Button
                    mode="outlined"
                    onPress={() => setPlateSearchManual(true)}
                    icon={() => <Icon name="search" size={20} color={colors.primary} />}
                    style={styles.searchButton}
                    disabled={isProcessingPlate}
                  >
                    Search Manually
                  </Button>

                  {/* Debug/Troubleshooting Section */}
                  <View style={styles.debugSection}>
                    <Button
                      mode="text"
                      onPress={async () => {
                        try {
                          const result = await PlateRecognitionService.testGeminiService();
                          Alert.alert(
                            result.working ? "Service Working" : "Service Issue",
                            result.message,
                            [{ text: "OK" }]
                          );
                        } catch (error: any) {
                          Alert.alert("Test Failed", error?.message || "Could not test service", [{ text: "OK" }]);
                        }
                      }}
                      icon={() => <Icon name="settings" size={16} color={colors.outline} />}
                      textColor={colors.outline}
                      style={styles.debugButton}
                    >
                      Test Recognition Service
                    </Button>
                  </View>
                </View>
              )}

              {recognizedVehicle && (
                <View style={styles.selectedVehicle}>
                  <View style={styles.vehicleInfo}>
                    <Chip
                      icon={() => <Icon name="directions-car" size={16} color={colors.primary} />}
                      style={[styles.plateChip, { backgroundColor: `${colors.primary}15` }]}
                      textStyle={{ color: colors.primary }}
                    >
                      {recognizedVehicle.plate_number}
                    </Chip>
                    <Paragraph style={styles.driverName}>
                      Driver: {recognizedVehicle.driver_name}
                    </Paragraph>
                    <Paragraph style={styles.vehicleDetails}>
                      {recognizedVehicle.vehicle_type} • {recognizedVehicle.engine_type}
                    </Paragraph>
                  </View>
                  <Button
                    mode="text"
                    onPress={clearVehicleSelection}
                    compact
                    textColor={colors.error}
                  >
                    Change
                  </Button>
                </View>
              )}

              {vehicleId && (
                <View style={styles.selectedVehicle}>
                  <Paragraph style={styles.preSelectedVehicle}>
                    Using pre-selected vehicle
                  </Paragraph>
                </View>
              )}

              <Divider style={styles.sectionDivider} />

              {/* Test Details Section */}
              <Paragraph style={styles.section}>Test Details</Paragraph>

              <TextInput
                label="Test Date (YYYY-MM-DD)"
                value={date}
                onChangeText={setDate}
                keyboardType="numbers-and-punctuation"
                mode="flat"
                left={<TextInput.Icon icon={() => <Icon name="event" size={18} color={colors.primary} />} />}
                style={styles.input}
              />

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    label="Quarter (1-4)"
                    value={quarter}
                    onChangeText={setQuarter}
                    keyboardType="number-pad"
                    mode="flat"
                    style={styles.input}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    label="Year"
                    value={year}
                    onChangeText={setYear}
                    keyboardType="number-pad"
                    mode="flat"
                    style={styles.input}
                  />
                </View>
              </View>

              <TextInput
                label="Result (pass/fail/unknown)"
                value={result}
                onChangeText={(v) => setResult((v as any) || "unknown")}
                mode="flat"
                style={styles.input}
              />
              <HelperText type="info" visible>
                Enter "pass", "fail", or "unknown"
              </HelperText>

              <TextInput
                label="Remarks"
                value={remarks}
                onChangeText={setRemarks}
                mode="flat"
                style={styles.input}
                multiline
              />

              <Button
                mode="contained"
                onPress={onSave}
                disabled={!isValid || saving}
                loading={saving}
                style={styles.saveBtn}
              >
                Save Test
              </Button>
            </Card.Content>
          </Card>
        </View>

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
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <Title style={styles.modalTitle}>Search Vehicle by Plate Number</Title>

              <TextInput
                label="Enter Plate Number"
                value={plateNumber}
                onChangeText={setPlateNumber}
                mode="outlined"
                style={styles.modalInput}
                autoCapitalize="characters"
                placeholder="e.g., ABC123, XYZ789"
                maxLength={20}
                autoFocus
                returnKeyType="search"
                onSubmitEditing={handleManualPlateSearch}
              />

              <View style={styles.modalButtons}>
                <Button
                  mode="text"
                  onPress={() => setPlateSearchManual(false)}
                  disabled={isProcessingPlate}
                  style={styles.modalCancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleManualPlateSearch}
                  loading={isProcessingPlate}
                  disabled={!plateNumber.trim() || isProcessingPlate}
                  style={styles.modalSearchButton}
                >
                  Search
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  formWrap: { padding: 16 },
  card: { borderRadius: 10, backgroundColor: "#FFFFFF", borderWidth: 1 },
  cardContent: { padding: 12 },
  section: { fontWeight: "700", marginBottom: 8, color: "#111827" },
  input: { backgroundColor: "transparent" },
  saveBtn: { marginTop: 12, borderRadius: 10 },

  // Vehicle selection styles
  vehicleSelection: {
    marginBottom: 16,
  },
  plateButton: {
    marginBottom: 12,
    borderRadius: 10,
  },
  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
  },
  orText: {
    marginHorizontal: 12,
    fontSize: 12,
    opacity: 0.6,
  },
  searchButton: {
    marginTop: 8,
    borderRadius: 10,
  },
  selectedVehicle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  plateChip: {
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  vehicleDetails: {
    fontSize: 14,
    opacity: 0.7,
  },
  preSelectedVehicle: {
    fontSize: 14,
    fontStyle: "italic",
    opacity: 0.7,
  },
  sectionDivider: {
    marginVertical: 16,
  },

  // Debug styles
  debugSection: {
    marginTop: 12,
    alignItems: "center",
  },
  debugButton: {
    marginVertical: 4,
  },

  // Modal styles
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
    padding: 24,
    borderRadius: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  modalCancelButton: {
    minWidth: 80,
    marginRight: 12,
  },
  modalSearchButton: {
    minWidth: 100,
  },
});
