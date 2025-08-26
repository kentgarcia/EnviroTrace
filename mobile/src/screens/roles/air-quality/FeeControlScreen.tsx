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
    ActivityIndicator,
    IconButton,
    Portal,
    Modal,
    TextInput
} from "react-native-paper";
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
    const { colors } = useTheme();
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
                <Title style={styles.modalTitle}>
                    {editingFee ? "Edit Fee" : "Add New Fee"}
                </Title>

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
                        style={[styles.modalButton, { backgroundColor: colors.primary }]}
                    >
                        {editingFee ? "Update" : "Create"}
                    </Button>
                </View>
            </Modal>
        </Portal>
    );

    const renderFeeCard = (fee: AirQualityFee) => (
        <Card key={fee.id} style={styles.feeCard}>
            <Card.Content>
                <View style={styles.feeHeader}>
                    <View style={styles.feeInfo}>
                        <Title style={styles.feeCategory}>{fee.category}</Title>
                        <View style={styles.feeMetaRow}>
                            <Chip
                                style={[styles.levelChip, { backgroundColor: `${getLevelColor(fee.level)}15` }]}
                                textStyle={{ color: getLevelColor(fee.level), fontSize: 12 }}
                            >
                                {getLevelLabel(fee.level)}
                            </Chip>
                            <Paragraph style={styles.effectiveDate}>
                                Effective: {new Date(fee.effective_date).toLocaleDateString()}
                            </Paragraph>
                        </View>
                    </View>
                    <View style={styles.feeActions}>
                        <IconButton
                            icon="pencil"
                            size={20}
                            iconColor={colors.primary}
                            onPress={() => handleEditFee(fee)}
                        />
                        <IconButton
                            icon="delete"
                            size={20}
                            iconColor="#F44336"
                            onPress={() => handleDeleteFee(fee)}
                        />
                    </View>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.amountSection}>
                    <View style={styles.amountRow}>
                        <Icon name="currency-php" size={20} color={colors.primary} />
                        <Title style={[styles.amountValue, { color: colors.primary }]}>
                            {formatCurrency(fee.amount)}
                        </Title>
                    </View>
                </View>

                <View style={styles.feeFooter}>
                    <Paragraph style={styles.feeFooterText}>
                        Created: {new Date(fee.created_at).toLocaleDateString()}
                    </Paragraph>
                    {fee.updated_at !== fee.created_at && (
                        <Paragraph style={styles.feeFooterText}>
                            Updated: {new Date(fee.updated_at).toLocaleDateString()}
                        </Paragraph>
                    )}
                </View>
            </Card.Content>
        </Card>
    );

    if (loading) {
        return (
            <>
                <StandardHeader
                    title="Fee Control"
                    showBack={true}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Paragraph style={styles.loadingText}>Loading fees...</Paragraph>
                </View>
            </>
        );
    }

    const totalFees = fees.reduce((sum, fee) => sum + Number(fee.amount), 0);
    const categoryCounts = fees.reduce((acc, fee) => {
        acc[fee.category] = (acc[fee.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <>
            <StandardHeader
                title="Fee Control"
                showBack={true}
                chip={{ label: "Air Quality", iconName: "air" }}
            />

            <View style={styles.container}>
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
                    {/* Summary Stats */}
                    <Card style={styles.statsCard}>
                        <Card.Content>
                            <Title style={styles.statsTitle}>Fee Overview</Title>
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Title style={[styles.statNumber, { color: colors.primary }]}>
                                        {fees.length}
                                    </Title>
                                    <Paragraph style={styles.statLabel}>Total Fees</Paragraph>
                                </View>
                                <Divider style={styles.verticalDivider} />
                                <View style={styles.statItem}>
                                    <Title style={[styles.statNumber, { color: "#388E3C" }]}>
                                        {formatCurrency(totalFees)}
                                    </Title>
                                    <Paragraph style={styles.statLabel}>Total Amount</Paragraph>
                                </View>
                                <Divider style={styles.verticalDivider} />
                                <View style={styles.statItem}>
                                    <Title style={[styles.statNumber, { color: "#1976D2" }]}>
                                        {Object.keys(categoryCounts).length}
                                    </Title>
                                    <Paragraph style={styles.statLabel}>Categories</Paragraph>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Fee Categories Summary */}
                    {Object.keys(categoryCounts).length > 0 && (
                        <Card style={styles.categoriesCard}>
                            <Card.Content>
                                <Title style={styles.categoriesTitle}>Categories</Title>
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
                            </Card.Content>
                        </Card>
                    )}

                    {/* Fees List */}
                    <View style={styles.feesList}>
                        {fees.length > 0 ? (
                            fees
                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                .map(renderFeeCard)
                        ) : (
                            <Card style={styles.emptyCard}>
                                <Card.Content style={styles.emptyContent}>
                                    <Icon name="currency-usd-off" size={48} color="#666" />
                                    <Title style={styles.emptyTitle}>No Fees Configured</Title>
                                    <Paragraph style={styles.emptyText}>
                                        Add fee categories to start managing air quality violation fees
                                    </Paragraph>
                                    <Button
                                        mode="contained"
                                        onPress={handleAddFee}
                                        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                                        icon="plus"
                                    >
                                        Add First Fee
                                    </Button>
                                </Card.Content>
                            </Card>
                        )}
                    </View>
                </ScrollView>

                {fees.length > 0 && (
                    <FAB
                        icon="plus"
                        style={[styles.fab, { backgroundColor: colors.primary }]}
                        onPress={handleAddFee}
                        label="Add Fee"
                    />
                )}

                {renderFeeModal()}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAFAFA",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
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
    statsCard: {
        borderRadius: 12,
        elevation: 2,
        marginBottom: 16,
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 16,
        color: "#333",
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
        fontSize: 18,
        fontWeight: "bold",
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
        marginTop: 4,
    },
    verticalDivider: {
        width: 1,
        height: 40,
        backgroundColor: "#E0E0E0",
    },
    categoriesCard: {
        borderRadius: 12,
        elevation: 2,
        marginBottom: 16,
    },
    categoriesTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
        color: "#333",
    },
    categoriesList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    categoryChip: {
        backgroundColor: "#E3F2FD",
    },
    categoryChipText: {
        fontSize: 12,
        color: "#1976D2",
    },
    feesList: {
        gap: 12,
    },
    feeCard: {
        borderRadius: 12,
        elevation: 2,
        backgroundColor: "#FFFFFF",
    },
    feeHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    feeInfo: {
        flex: 1,
    },
    feeCategory: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    feeMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    levelChip: {
        height: 24,
    },
    effectiveDate: {
        fontSize: 12,
        color: "#666",
    },
    feeActions: {
        flexDirection: "row",
    },
    divider: {
        marginVertical: 12,
    },
    amountSection: {
        backgroundColor: "#F8F9FA",
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    amountRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        justifyContent: "center",
    },
    amountValue: {
        fontSize: 20,
        fontWeight: "bold",
    },
    feeFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    feeFooterText: {
        fontSize: 11,
        color: "#999",
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
        marginBottom: 20,
    },
    emptyButton: {
        paddingHorizontal: 20,
    },
    fab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
        elevation: 8,
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        margin: 20,
        borderRadius: 12,
        maxHeight: "80%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 20,
        textAlign: "center",
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
    },
});
