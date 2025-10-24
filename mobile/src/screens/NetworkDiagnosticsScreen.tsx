import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from "../components/icons/Icon";
import {
    getNetworkDiagnostics,
    subscribeToNetworkChanges,
} from "../core/utils/network";
import {
    getAndroidVersionInfo,
    getVersionCompatibilityMessage,
    getNetworkSecurityStatus,
} from "../core/utils/androidVersion";

/**
 * Network Diagnostics Screen
 * Helps debug connectivity issues in the mobile app
 */
export default function NetworkDiagnosticsScreen() {
    const navigation = useNavigation();
    const [diagnostics, setDiagnostics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState<boolean>(true);

    const loadDiagnostics = async () => {
        setIsLoading(true);
        try {
            const result = await getNetworkDiagnostics();
            setDiagnostics(result);
        } catch (error) {
            console.error("Error loading diagnostics:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDiagnostics();

        // Subscribe to network changes
        const unsubscribe = subscribeToNetworkChanges((connected) => {
            setIsConnected(connected);
            if (connected) {
                loadDiagnostics();
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const renderStatus = (success: boolean) => {
        return (
            <View
                style={[
                    styles.statusBadge,
                    { backgroundColor: success ? "#4CAF50" : "#F44336" },
                ]}
            >
                <Text style={styles.statusText}>{success ? "✓ OK" : "✗ FAIL"}</Text>
            </View>
        );
    };

    if (isLoading && !diagnostics) {
        return (
            <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
                <StatusBar barStyle="dark-content" />
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Running diagnostics...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <StatusBar barStyle="dark-content" />

            {/* Header with Back Button */}
            <View style={styles.headerBar}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Icon name="ChevronLeft" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Network Diagnostics</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={loadDiagnostics} />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.subtitle}>
                        Pull down to refresh • Last updated:{" "}
                        {diagnostics?.timestamp
                            ? new Date(diagnostics.timestamp).toLocaleTimeString()
                            : "N/A"}
                    </Text>
                </View>

                {/* Connection Status */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Connection Status</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Internet:</Text>
                        {renderStatus(isConnected)}
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>API Server:</Text>
                        {renderStatus(diagnostics?.apiTest?.success ?? false)}
                    </View>
                </View>

                {/* Android Version Info (Critical for debugging) */}
                {Platform.OS === "android" && (() => {
                    const versionInfo = getAndroidVersionInfo();
                    const securityStatus = getNetworkSecurityStatus();
                    return (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Android Version</Text>
                            {versionInfo && (
                                <>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Version:</Text>
                                        <Text style={styles.infoValue}>
                                            {versionInfo.versionName} (API {versionInfo.apiLevel})
                                        </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Device:</Text>
                                        <Text style={styles.infoValue}>
                                            {versionInfo.deviceInfo.brand} {versionInfo.deviceInfo.model}
                                        </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Network Config Required:</Text>
                                        <Text style={[styles.infoValue, {
                                            color: versionInfo.requiresNetworkConfig ? "#F59E0B" : "#10B981",
                                            fontWeight: "600"
                                        }]}>
                                            {versionInfo.requiresNetworkConfig ? "Yes" : "No"}
                                        </Text>
                                    </View>
                                    {versionInfo.hasNetworkSecurityIssues && (
                                        <View style={[styles.messageBox, { backgroundColor: "#FEF3C7", marginTop: 12 }]}>
                                            <Text style={[styles.messageText, { color: "#92400E" }]}>
                                                ⚠️ {getVersionCompatibilityMessage()}
                                            </Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                    );
                })()}

                {/* Environment Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Environment</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Mode:</Text>
                        <Text style={styles.infoValue}>
                            {diagnostics?.environment || "unknown"}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>API URL:</Text>
                        <Text style={styles.infoValue} numberOfLines={2}>
                            {diagnostics?.apiUrl || "Not configured"}
                        </Text>
                    </View>
                </View>

                {/* Network Details */}
                {diagnostics?.networkStatus && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Network Details</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Type:</Text>
                            <Text style={styles.infoValue}>
                                {diagnostics.networkStatus.type}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Connected:</Text>
                            <Text style={styles.infoValue}>
                                {diagnostics.networkStatus.isConnected ? "Yes" : "No"}
                            </Text>
                        </View>
                    </View>
                )}

                {/* API Test Results */}
                {diagnostics?.apiTest && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>API Test Results</Text>
                        <View style={styles.messageBox}>
                            <Text
                                style={[
                                    styles.messageText,
                                    {
                                        color: diagnostics.apiTest.success ? "#4CAF50" : "#F44336",
                                    },
                                ]}
                            >
                                {diagnostics.apiTest.message}
                            </Text>
                        </View>
                        {diagnostics.apiTest.details && (
                            <View style={styles.detailsBox}>
                                <Text style={styles.detailsText}>
                                    {JSON.stringify(diagnostics.apiTest.details, null, 2)}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Retry Button */}
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={loadDiagnostics}
                    disabled={isLoading}
                >
                    <Text style={styles.retryButtonText}>
                        {isLoading ? "Testing..." : "Run Tests Again"}
                    </Text>
                </TouchableOpacity>

                {/* Help Section */}
                <View style={styles.helpSection}>
                    <Text style={styles.helpTitle}>Troubleshooting Tips:</Text>
                    <Text style={styles.helpText}>
                        • Check your internet connection
                    </Text>
                    <Text style={styles.helpText}>
                        • Make sure you're not on a restricted network
                    </Text>
                    <Text style={styles.helpText}>
                        • Try switching between WiFi and mobile data
                    </Text>
                    <Text style={styles.helpText}>
                        • Contact support if the problem persists
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#666",
    },
    headerBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#111827",
    },
    header: {
        backgroundColor: "#fff",
        padding: 20,
        paddingTop: 12,
    },
    subtitle: {
        fontSize: 12,
        color: "#999",
    },
    section: {
        backgroundColor: "#fff",
        marginTop: 16,
        padding: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#e0e0e0",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    label: {
        fontSize: 16,
        color: "#666",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    infoRow: {
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: "#999",
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: "#333",
    },
    messageBox: {
        padding: 12,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        marginBottom: 12,
    },
    messageText: {
        fontSize: 14,
        fontWeight: "500",
    },
    detailsBox: {
        padding: 12,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
    },
    detailsText: {
        fontSize: 12,
        fontFamily: "monospace",
        color: "#666",
    },
    retryButton: {
        backgroundColor: "#4CAF50",
        marginHorizontal: 16,
        marginTop: 24,
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    retryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    helpSection: {
        margin: 16,
        padding: 16,
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    helpTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
    },
    helpText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
        lineHeight: 20,
    },
});
