import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
} from "react-native";
import { WebView } from "react-native-webview";
import { Chip } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Icon from "../../../components/icons/Icon";
import ScreenLayout from "../../../components/layout/ScreenLayout";
import { treeInventoryApi, TreeMapItem, TreeInventory } from "../../../core/api/tree-inventory-api";

// Default center - San Fernando, Pampanga (Philippines)
const DEFAULT_CENTER = { lat: 15.0287, lng: 120.6880 };
const DEFAULT_ZOOM = 14;

const STATUS_COLORS: Record<string, string> = {
    alive: "#22c55e",
    cut: "#ef4444",
    dead: "#6b7280",
    replaced: "#3b82f6",
};

const HEALTH_COLORS: Record<string, string> = {
    healthy: "#22c55e",
    needs_attention: "#eab308",
    diseased: "#f97316",
    dead: "#6b7280",
};

const getMarkerColor = (status: string, health: string): string => {
    if (status === "alive") {
        return HEALTH_COLORS[health] || "#22c55e";
    }
    return STATUS_COLORS[status] || "#6b7280";
};

// Generate Leaflet HTML for WebView - Uses FREE OpenStreetMap tiles
const generateMapHTML = (trees: TreeMapItem[], center: { lat: number; lng: number }, zoom: number) => {
    const markersJS = trees.map(tree => {
        const color = getMarkerColor(tree.status, tree.health);
        return `
            L.circleMarker([${tree.latitude}, ${tree.longitude}], {
                radius: 10,
                fillColor: '${color}',
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.9
            }).addTo(map).bindPopup(\`
                <div style="min-width: 180px; font-family: system-ui, -apple-system, sans-serif;">
                    <div style="font-family: monospace; color: #3b82f6; font-weight: 700; font-size: 14px;">${tree.tree_code}</div>
                    <div style="font-weight: 600; color: #111827; margin-top: 4px;">${tree.species || tree.common_name}</div>
                    ${tree.address ? `<div style="font-size: 11px; color: #6b7280; margin-top: 4px;">${tree.address}</div>` : ''}
                    <div style="display: flex; gap: 6px; margin-top: 8px;">
                        <span style="background: ${STATUS_COLORS[tree.status] || '#9ca3af'}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">
                            ${tree.status.toUpperCase()}
                        </span>
                        <span style="background: ${HEALTH_COLORS[tree.health] || '#9ca3af'}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">
                            ${tree.health.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                    <div style="font-size: 11px; color: #3b82f6; margin-top: 8px; text-align: center;">
                        Tap marker for quick info
                    </div>
                </div>
            \`).on('click', function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerClick', treeId: '${tree.id}' }));
            });
        `;
    }).join('\n');

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
        .leaflet-popup-content-wrapper {
            border-radius: 8px;
            padding: 0;
        }
        .leaflet-popup-content {
            margin: 12px;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var map = L.map('map', {
            zoomControl: true,
            attributionControl: true
        }).setView([${center.lat}, ${center.lng}], ${zoom});
        
        // FREE OpenStreetMap tiles - No API key required!
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);
        
        ${markersJS}
        
        // Send bounds when map moves
        map.on('moveend', function() {
            var bounds = map.getBounds();
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'boundsChange',
                bounds: {
                    min_lat: bounds.getSouth(),
                    max_lat: bounds.getNorth(),
                    min_lng: bounds.getWest(),
                    max_lng: bounds.getEast()
                },
                zoom: map.getZoom()
            }));
        });
        
        // Initial bounds message
        setTimeout(function() {
            var bounds = map.getBounds();
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'boundsChange',
                bounds: {
                    min_lat: bounds.getSouth(),
                    max_lat: bounds.getNorth(),
                    min_lng: bounds.getWest(),
                    max_lng: bounds.getEast()
                },
                zoom: map.getZoom()
            }));
        }, 500);
    </script>
