import { StyleSheet } from "react-native";

/**
 * Reusable card styles based on the Reports screen design
 * Usage: import { cardStyles } from '@/styles/cardStyles'
 */
export const cardStyles = StyleSheet.create({
  // Base card container
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  // Compact card with less padding
  cardCompact: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  // Card with row layout
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },

  // Card with row layout (compact)
  cardRowCompact: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },

  // Icon container (circular)
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  // Small icon container
  iconContainerSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  // Icon container with default background
  iconContainerDefault: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  // Small icon container with default background
  iconContainerSmallDefault: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  // Card content area (flexible)
  cardContent: {
    flex: 1,
  },

  // Card title
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },

  // Card description/subtitle
  cardDescription: {
    fontSize: 12,
    color: "#6B7280",
  },

  // Small card title
  cardTitleSmall: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },

  // Section title
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  // Section subtitle
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },

  // Action button (circular)
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  // Primary action button
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },

  // Primary button text
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

/**
 * Predefined icon background colors for different categories
 */
export const iconColors = {
  blue: {
    icon: "#3B82F6",
    background: "#EFF6FF",
  },
  green: {
    icon: "#10B981",
    background: "#ECFDF5",
  },
  amber: {
    icon: "#F59E0B",
    background: "#FEF3C7",
  },
  purple: {
    icon: "#8B5CF6",
    background: "#F5F3FF",
  },
  emerald: {
    icon: "#059669",
    background: "#D1FAE5",
  },
  red: {
    icon: "#DC2626",
    background: "#FEE2E2",
  },
  slate: {
    icon: "#64748B",
    background: "#F1F5F9",
  },
  indigo: {
    icon: "#6366F1",
    background: "#E0E7FF",
  },
};

/**
 * Helper function to create icon container style with color
 */
export const getIconContainerStyle = (
  color: keyof typeof iconColors,
  size: "default" | "small" = "default"
) => {
  const baseStyle = size === "small" ? cardStyles.iconContainerSmall : cardStyles.iconContainer;
  return [baseStyle, { backgroundColor: iconColors[color].background }];
};
