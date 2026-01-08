import React, { useState } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Modal,
    Linking,
    Alert,
} from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WebView } from "react-native-webview";
import Icon from "../../../components/icons/Icon";
import StandardHeader from "../../../components/layout/StandardHeader";
import { getTreeById, treeInventoryApi, TreeInventory } from "../../../core/api/tree-inventory-api";

// Generate Leaflet HTML for embedded map
const generateMapHTML = (lat: number, lng: number, treeCode: string, species: string) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; }
        #map { width: 100%; height: 100%; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var map = L.map('map', {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            touchZoom: false
        }).setView([${lat}, ${lng}], 16);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(map);
        
        L.circleMarker([${lat}, ${lng}], {
            radius: 12,
            fillColor: '#16A34A',
            color: '#ffffff',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9
        }).addTo(map).bindPopup(\`
            <div style="font-family: system-ui, -apple-system, sans-serif;">
                <div style="font-family: monospace; color: #3b82f6; font-weight: 700;">${treeCode}</div>
                <div style="font-weight: 600; color: #111827; margin-top: 4px;">${species}</div>
            </div>
        \`).openPopup();
    </script>
</body>
</html>
    `;
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
};

const getHealthColor = (health: string) => {
    switch (health) {
        case "healthy":
            return { bg: "#DCFCE7", text: "#16A34A" };
        case "needs_attention":
            return { bg: "#FEF3C7", text: "#D97706" };
        case "diseased":
            return { bg: "#FFEDD5", text: "#EA580C" };
        case "dead":
            return { bg: "#FEE2E2", text: "#DC2626" };
        default:
            return { bg: "#F3F4F6", text: "#6B7280" };
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "alive":
            return { bg: "#DCFCE7", text: "#16A34A" };
        case "cut":
            return { bg: "#FEE2E2", text: "#DC2626" };
        case "dead":
            return { bg: "#F3F4F6", text: "#6B7280" };
        case "replaced":
            return { bg: "#DBEAFE", text: "#2563EB" };
        default:
            return { bg: "#F3F4F6", text: "#6B7280" };
    }
};

