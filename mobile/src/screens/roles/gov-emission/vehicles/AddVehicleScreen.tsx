import React, { useMemo, useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, HelperText, useTheme, Text } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import StandardHeader from "../../../../components/layout/StandardHeader";
import Icon from "../../../../components/icons/Icon";
import {
  useOffices,
  useAddVehicle,
  useFilterOptions,
  VehicleInput,
} from "../../../../core/api/emission-service";

export default function AddVehicleScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  // Get parameters from route
  const params = route.params as { plateNumber?: string; fromPlateRecognition?: string } | undefined;

  const [plate, setPlate] = useState("");
  const [driver, setDriver] = useState("");
  const [contact, setContact] = useState("");
  const [officeId, setOfficeId] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [engineType, setEngineType] = useState("");
  const [wheels, setWheels] = useState("4");

  // Fetch data from API
  const { data: officesData, isLoading: loadingOffices } = useOffices();
  const { data: filterOptions } = useFilterOptions();
  const addVehicleMutation = useAddVehicle();

  // Get offices and vehicle types
  const offices = useMemo(() => {
    return officesData?.offices || [];
  }, [officesData]);

  const existingVehicleTypes = useMemo(() => {
    return filterOptions?.vehicle_types || [];
  }, [filterOptions]);

  // Pre-fill plate number if coming from plate recognition
  useEffect(() => {
    if (params?.plateNumber) {
      setPlate(params.plateNumber);
    }
  }, [params?.plateNumber]);

  const isValid = useMemo(() => {
    return plate.trim() && driver.trim() && engineType.trim() && officeId.trim() && vehicleType.trim();
  }, [plate, driver, engineType, officeId, vehicleType]);

  // Format data for Dropdown components
  const officeDropdownData = useMemo(() => {
    return offices.map((office) => ({
      label: office.name,
      value: office.id,
    }));
  }, [offices]);

  const vehicleTypeDropdownData = useMemo(() => {
    return existingVehicleTypes.map((type) => ({
      label: type,
      value: type,
    }));
  }, [existingVehicleTypes]);

  const engineTypeDropdownData = useMemo(() => [
    { label: "Gasoline", value: "Gasoline" },
    { label: "Diesel", value: "Diesel" },
  ], []);

  // Memoized render functions
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

  const onSave = async () => {
    if (!isValid) return;

    try {
      const vehicleData: VehicleInput = {
        driver_name: driver.trim(),
        contact_number: contact.trim() || undefined,
        engine_type: engineType.trim(),
        office_id: officeId.trim(),
        plate_number: plate.trim(),
        vehicle_type: vehicleType.trim(),
        wheels: parseInt(wheels || "4", 10) || 4,
      };

      await addVehicleMutation.mutateAsync(vehicleData);

      Alert.alert("Success", "Vehicle added successfully", [
        {
          text: "OK",
          onPress: () => (navigation as any).goBack(),
        },
      ]);
    } catch (e: any) {
      Alert.alert("Save failed", e?.response?.data?.detail || e?.message || "Could not save vehicle.");
    }
  };

  return (
    <>
      <StandardHeader
        title="Add Vehicle"
        showBack
        backgroundColor="#FFFFFF"
        titleSize={20}
        iconSize={20}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
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
            {/* Basic Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Plate Number *</Text>
                <TextInput
                  value={plate}
                  onChangeText={setPlate}
                  mode="outlined"
                  placeholder="Enter plate number"
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  textColor="#0F172A"
                  placeholderTextColor="#94A3B8"
                  left={<TextInput.Icon icon={() => <Icon name="Car" size={16} color="#64748B" />} />}
                />
                <HelperText type="error" visible={!plate.trim()} style={styles.helperText}>
                  Plate number is required
                </HelperText>
                {params?.fromPlateRecognition && (
                  <HelperText type="info" visible={true} style={styles.helperTextInfo}>
                    📷 Plate number detected from image
                  </HelperText>
                )}
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Driver Name *</Text>
                <TextInput
                  value={driver}
                  onChangeText={setDriver}
                  mode="outlined"
                  placeholder="Enter driver name"
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  textColor="#0F172A"
                  placeholderTextColor="#94A3B8"
                  left={<TextInput.Icon icon={() => <Icon name="User" size={16} color="#64748B" />} />}
                />
                <HelperText type="error" visible={!driver.trim()} style={styles.helperText}>
                  Driver name is required
                </HelperText>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Contact Number</Text>
                <TextInput
                  value={contact}
                  onChangeText={setContact}
                  keyboardType="phone-pad"
                  mode="outlined"
                  placeholder="Enter contact number"
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  textColor="#0F172A"
                  placeholderTextColor="#94A3B8"
                  left={<TextInput.Icon icon={() => <Icon name="Phone" size={16} color="#64748B" />} />}
                />
              </View>
            </View>

            {/* Office Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Office Information</Text>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Office *</Text>
                <Dropdown
                  data={officeDropdownData}
                  labelField="label"
                  valueField="value"
                  placeholder={loadingOffices ? "Loading offices..." : "Select office"}
                  value={officeId}
                  onChange={(item) => {
                    setOfficeId(item.value);
                  }}
                  style={styles.dropdown}
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownSelectedText}
                  containerStyle={styles.dropdownContainer}
                  maxHeight={300}
                  disable={loadingOffices || offices.length === 0}
                  renderRightIcon={renderChevronIcon}
                  renderItem={renderDropdownItem}
                  activeColor="#EFF6FF"
                />
                <HelperText type="error" visible={!officeId.trim()} style={styles.helperText}>
                  Office is required
                </HelperText>
                {offices.length === 0 && !loadingOffices && (
                  <HelperText type="info" visible={true} style={styles.helperTextInfo}>
                    No offices available
                  </HelperText>
                )}
              </View>
            </View>

            {/* Vehicle Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vehicle Details</Text>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Vehicle Type *</Text>
                <View style={styles.vehicleTypeContainer}>
                  <TextInput
                    value={vehicleType}
                    onChangeText={setVehicleType}
                    mode="outlined"
                    placeholder="Enter vehicle type"
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    textColor="#0F172A"
                    placeholderTextColor="#94A3B8"
                    left={<TextInput.Icon icon={() => <Icon name="Car" size={16} color="#64748B" />} />}
                  />
                  {existingVehicleTypes.length > 0 && (
                    <View style={styles.vehicleTypeSuggestions}>
                      <Text style={styles.suggestionsLabel}>Or select existing:</Text>
                      <Dropdown
                        data={vehicleTypeDropdownData}
                        labelField="label"
                        valueField="value"
                        placeholder="Select from existing"
                        value={vehicleType}
                        onChange={(item) => setVehicleType(item.value)}
                        style={styles.dropdown}
                        placeholderStyle={styles.dropdownPlaceholder}
                        selectedTextStyle={styles.dropdownSelectedText}
                        containerStyle={styles.dropdownContainer}
                        maxHeight={300}
                        renderRightIcon={renderChevronIcon}
                        renderItem={renderDropdownItem}
                        activeColor="#EFF6FF"
                      />
                    </View>
                  )}
                </View>
                <HelperText type="error" visible={!vehicleType.trim()} style={styles.helperText}>
                  Vehicle type is required
                </HelperText>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Engine Type *</Text>
                <Dropdown
                  data={engineTypeDropdownData}
                  labelField="label"
                  valueField="value"
                  placeholder="Select engine type"
                  value={engineType}
                  onChange={(item) => setEngineType(item.value)}
                  style={styles.dropdown}
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownSelectedText}
                  containerStyle={styles.dropdownContainer}
                  maxHeight={300}
                  renderRightIcon={renderChevronIcon}
                  renderItem={renderDropdownItem}
                  activeColor="#EFF6FF"
                />
                <HelperText type="error" visible={!engineType.trim()} style={styles.helperText}>
                  Engine type is required
                </HelperText>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Number of Wheels</Text>
                <TextInput
                  value={wheels}
                  onChangeText={setWheels}
                  keyboardType="number-pad"
                  mode="outlined"
                  placeholder="4"
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  textColor="#0F172A"
                  placeholderTextColor="#94A3B8"
                  left={<TextInput.Icon icon={() => <Icon name="CirclePlus" size={16} color="#64748B" />} />}
                />
              </View>
            </View>

            {/* Save Button */}
            <View style={styles.buttonSection}>
              <Button
                mode="contained"
                onPress={onSave}
                disabled={!isValid || addVehicleMutation.isPending}
                loading={addVehicleMutation.isPending}
                style={styles.saveBtn}
                buttonColor="#2563EB"
                labelStyle={styles.saveBtnLabel}
              >
                Save Vehicle
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8FAFC",
  },
  inputOutline: {
    borderColor: "#E2E8F0",
    borderRadius: 12,
    borderWidth: 1,
  },
  helperText: {
    marginTop: 4,
    fontSize: 11,
  },
  helperTextInfo: {
    marginTop: 4,
    fontSize: 11,
    color: "#2563EB",
  },
  vehicleTypeContainer: {
    position: "relative",
  },
  vehicleTypeSuggestions: {
    marginTop: 12,
  },
  suggestionsLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 8,
    fontWeight: "600",
  },
  dropdown: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
  },
  dropdownSelectedText: {
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
  buttonSection: {
    marginTop: 8,
  },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 8,
  },
  saveBtnLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
});