</body>
</html>
    `;
};

export default function MapViewScreen() {
    const navigation = useNavigation();
    const webViewRef = useRef<WebView>(null);
    const [trees, setTrees] = useState<TreeMapItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTree, setSelectedTree] = useState<TreeInventory | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string | undefined>();
    const [filterHealth, setFilterHealth] = useState<string | undefined>();
    const [showFilters, setShowFilters] = useState(false);
    const [showLegend, setShowLegend] = useState(false);
    const [currentBounds, setCurrentBounds] = useState({
        min_lat: DEFAULT_CENTER.lat - 0.05,
        max_lat: DEFAULT_CENTER.lat + 0.05,
        min_lng: DEFAULT_CENTER.lng - 0.05,
        max_lng: DEFAULT_CENTER.lng + 0.05,
    });

    // Fetch trees based on current bounds and filters
    const fetchTrees = async (bounds = currentBounds) => {
        try {
            setLoading(true);
            const { data } = await treeInventoryApi.getTreesInBounds({
                ...bounds,
                status: filterStatus,
                health: filterHealth,
            });
            setTrees(data);
        } catch (error) {
            console.error("Error fetching trees:", error);
            // Use empty array on error
            setTrees([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch tree detail when marker is clicked
    const handleMarkerClick = async (treeId: string) => {
        try {
            setLoadingDetail(true);
            const { data } = await treeInventoryApi.getTreeById(treeId);
            setSelectedTree(data);
        } catch (error) {
            console.error("Error fetching tree details:", error);
        } finally {
            setLoadingDetail(false);
        }
    };

    // Handle messages from WebView
    const handleWebViewMessage = (event: any) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'boundsChange') {
                setCurrentBounds(message.bounds);
            } else if (message.type === 'markerClick') {
                handleMarkerClick(message.treeId);
            }
        } catch (error) {
            console.error("Error parsing WebView message:", error);
        }
    };

    // Fetch trees when bounds or filters change
    useEffect(() => {
        fetchTrees();
    }, [currentBounds, filterStatus, filterHealth]);

    const mapHTML = generateMapHTML(trees, DEFAULT_CENTER, DEFAULT_ZOOM);

    const statusBadgeStyle = (status: string) => {
        switch (status) {
            case "alive": return styles.statusBadgeAlive;
            case "cut": return styles.statusBadgeCut;
            case "dead": return styles.statusBadgeDead;
            case "replaced": return styles.statusBadgeReplaced;
            default: return styles.statusBadgeDefault;
        }
    };

    const healthBadgeStyle = (health: string) => {
        switch (health) {
            case "healthy": return styles.healthBadgeHealthy;
            case "needs_attention": return styles.healthBadgeAttention;
            case "diseased": return styles.healthBadgeDiseased;
            case "dead": return styles.healthBadgeDead;
            default: return styles.healthBadgeDefault;
        }
    };

    return (
        <ScreenLayout
            header={{
                title: "Map View",
                subtitle: "Tree Locations • OpenStreetMap",
                statusBarStyle: "dark",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderColor: "#E5E7EB",
                showBack: true,
                onBack: () => navigation.goBack(),
                rightActionIcon: "SlidersHorizontal",
                onRightActionPress: () => setShowFilters(true),
                titleSize: 22,
                subtitleSize: 12,
                iconSize: 20,
            }}
        >
            <View style={styles.mapContainer}>
                    {/* WebView Map */}
                    <WebView
                        ref={webViewRef}
                        source={{ html: mapHTML }}
                        style={styles.map}
                        onMessage={handleWebViewMessage}
                        javaScriptEnabled
                        domStorageEnabled
                        startInLoadingState
                        renderLoading={() => (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color="#3B82F6" />
                                <Text style={styles.loadingText}>Loading map...</Text>
                            </View>
                        )}
                    />

                    {/* Loading Overlay for data */}
                    {loading && (
                        <View style={styles.dataLoadingBadge}>
                            <ActivityIndicator size="small" color="#3B82F6" />
                            <Text style={styles.dataLoadingText}>Loading trees...</Text>
                        </View>
                    )}

                    {/* Tree Count Badge */}
                    <View style={styles.countBadge}>
                        <Icon name="TreePine" size={16} color="#16A34A" />
                        <Text style={styles.countText}>
                            {trees.length} {trees.length === 1 ? "tree" : "trees"}
                        </Text>
                    </View>

                    {/* Legend Toggle Button */}
                    <TouchableOpacity
                        style={styles.legendToggle}
                        onPress={() => setShowLegend(!showLegend)}
                    >
                        <Icon name="Info" size={20} color="#3B82F6" />
                    </TouchableOpacity>

                    {/* Legend Panel */}
                    {showLegend && (
                        <View style={styles.legend}>
                            <Text style={styles.legendTitle}>Legend</Text>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: "#22c55e" }]} />
                                <Text style={styles.legendText}>Healthy</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: "#eab308" }]} />
                                <Text style={styles.legendText}>Needs Attention</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: "#f97316" }]} />
                                <Text style={styles.legendText}>Diseased</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} />
                                <Text style={styles.legendText}>Cut</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: "#6b7280" }]} />
                                <Text style={styles.legendText}>Dead</Text>
                            </View>
                        </View>
                    )}

                    {/* Active Filters Indicator */}
                    {(filterStatus || filterHealth) && (
                        <View style={styles.activeFilters}>
                            <Icon name="Filter" size={14} color="#3B82F6" />
                            <Text style={styles.activeFiltersText}>Filters Active</Text>
                        </View>
                    )}
                </View>

            {/* Filter Modal */}
            <Modal
                visible={showFilters}
                transparent
                animationType="slide"
                onRequestClose={() => setShowFilters(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowFilters(false)}>
                    <Pressable style={styles.filterModal} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.filterHeader}>
                            <Text style={styles.filterTitle}>Filter Trees</Text>
                            <TouchableOpacity onPress={() => setShowFilters(false)}>
                                <Icon name="X" size={24} color="#111827" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.filterContent}>
                            {/* Status Filter */}
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Status</Text>
                                <View style={styles.filterChips}>
                                    <Chip
                                        selected={!filterStatus}
                                        onPress={() => setFilterStatus(undefined)}
                                        style={styles.filterChip}
                                        textStyle={styles.filterChipText}
                                    >
                                        All
                                    </Chip>
                                    <Chip
                                        selected={filterStatus === "alive"}
                                        onPress={() => setFilterStatus("alive")}
                                        style={styles.filterChip}
                                        textStyle={styles.filterChipText}
                                    >
                                        🟢 Alive
                                    </Chip>
                                    <Chip
                                        selected={filterStatus === "cut"}
                                        onPress={() => setFilterStatus("cut")}
                                        style={styles.filterChip}
                                        textStyle={styles.filterChipText}
                                    >
                                        🔴 Cut
                                    </Chip>
                                    <Chip
                                        selected={filterStatus === "dead"}
                                        onPress={() => setFilterStatus("dead")}
                                        style={styles.filterChip}
                                        textStyle={styles.filterChipText}
                                    >
                                        ⚫ Dead
                                    </Chip>
                                    <Chip
                                        selected={filterStatus === "replaced"}
                                        onPress={() => setFilterStatus("replaced")}
                                        style={styles.filterChip}
                                        textStyle={styles.filterChipText}
                                    >
                                        🔵 Replaced
                                    </Chip>
                                </View>
                            </View>

                            {/* Health Filter */}
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Health</Text>
                                <View style={styles.filterChips}>
                                    <Chip
                                        selected={!filterHealth}
                                        onPress={() => setFilterHealth(undefined)}
                                        style={styles.filterChip}
                                        textStyle={styles.filterChipText}
                                    >
                                        All
                                    </Chip>
                                    <Chip
                                        selected={filterHealth === "healthy"}
                                        onPress={() => setFilterHealth("healthy")}
                                        style={styles.filterChip}
                                        textStyle={styles.filterChipText}
                                    >
                                        💚 Healthy
                                    </Chip>
                                    <Chip
                                        selected={filterHealth === "needs_attention"}
                                        onPress={() => setFilterHealth("needs_attention")}
                                        style={styles.filterChip}
                                        textStyle={styles.filterChipText}
                                    >
                                        💛 Needs Attention
                                    </Chip>
                                    <Chip
                                        selected={filterHealth === "diseased"}
                                        onPress={() => setFilterHealth("diseased")}
                                        style={styles.filterChip}
                                        textStyle={styles.filterChipText}
                                    >
                                        🧡 Diseased
                                    </Chip>
                                </View>
                            </View>

                            {/* Reset Button */}
                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={() => {
                                    setFilterStatus(undefined);
                                    setFilterHealth(undefined);
                                }}
                            >
                                <Icon name="RotateCcw" size={16} color="#6B7280" />
                                <Text style={styles.resetButtonText}>Reset Filters</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        <View style={styles.filterFooter}>
                            <TouchableOpacity
                                style={styles.applyButton}
                                onPress={() => setShowFilters(false)}
                            >
                                <Text style={styles.applyButtonText}>Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Tree Detail Modal */}
            <Modal
                visible={!!selectedTree || loadingDetail}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedTree(null)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setSelectedTree(null)}>
                    <Pressable style={styles.detailModal} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.detailHeader}>
                            <View style={styles.detailHeaderTitle}>
                                <Icon name="TreePine" size={20} color="#16A34A" />
                                <Text style={styles.detailTitle}>Tree Details</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedTree(null)}>
                                <Icon name="X" size={24} color="#111827" />
                            </TouchableOpacity>
                        </View>

                        {loadingDetail ? (
                            <View style={styles.detailLoading}>
                                <ActivityIndicator size="large" color="#3B82F6" />
                                <Text style={styles.loadingText}>Loading tree details...</Text>
                            </View>
                        ) : selectedTree ? (
                            <ScrollView style={styles.detailContent}>
                                {/* Tree Code */}
                                <View style={styles.detailCodeBadge}>
                                    <Text style={styles.detailCode}>{selectedTree.tree_code}</Text>
                                </View>

                                {/* Basic Info */}
                                <View style={styles.detailGrid}>
                                    <View style={styles.detailGridItem}>
                                        <Text style={styles.detailLabel}>Species</Text>
                                        <Text style={styles.detailValue}>
                                            {selectedTree.species || selectedTree.common_name}
                                        </Text>
                                    </View>
                                    <View style={styles.detailGridItem}>
                                        <Text style={styles.detailLabel}>Common Name</Text>
                                        <Text style={styles.detailValue}>
                                            {selectedTree.common_name || "—"}
                                        </Text>
                                    </View>
                                    <View style={styles.detailGridItem}>
                                        <Text style={styles.detailLabel}>Status</Text>
                                        <View style={statusBadgeStyle(selectedTree.status)}>
                                            <Text style={styles.badgeText}>
                                                {selectedTree.status.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.detailGridItem}>
                                        <Text style={styles.detailLabel}>Health</Text>
                                        <View style={healthBadgeStyle(selectedTree.health)}>
                                            <Text style={styles.badgeText}>
                                                {selectedTree.health.replace("_", " ").toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Address */}
                                {selectedTree.address && (
                                    <View style={styles.detailSection}>
                                        <Text style={styles.detailLabel}>Address</Text>
                                        <Text style={styles.detailValue}>{selectedTree.address}</Text>
                                    </View>
                                )}

                                {/* Barangay */}
                                {selectedTree.barangay && (
                                    <View style={styles.detailSection}>
                                        <Text style={styles.detailLabel}>Barangay</Text>
                                        <Text style={styles.detailValue}>{selectedTree.barangay}</Text>
                                    </View>
                                )}

                                {/* Measurements */}
                                {(selectedTree.height_meters || selectedTree.diameter_cm || selectedTree.planted_date) && (
                                    <View style={styles.measurementsGrid}>
                                        {selectedTree.height_meters && (
                                            <View style={styles.measurementItem}>
                                                <Text style={styles.measurementValue}>
                                                    {selectedTree.height_meters}m
                                                </Text>
                                                <Text style={styles.measurementLabel}>Height</Text>
                                            </View>
                                        )}
                                        {selectedTree.diameter_cm && (
                                            <View style={styles.measurementItem}>
                                                <Text style={styles.measurementValue}>
                                                    {selectedTree.diameter_cm}cm
                                                </Text>
                                                <Text style={styles.measurementLabel}>Diameter</Text>
                                            </View>
                                        )}
                                        {selectedTree.planted_date && (
                                            <View style={styles.measurementItem}>
                                                <Text style={styles.measurementValue}>
                                                    {new Date(selectedTree.planted_date).getFullYear()}
                                                </Text>
                                                <Text style={styles.measurementLabel}>Planted</Text>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {/* Notes */}
                                {selectedTree.notes && (
                                    <View style={styles.detailNotesSection}>
                                        <Text style={styles.detailLabel}>Notes</Text>
                                        <Text style={styles.detailNotesText}>{selectedTree.notes}</Text>
                                    </View>
                                )}
                            </ScrollView>
                        ) : null}
                    </Pressable>
                </Pressable>
            </Modal>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    mapContainer: {
        flex: 1,
        position: "relative",
    },
    map: {
        flex: 1,
    },
    loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 8,
        fontSize: 14,
        color: "#6B7280",
    },
    dataLoadingBadge: {
        position: "absolute",
        top: 16,
        left: "50%",
        transform: [{ translateX: -60 }],
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    dataLoadingText: {
        fontSize: 12,
        color: "#3B82F6",
        fontWeight: "500",
    },
    countBadge: {
        position: "absolute",
        bottom: 16,
        left: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    countText: {
        fontSize: 12,
        color: "#111827",
        fontWeight: "500",
    },
    legendToggle: {
        position: "absolute",
        top: 16,
        left: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    legend: {
        position: "absolute",
        top: 64,
        left: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    legendTitle: {
        fontSize: 12,
        fontWeight: "600",
        color: "#6B7280",
        marginBottom: 8,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: 11,
        color: "#111827",
    },
    activeFilters: {
        position: "absolute",
        top: 16,
        right: 16,
        backgroundColor: "#EFF6FF",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },
    activeFiltersText: {
        fontSize: 11,
        color: "#3B82F6",
        fontWeight: "500",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    filterModal: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: "70%",
    },
    filterHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    filterTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    filterContent: {
        padding: 16,
    },
    filterSection: {
        marginBottom: 24,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 8,
    },
    filterChips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    filterChip: {
        marginRight: 0,
    },
    filterChipText: {
        fontSize: 12,
    },
    resetButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#F9FAFB",
    },
    resetButtonText: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },
    filterFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    applyButton: {
        backgroundColor: "#3B82F6",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    detailModal: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: "80%",
    },
    detailHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    detailHeaderTitle: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    detailTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    detailLoading: {
        padding: 48,
        alignItems: "center",
        justifyContent: "center",
    },
    detailContent: {
        padding: 16,
    },
    detailCodeBadge: {
        backgroundColor: "#EFF6FF",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    detailCode: {
        fontFamily: "monospace",
        fontSize: 18,
        fontWeight: "700",
        color: "#3B82F6",
        textAlign: "center",
    },
    detailGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 16,
    },
    detailGridItem: {
        width: "48%",
    },
    detailSection: {
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 11,
        color: "#6B7280",
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: "500",
        color: "#111827",
    },
    badgeText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    statusBadgeAlive: {
        backgroundColor: "#22c55e",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: "flex-start",
    },
    statusBadgeCut: {
        backgroundColor: "#ef4444",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: "flex-start",
    },
    statusBadgeDead: {
        backgroundColor: "#6b7280",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: "flex-start",
    },
    statusBadgeReplaced: {
        backgroundColor: "#3b82f6",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: "flex-start",
    },
    statusBadgeDefault: {
        backgroundColor: "#9ca3af",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: "flex-start",
    },
    healthBadgeHealthy: {
        backgroundColor: "#22c55e",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: "flex-start",
    },
    healthBadgeAttention: {
        backgroundColor: "#eab308",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: "flex-start",
    },
    healthBadgeDiseased: {
        backgroundColor: "#f97316",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: "flex-start",
    },
    healthBadgeDead: {
        backgroundColor: "#6b7280",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: "flex-start",
    },
    healthBadgeDefault: {
        backgroundColor: "#9ca3af",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: "flex-start",
    },
    measurementsGrid: {
        flexDirection: "row",
        gap: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        marginBottom: 12,
    },
    measurementItem: {
        flex: 1,
        alignItems: "center",
    },
    measurementValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    measurementLabel: {
        fontSize: 11,
        color: "#6B7280",
        marginTop: 4,
    },
    detailNotesSection: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    detailNotesText: {
        fontSize: 13,
        color: "#374151",
        lineHeight: 20,
    },
});
