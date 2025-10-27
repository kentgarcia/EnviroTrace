import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import {
    Text,
    Button,
    FAB,
    Chip,
    ActivityIndicator,
    Portal,
    Modal,
    TextInput
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import StandardHeader from "../../../components/layout/StandardHeader";
import Icon from "../../../components/icons/Icon";
import { useNavigation } from "@react-navigation/native";
import { airQualityService, AirQualityFee } from "../../../core/api/air-quality-service";

export default function FeeControlScreen() {
    const [fees, setFees] = useState<AirQualityFee[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingFee, setEditingFee] = useState<AirQualityFee | null>(null);
    const [formData, setFormData] = useState({
        category: "",
        amount: "",
        level: "",
        effective_date: new Date().toISOString().split('T')[0],
    });
    const navigation = useNavigation();

    const loadFees = async () => {
        try {
            setLoading(true);
            const feesData = await airQualityService.fetchFees();
            setFees(feesData);
        } catch (error) {
            console.error("Error loading fees:", error);
            Alert.alert("Error", "Failed to load fee data");
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await loadFees();
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadFees();
    }, []);

    const handleAddFee = () => {
        setEditingFee(null);
        setFormData({
            category: "",
            amount: "",
            level: "",
            effective_date: new Date().toISOString().split('T')[0],
        });
        setModalVisible(true);
    };

    const handleEditFee = (fee: AirQualityFee) => {
        setEditingFee(fee);
        setFormData({
            category: fee.category,
            amount: fee.amount.toString(),
            level: fee.level.toString(),
            effective_date: fee.effective_date.split('T')[0],
        });
        setModalVisible(true);
    };

    const handleDeleteFee = (fee: AirQualityFee) => {
        Alert.alert(
            "Delete Fee",
            `Are you sure you want to delete the ${fee.category} fee?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await airQualityService.deleteFee(fee.id);
                            await loadFees();
                            Alert.alert("Success", "Fee deleted successfully");
                        } catch (error) {
                            console.error("Error deleting fee:", error);
                            Alert.alert("Error", "Failed to delete fee");
                        }
                    }
                }
            ]
        );
    };

    const handleSaveFee = async () => {
        try {
            const feeData = {
                category: formData.category,
                amount: parseFloat(formData.amount),
                level: parseInt(formData.level),
                effective_date: formData.effective_date,
            };

            if (!feeData.category || !feeData.amount || !feeData.level) {
                Alert.alert("Error", "Please fill in all required fields");
                return;
            }

            if (editingFee) {
                await airQualityService.updateFee(editingFee.id, feeData);
                Alert.alert("Success", "Fee updated successfully");
            } else {
                await airQualityService.createFee(feeData);
                Alert.alert("Success", "Fee created successfully");
            }

            setModalVisible(false);
            await loadFees();
        } catch (error) {
            console.error("Error saving fee:", error);
            Alert.alert("Error", "Failed to save fee");
        }
    };

    const formatCurrency = (amount: number) => {
        return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    };

    const getLevelColor = (level: number) => {
        switch (level) {
            case 1:
                return '#4CAF50';
            case 2:
                return '#FF9800';
            case 3:
                return '#F44336';
            default:
                return '#757575';
        }
    };

    const getLevelLabel = (level: number) => {
        switch (level) {
            case 1:
                return 'Basic';
            case 2:
                return 'Standard';
            case 3:
                return 'Premium';
            default:
                return `Level ${level}`;
        }
    };

    const renderFeeModal = () => (
        <Portal>
            <Modal
                visible={modalVisible}
                onDismiss={() => setModalVisible(false)}
                contentContainerStyle={styles.modalContent}
            >
                <Text style={styles.modalTitle}>
                    {editingFee ? "Edit Fee" : "Add New Fee"}
                </Text>

                <TextInput
                    label="Category *"
                    value={formData.category}
                    onChangeText={(text) => setFormData({ ...formData, category: text })}
                    style={styles.input}
                    mode="outlined"
                    placeholder="e.g., Apprehension Fee"
                />

                <TextInput
                    label="Amount *"
                    value={formData.amount}
                    onChangeText={(text) => setFormData({ ...formData, amount: text })}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="numeric"
                    placeholder="0.00"
                    left={<TextInput.Affix text="₱" />}
                />

                <TextInput
                    label="Level *"
                    value={formData.level}
                    onChangeText={(text) => setFormData({ ...formData, level: text })}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="numeric"
                    placeholder="1, 2, 3..."
                />

                <TextInput
                    label="Effective Date *"
                    value={formData.effective_date}
                    onChangeText={(text) => setFormData({ ...formData, effective_date: text })}
                    style={styles.input}
                    mode="outlined"
                    placeholder="YYYY-MM-DD"
                />

                <View style={styles.modalActions}>
                    <Button
                        mode="outlined"
                        onPress={() => setModalVisible(false)}
                        style={styles.modalButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleSaveFee}
                        style={styles.modalButton}
                        buttonColor="#111827"
                    >
                        {editingFee ? "Update" : "Create"}
                    </Button>
                </View>
            </Modal>
        </Portal>
    );

    const renderFeeCard = (fee: AirQualityFee) => (
        <View key={fee.id} style={styles.feeCard}>
            <View style={styles.feeHeader}>
                <View style={styles.feeInfo}>
                    <Text style={styles.feeCategory}>{fee.category}</Text>
                    <View style={styles.feeMetaRow}>
                        <Chip
                            style={[styles.levelChip, { backgroundColor: `${getLevelColor(fee.level)}15` }]}
                            textStyle={[styles.levelChipText, { color: getLevelColor(fee.level) }]}
                        >
                            {getLevelLabel(fee.level)}
                        </Chip>
                        <Text style={styles.effectiveDate}>
                            Effective: {new Date(fee.effective_date).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.amountSection}>
                <View style={styles.amountRow}>
                    <Text style={styles.amountValue}>
                        {formatCurrency(fee.amount)}
                    </Text>
                </View>
            </View>

            <View style={styles.feeFooter}>
                <Text style={styles.feeFooterText}>
                    Created: {new Date(fee.created_at).toLocaleDateString()}
                </Text>
                {fee.updated_at !== fee.created_at && (
                    <Text style={styles.feeFooterText}>
                        Updated: {new Date(fee.updated_at).toLocaleDateString()}
                    </Text>
                )}
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.root}>
                <StandardHeader
                    title="Fee Control"
                    titleSize={22}
                    showBack={true}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#111827" />
                    <Text style={styles.loadingText}>Loading fees...</Text>
                </View>
            </View>
        );
    }

    const totalFees = fees.reduce((sum, fee) => sum + Number(fee.amount), 0);
    const categoryCounts = fees.reduce((acc, fee) => {
        acc[fee.category] = (acc[fee.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <View style={styles.root}>
            <StandardHeader
                title="Fee Control"
                titleSize={22}
                showBack={true}
            />

            <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
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
                    {/* Summary Stats */}
                    <View style={styles.statsCard}>
                        <Text style={styles.statsTitle}>Fee Overview</Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>
                                    {fees.length}
                                </Text>
                                <Text style={styles.statLabel}>Total Fees</Text>
                            </View>
                            <View style={styles.verticalDivider} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statNumber, styles.statNumberSuccess]}>
                                    {formatCurrency(totalFees)}
                                </Text>
                                <Text style={styles.statLabel}>Total Amount</Text>
                            </View>
                            <View style={styles.verticalDivider} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statNumber, styles.statNumberInfo]}>
                                    {Object.keys(categoryCounts).length}
                                </Text>
                                <Text style={styles.statLabel}>Categories</Text>
                            </View>
                        </View>
                    </View>

                    {/* Fee Categories Summary */}
                    {Object.keys(categoryCounts).length > 0 && (
                        <View style={styles.categoriesCard}>
                            <Text style={styles.categoriesTitle}>Categories</Text>
                            <View style={styles.categoriesList}>
                                {Object.entries(categoryCounts).map(([category, count]) => (
                                    <Chip
                                        key={category}
                                        style={styles.categoryChip}
                                        textStyle={styles.categoryChipText}
                                    >
                                        {category} ({count})
                                    </Chip>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Fees List */}
                    <View style={styles.feesList}>
                        {fees.length > 0 ? (
                            fees
                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                .map(renderFeeCard)
                        ) : (
                            <View style={styles.emptyCard}>
                                <View style={styles.emptyContent}>
                                    <Icon name="DollarSign" size={48} color="#9CA3AF" />
                                    <Text style={styles.emptyTitle}>No Fees Configured</Text>
                                    <Text style={styles.emptyText}>
                                        Add fee categories to start managing air quality violation fees
                                    </Text>
                                    <Button
                                        mode="contained"
                                        onPress={handleAddFee}
                                        style={styles.emptyButton}
                                        buttonColor="#111827"
                                        icon={() => <Icon name="Plus" size={20} color="#FFFFFF" />}
                                    >
                                        Add First Fee
                                    </Button>
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>

                {fees.length > 0 && (
                    <FAB
                        icon={() => <Icon name="Plus" size={24} color="#FFFFFF" />}
                        style={styles.fab}
                        onPress={handleAddFee}
                        label="Add Fee"
                    />
                )}

                {renderFeeModal()}
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
        padding: 16,
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
    statsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        padding: 16,
        marginBottom: 16,
        elevation: 0,
    },
    statsTitle: {
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 16,
        color: "#111827",
        letterSpacing: -0.3,
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
        fontSize: 20,
        fontWeight: "800",
        color: "#111827",
        letterSpacing: -0.5,
    },
    statNumberSuccess: {
        color: "#22C55E",
    },
    statNumberInfo: {
        color: "#60A5FA",
    },
    statLabel: {
        fontSize: 11,
        color: "#6B7280",
        textAlign: "center",
        marginTop: 4,
        fontWeight: "600",
    },
    verticalDivider: {
        width: 1,
        height: 40,
        backgroundColor: "#E5E7EB",
    },
    categoriesCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        padding: 16,
        marginBottom: 16,
        elevation: 0,
    },
    categoriesTitle: {
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 12,
        color: "#111827",
        letterSpacing: -0.3,
    },
    categoriesList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    categoryChip: {
        backgroundColor: "#EEF2FF",
        borderRadius: 8,
    },
    categoryChipText: {
        fontSize: 11,
        color: "#60A5FA",
        fontWeight: "700",
    },
    feesList: {
        gap: 12,
    },
    feeCard: {
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        padding: 14,
        elevation: 0,
    },
    feeHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    feeInfo: {
        flex: 1,
    },
    feeCategory: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    feeMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
    },
    levelChip: {
        height: 22,
        borderRadius: 6,
    },
    levelChipText: {
        fontSize: 10,
        fontWeight: '700',
        marginVertical: 0,
        marginHorizontal: 0,
    },
    effectiveDate: {
        fontSize: 11,
        color: "#6B7280",
        fontWeight: "500",
    },
    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginBottom: 12,
    },
    amountSection: {
        backgroundColor: "#F9FAFB",
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    amountRow: {
        alignItems: "center",
        justifyContent: "center",
    },
    amountValue: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
        letterSpacing: -0.5,
    },
    feeFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 8,
    },
    feeFooterText: {
        fontSize: 10,
        color: "#9CA3AF",
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
        marginBottom: 20,
        fontSize: 13,
        fontWeight: "500",
    },
    emptyButton: {
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    fab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: "#111827",
        borderRadius: 16,
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        padding: 24,
        margin: 20,
        borderRadius: 16,
        maxHeight: "80%",
    },
    modalTitle: {
        fontSize: 19,
        fontWeight: "700",
        marginBottom: 20,
        textAlign: "center",
        color: "#111827",
        letterSpacing: -0.4,
    },
    input: {
        marginBottom: 16,
        backgroundColor: "#FFFFFF",
    },
    modalActions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        borderRadius: 10,
    },
});
