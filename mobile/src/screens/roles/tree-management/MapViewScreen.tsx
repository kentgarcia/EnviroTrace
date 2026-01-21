import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
import * as Location from "expo-location";
import Icon from "../../../components/icons/Icon";
import ScreenLayout from "../../../components/layout/ScreenLayout";
import { treeInventoryApi, TreeMapItem, TreeInventory, BoundsParams } from "../../../core/api/tree-inventory-api";
import { useSmartTreesInBounds } from "../../../hooks/useSmartTreesInBounds";
import { useSmartTreeClusters } from "../../../hooks/useSmartTreeClusters";

// Default center - Muntinlupa, Philippines (Fallback)
const DEFAULT_CENTER = { lat: 14.4081, lng: 121.0415 };
const DEFAULT_ZOOM = 14;
const CLUSTER_ZOOM_THRESHOLD = 16; // Desktop uses 16 as threshold

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

// Generate initial Leaflet HTML with clustering support
const generateMapHTML = (center: { lat: number; lng: number }, zoom: number) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; }
        #map { width: 100%; height: 100%; }
        .leaflet-popup-content-wrapper { border-radius: 8px; padding: 0; }
        .leaflet-popup-content { margin: 12px; }
        
        /* Custom cluster icon */
        .marker-cluster-custom {
            background: #3b82f6;
            border: 3px solid #ffffff;
            border-radius: 50%;
            color: #ffffff;
            text-align: center;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        }
        .marker-cluster-custom div {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
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
        
        // Create marker cluster group
        var markers = L.markerClusterGroup({
            iconCreateFunction: function(cluster) {
                var count = cluster.getChildCount();
                var size = count < 10 ? 40 : count < 100 ? 50 : 60;
                return L.divIcon({
                    html: '<div>' + count + '</div>',
                    className: 'marker-cluster-custom',
                    iconSize: L.point(size, size)
                });
            },
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true
        });
        
        var individualMarkers = L.layerGroup();
        var currentZoom = map.getZoom();
        var usesClustering = currentZoom < ${CLUSTER_ZOOM_THRESHOLD};
        
        // Add appropriate layer
        if (usesClustering) {
            map.addLayer(markers);
        } else {
            map.addLayer(individualMarkers);
        }
        
        // Update markers function (called from React Native)
        window.updateMarkers = function(trees, clusters, zoom) {
            currentZoom = zoom;
            var shouldUseCluster = zoom < ${CLUSTER_ZOOM_THRESHOLD};
            
            if (shouldUseCluster !== usesClustering) {
                // Switch layers
                if (shouldUseCluster) {
                    map.removeLayer(individualMarkers);
                    map.addLayer(markers);
                } else {
                    map.removeLayer(markers);
                    map.addLayer(individualMarkers);
                }
                usesClustering = shouldUseCluster;
            }
            
            // Clear existing markers
            markers.clearLayers();
            individualMarkers.clearLayers();
            
            if (shouldUseCluster && clusters && clusters.length > 0) {
                // Add cluster markers
                clusters.forEach(function(cluster) {
                    var marker = L.circleMarker([cluster.latitude, cluster.longitude], {
                        radius: 15,
                        fillColor: '#3b82f6',
                        color: '#ffffff',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.9
                    });
                    marker.bindPopup('<div style="text-align: center; font-weight: bold; color: #3b82f6;">' + 
                        cluster.count + ' trees in this area</div>');
                    markers.addLayer(marker);
                });
            } else if (trees && trees.length > 0) {
                // Add individual tree markers
                trees.forEach(function(tree) {
                    var color = tree.status === 'alive' ? 
                        (tree.health === 'healthy' ? '#22c55e' : '#eab308') :
                        (tree.status === 'cut' ? '#ef4444' : '#6b7280');
                    
                    var marker = L.circleMarker([tree.latitude, tree.longitude], {
                        radius: 10,
                        fillColor: color,
                        color: '#ffffff',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.9
                    });
                    
                    marker.bindPopup(\`
                        <div style="min-width: 180px; font-family: system-ui, -apple-system, sans-serif;">
                            <div style="font-family: monospace; color: #3b82f6; font-weight: 700; font-size: 14px;">\${tree.tree_code}</div>
                            <div style="font-weight: 600; color: #111827; margin-top: 4px;">\${tree.species || tree.common_name}</div>
                            \${tree.address ? '<div style="font-size: 11px; color: #6b7280; margin-top: 4px;">' + tree.address + '</div>' : ''}
                            <div style="display: flex; gap: 6px; margin-top: 8px;">
                                <span style="background: \${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">
                                    \${tree.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    \`);
                    
                    marker.on('click', function() {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ 
                            type: 'markerClick', 
                            treeId: tree.id 
                        }));
                    });
                    
                    if (usesClustering) {
                        markers.addLayer(marker);
                    } else {
                        individualMarkers.addLayer(marker);
                    }
                });
            }
        };
        
        // Send bounds when map moves
        var boundsTimeout;
        map.on('moveend', function() {
            clearTimeout(boundsTimeout);
            boundsTimeout = setTimeout(function() {
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
            }, 300);
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
    const [selectedTree, setSelectedTree] = useState<TreeInventory | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string | undefined>();
    const [filterHealth, setFilterHealth] = useState<string | undefined>();
    const [showFilters, setShowFilters] = useState(false);
    const [showLegend, setShowLegend] = useState(false);
    const [zoom, setZoom] = useState(DEFAULT_ZOOM);
    const [viewportBounds, setViewportBounds] = useState<BoundsParams | null>(null);

    // Use clustering for zoom < 16, individual trees for zoom >= 16
    const useClusters = zoom < CLUSTER_ZOOM_THRESHOLD;

    // Memoize bounds params to prevent infinite re-renders
    const boundsWithFilters = useMemo(() => {
        if (!viewportBounds) return null;
        return {
            ...viewportBounds,
            status: filterStatus,
            health: filterHealth,
        };
    }, [
        viewportBounds?.min_lat,
        viewportBounds?.max_lat,
        viewportBounds?.min_lng,
        viewportBounds?.max_lng,
        filterStatus,
        filterHealth,
    ]);

    // Smart caching hooks
    const { 
        data: trees = [], 
        isLoading: loadingTrees, 
        isFetching: fetchingTrees,
        isUsingCache: usingTreeCache
    } = useSmartTreesInBounds(
        boundsWithFilters,
        { enabled: !useClusters }
    );

    const { 
        data: clusters = [], 
        isLoading: loadingClusters,
        isFetching: fetchingClusters,
        isUsingCache: usingClusterCache
    } = useSmartTreeClusters(
        boundsWithFilters,
        zoom,
        { enabled: useClusters }
    );

    const isLoading = useClusters ? loadingClusters : loadingTrees;
    const isFetching = useClusters ? fetchingClusters : fetchingTrees;
    const isUsingCache = useClusters ? usingClusterCache : usingTreeCache;

    // Default to user location if available
    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;

                const location = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = location.coords;

                if (webViewRef.current) {
                    webViewRef.current.injectJavaScript(`
                        map.setView([${latitude}, ${longitude}], ${DEFAULT_ZOOM});
                        true;
                    `);
                }
            } catch (error) {
                console.log("Could not retireve user location, staying at default.");
            }
        })();
    }, []);

    // Debug logging
    useEffect(() => {
        console.log('MapViewScreen State:', {
            zoom,
            useClusters,
            treesCount: trees?.length || 0,
            clustersCount: clusters?.length || 0,
            viewportBounds,
            boundsWithFilters,
        });
    }, [zoom, useClusters, trees, clusters, viewportBounds, boundsWithFilters]);

    // Generate HTML once
    const mapHTML = useMemo(() => {
        return generateMapHTML(DEFAULT_CENTER, DEFAULT_ZOOM);
    }, []);

    // Memoize marker update script - use stable keys to prevent infinite loops
    const treesKey = useMemo(() => JSON.stringify(trees.map(t => t.id)), [trees]);
    const clustersKey = useMemo(() => 
        JSON.stringify(clusters.map(c => `${c.latitude},${c.longitude},${c.count}`)), 
        [clusters]
    );
    
    const markerUpdateScript = useMemo(() => {
        if (trees.length === 0 && clusters.length === 0) return null;
        const treesJSON = JSON.stringify(trees);
        const clustersJSON = JSON.stringify(clusters);
        return `window.updateMarkers(${treesJSON}, ${clustersJSON}, ${zoom}); true;`;
    }, [treesKey, clustersKey, zoom]);

    // Update markers in WebView when script changes
    useEffect(() => {
        if (webViewRef.current && markerUpdateScript) {
            webViewRef.current.injectJavaScript(markerUpdateScript);
        }
    }, [markerUpdateScript]);

    // Debounce bounds updates to prevent rapid re-renders
    const boundsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Handle messages from WebView
    const handleWebViewMessage = useCallback((event: any) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'boundsChange') {
                // Debounce bounds updates by 300ms
                if (boundsUpdateTimeoutRef.current) {
                    clearTimeout(boundsUpdateTimeoutRef.current);
                }
                boundsUpdateTimeoutRef.current = setTimeout(() => {
                    setViewportBounds(message.bounds);
                    setZoom(message.zoom);
                }, 300);
            } else if (message.type === 'markerClick') {
                handleMarkerClick(message.treeId);
            }
        } catch (error) {
            console.error("Error parsing WebView message:", error);
        }
    }, []);

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

    const displayCount = useClusters 
        ? clusters.reduce((sum, c) => sum + c.count, 0)
        : trees.length;

    return (
        <ScreenLayout
            header={{
                title: "Map View",
                subtitle: `OpenStreetMap • ${useClusters ? 'Clustered' : 'Detailed'} View`,
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

                {/* Loading/Cache Status Badge */}
                {isFetching && !isUsingCache && (
                    <View style={styles.dataLoadingBadge}>
                        <ActivityIndicator size="small" color="#3B82F6" />
                        <Text style={styles.dataLoadingText}>Loading data...</Text>
                    </View>
                )}

                {/* Cache Status Indicator */}
                {isUsingCache && (
                    <View style={[styles.dataLoadingBadge, { backgroundColor: '#22c55e' }]}>
                        <Icon name="CheckCircle2" size={16} color="#FFFFFF" />
                        <Text style={[styles.dataLoadingText, { color: '#FFFFFF' }]}>Using cache</Text>
                    </View>
                )}

                {/* Tree Count Badge */}
                <View style={styles.countBadge}>
                    <Icon name="TreePine" size={16} color="#16A34A" />
                    <Text style={styles.countText}>
                        {displayCount} {displayCount === 1 ? "tree" : "trees"}
                    </Text>
                </View>

                {/* Zoom Level Indicator */}
                <View style={styles.zoomBadge}>
                    <Icon name={useClusters ? "Grid3x3" : "MapPin"} size={14} color="#6B7280" />
                    <Text style={styles.zoomText}>Zoom {zoom}</Text>
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
                            <Text style={styles.filterSectionTitle}>Status</Text>
                            <View style={styles.chipContainer}>
                                <Chip
                                    selected={filterStatus === undefined}
                                    onPress={() => setFilterStatus(undefined)}
                                    style={styles.chip}
                                    textStyle={styles.chipText}
                                >
                                    All
                                </Chip>
                                <Chip
                                    selected={filterStatus === "alive"}
                                    onPress={() => setFilterStatus("alive")}
                                    style={styles.chip}
                                    textStyle={styles.chipText}
                                >
                                    Alive
                                </Chip>
                                <Chip
                                    selected={filterStatus === "cut"}
                                    onPress={() => setFilterStatus("cut")}
                                    style={styles.chip}
                                    textStyle={styles.chipText}
                                >
                                    Cut
                                </Chip>
                                <Chip
                                    selected={filterStatus === "dead"}
                                    onPress={() => setFilterStatus("dead")}
                                    style={styles.chip}
                                    textStyle={styles.chipText}
                                >
                                    Dead
                                </Chip>
                                <Chip
                                    selected={filterStatus === "replaced"}
                                    onPress={() => setFilterStatus("replaced")}
                                    style={styles.chip}
                                    textStyle={styles.chipText}
                                >
                                    Replaced
                                </Chip>
                            </View>

                            <Text style={styles.filterSectionTitle}>Health</Text>
                            <View style={styles.chipContainer}>
                                <Chip
                                    selected={filterHealth === undefined}
                                    onPress={() => setFilterHealth(undefined)}
                                    style={styles.chip}
                                    textStyle={styles.chipText}
                                >
                                    All
                                </Chip>
                                <Chip
                                    selected={filterHealth === "healthy"}
                                    onPress={() => setFilterHealth("healthy")}
                                    style={styles.chip}
                                    textStyle={styles.chipText}
                                >
                                    Healthy
                                </Chip>
                                <Chip
                                    selected={filterHealth === "needs_attention"}
                                    onPress={() => setFilterHealth("needs_attention")}
                                    style={styles.chip}
                                    textStyle={styles.chipText}
                                >
                                    Needs Attention
                                </Chip>
                                <Chip
                                    selected={filterHealth === "diseased"}
                                    onPress={() => setFilterHealth("diseased")}
                                    style={styles.chip}
                                    textStyle={styles.chipText}
                                >
                                    Diseased
                                </Chip>
                                <Chip
                                    selected={filterHealth === "dead"}
                                    onPress={() => setFilterHealth("dead")}
                                    style={styles.chip}
                                    textStyle={styles.chipText}
                                >
                                    Dead
                                </Chip>
                            </View>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Tree Detail Modal */}
            <Modal
                visible={!!selectedTree}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedTree(null)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setSelectedTree(null)}>
                    <Pressable style={styles.detailModal} onPress={(e) => e.stopPropagation()}>
                        {loadingDetail ? (
                            <View style={styles.detailLoading}>
                                <ActivityIndicator size="large" color="#3B82F6" />
                            </View>
                        ) : selectedTree ? (
                            <ScrollView>
                                <View style={styles.detailHeader}>
                                    <Text style={styles.detailCode}>{selectedTree.tree_code}</Text>
                                    <TouchableOpacity onPress={() => setSelectedTree(null)}>
                                        <Icon name="X" size={24} color="#111827" />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.detailSpecies}>{selectedTree.species || selectedTree.common_name}</Text>
                                {selectedTree.address && (
                                    <Text style={styles.detailAddress}>{selectedTree.address}</Text>
                                )}

                                <View style={styles.detailBadges}>
                                    <View style={statusBadgeStyle(selectedTree.status)}>
                                        <Text style={styles.badgeText}>{selectedTree.status.toUpperCase()}</Text>
                                    </View>
                                    <View style={healthBadgeStyle(selectedTree.health)}>
                                        <Text style={styles.badgeText}>
                                            {selectedTree.health.replace("_", " ").toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                {(selectedTree.height_meters || selectedTree.diameter_cm) && (
                                    <View style={styles.detailSection}>
                                        <Text style={styles.detailSectionTitle}>Measurements</Text>
                                        {selectedTree.height_meters && (
                                            <Text style={styles.detailText}>Height: {selectedTree.height_meters}m</Text>
                                        )}
                                        {selectedTree.diameter_cm && (
                                            <Text style={styles.detailText}>Diameter: {selectedTree.diameter_cm}cm</Text>
                                        )}
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.viewDetailButton}
                                    onPress={() => {
                                        setSelectedTree(null);
                                        (navigation as any).navigate("TreeDetail", { treeId: selectedTree.id });
                                    }}
                                >
                                    <Text style={styles.viewDetailButtonText}>View Full Details</Text>
                                    <Icon name="ArrowRight" size={18} color="#FFFFFF" />
                                </TouchableOpacity>
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
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },
    dataLoadingBadge: {
        position: "absolute",
        top: 16,
        alignSelf: "center",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dataLoadingText: {
        fontSize: 12,
        color: "#6B7280",
        fontWeight: "500",
    },
    countBadge: {
        position: "absolute",
        top: 70,
        alignSelf: "center",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    countText: {
        fontSize: 13,
        color: "#111827",
        fontWeight: "600",
    },
    zoomBadge: {
        position: "absolute",
        bottom: 24,
        left: 16,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    zoomText: {
        fontSize: 11,
        color: "#6B7280",
        fontWeight: "500",
    },
    legendToggle: {
        position: "absolute",
        bottom: 24,
        right: 16,
        backgroundColor: "#FFFFFF",
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    legend: {
        position: "absolute",
        bottom: 80,
        right: 16,
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 12,
        minWidth: 180,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    legendTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 12,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 8,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: 12,
        color: "#374151",
        fontWeight: "500",
    },
    activeFilters: {
        position: "absolute",
        top: 124,
        alignSelf: "center",
        backgroundColor: "#EFF6FF",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },
    activeFiltersText: {
        fontSize: 11,
        color: "#3B82F6",
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    filterModal: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "60%",
        paddingBottom: 20,
    },
    filterHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    filterTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    filterContent: {
        padding: 20,
    },
    filterSectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 12,
        marginTop: 8,
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
    },
    chip: {
        marginRight: 0,
    },
    chipText: {
        fontSize: 12,
    },
    detailModal: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "70%",
        paddingBottom: 20,
    },
    detailLoading: {
        padding: 60,
        alignItems: "center",
    },
    detailHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    detailCode: {
        fontFamily: "monospace",
        fontSize: 16,
        fontWeight: "700",
        color: "#3B82F6",
    },
    detailSpecies: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    detailAddress: {
        fontSize: 13,
        color: "#6B7280",
        paddingHorizontal: 20,
        marginTop: 4,
    },
    detailBadges: {
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 20,
        marginTop: 12,
    },
    statusBadgeAlive: {
        backgroundColor: "#22c55e",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusBadgeCut: {
        backgroundColor: "#ef4444",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusBadgeDead: {
        backgroundColor: "#6b7280",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusBadgeReplaced: {
        backgroundColor: "#3b82f6",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusBadgeDefault: {
        backgroundColor: "#9ca3af",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    healthBadgeHealthy: {
        backgroundColor: "#22c55e",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    healthBadgeAttention: {
        backgroundColor: "#eab308",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    healthBadgeDiseased: {
        backgroundColor: "#f97316",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    healthBadgeDead: {
        backgroundColor: "#6b7280",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    healthBadgeDefault: {
        backgroundColor: "#9ca3af",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    detailSection: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    detailSectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
    },
    detailText: {
        fontSize: 13,
        color: "#374151",
        marginBottom: 4,
    },
    viewDetailButton: {
        marginHorizontal: 20,
        marginTop: 24,
        backgroundColor: "#3B82F6",
        paddingVertical: 14,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    viewDetailButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
