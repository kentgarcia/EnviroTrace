import React, { useMemo, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Title, Paragraph, Button, TextInput, useTheme, HelperText, Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../components/icons/Icon";
import StandardHeader from "../../../components/layout/StandardHeader";
import { useNavigation, useRoute } from "@react-navigation/native";
import { database, LocalEmissionTest } from "../../../core/database/database";
import { useAuthStore } from "../../../core/stores/authStore";

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

  const isValid = useMemo(() => {
    return vehicleId && date && quarter && year;
  }, [vehicleId, date, quarter, year]);

  const onSave = async () => {
    if (!isValid) return;
    try {
      setSaving(true);
      const now = new Date().toISOString();
      const test: LocalEmissionTest = {
        id: randomId(),
        vehicle_id: vehicleId!,
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
