import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import {
    Text,
    Button,
    Chip,
    ActivityIndicator
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import StandardHeader from "../../../components/layout/StandardHeader";
import Icon from "../../../components/icons/Icon";
import { useNavigation, useRoute } from "@react-navigation/native";
import { airQualityService, AirQualityRecord, AirQualityViolation, AirQualityDriver } from "../../../core/api/air-quality-service";

type RouteParams = {
    recordId: number;
};

export default function SmokeBelcherDetailsScreen() {
    const [record, setRecord] = useState<AirQualityRecord | null>(null);
    const [violations, setViolations] = useState<AirQualityViolation[]>([]);
    const [driver, setDriver] = useState<AirQualityDriver | null>(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const route = useRoute();
    const { recordId } = route.params as RouteParams;

    const loadRecordDetails = async () => {
        try {
            setLoading(true);
            // Load record details
            const records = await airQualityService.fetchRecentRecords({ limit: 100 });
            const foundRecord = records.find(r => r.id === recordId);

            if (foundRecord) {
                setRecord(foundRecord);

                // Load violations for this record
                const allViolations = await airQualityService.fetchRecentViolations({ limit: 100 });
                const recordViolations = allViolations.filter(v => v.record_id === recordId);
                setViolations(recordViolations);

                // Load driver details if there's a driver_id in violations
                const violationWithDriver = recordViolations.find(v => v.driver_id);
                if (violationWithDriver?.driver_id) {
                    try {
                        const driver = await airQualityService.getDriver(violationWithDriver.driver_id);
                        setDriver(driver);
                    } catch (error) {
                        console.log("Could not load driver details:", error);
                    }
                }
            } else {
                Alert.alert("Error", "Record not found");
                navigation.goBack();
            }
        } catch (error) {
            console.error("Error loading record details:", error);
            Alert.alert("Error", "Failed to load record details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecordDetails();
    }, [recordId]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <View style={styles.root}>
                <StandardHeader
                    title="Record Details"
                    titleSize={22}
                    showBack={true}
                />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#111827" />
                    <Text style={styles.loadingText}>Loading record details...</Text>
                </View>
            </View>
        );
    }

    if (!record) {
        return (
            <View style={styles.root}>
                <StandardHeader
                    title="Record Details"
                    titleSize={22}
                    showBack={true}
                />
                <View style={styles.centered}>
                    <Icon name="AlertCircle" size={48} color="#DC2626" />
                    <Text style={styles.errorTitle}>Record Not Found</Text>
                    <Button
                        mode="contained"
                        onPress={() => navigation.goBack()}
                        buttonColor="#111827"
                    >
                        Go Back
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <StandardHeader
                title="Record Details"
                titleSize={22}
                showBack={true}
            />

            <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Vehicle Information */}
                    <View style={styles.section}>
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Vehicle Information</Text>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Plate Number</Text>
                                <Text style={styles.infoValue}>{record.plate_number}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Vehicle Type</Text>
                                <Text style={styles.infoValue}>{record.vehicle_type}</Text>
                            </View>

                            {record.transport_group && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Transport Group</Text>
                                    <Text style={styles.infoValue}>{record.transport_group}</Text>
                                </View>
                            )}

                            {record.motor_no && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Motor Number</Text>
                                    <Text style={styles.infoValue}>{record.motor_no}</Text>
                                </View>
                            )}

                            {record.motor_vehicle_name && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Vehicle Name</Text>
                                    <Text style={styles.infoValue}>{record.motor_vehicle_name}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Operator Information */}
                    <View style={styles.section}>
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Operator Information</Text>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Company Name</Text>
                                <Text style={styles.infoValue}>{record.operator_company_name}</Text>
                            </View>

                            {record.operator_address && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Address</Text>
                                    <Text style={styles.infoValue}>{record.operator_address}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Owner Information */}
                    {(record.owner_first_name || record.owner_last_name) && (
                        <View style={styles.section}>
                            <View style={styles.card}>
                                <Text style={styles.sectionTitle}>Owner Information</Text>

                                {record.owner_first_name && (
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>First Name</Text>
                                        <Text style={styles.infoValue}>{record.owner_first_name}</Text>
                                    </View>
                                )}

                                {record.owner_middle_name && (
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Middle Name</Text>
                                        <Text style={styles.infoValue}>{record.owner_middle_name}</Text>
                                    </View>
                                )}

                                {record.owner_last_name && (
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Last Name</Text>
                                        <Text style={styles.infoValue}>{record.owner_last_name}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Driver Information */}
                    {driver && (
                        <View style={styles.section}>
                            <View style={styles.card}>
                                <Text style={styles.sectionTitle}>Driver Information</Text>

                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Name</Text>
                                    <Text style={styles.infoValue}>
                                        {`${driver.first_name} ${driver.middle_name ? driver.middle_name + ' ' : ''}${driver.last_name}`}
                                    </Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>License Number</Text>
                                    <Text style={styles.infoValue}>{driver.license_number}</Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Address</Text>
                                    <Text style={styles.infoValue}>{driver.address}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Violations */}
                    {violations.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.card}>
                                <Text style={styles.sectionTitle}>Violations ({violations.length})</Text>

                                {violations.map((violation, index) => (
                                    <View key={violation.id} style={styles.violationItem}>
                                        <View style={styles.violationHeader}>
                                            <Chip
                                                icon={() => <Icon name="AlertTriangle" size={12} color="#DC2626" />}
                                                style={styles.violationChip}
                                                textStyle={styles.violationChipText}
                                            >
                                                Violation #{index + 1}
                                            </Chip>
                                            <View style={styles.paymentStatus}>
                                                {violation.paid_driver && (
                                                    <Chip
                                                        icon={() => <Icon name="CheckCircle2" size={12} color="#22C55E" />}
                                                        style={styles.statusChip}
                                                        textStyle={styles.statusChipText}
                                                    >
                                                        Driver Paid
                                                    </Chip>
                                                )}
                                                {violation.paid_operator && (
                                                    <Chip
                                                        icon={() => <Icon name="CheckCircle2" size={12} color="#22C55E" />}
                                                        style={styles.statusChip}
                                                        textStyle={styles.statusChipText}
                                                    >
                                                        Operator Paid
                                                    </Chip>
                                                )}
                                            </View>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Date of Apprehension</Text>
                                            <Text style={styles.infoValue}>{formatDate(violation.date_of_apprehension)}</Text>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Place of Apprehension</Text>
                                            <Text style={styles.infoValue}>{violation.place_of_apprehension}</Text>
                                        </View>

                                        {violation.ordinance_infraction_report_no && (
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoLabel}>Report Number</Text>
                                                <Text style={styles.infoValue}>{violation.ordinance_infraction_report_no}</Text>
                                            </View>
                                        )}

                                        {violation.smoke_density_test_result_no && (
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoLabel}>Test Result Number</Text>
                                                <Text style={styles.infoValue}>{violation.smoke_density_test_result_no}</Text>
                                            </View>
                                        )}

                                        {index < violations.length - 1 && <View style={styles.violationDivider} />}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Record Metadata */}
                    <View style={styles.section}>
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Record Information</Text>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Record ID</Text>
                                <Text style={styles.infoValue}>{record.id}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Created</Text>
                                <Text style={styles.infoValue}>{formatDate(record.created_at)}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Last Updated</Text>
                                <Text style={styles.infoValue}>{formatDate(record.updated_at)}</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    loadingText: {
        marginTop: 16,
        textAlign: "center",
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },
    errorTitle: {
        marginTop: 16,
        marginBottom: 16,
        textAlign: "center",
        fontSize: 17,
        fontWeight: "700",
        color: "#1F2937",
        letterSpacing: -0.3,
    },
    section: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        padding: 16,
        elevation: 0,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    infoLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6B7280",
        flex: 1,
        letterSpacing: -0.2,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: "500",
        color: "#1F2937",
        flex: 1.5,
        textAlign: "right",
    },
    violationItem: {
        marginBottom: 16,
    },
    violationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        flexWrap: "wrap",
        gap: 8,
    },
    violationChip: {
        alignSelf: "flex-start",
        backgroundColor: "#FEE2E2",
        borderRadius: 8,
    },
    violationChipText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#DC2626",
    },
    paymentStatus: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    statusChip: {
        alignSelf: "flex-start",
        backgroundColor: "#DCFCE7",
        borderRadius: 8,
    },
    statusChipText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#22C55E",
    },
    violationDivider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginTop: 16,
    },
});
