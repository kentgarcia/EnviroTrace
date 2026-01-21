import React, { useState } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from "react-native";
import { Text, Searchbar, FAB, Card, Badge, IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Icon from "../../../components/icons/Icon";
import StandardHeader from "../../../components/layout/StandardHeader";
import { treeInventoryApi, TreeSpecies } from "../../../core/api/tree-inventory-api";
import { TreeManagementStackParamList } from "../../../navigation/TreeManagementNavigator";

export default function SpeciesManagementScreen() {
    const navigation = useNavigation<NavigationProp<TreeManagementStackParamList>>();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch species
    const { data: speciesData, isLoading, refetch } = useQuery({
        queryKey: ["tree-species", searchQuery],
        queryFn: () => treeInventoryApi.getSpecies(searchQuery),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: treeInventoryApi.deleteSpecies,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["tree-species"] });
            Alert.alert(
                "Success",
                `Species deactivated. ${data.data.trees_using_species} tree(s) are using this species.`
            );
        },
        onError: (error: any) => {
            Alert.alert("Error", error.message || "Failed to delete species");
        },
    });

    const handleDelete = (species: TreeSpecies) => {
        Alert.alert(
            "Deactivate Species",
            `Are you sure you want to deactivate ${species.common_name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Deactivate",
                    style: "destructive",
                    onPress: () => deleteMutation.mutate(species.id),
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: TreeSpecies }) => (
        <Card style={styles.card} mode="outlined">
            <Card.Content>
                <View style={styles.cardHeader}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.commonName} numberOfLines={1}>
                            {item.common_name}
                        </Text>
                        <Text style={styles.scientificName} numberOfLines={1}>
                            {item.scientific_name || "—"}
                        </Text>
                    </View>
                    <View style={styles.actions}>
                        <IconButton
                            icon={() => <Icon name="Edit" size={18} color="#1E40AF" />}
                            size={20}
                            onPress={() => navigation.navigate("SpeciesForm", { speciesId: item.id })}
                        />
                        <IconButton
                            icon={() => <Icon name="Trash2" size={18} color="#EF4444" />}
                            size={20}
                            onPress={() => handleDelete(item)}
                        />
                    </View>
                </View>

                <View style={styles.badges}>
                    {(item as any).is_native && (
                        <Badge style={[styles.badge, styles.nativeBadge]}>Native</Badge>
                    )}
                    {(item as any).is_endangered && (
                        <Badge style={[styles.badge, styles.endangeredBadge]}>Endangered</Badge>
                    )}
                    {(item as any).growth_speed_label && (
                        <Badge style={[styles.badge, styles.growthBadge]}>
                            {`${(item as any).growth_speed_label} Growth`}
                        </Badge>
                    )}
                </View>

                <View style={styles.details}>
                    <View style={styles.detailItem}>
                        <Icon name="Wind" size={14} color="#059669" />
                        <Text style={styles.detailText}>
                            {(item as any).co2_absorbed_kg_per_year
                                ? `${(item as any).co2_absorbed_kg_per_year.toFixed(1)} kg/yr CO₂`
                                : "No CO₂ data"}
                        </Text>
                    </View>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <StandardHeader
                title="Species Management"
                subtitle="Manage tree species database"
                titleSize={20}
                backgroundColor="#FFFFFF"
            />

            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Search species..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={styles.searchInput}
                    icon={() => <Icon name="Search" size={20} color="#64748B" />}
                />
            </View>

            <FlatList
                data={speciesData?.data || []}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} />
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyContainer}>
                            <Icon name="Leaf" size={48} color="#94A3B8" />
                            <Text style={styles.emptyText}>No species found</Text>
                            <Text style={styles.emptySubtext}>
                                Add a new species to get started
                            </Text>
                        </View>
                    ) : null
                }
            />

            <FAB
                icon={() => <Icon name="Plus" size={24} color="#FFFFFF" />}
                style={styles.fab}
                onPress={() => navigation.navigate("SpeciesForm", { speciesId: undefined })}
                label="Add Species"
                color="#FFFFFF"
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    searchContainer: {
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    searchBar: {
        backgroundColor: "#F1F5F9",
        borderRadius: 12,
        elevation: 0,
        height: 48,
    },
    searchInput: {
        fontSize: 14,
        alignSelf: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        marginBottom: 12,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderColor: "#E2E8F0",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    titleContainer: {
        flex: 1,
        marginRight: 12,
    },
    commonName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
    },
    scientificName: {
        fontSize: 14,
        fontStyle: "italic",
        color: "#64748B",
        marginTop: 2,
    },
    actions: {
        flexDirection: "row",
        marginTop: -8,
        marginRight: -8,
    },
    badges: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 12,
    },
    badge: {
        borderRadius: 6,
        paddingHorizontal: 8,
        height: 24,
        fontSize: 11,
        fontWeight: "600",
        textAlignVertical: "center",
    },
    nativeBadge: {
        backgroundColor: "#DCFCE7",
        color: "#166534",
    },
    endangeredBadge: {
        backgroundColor: "#FEE2E2",
        color: "#991B1B",
    },
    growthBadge: {
        backgroundColor: "#FEF3C7",
        color: "#92400E",
    },
    details: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    detailText: {
        fontSize: 13,
        color: "#64748B",
    },
    fab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: "#1E40AF",
        borderRadius: 16,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#0F172A",
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#64748B",
        marginTop: 4,
    },
});
