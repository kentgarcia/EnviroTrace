import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Title, Paragraph, Button, Card, Chip, ActivityIndicator, Divider, useTheme } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "../../../components/icons/Icon";
import StandardHeader from "../../../components/layout/StandardHeader";
import { database, LocalVehicle, LocalEmissionTest } from "../../../core/database/database";

export default function VehicleDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const vehicleId: string | undefined = route?.params?.vehicleId;

  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<LocalVehicle | null>(null);
  const [tests, setTests] = useState<LocalEmissionTest[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const v = vehicleId ? await database.getVehicleById(vehicleId) : null;
        const t = vehicleId
          ? await database.getEmissionTests({ vehicle_id: vehicleId, limit: 10 })
          : [];
        if (!mounted) return;
        setVehicle(v);
        setTests(t);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [vehicleId]);

  const lastTest = tests[0];

  const onRecordTest = () => {
    (navigation as any).navigate("AddTest", { vehicleId });
  };

  return (
    <>
      <StandardHeader
        title={vehicle?.plate_number || "Vehicle Details"}
        subtitle={vehicle ? vehicle.driver_name : undefined}
        showBack
        chip={{ label: "Gov. Emission", iconName: "directions-car" }}
      />
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : !vehicle ? (
        <View style={styles.loadingWrap}>
          <Icon name="alert-circle" size={28} color="#D32F2F" />
          <Paragraph style={styles.emptyMsg}>Vehicle not found.</Paragraph>
        </View>
      ) : (
        <View style={styles.content}>
          <Card mode="outlined" style={[styles.card, { borderColor: `${colors.primary}26` }]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Title style={[styles.plate, { color: colors.primary }]}>
                    {vehicle.plate_number}
                  </Title>
                  <Paragraph style={styles.driver}>{vehicle.driver_name}</Paragraph>
                </View>
                <Icon name="directions-car" size={28} color={colors.primary} />
              </View>
              <View style={styles.metaRow}>
                {!!vehicle.office_name && (
                  <Chip compact icon="business" style={styles.metaChip} textStyle={styles.metaChipText}>
                    {vehicle.office_name}
                  </Chip>
                )}
                <Chip compact icon="car" style={styles.metaChip} textStyle={styles.metaChipText}>
                  {vehicle.vehicle_type}
                </Chip>
                <Chip compact icon="info" style={styles.metaChip} textStyle={styles.metaChipText}>
                  {vehicle.engine_type} • {vehicle.wheels} wheels
                </Chip>
              </View>
            </Card.Content>
          </Card>

          <Card mode="outlined" style={[styles.card, { borderColor: `${colors.primary}26` }]}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.sectionTitle}>Latest Test</Title>
              <View style={styles.latestRow}>
                {lastTest ? (
                  <>
                    <Chip
                      compact
                      icon={lastTest.result ? "check-circle" : "alert-circle"}
                      style={[
                        styles.resultChip,
                        { backgroundColor: lastTest.result ? "#E8F5E8" : "#FFEBEE" },
                      ]}
                      textStyle={{ color: lastTest.result ? "#2E7D32" : "#D32F2F", fontSize: 12, fontWeight: "600" }}
                    >
                      {lastTest.result ? "Passed" : "Failed"}
                    </Chip>
                    <Paragraph style={styles.latestText}>
                      {new Date(lastTest.test_date).toLocaleDateString()} (Q{lastTest.quarter} {lastTest.year})
                    </Paragraph>
                  </>
                ) : (
                  <Paragraph style={styles.latestText}>No tests recorded yet.</Paragraph>
                )}
              </View>
              <Button mode="outlined" onPress={onRecordTest} style={styles.actionBtn}>
                Record Test
              </Button>
            </Card.Content>
          </Card>

          {tests.length > 0 && (
            <Card mode="outlined" style={[styles.card, { borderColor: `${colors.primary}26` }]}>
              <Card.Content style={styles.cardContent}>
                <Title style={styles.sectionTitle}>Recent Tests</Title>
                <Divider style={styles.divider} />
                <FlatList
                  data={tests}
                  keyExtractor={(t) => t.id}
                  renderItem={({ item }) => (
                    <View style={styles.testRow}>
                      <Icon
                        name={item.result ? "check-circle" : "alert-circle"}
                        size={16}
                        color={item.result ? "#2E7D32" : "#D32F2F"}
                      />
                      <Paragraph style={styles.testText}>
                        {new Date(item.test_date).toLocaleDateString()} • Q{item.quarter} {item.year}
                      </Paragraph>
                    </View>
                  )}
                  ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
                />
              </Card.Content>
            </Card>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyMsg: { marginTop: 8, fontSize: 13, color: "#6B7280" },
  content: { padding: 16, gap: 12 },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  cardContent: { padding: 12 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  plate: { fontSize: 20, fontWeight: "700" },
  driver: { fontSize: 13, color: "#424242" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  metaChip: { backgroundColor: "#F3F4F6" },
  metaChipText: { fontSize: 11, fontWeight: "600", color: "#374151" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 8 },
  latestRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  latestText: { fontSize: 12, color: "#374151" },
  resultChip: { alignSelf: "flex-start" },
  actionBtn: { alignSelf: "flex-start", marginTop: 8 },
  divider: { marginVertical: 8 },
  testRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  testText: { fontSize: 12, color: "#374151" },
});
