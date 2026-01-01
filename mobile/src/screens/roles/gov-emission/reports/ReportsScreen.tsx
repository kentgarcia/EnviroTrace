import React, { useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Card, Text, Button, Portal, Dialog, RadioButton } from "react-native-paper";
import Icon from "../../../../components/icons/Icon";
import ScreenLayout from "../../../../components/layout/ScreenLayout";
import { useNavigation } from "@react-navigation/native";
import { cardStyles } from "../../../../styles/cardStyles";

export default function ReportsScreen() {
  const navigation = useNavigation();
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [reportType, setReportType] = useState<"monthly" | "quarterly" | "annual">("monthly");
  const [reportFormat, setReportFormat] = useState<"excel" | "pdf">("excel");

  const handleGenerateReport = () => {
    setShowGenerateDialog(false);
    Alert.alert(
      "Report Generation",
      `Your ${reportType} ${reportFormat.toUpperCase()} report will be generated and emailed to you shortly.`,
      [{ text: "OK" }]
    );
  };

  const reportTemplates = [
    {
      id: "vehicle_inventory",
      title: "Vehicle Inventory Report",
      description: "Complete list of all registered vehicles with current status",
      icon: "Car",
      color: "#3B82F6",
      bgColor: "#EFF6FF",
    },
    {
      id: "emission_tests",
      title: "Emission Test Results",
      description: "Detailed testing records with pass/fail statistics",
      icon: "ClipboardCheck",
      color: "#10B981",
      bgColor: "#ECFDF5",
    },
    {
      id: "compliance",
      title: "Compliance Summary",
      description: "Office-wise compliance rates and trends",
      icon: "Shield",
      color: "#F59E0B",
      bgColor: "#FEF3C7",
    },
    {
      id: "quarterly",
      title: "Quarterly Analysis",
      description: "Quarterly performance and testing statistics",
      icon: "Calendar",
      color: "#8B5CF6",
      bgColor: "#F5F3FF",
    },
  ];

  return (
    <ScreenLayout
      header={{
        title: "Reports",
        subtitle: "Generate and download reports",
        statusBarStyle: "light",
        backgroundColor: "#2563EB",
        titleColor: "#FFFFFF",
        subtitleColor: "rgba(255, 255, 255, 0.8)",
        borderColor: "transparent",
        titleSize: 22,
        subtitleSize: 12,
        iconSize: 20,
      }}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
          {/* Quick Generate Section */}
          <View style={styles.quickSection}>
            <View style={styles.quickHeader}>
              <View style={styles.quickTextContainer}>
                <Text style={styles.sectionTitle}>Quick Generate</Text>
                <Text style={styles.sectionSubtitle}>Generate standard reports instantly</Text>
              </View>
              <TouchableOpacity
                style={styles.generateButton}
                onPress={() => setShowGenerateDialog(true)}
                activeOpacity={0.7}
              >
                <Icon name="FileText" size={18} color="#FFFFFF" />
                <Text style={styles.generateButtonText}>Generate</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Report Templates */}
          <View style={styles.templatesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Report Templates</Text>
              <Text style={styles.sectionSubtitle}>Select a template to customize</Text>
            </View>
            <View style={styles.templatesGrid}>
              {reportTemplates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateCard}
                  onPress={() => setShowGenerateDialog(true)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.templateIcon, { backgroundColor: template.bgColor }]}>
                    <Icon name={template.icon as any} size={22} color={template.color} />
                  </View>
                  <View style={styles.templateContent}>
                    <Text style={styles.templateTitle}>{template.title}</Text>
                    <Text style={styles.templateDescription} numberOfLines={1}>{template.description}</Text>
                  </View>
                  <View style={styles.chevronContainer}>
                    <Icon name="ChevronRight" size={18} color="#CBD5E1" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Reports */}
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Reports</Text>
              <Text style={styles.sectionSubtitle}>Your recently generated files</Text>
            </View>
            <View style={styles.recentList}>
              <View style={styles.recentItem}>
                <View style={styles.recentIconContainer}>
                  <Icon name="FileSpreadsheet" size={20} color="#16A34A" />
                </View>
                <View style={styles.recentContent}>
                  <Text style={styles.recentTitle}>Vehicle Inventory - Dec 2025</Text>
                  <Text style={styles.recentDate}>Generated on Dec 27, 2025</Text>
                </View>
                <TouchableOpacity style={styles.downloadButton}>
                  <Icon name="Download" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.recentItem}>
                <View style={styles.recentIconContainer}>
                  <Icon name="FileText" size={20} color="#DC2626" />
                </View>
                <View style={styles.recentContent}>
                  <Text style={styles.recentTitle}>Q4 2025 Compliance Report</Text>
                  <Text style={styles.recentDate}>Generated on Dec 20, 2025</Text>
                </View>
                <TouchableOpacity style={styles.downloadButton}>
                  <Icon name="Download" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

      {/* Generate Report Dialog */}
      <Portal>
        <Dialog visible={showGenerateDialog} onDismiss={() => setShowGenerateDialog(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Generate Report</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <Text style={styles.dialogLabel}>Report Period</Text>
            <RadioButton.Group onValueChange={(value: any) => setReportType(value)} value={reportType}>
              <View style={styles.radioOption}>
                <RadioButton value="monthly" color="#2563EB" />
                <Text style={styles.radioLabel}>Monthly Report</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="quarterly" color="#2563EB" />
                <Text style={styles.radioLabel}>Quarterly Report</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="annual" color="#2563EB" />
                <Text style={styles.radioLabel}>Annual Report</Text>
              </View>
            </RadioButton.Group>

            <Text style={[styles.dialogLabel, { marginTop: 20 }]}>Export Format</Text>
            <RadioButton.Group onValueChange={(value: any) => setReportFormat(value)} value={reportFormat}>
              <View style={styles.radioOption}>
                <RadioButton value="excel" color="#2563EB" />
                <Text style={styles.radioLabel}>Excel (.xlsx)</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="pdf" color="#2563EB" />
                <Text style={styles.radioLabel}>PDF Document</Text>
              </View>
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={() => setShowGenerateDialog(false)} textColor="#64748B" labelStyle={styles.buttonLabel}>Cancel</Button>
            <Button onPress={handleGenerateReport} mode="contained" buttonColor="#2563EB" labelStyle={styles.buttonLabel}>Generate</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  quickSection: {
    marginBottom: 28,
  },
  quickHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  quickTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  templatesSection: {
    marginBottom: 28,
  },
  templatesGrid: {
    gap: 12,
  },
  templateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    gap: 14,
  },
  templateIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  templateContent: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  templateDescription: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  chevronContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  recentSection: {
    marginBottom: 28,
  },
  recentList: {
    gap: 12,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    gap: 14,
  },
  recentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  recentDate: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },
  downloadButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSpacer: {
    height: 100,
  },
  dialog: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "center",
    marginTop: 8,
  },
  dialogContent: {
    paddingTop: 10,
  },
  dialogLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
    marginLeft: -8,
  },
  radioLabel: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "500",
  },
  dialogActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  buttonLabel: {
    fontWeight: "700",
    fontSize: 14,
  },
});
