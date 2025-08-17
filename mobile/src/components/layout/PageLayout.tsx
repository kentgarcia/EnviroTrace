import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RoleNavBar, { RoleNavBarProps } from "./RoleNavBar";

export interface PageLayoutProps extends Partial<RoleNavBarProps> {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
}

/**
 * Reusable page layout with a consistent role-aware navbar and safe padding.
 * Use in role screens to avoid duplicating headers across tabs/stacks.
 */
export default function PageLayout({
  children,
  contentStyle,
  ...navProps
}: PageLayoutProps) {
  return (
    <View style={styles.container}>
      <RoleNavBar {...navProps} />
      <SafeAreaView style={styles.content} edges={["left", "right", "bottom"]}>
        <View style={[styles.inner, contentStyle]}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  content: { flex: 1 },
  inner: { flex: 1 },
});
