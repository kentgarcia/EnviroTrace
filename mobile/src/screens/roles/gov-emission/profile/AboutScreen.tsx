import React from "react";
import { View, StyleSheet, ScrollView, Text, Image } from "react-native";
import ScreenLayout from "../../../../components/layout/ScreenLayout";
import { useNavigation } from "@react-navigation/native";
import Icon from "../../../../components/icons/Icon";

export default function AboutScreen() {
    const navigation = useNavigation();

    const appInfo = [
        { label: "Version", value: "1.0.1" },
        { label: "Build", value: "2026.01.22" },
        { label: "Environment", value: "Production" },
    ];

    return (
        <ScreenLayout
            header={{
                title: "About",
                subtitle: "App Information",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                statusBarStyle: "dark",
                titleSize: 22,
                subtitleSize: 12,
                iconSize: 20,
                showBack: true,
                showProfileAction: false,
            }}
        >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* App Logo/Icon */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Icon name="Shield" size={48} color="#FFFFFF" />
                        </View>
                        <Text style={styles.appName}>EnviroTrace</Text>
                        <Text style={styles.appTagline}>Government Emission Monitoring</Text>
                    </View>

                    {/* App Information Card */}
                    <View style={styles.infoCard}>
                        <Text style={styles.cardTitle}>Application Details</Text>
                        {appInfo.map((info, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.infoRow,
                                    index === appInfo.length - 1 && styles.infoRowLast,
                                ]}
                            >
                                <Text style={styles.infoLabel}>{info.label}</Text>
                                <Text style={styles.infoValue}>{info.value}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Description Card */}
                    <View style={styles.descriptionCard}>
                        <Text style={styles.cardTitle}>About This App</Text>
                        <Text style={styles.descriptionText}>
                            EnviroTrace is a comprehensive mobile application designed for government emission monitoring and management.
                            It provides tools for vehicle registration, emission testing, compliance tracking, and environmental data management.
                        </Text>
                    </View>

                    {/* Developer Info Card */}
                    <View style={styles.developerCard}>
                        <Text style={styles.cardTitle}>Developed By</Text>
                        <Text style={styles.developerText}>Kent D. Garcia</Text>
                        <Text style={styles.developerSubtext}>
                            For Environmental Protection and Natural Resources Office (EPNRO)
                        </Text>
                    </View>

                    {/* Copyright */}
                    <View style={styles.copyrightContainer}>
                        <Text style={styles.copyrightText}>
                            © 2025 EnviroTrace. All rights reserved.
                        </Text>
                    </View>

                    {/* Bottom Spacer */}
                    <View style={{ height: 100 }} />
                </ScrollView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    logoContainer: {
        alignItems: "center",
        paddingVertical: 32,
    },
    logoCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "#111827",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    appName: {
        fontSize: 24,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 4,
    },
    appTagline: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },
    infoCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    infoRowLast: {
        borderBottomWidth: 0,
    },
    infoLabel: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },
    infoValue: {
        fontSize: 14,
        color: "#111827",
        fontWeight: "600",
    },
    descriptionCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    descriptionText: {
        fontSize: 14,
        color: "#4B5563",
        lineHeight: 20,
    },
    developerCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    developerText: {
        fontSize: 14,
        color: "#111827",
        fontWeight: "600",
        marginBottom: 4,
    },
    developerSubtext: {
        fontSize: 12,
        color: "#6B7280",
        lineHeight: 18,
    },
    copyrightContainer: {
        alignItems: "center",
        paddingVertical: 16,
    },
    copyrightText: {
        fontSize: 12,
        color: "#9CA3AF",
        textAlign: "center",
    },
});