export default function TreeDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const treeId: string | undefined = route?.params?.treeId;
    const queryClient = useQueryClient();
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Fetch tree details
    const {
        data: treeData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["tree", treeId],
        queryFn: () => getTreeById(treeId || ""),
        enabled: !!treeId,
        staleTime: 60000,
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: () => treeInventoryApi.deleteTree(treeId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["trees"] });
            Alert.alert("Success", "Tree deleted successfully");
            navigation.goBack();
        },
        onError: (error: any) => {
            Alert.alert("Error", error.message || "Failed to delete tree");
        },
    });

    const tree = treeData?.data;
    const photos = tree?.photos || [];

    const openInMaps = () => {
        if (tree?.latitude && tree?.longitude) {
            const url = `https://www.google.com/maps/search/?api=1&query=${tree.latitude},${tree.longitude}`;
            Linking.openURL(url);
        }
    };

    const handleEdit = () => {
        (navigation as any).navigate("TreeForm", { treeId });
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        setShowDeleteConfirm(false);
        deleteMutation.mutate();
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <StandardHeader
                title="Tree Details"
                showBack
                backgroundColor="#FFFFFF"
                statusBarStyle="dark"
                titleSize={20}
                iconSize={20}
            />
            <View style={styles.safeArea}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#16A34A" />
                    </View>
                ) : !tree ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="AlertCircle" size={48} color="#64748B" />
                        <Text style={styles.emptyText}>Tree not found</Text>
                    </View>
                ) : (
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Header Card */}
                        <View style={styles.headerCard}>
                            <Text style={styles.treeCode}>{tree.tree_code}</Text>
                            <View style={styles.badgeRow}>
                                <View style={[styles.badge, { backgroundColor: getStatusColor(tree.status).bg }]}>
                                    <Text style={[styles.badgeText, { color: getStatusColor(tree.status).text }]}>
                                        {tree.status.toUpperCase()}
                                    </Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: getHealthColor(tree.health).bg }]}>
                                    <Text style={[styles.badgeText, { color: getHealthColor(tree.health).text }]}>
                                        {tree.health.replace("_", " ").toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Species Info */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Species Information</Text>
                            <View style={styles.infoCard}>
                                <Text style={styles.speciesName}>{tree.species}</Text>
                                {tree.common_name && (
                                    <Text style={styles.commonName}>Common: {tree.common_name}</Text>
                                )}
                            </View>
                        </View>

                        {/* Location */}
                        {(tree.latitude && tree.longitude) && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Location</Text>
                                <View style={styles.infoCard}>
                                    {tree.address && <Text style={styles.infoText}>{tree.address}</Text>}
                                    {tree.barangay && (
                                        <Text style={styles.infoText}>Barangay: {tree.barangay}</Text>
                                    )}
                                    <Text style={styles.coordinates}>
                                        {tree.latitude.toFixed(6)}, {tree.longitude.toFixed(6)}
                                    </Text>

                                    <View style={styles.mapContainer}>
                                        <WebView
                                            source={{
                                                html: generateMapHTML(
                                                    tree.latitude,
                                                    tree.longitude,
                                                    tree.tree_code,
                                                    tree.species
                                                ),
                                            }}
                                            style={styles.map}
                                            scrollEnabled={false}
                                            javaScriptEnabled
                                        />
                                    </View>

                                    <TouchableOpacity style={styles.mapButton} onPress={openInMaps}>
                                        <Icon name="ExternalLink" size={16} color="#3B82F6" />
                                        <Text style={styles.mapButtonText}>Open in Google Maps</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Measurements */}
                        {(tree.height_meters || tree.diameter_cm) && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Measurements</Text>
                                <View style={styles.measurementsGrid}>
                                    {tree.height_meters && (
                                        <View style={styles.measurementCard}>
                                            <Text style={styles.measurementValue}>{tree.height_meters}m</Text>
                                            <Text style={styles.measurementLabel}>Height</Text>
                                        </View>
                                    )}
                                    {tree.diameter_cm && (
                                        <View style={styles.measurementCard}>
                                            <Text style={styles.measurementValue}>{tree.diameter_cm}cm</Text>
                                            <Text style={styles.measurementLabel}>Diameter</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Timeline */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Timeline</Text>
                            <View style={styles.infoCard}>
                                {tree.planted_date && (
                                    <View style={styles.timelineItem}>
                                        <Icon name="Sprout" size={16} color="#16A34A" />
                                        <View style={styles.timelineContent}>
                                            <Text style={styles.timelineLabel}>Planted</Text>
                                            <Text style={styles.timelineValue}>
                                                {formatDate(tree.planted_date)}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                                {tree.cutting_date && (
                                    <View style={styles.timelineItem}>
                                        <Icon name="Scissors" size={16} color="#EF4444" />
                                        <View style={styles.timelineContent}>
                                            <Text style={styles.timelineLabel}>Cut</Text>
                                            <Text style={styles.timelineValue}>
                                                {formatDate(tree.cutting_date)}
                                            </Text>
                                            {tree.cutting_reason && (
                                                <Text style={styles.timelineReason}>{tree.cutting_reason}</Text>
                                            )}
                                        </View>
                                    </View>
                                )}
                                {tree.death_date && (
                                    <View style={styles.timelineItem}>
                                        <Icon name="Skull" size={16} color="#6B7280" />
                                        <View style={styles.timelineContent}>
                                            <Text style={styles.timelineLabel}>Death Date</Text>
                                            <Text style={styles.timelineValue}>
                                                {formatDate(tree.death_date)}
                                            </Text>
                                            {tree.death_cause && (
                                                <Text style={styles.timelineReason}>{tree.death_cause}</Text>
                                            )}
                                        </View>
                                    </View>
                                )}
                                {tree.last_inspection_date && (
                                    <View style={styles.timelineItem}>
                                        <Icon name="ClipboardCheck" size={16} color="#3B82F6" />
                                        <View style={styles.timelineContent}>
                                            <Text style={styles.timelineLabel}>Last Inspection</Text>
                                            <Text style={styles.timelineValue}>
                                                {formatDate(tree.last_inspection_date)}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Photos */}
                        {photos.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Photos ({photos.length})</Text>
                                <View style={styles.photosGrid}>
                                    {photos.map((photo, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.photoItem}
                                            onPress={() => setSelectedPhoto(photo)}
                                        >
                                            <Image source={{ uri: photo }} style={styles.photoImage} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Notes */}
                        {tree.notes && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Notes</Text>
                                <View style={styles.infoCard}>
                                    <Text style={styles.notesText}>{tree.notes}</Text>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                )}

                {/* Floating Action Buttons */}
                {!isLoading && tree && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleEdit}>
                            <Icon name="Edit" size={20} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Icon name="Trash2" size={20} color="#FFFFFF" />
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={showDeleteConfirm}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteConfirm(false)}
            >
                <View style={styles.deleteModalOverlay}>
                    <View style={styles.deleteModalContent}>
                        <Icon name="AlertTriangle" size={48} color="#EF4444" />
                        <Text style={styles.deleteModalTitle}>Delete Tree?</Text>
                        <Text style={styles.deleteModalText}>
                            Are you sure you want to delete this tree? This action cannot be undone.
                        </Text>
                        <View style={styles.deleteModalButtons}>
                            <TouchableOpacity
                                style={[styles.deleteModalButton, styles.deleteModalButtonCancel]}
                                onPress={() => setShowDeleteConfirm(false)}
                            >
                                <Text style={styles.deleteModalButtonTextCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.deleteModalButton, styles.deleteModalButtonConfirm]}
                                onPress={confirmDelete}
                            >
                                <Text style={styles.deleteModalButtonTextConfirm}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Photo Viewer Modal */}
            <Modal
                visible={!!selectedPhoto}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedPhoto(null)}
            >
                <View style={styles.photoModalContainer}>
                    <TouchableOpacity
                        style={styles.photoModalBackdrop}
                        activeOpacity={1}
                        onPress={() => setSelectedPhoto(null)}
                    >
                        <View style={styles.photoModalContent}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setSelectedPhoto(null)}
                            >
                                <Icon name="X" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            {selectedPhoto && (
                                <Image
                                    source={{ uri: selectedPhoto }}
                                    style={styles.fullscreenImage}
                                    resizeMode="contain"
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    safeArea: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        color: "#64748B",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    headerCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        alignItems: "center",
    },
    treeCode: {
        fontSize: 24,
        fontWeight: "700",
        color: "#3B82F6",
        fontFamily: "monospace",
        marginBottom: 12,
    },
    badgeRow: {
        flexDirection: "row",
        gap: 8,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "600",
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    infoCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
    },
    speciesName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
        fontStyle: "italic",
        marginBottom: 4,
    },
    commonName: {
        fontSize: 14,
        color: "#6B7280",
    },
    infoText: {
        fontSize: 14,
        color: "#374151",
        marginBottom: 4,
    },
    coordinates: {
        fontSize: 12,
        fontFamily: "monospace",
        color: "#3B82F6",
        marginTop: 8,
        marginBottom: 12,
    },
    mapContainer: {
        height: 200,
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: 12,
    },
    map: {
        flex: 1,
    },
    mapButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#BFDBFE",
        backgroundColor: "#EFF6FF",
    },
    mapButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#3B82F6",
    },
    measurementsGrid: {
        flexDirection: "row",
        gap: 12,
    },
    measurementCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    measurementValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 4,
    },
    measurementLabel: {
        fontSize: 12,
        color: "#6B7280",
    },
    timelineItem: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
    },
    timelineContent: {
        flex: 1,
    },
    timelineLabel: {
        fontSize: 12,
        color: "#6B7280",
        marginBottom: 2,
    },
    timelineValue: {
        fontSize: 14,
        fontWeight: "500",
        color: "#111827",
    },
    timelineReason: {
        fontSize: 13,
        color: "#6B7280",
        fontStyle: "italic",
        marginTop: 4,
    },
    photosGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    photoItem: {
        width: "48%",
        aspectRatio: 1,
        borderRadius: 8,
        overflow: "hidden",
    },
    photoImage: {
        width: "100%",
        height: "100%",
    },
    notesText: {
        fontSize: 14,
        color: "#374151",
        lineHeight: 20,
    },
    actionButtons: {
        position: "absolute",
        bottom: 24,
        right: 24,
        gap: 12,
    },
    actionButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    editButton: {
        backgroundColor: "#3B82F6",
    },
    deleteButton: {
        backgroundColor: "#EF4444",
    },
    deleteModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    deleteModalContent: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        width: "100%",
        maxWidth: 400,
    },
    deleteModalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        marginTop: 16,
    },
    deleteModalText: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        marginTop: 8,
        marginBottom: 24,
    },
    deleteModalButtons: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },
    deleteModalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    deleteModalButtonCancel: {
        backgroundColor: "#F3F4F6",
    },
    deleteModalButtonConfirm: {
        backgroundColor: "#EF4444",
    },
    deleteModalButtonTextCancel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
    },
    deleteModalButtonTextConfirm: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    photoModalContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.95)",
    },
    photoModalBackdrop: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    photoModalContent: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    closeButton: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    fullscreenImage: {
        width: "100%",
        height: "80%",
    },
});
