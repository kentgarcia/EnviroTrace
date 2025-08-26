import React, { useMemo, useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button, HelperText, useTheme, Card, Paragraph } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import StandardHeader from "../../../components/layout/StandardHeader";
import Icon from "../../../components/icons/Icon";
import { database, LocalVehicle } from "../../../core/database/database";

function randomId() {
  // RFC4122-ish simple UUID v4 generator (sufficient for local IDs)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function AddVehicleScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  // Get parameters from route
  const params = route.params as { plateNumber?: string; fromPlateRecognition?: string } | undefined;

  const [plate, setPlate] = useState("");
  const [driver, setDriver] = useState("");
  const [contact, setContact] = useState("");
  const [officeName, setOfficeName] = useState("");
  const [officeId, setOfficeId] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [engineType, setEngineType] = useState("");
  const [wheels, setWheels] = useState("4");
  const [saving, setSaving] = useState(false);

  // Pre-fill plate number if coming from plate recognition
  useEffect(() => {
    if (params?.plateNumber) {
      setPlate(params.plateNumber);
    }
  }, [params?.plateNumber]);

  const isValid = useMemo(() => {
    return plate.trim() && driver.trim() && engineType.trim() && vehicleType.trim() && officeId.trim();
  }, [plate, driver, engineType, vehicleType, officeId]);

  const onSave = async () => {
    if (!isValid) return;
    try {
      setSaving(true);
      const now = new Date().toISOString();
      const v: LocalVehicle = {
        id: randomId(),
        driver_name: driver.trim(),
        contact_number: contact.trim() || undefined,
        engine_type: engineType.trim(),
        office_id: officeId.trim(),
        office_name: officeName.trim() || undefined,
        plate_number: plate.trim(),
        vehicle_type: vehicleType.trim(),
        wheels: parseInt(wheels || "4", 10) || 4,
        created_at: now,
        updated_at: now,
        latest_test_result: null,
        latest_test_date: undefined,
        sync_status: "pending",
      };
      await database.saveVehicle(v);
      // Go back to list; VehiclesScreen will reload on pull-to-refresh, but we can also alert
      (navigation as any).goBack();
    } catch (e: any) {
      Alert.alert("Save failed", e?.message || "Could not save vehicle.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <StandardHeader
        title="Add Vehicle"
        showBack
        chip={{ label: "Gov. Emission", iconName: "directions-car" }}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.formWrap}>
          <Card mode="outlined" style={[styles.card, { borderColor: `${colors.primary}26` }]}>
            <Card.Content style={styles.cardContent}>
              <Paragraph style={styles.section}>Vehicle Information</Paragraph>
              <TextInput
                label="Plate Number"
                value={plate}
                onChangeText={setPlate}
                mode="flat"
                left={<TextInput.Icon icon={() => <Icon name="directions-car" size={18} color={colors.primary} />} />}
                style={styles.input}
              />
              <HelperText type="error" visible={!plate.trim() && !params?.fromPlateRecognition}>
                Plate number is required
              </HelperText>
              {params?.fromPlateRecognition && (
                <HelperText type="info" visible={true}>
                  📷 Plate number detected from image
                </HelperText>
              )}

              <TextInput
                label="Driver Name"
                value={driver}
                onChangeText={setDriver}
                mode="flat"
                left={<TextInput.Icon icon={() => <Icon name="person" size={18} color={colors.primary} />} />}
                style={styles.input}
              />
              <HelperText type="error" visible={!driver.trim()}>
                Driver name is required
              </HelperText>

              <TextInput
                label="Contact Number"
                value={contact}
                onChangeText={setContact}
                keyboardType="phone-pad"
                mode="flat"
                left={<TextInput.Icon icon={() => <Icon name="phone" size={18} color={colors.primary} />} />}
                style={styles.input}
              />

              <TextInput
                label="Office ID"
                value={officeId}
                onChangeText={setOfficeId}
                mode="flat"
                left={<TextInput.Icon icon={() => <Icon name="business" size={18} color={colors.primary} />} />}
                style={styles.input}
              />
              <HelperText type="error" visible={!officeId.trim()}>
                Office is required
              </HelperText>

              <TextInput
                label="Office Name (optional)"
                value={officeName}
                onChangeText={setOfficeName}
                mode="flat"
                style={styles.input}
              />

              <TextInput
                label="Vehicle Type"
                value={vehicleType}
                onChangeText={setVehicleType}
                mode="flat"
                left={<TextInput.Icon icon={() => <Icon name="car" size={18} color={colors.primary} />} />}
                style={styles.input}
              />
              <HelperText type="error" visible={!vehicleType.trim()}>
                Vehicle type is required
              </HelperText>

              <TextInput
                label="Engine Type"
                value={engineType}
                onChangeText={setEngineType}
                mode="flat"
                left={<TextInput.Icon icon={() => <Icon name="info" size={18} color={colors.primary} />} />}
                style={styles.input}
              />
              <HelperText type="error" visible={!engineType.trim()}>
                Engine type is required
              </HelperText>

              <TextInput
                label="Wheels"
                value={wheels}
                onChangeText={setWheels}
                keyboardType="number-pad"
                mode="flat"
                left={<TextInput.Icon icon={() => <Icon name="plus" size={18} color={colors.primary} />} />}
                style={styles.input}
              />

              <Button
                mode="contained"
                onPress={onSave}
                disabled={!isValid || saving}
                loading={saving}
                style={styles.saveBtn}
              >
                Save Vehicle
              </Button>
            </Card.Content>
          </Card>
        </View>
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
});
