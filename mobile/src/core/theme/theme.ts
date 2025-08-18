import { MD3LightTheme as DefaultTheme } from "react-native-paper";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#003595", // App primary color (blue)
    primaryContainer: "#A5D6A7",
    secondary: "#4CAF50",
    secondaryContainer: "#C8E6C9",
    tertiary: "#1976D2",
    tertiaryContainer: "#BBDEFB",
    surface: "#FFFFFF",
    surfaceVariant: "#F5F5F5",
    background: "#FAFAFA",
    error: "#D32F2F",
    errorContainer: "#FFCDD2",
    onPrimary: "#FFFFFF",
    onPrimaryContainer: "#1B5E20",
    onSecondary: "#FFFFFF",
    onSecondaryContainer: "#2E7D32",
    onTertiary: "#FFFFFF",
    onTertiaryContainer: "#0D47A1",
    onSurface: "#212121",
    onSurfaceVariant: "#757575",
    onBackground: "#212121",
    onError: "#FFFFFF",
    onErrorContainer: "#B71C1C",
    outline: "#BDBDBD",
    outlineVariant: "#E0E0E0",
    inverseSurface: "#424242",
    inverseOnSurface: "#FAFAFA",
    inversePrimary: "#81C784",
    elevation: {
      level0: "transparent",
      level1: "#F8F8F8",
      level2: "#F5F5F5",
      level3: "#F0F0F0",
      level4: "#EEEEEE",
      level5: "#EBEBEB",
    },
  },
  fonts: {
    ...DefaultTheme.fonts,
    // Use Poppins across variants; sizes/lineHeights remain from MD3 defaults
    displayLarge: {
      ...DefaultTheme.fonts.displayLarge,
      fontFamily: "Poppins_600SemiBold",
      fontWeight: "600" as const,
    },
    displayMedium: {
      ...DefaultTheme.fonts.displayMedium,
      fontFamily: "Poppins_600SemiBold",
      fontWeight: "600" as const,
    },
    displaySmall: {
      ...DefaultTheme.fonts.displaySmall,
      fontFamily: "Poppins_600SemiBold",
      fontWeight: "600" as const,
    },
    headlineLarge: {
      ...DefaultTheme.fonts.headlineLarge,
      fontFamily: "Poppins_600SemiBold",
      fontWeight: "600" as const,
    },
    headlineMedium: {
      ...DefaultTheme.fonts.headlineMedium,
      fontFamily: "Poppins_600SemiBold",
      fontWeight: "600" as const,
    },
    headlineSmall: {
      ...DefaultTheme.fonts.headlineSmall,
      fontFamily: "Poppins_600SemiBold",
      fontWeight: "600" as const,
    },
    titleLarge: {
      ...DefaultTheme.fonts.titleLarge,
      fontFamily: "Poppins_600SemiBold",
      fontWeight: "600" as const,
    },
    titleMedium: {
      ...DefaultTheme.fonts.titleMedium,
      fontFamily: "Poppins_500Medium",
      fontWeight: "500" as const,
    },
    titleSmall: {
      ...DefaultTheme.fonts.titleSmall,
      fontFamily: "Poppins_500Medium",
      fontWeight: "500" as const,
    },
    labelLarge: {
      ...DefaultTheme.fonts.labelLarge,
      fontFamily: "Poppins_500Medium",
      fontWeight: "500" as const,
    },
    labelMedium: {
      ...DefaultTheme.fonts.labelMedium,
      fontFamily: "Poppins_500Medium",
      fontWeight: "500" as const,
    },
    labelSmall: {
      ...DefaultTheme.fonts.labelSmall,
      fontFamily: "Poppins_500Medium",
      fontWeight: "500" as const,
    },
    bodyLarge: {
      ...DefaultTheme.fonts.bodyLarge,
      fontFamily: "Poppins_400Regular",
      fontWeight: "400" as const,
    },
    bodyMedium: {
      ...DefaultTheme.fonts.bodyMedium,
      fontFamily: "Poppins_400Regular",
      fontWeight: "400" as const,
    },
    bodySmall: {
      ...DefaultTheme.fonts.bodySmall,
      fontFamily: "Poppins_400Regular",
      fontWeight: "400" as const,
    },
  },
};

export default theme;
