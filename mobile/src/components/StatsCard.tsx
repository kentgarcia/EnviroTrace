import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Title, Paragraph, ActivityIndicator, useTheme } from "react-native-paper";
import Icon from "./icons/Icon";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string; // optional; defaults to theme primary
  loading?: boolean;
  onPress?: () => void;
}

export default function StatsCard({
  title,
  value,
  icon,
  color,
  loading = false,
  onPress,
}: StatsCardProps) {
  const { colors } = useTheme();
  const accent = color ?? colors.primary;
  const formatValue = (val: string | number) => {
    if (typeof val === "number") {
      return val.toLocaleString();
    }
    return val;
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Card
        mode="outlined"
        style={[
          styles.card,
          { borderColor: accent + "26" },
          onPress && styles.pressableCard,
        ]}
      >
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: accent + "14",
                  borderColor: accent + "33",
                },
              ]}
            >
              <Icon name={icon} size={24} color={accent} />
            </View>
            {onPress && <Icon name="chevron-right" size={20} color={accent + "99"} />}
          </View>

          <View style={styles.valueContainer}>
            {loading ? (
              <ActivityIndicator size="small" color={accent} />
            ) : (
              <Title style={[styles.value, { color: accent }]}>
                {formatValue(value)}
              </Title>
            )}
          </View>

          <Paragraph style={styles.title} numberOfLines={2}>
            {title}
          </Paragraph>
        </Card.Content>
      </Card>
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "48%",
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    // Replace shadows with a thin border for a flatter look
    // Explicitly remove elevation/shadow on Android/iOS
    borderWidth: 1,
    borderColor: "transparent",
    elevation: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  pressableCard: {
    // Keep the same flat style when pressable
    elevation: 0,
    shadowColor: "transparent",
  },
  content: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  valueContainer: {
    marginBottom: 8,
    minHeight: 32,
    justifyContent: "center",
  },
  value: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 0,
  },
  title: {
    fontSize: 12,
    color: "#757575",
    fontWeight: "500",
    lineHeight: 16,
  },
});
