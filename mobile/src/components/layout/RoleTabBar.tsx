import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import Icon from "../icons/Icon";

export interface RoleTabBarItem {
  key: string;
  label: string;
  icon: string;
  onPress: () => void;
  active?: boolean;
}

export default function RoleTabBar({ items }: { items: RoleTabBarItem[] }) {
  return (
    <View style={styles.container}>
      {items.map((it) => (
        <TouchableOpacity key={it.key} style={styles.item} onPress={it.onPress} accessibilityRole="button">
          <Icon name={it.icon as any} size={22} color={it.active ? "#2E7D32" : "#9E9E9E"} />
          <Text style={[styles.label, { color: it.active ? "#2E7D32" : "#9E9E9E" }]}>{it.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 60,
    backgroundColor: "#FFFFFF",
    borderTopColor: "#E0E0E0",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 12, marginTop: 4, fontWeight: "500" },
});
