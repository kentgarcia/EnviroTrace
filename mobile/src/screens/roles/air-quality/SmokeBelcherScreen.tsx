import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, ScrollView, RefreshControl } from "react-native";
import {
    Title,
    Paragraph,
    Button,
    Divider,
    useTheme,
    FAB,
    Card,
    Chip,
    Searchbar,
    ActivityIndicator
} from "react-native-paper";
import StandardHeader from "../../../components/layout/StandardHeader";
import Icon from "../../../components/icons/Icon";
import { useNavigation } from "@react-navigation/native";
import { airQualityService, AirQualityRecord, AirQualityViolation } from "../../../core/api/air-quality-service";

export default function SmokeBelcherScreen() {
    const [records, setRecords] = useState<AirQualityRecord[]>([]);
    const [violations, setViolations] = useState<AirQualityViolation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredRecords, setFilteredRecords] = useState<AirQualityRecord[]>([]);
    const { colors } = useTheme();
    const navigation = useNavigation();

    const loadData = async () => {
        try {
            setLoading(true);
            const [recordsData, violationsData] = await Promise.all([
                airQualityService.fetchRecentRecords({ limit: 50 }),
                airQualityService.fetchRecentViolations({ limit: 50 })
            ]);
            setRecords(recordsData);
            setViolations(violationsData);
            setFilteredRecords(recordsData);
        } catch (error) {
            console.error("Error loading data:", error);
            Alert.alert("Error", "Failed to load smoke belcher data");
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await loadData();
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredRecords(records);
        } else {
            const filtered = records.filter(record =>
                record.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.operator_company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                record.vehicle_type.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredRecords(filtered);
        }
    }, [searchQuery, records]);

    const handleAddRecord = () => {
        navigation.navigate("AddSmokeBelcherRecord" as never);
    };

    const handleRecordPress = (record: AirQualityRecord) => {
        (navigation as any).navigate("SmokeBelcherDetails", { recordId: record.id });
    }; const getViolationsForRecord = (recordId: number) => {
        return violations.filter(v => v.record_id === recordId);
    };

    const renderRecord = (record: AirQualityRecord) => {
        const recordViolations = getViolationsForRecord(record.id);
        const hasViolations = recordViolations.length > 0;

        return (
            <Card
                key={record.id}
                style={styles.recordCard}
                onPress={() => handleRecordPress(record)}
            >
                <Card.Content>
                    <View style={styles.recordHeader}>
                        <View style={styles.recordInfo}>
                            <Title style={styles.plateNumber}>{record.plate_number}</Title>
                            <Paragraph style={styles.vehicleType}>{record.vehicle_type}</Paragraph>
                        </View>
                        {hasViolations && (
                            <Chip
                                icon="alert-circle"
                                style={[styles.violationChip, { backgroundColor: "#FFE5E5" }]}
                                textStyle={{ color: "#D32F2F" }}
                            >
                                {recordViolations.length} Violation{recordViolations.length > 1 ? 's' : ''}
                            </Chip>
                        )}
                    </View>

                    <Divider style={styles.divider} />

                    <View style={styles.recordDetails}>
                        <View style={styles.detailRow}>
                            <Icon name="business" size={16} color="#666" />
                            <Paragraph style={styles.detailText}>{record.operator_company_name}</Paragraph>
                        </View>

                        {record.owner_first_name && (
                            <View style={styles.detailRow}>
                                <Icon name="person" size={16} color="#666" />
                                <Paragraph style={styles.detailText}>
                                    {`${record.owner_first_name} ${record.owner_middle_name || ''} ${record.owner_last_name || ''}`.trim()}
                                </Paragraph>
                            </View>
                        )}

                        <View style={styles.detailRow}>
                            <Icon name="calendar" size={16} color="#666" />
                            <Paragraph style={styles.detailText}>
                                {new Date(record.created_at).toLocaleDateString()}
                            </Paragraph>
                        </View>
                    </View>
                </Card.Content>
            </Card>
        );
    };

    if (loading) {
        return (
            <>
                <StandardHeader
                    title="Smoke Belcher Records"
                    showBack={true}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Paragraph style={styles.loadingText}>Loading records...</Paragraph>
                </View>
            </>
        );
    }

    return (
        <>
            <StandardHeader
                title="Smoke Belcher Records"
                showBack={true}
                chip={{ label: "Air Quality", iconName: "air" }}
            />

            <View style={styles.container}>
                <View style={styles.searchContainer}>
                    <Searchbar
                        placeholder="Search by plate number, operator, or vehicle type"
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchbar}
                        iconColor={colors.primary}
                    />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.statsContainer}>
                        <Card style={styles.statsCard}>
                            <Card.Content>
                                <View style={styles.statsRow}>
                                    <View style={styles.statItem}>
                                        <Title style={styles.statNumber}>{records.length}</Title>
                                        <Paragraph style={styles.statLabel}>Total Records</Paragraph>
                                    </View>
                                    <Divider style={styles.verticalDivider} />
                                    <View style={styles.statItem}>
                                        <Title style={[styles.statNumber, { color: "#D32F2F" }]}>
                                            {violations.length}
                                        </Title>
                                        <Paragraph style={styles.statLabel}>Violations</Paragraph>
                                    </View>
                                    <Divider style={styles.verticalDivider} />
                                    <View style={styles.statItem}>
                                        <Title style={[styles.statNumber, { color: "#1976D2" }]}>
                                            {new Set(violations.map(v => v.record_id)).size}
                                        </Title>
                                        <Paragraph style={styles.statLabel}>Vehicles with Violations</Paragraph>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    </View>

                    <View style={styles.recordsList}>
                        {filteredRecords.length > 0 ? (
                            filteredRecords.map(renderRecord)
                        ) : (
                            <Card style={styles.emptyCard}>
                                <Card.Content style={styles.emptyContent}>
                                    <Icon name="search-off" size={48} color="#666" />
                                    <Title style={styles.emptyTitle}>No Records Found</Title>
                                    <Paragraph style={styles.emptyText}>
                                        {searchQuery ? "No records match your search criteria" : "No smoke belcher records available"}
                                    </Paragraph>
                                </Card.Content>
                            </Card>
                        )}
                    </View>
                </ScrollView>

                <FAB
                    icon="plus"
                    style={[styles.fab, { backgroundColor: colors.primary }]}
                    onPress={handleAddRecord}
                    label="Add Record"
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAFAFA",
    },
    searchContainer: {
        padding: 16,
        paddingBottom: 8,
    },
    searchbar: {
        elevation: 2,
        backgroundColor: "#FFFFFF",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 80,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FAFAFA",
    },
    loadingText: {
        marginTop: 16,
        color: "#666",
    },
    statsContainer: {
        marginBottom: 16,
    },
    statsCard: {
        borderRadius: 12,
        elevation: 2,
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statNumber: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1976D2",
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
    },
    verticalDivider: {
        width: 1,
        height: 40,
        backgroundColor: "#E0E0E0",
    },
    recordsList: {
        gap: 12,
    },
    recordCard: {
        borderRadius: 12,
        elevation: 2,
        backgroundColor: "#FFFFFF",
    },
    recordHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    recordInfo: {
        flex: 1,
    },
    plateNumber: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    vehicleType: {
        fontSize: 14,
        color: "#666",
    },
    violationChip: {
        marginLeft: 8,
    },
    divider: {
        marginVertical: 12,
    },
    recordDetails: {
        gap: 8,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: "#333",
        flex: 1,
    },
    emptyCard: {
        borderRadius: 12,
        elevation: 1,
        backgroundColor: "#FFFFFF",
    },
    emptyContent: {
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyTitle: {
        marginTop: 16,
        fontSize: 18,
        color: "#666",
    },
    emptyText: {
        marginTop: 8,
        textAlign: "center",
        color: "#999",
        lineHeight: 20,
    },
    fab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
        elevation: 8,
    },
});
