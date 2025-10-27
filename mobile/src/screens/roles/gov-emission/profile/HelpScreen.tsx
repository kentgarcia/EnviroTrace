import React from "react";
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StandardHeader from "../../../../components/layout/StandardHeader";
import { useNavigation } from "@react-navigation/native";
import Icon from "../../../../components/icons/Icon";

export default function HelpScreen() {
    const navigation = useNavigation();

    const faqItems = [
        {
            question: "How do I add a new vehicle?",
            answer: "Navigate to the Vehicles tab and tap the '+' button. Fill in the vehicle details including plate number, office, and vehicle type, then tap 'Add Vehicle'.",
        },
        {
            question: "How do I record an emission test?",
            answer: "Go to the Testing tab and tap 'Record Test'. Select or scan the vehicle's plate number, enter test results, and submit.",
        },
        {
            question: "What does the vehicle status badge mean?",
            answer: "The badge shows the latest emission test result. 'Pass' means the vehicle meets emission standards, 'Fail' means it doesn't, and 'Untested' means no test has been recorded yet.",
        },
        {
            question: "How do I view test history?",
            answer: "Tap on any vehicle in the Vehicles list to view its details and complete test history.",
        },
        {
            question: "Can I edit or delete a vehicle?",
            answer: "Yes, from the vehicle details screen, use the edit or delete buttons at the bottom.",
        },
    ];

    const supportOptions = [
        {
            icon: "Mail",
            title: "Email Support",
            description: "support@epnro.gov",
            onPress: () => Linking.openURL("mailto:support@epnro.gov"),
        },
        {
            icon: "Phone",
            title: "Phone Support",
            description: "+63 XXX XXXX XXX",
            onPress: () => Linking.openURL("tel:+63XXXXXXXXX"),
        },
        {
            icon: "MessageCircle",
            title: "Live Chat",
            description: "Chat with our support team",
            onPress: () => { },
        },
    ];

    return (
        <>
            <StandardHeader
                title="Help & Support"
                subtitle="Get assistance"
                backgroundColor="rgba(255, 255, 255, 0.95)"
                statusBarStyle="dark"
                titleSize={22}
                subtitleSize={12}
                iconSize={20}
                showBack={true}
            />
            <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Quick Help Card */}
                    <View style={styles.quickHelpCard}>
                        <View style={styles.quickHelpIcon}>
                            <Icon name="HelpCircle" size={32} color="#FFFFFF" />
                        </View>
                        <Text style={styles.quickHelpTitle}>Need Help?</Text>
                        <Text style={styles.quickHelpText}>
                            Find answers to common questions below or contact our support team.
                        </Text>
                    </View>

                    {/* FAQ Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                        {faqItems.map((item, index) => (
                            <View key={index} style={styles.faqItem}>
                                <View style={styles.faqQuestionRow}>
                                    <Icon name="HelpCircle" size={16} color="#111827" />
                                    <Text style={styles.faqQuestion}>{item.question}</Text>
                                </View>
                                <Text style={styles.faqAnswer}>{item.answer}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Contact Support Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact Support</Text>
                        {supportOptions.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.supportOption,
                                    index === supportOptions.length - 1 && styles.supportOptionLast,
                                ]}
                                onPress={option.onPress}
                                activeOpacity={0.7}
                            >
                                <View style={styles.supportIconContainer}>
                                    <Icon name={option.icon as any} size={20} color="#111827" />
                                </View>
                                <View style={styles.supportContent}>
                                    <Text style={styles.supportTitle}>{option.title}</Text>
                                    <Text style={styles.supportDescription}>{option.description}</Text>
                                </View>
                                <Icon name="ChevronRight" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* User Guide Section */}
                    <View style={styles.guideCard}>
                        <Icon name="FileText" size={24} color="#111827" />
                        <Text style={styles.guideTitle}>User Guide</Text>
                        <Text style={styles.guideText}>
                            For detailed instructions and documentation, please refer to the complete user guide.
                        </Text>
                        <TouchableOpacity
                            style={styles.guideButton}
                            onPress={() => { }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.guideButtonText}>View User Guide</Text>
                            <Icon name="ChevronRight" size={16} color="#111827" />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Spacer */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    quickHelpCard: {
        backgroundColor: "#111827",
        borderRadius: 12,
        padding: 24,
        alignItems: "center",
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    quickHelpIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    quickHelpTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    quickHelpText: {
        fontSize: 14,
        color: "#E5E7EB",
        textAlign: "center",
        lineHeight: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 12,
    },
    faqItem: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    faqQuestionRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 8,
    },
    faqQuestion: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
        flex: 1,
    },
    faqAnswer: {
        fontSize: 13,
        color: "#6B7280",
        lineHeight: 18,
        marginLeft: 24,
    },
    supportOption: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    supportOptionLast: {
        marginBottom: 0,
    },
    supportIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    supportContent: {
        flex: 1,
    },
    supportTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 2,
    },
    supportDescription: {
        fontSize: 12,
        color: "#6B7280",
    },
    guideCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    guideTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        marginTop: 12,
        marginBottom: 8,
    },
    guideText: {
        fontSize: 13,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 18,
        marginBottom: 16,
    },
    guideButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        gap: 8,
    },
    guideButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
    },
});
