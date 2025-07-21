import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Title, Paragraph, ActivityIndicator } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
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
      <Card style={[styles.card, onPress && styles.pressableCard]}>
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <View
              style={[styles.iconContainer, { backgroundColor: color + "20" }]}
            >
              <Icon name={icon} size={24} color={color} />
            </View>
            {onPress && <Icon name="chevron-right" size={20} color="#9E9E9E" />}
          </View>

          <View style={styles.valueContainer}>
            {loading ? (
              <ActivityIndicator size="small" color={color} />
            ) : (
              <Title style={[styles.value, { color }]}>
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  pressableCard: {
    shadowOpacity: 0.15,
    elevation: 4,
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
