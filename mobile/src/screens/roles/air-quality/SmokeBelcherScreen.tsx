import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, ScrollView, RefreshControl, TouchableOpacity, TextInput } from "react-native";
import {
    Text,
    FAB,
    Chip,
    ActivityIndicator
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
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
            <TouchableOpacity
                key={record.id}
                style={styles.recordCard}
                onPress={() => handleRecordPress(record)}
                activeOpacity={0.7}
            >
                <View style={styles.recordHeader}>
                    <View style={styles.recordInfo}>
                        <Text style={styles.plateNumber}>{record.plate_number}</Text>
                        <Text style={styles.vehicleType}>{record.vehicle_type}</Text>
                    </View>
                    {hasViolations && (
                        <Chip
                            style={styles.violationChip}
                            textStyle={styles.violationChipText}
                        >
                            {recordViolations.length} Violation{recordViolations.length > 1 ? 's' : ''}
                        </Chip>
                    )}
                </View>

                <View style={styles.divider} />

                <View style={styles.recordDetails}>
                    <View style={styles.detailRow}>
                        <Icon name="Building2" size={14} color="#6B7280" />
                        <Text style={styles.detailText}>{record.operator_company_name}</Text>
                    </View>

                    {record.owner_first_name && (
                        <View style={styles.detailRow}>
                            <Icon name="User" size={14} color="#6B7280" />
                            <Text style={styles.detailText}>
                                {`${record.owner_first_name} ${record.owner_middle_name || ''} ${record.owner_last_name || ''}`.trim()}
                            </Text>
                        </View>
                    )}

                    <View style={styles.detailRow}>
                        <Icon name="Calendar" size={14} color="#6B7280" />
                        <Text style={styles.detailText}>
                            {new Date(record.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.root}>
                <StandardHeader
                    title="Smoke Belcher Records"
                    titleSize={22}
                    showBack={true}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#111827" />
                    <Text style={styles.loadingText}>Loading records...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <StandardHeader
                title="Smoke Belcher Records"
                titleSize={22}
                showBack={true}
            />

            <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                        <Icon name="Search" size={18} color="#6B7280" />
                        <TextInput
                            placeholder="Search by plate number, operator, or vehicle type"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchInput}
                            placeholderTextColor="#9CA3AF"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <Icon name="X" size={18} color="#6B7280" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#111827"]}
                            tintColor="#111827"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.statsContainer}>
                        <View style={styles.statsCard}>
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>{records.length}</Text>
                                    <Text style={styles.statLabel}>Total Records</Text>
                                </View>
                                <View style={styles.verticalDivider} />
                                <View style={styles.statItem}>
                                    <Text style={[styles.statNumber, styles.statNumberDanger]}>
                                        {violations.length}
                                    </Text>
                                    <Text style={styles.statLabel}>Violations</Text>
                                </View>
                                <View style={styles.verticalDivider} />
                                <View style={styles.statItem}>
                                    <Text style={[styles.statNumber, styles.statNumberInfo]}>
                                        {new Set(violations.map(v => v.record_id)).size}
                                    </Text>
                                    <Text style={styles.statLabel}>Vehicles with Violations</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.recordsList}>
                        {filteredRecords.length > 0 ? (
                            filteredRecords.map(renderRecord)
                        ) : (
                            <View style={styles.emptyCard}>
                                <View style={styles.emptyContent}>
                                    <Icon name="SearchX" size={48} color="#9CA3AF" />
                                    <Text style={styles.emptyTitle}>No Records Found</Text>
                                    <Text style={styles.emptyText}>
                                        {searchQuery ? "No records match your search criteria" : "No smoke belcher records available"}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>

                <FAB
                    icon={() => <Icon name="Plus" size={24} color="#FFFFFF" />}
                    style={styles.fab}
                    onPress={handleAddRecord}
                    label="Add Record"
                />
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
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
    },
    searchInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: "#1F2937",
        padding: 0,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },
    statsContainer: {
        marginBottom: 16,
    },
    statsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        padding: 16,
        elevation: 0,
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
        fontWeight: "800",
        color: "#111827",
        letterSpacing: -0.5,
    },
    statNumberDanger: {
        color: "#DC2626",
    },
    statNumberInfo: {
        color: "#60A5FA",
    },
    statLabel: {
        fontSize: 11,
        color: "#6B7280",
        textAlign: "center",
        fontWeight: "600",
        marginTop: 4,
    },
    verticalDivider: {
        width: 1,
        height: 40,
        backgroundColor: "#E5E7EB",
    },
    recordsList: {
        gap: 12,
    },
    recordCard: {
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        padding: 14,
        elevation: 0,
    },
    recordHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    recordInfo: {
        flex: 1,
    },
    plateNumber: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 4,
        letterSpacing: -0.3,
    },
    vehicleType: {
        fontSize: 13,
        color: "#6B7280",
        fontWeight: "500",
    },
    violationChip: {
        marginLeft: 8,
        backgroundColor: "#FEE2E2",
        borderRadius: 8,
    },
    violationChipText: {
        color: "#DC2626",
        fontSize: 11,
        fontWeight: "700",
    },
    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginBottom: 12,
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
        fontSize: 13,
        color: "#374151",
        flex: 1,
        fontWeight: "500",
    },
    emptyCard: {
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        elevation: 0,
    },
    emptyContent: {
        alignItems: "center",
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    emptyTitle: {
        marginTop: 16,
        fontSize: 17,
        color: "#1F2937",
        fontWeight: "700",
        letterSpacing: -0.3,
    },
    emptyText: {
        marginTop: 8,
        textAlign: "center",
        color: "#6B7280",
        lineHeight: 20,
        fontSize: 13,
        fontWeight: "500",
    },
    fab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: "#111827",
        borderRadius: 16,
    },
});
