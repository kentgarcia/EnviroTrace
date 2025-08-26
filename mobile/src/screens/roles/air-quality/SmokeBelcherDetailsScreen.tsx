import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import {
    Title,
    Paragraph,
    Button,
    Divider,
    useTheme,
    Card,
    Chip,
    ActivityIndicator,
    DataTable
} from "react-native-paper";
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
    const { colors } = useTheme();
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
            <View style={styles.loadingContainer}>
                <StandardHeader
                    title="Record Details"
                    showBack={true}
                    chip={{ label: "Air Quality", iconName: "air" }}
                />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" />
                    <Paragraph style={styles.loadingText}>Loading record details...</Paragraph>
                </View>
            </View>
        );
    }

    if (!record) {
        return (
            <View style={styles.container}>
                <StandardHeader
                    title="Record Details"
                    showBack={true}
                    chip={{ label: "Air Quality", iconName: "air" }}
                />
                <View style={styles.centered}>
                    <Icon name="alert-circle" size={48} color={colors.error} />
                    <Title style={styles.errorTitle}>Record Not Found</Title>
                    <Button mode="contained" onPress={() => navigation.goBack()}>
                        Go Back
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StandardHeader
                title="Record Details"
                showBack={true}
                chip={{ label: "Air Quality", iconName: "air" }}
            />

            <ScrollView style={styles.scrollView}>
                {/* Vehicle Information */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Title style={styles.sectionTitle}>Vehicle Information</Title>
                        <DataTable>
                            <DataTable.Row>
                                <DataTable.Cell>Plate Number</DataTable.Cell>
                                <DataTable.Cell>{record.plate_number}</DataTable.Cell>
                            </DataTable.Row>
                            <DataTable.Row>
                                <DataTable.Cell>Vehicle Type</DataTable.Cell>
                                <DataTable.Cell>{record.vehicle_type}</DataTable.Cell>
                            </DataTable.Row>
                            {record.transport_group && (
                                <DataTable.Row>
                                    <DataTable.Cell>Transport Group</DataTable.Cell>
                                    <DataTable.Cell>{record.transport_group}</DataTable.Cell>
                                </DataTable.Row>
                            )}
                            {record.motor_no && (
                                <DataTable.Row>
                                    <DataTable.Cell>Motor Number</DataTable.Cell>
                                    <DataTable.Cell>{record.motor_no}</DataTable.Cell>
                                </DataTable.Row>
                            )}
                            {record.motor_vehicle_name && (
                                <DataTable.Row>
                                    <DataTable.Cell>Vehicle Name</DataTable.Cell>
                                    <DataTable.Cell>{record.motor_vehicle_name}</DataTable.Cell>
                                </DataTable.Row>
                            )}
                        </DataTable>
                    </Card.Content>
                </Card>

                {/* Operator Information */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Title style={styles.sectionTitle}>Operator Information</Title>
                        <DataTable>
                            <DataTable.Row>
                                <DataTable.Cell>Company Name</DataTable.Cell>
                                <DataTable.Cell>{record.operator_company_name}</DataTable.Cell>
                            </DataTable.Row>
                            {record.operator_address && (
                                <DataTable.Row>
                                    <DataTable.Cell>Address</DataTable.Cell>
                                    <DataTable.Cell>{record.operator_address}</DataTable.Cell>
                                </DataTable.Row>
                            )}
                        </DataTable>
                    </Card.Content>
                </Card>

                {/* Owner Information */}
                {(record.owner_first_name || record.owner_last_name) && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.sectionTitle}>Owner Information</Title>
                            <DataTable>
                                {record.owner_first_name && (
                                    <DataTable.Row>
                                        <DataTable.Cell>First Name</DataTable.Cell>
                                        <DataTable.Cell>{record.owner_first_name}</DataTable.Cell>
                                    </DataTable.Row>
                                )}
                                {record.owner_middle_name && (
                                    <DataTable.Row>
                                        <DataTable.Cell>Middle Name</DataTable.Cell>
                                        <DataTable.Cell>{record.owner_middle_name}</DataTable.Cell>
                                    </DataTable.Row>
                                )}
                                {record.owner_last_name && (
                                    <DataTable.Row>
                                        <DataTable.Cell>Last Name</DataTable.Cell>
                                        <DataTable.Cell>{record.owner_last_name}</DataTable.Cell>
                                    </DataTable.Row>
                                )}
                            </DataTable>
                        </Card.Content>
                    </Card>
                )}

                {/* Driver Information */}
                {driver && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.sectionTitle}>Driver Information</Title>
                            <DataTable>
                                <DataTable.Row>
                                    <DataTable.Cell>Name</DataTable.Cell>
                                    <DataTable.Cell>
                                        {`${driver.first_name} ${driver.middle_name ? driver.middle_name + ' ' : ''}${driver.last_name}`}
                                    </DataTable.Cell>
                                </DataTable.Row>
                                <DataTable.Row>
                                    <DataTable.Cell>License Number</DataTable.Cell>
                                    <DataTable.Cell>{driver.license_number}</DataTable.Cell>
                                </DataTable.Row>
                                <DataTable.Row>
                                    <DataTable.Cell>Address</DataTable.Cell>
                                    <DataTable.Cell>{driver.address}</DataTable.Cell>
                                </DataTable.Row>
                            </DataTable>
                        </Card.Content>
                    </Card>
                )}

                {/* Violations */}
                {violations.length > 0 && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title style={styles.sectionTitle}>Violations ({violations.length})</Title>
                            {violations.map((violation, index) => (
                                <View key={violation.id} style={styles.violationItem}>
                                    <View style={styles.violationHeader}>
                                        <Chip
                                            mode="outlined"
                                            style={styles.violationChip}
                                            textStyle={styles.violationChipText}
                                        >
                                            Violation #{index + 1}
                                        </Chip>
                                        <View style={styles.paymentStatus}>
                                            {violation.paid_driver && (
                                                <Chip
                                                    mode="flat"
                                                    style={[styles.statusChip, { backgroundColor: colors.primary + '20' }]}
                                                    textStyle={{ color: colors.primary }}
                                                >
                                                    Driver Paid
                                                </Chip>
                                            )}
                                            {violation.paid_operator && (
                                                <Chip
                                                    mode="flat"
                                                    style={[styles.statusChip, { backgroundColor: colors.primary + '20' }]}
                                                    textStyle={{ color: colors.primary }}
                                                >
                                                    Operator Paid
                                                </Chip>
                                            )}
                                        </View>
                                    </View>

                                    <DataTable>
                                        <DataTable.Row>
                                            <DataTable.Cell>Date of Apprehension</DataTable.Cell>
                                            <DataTable.Cell>{formatDate(violation.date_of_apprehension)}</DataTable.Cell>
                                        </DataTable.Row>
                                        <DataTable.Row>
                                            <DataTable.Cell>Place of Apprehension</DataTable.Cell>
                                            <DataTable.Cell>{violation.place_of_apprehension}</DataTable.Cell>
                                        </DataTable.Row>
                                        {violation.ordinance_infraction_report_no && (
                                            <DataTable.Row>
                                                <DataTable.Cell>Report Number</DataTable.Cell>
                                                <DataTable.Cell>{violation.ordinance_infraction_report_no}</DataTable.Cell>
                                            </DataTable.Row>
                                        )}
                                        {violation.smoke_density_test_result_no && (
                                            <DataTable.Row>
                                                <DataTable.Cell>Test Result Number</DataTable.Cell>
                                                <DataTable.Cell>{violation.smoke_density_test_result_no}</DataTable.Cell>
                                            </DataTable.Row>
                                        )}
                                    </DataTable>

                                    {index < violations.length - 1 && <Divider style={styles.violationDivider} />}
                                </View>
                            ))}
                        </Card.Content>
                    </Card>
                )}

                {/* Record Metadata */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Title style={styles.sectionTitle}>Record Information</Title>
                        <DataTable>
                            <DataTable.Row>
                                <DataTable.Cell>Record ID</DataTable.Cell>
                                <DataTable.Cell>{record.id}</DataTable.Cell>
                            </DataTable.Row>
                            <DataTable.Row>
                                <DataTable.Cell>Created</DataTable.Cell>
                                <DataTable.Cell>{formatDate(record.created_at)}</DataTable.Cell>
                            </DataTable.Row>
                            <DataTable.Row>
                                <DataTable.Cell>Last Updated</DataTable.Cell>
                                <DataTable.Cell>{formatDate(record.updated_at)}</DataTable.Cell>
                            </DataTable.Row>
                        </DataTable>
                    </Card.Content>
                </Card>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        textAlign: "center",
    },
    errorTitle: {
        marginTop: 16,
        marginBottom: 16,
        textAlign: "center",
    },
    card: {
        marginBottom: 16,
        elevation: 2,
    },
    sectionTitle: {
        marginBottom: 16,
        fontSize: 18,
        fontWeight: "600",
    },
    violationItem: {
        marginBottom: 16,
    },
    violationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    violationChip: {
        alignSelf: "flex-start",
    },
    violationChipText: {
        fontSize: 12,
    },
    paymentStatus: {
        flexDirection: "row",
        gap: 8,
    },
    statusChip: {
        alignSelf: "flex-start",
    },
    violationDivider: {
        marginTop: 16,
    },
});
