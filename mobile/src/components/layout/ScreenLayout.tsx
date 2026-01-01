import React from "react";
import { StyleSheet, View, Image, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StandardHeader, { StandardHeaderProps } from "./StandardHeader";

export interface ScreenLayoutProps {
    children: React.ReactNode;
    /** Whether to show the background image (default: true) */
    showBackground?: boolean;
    /** Additional style for the main container */
    style?: ViewStyle;
    /** Additional style for the content wrapper */
    contentStyle?: ViewStyle;
    /** Background color when not using image (default: "#FFFFFF") */
    backgroundColor?: string;
    /** Header configuration - if provided, StandardHeader will be rendered */
    header?: StandardHeaderProps;
}

/**
 * Consistent screen layout wrapper that provides:
 * - Background image
 * - StandardHeader (optional)
 * - Proper safe area handling for bottom tab navigation
 * 
 * Use this component to wrap screen content for consistent layout across the app.
 * Note: This component handles top safe area via StandardHeader and does NOT add bottom padding,
 * allowing the tab bar to sit flush with the content.
 */
export default function ScreenLayout({
    children,
    showBackground = false,
    style,
    contentStyle,
    backgroundColor = "#FFFFFF",
    header,
}: ScreenLayoutProps) {
    return (
        <SafeAreaView style={[styles.root, { backgroundColor }, style]} edges={['top']}>
            {showBackground && (
                <View style={styles.backgroundImageWrapper} pointerEvents="none">
                    <Image
                        source={require("../../../assets/images/bg_login.png")}
                        style={styles.backgroundImage}
                        resizeMode="cover"
                        accessibilityIgnoresInvertColors
                    />
                </View>
            )}

            {/* Render header if provided */}
            {header && <StandardHeader {...header} />}

            {/* Content area - no bottom edge safe area to allow tab bar to be flush */}
            <View style={[styles.content, contentStyle]}>
                {children}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    backgroundImageWrapper: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    backgroundImage: {
        width: "100%",
        height: "100%",
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    content: {
        flex: 1,
    },
});
